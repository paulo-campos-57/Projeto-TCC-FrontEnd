import { useEffect, useRef, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';

import Header from '../../components/Header';
import {
  atualizarReceita,
  avancarDia,
  comprarIngrediente,
  criarSessao,
  definirPreco,
  devolverIngrediente,
  encerrarSessao,
  processarDia,
} from '../../services/jogo.service';
import type {
  ItemCatalogo,
  ResultadoDia,
  SessaoSnapshot,
} from '../../services/jogo.service';

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
  if (v.includes('semana')) return 7;
  if (v.includes('15')) return 15;
  if (v.includes('mês')) return 30;
  return 3;
}

function labelDelta(delta: number): {
  emoji: string;
  texto: string;
  cor: string;
} {
  if (delta >= 4)
    return {
      emoji: '🌟',
      texto: 'PERFEITO',
      cor: 'bg-lightGreen text-textBlack',
    };
  if (delta >= 2)
    return { emoji: '✅', texto: 'BOM', cor: 'bg-lightGreen text-textBlack' };
  if (delta >= 0)
    return { emoji: '😐', texto: 'OK', cor: 'bg-goldenYellow text-textBlack' };
  if (delta >= -2)
    return { emoji: '⚠️', texto: 'RUIM', cor: 'bg-crimsonRed text-white' };
  return { emoji: '❌', texto: 'PÉSSIMO', cor: 'bg-crimsonRed text-white' };
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

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);
  useEffect(() => {
    clientesExibRef.current = clientesExibidos;
  }, [clientesExibidos]);
  useEffect(() => {
    estoqueLocalRef.current = estoqueLocal;
  }, [estoqueLocal]);
  useEffect(() => {
    receitaLocalRef.current = receitaLocal;
  }, [receitaLocal]);

  const clienteIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!config) return;
    (async () => {
      const t = toast.loading('Criando sessão...');
      try {
        const resp = await criarSessao(config.bairro.id, config.tempoDeJogo);
        setSessaoId(resp.sessao_id);
        setSessao(resp.sessao);
        setCatalogo(resp.catalogo);
        toast.dismiss(t);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Erro ao criar sessão.', {
          id: t,
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [config]);

  let totalDias = 3;

  if (!config) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 font-pressStart">
        <p className="text-sm">Erro: sessão não encontrada.</p>
        <button
          onClick={() => navigate('/JogoCadastro')}
          className="border-4 border-black bg-vibratingBlue px-6 py-2 text-xs text-white"
        >
          Voltar
        </button>
      </div>
    );
  }

  totalDias = limiteDias(config.tempoDeJogo);

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
    if (snapshot.dia_atual >= totalDias) setShowGameOverPopup(true);
    else setShowEndOfDayPopup(true);
  };

  const iniciarTimer = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = setInterval(() => {
      if (isPausedRef.current) return;
      setTempoRestante((prev) => {
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
      Object.keys(receita).forEach((nome) => {
        if ((receita[nome] ?? 0) > 0)
          novoEstoque[nome] = Math.max(
            0,
            (novoEstoque[nome] ?? 0) - (receita[nome] ?? 0),
          );
      });
      setEstoqueLocal(novoEstoque);
      estoqueLocalRef.current = novoEstoque;
    }, INTERVALO_CLIENTE_MS);
  };

  const handleStartGame = async () => {
    if (!sessaoId || !sessao) return;
    if (sessao.tapiocas_possiveis === 0) {
      toast.error('Estoque insuficiente para iniciar o dia!');
      return;
    }
    setIsProcessando(true);
    const t = toast.loading('Abrindo barraca...');
    try {
      const resultado = await processarDia(sessaoId);
      toast.dismiss(t);
      resultadoRef.current = resultado;
      setResultadoDia(resultado);
      setSessao(resultado.sessao);
      setGastoHoje(resultado.sessao.gasto_hoje);
      const estoqueInicial: Record<string, number> = {};
      sessao.estoque.forEach((i) => {
        estoqueInicial[i.nome] = i.quantidade;
      });
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
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao iniciar.', {
        id: t,
      });
    } finally {
      setIsProcessando(false);
    }
  };

  const handleFecharEstoqueEsgotado = () => {
    setShowEstoqueEsgotado(false);
    if (resultadoRef.current) abrirPopupFimDia(resultadoRef.current.sessao);
  };

  const nextDay = async () => {
    if (!sessaoId) return;
    setShowEndOfDayPopup(false);
    const t = toast.loading('Preparando próximo dia...');
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
      toast.error(e instanceof Error ? e.message : 'Erro ao avançar dia.', {
        id: t,
      });
    }
  };

  const handleComprar = async (nome: string) => {
    if (!sessaoId) return;
    try {
      const r = await comprarIngrediente(sessaoId, nome);
      setSessao((prev) =>
        prev
          ? {
              ...prev,
              budget: r.budget,
              gasto_hoje: r.gasto_hoje,
              estoque: prev.estoque.map((i) =>
                i.nome === nome ? { ...i, quantidade: r.quantidade } : i,
              ),
            }
          : prev,
      );
      setGastoHoje(r.gasto_hoje);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao comprar.');
    }
  };

  const handleDevolver = async (nome: string) => {
    if (!sessaoId) return;
    try {
      const r = await devolverIngrediente(sessaoId, nome);
      setSessao((prev) =>
        prev
          ? {
              ...prev,
              budget: r.budget,
              gasto_hoje: r.gasto_hoje,
              estoque: prev.estoque.map((i) =>
                i.nome === nome ? { ...i, quantidade: r.quantidade } : i,
              ),
            }
          : prev,
      );
      setGastoHoje(r.gasto_hoje);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao devolver.');
    }
  };

  const handleReceita = async (nome: string, delta: number) => {
    if (!sessaoId || !sessao) return;
    const nova = {
      ...sessao.receita,
      [nome]: Math.max(0, (sessao.receita[nome] ?? 0) + delta),
    };
    try {
      const r = await atualizarReceita(sessaoId, nova);
      setSessao((prev) =>
        prev
          ? { ...prev, receita: nova, tapiocas_possiveis: r.tapiocas_possiveis }
          : prev,
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro na receita.');
    }
  };

  const handlePreco = async (valor: number) => {
    if (!sessaoId) return;
    try {
      await definirPreco(sessaoId, valor);
      setSessao((prev) => (prev ? { ...prev, preco_tapioca: valor } : prev));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao definir preço.');
    }
  };

  const togglePause = () => {
    if (showSetupPopup || showEndOfDayPopup || showGameOverPopup) return;
    setIsPaused((p) => !p);
  };

  const sat = sessao?.satisfacao ?? 5;
  const satColor =
    sat >= 7
      ? 'text-lightGreen'
      : sat >= 4
        ? 'text-goldenYellow'
        : 'text-crimsonRed';

  const estoqueVisivelNaTela = showSetupPopup
    ? (sessao?.estoque ?? [])
    : (sessao?.estoque ?? []).map((ing) => ({
        ...ing,
        quantidade: estoqueLocal[ing.nome] ?? ing.quantidade,
      }));

  if (loading || !sessao) {
    return (
      <div className="flex h-screen items-center justify-center font-pressStart">
        <p className="animate-pulse text-xs">Carregando sessão...</p>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-y-auto bg-primaryWhite font-pressStart">
      <Toaster position="top-right" />
      <Header />

      {!showSetupPopup && (
        <div className="flex flex-1 flex-col gap-6 p-4 pb-8 pt-24">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {[
              { label: 'Bairro', value: config.bairro.nome },
              { label: 'Dia', value: `${sessao.dia_atual} / ${totalDias}` },
              { label: 'Tempo', value: `${tempoRestante}s` },
              { label: 'Caixa', value: `R$ ${sessao.budget.toFixed(2)}` },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex min-w-[110px] flex-1 flex-col items-center border-4 border-black bg-vibratingBlue px-5 py-3 text-primaryWhite shadow-[4px_4px_0px_rgba(0,0,0,1)]"
              >
                <span className="text-[8px] uppercase tracking-widest text-goldenYellow">
                  {label}
                </span>
                <span className="mt-1 text-[10px] font-bold md:text-xs">
                  {value}
                </span>
              </div>
            ))}
            <div className="flex min-w-[110px] flex-1 flex-col items-center border-4 border-black bg-textBlack px-5 py-3 text-primaryWhite shadow-[4px_4px_0px_rgba(0,0,0,1)]">
              <span className="text-[8px] uppercase tracking-widest text-goldenYellow">
                Satisfação
              </span>
              <span
                className={`mt-1 text-[10px] font-bold md:text-xs ${satColor}`}
              >
                {sat} / 10
              </span>
            </div>
            <button
              onClick={togglePause}
              className={`border-4 border-black px-6 py-4 text-[10px] font-bold shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all active:translate-y-1 active:shadow-none md:text-xs ${isPaused ? 'bg-lightGreen text-textBlack' : 'bg-crimsonRed text-primaryWhite'}`}
            >
              {isPaused ? '▶ RETOMAR' : '⏸ PAUSAR'}
            </button>
          </div>

          <div className="grid min-h-[300px] flex-1 grid-cols-1 gap-6 md:grid-cols-2">
            <div className="relative flex flex-col items-center justify-center gap-4 border-4 border-black bg-lightGreen p-6 shadow-[8px_8px_0px_rgba(0,0,0,1)]">
              <p className="absolute left-4 top-4 border-2 border-black bg-white px-2 py-1 text-[10px] font-bold text-textBlack md:text-xs">
                PREPARAÇÃO
              </p>
              <div className="mt-8 animate-bounce text-6xl drop-shadow-[4px_4px_0px_rgba(0,0,0,0.3)]">
                🍳
              </div>
              <p className="mt-2 border-2 border-black bg-white px-3 py-1 text-[10px] text-textBlack">
                Preço:{' '}
                <strong className="text-vibratingBlue">
                  R$ {sessao.preco_tapioca}
                </strong>
              </p>
              <div className="mt-2 flex flex-wrap justify-center gap-2">
                {estoqueVisivelNaTela
                  .filter((i) => i.quantidade > 0)
                  .map((i) => {
                    const porcao =
                      receitaLocal[i.nome] ?? sessao.receita[i.nome] ?? 0;
                    const critico = porcao > 0 && i.quantidade <= porcao * 3;
                    return (
                      <span
                        key={i.nome}
                        className={`border-2 px-2 py-1 text-[8px] font-bold transition-colors ${
                          critico
                            ? 'border-black bg-crimsonRed text-white shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                            : 'border-black bg-white text-textBlack shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                        }`}
                      >
                        {i.nome.split(' ')[0]} ×{i.quantidade}
                      </span>
                    );
                  })}
                {estoqueVisivelNaTela.every((i) => i.quantidade === 0) && (
                  <span className="animate-pulse border-2 border-black bg-crimsonRed px-2 py-1 text-[8px] font-bold text-primaryWhite">
                    SEM ESTOQUE!
                  </span>
                )}
              </div>
            </div>

            <div className="relative flex flex-col items-center justify-center gap-4 border-4 border-black bg-primaryWhite p-6 shadow-[8px_8px_0px_rgba(0,0,0,1)]">
              <p className="absolute left-4 top-4 border-2 border-black bg-vibratingBlue px-2 py-1 text-[10px] font-bold text-primaryWhite md:text-xs">
                FILA DE CLIENTES
              </p>
              <p className="mt-8 text-6xl font-bold text-vibratingBlue drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] md:text-8xl">
                {clientesExibidos}
              </p>
              <p className="text-[8px] font-bold text-textBlack md:text-[10px]">
                de {resultadoDia?.clientes_atendidos ?? '?'} previstos hoje
              </p>
              {(resultadoDia?.clientes_perdidos_preco ?? 0) > 0 && (
                <p className="border-2 border-black bg-crimsonRed px-2 py-1 text-[8px] font-bold text-primaryWhite md:text-[10px]">
                  {resultadoDia?.clientes_perdidos_preco} SAÍRAM PELO PREÇO
                </p>
              )}
              {(resultadoDia?.clientes_perdidos_receita ?? 0) > 0 && (
                <p className="border-2 border-black bg-crimsonRed px-2 py-1 text-[8px] font-bold text-primaryWhite md:text-[10px]">
                  {resultadoDia?.clientes_perdidos_receita} NÃO GOSTARAM DA
                  RECEITA
                </p>
              )}
              {resultadoDia?.mensagem && (
                <div className="mt-2 max-w-xs border-2 border-black bg-white p-3 text-center text-[8px] leading-relaxed shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                  {resultadoDia.mensagem}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/*popup de setup*/}
      {showSetupPopup && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="flex min-h-[520px] w-full max-w-2xl flex-col border-4 border-black bg-primaryWhite p-6 text-textBlack shadow-[12px_12px_0px_rgba(0,0,0,1)] md:p-8">
            <div className="mb-6 flex justify-center gap-3">
              {([1, 2, 3] as const).map((s) => (
                <div
                  key={s}
                  className={`h-4 border-2 border-black transition-all duration-300 ${popupStep >= s ? 'w-12 bg-vibratingBlue' : 'w-6 bg-white'}`}
                />
              ))}
            </div>

            {/* ETAPA 1 — estoque */}
            {popupStep === 1 && (
              <div className="flex flex-1 flex-col">
                <h2 className="mb-2 text-center text-sm font-bold text-vibratingBlue drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] md:text-base">
                  FASE 1 — ESTOQUE
                </h2>
                <p className="mb-4 text-center text-[8px] text-textBlack md:text-[10px]">
                  Bairro:{' '}
                  <strong className="border-b-2 border-dashed border-black pb-1">
                    {config.bairro.nome}
                  </strong>
                  {config.bairro.expectativa && (
                    <>
                      {' '}
                      · Expectativa:{' '}
                      <strong>{config.bairro.expectativa}</strong>
                    </>
                  )}
                </p>
                <div className="mb-6 flex flex-wrap items-stretch gap-3">
                  <div className="flex-1 border-4 border-black bg-goldenYellow py-3 text-center text-[10px] font-bold shadow-[4px_4px_0px_rgba(0,0,0,1)] md:text-xs">
                    ORÇAMENTO: R$ {sessao.budget.toFixed(2)}
                  </div>
                  {(sessao.fator_inflacao ?? 1) > 1 && (
                    <div className="flex flex-col justify-center border-4 border-black bg-crimsonRed px-4 py-3 text-center text-[8px] font-bold text-white shadow-[4px_4px_0px_rgba(0,0,0,1)] md:text-[10px]">
                      <span>⚠ INFLAÇÃO</span>
                      <span className="mt-1 border-2 border-black bg-white px-2 text-crimsonRed">
                        +{Math.round(((sessao.fator_inflacao ?? 1) - 1) * 100)}%
                        nos insumos
                      </span>
                    </div>
                  )}
                </div>
                <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
                  {catalogo.map((item) => {
                    const qtd =
                      sessao.estoque.find((e) => e.nome === item.nome)
                        ?.quantidade ?? 0;
                    const podeDevolver = qtd >= item.porcao;
                    return (
                      <div
                        key={item.nome}
                        className="flex flex-col gap-3 border-4 border-black bg-lightGreen/20 p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)]"
                      >
                        <div className="flex items-start justify-between">
                          <p className="text-[10px] font-bold md:text-xs">
                            {item.nome}
                          </p>
                          <p className="border border-black bg-vibratingBlue px-1 py-0.5 text-[8px] text-primaryWhite">
                            Rende {item.porcao} un
                          </p>
                        </div>
                        <div className="space-y-1 border-2 border-black bg-white px-3 py-2 text-[8px] md:text-[10px]">
                          <p>
                            Preço:{' '}
                            <strong className="text-lightGreen drop-shadow-[1px_1px_0px_rgba(0,0,0,1)]">
                              R$ {item.preco}
                            </strong>
                          </p>
                          <p>
                            Estoque: <strong>{qtd}</strong>
                          </p>
                        </div>
                        <div className="mt-auto flex gap-2">
                          <button
                            onClick={() => handleDevolver(item.nome)}
                            disabled={!podeDevolver}
                            className={`flex-1 border-2 border-black py-2 text-lg font-bold shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all active:translate-y-1 active:shadow-none ${podeDevolver ? 'bg-crimsonRed text-white' : 'cursor-not-allowed bg-gray-300 text-gray-500'}`}
                          >
                            −
                          </button>
                          <button
                            onClick={() => handleComprar(item.nome)}
                            disabled={sessao.budget < item.preco}
                            className={`flex-1 border-2 border-black py-2 text-lg font-bold shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all active:translate-y-1 active:shadow-none ${sessao.budget >= item.preco ? 'bg-lightGreen text-textBlack' : 'cursor-not-allowed bg-gray-300 text-gray-500'}`}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <button
                  onClick={() => {
                    if (!sessao.estoque.some((i) => i.quantidade > 0)) {
                      toast.error('Compre pelo menos um ingrediente!');
                      return;
                    }
                    setPopupStep(2);
                  }}
                  className="mt-6 w-full border-4 border-black bg-vibratingBlue py-4 text-[10px] font-bold text-white shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all active:translate-y-1 active:shadow-none md:text-xs"
                >
                  DEFINIR RECEITA →
                </button>
              </div>
            )}

            {/* ETAPA 2 — receita */}
            {popupStep === 2 && (
              <div className="flex flex-1 flex-col">
                <h2 className="mb-2 text-center text-sm font-bold text-vibratingBlue drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] md:text-base">
                  FASE 2 — RECEITA
                </h2>
                <p className="mb-6 text-center text-[8px] text-textBlack md:text-[10px]">
                  Porções por tapioca
                </p>
                <div className="mb-6 flex-1 space-y-4 overflow-y-auto pr-2">
                  {sessao.estoque
                    .filter((i) => i.quantidade > 0)
                    .map((ing) => (
                      <div
                        key={ing.nome}
                        className="flex items-center justify-between border-4 border-black bg-white p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)]"
                      >
                        <div>
                          <p className="text-[10px] font-bold md:text-xs">
                            {ing.nome}
                          </p>
                          <p className="mt-1 text-[8px] font-bold text-vibratingBlue md:text-[10px]">
                            Estoque total: {ing.quantidade}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleReceita(ing.nome, -1)}
                            className="h-10 w-10 border-2 border-black bg-crimsonRed font-bold text-white shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all active:translate-y-1 active:shadow-none"
                          >
                            −
                          </button>
                          <div className="flex w-10 flex-col items-center">
                            <span className="text-lg font-bold leading-none md:text-xl">
                              {sessao.receita[ing.nome] ?? 0}
                            </span>
                            <span className="text-[7px] font-bold uppercase text-textBlack">
                              un.
                            </span>
                          </div>
                          <button
                            onClick={() => handleReceita(ing.nome, 1)}
                            disabled={
                              (sessao.receita[ing.nome] ?? 0) >= ing.quantidade
                            }
                            className={`h-10 w-10 border-2 border-black font-bold shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all active:translate-y-1 active:shadow-none ${
                              (sessao.receita[ing.nome] ?? 0) >= ing.quantidade
                                ? 'cursor-not-allowed bg-gray-300 text-gray-500'
                                : 'bg-lightGreen text-textBlack'
                            }`}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
                <div className="mb-6 border-4 border-black bg-lightGreen px-4 py-3 text-center text-[8px] font-bold shadow-[4px_4px_0px_rgba(0,0,0,1)] md:text-[10px]">
                  Esta receita rende{' '}
                  <strong className="ml-1 border-2 border-black bg-vibratingBlue px-2 py-0.5 text-white drop-shadow-[1px_1px_0px_rgba(0,0,0,1)]">
                    {sessao.tapiocas_possiveis} TAPIOCAS
                  </strong>
                </div>
                <div className="mt-auto flex flex-col gap-4 sm:flex-row">
                  <button
                    onClick={() => setPopupStep(1)}
                    className="flex-1 border-4 border-black bg-crimsonRed py-4 text-[10px] font-bold text-white shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all active:translate-y-1 active:shadow-none md:text-xs"
                  >
                    ← VOLTAR
                  </button>
                  <button
                    onClick={() => setPopupStep(3)}
                    className="flex-1 border-4 border-black bg-vibratingBlue py-4 text-[10px] font-bold text-white shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all active:translate-y-1 active:shadow-none md:text-xs"
                  >
                    DEFINIR PREÇO →
                  </button>
                </div>
              </div>
            )}

            {/* ETAPA 3 — preço */}
            {popupStep === 3 && (
              <div className="flex flex-1 flex-col items-center justify-center gap-6">
                <h2 className="text-center text-sm font-bold text-vibratingBlue drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] md:text-base">
                  FASE 3 — PRECIFICAÇÃO
                </h2>
                {config.bairro.focoPreco && (
                  <div className="max-w-xs border-4 border-black bg-white px-4 py-3 text-center text-[8px] leading-relaxed shadow-[4px_4px_0px_rgba(0,0,0,1)] md:text-[10px]">
                    Foco em <strong>{config.bairro.nome}</strong>:
                    <br />
                    <span className="mt-1 block font-bold text-vibratingBlue underline">
                      {config.bairro.focoPreco}
                    </span>
                  </div>
                )}

                {/* preço do dia anterior */}
                {sessao.preco_dia_anterior !== null &&
                  sessao.preco_dia_anterior !== undefined && (
                    <div className="flex w-full max-w-xs items-center justify-center gap-3 border-4 border-black bg-goldenYellow px-4 py-3 text-[8px] font-bold shadow-[4px_4px_0px_rgba(0,0,0,1)] md:text-[10px]">
                      <span>📌 ONTEM VOCÊ COBROU</span>
                      <span className="border-2 border-black bg-white px-3 py-1 text-textBlack shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                        R$ {sessao.preco_dia_anterior}
                      </span>
                    </div>
                  )}
                <p className="max-w-sm border-b-2 border-dashed border-black pb-2 text-center text-[8px] text-textBlack md:text-[10px]">
                  O preço impacta a satisfação e quantos clientes compram.
                </p>
                <div className="my-4 flex items-center gap-6 border-4 border-black bg-gray-100 p-6 shadow-[8px_8px_0px_rgba(0,0,0,1)]">
                  <button
                    onClick={() =>
                      handlePreco(Math.max(1, sessao.preco_tapioca - 1))
                    }
                    className="h-14 w-14 border-4 border-black bg-crimsonRed text-2xl font-bold text-white shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all active:translate-y-1 active:shadow-none"
                  >
                    −
                  </button>
                  <div className="min-w-[120px] text-center">
                    <span className="text-3xl font-bold text-lightGreen drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] md:text-5xl">
                      R$ {sessao.preco_tapioca}
                    </span>
                    <p className="mt-2 border-2 border-black bg-white py-1 text-[8px] font-bold text-textBlack md:text-[10px]">
                      POR UNIDADE
                    </p>
                  </div>
                  <button
                    onClick={() => handlePreco(sessao.preco_tapioca + 1)}
                    className="h-14 w-14 border-4 border-black bg-lightGreen text-2xl font-bold text-textBlack shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all active:translate-y-1 active:shadow-none"
                  >
                    +
                  </button>
                </div>
                <div className="w-full max-w-sm border-4 border-black bg-goldenYellow px-6 py-3 text-center text-[8px] font-bold shadow-[4px_4px_0px_rgba(0,0,0,1)] md:text-[10px]">
                  RECEITA MÁX. POTENCIAL:
                  <br />
                  <strong className="mt-2 inline-block border-2 border-black bg-white px-2 py-0.5 text-textBlack">
                    R${' '}
                    {(sessao.tapiocas_possiveis * sessao.preco_tapioca).toFixed(
                      2,
                    )}
                  </strong>
                </div>
                <div className="mt-auto flex w-full flex-col gap-4 sm:flex-row">
                  <button
                    onClick={() => setPopupStep(2)}
                    className="flex-1 border-4 border-black bg-crimsonRed py-4 text-[10px] font-bold text-white shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all active:translate-y-1 active:shadow-none md:text-xs"
                  >
                    ← VOLTAR
                  </button>
                  <button
                    onClick={handleStartGame}
                    disabled={isProcessando}
                    className={`flex-[2] border-4 border-black py-4 text-[10px] font-bold text-textBlack shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all active:translate-y-1 active:shadow-none md:text-xs ${isProcessando ? 'cursor-not-allowed bg-gray-400' : 'bg-lightGreen'}`}
                  >
                    {isProcessando ? 'ABRINDO...' : 'ABRIR BARRACA! 🚀'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/*popup de estoque esgotado*/}
      {showEstoqueEsgotado && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-sm border-4 border-black bg-primaryWhite p-8 text-center text-textBlack shadow-[12px_12px_0px_rgba(0,0,0,1)]">
            <p className="mb-4 text-5xl drop-shadow-[4px_4px_0px_rgba(0,0,0,0.3)]">
              📦
            </p>
            <h2 className="mb-4 text-sm font-bold text-crimsonRed drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] md:text-base">
              ESTOQUE ESGOTADO!
            </h2>
            <p className="mb-4 border-y-2 border-dashed border-black py-4 text-[10px] font-bold leading-relaxed md:text-xs">
              Seus ingredientes acabaram antes do fim do dia.
            </p>
            <p className="mb-8 border-4 border-black bg-gray-100 p-4 text-[10px] leading-relaxed shadow-[4px_4px_0px_rgba(0,0,0,1)] md:text-xs">
              Foram atendidos{' '}
              <strong className="mt-2 block text-sm text-vibratingBlue">
                {resultadoDia?.clientes_atendidos ?? 0} /{' '}
                {resultadoDia?.clientes_totais ?? 0}
              </strong>
            </p>
            <button
              onClick={handleFecharEstoqueEsgotado}
              className="w-full border-4 border-black bg-goldenYellow py-4 text-[10px] font-bold text-textBlack shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all active:translate-y-1 active:shadow-none md:text-xs"
            >
              VER BALANÇO DO DIA
            </button>
          </div>
        </div>
      )}

      {/*popup de fim de dia*/}
      {showEndOfDayPopup && resultadoDia && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/85 p-4">
          <div className="flex h-fit w-full max-w-5xl flex-col overflow-hidden border-4 border-black bg-primaryWhite p-6 text-center text-textBlack shadow-[12px_12px_0px_rgba(0,0,0,1)] md:p-10">
            <h2 className="mb-8 inline-block self-center border-4 border-black bg-white px-6 py-2 text-sm font-bold uppercase text-vibratingBlue drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] md:text-base">
              BALANÇO — DIA {sessao.dia_atual}
            </h2>

            <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'PREÇO', delta: resultadoDia.delta_preco },
                    { label: 'RECEITA', delta: resultadoDia.delta_receita },
                  ].map(({ label, delta }) => {
                    const { emoji, texto, cor } = labelDelta(delta);
                    return (
                      <div
                        key={label}
                        className={`flex flex-col items-center border-4 border-black p-3 shadow-[4px_4px_0px_rgba(0,0,0,1)] ${cor}`}
                      >
                        <span className="text-[8px] font-bold uppercase tracking-tighter">
                          {label}
                        </span>
                        <span className="my-1 text-2xl">{emoji}</span>
                        <span className="text-[10px] font-bold">{texto}</span>
                        <span className="text-[9px] opacity-70">
                          {delta > 0 ? `+${delta}` : delta} pts
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="min-h-[120px] flex-1 overflow-y-auto border-4 border-black bg-white p-5 text-left text-[10px] font-bold italic leading-relaxed shadow-[4px_4px_0px_rgba(0,0,0,1)] md:text-xs">
                  <span className="mr-2 text-base">💬</span>{' '}
                  {resultadoDia.mensagem}
                </div>
              </div>

              <div className="flex flex-col justify-between space-y-4 border-4 border-black bg-gray-100 p-5 shadow-[inset_4px_4px_0px_rgba(0,0,0,0.1)]">
                <div className="space-y-3">
                  {[
                    {
                      label: 'Faturamento',
                      value: `R$ ${resultadoDia.lucro.toFixed(2)}`,
                      color: 'text-lightGreen',
                    },
                    {
                      label: 'Gastos estoque',
                      value: `R$ ${gastoHoje.toFixed(2)}`,
                      color: 'text-crimsonRed',
                    },
                    {
                      label: 'Clientes Atendidos',
                      value: `${resultadoDia.clientes_atendidos} / ${resultadoDia.clientes_totais}`,
                      color: 'text-vibratingBlue',
                    },
                  ].map(({ label, value, color }) => (
                    <div
                      key={label}
                      className="flex items-center justify-between border-b-2 border-dashed border-black pb-2"
                    >
                      <span className="text-[9px] font-bold uppercase md:text-[10px]">
                        {label}
                      </span>
                      <span
                        className={`border-2 border-black bg-white px-2 py-0.5 text-xs font-bold ${color}`}
                      >
                        {value}
                      </span>
                    </div>
                  ))}
                </div>

                {resultadoDia.estoque_esgotado && (
                  <div className="border-2 border-black bg-crimsonRed py-2 text-center text-[9px] font-bold uppercase text-white shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                    ⚠ Estoque Esgotado antes da hora
                  </div>
                )}

                <div className="mt-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between border-4 border-black bg-white p-3 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                    <span className="text-[10px] font-bold uppercase">
                      LUCRO LÍQUIDO
                    </span>
                    <span
                      className={`text-sm font-bold drop-shadow-[1px_1px_0px_rgba(0,0,0,0.2)] ${resultadoDia.lucro - gastoHoje >= 0 ? 'text-lightGreen' : 'text-crimsonRed'}`}
                    >
                      R$ {(resultadoDia.lucro - gastoHoje).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-4 border-black bg-white p-3 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                    <span className="text-[10px] font-bold uppercase">
                      SATISFAÇÃO
                    </span>
                    <span className="text-xs font-bold">
                      {sat}/10{' '}
                      <span
                        className={
                          resultadoDia.satisfacao_delta >= 0
                            ? 'text-lightGreen'
                            : 'text-crimsonRed'
                        }
                      >
                        (
                        {resultadoDia.satisfacao_delta > 0
                          ? `+${resultadoDia.satisfacao_delta}`
                          : resultadoDia.satisfacao_delta}
                        )
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={nextDay}
              className="w-full border-4 border-black bg-lightGreen py-5 text-xs font-bold uppercase text-textBlack shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-1 active:translate-y-1 active:shadow-none md:text-sm"
            >
              Próximo Dia →
            </button>
          </div>
        </div>
      )}

      {/*popup de fim de jogo*/}
      {showGameOverPopup && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md border-4 border-black bg-primaryWhite p-8 text-center text-textBlack shadow-[12px_12px_0px_rgba(0,0,0,1)]">
            <p className="mb-4 text-5xl drop-shadow-[4px_4px_0px_rgba(0,0,0,0.3)]">
              🎉
            </p>
            <h2 className="mb-6 text-sm font-bold text-vibratingBlue drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] md:text-lg">
              FIM DE EXPEDIENTE!
            </h2>
            <div className="mb-8 space-y-4 border-4 border-black bg-gray-100 p-6 shadow-[inset_4px_4px_0px_rgba(0,0,0,0.1)]">
              <p className="border-b-2 border-dashed border-black pb-4 text-[8px] font-bold leading-relaxed md:text-[10px]">
                Você completou {totalDias} dias em
                <br />
                <strong className="mt-2 block border-2 border-black bg-white py-1 text-xs text-vibratingBlue md:text-sm">
                  {config.bairro.nome}
                </strong>
              </p>
              <p className="flex items-center justify-between pt-2 text-[8px] font-bold uppercase md:text-[10px]">
                Satisfação Final:
                <strong className="border-2 border-black bg-gray-800 px-3 py-1 text-xs text-white">
                  <span className={satColor}>{sat}</span> / 10
                </strong>
              </p>
            </div>
            <div className="flex w-full flex-col justify-center gap-4 sm:flex-row">
              <button
                onClick={async () => {
                  try {
                    if (sessaoId) await encerrarSessao(sessaoId);
                  } catch (e) {
                    console.error(e);
                  }
                  navigate('/JogoCadastro');
                }}
                className="flex-1 border-4 border-black bg-crimsonRed py-4 text-[10px] font-bold text-white shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all active:translate-y-1 active:shadow-none md:text-xs"
              >
                MENU
              </button>
              <button
                onClick={async () => {
                  try {
                    if (sessaoId) await encerrarSessao(sessaoId);
                  } catch (e) {
                    console.error(e);
                  }
                  window.location.reload();
                }}
                className="flex-[2] border-4 border-black bg-vibratingBlue py-4 text-[10px] font-bold text-white shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all active:translate-y-1 active:shadow-none md:text-xs"
              >
                JOGAR DE NOVO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
