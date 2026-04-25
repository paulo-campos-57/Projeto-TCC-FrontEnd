import { useEffect, useState } from 'react';

import { Trophy } from 'lucide-react';

import Header from '../../components/Header';
import {
  type RankingItem,
  resultadoService,
} from '../../services/resultado.service';

const BAIRROS_DISPONIVEIS = [
  'Casa Forte',
  'Recife Antigo',
  'Ibura',
  'Boa Viagem',
  'Várzea',
  'Areias',
];

export default function Ranking() {
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [filtroBairro, setFiltroBairro] = useState('');
  const [ordenarPor, setOrdenarPor] = useState('lucro');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRanking();
  }, [filtroBairro, ordenarPor]);

  const loadRanking = async () => {
    setLoading(true);
    try {
      const data = await resultadoService.obterRanking(
        filtroBairro,
        ordenarPor,
      );
      setRanking(data);
    } catch (err) {
      console.error('Erro ao carregar ranking:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primaryWhite font-pressStart text-textBlack">
      <Header />

      <div className="mx-auto max-w-5xl p-8 pt-24">
        <div className="mb-8 flex flex-col items-center justify-between gap-4 md:flex-row">
          <h1 className="flex items-center gap-4 text-xl text-vibratingBlue drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] md:text-2xl">
            <Trophy size={32} className="text-yellow-500" /> RANKING GLOBAL
          </h1>

          <div className="flex flex-wrap gap-4 text-[10px]">
            <select
              className="border-4 border-black bg-white p-2 shadow-[4px_4px_0px_rgba(0,0,0,1)] outline-none transition-all focus:translate-y-1 focus:shadow-none"
              value={filtroBairro}
              onChange={(e) => setFiltroBairro(e.target.value)}
            >
              <option value="">TODOS OS BAIRROS</option>
              {BAIRROS_DISPONIVEIS.map((bairro) => (
                <option key={bairro} value={bairro}>
                  {bairro.toUpperCase()}
                </option>
              ))}
            </select>

            <select
              className="border-4 border-black bg-white p-2 shadow-[4px_4px_0px_rgba(0,0,0,1)] outline-none transition-all focus:translate-y-1 focus:shadow-none"
              value={ordenarPor}
              onChange={(e) => setOrdenarPor(e.target.value)}
            >
              <option value="lucro">MELHOR LUCRO</option>
              <option value="satisfacao">MAIOR SATISFAÇÃO</option>
              <option value="faturamento">MAIOR FATURAMENTO</option>
            </select>
          </div>
        </div>

        <div className="overflow-hidden border-4 border-black bg-white shadow-[8px_8px_0px_rgba(0,0,0,1)]">
          <table className="w-full text-left">
            <thead className="bg-black text-[10px] text-white md:text-xs">
              <tr>
                <th className="border-r border-gray-700 p-4">POS</th>
                <th className="border-r border-gray-700 p-4">JOGADOR</th>
                <th className="border-r border-gray-700 p-4">BAIRRO</th>
                <th className="border-r border-gray-700 p-4">LUCRO</th>
                <th className="p-4">SATISF.</th>
              </tr>
            </thead>
            <tbody className="text-[10px] md:text-xs">
              {loading ? (
                <tr>
                  <td colSpan={5} className="animate-pulse p-10 text-center">
                    BUSCANDO RESULTADOS...
                  </td>
                </tr>
              ) : ranking.length > 0 ? (
                ranking.map((item) => (
                  <tr
                    key={`${item.nome}-${item.posicao}`}
                    className="border-b-4 border-black transition-colors hover:bg-lightGreen/20"
                  >
                    <td className="border-r-4 border-black bg-gray-50 p-4 font-bold">
                      {item.posicao}º
                    </td>
                    <td className="max-w-[150px] truncate border-r-4 border-black p-4">
                      {item.nome}
                    </td>
                    <td className="border-r-4 border-black p-4 text-gray-600">
                      {item.bairro}
                    </td>
                    <td className="border-r-4 border-black p-4 font-bold text-green-600">
                      R$ {item.lucro.toFixed(2)}
                    </td>
                    <td className="p-4 text-yellow-500">
                      {item.satisfacao.toFixed(1)}★
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-gray-400">
                    NENHUM DADO ENCONTRADO PARA ESTE FILTRO
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
