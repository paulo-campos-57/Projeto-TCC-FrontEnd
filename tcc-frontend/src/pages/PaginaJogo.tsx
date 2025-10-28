import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from "react-leaflet";
import Header from "../components/Header";
import L from "leaflet";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
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
    const { tempoDeJogo } = location.state || {};
    const [showPopup, setShowPopup] = useState(true);
    const [selectedNeighborhood, setSelectedNeighborhood] = useState<any>(null);

    const handleContinue = () => setShowPopup(false);
    const handleGoBack = () => navigate('/JogoConvidado');

    const handleNeighborhoodSelect = (bairro: any) => {
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

    const bairros = [
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
        <div className="w-screen h-screen font-pressStart flex flex-col bg-primaryWhite relative">
            <Header />

            <div className="flex flex-1 flex-col lg:flex-row gap-8 justify-center items-center p-6">
                <div className="w-full lg:w-3/5 h-[70vh] rounded-2xl overflow-hidden shadow-lg">
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
                                    eventHandlers={{
                                        click: () => handleNeighborhoodSelect(bairro),
                                    }}
                                >
                                    <Tooltip
                                        direction="top"
                                        offset={[0, -10]}
                                        opacity={1}
                                        permanent={false}
                                        className="font-pressStart text-xs"
                                    >
                                        {bairro.nome}
                                    </Tooltip>
                                    <Popup>
                                        <strong>{bairro.nome}</strong> <br />
                                        Clique para iniciar o jogo aqui!
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    )}
                </div>

                {/* Lateral de informações */}
                {!showPopup && (
                    <div className="w-full lg:w-2/5 bg-white rounded-2xl shadow-xl p-6 text-center flex flex-col justify-center items-center">
                        {selectedNeighborhood ? (
                            <>
                                <h2 className="text-xl font-bold text-textBlack mb-4">
                                    {selectedNeighborhood.nome}
                                </h2>
                                <p className="text-gray-700 text-sm mb-2">{selectedNeighborhood.descricao}</p>
                                <p className="text-gray-800 text-sm mt-2">
                                    <strong>Foco de Preço:</strong> {selectedNeighborhood.focoPreco}
                                </p>
                                <p className="text-gray-800 text-sm">
                                    <strong>Expectativa:</strong> {selectedNeighborhood.expectativa}
                                </p>
                                <button
                                    onClick={handleStartGame}
                                    className="mt-6 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition font-bold"
                                >
                                    Iniciar Jogo
                                </button>
                            </>
                        ) : (
                            <p className="text-gray-600">Clique em um bairro no mapa para ver os detalhes</p>
                        )}
                    </div>
                )}
            </div>

            {showPopup && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-50">
                    <div className="bg-white rounded-2xl shadow-xl p-10 w-[90%] max-w-lg text-center flex flex-col gap-6">
                        <h2 className="text-2xl font-bold text-textBlack">
                            Tempo de jogo selecionado
                        </h2>
                        <p className="text-lg text-gray-700 text-center">
                            {tempoDeJogo ? (
                                tempoDeJogo.toLowerCase() === "livre" ? (
                                    <>
                                        Você escolheu o modo <strong>livre</strong>! <br />
                                        <hr className="my-4" />
                                        Nesse modo, você pode jogar sem limites de tempo —
                                        apenas divirta-se, explore suas estratégias e veja
                                        até onde consegue chegar como mestre das tapiocas!
                                    </>
                                ) : (
                                    <>
                                        Você escolheu <strong>{tempoDeJogo}</strong> como tempo de jogo. <br />
                                        <hr className="my-4" />
                                        Durante esse período, seu objetivo é vender o maior número
                                        possível de tapiocas e acumular a maior quantia de dinheiro
                                        antes que o tempo acabe.
                                        <br />
                                        Boa sorte, vendedor(a)!
                                    </>
                                )
                            ) : (
                                "Nenhum tempo foi selecionado."
                            )}
                        </p>

                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={handleGoBack}
                                className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition font-bold"
                            >
                                Voltar
                            </button>
                            <button
                                onClick={handleContinue}
                                className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition font-bold"
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
