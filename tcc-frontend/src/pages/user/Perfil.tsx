import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Pencil, Save, X } from 'lucide-react';
import Header from '../../components/Header';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface UserData {
  nome: string;
  email: string;
  id?: string;
}

interface StatsData {
  geral: {
    total_partidas: number;
    lucro_acumulado: number;
    media_satisfacao: number;
    melhor_lucro: number;
  };
  graficos: {
    labels: string[];
    lucro_por_partida: number[];
    satisfacao_por_partida: number[];
  };
}

export default function Perfil() {
  const [user, setUser] = useState<UserData | null>(null);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editNome, setEditNome] = useState('');
  const [editEmail, setEditEmail] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token')?.replace(/"/g, '');
      if (!token) {
        navigate('/');
        return;
      }

      try {
        const userRes = await fetch('http://127.0.0.1:5000/user/me', {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = await userRes.json();

        if (userRes.ok) {
          console.log("Chamando estatísticas para o ID:", userData.User.id);
          setUser(userData.User);
          setEditNome(userData.User.nome);
          setEditEmail(userData.User.email);

          const statsRes = await fetch(`http://127.0.0.1:5000/resultados/${userData.User.id}/estatisticas`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
          });
          const statsData = await statsRes.json();
          if (statsRes.ok) setStats(statsData);
        }
      } catch (err) {
        toast.error('Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const chartData = {
    labels: stats?.graficos.labels || [],
    datasets: [
      {
        label: 'Lucro por Partida',
        data: stats?.graficos.lucro_por_partida || [],
        borderColor: '#2563eb',
        backgroundColor: '#2563eb',
        tension: 0.3,
      },
    ],
  };

  const handleSave = async () => {
    const token = localStorage.getItem('token')?.replace(/"/g, '');
    const loadingToast = toast.loading('Salvando alterações...');

    try {
      const response = await fetch('http://127.0.0.1:5000/user/update_me', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nome: editNome, email: editEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.User);
        localStorage.setItem('user', JSON.stringify(data.User));
        setIsEditing(false);
        toast.success('Perfil atualizado!', { id: loadingToast });
      } else {
        toast.error(data.error || 'Erro ao salvar', { id: loadingToast });
      }
    } catch (err) {
      toast.error('Erro de rede', { id: loadingToast });
    }
  };

  const handleDelete = async () => {
    if (!user?.id) {
      toast.error('ID do usuário não carregado.');
      return;
    }

    const confirmDelete = window.confirm('Tem certeza que deseja excluir sua conta? Esta ação é irreversível.');
    if (!confirmDelete) return;

    const token = localStorage.getItem('token')?.replace(/"/g, '');
    const loadingToast = toast.loading('Excluindo conta...');

    try {
      const response = await fetch(`http://127.0.0.1:5000/user/delete`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success('Conta excluída com sucesso.', { id: loadingToast });
        localStorage.clear();
        setTimeout(() => navigate('/'), 2000);
      } else {
        const data = await response.json();
        toast.error(data.error || 'Erro ao excluir conta', { id: loadingToast });
      }
    } catch (err) {
      toast.error('Erro de rede ao tentar excluir', { id: loadingToast });
    }
  };

  return (
    <>
      <Toaster />
      <div className="flex h-screen w-screen flex-col overflow-hidden bg-primaryWhite font-pressStart">
        <Header />
        <div className="flex flex-1 pt-16">
          <div className="flex h-full w-full flex-col items-center justify-center bg-lightGreen p-8 text-textBlack md:w-1/2">
            <div className="relative w-full max-w-md border-4 border-black bg-primaryWhite p-8 shadow-[8px_8px_0px_rgba(0,0,0,1)] transition-all">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="absolute right-4 top-4 text-black transition-all hover:-translate-y-1 hover:text-vibratingBlue active:translate-y-0"
              >
                {isEditing ? <X size={24} className="text-crimsonRed" /> : <Pencil size={24} />}
              </button>

              <h1 className="mb-8 text-center text-xl text-vibratingBlue drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] md:text-2xl">
                Perfil
              </h1>

              <div className="space-y-6">
                {loading ? (
                  <p className="animate-pulse text-center text-[10px] md:text-xs">Buscando...</p>
                ) : (
                  <>
                    <div>
                      <p className="mb-2 text-[10px] text-gray-700 md:text-xs">NOME:</p>
                      {isEditing ? (
                        <input
                          className="w-full border-4 border-black bg-white p-3 text-[10px] transition-colors focus:bg-gray-100 focus:outline-none md:text-xs"
                          value={editNome}
                          onChange={(e) => setEditNome(e.target.value)}
                        />
                      ) : (
                        <p className="break-words border-b-2 border-dashed border-black pb-1 text-xs md:text-sm">{user?.nome}</p>
                      )}
                    </div>

                    <div>
                      <p className="mb-2 text-[10px] text-gray-700 md:text-xs">E-MAIL:</p>
                      {isEditing ? (
                        <input
                          className="w-full border-4 border-black bg-white p-3 text-[10px] transition-colors focus:bg-gray-100 focus:outline-none md:text-xs"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                        />
                      ) : (
                        <p className="break-words border-b-2 border-dashed border-black pb-1 text-xs md:text-sm">{user?.email}</p>
                      )}
                    </div>

                    <div className="pt-4">
                      {!isEditing && (
                        <button
                          onClick={handleDelete}
                          className="flex w-full items-center justify-center gap-2 border-4 border-black bg-crimsonRed py-3 text-[10px] text-primaryWhite shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all hover:bg-red-600 active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)] md:text-xs"
                        >
                          <X size={16} />
                          EXCLUIR CONTA
                        </button>
                      )}

                      {isEditing && (
                        <button
                          onClick={handleSave}
                          className="flex w-full items-center justify-center gap-2 border-4 border-black bg-vibratingBlue py-3 text-[10px] text-primaryWhite shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all hover:bg-blue-600 active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)] md:text-xs"
                        >
                          <Save size={16} /> SALVAR ALTERAÇÕES
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="hidden h-full w-1/2 flex-col items-center overflow-y-auto border-l-4 border-black bg-primaryWhite p-8 text-textBlack md:flex">
            <h1 className="mb-8 text-center text-xl text-vibratingBlue drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] md:text-3xl">
              Estatísticas
            </h1>

            {loading ? (
              <p className="animate-pulse">CARREGANDO DADOS...</p>
            ) : stats ? (
              <div className="w-full space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="border-4 border-black p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                    <p className="text-[8px] text-gray-500">LUCRO TOTAL</p>
                    <p className="text-xs text-green-600">R$ {stats.geral.lucro_acumulado.toFixed(2)}</p>
                  </div>
                  <div className="border-4 border-black p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                    <p className="text-[8px] text-gray-500">PARTIDAS</p>
                    <p className="text-xs">{stats.geral.total_partidas}</p>
                  </div>
                  <div className="border-4 border-black p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                    <p className="text-[8px] text-gray-500">SATISFAÇÃO</p>
                    <p className="text-xs text-yellow-500">{stats.geral.media_satisfacao} / 10.0</p>
                  </div>
                  <div className="border-4 border-black p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                    <p className="text-[8px] text-gray-500">RECORDE</p>
                    <p className="text-xs">R$ {stats.geral.melhor_lucro}</p>
                  </div>
                </div>

                <div className="w-full border-4 border-black bg-white p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                  <p className="mb-4 text-center text-[10px]">EVOLUÇÃO FINANCEIRA</p>
                  <div className="h-64">
                    <Line data={chartData} options={{ maintainAspectRatio: false }} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-1/2 w-3/4 items-center justify-center border-4 border-dashed border-black p-4 text-center text-[10px] text-gray-400">
                NENHUMA PARTIDA REGISTRADA AINDA
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}