import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import { Pencil, Save, Trash2, X } from 'lucide-react';

import Header from '../../components/Header';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

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
        const userRes = await fetch('https://tapiocaria-backend.onrender.com/user/me', {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = await userRes.json();

        if (userRes.ok) {
          setUser(userData.User);
          setEditNome(userData.User.nome);
          setEditEmail(userData.User.email);

          const statsRes = await fetch(
            `https://tapiocaria-backend.onrender.com/resultados/${userData.User.id}/estatisticas`,
            {
              method: 'GET',
              headers: { Authorization: `Bearer ${token}` },
            },
          );
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
        label: 'Lucro',
        data: stats?.graficos.lucro_por_partida || [],
        borderColor: '#2563eb',
        backgroundColor: '#2563eb',
        tension: 0.3,
        pointRadius: 4,
      },
    ],
  };

  const handleSave = async () => {
    const token = localStorage.getItem('token')?.replace(/"/g, '');
    const loadingToast = toast.loading('Salvando...');
    try {
      const response = await fetch('https://tapiocaria-backend.onrender.com/user/update_me', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
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
    if (!window.confirm('Excluir conta permanentemente?')) return;
    const token = localStorage.getItem('token')?.replace(/"/g, '');
    const loadingToast = toast.loading('Excluindo...');
    try {
      const response = await fetch(`https://tapiocaria-backend.onrender.com/user/delete`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        toast.success('Conta excluída.', { id: loadingToast });
        localStorage.clear();
        setTimeout(() => navigate('/'), 2000);
      }
    } catch (err) {
      toast.error('Erro ao excluir', { id: loadingToast });
    }
  };

  return (
    <>
      <Toaster />
      <div className="flex min-h-screen w-full flex-col bg-primaryWhite font-pressStart">
        <Header />
        
        {/* Container Principal: Coluna no mobile, Linha no desktop */}
        <div className="flex flex-1 flex-col pt-16 md:flex-row">
          
          {/* SEÇÃO PERFIL */}
          <div className="flex w-full flex-col items-center justify-center bg-lightGreen p-6 py-12 md:w-1/2 md:p-8">
            <div className="relative w-full max-w-md border-4 border-black bg-primaryWhite p-6 shadow-[6px_6px_0px_rgba(0,0,0,1)] md:p-8 md:shadow-[8px_8px_0px_rgba(0,0,0,1)]">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="absolute right-4 top-4 text-black hover:text-vibratingBlue"
              >
                {isEditing ? <X size={20} className="text-crimsonRed" /> : <Pencil size={20} />}
              </button>

              <h1 className="mb-6 text-center text-lg text-vibratingBlue drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] md:mb-8 md:text-2xl">
                Meu Perfil
              </h1>

              <div className="space-y-5">
                {loading ? (
                  <p className="animate-pulse text-center text-[10px]">Buscando dados...</p>
                ) : (
                  <>
                    <div className="space-y-2">
                      <p className="text-[8px] text-gray-500 md:text-[10px]">NOME:</p>
                      {isEditing ? (
                        <input
                          className="w-full border-4 border-black bg-white p-2 text-[10px] focus:outline-none md:text-xs"
                          value={editNome}
                          onChange={(e) => setEditNome(e.target.value)}
                        />
                      ) : (
                        <p className="break-words border-b-2 border-dashed border-black pb-1 text-[10px] md:text-sm">
                          {user?.nome}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <p className="text-[8px] text-gray-500 md:text-[10px]">E-MAIL:</p>
                      {isEditing ? (
                        <input
                          className="w-full border-4 border-black bg-white p-2 text-[10px] focus:outline-none md:text-xs"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                        />
                      ) : (
                        <p className="break-words border-b-2 border-dashed border-black pb-1 text-[10px] md:text-sm">
                          {user?.email}
                        </p>
                      )}
                    </div>

                    <div className="pt-4">
                      {isEditing ? (
                        <button
                          onClick={handleSave}
                          className="flex w-full items-center justify-center gap-2 border-4 border-black bg-vibratingBlue py-3 text-[10px] text-primaryWhite shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
                        >
                          <Save size={16} /> SALVAR
                        </button>
                      ) : (
                        <button
                          onClick={handleDelete}
                          className="flex w-full items-center justify-center gap-2 border-4 border-black bg-crimsonRed py-3 text-[10px] text-primaryWhite shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
                        >
                          <Trash2 size={16} /> EXCLUIR CONTA
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* SEÇÃO ESTATÍSTICAS */}
          <div className="flex w-full flex-col items-center border-t-4 border-black bg-primaryWhite p-6 py-12 md:w-1/2 md:border-l-4 md:border-t-0 md:p-8">
            <h1 className="mb-8 text-center text-lg text-vibratingBlue drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] md:text-3xl">
              Estatísticas
            </h1>

            {loading ? (
              <p className="animate-pulse text-[10px]">CARREGANDO...</p>
            ) : stats ? (
              <div className="w-full max-w-2xl space-y-6">
                {/* Cards de Stats - 2 colunas */}
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  {[
                    { label: 'LUCRO TOTAL', val: `R$ ${stats.geral.lucro_acumulado.toFixed(2)}`, color: 'text-green-600' },
                    { label: 'PARTIDAS', val: stats.geral.total_partidas, color: 'text-black' },
                    { label: 'SATISFAÇÃO', val: `${stats.geral.media_satisfacao}/10`, color: 'text-yellow-500' },
                    { label: 'RECORDE', val: `R$ ${stats.geral.melhor_lucro}`, color: 'text-blue-600' },
                  ].map((item, idx) => (
                    <div key={idx} className="border-4 border-black bg-white p-3 shadow-[3px_3px_0px_rgba(0,0,0,1)]">
                      <p className="mb-1 text-[7px] text-gray-500 md:text-[8px]">{item.label}</p>
                      <p className={`text-[10px] font-bold md:text-xs ${item.color}`}>{item.val}</p>
                    </div>
                  ))}
                </div>

                {/* Gráfico */}
                <div className="w-full border-4 border-black bg-white p-3 shadow-[4px_4px_0px_rgba(0,0,0,1)] md:p-4">
                  <p className="mb-4 text-center text-[8px] md:text-[10px]">EVOLUÇÃO FINANCEIRA</p>
                  <div className="h-48 w-full md:h-64">
                    <Line
                      data={chartData}
                      options={{
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                          x: { grid: { display: false }, ticks: { font: { size: 8 } } },
                          y: { ticks: { font: { size: 8 } } }
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-32 w-full items-center justify-center border-4 border-dashed border-black text-center text-[10px] text-gray-400">
                SEM PARTIDAS REGISTRADAS
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
