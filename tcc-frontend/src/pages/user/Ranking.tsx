import { useEffect, useState } from 'react';
import { resultadoService, type RankingItem } from '../../services/resultado.service';
import Header from '../../components/Header';
import { Trophy } from 'lucide-react';

const BAIRROS_DISPONIVEIS = [
    'Casa Forte',
    'Recife Antigo',
    'Ibura',
    'Boa Viagem',
    'Várzea',
    'Areias'
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

            <div className="pt-24 p-8 max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <h1 className="text-xl md:text-2xl text-vibratingBlue flex items-center gap-4 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                        <Trophy size={32} className="text-yellow-500" /> RANKING GLOBAL
                    </h1>

                    <div className="flex flex-wrap gap-4 text-[10px]">
                        <select
                            className="border-4 border-black p-2 outline-none bg-white shadow-[4px_4px_0px_rgba(0,0,0,1)] focus:translate-y-1 focus:shadow-none transition-all"
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
                            className="border-4 border-black p-2 outline-none bg-white shadow-[4px_4px_0px_rgba(0,0,0,1)] focus:translate-y-1 focus:shadow-none transition-all"
                            value={ordenarPor}
                            onChange={(e) => setOrdenarPor(e.target.value)}
                        >
                            <option value="lucro">MELHOR LUCRO</option>
                            <option value="satisfacao">MAIOR SATISFAÇÃO</option>
                            <option value="faturamento">MAIOR FATURAMENTO</option>
                        </select>
                    </div>
                </div>

                <div className="border-4 border-black bg-white shadow-[8px_8px_0px_rgba(0,0,0,1)] overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-black text-white text-[10px] md:text-xs">
                            <tr>
                                <th className="p-4 border-r border-gray-700">POS</th>
                                <th className="p-4 border-r border-gray-700">JOGADOR</th>
                                <th className="p-4 border-r border-gray-700">BAIRRO</th>
                                <th className="p-4 border-r border-gray-700">LUCRO</th>
                                <th className="p-4">SATISF.</th>
                            </tr>
                        </thead>
                        <tbody className="text-[10px] md:text-xs">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-10 text-center animate-pulse">
                                        BUSCANDO RESULTADOS...
                                    </td>
                                </tr>
                            ) : ranking.length > 0 ? (
                                ranking.map((item) => (
                                    <tr
                                        key={`${item.nome}-${item.posicao}`}
                                        className="border-b-4 border-black hover:bg-lightGreen/20 transition-colors"
                                    >
                                        <td className="p-4 font-bold bg-gray-50 border-r-4 border-black">
                                            {item.posicao}º
                                        </td>
                                        <td className="p-4 border-r-4 border-black truncate max-w-[150px]">
                                            {item.nome}
                                        </td>
                                        <td className="p-4 border-r-4 border-black text-gray-600">
                                            {item.bairro}
                                        </td>
                                        <td className="p-4 border-r-4 border-black text-green-600 font-bold">
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