import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
import Header from "../../components/Header";
import L from "leaflet";
import type { BairroMapa } from "../../types/bairro-mapa.interface";

const defaultIcon = L.icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    tooltipAnchor: [1, -34],
    shadowSize: [41, 41]
});

const selectedIcon = L.icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    tooltipAnchor: [1, -34],
    shadowSize: [41, 41]
});

const RECIFE_BOUNDS: L.LatLngBoundsExpression = [
    [-8.15, -34.97],
    [-8.00, -34.85],
];

const fixedZoom = 12;
const center: L.LatLngExpression = [-8.05, -34.9];

export default function PaginaJogo() {
    const location = useLocation();
    const navigate = useNavigate();
    const { tempoDeJogo } = (location.state as { tempoDeJogo?: string }) || {};

    const [showPopup, setShowPopup] = useState(true);
    const [selectedNeighborhood, setSelectedNeighborhood] = useState<BairroMapa | null>(null);

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
                    tempoDeJogo
                }
            });
        }
    };

    const bairros: BairroMapa[] = [
        {
            nome: "Casa Forte",
            pos: [-8.0305, -34.9235],
            descricao: "Bairro tradicional e arborizado, conhecido por sua tranquilidade e charme histórico.",
            focoPreco: "Alto",
            expectativa: "Gourmet e Sofisticada",
        },
        {
            nome: "Recife Antigo",
            pos: [-8.0628, -34.8713],
            descricao: "Centro histórico da cidade, repleto de cultura, arte e vida noturna animada.",
            focoPreco: "Moderado a Alto",
            expectativa: "Criativa e Rápida",
        },
        {
            nome: "Ibura",
            pos: [-8.1265, -34.9378],
            descricao: "Região popular e vibrante, com forte senso de comunidade e vida cotidiana intensa.",
            focoPreco: "Baixo",
            expectativa: "Familiar e Econômica",
        },
        {
            nome: "Boa Viagem",
            pos: [-8.1198, -34.9023],
            descricao: "Área nobre à beira-mar, famosa por sua praia e comércio movimentado.",
            focoPreco: "Moderado a Alto",
            expectativa: "Saudável e Turística",
        },
        {
            nome: "Várzea",
            pos: [-8.0443, -34.9512],
            descricao: "Bairro universitário e residencial, com atmosfera calma e verde.",
            focoPreco: "Moderado",
            expectativa: "Variada e Estudantil",
        },
        {
            nome: "Areias",
            pos: [-8.0916, -34.9367],
            descricao: "Zona urbana popular, com comércio diversificado e moradores acolhedores.",
            focoPreco: "Moderado a Baixo",
            expectativa: "Tradicional e Caseira",
        },
    ];

    return (
        <div className="w-full min-h-screen font-pressStart flex flex-col bg-primaryWhite relative overflow-y-auto">
            <Header />

            <div className="flex flex-1 flex-col lg:flex-row gap-8 justify-center items-center px-4 pt-24 pb-20 max-w-7xl mx-auto w-full">
                <div className="w-full lg:w-3/5 h-[50vh] lg:h-[70vh] border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] bg-primaryWhite z-0">
                    {!showPopup && (
                        <MapContainer
                            center={center}
                            zoom={fixedZoom}
                            style={{ width: "100%", height: "100%" }}
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
                                    icon={selectedNeighborhood?.nome === bairro.nome ? selectedIcon : defaultIcon}
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
                    <div className="w-full lg:w-2/5 bg-lightGreen border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-8 text-center flex flex-col justify-center items-center min-h-[50vh] lg:min-h-[70vh]">
                        {selectedNeighborhood ? (
                            <>
                                <h2 className="text-base md:text-xl font-bold text-primaryWhite drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] uppercase mb-6">
                                    {selectedNeighborhood.nome}
                                </h2>
                                <p className="text-textBlack text-[10px] md:text-xs mb-4 leading-relaxed">
                                    {selectedNeighborhood.descricao}
                                </p>
                                <p className="text-textBlack text-[10px] md:text-xs mt-2 mb-2">
                                    <strong className="text-primaryWhite drop-shadow-[1px_1px_0px_rgba(0,0,0,1)] uppercase">Foco de Preço:</strong> {selectedNeighborhood.focoPreco}
                                </p>
                                <p className="text-textBlack text-[10px] md:text-xs mb-6">
                                    <strong className="text-primaryWhite drop-shadow-[1px_1px_0px_rgba(0,0,0,1)] uppercase">Expectativa:</strong> {selectedNeighborhood.expectativa}
                                </p>
                                <button
                                    onClick={handleStartGame}
                                    className="mt-auto w-full bg-vibratingBlue text-primaryWhite font-bold py-4 px-6 text-[10px] md:text-xs border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 uppercase"
                                >
                                    Iniciar Jogo
                                </button>
                            </>
                        ) : (
                            <p className="text-[10px] md:text-xs text-textBlack font-bold uppercase leading-loose">
                                Clique em um bairro <br /> no mapa para ver <br /> os detalhes
                            </p>
                        )}
                    </div>
                )}
            </div>

            {showPopup && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50 px-4">
                    <div className="bg-primaryWhite border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-8 w-full max-w-2xl text-center flex flex-col gap-6">
                        <h2 className="text-sm md:text-xl font-bold text-textBlack uppercase">
                            Tempo de jogo selecionado
                        </h2>
                        <p className="text-[10px] md:text-xs text-textBlack leading-relaxed uppercase">
                            {tempoDeJogo ? (
                                tempoDeJogo.toLowerCase() === "livre" ? (
                                    <>
                                        Você escolheu o modo <strong className="text-vibratingBlue">livre</strong>! <br />
                                        <hr className="my-6 border-2 border-black" />
                                        Nesse modo, você pode jogar sem limites de tempo —
                                        apenas divirta-se, explore suas estratégias e veja
                                        até onde consegue chegar como mestre das tapiocas!
                                    </>
                                ) : (
                                    <>
                                        Você escolheu <strong className="text-vibratingBlue">{tempoDeJogo}</strong> como tempo de jogo. <br />
                                        <hr className="my-6 border-2 border-black" />
                                        Durante esse período, seu objetivo é vender o maior número
                                        possível de tapiocas e acumular a maior quantia de dinheiro
                                        antes que o tempo acabe.
                                        <br /><br />
                                        Boa sorte, vendedor(a)!
                                    </>
                                )
                            ) : (
                                "Nenhum tempo foi selecionado."
                            )}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4">
                            <button
                                onClick={handleGoBack}
                                className="w-full sm:w-1/2 bg-crimsonRed text-primaryWhite font-bold py-4 px-6 text-[10px] md:text-xs border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 uppercase"
                            >
                                Voltar
                            </button>
                            <button
                                onClick={handleContinue}
                                className="w-full sm:w-1/2 bg-lightGreen text-textBlack font-bold py-4 px-6 text-[10px] md:text-xs border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 uppercase"
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