import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import Header from "../../components/Header";
import type { Cliente } from "../../types/cliente.interface";
import { criarBairroComPreferencias } from "../../services/bairro.service";
import { criarPedidoPorPreferencia } from "../../services/pedido.service";

export default function TelaDeJogo() {
    const location = useLocation();
    const { bairro, tempoDeJogo } = location.state || {};

    // popup e orçamento
    const [showPopup, setShowPopup] = useState(true);
    const [showEndOfDayPopup, setShowEndOfDayPopup] = useState(false);
    const [showGameOverPopup, setShowGameOverPopup] = useState(false);
    const [showOutOfStockPopup, setShowOutOfStockPopup] = useState(false);
    const [budget, setBudget] = useState(100);
    // precificação e compras
    const [popupStep, setPopupStep] = useState(1);
    const [precoTapioca, setPrecoTapioca] = useState(15);
    // estatística do dia
    const [gastoHoje, setGastoHoje] = useState(0);
    const [faturamentoHoje, setFaturamentoHoje] = useState(0);

    // ingredientes
    const [ingredients, setIngredients] = useState([
        { nome: "Goma de Tapioca", preco: 10, quantidade: 0, porcao: 5 },
        { nome: "Queijo Coalho", preco: 15, quantidade: 0, porcao: 3 },
        { nome: "Coco Ralado", preco: 8, quantidade: 0, porcao: 4 },
        { nome: "Leite Condensado", preco: 12, quantidade: 0, porcao: 5 },
    ]);

    // receita
    const [receita, setReceita] = useState<{ [key: string]: number }>({
        "Goma de Tapioca": 1,
        "Queijo Coalho": 0,
        "Coco Ralado": 0,
        "Leite Condensado": 0
    });

    const alterarReceita = (nome: string, delta: number) => {
        setReceita(prev => ({
            ...prev,
            [nome]: Math.max(0, (prev[nome] || 0) + delta)
        }));
    };

    // tempo e dias
    const [diaAtual, setDiaAtual] = useState(1);
    const [tempoRestante, setTempoRestante] = useState(10); // segundos por dia
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    const isTimerRunningRef = useRef(isTimerRunning);
    const isPausedRef = useRef(isPaused);
    const tempoRestanteRef = useRef(tempoRestante);

    useEffect(() => { isTimerRunningRef.current = isTimerRunning; }, [isTimerRunning]);
    useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
    useEffect(() => { tempoRestanteRef.current = tempoRestante; }, [tempoRestante]);

    // TODO: Implementar lógica de compra e satisfação dos clientes

    // fluxo de clientes
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [clientesGerados, setClientesGerados] = useState(0);
    const [clientesHoje, setClientesHoje] = useState(0);
    const [totalClientesDia, setTotalClientesDia] = useState(0);
    const intervaloClientes = useRef<ReturnType<typeof setInterval> | null>(null);

    // geração de clientes
    const gerarCliente = (nomeBairro: string): Cliente => {
        const bairroObj = criarBairroComPreferencias(nomeBairro);
        const pedido = criarPedidoPorPreferencia(bairroObj.preferenciaTapioca);

        return {
            pedido,
            bairro: bairroObj,
            satisfacao: Math.floor(Math.random() * 51) + 50,
            status: 'esperando',
        };
    };

    // fluxo de clientes ao longo do dia
    const gerarFluxoDeClientes = () => {
        if (intervaloClientes.current) return;

        const total = Math.floor(Math.random() * (25 - 15 + 1)) + 15;
        setClientesGerados(total);
        setClientesHoje(0);
        setTotalClientesDia(0);
        setClientes([]);

        let count = 0;

        intervaloClientes.current = setInterval(() => {
            if (isPausedRef.current || !isTimerRunningRef.current || tempoRestanteRef.current <= 0) {
                return;
            }

            if (count >= total) {
                clearInterval(intervaloClientes.current!);
                intervaloClientes.current = null;
                setTotalClientesDia(total);
                return;
            }

            setIngredients((prevIngredients) => {
                const temEstoqueParaTudo = prevIngredients.every(ing => {
                    const qtdNecessaria = receita[ing.nome] || 0;
                    if (qtdNecessaria === 0) return true;
                    return ing.quantidade >= qtdNecessaria;
                });

                if (!temEstoqueParaTudo) {
                    if (intervaloClientes.current) {
                        clearInterval(intervaloClientes.current);
                        intervaloClientes.current = null;
                    }
                    setIsTimerRunning(false);
                    setTempoRestante(0);
                    setShowOutOfStockPopup(true);
                    return prevIngredients;
                }

                return prevIngredients.map(ing => ({
                    ...ing,
                    quantidade: ing.quantidade - (receita[ing.nome] || 0)
                }));
            });

            setBudget(prev => prev + precoTapioca);
            setFaturamentoHoje(prev => prev + precoTapioca);
            const novoCliente = gerarCliente(bairro || "Centro");
            setClientesHoje((prev) => prev + 1);
            setClientes((prev) => [...prev, novoCliente]);
            count++;

        }, 800); // intervalo em milissegundos entre clientes
    };


    // limite de dias baseado no tempoDeJogo
    const definirLimiteDeDias = () => {
        if (!tempoDeJogo) return 3;
        const valor = tempoDeJogo.toString().toLowerCase();
        if (valor.includes("semana")) return 7;
        if (valor.includes("15")) return 15;
        if (valor.includes("mês")) return 30;
        return 3;
    };

    const limiteDeDias = definirLimiteDeDias();

    // timer do dia
    useEffect(() => {
        if (!isTimerRunning || isPaused) return;

        const timer = setInterval(() => {
            setTempoRestante((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    if (intervaloClientes.current) clearInterval(intervaloClientes.current);
                    setIsTimerRunning(false);
                    if (diaAtual >= limiteDeDias) {
                        setShowGameOverPopup(true);
                    } else {
                        setShowEndOfDayPopup(true);
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isTimerRunning, isPaused, diaAtual, limiteDeDias]);

    // função para pausar e retomar o jogo
    const togglePause = () => {
        if (showPopup || showEndOfDayPopup || showGameOverPopup) return;
        setIsPaused((prev) => !prev);
    };

    // avançar para o próximo dia
    const nextDay = () => {
        setShowEndOfDayPopup(false);

        setGastoHoje(0);
        setFaturamentoHoje(0);

        setPopupStep(1);
        setShowPopup(true);

        setDiaAtual((prev) => prev + 1);

        setTempoRestante(10);
        setIsTimerRunning(false);

        gerarFluxoDeClientes();
    };

    // compra de ingredientes
    const buyIngredient = (index: number) => {
        const item = ingredients[index];
        if (!item) return;

        if (budget < item.preco) {
            alert(`Saldo insuficiente para comprar ${item.nome}.`);
            return;
        }

        const newIngredients = [...ingredients];
        newIngredients[index].quantidade += item.porcao;

        setIngredients(newIngredients);
        setBudget(budget - item.preco);

        setGastoHoje(prev => prev + item.preco);
    };

    const removeIngredient = (index: number) => {
        const item = ingredients[index];
        if (item.quantidade <= 0) return;

        const newIngredients = [...ingredients];
        newIngredients[index].quantidade -= item.porcao;
        setIngredients(newIngredients);
        setBudget(prev => prev + item.preco);
        setGastoHoje(prev => prev - item.preco);
    };

    const anyBought = ingredients.some((ing) => ing.quantidade > 0);

    const handleNextStep = () => {
        if (!anyBought) {
            alert("Compre pelo menos um ingrediente antes de continuar!");
            return;
        }
        setPopupStep(prev => prev + 1);
    }

    const handleStartGame = () => {
        if (precoTapioca <= 0) {
            alert("Defina um preço maior do que 0!");
            return;
        }

        setShowPopup(false);
        setIsTimerRunning(true);
        gerarFluxoDeClientes();
    }

    const showIngredients = () => {
        const comprados = ingredients.filter((i) => i.quantidade > 0);
        if (comprados.length === 0) {
            return <p className="text-gray-600">Nenhum ingrediente comprado ainda.</p>;
        }
        return (
            <ul className="mt-4 flex flex-wrap justify-center gap-3">
                {comprados.map((item, index) => (
                    <li
                        key={index}
                        className={`${item.quantidade < 5 ? "bg-red-100 border-red-400" : "bg-green-100 border-green-400"} 
                                    border px-4 py-2 rounded-xl text-sm font-semibold`}
                    >
                        {item.nome} × {item.quantidade}
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <div className="font-pressStart w-full min-h-screen flex flex-col bg-primaryWhite relative overflow-y-auto">
            <Header />

            {/* Conteúdo do jogo */}
            {!showPopup && (
                <div className="flex-1 w-full flex flex-col justify-start items-center px-4 pt-24 pb-20 max-w-7xl mx-auto">
                    {/* Painel superior */}
                    <div className="w-full flex flex-wrap justify-center gap-4 mb-8">
                        {[
                            `Bairro: ${bairro}`,
                            `Orçamento: R$ ${budget}`,
                            `Dia: ${diaAtual}/${limiteDeDias}`,
                            `Tempo Restante: ${tempoRestante}`,
                        ].map((text, i) => (
                            <div
                                key={i}
                                className="bg-vibratingBlue text-primaryWhite text-[8px] md:text-[10px] font-bold px-4 py-3 border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] uppercase flex items-center justify-center text-center"
                            >
                                {text}
                            </div>
                        ))}

                        {/* Botão de pausa */}
                        <button
                            onClick={togglePause}
                            className={`text-[8px] md:text-[10px] font-bold px-4 py-3 border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] uppercase transition-all duration-200
                                ${isPaused
                                    ? "bg-lightGreen text-textBlack hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)]"
                                    : "bg-crimsonRed text-primaryWhite hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)]"}
                            `}
                        >
                            {isPaused ? "▶ RETOMAR" : "⏸ PAUSAR"}
                        </button>
                    </div>

                    <h1 className="text-sm md:text-xl font-bold text-textBlack uppercase drop-shadow-[2px_2px_0px_rgba(0,0,0,0.2)] mt-4 mb-8 text-center">
                        BEM-VINDO AO JOGO!
                    </h1>

                    <div className="w-full max-w-2xl mt-6 bg-lightGreen border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-6">
                        <h2 className="text-[10px] md:text-xs font-bold text-primaryWhite drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] uppercase mb-4 text-center">
                            Ingredientes Comprados:
                        </h2>
                        {/* Como o showIngredients() retorna elementos internos, assumo que eles se adaptarão ao contêiner, ou você pode estilizá-los lá dentro depois */}
                        <div className="text-[8px] md:text-[10px] text-textBlack">
                            {showIngredients()}
                        </div>
                    </div>

                    <div className="w-full max-w-2xl mt-8 bg-goldenYellow border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-6 text-center">
                        <h2 className="text-[10px] md:text-xs font-bold text-textBlack uppercase mb-4">
                            👥 Clientes chegando...
                        </h2>
                        <p className="text-[10px] md:text-xs text-textBlack mt-2 uppercase">
                            Atendidos hoje: <strong className="text-primaryWhite drop-shadow-[1px_1px_0px_rgba(0,0,0,1)]">{clientesHoje}</strong> / {clientesGerados || "??"}
                        </p>
                        {totalClientesDia > 0 && (
                            <p className="text-[10px] md:text-xs text-vibratingBlue mt-4 font-bold uppercase drop-shadow-[1px_1px_0px_rgba(0,0,0,0.2)]">
                                Total de clientes hoje: {totalClientesDia}
                            </p>
                        )}
                    </div>

                    {/* Lista opcional para debug/visualização */}
                    <div className="mt-8 w-full max-w-2xl max-h-40 overflow-y-auto text-[8px] text-center bg-primaryWhite border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] p-4">
                        {clientes.map((c, i) => (
                            <div key={i} className="border-b-4 border-black py-2 uppercase text-textBlack last:border-0">
                                Cliente {i + 1}: {c.bairro.nome} — {c.bairro.preferenciaTapioca} — satisfação {c.satisfacao}%
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Popup inicial */}
            {showPopup && (
                <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 px-4">
                    <div className="bg-primaryWhite w-full max-w-4xl max-h-[90vh] overflow-y-auto border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-6 md:p-8 flex flex-col justify-between">

                        {/* ETAPA 1: COMPRA DE INGREDIENTES */}
                        {popupStep === 1 && (
                            <>
                                <div>
                                    <h2 className="text-sm md:text-xl text-center mb-6 font-bold text-textBlack uppercase drop-shadow-[2px_2px_0px_rgba(0,0,0,0.2)]">
                                        🛒 Fase 1: Estoque
                                    </h2>
                                    <div className="text-center mb-8 bg-goldenYellow p-4 border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                                        <p className="text-xs md:text-sm font-bold text-textBlack uppercase">
                                            💰 Orçamento: R$ {budget}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        {ingredients.map((item, index) => (
                                            <div key={index} className="border-4 border-black p-4 text-center bg-lightGreen shadow-[4px_4px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
                                                <div>
                                                    <p className="font-bold text-[10px] md:text-xs mb-2 text-primaryWhite drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] uppercase">
                                                        {item.nome}
                                                    </p>
                                                    <p className="text-[8px] md:text-[10px] text-textBlack font-bold mb-4 uppercase">
                                                        📦 Rende: {item.porcao} porções
                                                    </p>
                                                    <div className="bg-primaryWhite border-4 border-black py-3 mb-4">
                                                        <p className="text-[8px] md:text-[10px] text-textBlack uppercase mb-2 font-bold">
                                                            Preço: <span className="text-vibratingBlue drop-shadow-[1px_1px_0px_rgba(0,0,0,0.2)]">R$ {item.preco}</span>
                                                        </p>
                                                        <p className="text-[8px] md:text-[10px] text-textBlack uppercase font-bold">
                                                            No estoque: <strong className="text-crimsonRed text-xs">{item.quantidade}</strong>
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Controles de compra e venda */}
                                                <div className="flex items-center justify-between gap-4 mt-2">
                                                    <button
                                                        onClick={() => removeIngredient(index)}
                                                        disabled={item.quantidade <= 0}
                                                        className={`flex-1 py-3 border-4 border-black font-bold text-xs md:text-sm uppercase transition-all duration-200 ${item.quantidade > 0
                                                            ? "bg-crimsonRed text-primaryWhite shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)]"
                                                            : "bg-gray-400 text-gray-600 shadow-[4px_4px_0px_rgba(100,100,100,1)] cursor-not-allowed"
                                                            }`}
                                                    >
                                                        -
                                                    </button>

                                                    <button
                                                        onClick={() => buyIngredient(index)}
                                                        disabled={budget < item.preco}
                                                        className={`flex-1 py-3 border-4 border-black font-bold text-xs md:text-sm uppercase transition-all duration-200 ${budget >= item.preco
                                                            ? "bg-lightGreen text-textBlack shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)]"
                                                            : "bg-gray-400 text-gray-600 shadow-[4px_4px_0px_rgba(100,100,100,1)] cursor-not-allowed"
                                                            }`}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <button
                                    onClick={handleNextStep}
                                    className="mt-8 w-full px-6 py-4 bg-vibratingBlue text-primaryWhite border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 uppercase font-bold text-[10px] md:text-xs"
                                >
                                    DEFINIR RECEITA →
                                </button>
                            </>
                        )}

                        {/* ETAPA 2: RECEITA */}
                        {popupStep === 2 && (
                            <div className="flex flex-col h-full">
                                <h2 className="text-sm md:text-xl text-center mb-4 font-bold text-textBlack uppercase drop-shadow-[2px_2px_0px_rgba(0,0,0,0.2)]">
                                    📋 Fase 2: Sua Receita
                                </h2>
                                <p className="text-center text-textBlack text-[8px] md:text-[10px] mb-8 uppercase leading-loose">
                                    Quantas porções de cada item <br /> vai em cada tapioca?
                                </p>

                                <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                                    {ingredients
                                        .filter(ing => ing.quantidade > 0)
                                        .map((ing, index) => (
                                            <div key={index} className="flex flex-col sm:flex-row items-center justify-between bg-primaryWhite p-4 border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] gap-4">
                                                <div className="flex flex-col text-center sm:text-left">
                                                    <span className="font-bold text-[10px] md:text-xs uppercase text-textBlack mb-2">{ing.nome}</span>
                                                    <span className="text-[8px] text-vibratingBlue font-bold uppercase">
                                                        Estoque: {ing.quantidade} un.
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <button
                                                        onClick={() => alterarReceita(ing.nome, -1)}
                                                        className="w-10 h-10 bg-crimsonRed text-primaryWhite border-4 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)] font-bold text-sm"
                                                    >-</button>

                                                    <div className="flex flex-col items-center w-16">
                                                        <span className="font-bold text-sm md:text-base leading-none text-textBlack mb-1">
                                                            {receita[ing.nome] || 0}
                                                        </span>
                                                        <span className="text-[6px] md:text-[8px] uppercase text-textBlack font-bold text-center">na tapioca</span>
                                                    </div>

                                                    <button
                                                        onClick={() => alterarReceita(ing.nome, 1)}
                                                        disabled={(receita[ing.nome] || 0) >= ing.quantidade}
                                                        className={`w-10 h-10 border-4 border-black font-bold text-sm transition-all duration-200 ${(receita[ing.nome] || 0) >= ing.quantidade
                                                            ? "bg-gray-400 text-gray-600 shadow-[2px_2px_0px_rgba(100,100,100,1)] cursor-not-allowed"
                                                            : "bg-lightGreen text-textBlack shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)]"
                                                            }`}
                                                    >+</button>
                                                </div>
                                            </div>
                                        ))
                                    }
                                    {ingredients.filter(ing => ing.quantidade > 0).length === 0 && (
                                        <p className="text-center text-crimsonRed font-bold text-[10px] mt-10 uppercase bg-primaryWhite border-4 border-black p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                                            Você não comprou ingredientes!
                                        </p>
                                    )}
                                </div>

                                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                                    <button
                                        onClick={() => setPopupStep(1)}
                                        className="w-full sm:w-auto px-6 py-4 bg-goldenYellow text-textBlack border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 uppercase font-bold text-[10px] md:text-xs"
                                    >
                                        VOLTAR
                                    </button>
                                    <button
                                        onClick={() => setPopupStep(3)} // Avança para o preço (Step 3)
                                        className="w-full sm:w-auto px-8 py-4 bg-vibratingBlue text-primaryWhite border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 uppercase font-bold text-[10px] md:text-xs"
                                    >
                                        DEFINIR PREÇO →
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ETAPA 3: DEFINIÇÃO DE PREÇO */}
                        {popupStep === 3 && (
                            <div className="flex flex-col items-center justify-center flex-1 py-10">
                                <h2 className="text-sm md:text-xl text-center mb-8 font-bold text-textBlack uppercase drop-shadow-[2px_2px_0px_rgba(0,0,0,0.2)]">
                                    💰 Fase 3: Precificação
                                </h2>
                                <p className="text-center mb-12 text-textBlack text-[8px] md:text-[10px] uppercase leading-loose">
                                    Por quanto você vai vender <br /> cada tapioca no bairro <br /> <strong className="text-vibratingBlue">{bairro}</strong>?
                                </p>

                                <div className="flex items-center gap-8 mb-16 bg-primaryWhite border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-8">
                                    <button
                                        onClick={() => setPrecoTapioca(Math.max(1, precoTapioca - 1))}
                                        className="w-12 h-12 bg-crimsonRed text-primaryWhite border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)] font-bold text-xl"
                                    >-</button>

                                    <div className="text-center min-w-[120px]">
                                        <span className="text-xl md:text-2xl font-bold text-lightGreen drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">R$ {precoTapioca}</span>
                                        <p className="text-[8px] text-textBlack mt-4 uppercase font-bold">Por unidade</p>
                                    </div>

                                    <button
                                        onClick={() => setPrecoTapioca(precoTapioca + 1)}
                                        className="w-12 h-12 bg-lightGreen text-textBlack border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)] font-bold text-xl"
                                    >+</button>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                                    <button
                                        onClick={() => setPopupStep(2)}
                                        className="w-full sm:w-auto px-6 py-4 bg-goldenYellow text-textBlack border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 uppercase font-bold text-[10px] md:text-xs"
                                    >
                                        VOLTAR
                                    </button>
                                    <button
                                        onClick={handleStartGame}
                                        className="w-full sm:w-auto px-8 py-4 bg-lightGreen text-textBlack border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 uppercase font-bold text-[10px] md:text-xs"
                                    >
                                        ABRIR BANQUINHA! 🚀
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Popup de ingredientes esgotados */}
            {showOutOfStockPopup && (
                <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 px-4">
                    <div className="bg-primaryWhite border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-8 text-center w-full max-w-md">
                        <h2 className="text-sm md:text-lg mb-6 font-bold text-crimsonRed uppercase drop-shadow-[1px_1px_0px_rgba(0,0,0,0.2)]">⚠️ ESTOQUE ESGOTADO!</h2>
                        <p className="mb-8 font-pressStart text-[8px] md:text-[10px] text-textBlack leading-loose uppercase">
                            Você não tem mais ingredientes. <br /> As vendas foram encerradas <br /> mais cedo hoje!
                        </p>
                        <button
                            onClick={() => {
                                setShowOutOfStockPopup(false);
                                if (diaAtual >= limiteDeDias) {
                                    setShowGameOverPopup(true);
                                } else {
                                    setShowEndOfDayPopup(true);
                                }
                            }}
                            className="w-full px-6 py-4 bg-crimsonRed text-primaryWhite border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 uppercase font-bold text-[10px] md:text-xs"
                        >
                            VER RESULTADOS
                        </button>
                    </div>
                </div>
            )}

            {/* Popup de fim de dia */}
            {showEndOfDayPopup && (
                <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 px-4">
                    <div className="bg-primaryWhite border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-8 text-center w-full max-w-md">
                        <h2 className="text-sm md:text-lg mb-8 font-bold text-textBlack uppercase drop-shadow-[2px_2px_0px_rgba(0,0,0,0.2)]">
                            🌙 BALANÇO DO DIA {diaAtual}
                        </h2>

                        <div className="space-y-6 mb-10 bg-lightGreen border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] p-6">
                            <div className="flex justify-between items-center border-b-4 border-black pb-4">
                                <span className="text-[8px] md:text-[10px] text-textBlack uppercase font-bold">Faturamento:</span>
                                <span className="text-[10px] md:text-xs text-primaryWhite drop-shadow-[1px_1px_0px_rgba(0,0,0,1)] font-bold">R$ {faturamentoHoje}</span>
                            </div>

                            <div className="flex justify-between items-center border-b-4 border-black pb-4">
                                <span className="text-[8px] md:text-[10px] text-textBlack uppercase font-bold">Gastos (Estoque):</span>
                                <span className="text-[10px] md:text-xs text-crimsonRed drop-shadow-[1px_1px_0px_rgba(0,0,0,0.5)] font-bold">R$ {gastoHoje}</span>
                            </div>

                            <div className="flex flex-col gap-2 bg-primaryWhite border-4 border-black p-4 mt-4 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                                <span className="font-bold text-[8px] md:text-[10px] uppercase text-textBlack">Lucro Líquido:</span>
                                <span className={`text-xs md:text-sm font-bold mt-2 drop-shadow-[1px_1px_0px_rgba(0,0,0,0.2)] ${faturamentoHoje - gastoHoje >= 0 ? 'text-lightGreen' : 'text-crimsonRed'}`}>
                                    R$ {faturamentoHoje - gastoHoje}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={nextDay}
                            className="w-full px-6 py-4 bg-vibratingBlue text-primaryWhite border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 uppercase font-bold text-[10px] md:text-xs"
                        >
                            PRÓXIMO DIA →
                        </button>
                    </div>
                </div>
            )}

            {/* Popup de fim de jogo */}
            {showGameOverPopup && (
                <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 px-4">
                    <div className="bg-primaryWhite border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-8 text-center w-full max-w-md">
                        <h2 className="text-sm md:text-lg mb-6 font-bold text-vibratingBlue uppercase drop-shadow-[2px_2px_0px_rgba(0,0,0,0.2)]">🎉 FIM DO JOGO!</h2>
                        <p className="mb-8 font-pressStart text-[8px] md:text-[10px] text-textBlack leading-loose uppercase">
                            Você completou todos <br /> os {limiteDeDias} dias de jogo! <br /><br />
                            Parabéns pelo seu <br /> desempenho!
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full px-6 py-4 bg-goldenYellow text-textBlack border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 uppercase font-bold text-[10px] md:text-xs"
                        >
                            REINICIAR JOGO
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
