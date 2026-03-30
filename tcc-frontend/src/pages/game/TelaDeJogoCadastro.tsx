import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import toast, { Toaster } from "react-hot-toast";
import {
    criarSessao,
    comprarIngrediente,
    devolverIngrediente,
    atualizarReceita,
    definirPreco,
    processarDia,
    avancarDia,
} from "../../services/jogo.service";
import type {
    SessaoSnapshot,
    ItemCatalogo,
    ResultadoDia,
} from "../../services/jogo.service";

interface GameConfig {
    bairro: {
        id: number;
        nome: string;
        focoPreco?: string;
        expectativa?: string;
    };
    tempoDeJogo: string;
}

function limiteDias(tempo: string): number {
    const v = tempo.toLowerCase();
    if (v.includes("semana")) return 7;
    if (v.includes("15")) return 15;
    if (v.includes("mês")) return 30;
    return 3;
}

const DURACAO_DIA = 30;
const INTERVALO_CLIENTE_MS = 800;

export default function TelaDeJogoCadastro() {
    const location = useLocation();
    const navigate = useNavigate();
    const { config } = (location.state as { config?: GameConfig }) || {};

    const [sessaoId, setSessaoId] = useState<string | null>(null);
    const [sessao, setSessao] = useState<SessaoSnapshot | null>(null);
    const [catalogo, setCatalogo] = useState<ItemCatalogo[]>([]);
    const [loading, setLoading] = useState(true);

    const [popupStep, setPopupStep] = useState<1 | 2 | 3>(1);
    const [showSetupPopup, setShowSetupPopup] = useState(true);
    const [showEstoqueEsgotado, setShowEstoqueEsgotado] = useState(false);
    const [showEndOfDayPopup, setShowEndOfDayPopup] = useState(false);
    const [showGameOverPopup, setShowGameOverPopup] = useState(false);
    const [isProcessando, setIsProcessando] = useState(false);

    const [resultadoDia, setResultadoDia] = useState<ResultadoDia | null>(null);
    const [gastoHoje, setGastoHoje] = useState(0);

    const [tempoRestante, setTempoRestante] = useState(DURACAO_DIA);
    const [, setIsRunning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    const [clientesExibidos, setClientesExibidos] = useState(0);
    const [estoqueLocal, setEstoqueLocal] = useState<Record<string, number>>({});
    const [receitaLocal, setReceitaLocal] = useState<Record<string, number>>({});

    const resultadoRef = useRef<ResultadoDia | null>(null);
    const isPausedRef = useRef(isPaused);
    const clientesExibRef = useRef(0);
    const estoqueLocalRef = useRef<Record<string, number>>({});
    const receitaLocalRef = useRef<Record<string, number>>({});

    useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
    useEffect(() => { clientesExibRef.current = clientesExibidos; }, [clientesExibidos]);
    useEffect(() => { estoqueLocalRef.current = estoqueLocal; }, [estoqueLocal]);
    useEffect(() => { receitaLocalRef.current = receitaLocal; }, [receitaLocal]);

    const clienteIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    if (!config) {
        return (
            <div className="h-screen flex flex-col items-center justify-center font-pressStart gap-4">
                <p className="text-sm">Erro: sessão não encontrada.</p>
                <button onClick={() => navigate("/JogoCadastro")}
                    className="bg-vibratingBlue text-white px-6 py-2 rounded-lg text-xs">
                    Voltar
                </button>
            </div>
        );
    }

    const totalDias = limiteDias(config.tempoDeJogo);

    useEffect(() => {
        (async () => {
            const t = toast.loading("Criando sessão...");
            try {
                const resp = await criarSessao(config.bairro.id, config.tempoDeJogo);
                setSessaoId(resp.sessao_id);
                setSessao(resp.sessao);
                setCatalogo(resp.catalogo);
                toast.dismiss(t);
            } catch (e) {
                toast.error(e instanceof Error ? e.message : "Erro ao criar sessão.", { id: t });
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const pararTudo = () => {
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }
        if (clienteIntervalRef.current) {
            clearInterval(clienteIntervalRef.current);
            clienteIntervalRef.current = null;
        }
        setIsRunning(false);
    };

    const abrirPopupFimDia = (snapshot: SessaoSnapshot) => {
        if (snapshot.dia_atual >= totalDias) {
            setShowGameOverPopup(true);
        } else {
            setShowEndOfDayPopup(true);
        }
    };

    const iniciarTimer = () => {
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = setInterval(() => {
            if (isPausedRef.current) return;
            setTempoRestante(prev => {
                if (prev <= 1) {
                    pararTudo();
                    if (resultadoRef.current) {
                        setClientesExibidos(resultadoRef.current.clientes_totais);
                        abrirPopupFimDia(resultadoRef.current.sessao);
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        setIsRunning(true);
    };

    const iniciarAnimacaoClientes = (
        totalAtendidos: number,
        _estoqueInicial: Record<string, number>,
        receita: Record<string, number>,
        esgotado: boolean,
        _snapshot: SessaoSnapshot,
    ) => {
        if (clienteIntervalRef.current) clearInterval(clienteIntervalRef.current);

        clienteIntervalRef.current = setInterval(() => {
            if (isPausedRef.current) return;

            const atual = clientesExibRef.current;

            if (atual >= totalAtendidos) {
                clearInterval(clienteIntervalRef.current!);
                clienteIntervalRef.current = null;

                if (esgotado) {
                    pararTudo();
                    setShowEstoqueEsgotado(true);
                }
                return;
            }

            const proximo = atual + 1;
            setClientesExibidos(proximo);
            clientesExibRef.current = proximo;

            const novoEstoque = { ...estoqueLocalRef.current };
            Object.keys(receita).forEach(nome => {
                if ((receita[nome] ?? 0) > 0) {
                    novoEstoque[nome] = Math.max(0, (novoEstoque[nome] ?? 0) - (receita[nome] ?? 0));
                }
            });
            setEstoqueLocal(novoEstoque);
            estoqueLocalRef.current = novoEstoque;

        }, INTERVALO_CLIENTE_MS);
    };

    const handleStartGame = async () => {
        if (!sessaoId || !sessao) return;
        if (sessao.tapiocas_possiveis === 0) {
            toast.error("Estoque insuficiente para iniciar o dia!");
            return;
        }

        setIsProcessando(true);
        const t = toast.loading("Abrindo barraca...");
        try {
            const resultado = await processarDia(sessaoId);
            toast.dismiss(t);

            resultadoRef.current = resultado;
            setResultadoDia(resultado);
            setSessao(resultado.sessao);
            setGastoHoje(resultado.sessao.gasto_hoje);

            const estoqueInicial: Record<string, number> = {};
            sessao.estoque.forEach(i => { estoqueInicial[i.nome] = i.quantidade; });
            setEstoqueLocal(estoqueInicial);
            estoqueLocalRef.current = estoqueInicial;
            setReceitaLocal(sessao.receita);
            receitaLocalRef.current = sessao.receita;

            setClientesExibidos(0);
            clientesExibRef.current = 0;

            setShowSetupPopup(false);
            setTempoRestante(DURACAO_DIA);

            iniciarTimer();
            iniciarAnimacaoClientes(
                resultado.clientes_atendidos,
                estoqueInicial,
                sessao.receita,
                resultado.estoque_esgotado,
                resultado.sessao,
            );
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Erro ao iniciar.", { id: t });
        } finally {
            setIsProcessando(false);
        }
    };

    const handleFecharEstoqueEsgotado = () => {
        setShowEstoqueEsgotado(false);
        if (resultadoRef.current) {
            abrirPopupFimDia(resultadoRef.current.sessao);
        }
    };

    const nextDay = async () => {
        if (!sessaoId) return;
        setShowEndOfDayPopup(false);
        const t = toast.loading("Preparando próximo dia...");
        try {
            const resp = await avancarDia(sessaoId);
            setSessao(resp.sessao);
            setCatalogo(resp.catalogo);
            resultadoRef.current = null;
            setResultadoDia(null);
            setGastoHoje(0);
            setClientesExibidos(0);
            setEstoqueLocal({});
            setTempoRestante(DURACAO_DIA);
            setPopupStep(1);
            setShowSetupPopup(true);
            toast.dismiss(t);
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Erro ao avançar dia.", { id: t });
        }
    };

    const handleComprar = async (nome: string) => {
        if (!sessaoId) return;
        try {
            const r = await comprarIngrediente(sessaoId, nome);
            setSessao(prev => prev ? {
                ...prev, budget: r.budget, gasto_hoje: r.gasto_hoje,
                estoque: prev.estoque.map(i =>
                    i.nome === nome ? { ...i, quantidade: r.quantidade } : i),
            } : prev);
            setGastoHoje(r.gasto_hoje);
        } catch (e) { toast.error(e instanceof Error ? e.message : "Erro ao comprar."); }
    };

    const handleDevolver = async (nome: string) => {
        if (!sessaoId) return;
        try {
            const r = await devolverIngrediente(sessaoId, nome);
            setSessao(prev => prev ? {
                ...prev, budget: r.budget, gasto_hoje: r.gasto_hoje,
                estoque: prev.estoque.map(i =>
                    i.nome === nome ? { ...i, quantidade: r.quantidade } : i),
            } : prev);
            setGastoHoje(r.gasto_hoje);
        } catch (e) { toast.error(e instanceof Error ? e.message : "Erro ao devolver."); }
    };

    const handleReceita = async (nome: string, delta: number) => {
        if (!sessaoId || !sessao) return;
        const nova = { ...sessao.receita, [nome]: Math.max(0, (sessao.receita[nome] ?? 0) + delta) };
        try {
            const r = await atualizarReceita(sessaoId, nova);
            setSessao(prev => prev ? { ...prev, receita: nova, tapiocas_possiveis: r.tapiocas_possiveis } : prev);
        } catch (e) { toast.error(e instanceof Error ? e.message : "Erro na receita."); }
    };

    const handlePreco = async (valor: number) => {
        if (!sessaoId) return;
        try {
            await definirPreco(sessaoId, valor);
            setSessao(prev => prev ? { ...prev, preco_tapioca: valor } : prev);
        } catch (e) { toast.error(e instanceof Error ? e.message : "Erro ao definir preço."); }
    };

    const togglePause = () => {
        if (showSetupPopup || showEndOfDayPopup || showGameOverPopup) return;
        setIsPaused(p => !p);
    };

    const sat = sessao?.satisfacao ?? 5;
    const satColor = sat >= 7 ? "text-green-400" : sat >= 4 ? "text-yellow-300" : "text-red-400";

    const estoqueVisivelNaTela = showSetupPopup
        ? (sessao?.estoque ?? [])
        : (sessao?.estoque ?? []).map(ing => ({
            ...ing,
            quantidade: estoqueLocal[ing.nome] ?? ing.quantidade,
        }));

    if (loading || !sessao) {
        return (
            <div className="h-screen flex items-center justify-center font-pressStart">
                <p className="text-xs animate-pulse">Carregando sessão...</p>
            </div>
        );
    }

    return (
        <div className="w-screen h-screen font-pressStart flex flex-col bg-primaryWhite overflow-hidden relative">
            <Toaster position="top-right" />
            <Header />

            {/*tela do jogo*/}
            {!showSetupPopup && (
                <div className="flex-1 flex flex-col p-4 pt-20 gap-4 overflow-hidden">

                    {/* HUD */}
                    <div className="flex flex-wrap justify-between items-center gap-3">
                        {[
                            { label: "Bairro", value: config.bairro.nome },
                            { label: "Dia", value: `${sessao.dia_atual} / ${totalDias}` },
                            { label: "Tempo", value: `${tempoRestante}s` },
                            { label: "Caixa", value: `R$ ${sessao.budget.toFixed(2)}` },
                        ].map(({ label, value }) => (
                            <div key={label}
                                className="flex flex-col items-center bg-vibratingBlue
                                    text-primaryWhite px-5 py-2 rounded-xl
                                    border-4 border-goldenYellow shadow-md flex-1 min-w-[110px]">
                                <span className="text-[8px] uppercase tracking-widest opacity-70">{label}</span>
                                <span className="text-sm font-bold mt-0.5">{value}</span>
                            </div>
                        ))}
                        <div className="flex flex-col items-center bg-textBlack text-primaryWhite
                            px-5 py-2 rounded-xl border-4 border-goldenYellow shadow-md flex-1 min-w-[110px]">
                            <span className="text-[8px] uppercase tracking-widest opacity-70">Satisfação</span>
                            <span className={`text-sm font-bold mt-0.5 ${satColor}`}>{sat} / 10</span>
                        </div>
                        <button onClick={togglePause}
                            className={`px-5 py-3 rounded-xl border-4 border-goldenYellow
                                text-xs font-bold shadow-md transition-all
                                ${isPaused ? "bg-lightGreen text-primaryWhite" : "bg-crimsonRed text-primaryWhite"}`}>
                            {isPaused ? "▶ Retomar" : "⏸ Pausar"}
                        </button>
                    </div>

                    {/* área do jogo */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden">

                        <div className="bg-lightGreen/10 border-4 border-dashed border-lightGreen
                            rounded-2xl flex flex-col items-center justify-center p-6 gap-3">
                            <p className="text-xs text-gray-500">Preparação</p>
                            <div className="text-6xl animate-bounce">🍳</div>
                            <p className="text-[9px] text-gray-400">
                                Preço: <strong className="text-vibratingBlue">R$ {sessao.preco_tapioca}</strong>
                            </p>
                            <div className="flex flex-wrap gap-1.5 justify-center">
                                {estoqueVisivelNaTela.filter(i => i.quantidade > 0).map(i => {
                                    const porcao = receitaLocal[i.nome] ?? sessao.receita[i.nome] ?? 0;
                                    const critico = porcao > 0 && i.quantidade <= porcao * 3;
                                    return (
                                        <span key={i.nome}
                                            className={`text-[8px] px-2 py-0.5 rounded-full border font-bold transition-colors
                                                ${critico
                                                    ? "border-crimsonRed text-red-700 bg-red-50"
                                                    : "border-lightGreen text-green-700 bg-green-50"
                                                }`}>
                                            {i.nome.split(" ")[0]} ×{i.quantidade}
                                        </span>
                                    );
                                })}
                                {estoqueVisivelNaTela.every(i => i.quantidade === 0) && (
                                    <span className="text-[8px] text-crimsonRed font-bold">
                                        Sem estoque!
                                    </span>
                                )}
                            </div>
                        </div>

                        {/*clientes*/}
                        <div className="bg-white border-4 border-vibratingBlue rounded-2xl
                            flex flex-col items-center justify-center p-6 gap-3 shadow-sm">
                            <p className="text-xs">Fila de Clientes</p>
                            <p className="text-5xl font-bold text-vibratingBlue">{clientesExibidos}</p>
                            <p className="text-[9px] text-gray-400">
                                de {resultadoDia?.clientes_atendidos ?? "?"} previstos hoje
                            </p>
                            {(resultadoDia?.clientes_perdidos ?? 0) > 0 && (
                                <p className="text-[9px] text-crimsonRed">
                                    {resultadoDia?.clientes_perdidos} desistiram pelo preço
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/*popup de setup*/}
            {showSetupPopup && (
                <div className="absolute inset-0 bg-black/60 flex justify-center items-center z-50">
                    <div className="bg-white w-11/12 md:w-3/4 lg:w-[640px]
                        min-h-[520px] rounded-2xl shadow-2xl p-6 flex flex-col
                        border-4 border-vibratingBlue text-textBlack">

                        <div className="flex justify-center gap-2 mb-5">
                            {([1, 2, 3] as const).map(s => (
                                <div key={s}
                                    className={`h-2 rounded-full transition-all duration-300
                                        ${popupStep >= s ? "bg-vibratingBlue w-8" : "bg-gray-200 w-4"}`} />
                            ))}
                        </div>

                        {/*ETAPA 1 — estoque*/}
                        {popupStep === 1 && (
                            <div className="flex flex-col flex-1">
                                <h2 className="text-base text-center font-bold mb-1">Fase 1 — Estoque</h2>
                                <p className="text-[9px] text-center text-gray-400 mb-4">
                                    Bairro: <strong>{config.bairro.nome}</strong>
                                    {config.bairro.expectativa && (
                                        <> · Expectativa: <strong>{config.bairro.expectativa}</strong></>
                                    )}
                                </p>
                                <div className="bg-goldenYellow/20 border border-goldenYellow
                                    rounded-xl py-2 text-center text-xs font-bold mb-4">
                                    Orçamento: R$ {sessao.budget.toFixed(2)}
                                </div>
                                <div className="grid grid-cols-2 gap-3 flex-1">
                                    {catalogo.map(item => {
                                        const qtd = sessao.estoque.find(e => e.nome === item.nome)?.quantidade ?? 0;
                                        const podeDevolver = qtd >= item.porcao;
                                        return (
                                            <div key={item.nome}
                                                className="border-2 border-gray-100 rounded-xl p-3 bg-gray-50 flex flex-col gap-2">
                                                <p className="text-[10px] font-bold">{item.nome}</p>
                                                <p className="text-[9px] text-vibratingBlue font-bold">
                                                    Rende {item.porcao} porções
                                                </p>
                                                <div className="bg-white rounded-lg px-2 py-1.5
                                                    border border-gray-100 text-[9px] space-y-0.5">
                                                    <p>Preço: <strong className="text-lightGreen">R$ {item.preco}</strong></p>
                                                    <p>Estoque: <strong>{qtd}</strong></p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleDevolver(item.nome)}
                                                        disabled={!podeDevolver}
                                                        className={`flex-1 py-1.5 rounded-lg font-bold text-lg
                                                            ${podeDevolver
                                                                ? "bg-crimsonRed text-white hover:opacity-80"
                                                                : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}>−</button>
                                                    <button
                                                        onClick={() => handleComprar(item.nome)}
                                                        disabled={sessao.budget < item.preco}
                                                        className={`flex-1 py-1.5 rounded-lg font-bold text-lg
                                                            ${sessao.budget >= item.preco
                                                                ? "bg-lightGreen text-white hover:opacity-80"
                                                                : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}>+</button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <button
                                    onClick={() => {
                                        if (!sessao.estoque.some(i => i.quantidade > 0)) {
                                            toast.error("Compre pelo menos um ingrediente!");
                                            return;
                                        }
                                        setPopupStep(2);
                                    }}
                                    className="mt-5 w-full py-3 bg-vibratingBlue text-white
                                        rounded-xl font-bold text-xs hover:bg-blue-700 transition">
                                    Definir Receita →
                                </button>
                            </div>
                        )}

                        {/*ETAPA 2 — receita*/}
                        {popupStep === 2 && (
                            <div className="flex flex-col flex-1">
                                <h2 className="text-base text-center font-bold mb-1">Fase 2 — Receita</h2>
                                <p className="text-[9px] text-center text-gray-400 mb-4">Porções por tapioca</p>
                                <div className="flex-1 space-y-3 overflow-y-auto pr-1 mb-4">
                                    {sessao.estoque.filter(i => i.quantidade > 0).map(ing => (
                                        <div key={ing.nome}
                                            className="flex items-center justify-between
                                                bg-gray-50 p-3 rounded-xl border-2 border-dashed border-gray-200">
                                            <div>
                                                <p className="text-[10px] font-bold">{ing.nome}</p>
                                                <p className="text-[9px] text-vibratingBlue font-bold">
                                                    Estoque: {ing.quantidade}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button onClick={() => handleReceita(ing.nome, -1)}
                                                    className="w-8 h-8 bg-crimsonRed text-white rounded-lg font-bold hover:opacity-80">−</button>
                                                <div className="flex flex-col items-center w-8">
                                                    <span className="font-bold text-lg leading-none">
                                                        {sessao.receita[ing.nome] ?? 0}
                                                    </span>
                                                    <span className="text-[7px] uppercase text-gray-400">un.</span>
                                                </div>
                                                <button onClick={() => handleReceita(ing.nome, 1)}
                                                    disabled={(sessao.receita[ing.nome] ?? 0) >= ing.quantidade}
                                                    className={`w-8 h-8 rounded-lg font-bold
                                                        ${(sessao.receita[ing.nome] ?? 0) >= ing.quantidade
                                                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                                            : "bg-lightGreen text-white hover:opacity-80"}`}>+</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="bg-vibratingBlue/10 border border-vibratingBlue
                                    rounded-xl py-2 text-center text-[9px] font-bold mb-4">
                                    Esta receita rende <strong className="text-vibratingBlue">
                                        {sessao.tapiocas_possiveis} tapiocas
                                    </strong> com o estoque atual
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => setPopupStep(1)}
                                        className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold text-xs hover:bg-gray-200">
                                        ← Voltar
                                    </button>
                                    <button onClick={() => setPopupStep(3)}
                                        className="flex-1 py-3 bg-vibratingBlue text-white rounded-xl font-bold text-xs hover:bg-blue-700">
                                        Definir Preço →
                                    </button>
                                </div>
                            </div>
                        )}

                        {/*ETAPA 3 — preço*/}
                        {popupStep === 3 && (
                            <div className="flex flex-col items-center justify-center flex-1 gap-4">
                                <h2 className="text-base text-center font-bold">Fase 3 — Precificação</h2>
                                {config.bairro.focoPreco && (
                                    <div className="bg-vibratingBlue/10 border border-vibratingBlue
                                        rounded-xl px-4 py-2 text-[9px] text-center leading-relaxed max-w-xs">
                                        Foco em <strong>{config.bairro.nome}</strong>:
                                        &nbsp;<strong>{config.bairro.focoPreco}</strong>
                                    </div>
                                )}
                                <p className="text-[9px] text-center text-gray-400 max-w-xs">
                                    O preço impacta satisfação e quantos clientes compram.
                                </p>
                                <div className="flex items-center gap-6 my-2">
                                    <button onClick={() => handlePreco(Math.max(1, sessao.preco_tapioca - 1))}
                                        className="w-12 h-12 bg-crimsonRed text-white rounded-full text-2xl font-bold hover:opacity-80">−</button>
                                    <div className="text-center">
                                        <span className="text-5xl font-bold text-lightGreen">
                                            R$ {sessao.preco_tapioca}
                                        </span>
                                        <p className="text-[8px] text-gray-400 mt-1">por unidade</p>
                                    </div>
                                    <button onClick={() => handlePreco(sessao.preco_tapioca + 1)}
                                        className="w-12 h-12 bg-lightGreen text-white rounded-full text-2xl font-bold hover:opacity-80">+</button>
                                </div>
                                <div className="bg-goldenYellow/10 border border-goldenYellow
                                    rounded-xl py-2 px-4 text-[9px] text-center font-bold">
                                    Receita máxima potencial:&nbsp;
                                    <strong className="text-goldenYellow">
                                        R$ {(sessao.tapiocas_possiveis * sessao.preco_tapioca).toFixed(2)}
                                    </strong>
                                </div>
                                <div className="flex gap-3 mt-2">
                                    <button onClick={() => setPopupStep(2)}
                                        className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold text-xs hover:bg-gray-200">
                                        ← Voltar
                                    </button>
                                    <button onClick={handleStartGame} disabled={isProcessando}
                                        className={`px-8 py-3 text-white rounded-xl font-bold text-xs
                                            active:scale-95 transition-transform
                                            ${isProcessando ? "bg-gray-400 cursor-not-allowed" : "bg-lightGreen hover:opacity-80"}`}>
                                        {isProcessando ? "Abrindo..." : "Abrir Barraca! 🚀"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/*popup de estoque esgotado*/}
            {showEstoqueEsgotado && (
                <div className="absolute inset-0 bg-black/75 flex justify-center items-center z-50">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 text-center
                        w-80 border-4 border-goldenYellow text-textBlack">
                        <p className="text-3xl mb-3">📦</p>
                        <h2 className="text-sm font-bold mb-3">Estoque Esgotado!</h2>
                        <p className="text-[9px] text-gray-600 leading-relaxed mb-2">
                            Seus ingredientes acabaram antes do fim do dia.
                        </p>
                        <p className="text-[9px] text-gray-600 leading-relaxed mb-6">
                            Foram atendidos <strong className="text-vibratingBlue">
                                {resultadoDia?.clientes_atendidos ?? 0}
                            </strong> de <strong>{resultadoDia?.clientes_totais ?? 0}</strong> clientes.
                        </p>
                        <button onClick={handleFecharEstoqueEsgotado}
                            className="w-full py-3 bg-goldenYellow text-white rounded-xl
                                font-bold text-xs hover:opacity-80 active:scale-95 transition-transform">
                            Ver Balanço do Dia
                        </button>
                    </div>
                </div>
            )}

            {/*popup de balanço do dia*/}
            {showEndOfDayPopup && resultadoDia && (
                <div className="absolute inset-0 bg-black/70 flex justify-center items-center z-50">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 text-center
                        w-full max-w-sm border-4 border-vibratingBlue text-textBlack">
                        <h2 className="text-base font-bold mb-6 uppercase tracking-tight">
                            Balanço — Dia {sessao.dia_atual}
                        </h2>
                        <div className="space-y-3 mb-8 text-left">
                            {[
                                { label: "Faturamento", value: `R$ ${resultadoDia.lucro.toFixed(2)}`, color: "text-lightGreen" },
                                { label: "Gastos estoque", value: `R$ ${gastoHoje.toFixed(2)}`, color: "text-crimsonRed" },
                                { label: "Clientes", value: `${resultadoDia.clientes_atendidos} / ${resultadoDia.clientes_totais}`, color: "text-vibratingBlue" },
                                { label: "Desistiram", value: String(resultadoDia.clientes_perdidos), color: "text-crimsonRed" },
                            ].map(({ label, value, color }) => (
                                <div key={label} className="flex justify-between items-center border-b border-gray-100 pb-2">
                                    <span className="text-[9px] text-gray-500">{label}</span>
                                    <span className={`text-xs font-bold ${color}`}>{value}</span>
                                </div>
                            ))}
                            {resultadoDia.estoque_esgotado && (
                                <div className="bg-goldenYellow/10 border border-goldenYellow
                                    rounded-xl p-2 text-[8px] text-center text-goldenYellow font-bold">
                                    ⚠ Estoque esgotado antes do fim do dia
                                </div>
                            )}
                            <div className="flex justify-between items-center bg-gray-50 rounded-xl p-3 mt-1">
                                <span className="text-[9px] font-bold">Lucro líquido</span>
                                <span className={`text-sm font-bold
                                    ${resultadoDia.lucro - gastoHoje >= 0 ? "text-vibratingBlue" : "text-crimsonRed"}`}>
                                    R$ {(resultadoDia.lucro - gastoHoje).toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center bg-gray-50 rounded-xl p-3">
                                <span className="text-[9px] font-bold">Satisfação</span>
                                <span className={`text-xs font-bold ${satColor}`}>{sat} / 10</span>
                            </div>
                        </div>
                        <button onClick={nextDay}
                            className="w-full py-4 bg-lightGreen text-white rounded-2xl
                                font-bold text-xs shadow-lg hover:opacity-90 active:scale-95 transition-transform">
                            Próximo Dia →
                        </button>
                    </div>
                </div>
            )}

            {/*popup de fim de jogo*/}
            {showGameOverPopup && (
                <div className="absolute inset-0 bg-black/80 flex justify-center items-center z-50">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 text-center
                        w-80 border-4 border-goldenYellow text-textBlack">
                        <p className="text-3xl mb-3">🎉</p>
                        <h2 className="text-sm font-bold mb-3">Fim de Expediente!</h2>
                        <p className="text-[9px] text-gray-600 leading-relaxed mb-2">
                            Você completou {totalDias} dias em <strong>{config.bairro.nome}</strong>.
                        </p>
                        <p className="text-[9px] text-gray-600 leading-relaxed mb-6">
                            Satisfação final: <strong className={satColor}>{sat} / 10</strong>
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button onClick={() => navigate("/JogoCadastro")}
                                className="px-5 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold text-xs hover:bg-gray-200">
                                Menu
                            </button>
                            <button onClick={() => window.location.reload()}
                                className="px-5 py-3 bg-vibratingBlue text-white rounded-xl font-bold text-xs hover:opacity-80">
                                Jogar de Novo
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}