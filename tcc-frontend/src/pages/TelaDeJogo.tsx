import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import Header from "../components/Header";
import type { Cliente } from "../types/cliente.interface";
import { criarBairroComPreferencias } from "../services/bairro.service";
import { criarPedidoPorPreferencia } from "../services/pedido.service";

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

    // ingredientes
    const [ingredients, setIngredients] = useState([
        { nome: "Goma de Tapioca", preco: 10, quantidade: 0, porcao: 5 },
        { nome: "Queijo Coalho", preco: 15, quantidade: 0, porcao: 3 },
        { nome: "Coco Ralado", preco: 8, quantidade: 0, porcao: 4 },
        { nome: "Leite Condensado", preco: 12, quantidade: 0, porcao: 5 },
    ]);

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

            // LÓGICA DE ESTOQUE
            setIngredients((prevIngredients) => {
                const temEstoque = prevIngredients.every(ing => ing.quantidade > 0);

                if (!temEstoque) {
                    if (intervaloClientes.current) {
                        clearInterval(intervaloClientes.current);
                        intervaloClientes.current = null;

                        setIsTimerRunning(false);

                        setTempoRestante(0);

                        setShowOutOfStockPopup(true);

                        return prevIngredients;
                    }
                }

                // LÓGICA DE VENDA
                const novosIngredientes = prevIngredients.map(ing => ({
                    ...ing,
                    quantidade: ing.quantidade - 1
                }));

                setBudget(prevBudget => prevBudget + precoTapioca);

                const novoCliente = gerarCliente(bairro || "Centro");
                count++;
                setClientesHoje((prev) => prev + 1);
                setClientes((prev) => [...prev, novoCliente]);

                return novosIngredientes;
            });

        }, 800); // Intervalo entre clientes (em milissegundos)
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
        setDiaAtual((prev) => prev + 1);
        setTempoRestante(10);
        setIsTimerRunning(true);
        setTimeout(() => gerarFluxoDeClientes(), 100);
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
        newIngredients[index].quantidade += 1;
        setIngredients(newIngredients);
        setBudget(budget - item.preco);
    };

    const anyBought = ingredients.some((ing) => ing.quantidade > 0);

    const handleNextStep = () => {
        if (!anyBought) {
            alert("Compre pelo menos um ingrediente antes de continuar!");
            return;
        }
        setPopupStep(2);
    }

    const handleStartGame = () => {
        if (precoTapioca <= 0) {
            alert("Defina um preço maior do que 0!");
            return;
        }

        setShowPopup(false);
        setIsTimerRunning(true);
        setTimeout(() => gerarFluxoDeClientes(), 100);
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
                        className="bg-green-100 border border-green-400 px-4 py-2 rounded-xl text-sm font-semibold"
                    >
                        {item.nome} × {item.quantidade}
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <div className="font-pressStart w-screen h-screen flex flex-col bg-primaryWhite relative">
            <Header />

            {/* Conteúdo do jogo */}
            {!showPopup && (
                <div className="h-full flex flex-col justify-center items-center">
                    {/* Painel superior */}
                    <div className="w-full h-24 flex justify-around items-center">
                        {[
                            `Bairro: ${bairro}`,
                            `Orçamento: R$ ${budget}`,
                            `Dia: ${diaAtual}/${limiteDeDias}`,
                            `Tempo Restante: ${tempoRestante}`,
                        ].map((text, i) => (
                            <div
                                key={i}
                                className="relative inline-block bg-vibratingBlue text-black text-sm px-4 py-2 border-4 border-[#FFD700]
                                drop-shadow-[4px_0_#FFD700] drop-shadow-[-4px_0_#FFD700]
                                drop-shadow-[0_4px_#FFD700] drop-shadow-[0_-4px_#FFD700]
                                drop-shadow-[4px_4px_#FFD700] drop-shadow-[-4px_4px_#FFD700]
                                drop-shadow-[4px_-4px_#FFD700] drop-shadow-[-4px_-4px_#FFD700]
                                [clip-path:polygon(0_8px,8px_8px,8px_0,calc(100%-8px)_0,calc(100%-8px)_8px,100%_8px,100%_calc(100%-8px),calc(100%-8px)_calc(100%-8px),calc(100%-8px)_100%,8px_100%,8px_calc(100%-8px),0_calc(100%-8px))]
                                flex items-center justify-center"
                            >
                                {text}
                            </div>
                        ))}

                        {/* Botão de pausa */}
                        <button
                            onClick={togglePause}
                            className={`relative inline-block text-sm font-bold px-4 py-2 border-4 
                                ${isPaused ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"}
                                border-[#FFD700] text-white
                                drop-shadow-[2px_2px_#FFD700] [clip-path:polygon(0_8px,8px_8px,8px_0,calc(100%-8px)_0,calc(100%-8px)_8px,100%_8px,100%_calc(100%-8px),calc(100%-8px)_calc(100%-8px),calc(100%-8px)_100%,8px_100%,8px_calc(100%-8px),0_calc(100%-8px))]
                            `}
                        >
                            {isPaused ? "▶ Retomar" : "⏸ Pausar"}
                        </button>
                    </div>

                    <h1 className="text-2xl mt-4">Bem-vindo ao Jogo!</h1>

                    <div className="w-full max-w-lg mt-6">
                        <h2 className="text-lg mb-2">Ingredientes Comprados:</h2>
                        {showIngredients()}
                    </div>

                    <div className="text-center mt-6">
                        <h2 className="text-xl">👥 Clientes chegando...</h2>
                        <p className="text-lg mt-2">
                            Clientes atendidos hoje: <strong>{clientesHoje}</strong> / {clientesGerados || "??"}
                        </p>
                        {totalClientesDia > 0 && (
                            <p className="text-green-600 mt-2 font-bold">
                                Total de clientes hoje: {totalClientesDia}
                            </p>
                        )}
                    </div>

                    {/* Lista opcional para debug/visualização */}
                    <div className="mt-4 max-h-40 overflow-y-auto text-sm text-center">
                        {clientes.map((c, i) => (
                            <div key={i} className="border-b border-gray-300 py-1">
                                Cliente {i + 1}: {c.bairro.nome} — {c.bairro.preferenciaTapioca} — satisfação {c.satisfacao}%
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Popup inicial */}
            {showPopup && (
                <div className="absolute inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 text-black">
                    <div className="bg-white w-11/12 md:w-3/4 lg:w-2/3 min-h-[500px] rounded-2xl shadow-xl p-6 flex flex-col justify-between border-4 border-vibratingBlue">

                        {/* ETAPA 1: COMPRA DE INGREDIENTES */}
                        {popupStep === 1 && (
                            <>
                                <div>
                                    <h2 className="text-2xl text-center mb-4 font-bold">🛒 Fase 1: Estoque</h2>
                                    <div className="text-center mb-6 bg-yellow-100 p-2 rounded-lg">
                                        <p className="text-xl">💰 Orçamento: R$ {budget}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {ingredients.map((item, index) => (
                                            <div key={index} className="border-2 border-gray-200 rounded-xl p-3 text-center bg-gray-50 flex flex-col justify-between">
                                                <div>
                                                    <p className="font-bold text-sm mb-1">{item.nome}</p>
                                                    <p className="text-[10px] text-blue-600 font-bold mb-2 uppercase tracking-tight">
                                                        📦 Rende: {item.porcao} porções
                                                    </p>
                                                    <div className="bg-white rounded-lg py-2 mb-2 border border-gray-100">
                                                        <p className="text-xs">Preço: <span className="text-green-600 font-bold">R$ {item.preco}</span></p>
                                                        <p className="text-xs">No estoque: <strong>{item.quantidade}</strong></p>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => buyIngredient(index)}
                                                    className={`w-full px-3 py-2 rounded-lg text-[10px] font-bold transition-all ${budget >= item.preco
                                                            ? "bg-vibratingBlue text-white hover:scale-105 active:bg-blue-800"
                                                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                        }`}
                                                    disabled={budget < item.preco}
                                                >
                                                    {budget >= item.preco ? "+ COMPRAR" : "SALDO INSUF."}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <button
                                    onClick={handleNextStep}
                                    className="mt-6 px-6 py-3 bg-vibratingBlue text-white rounded-xl font-bold hover:bg-blue-700 transition"
                                >
                                    Definir Preço →
                                </button>
                            </>
                        )}

                        {/* ETAPA 2: DEFINIÇÃO DE PREÇO */}
                        {popupStep === 2 && (
                            <div className="flex flex-col items-center justify-center flex-1">
                                <h2 className="text-2xl text-center mb-6 font-bold">💰 Fase 2: Precificação</h2>
                                <p className="text-center mb-8 text-gray-600">
                                    Por quanto você vai vender cada tapioca no bairro <strong>{bairro}</strong>?
                                </p>

                                <div className="flex items-center gap-6 mb-10">
                                    <button
                                        onClick={() => setPrecoTapioca(Math.max(1, precoTapioca - 1))}
                                        className="w-12 h-12 bg-red-500 text-white rounded-full text-2xl font-bold"
                                    >-</button>

                                    <div className="text-center">
                                        <span className="text-4xl font-bold text-green-600">R$ {precoTapioca}</span>
                                        <p className="text-xs text-gray-400 mt-2">Preço por unidade</p>
                                    </div>

                                    <button
                                        onClick={() => setPrecoTapioca(precoTapioca + 1)}
                                        className="w-12 h-12 bg-green-500 text-white rounded-full text-2xl font-bold"
                                    >+</button>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setPopupStep(1)}
                                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold"
                                    >
                                        Voltar
                                    </button>
                                    <button
                                        onClick={handleStartGame}
                                        className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:animate-pulse"
                                    >
                                        Abrir Banquinha! 🚀
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Popup de ingredientes esgotados */}
            {showOutOfStockPopup && (
                <div className="absolute inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
                    <div className="bg-white rounded-2xl shadow-xl p-8 text-center w-96">
                        <h2 className="text-2xl mb-4">⚠️ Estoque Esgotado!</h2>
                        <p className="mb-6 font-pressStart text-xs leading-loose">
                            Você não tem mais ingredientes. As vendas foram encerradas mais cedo hoje!
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
                            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold"
                        >
                            Ver Resultados
                        </button>
                    </div>
                </div>
            )}

            {/* Popup de fim de dia */}
            {showEndOfDayPopup && (
                <div className="absolute inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
                    <div className="bg-white rounded-2xl shadow-xl p-8 text-center w-96">
                        <h2 className="text-2xl mb-4">🌙 Fim do dia {diaAtual}</h2>
                        <p className="mb-6">Você completou o dia! Pronto para o próximo?</p>
                        <button
                            onClick={nextDay}
                            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold"
                        >
                            Próximo Dia
                        </button>
                    </div>
                </div>
            )}

            {/* Popup de fim de jogo */}
            {showGameOverPopup && (
                <div className="absolute inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
                    <div className="bg-white rounded-2xl shadow-xl p-8 text-center w-96">
                        <h2 className="text-2xl mb-4">🎉 Fim do Jogo!</h2>
                        <p className="mb-6">
                            Você completou todos os {limiteDeDias} dias de jogo! <br />
                            Parabéns pelo seu desempenho!
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold"
                        >
                            Reiniciar Jogo
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
