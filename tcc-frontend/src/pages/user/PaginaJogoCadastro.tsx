import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { MapContainer, Marker, TileLayer, Tooltip } from 'react-leaflet';
import { useLocation, useNavigate } from 'react-router-dom';

import L from 'leaflet';

import Header from '../../components/Header';

interface Bairro {
  id: number;
  nome: string;
  pos: [number, number];
  descricao: string;
  focoPreco: string;
  expectativa: string;
}

const defaultIcon = L.icon({
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  tooltipAnchor: [1, -34],
  shadowSize: [41, 41],
});

const selectedIcon = L.icon({
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  tooltipAnchor: [1, -34],
  shadowSize: [41, 41],
});

const RECIFE_BOUNDS: L.LatLngBoundsExpression = [
  [-8.15, -34.97],
  [-8.0, -34.85],
];
const fixedZoom = 12;
const center: L.LatLngExpression = [-8.05, -34.9];

export default function PaginaJogoCadastro() {
  const location = useLocation();
  const navigate = useNavigate();
  const { tempoDeJogo } = (location.state as { tempoDeJogo?: string }) || {};

  const [bairros, setBairros] = useState<Bairro[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(true);
  const [selectedNeighborhood, setSelectedNeighborhood] =
    useState<Bairro | null>(null);

  useEffect(() => {
    const fetchBairros = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/bairro/lista');
        const data = await response.json();

        if (response.ok) {
          setBairros(data);
        } else {
          toast.error('Erro ao carregar dados dos bairros');
        }
      } catch (error) {
        console.error('Erro ao buscar bairros:', error);
        toast.error('Servidor offline');
      } finally {
        setLoading(false);
      }
    };

    fetchBairros();
  }, []);

  const handleContinue = () => setShowPopup(false);
  const handleGoBack = () => navigate('/JogoCadastro');

  const handleStartGame = async () => {
    if (!selectedNeighborhood) return;

    const loadingToast = toast.loading('Preparando sua barraca...');

    try {
      const response = await fetch(
        'http://127.0.0.1:5000/bairro/iniciar_jogo',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bairroId: selectedNeighborhood.id,
            tempoDeJogo: tempoDeJogo,
          }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        toast.success('Tudo pronto! Boa sorte!', { id: loadingToast });
        navigate(data.redirect_url, {
          state: { config: data.game_config },
        });
      } else {
        toast.error(data.error || 'Erro ao iniciar jogo', { id: loadingToast });
      }
    } catch (error) {
      console.error('Erro ao iniciar jogo:', error);
      toast.error('Erro de conexão com o servidor', { id: loadingToast });
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-y-auto bg-primaryWhite font-pressStart">
      <Toaster />
      <Header />

      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4 pb-20 pt-24 lg:flex-row">
        <div className="relative z-0 h-[60vh] w-full border-4 border-black bg-white shadow-[8px_8px_0px_rgba(0,0,0,1)] md:h-[70vh] lg:w-3/5">
          {loading ? (
            <div className="flex h-full w-full animate-pulse items-center justify-center bg-gray-100 text-[10px] md:text-xs">
              <p>Carregando mapa de Recife...</p>
            </div>
          ) : (
            !showPopup && (
              <MapContainer
                center={center}
                zoom={fixedZoom}
                style={{ width: '100%', height: '100%' }}
                maxBounds={RECIFE_BOUNDS}
                maxBoundsViscosity={1.0}
                minZoom={fixedZoom}
                maxZoom={fixedZoom}
                dragging={false}
                scrollWheelZoom={false}
              >
                <TileLayer
                  attribution="&copy; OpenStreetMap"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {bairros.map((bairro) => (
                  <Marker
                    key={bairro.id}
                    position={bairro.pos}
                    icon={
                      selectedNeighborhood?.id === bairro.id
                        ? selectedIcon
                        : defaultIcon
                    }
                    eventHandlers={{
                      click: () => setSelectedNeighborhood(bairro),
                    }}
                  >
                    <Tooltip
                      direction="top"
                      className="font-pressStart text-[10px]"
                    >
                      {bairro.nome}
                    </Tooltip>
                  </Marker>
                ))}
              </MapContainer>
            )
          )}
        </div>

        {!showPopup && (
          <div className="flex w-full flex-col items-center justify-center border-4 border-black bg-white p-6 text-center shadow-[8px_8px_0px_rgba(0,0,0,1)] md:p-8 lg:w-2/5">
            {selectedNeighborhood ? (
              <>
                <h2 className="mb-6 text-sm font-bold text-vibratingBlue drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] md:text-lg lg:text-xl">
                  {selectedNeighborhood.nome}
                </h2>

                <p className="mb-6 text-[10px] leading-loose text-textBlack md:text-xs">
                  {selectedNeighborhood.descricao}
                </p>

                <div className="mb-6 w-full space-y-4 border-4 border-black bg-lightGreen p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                  <p className="text-left text-[8px] text-textBlack md:text-[10px]">
                    <strong>💰 FOCO PREÇO:</strong>{' '}
                    {selectedNeighborhood.focoPreco}
                  </p>
                  <p className="text-left text-[8px] text-textBlack md:text-[10px]">
                    <strong>🎯 EXPECTATIVA:</strong>{' '}
                    {selectedNeighborhood.expectativa}
                  </p>
                </div>

                <button
                  onClick={handleStartGame}
                  className="w-full border-4 border-black bg-vibratingBlue px-6 py-4 text-[10px] font-bold text-primaryWhite shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)] md:text-xs"
                >
                  ABRIR TAPIOCARIA
                </button>
              </>
            ) : (
              <p className="w-full border-4 border-dashed border-gray-300 p-8 text-center text-[10px] text-gray-400 md:text-xs">
                Selecione um ponto no mapa para ver as estatísticas do bairro.
              </p>
            )}
          </div>
        )}
      </div>

      {showPopup && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 px-4">
          <div className="flex w-full max-w-2xl flex-col gap-6 border-4 border-black bg-primaryWhite p-8 text-center shadow-[8px_8px_0px_rgba(0,0,0,1)]">
            <h2 className="text-sm font-bold uppercase text-vibratingBlue drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] md:text-xl">
              Modo Selecionado
            </h2>

            <div className="text-[10px] uppercase leading-relaxed text-textBlack md:text-xs">
              {tempoDeJogo ? (
                tempoDeJogo.toLowerCase() === 'livre' ? (
                  <>
                    Você escolheu o modo{' '}
                    <strong className="text-vibratingBlue underline">
                      livre
                    </strong>
                    !
                    <hr className="my-6 border-2 border-dashed border-black" />
                    Nesse modo, você pode jogar sem limites de tempo — apenas
                    divirta-se, explore suas estratégias e veja até onde
                    consegue chegar como mestre das tapiocas!
                  </>
                ) : (
                  <>
                    Você escolheu{' '}
                    <strong className="text-vibratingBlue underline">
                      {tempoDeJogo}
                    </strong>{' '}
                    como tempo de jogo.
                    <hr className="my-6 border-2 border-dashed border-black" />
                    Durante esse período, seu objetivo é vender o maior número
                    possível de tapiocas e acumular a maior quantia de dinheiro
                    antes que o tempo acabe.
                    <br />
                    <br />
                    Boa sorte, vendedor(a)!
                  </>
                )
              ) : (
                'Nenhum modo de tempo foi detectado.'
              )}
            </div>

            <div className="mt-4 flex flex-col justify-center gap-4 sm:flex-row">
              <button
                onClick={handleGoBack}
                className="w-full border-4 border-black bg-crimsonRed px-6 py-4 text-[10px] font-bold uppercase text-primaryWhite shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none sm:w-1/2 md:text-xs"
              >
                Voltar
              </button>
              <button
                onClick={handleContinue}
                className="w-full border-4 border-black bg-lightGreen px-6 py-4 text-[10px] font-bold uppercase text-textBlack shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none sm:w-1/2 md:text-xs"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
