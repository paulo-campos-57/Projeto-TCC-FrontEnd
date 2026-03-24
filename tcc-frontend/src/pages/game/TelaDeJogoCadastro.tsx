import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import toast, { Toaster } from "react-hot-toast";
import { processarDia } from "../../services/jogo.service";
import type { ProcessarDiaResult } from "../../services/jogo.service";

interface Ingrediente {
    nome: string;
    preco: number;
    quantidade: number;
    porcao: number;
}

interface GameConfig {
    bairro: {
        id: number;
        nome: string;
        descricao?: string;
        focoPreco?: string;
        expectativa?: string;
    };
    tempoDeJogo: string;
}

const INGREDIENTES_INICIAIS: Ingrediente[] = [
    { nome: "Goma de Tapioca", preco: 10, quantidade: 0, porcao: 5 },
    { nome: "Queijo Coalho", preco: 15, quantidade: 0, porcao: 3 },
    { nome: "Coco Ralado", preco: 8, quantidade: 0, porcao: 4 },
    { nome: "Leite Condensado", preco: 12, quantidade: 0, porcao: 5 },
];

const DURACAO_DIA_SEGUNDOS = 30;

function limiteDias(tempoDeJogo: string): number {
    const v = tempoDeJogo.toLowerCase();
    if (v.includes("semana")) return 7;
    if (v.includes("15")) return 15;
    if (v.includes("mês")) return 30;
    return 3;
}

function calcularEstoqueEmTapiocas(
    ingredients: Ingrediente[],
    receita: Record<string, number>
): number {
    const limites = ingredients
        .filter(ing => (receita[ing.nome] ?? 0) > 0)
        .map(ing => Math.floor(ing.quantidade / (receita[ing.nome] ?? 1)));

    if (limites.length === 0) return 0;
    return Math.min(...limites);
}

export default function TelaDeJogoCadastro() {
    const location = useLocation();
    const navigate = useNavigate();
    const { config } = (location.state as { config?: GameConfig }) || {};

    const [budget, setBudget] = useState(100);
    const [satisfacao, setSatisfacao] = useState(5);
    const [diaAtual, setDiaAtual] = useState(1);

    const [tempoRestante, setTempoRestante] = useState(DURACAO_DIA_SEGUNDOS);
    const [isRunning, setIsRunning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    const [resultadoDia, setResultadoDia] = useState<ProcessarDiaResult | null>(null);
    const [gastoHoje, setGastoHoje] = useState(0);
    const [faturamentoHoje, setFaturamentoHoje] = useState(0);

    const [popupStep, setPopupStep] = useState<1 | 2 | 3>(1);
    const [showSetupPopup, setShowSetupPopup] = useState(true);
    const [showEndOfDayPopup, setShowEndOfDayPopup] = useState(false);
    const [showGameOverPopup, setShowGameOverPopup] = useState(false);
    const [showOutOfStock, setShowOutOfStock] = useState(false);
    const [isProcessando, setIsProcessando] = useState(false);

    const [ingredients, setIngredients] = useState<Ingrediente[]>(
        INGREDIENTES_INICIAIS.map(i => ({ ...i }))
    );
    const [receita, setReceita] = useState<Record<string, number>>({
        "Goma de Tapioca": 1,
        "Queijo Coalho": 0,
        "Coco Ralado": 0,
        "Leite Condensado": 0,
    });
    const [precoTapioca, setPrecoTapioca] = useState(15);

    const [clientesTotaisHoje, setClientesTotaisHoje] = useState(0);

    const [clientesAnimados, setClientesAnimados] = useState(0);
    const animIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    if (!config) {
        return (
            <div className="h-screen flex flex-col items-center justify-center font-pressStart gap-4">
                <p className="text-sm">Erro: sessão de jogo não encontrada.</p>
                <button
                    onClick={() => navigate("/JogoCadastro")}
                    className="bg-vibratingBlue text-white px-6 py-2 rounded-lg text-xs"
                >
                    Voltar
                </button>
            </div>
        );
    }

    const totalDias = limiteDias(config.tempoDeJogo);

    useEffect(() => {
        if (!isRunning || isPaused) return;

        const timer = setInterval(() => {
            setTempoRestante(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setIsRunning(false);
                    encerrarDia();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isRunning, isPaused]);

    useEffect(() => {
        if (clientesTotaisHoje === 0) return;
        if (animIntervalRef.current) clearInterval(animIntervalRef.current);

        setClientesAnimados(0);
        const incremento = Math.ceil(clientesTotaisHoje / DURACAO_DIA_SEGUNDOS);

        animIntervalRef.current = setInterval(() => {
            setClientesAnimados(prev => {
                const next = prev + incremento;
                if (next >= clientesTotaisHoje) {
                    clearInterval(animIntervalRef.current!);
                    animIntervalRef.current = null;
                    return clientesTotaisHoje;
                }
                return next;
            });
        }, 1000);

        return () => {
            if (animIntervalRef.current) clearInterval(animIntervalRef.current);
        };
    }, [clientesTotaisHoje]);

    const temEstoque = (): boolean => {
        return ingredients.some(ing => {
            const qtd = receita[ing.nome] ?? 0;
            return qtd > 0 && ing.quantidade >= qtd;
        });
    };

    const handleStartGame = async () => {
        if (precoTapioca <= 0) {
            toast.error("Defina um preço maior que zero!");
            return;
        }
        if (!temEstoque()) {
            setShowSetupPopup(false);
            setShowOutOfStock(true);
            return;
        }

        setIsProcessando(true);
        const loadingToast = toast.loading("Processando o dia...");

        try {
            const resultado = await processarDia({
                id_bairro: config.bairro.id,
                preco_tapioca: precoTapioca,
                estoque_disponivel: calcularEstoqueEmTapiocas(ingredients, receita),
            });

            toast.dismiss(loadingToast);
            setResultadoDia(resultado);

            const totalVendas = resultado.clientes_atendidos;
            setIngredients(prev =>
                prev.map(ing => ({
                    ...ing,
                    quantidade: Math.max(
                        0,
                        ing.quantidade - (receita[ing.nome] ?? 0) * totalVendas
                    ),
                }))
            );

            setClientesTotaisHoje(resultado.clientes_totais);
            setFaturamentoHoje(resultado.lucro);

            setShowSetupPopup(false);
            setIsRunning(true);
        } catch (err) {
            toast.dismiss(loadingToast);
            toast.error(
                err instanceof Error ? err.message : "Erro ao conectar com o servidor."
            );
        } finally {
            setIsProcessando(false);
        }
    };

    const encerrarDia = () => {
        if (animIntervalRef.current) {
            clearInterval(animIntervalRef.current);
            animIntervalRef.current = null;
        }
        if (resultadoDia) setClientesAnimados(resultadoDia.clientes_totais);

        if (resultadoDia) {
            setBudget(prev => prev + resultadoDia.lucro);
            setGastoHoje(gastoHoje);
            setSatisfacao(prev =>
                Math.max(0, Math.min(10, prev + resultadoDia.satisfacao_delta))
            );
        }

        if (diaAtual >= totalDias) {
            setShowGameOverPopup(true);
        } else {
            setShowEndOfDayPopup(true);
        }
    };

    const nextDay = () => {
        setShowEndOfDayPopup(false);
        setResultadoDia(null);
        setGastoHoje(0);
        setFaturamentoHoje(0);
        setClientesTotaisHoje(0);
        setClientesAnimados(0);
        setPopupStep(1);
        setShowSetupPopup(true);
        setDiaAtual(prev => prev + 1);
        setTempoRestante(DURACAO_DIA_SEGUNDOS);
        setIsRunning(false);
        setIngredients(INGREDIENTES_INICIAIS.map(i => ({ ...i })));
        setReceita({
            "Goma de Tapioca": 1,
            "Queijo Coalho": 0,
            "Coco Ralado": 0,
            "Leite Condensado": 0,
        });
        setPrecoTapioca(15);
    };

    // compra / devolução de ingredientes
    const buyIngredient = (index: number) => {
        const item = ingredients[index];
        if (budget < item.preco) {
            toast.error(`Saldo insuficiente para comprar ${item.nome}.`);
            return;
        }
        setIngredients(prev =>
            prev.map((ing, i) =>
                i === index ? { ...ing, quantidade: ing.quantidade + ing.porcao } : ing
            )
        );
        setBudget(prev => prev - item.preco);
        setGastoHoje(prev => prev + item.preco);
    };

    const removeIngredient = (index: number) => {
        const item = ingredients[index];
        if (item.quantidade <= 0) return;
        setIngredients(prev =>
            prev.map((ing, i) =>
                i === index ? { ...ing, quantidade: ing.quantidade - ing.porcao } : ing
            )
        );
        setBudget(prev => prev + item.preco);
        setGastoHoje(prev => prev - item.preco);
    };

    const alterarReceita = (nome: string, delta: number) => {
        setReceita(prev => ({
            ...prev,
            [nome]: Math.max(0, (prev[nome] ?? 0) + delta),
        }));
    };

    const anyBought = ingredients.some(i => i.quantidade > 0);

    const handleNextStep = () => {
        if (!anyBought) {
            toast.error("Compre pelo menos um ingrediente!");
            return;
        }
        setPopupStep(2);
    };

    const togglePause = () => {
        if (showSetupPopup || showEndOfDayPopup || showGameOverPopup) return;
        setIsPaused(prev => !prev);
    };

    // cores de satisfação
    const satisfacaoColor =
        satisfacao >= 7 ? "text-green-400"
            : satisfacao >= 4 ? "text-yellow-300"
                : "text-red-400";

    return (
        <div className="w-screen h-screen font-pressStart flex flex-col bg-primaryWhite overflow-hidden relative">
            <Toaster position="top-right" />
            <Header />

            {/*Tela de jogo*/}
            {!showSetupPopup && (
                <div className="flex-1 flex flex-col p-4 pt-20 gap-4 overflow-hidden">

                    {/* HUD */}
                    <div className="flex flex-wrap justify-between items-center gap-3">
                        {[
                            { label: "Bairro", value: config.bairro.nome },
                            { label: "Dia", value: `${diaAtual} / ${totalDias}` },
                            { label: "Tempo", value: `${tempoRestante}s` },
                            { label: "Caixa", value: `R$ ${budget.toFixed(2)}` },
                        ].map(({ label, value }) => (
                            <div
                                key={label}
                                className="flex flex-col items-center bg-vibratingBlue text-primaryWhite
                                    px-5 py-2 rounded-xl border-4 border-goldenYellow shadow-md flex-1 min-w-[120px]"
                            >
                                <span className="text-[8px] uppercase tracking-widest opacity-70">{label}</span>
                                <span className="text-sm font-bold mt-0.5">{value}</span>
                            </div>
                        ))}

                        {/* satisfação */}
                        <div className="flex flex-col items-center bg-textBlack text-primaryWhite
                            px-5 py-2 rounded-xl border-4 border-goldenYellow shadow-md flex-1 min-w-[120px]">
                            <span className="text-[8px] uppercase tracking-widest opacity-70">Satisfação</span>
                            <span className={`text-xs font-bold mt-0.5 ${satisfacaoColor}`}>
                                {satisfacao} / 10
                            </span>
                        </div>

                        <button
                            onClick={togglePause}
                            className={`px-5 py-3 rounded-xl border-4 border-goldenYellow text-xs font-bold
                                transition-all shadow-md
                                ${isPaused
                                    ? "bg-lightGreen text-primaryWhite"
                                    : "bg-crimsonRed text-primaryWhite"
                                }`}
                        >
                            {isPaused ? "▶ Retomar" : "⏸ Pausar"}
                        </button>
                    </div>

                    {/* área de jogo */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden">

                        {/* preparação */}
                        <div className="bg-lightGreen/10 border-4 border-dashed border-lightGreen
                            rounded-2xl flex flex-col items-center justify-center p-6 gap-4">
                            <p className="text-xs text-center text-gray-600">Área de Preparação</p>
                            <div className="text-6xl animate-bounce">🍳</div>
                            <p className="text-[10px] text-gray-400 text-center">
                                Preço: <strong className="text-vibratingBlue">R$ {precoTapioca}</strong>
                            </p>
                            <div className="flex flex-wrap gap-2 justify-center">
                                {ingredients.filter(i => i.quantidade > 0).map(i => (
                                    <span
                                        key={i.nome}
                                        className={`text-[8px] px-2 py-1 rounded-full border font-bold
                                            ${i.quantidade < i.porcao
                                                ? "border-red-400 text-red-600 bg-red-50"
                                                : "border-lightGreen text-green-700 bg-green-50"
                                            }`}
                                    >
                                        {i.nome.split(" ")[0]} ×{i.quantidade}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* clientes */}
                        <div className="bg-white border-4 border-vibratingBlue rounded-2xl
                            flex flex-col items-center justify-center p-6 gap-3 shadow-sm">
                            <p className="text-xs text-center">Fila de Clientes</p>

                            {/* contagem animada */}
                            <p className="text-5xl font-bold text-vibratingBlue">
                                {clientesAnimados}
                            </p>
                            <p className="text-[9px] text-gray-400">
                                de {clientesTotaisHoje} clientes hoje
                            </p>

                            {/* mensagem do backend */}
                            {resultadoDia?.mensagem && (
                                <div className="mt-2 bg-goldenYellow/20 border border-goldenYellow
                                    rounded-xl p-3 text-[9px] text-center leading-relaxed max-w-xs">
                                    {resultadoDia.mensagem}
                                </div>
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
                        justify-between border-4 border-vibratingBlue text-textBlack">

                        {/* indicador de etapa */}
                        <div className="flex justify-center gap-2 mb-4">
                            {([1, 2, 3] as const).map(step => (
                                <div
                                    key={step}
                                    className={`h-2 rounded-full transition-all duration-300
                                        ${popupStep >= step
                                            ? "bg-vibratingBlue w-8"
                                            : "bg-gray-200 w-4"
                                        }`}
                                />
                            ))}
                        </div>

                        {/*Estoque*/}
                        {popupStep === 1 && (
                            <>
                                <div className="flex-1">
                                    <h2 className="text-lg text-center font-bold mb-1">
                                        Fase 1 — Estoque
                                    </h2>
                                    <p className="text-[9px] text-center text-gray-400 mb-4">
                                        Bairro: <strong>{config.bairro.nome}</strong>
                                        {config.bairro.expectativa && (
                                            <> · Expectativa: <strong>{config.bairro.expectativa}</strong></>
                                        )}
                                    </p>

                                    <div className="text-center mb-4 bg-goldenYellow/20
                                        border border-goldenYellow rounded-xl py-2">
                                        <span className="text-sm font-bold">
                                            Orçamento disponível: R$ {budget.toFixed(2)}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        {ingredients.map((item, index) => (
                                            <div key={item.nome}
                                                className="border-2 border-gray-100 rounded-xl
                                                    p-3 bg-gray-50 flex flex-col gap-2">
                                                <p className="text-[10px] font-bold">{item.nome}</p>
                                                <p className="text-[9px] text-vibratingBlue font-bold uppercase">
                                                    Rende {item.porcao} porções
                                                </p>
                                                <div className="bg-white rounded-lg px-2 py-1.5
                                                    border border-gray-100 text-[9px] space-y-0.5">
                                                    <p>Preço: <strong className="text-lightGreen">R$ {item.preco}</strong></p>
                                                    <p>Estoque: <strong>{item.quantidade}</strong></p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => removeIngredient(index)}
                                                        disabled={item.quantidade <= 0}
                                                        className={`flex-1 py-1.5 rounded-lg font-bold text-base transition-all
                                                            ${item.quantidade > 0
                                                                ? "bg-crimsonRed text-white hover:opacity-80"
                                                                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                                            }`}>−</button>
                                                    <button onClick={() => buyIngredient(index)}
                                                        disabled={budget < item.preco}
                                                        className={`flex-1 py-1.5 rounded-lg font-bold text-base transition-all
                                                            ${budget >= item.preco
                                                                ? "bg-lightGreen text-white hover:opacity-80"
                                                                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                                            }`}>+</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <button onClick={handleNextStep}
                                    className="mt-5 w-full py-3 bg-vibratingBlue text-white
                                        rounded-xl font-bold text-xs hover:bg-blue-700 transition">
                                    Definir Receita →
                                </button>
                            </>
                        )}

                        {/*Receita*/}
                        {popupStep === 2 && (
                            <div className="flex flex-col flex-1">
                                <h2 className="text-lg text-center font-bold mb-1">
                                    Fase 2 — Receita
                                </h2>
                                <p className="text-[9px] text-center text-gray-400 mb-5">
                                    Quantas porções de cada ingrediente por tapioca?
                                </p>
                                <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                                    {ingredients.filter(ing => ing.quantidade > 0).map(ing => (
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
                                                <button onClick={() => alterarReceita(ing.nome, -1)}
                                                    className="w-8 h-8 bg-crimsonRed text-white rounded-lg font-bold hover:opacity-80">−</button>
                                                <div className="flex flex-col items-center w-8">
                                                    <span className="font-bold text-lg leading-none">
                                                        {receita[ing.nome] ?? 0}
                                                    </span>
                                                    <span className="text-[7px] uppercase text-gray-400">un.</span>
                                                </div>
                                                <button onClick={() => alterarReceita(ing.nome, 1)}
                                                    disabled={(receita[ing.nome] ?? 0) >= ing.quantidade}
                                                    className={`w-8 h-8 rounded-lg font-bold
                                                        ${(receita[ing.nome] ?? 0) >= ing.quantidade
                                                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                                            : "bg-lightGreen text-white hover:opacity-80"
                                                        }`}>+</button>
                                            </div>
                                        </div>
                                    ))}
                                    {ingredients.filter(i => i.quantidade > 0).length === 0 && (
                                        <p className="text-center text-crimsonRed text-xs mt-8">
                                            Nenhum ingrediente comprado!
                                        </p>
                                    )}
                                </div>
                                <div className="mt-5 flex gap-3">
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

                        {/*Precificação*/}
                        {popupStep === 3 && (
                            <div className="flex flex-col items-center justify-center flex-1 gap-4">
                                <h2 className="text-lg text-center font-bold">
                                    Fase 3 — Precificação
                                </h2>
                                {config.bairro.focoPreco && (
                                    <div className="bg-vibratingBlue/10 border border-vibratingBlue
                                        rounded-xl px-4 py-2 text-[9px] text-center leading-relaxed max-w-xs">
                                        Foco de preço em <strong>{config.bairro.nome}</strong>:
                                        &nbsp;<strong>{config.bairro.focoPreco}</strong>
                                    </div>
                                )}
                                <p className="text-[9px] text-center text-gray-400 max-w-xs">
                                    O preço influencia diretamente a satisfação e as vendas do dia.
                                </p>
                                <div className="flex items-center gap-6 my-2">
                                    <button onClick={() => setPrecoTapioca(p => Math.max(1, p - 1))}
                                        className="w-12 h-12 bg-crimsonRed text-white rounded-full text-2xl font-bold hover:opacity-80">−</button>
                                    <div className="text-center">
                                        <span className="text-5xl font-bold text-lightGreen">R$ {precoTapioca}</span>
                                        <p className="text-[8px] text-gray-400 mt-1">por unidade</p>
                                    </div>
                                    <button onClick={() => setPrecoTapioca(p => p + 1)}
                                        className="w-12 h-12 bg-lightGreen text-white rounded-full text-2xl font-bold hover:opacity-80">+</button>
                                </div>
                                <div className="flex gap-3 mt-2">
                                    <button onClick={() => setPopupStep(2)}
                                        className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold text-xs hover:bg-gray-200">
                                        ← Voltar
                                    </button>
                                    <button
                                        onClick={handleStartGame}
                                        disabled={isProcessando}
                                        className={`px-8 py-3 text-white rounded-xl font-bold text-xs
                                            active:scale-95 transition-transform
                                            ${isProcessando
                                                ? "bg-gray-400 cursor-not-allowed"
                                                : "bg-lightGreen hover:opacity-80"
                                            }`}
                                    >
                                        {isProcessando ? "Processando..." : "Abrir Barraca! 🚀"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/*popup de estoque esgotado*/}
            {showOutOfStock && (
                <div className="absolute inset-0 bg-black/70 flex justify-center items-center z-50">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 text-center
                        w-80 border-4 border-crimsonRed">
                        <p className="text-2xl mb-2">⚠️</p>
                        <h2 className="text-sm font-bold mb-3">Sem Estoque!</h2>
                        <p className="text-[9px] leading-relaxed text-gray-600 mb-6">
                            Você precisa ter pelo menos um ingrediente com
                            porção definida na receita antes de abrir a barraca.
                        </p>
                        <button
                            onClick={() => {
                                setShowOutOfStock(false);
                                setShowSetupPopup(true);
                                setPopupStep(1);
                            }}
                            className="px-6 py-3 bg-vibratingBlue text-white
                                rounded-xl font-bold text-xs hover:opacity-80"
                        >
                            Voltar ao Estoque
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
                            Balanço — Dia {diaAtual}
                        </h2>
                        <div className="space-y-3 mb-8 text-left">
                            {[
                                { label: "Faturamento", value: `R$ ${faturamentoHoje.toFixed(2)}`, color: "text-lightGreen" },
                                { label: "Gastos estoque", value: `R$ ${gastoHoje.toFixed(2)}`, color: "text-crimsonRed" },
                                { label: "Clientes", value: `${resultadoDia.clientes_atendidos} / ${resultadoDia.clientes_totais}`, color: "text-vibratingBlue" },
                            ].map(({ label, value, color }) => (
                                <div key={label} className="flex justify-between items-center border-b border-gray-100 pb-2">
                                    <span className="text-[9px] text-gray-500">{label}</span>
                                    <span className={`text-xs font-bold ${color}`}>{value}</span>
                                </div>
                            ))}
                            <div className="flex justify-between items-center bg-gray-50 rounded-xl p-3 mt-1">
                                <span className="text-[9px] font-bold">Lucro líquido</span>
                                <span className={`text-sm font-bold
                                    ${faturamentoHoje - gastoHoje >= 0 ? "text-vibratingBlue" : "text-crimsonRed"}`}>
                                    R$ {(faturamentoHoje - gastoHoje).toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center bg-gray-50 rounded-xl p-3">
                                <span className="text-[9px] font-bold">Satisfação</span>
                                <span className={`text-xs font-bold ${satisfacaoColor}`}>{satisfacao} / 10</span>
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
                            Satisfação final: <strong className={satisfacaoColor}>{satisfacao} / 10</strong>
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