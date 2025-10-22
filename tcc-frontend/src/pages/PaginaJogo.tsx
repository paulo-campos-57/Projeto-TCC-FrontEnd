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

export default function PaginaJogo() {
    const location = useLocation();
    const navigate = useNavigate();
    const { tempoDeJogo } = location.state || {};
    const [showPopup, setShowPopup] = useState(true);
    const [selectedNeighborhood, setSelectedNeighborhood] = useState<string | null>(null);

    const handleContinue = () => setShowPopup(false);
    const handleGoBack = () => navigate('/JogoConvidado');

    const handleNeighborhoodSelect = (bairro: { nome: string; pos: L.LatLngExpression; }) => {
        setSelectedNeighborhood(bairro.nome);
        alert(`Você escolheu começar o jogo em ${bairro.nome}!`);
        // navigate('/TelaDeJogo', { state: { bairro: bairro.nome, tempoDeJogo } });
    };

    const bairros: { nome: string; pos: L.LatLngExpression; descricao: string; }[] = [
        {
            nome: "Casa Forte",
            pos: [-8.0305, -34.9235] as L.LatLngExpression,
            descricao: "Bairro tradicional e arborizado, conhecido por sua tranquilidade e charme histórico.",
        },
        {
            nome: "Recife Antigo",
            pos: [-8.0628, -34.8713] as L.LatLngExpression,
            descricao: "Centro histórico da cidade, repleto de cultura, arte e vida noturna animada.",
        },
        {
            nome: "Ibura",
            pos: [-8.1265, -34.9378] as L.LatLngExpression,
            descricao: "Região popular e vibrante, com forte senso de comunidade e vida cotidiana intensa.",
        },
        {
            nome: "Boa Viagem",
            pos: [-8.1198, -34.9023] as L.LatLngExpression,
            descricao: "Área nobre à beira-mar, famosa por sua praia e comércio movimentado.",
        },
        {
            nome: "Várzea",
            pos: [-8.0443, -34.9512] as L.LatLngExpression,
            descricao: "Bairro universitário e residencial, com atmosfera calma e verde.",
        },
        {
            nome: "Areias",
            pos: [-8.0916, -34.9367] as L.LatLngExpression,
            descricao: "Zona urbana popular, com comércio diversificado e moradores acolhedores.",
        },
    ];


    const center: L.LatLngExpression = [-8.05, -34.9];

    return (
        <div className="w-screen h-screen font-pressStart flex flex-col bg-primaryWhite relative">
            <Header />

            <div className="flex flex-1 flex-col gap-8 justify-center items-center p-4">
                <h1 className="text-3xl font-bold text-textBlack text-center">
                    {selectedNeighborhood
                        ? `Bairro selecionado: ${selectedNeighborhood}`
                        : "Escolha um bairro para começar o jogo"}
                </h1>

                {!showPopup && (
                    <div className="w-full max-w-4xl h-[80vh] rounded-2xl overflow-hidden shadow-lg">
                        <MapContainer
                            center={center}
                            zoom={12}
                            style={{ width: "100%", height: "100%" }}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contribuidores'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            {bairros.map((bairro) => (
                                <Marker
                                    key={bairro.nome}
                                    position={bairro.pos}
                                    eventHandlers={{
                                        click: () => handleNeighborhoodSelect(bairro),
                                    }}
                                >
                                    <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent={false}>
                                        <span>{bairro.descricao}</span>
                                    </Tooltip>
                                    <Popup>
                                        <strong>{bairro.nome}</strong> <br />
                                        Clique para iniciar o jogo aqui!
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
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
