import { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';
import Header from '../../components/Header';
import {
  type RankingItem,
  resultadoService,
} from '../../services/resultado.service';
import Footer from '../../components/Footer';

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
      const data = await resultadoService.obterRanking(filtroBairro, ordenarPor);
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

      <div className="mx-auto max-w-5xl px-4 py-8 pt-24 md:px-8">
        <div className="mb-8 flex flex-col items-center justify-between gap-6 md:flex-row">
          <h1 className="flex items-center gap-3 text-sm text-vibratingBlue drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] md:gap-4 md:text-2xl">
            <Trophy className="h-6 w-6 text-yellow-500 md:h-8 md:w-8" />
            RANKING <span className="hidden sm:inline">GLOBAL</span>
          </h1>

          <div className="flex w-full flex-col gap-4 sm:flex-row sm:w-auto text-[8px] md:text-[10px]">
            <select
              className="w-full border-4 border-black bg-white p-2 shadow-[4px_4px_0px_rgba(0,0,0,1)] outline-none transition-all active:translate-y-1 active:shadow-none sm:w-48"
              value={filtroBairro}
              onChange={(e) => setFiltroBairro(e.target.value)}
            >
              <option value="">TODOS BAIRROS</option>
              {BAIRROS_DISPONIVEIS.map((bairro) => (
                <option key={bairro} value={bairro}>
                  {bairro.toUpperCase()}
                </option>
              ))}
            </select>

            <select
              className="w-full border-4 border-black bg-white p-2 shadow-[4px_4px_0px_rgba(0,0,0,1)] outline-none transition-all active:translate-y-1 active:shadow-none sm:w-48"
              value={ordenarPor}
              onChange={(e) => setOrdenarPor(e.target.value)}
            >
              <option value="lucro">MELHOR LUCRO</option>
              <option value="satisfacao">SATISFAÇÃO</option>
              <option value="faturamento">FATURAMENTO</option>
            </select>
          </div>
        </div>

        <div className="w-full overflow-x-auto border-4 border-black bg-white shadow-[6px_6px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_rgba(0,0,0,1)]">
          <table className="w-full min-w-[600px] text-left border-collapse">
            <thead className="bg-black text-[8px] text-white md:text-xs">
              <tr>
                <th className="p-3 md:p-4">POS</th>
                <th className="p-3 md:p-4">JOGADOR</th>
                <th className="p-3 md:p-4">BAIRRO</th>
                <th className="p-3 md:p-4">LUCRO</th>
                <th className="p-3 md:p-4">SATISF.</th>
              </tr>
            </thead>
            <tbody className="text-[8px] md:text-xs">
              {loading ? (
                <tr>
                  <td colSpan={5} className="animate-pulse p-10 text-center">
                    BUSCANDO...
                  </td>
                </tr>
              ) : ranking.length > 0 ? (
                ranking.map((item) => (
                  <tr
                    key={`${item.nome}-${item.posicao}`}
                    className="border-b-4 border-black transition-colors hover:bg-lightGreen/10"
                  >
                    <td className="border-r-4 border-black bg-gray-50 p-3 font-bold md:p-4">
                      {item.posicao}º
                    </td>
                    <td className="max-w-[120px] truncate border-r-4 border-black p-3 md:p-4">
                      {item.nome}
                    </td>
                    <td className="border-r-4 border-black p-3 text-gray-600 md:p-4">
                      {item.bairro}
                    </td>
                    <td className="border-r-4 border-black p-3 font-bold text-green-600 md:p-4">
                      R$ {item.lucro.toFixed(2)}
                    </td>
                    <td className="p-3 text-yellow-500 md:p-4">
                      {item.satisfacao.toFixed(1)}★
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-gray-400">
                    SEM DADOS
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-center text-[7px] text-gray-400 md:hidden italic">
          Arraste para o lado para ver mais →
        </p>
      </div>
      <Footer />
    </div>
  );
}