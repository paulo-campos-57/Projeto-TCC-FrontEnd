import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

import Header from '../../components/Header';
import { criarBairroComPreferencias } from '../../services/bairro.service';
import { criarPedidoPorPreferencia } from '../../services/pedido.service';
import type { Cliente } from '../../types/cliente.interface';

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
    { nome: 'Goma de Tapioca', preco: 10, quantidade: 0, porcao: 5 },
    { nome: 'Queijo Coalho', preco: 15, quantidade: 0, porcao: 3 },
    { nome: 'Coco Ralado', preco: 8, quantidade: 0, porcao: 4 },
    { nome: 'Leite Condensado', preco: 12, quantidade: 0, porcao: 5 },
  ]);

  // receita
  const [receita, setReceita] = useState<{ [key: string]: number }>({
    'Goma de Tapioca': 1,
    'Queijo Coalho': 0,
    'Coco Ralado': 0,
    'Leite Condensado': 0,
  });

  const alterarReceita = (nome: string, delta: number) => {
    setReceita((prev) => ({
      ...prev,
      [nome]: Math.max(0, (prev[nome] || 0) + delta),
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

  useEffect(() => {
    isTimerRunningRef.current = isTimerRunning;
  }, [isTimerRunning]);
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);
  useEffect(() => {
    tempoRestanteRef.current = tempoRestante;
  }, [tempoRestante]);

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
      if (
        isPausedRef.current ||
        !isTimerRunningRef.current ||
        tempoRestanteRef.current <= 0
      ) {
        return;
      }

      if (count >= total) {
        clearInterval(intervaloClientes.current!);
        intervaloClientes.current = null;
        setTotalClientesDia(total);
        return;
      }

      setIngredients((prevIngredients) => {
        const temEstoqueParaTudo = prevIngredients.every((ing) => {
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

        return prevIngredients.map((ing) => ({
          ...ing,
          quantidade: ing.quantidade - (receita[ing.nome] || 0),
        }));
      });

      setBudget((prev) => prev + precoTapioca);
      setFaturamentoHoje((prev) => prev + precoTapioca);
      const novoCliente = gerarCliente(bairro || 'Centro');
      setClientesHoje((prev) => prev + 1);
      setClientes((prev) => [...prev, novoCliente]);
      count++;
    }, 800); // intervalo em milissegundos entre clientes
  };

  // limite de dias baseado no tempoDeJogo
  const definirLimiteDeDias = () => {
    if (!tempoDeJogo) return 3;
    const valor = tempoDeJogo.toString().toLowerCase();
    if (valor.includes('semana')) return 7;
    if (valor.includes('15')) return 15;
    if (valor.includes('mês')) return 30;
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
          if (intervaloClientes.current)
            clearInterval(intervaloClientes.current);
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

    setGastoHoje((prev) => prev + item.preco);
  };

  const removeIngredient = (index: number) => {
    const item = ingredients[index];
    if (item.quantidade <= 0) return;

    const newIngredients = [...ingredients];
    newIngredients[index].quantidade -= item.porcao;
    setIngredients(newIngredients);
    setBudget((prev) => prev + item.preco);
    setGastoHoje((prev) => prev - item.preco);
  };

  const anyBought = ingredients.some((ing) => ing.quantidade > 0);

  const handleNextStep = () => {
    if (!anyBought) {
      alert('Compre pelo menos um ingrediente antes de continuar!');
      return;
    }
    setPopupStep((prev) => prev + 1);
  };

  const handleStartGame = () => {
    if (precoTapioca <= 0) {
      alert('Defina um preço maior do que 0!');
      return;
    }

    setShowPopup(false);
    setIsTimerRunning(true);
    gerarFluxoDeClientes();
  };

  const showIngredients = () => {
    const comprados = ingredients.filter((i) => i.quantidade > 0);
    if (comprados.length === 0) {
      return (
        <p className="text-gray-600">Nenhum ingrediente comprado ainda.</p>
      );
    }
    return (
      <ul className="mt-4 flex flex-wrap justify-center gap-3">
        {comprados.map((item, index) => (
          <li
            key={index}
            className={`${item.quantidade < 5 ? 'border-red-400 bg-red-100' : 'border-green-400 bg-green-100'} rounded-xl border px-4 py-2 text-sm font-semibold`}
          >
            {item.nome} × {item.quantidade}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-y-auto bg-primaryWhite font-pressStart">
      <Header />

      {/* Conteúdo do jogo */}
      {!showPopup && (
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-start px-4 pb-20 pt-24">
          {/* Painel superior */}
          <div className="mb-8 flex w-full flex-wrap justify-center gap-4">
            {[
              `Bairro: ${bairro}`,
              `Orçamento: R$ ${budget}`,
              `Dia: ${diaAtual}/${limiteDeDias}`,
              `Tempo Restante: ${tempoRestante}`,
            ].map((text, i) => (
              <div
                key={i}
                className="flex items-center justify-center border-4 border-black bg-vibratingBlue px-4 py-3 text-center text-[8px] font-bold uppercase text-primaryWhite shadow-[4px_4px_0px_rgba(0,0,0,1)] md:text-[10px]"
              >
                {text}
              </div>
            ))}

            {/* Botão de pausa */}
            <button
              onClick={togglePause}
              className={`border-4 border-black px-4 py-3 text-[8px] font-bold uppercase shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all duration-200 md:text-[10px] ${
                isPaused
                  ? 'bg-lightGreen text-textBlack hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)]'
                  : 'bg-crimsonRed text-primaryWhite hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)]'
              } `}
            >
              {isPaused ? '▶ RETOMAR' : '⏸ PAUSAR'}
            </button>
          </div>

          <h1 className="mb-8 mt-4 text-center text-sm font-bold uppercase text-textBlack drop-shadow-[2px_2px_0px_rgba(0,0,0,0.2)] md:text-xl">
            BEM-VINDO AO JOGO!
          </h1>

          <div className="mt-6 w-full max-w-2xl border-4 border-black bg-lightGreen p-6 shadow-[8px_8px_0px_rgba(0,0,0,1)]">
            <h2 className="mb-4 text-center text-[10px] font-bold uppercase text-primaryWhite drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] md:text-xs">
              Ingredientes Comprados:
            </h2>
            <div className="text-[8px] text-textBlack md:text-[10px]">
              {showIngredients()}
            </div>
          </div>

          <div className="mt-8 w-full max-w-2xl border-4 border-black bg-goldenYellow p-6 text-center shadow-[8px_8px_0px_rgba(0,0,0,1)]">
            <h2 className="mb-4 text-[10px] font-bold uppercase text-textBlack md:text-xs">
              👥 Clientes chegando...
            </h2>
            <p className="mt-2 text-[10px] uppercase text-textBlack md:text-xs">
              Atendidos hoje:{' '}
              <strong className="text-primaryWhite drop-shadow-[1px_1px_0px_rgba(0,0,0,1)]">
                {clientesHoje}
              </strong>{' '}
              / {clientesGerados || '??'}
            </p>
            {totalClientesDia > 0 && (
              <p className="mt-4 text-[10px] font-bold uppercase text-vibratingBlue drop-shadow-[1px_1px_0px_rgba(0,0,0,0.2)] md:text-xs">
                Total de clientes hoje: {totalClientesDia}
              </p>
            )}
          </div>

          {/* Lista para debug */}
          <div className="mt-8 max-h-40 w-full max-w-2xl overflow-y-auto border-4 border-black bg-primaryWhite p-4 text-center text-[8px] shadow-[4px_4px_0px_rgba(0,0,0,1)]">
            {clientes.map((c, i) => (
              <div
                key={i}
                className="border-b-4 border-black py-2 uppercase text-textBlack last:border-0"
              >
                Cliente {i + 1}: {c.bairro.nome} — {c.bairro.preferenciaTapioca}{' '}
                — satisfação {c.satisfacao}%
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Popup inicial */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <div className="flex max-h-[90vh] w-full max-w-4xl flex-col justify-between overflow-y-auto border-4 border-black bg-primaryWhite p-6 shadow-[8px_8px_0px_rgba(0,0,0,1)] md:p-8">
            {/* ETAPA 1: COMPRA DE INGREDIENTES */}
            {popupStep === 1 && (
              <>
                <div>
                  <h2 className="mb-6 text-center text-sm font-bold uppercase text-textBlack drop-shadow-[2px_2px_0px_rgba(0,0,0,0.2)] md:text-xl">
                    🛒 Fase 1: Estoque
                  </h2>
                  <div className="mb-8 border-4 border-black bg-goldenYellow p-4 text-center shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                    <p className="text-xs font-bold uppercase text-textBlack md:text-sm">
                      💰 Orçamento: R$ {budget}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {ingredients.map((item, index) => (
                      <div
                        key={index}
                        className="flex flex-col justify-between border-4 border-black bg-lightGreen p-4 text-center shadow-[4px_4px_0px_rgba(0,0,0,1)]"
                      >
                        <div>
                          <p className="mb-2 text-[10px] font-bold uppercase text-primaryWhite drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] md:text-xs">
                            {item.nome}
                          </p>
                          <p className="mb-4 text-[8px] font-bold uppercase text-textBlack md:text-[10px]">
                            📦 Rende: {item.porcao} porções
                          </p>
                          <div className="mb-4 border-4 border-black bg-primaryWhite py-3">
                            <p className="mb-2 text-[8px] font-bold uppercase text-textBlack md:text-[10px]">
                              Preço:{' '}
                              <span className="text-vibratingBlue drop-shadow-[1px_1px_0px_rgba(0,0,0,0.2)]">
                                R$ {item.preco}
                              </span>
                            </p>
                            <p className="text-[8px] font-bold uppercase text-textBlack md:text-[10px]">
                              No estoque:{' '}
                              <strong className="text-xs text-crimsonRed">
                                {item.quantidade}
                              </strong>
                            </p>
                          </div>
                        </div>

                        {/* Controles de compra e venda */}
                        <div className="mt-2 flex items-center justify-between gap-4">
                          <button
                            onClick={() => removeIngredient(index)}
                            disabled={item.quantidade <= 0}
                            className={`flex-1 border-4 border-black py-3 text-xs font-bold uppercase transition-all duration-200 md:text-sm ${
                              item.quantidade > 0
                                ? 'bg-crimsonRed text-primaryWhite shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)]'
                                : 'cursor-not-allowed bg-gray-400 text-gray-600 shadow-[4px_4px_0px_rgba(100,100,100,1)]'
                            }`}
                          >
                            -
                          </button>

                          <button
                            onClick={() => buyIngredient(index)}
                            disabled={budget < item.preco}
                            className={`flex-1 border-4 border-black py-3 text-xs font-bold uppercase transition-all duration-200 md:text-sm ${
                              budget >= item.preco
                                ? 'bg-lightGreen text-textBlack shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)]'
                                : 'cursor-not-allowed bg-gray-400 text-gray-600 shadow-[4px_4px_0px_rgba(100,100,100,1)]'
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
                  className="mt-8 w-full border-4 border-black bg-vibratingBlue px-6 py-4 text-[10px] font-bold uppercase text-primaryWhite shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)] md:text-xs"
                >
                  DEFINIR RECEITA →
                </button>
              </>
            )}

            {/* ETAPA 2: RECEITA */}
            {popupStep === 2 && (
              <div className="flex h-full flex-col">
                <h2 className="mb-4 text-center text-sm font-bold uppercase text-textBlack drop-shadow-[2px_2px_0px_rgba(0,0,0,0.2)] md:text-xl">
                  📋 Fase 2: Sua Receita
                </h2>
                <p className="mb-8 text-center text-[8px] uppercase leading-loose text-textBlack md:text-[10px]">
                  Quantas porções de cada item <br /> vai em cada tapioca?
                </p>

                <div className="flex-1 space-y-4 overflow-y-auto pr-2">
                  {ingredients
                    .filter((ing) => ing.quantidade > 0)
                    .map((ing, index) => (
                      <div
                        key={index}
                        className="flex flex-col items-center justify-between gap-4 border-4 border-black bg-primaryWhite p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)] sm:flex-row"
                      >
                        <div className="flex flex-col text-center sm:text-left">
                          <span className="mb-2 text-[10px] font-bold uppercase text-textBlack md:text-xs">
                            {ing.nome}
                          </span>
                          <span className="text-[8px] font-bold uppercase text-vibratingBlue">
                            Estoque: {ing.quantidade} un.
                          </span>
                        </div>

                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => alterarReceita(ing.nome, -1)}
                            className="h-10 w-10 border-4 border-black bg-crimsonRed text-sm font-bold text-primaryWhite shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)]"
                          >
                            -
                          </button>

                          <div className="flex w-16 flex-col items-center">
                            <span className="mb-1 text-sm font-bold leading-none text-textBlack md:text-base">
                              {receita[ing.nome] || 0}
                            </span>
                            <span className="text-center text-[6px] font-bold uppercase text-textBlack md:text-[8px]">
                              na tapioca
                            </span>
                          </div>

                          <button
                            onClick={() => alterarReceita(ing.nome, 1)}
                            disabled={
                              (receita[ing.nome] || 0) >= ing.quantidade
                            }
                            className={`h-10 w-10 border-4 border-black text-sm font-bold transition-all duration-200 ${
                              (receita[ing.nome] || 0) >= ing.quantidade
                                ? 'cursor-not-allowed bg-gray-400 text-gray-600 shadow-[2px_2px_0px_rgba(100,100,100,1)]'
                                : 'bg-lightGreen text-textBlack shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)]'
                            }`}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  {ingredients.filter((ing) => ing.quantidade > 0).length ===
                    0 && (
                    <p className="mt-10 border-4 border-black bg-primaryWhite p-4 text-center text-[10px] font-bold uppercase text-crimsonRed shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                      Você não comprou ingredientes!
                    </p>
                  )}
                </div>

                <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <button
                    onClick={() => setPopupStep(1)}
                    className="w-full border-4 border-black bg-goldenYellow px-6 py-4 text-[10px] font-bold uppercase text-textBlack shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)] sm:w-auto md:text-xs"
                  >
                    VOLTAR
                  </button>
                  <button
                    onClick={() => setPopupStep(3)} // Avança para o preço (Step 3)
                    className="w-full border-4 border-black bg-vibratingBlue px-8 py-4 text-[10px] font-bold uppercase text-primaryWhite shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)] sm:w-auto md:text-xs"
                  >
                    DEFINIR PREÇO →
                  </button>
                </div>
              </div>
            )}

            {/* ETAPA 3: DEFINIÇÃO DE PREÇO */}
            {popupStep === 3 && (
              <div className="flex flex-1 flex-col items-center justify-center py-10">
                <h2 className="mb-8 text-center text-sm font-bold uppercase text-textBlack drop-shadow-[2px_2px_0px_rgba(0,0,0,0.2)] md:text-xl">
                  💰 Fase 3: Precificação
                </h2>
                <p className="mb-12 text-center text-[8px] uppercase leading-loose text-textBlack md:text-[10px]">
                  Por quanto você vai vender <br /> cada tapioca no bairro{' '}
                  <br />{' '}
                  <strong className="text-vibratingBlue">{bairro}</strong>?
                </p>

                <div className="mb-16 flex items-center gap-8 border-4 border-black bg-primaryWhite p-8 shadow-[8px_8px_0px_rgba(0,0,0,1)]">
                  <button
                    onClick={() =>
                      setPrecoTapioca(Math.max(1, precoTapioca - 1))
                    }
                    className="h-12 w-12 border-4 border-black bg-crimsonRed text-xl font-bold text-primaryWhite shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)]"
                  >
                    -
                  </button>

                  <div className="min-w-[120px] text-center">
                    <span className="text-xl font-bold text-lightGreen drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] md:text-2xl">
                      R$ {precoTapioca}
                    </span>
                    <p className="mt-4 text-[8px] font-bold uppercase text-textBlack">
                      Por unidade
                    </p>
                  </div>

                  <button
                    onClick={() => setPrecoTapioca(precoTapioca + 1)}
                    className="h-12 w-12 border-4 border-black bg-lightGreen text-xl font-bold text-textBlack shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)]"
                  >
                    +
                  </button>
                </div>

                <div className="flex w-full flex-col justify-center gap-4 sm:flex-row">
                  <button
                    onClick={() => setPopupStep(2)}
                    className="w-full border-4 border-black bg-goldenYellow px-6 py-4 text-[10px] font-bold uppercase text-textBlack shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)] sm:w-auto md:text-xs"
                  >
                    VOLTAR
                  </button>
                  <button
                    onClick={handleStartGame}
                    className="w-full border-4 border-black bg-lightGreen px-8 py-4 text-[10px] font-bold uppercase text-textBlack shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)] sm:w-auto md:text-xs"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <div className="w-full max-w-md border-4 border-black bg-primaryWhite p-8 text-center shadow-[8px_8px_0px_rgba(0,0,0,1)]">
            <h2 className="mb-6 text-sm font-bold uppercase text-crimsonRed drop-shadow-[1px_1px_0px_rgba(0,0,0,0.2)] md:text-lg">
              ⚠️ ESTOQUE ESGOTADO!
            </h2>
            <p className="mb-8 font-pressStart text-[8px] uppercase leading-loose text-textBlack md:text-[10px]">
              Você não tem mais ingredientes. <br /> As vendas foram encerradas{' '}
              <br /> mais cedo hoje!
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
              className="w-full border-4 border-black bg-crimsonRed px-6 py-4 text-[10px] font-bold uppercase text-primaryWhite shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)] md:text-xs"
            >
              VER RESULTADOS
            </button>
          </div>
        </div>
      )}

      {/* Popup de fim de dia */}
      {showEndOfDayPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <div className="w-full max-w-md border-4 border-black bg-primaryWhite p-8 text-center shadow-[8px_8px_0px_rgba(0,0,0,1)]">
            <h2 className="mb-8 text-sm font-bold uppercase text-textBlack drop-shadow-[2px_2px_0px_rgba(0,0,0,0.2)] md:text-lg">
              🌙 BALANÇO DO DIA {diaAtual}
            </h2>

            <div className="mb-10 space-y-6 border-4 border-black bg-lightGreen p-6 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center justify-between border-b-4 border-black pb-4">
                <span className="text-[8px] font-bold uppercase text-textBlack md:text-[10px]">
                  Faturamento:
                </span>
                <span className="text-[10px] font-bold text-primaryWhite drop-shadow-[1px_1px_0px_rgba(0,0,0,1)] md:text-xs">
                  R$ {faturamentoHoje}
                </span>
              </div>

              <div className="flex items-center justify-between border-b-4 border-black pb-4">
                <span className="text-[8px] font-bold uppercase text-textBlack md:text-[10px]">
                  Gastos (Estoque):
                </span>
                <span className="text-[10px] font-bold text-crimsonRed drop-shadow-[1px_1px_0px_rgba(0,0,0,0.5)] md:text-xs">
                  R$ {gastoHoje}
                </span>
              </div>

              <div className="mt-4 flex flex-col gap-2 border-4 border-black bg-primaryWhite p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                <span className="text-[8px] font-bold uppercase text-textBlack md:text-[10px]">
                  Lucro Líquido:
                </span>
                <span
                  className={`mt-2 text-xs font-bold drop-shadow-[1px_1px_0px_rgba(0,0,0,0.2)] md:text-sm ${faturamentoHoje - gastoHoje >= 0 ? 'text-lightGreen' : 'text-crimsonRed'}`}
                >
                  R$ {faturamentoHoje - gastoHoje}
                </span>
              </div>
            </div>

            <button
              onClick={nextDay}
              className="w-full border-4 border-black bg-vibratingBlue px-6 py-4 text-[10px] font-bold uppercase text-primaryWhite shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)] md:text-xs"
            >
              PRÓXIMO DIA →
            </button>
          </div>
        </div>
      )}

      {/* Popup de fim de jogo */}
      {showGameOverPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <div className="w-full max-w-md border-4 border-black bg-primaryWhite p-8 text-center shadow-[8px_8px_0px_rgba(0,0,0,1)]">
            <h2 className="mb-6 text-sm font-bold uppercase text-vibratingBlue drop-shadow-[2px_2px_0px_rgba(0,0,0,0.2)] md:text-lg">
              🎉 FIM DO JOGO!
            </h2>
            <p className="mb-8 font-pressStart text-[8px] uppercase leading-loose text-textBlack md:text-[10px]">
              Você completou todos <br /> os {limiteDeDias} dias de jogo! <br />
              <br />
              Parabéns pelo seu <br /> desempenho!
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full border-4 border-black bg-goldenYellow px-6 py-4 text-[10px] font-bold uppercase text-textBlack shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)] md:text-xs"
            >
              REINICIAR JOGO
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
