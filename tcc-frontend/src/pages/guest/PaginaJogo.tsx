import { useState } from 'react';
import { MapContainer, Marker, TileLayer, Tooltip } from 'react-leaflet';
import { useLocation, useNavigate } from 'react-router-dom';

import L from 'leaflet';

import Header from '../../components/Header';
import type { BairroMapa } from '../../types/bairro-mapa.interface';

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

export default function PaginaJogo() {
  const location = useLocation();
  const navigate = useNavigate();
  const { tempoDeJogo } = (location.state as { tempoDeJogo?: string }) || {};

  const [showPopup, setShowPopup] = useState(true);
  const [selectedNeighborhood, setSelectedNeighborhood] =
    useState<BairroMapa | null>(null);

  const handleContinue = () => setShowPopup(false);
  const handleGoBack = () => navigate('/JogoConvidado');

  const handleNeighborhoodSelect = (bairro: BairroMapa) => {
    setSelectedNeighborhood(bairro);
  };

  const handleStartGame = () => {
    if (selectedNeighborhood) {
      navigate('/TelaDeJogo', {
        state: {
          bairro: selectedNeighborhood.nome,
          tempoDeJogo,
        },
      });
    }
  };

  const bairros: BairroMapa[] = [
    {
      nome: 'Casa Forte',
      pos: [-8.0305, -34.9235],
      descricao:
        'Bairro tradicional e arborizado, conhecido por sua tranquilidade e charme histórico.',
      focoPreco: 'Alto',
      expectativa: 'Gourmet e Sofisticada',
    },
    {
      nome: 'Recife Antigo',
      pos: [-8.0628, -34.8713],
      descricao:
        'Centro histórico da cidade, repleto de cultura, arte e vida noturna animada.',
      focoPreco: 'Moderado a Alto',
      expectativa: 'Criativa e Rápida',
    },
    {
      nome: 'Ibura',
      pos: [-8.1265, -34.9378],
      descricao:
        'Região popular e vibrante, com forte senso de comunidade e vida cotidiana intensa.',
      focoPreco: 'Baixo',
      expectativa: 'Familiar e Econômica',
    },
    {
      nome: 'Boa Viagem',
      pos: [-8.1198, -34.9023],
      descricao:
        'Área nobre à beira-mar, famosa por sua praia e comércio movimentado.',
      focoPreco: 'Moderado a Alto',
      expectativa: 'Saudável e Turística',
    },
    {
      nome: 'Várzea',
      pos: [-8.0443, -34.9512],
      descricao:
        'Bairro universitário e residencial, com atmosfera calma e verde.',
      focoPreco: 'Moderado',
      expectativa: 'Variada e Estudantil',
    },
    {
      nome: 'Areias',
      pos: [-8.0916, -34.9367],
      descricao:
        'Zona urbana popular, com comércio diversificado e moradores acolhedores.',
      focoPreco: 'Moderado a Baixo',
      expectativa: 'Tradicional e Caseira',
    },
  ];

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-y-auto bg-primaryWhite font-pressStart">
      <Header />

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center gap-8 px-4 pb-20 pt-24 lg:flex-row">
        <div className="z-0 h-[50vh] w-full border-4 border-black bg-primaryWhite shadow-[8px_8px_0px_rgba(0,0,0,1)] lg:h-[70vh] lg:w-3/5">
          {!showPopup && (
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
              doubleClickZoom={false}
              touchZoom={false}
              boxZoom={false}
              keyboard={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contribuidores'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {bairros.map((bairro) => (
                <Marker
                  key={bairro.nome}
                  position={bairro.pos as L.LatLngExpression}
                  icon={
                    selectedNeighborhood?.nome === bairro.nome
                      ? selectedIcon
                      : defaultIcon
                  }
                  eventHandlers={{
                    click: () => handleNeighborhoodSelect(bairro),
                  }}
                >
                  <Tooltip
                    direction="top"
                    offset={[0, -10]}
                    opacity={1}
                    permanent={false}
                    className="font-pressStart text-[8px]"
                  >
                    {bairro.nome}
                  </Tooltip>
                </Marker>
              ))}
            </MapContainer>
          )}
        </div>

        {!showPopup && (
          <div className="flex min-h-[50vh] w-full flex-col items-center justify-center border-4 border-black bg-lightGreen p-8 text-center shadow-[8px_8px_0px_rgba(0,0,0,1)] lg:min-h-[70vh] lg:w-2/5">
            {selectedNeighborhood ? (
              <>
                <h2 className="mb-6 text-base font-bold uppercase text-primaryWhite drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] md:text-xl">
                  {selectedNeighborhood.nome}
                </h2>
                <p className="mb-4 text-[10px] leading-relaxed text-textBlack md:text-xs">
                  {selectedNeighborhood.descricao}
                </p>
                <p className="mb-2 mt-2 text-[10px] text-textBlack md:text-xs">
                  <strong className="uppercase text-primaryWhite drop-shadow-[1px_1px_0px_rgba(0,0,0,1)]">
                    Foco de Preço:
                  </strong>{' '}
                  {selectedNeighborhood.focoPreco}
                </p>
                <p className="mb-6 text-[10px] text-textBlack md:text-xs">
                  <strong className="uppercase text-primaryWhite drop-shadow-[1px_1px_0px_rgba(0,0,0,1)]">
                    Expectativa:
                  </strong>{' '}
                  {selectedNeighborhood.expectativa}
                </p>
                <button
                  onClick={handleStartGame}
                  className="mt-auto w-full border-4 border-black bg-vibratingBlue px-6 py-4 text-[10px] font-bold uppercase text-primaryWhite shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)] md:text-xs"
                >
                  Iniciar Jogo
                </button>
              </>
            ) : (
              <p className="text-[10px] font-bold uppercase leading-loose text-textBlack md:text-xs">
                Clique em um bairro <br /> no mapa para ver <br /> os detalhes
              </p>
            )}
          </div>
        )}
      </div>

      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <div className="flex w-full max-w-2xl flex-col gap-6 border-4 border-black bg-primaryWhite p-8 text-center shadow-[8px_8px_0px_rgba(0,0,0,1)]">
            <h2 className="text-sm font-bold uppercase text-textBlack md:text-xl">
              Tempo de jogo selecionado
            </h2>
            <p className="text-[10px] uppercase leading-relaxed text-textBlack md:text-xs">
              {tempoDeJogo ? (
                tempoDeJogo.toLowerCase() === 'livre' ? (
                  <>
                    Você escolheu o modo{' '}
                    <strong className="text-vibratingBlue">livre</strong>!{' '}
                    <br />
                    <hr className="my-6 border-2 border-black" />
                    Nesse modo, você pode jogar sem limites de tempo — apenas
                    divirta-se, explore suas estratégias e veja até onde
                    consegue chegar como mestre das tapiocas!
                  </>
                ) : (
                  <>
                    Você escolheu{' '}
                    <strong className="text-vibratingBlue">
                      {tempoDeJogo}
                    </strong>{' '}
                    como tempo de jogo. <br />
                    <hr className="my-6 border-2 border-black" />
                    Durante esse período, seu objetivo é vender o maior número
                    possível de tapiocas e acumular a maior quantia de dinheiro
                    antes que o tempo acabe.
                    <br />
                    <br />
                    Boa sorte, vendedor(a)!
                  </>
                )
              ) : (
                'Nenhum tempo foi selecionado.'
              )}
            </p>

            <div className="mt-4 flex flex-col justify-center gap-4 sm:flex-row">
              <button
                onClick={handleGoBack}
                className="w-full border-4 border-black bg-crimsonRed px-6 py-4 text-[10px] font-bold uppercase text-primaryWhite shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)] sm:w-1/2 md:text-xs"
              >
                Voltar
              </button>
              <button
                onClick={handleContinue}
                className="w-full border-4 border-black bg-lightGreen px-6 py-4 text-[10px] font-bold uppercase text-textBlack shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)] sm:w-1/2 md:text-xs"
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
