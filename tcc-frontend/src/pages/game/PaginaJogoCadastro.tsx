import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
import Header from "../../components/Header";
import L from "leaflet";
import toast, { Toaster } from "react-hot-toast";

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

const RECIFE_BOUNDS: L.LatLngBoundsExpression = [[-8.15, -34.97], [-8.00, -34.85]];
const fixedZoom = 12;
const center: L.LatLngExpression = [-8.05, -34.9];

export default function PaginaJogoCadastro() {
    const location = useLocation();
    const navigate = useNavigate();
    const { tempoDeJogo } = (location.state as { tempoDeJogo?: string }) || {};

    const [bairros, setBairros] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showPopup, setShowPopup] = useState(true);
    const [selectedNeighborhood, setSelectedNeighborhood] = useState<any | null>(null);

    useEffect(() => {
        const fetchBairros = async () => {
            try {
                const response = await fetch("http://127.0.0.1:5000/bairro/lista");
                const data = await response.json();

                if (response.ok) {
                    setBairros(data);
                } else {
                    toast.error("Erro ao carregar dados dos bairros");
                }
            } catch (error) {
                console.error("Erro de rede:", error);
                toast.error("Servidor offline");
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

        const loadingToast = toast.loading("Preparando sua barraca...");

        try {
            const response = await fetch("http://127.0.0.1:5000/bairro/iniciar_jogo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    bairroId: selectedNeighborhood.id,
                    tempoDeJogo: tempoDeJogo
                })
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("Tudo pronto! Boa sorte!", { id: loadingToast });

                navigate(data.redirect_url, {
                    state: { config: data.game_config }
                });
            } else {
                toast.error(data.error || "Erro ao iniciar jogo", { id: loadingToast });
            }
        } catch (error) {
            toast.error("Erro de conexão com o servidor", { id: loadingToast });
        }
    };

    return (
        <div className="w-screen h-screen font-pressStart flex flex-col bg-primaryWhite relative">
            <Toaster />
            <Header />

            <div className="flex flex-1 flex-col lg:flex-row gap-8 justify-center items-center p-6">
                {/* LADO ESQUERDO: MAPA */}
                <div className="w-full lg:w-3/5 h-[70vh] rounded-2xl overflow-hidden shadow-lg border-4 border-lightGreen">
                    {loading ? (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 animate-pulse">
                            <p>Carregando mapa de Recife...</p>
                        </div>
                    ) : (
                        !showPopup && (
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
                            >
                                <TileLayer
                                    attribution='&copy; OpenStreetMap'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                {bairros.map((bairro) => (
                                    <Marker
                                        key={bairro.id}
                                        position={bairro.pos}
                                        icon={selectedNeighborhood?.id === bairro.id ? selectedIcon : defaultIcon}
                                        eventHandlers={{
                                            click: () => setSelectedNeighborhood(bairro),
                                        }}
                                    >
                                        <Tooltip direction="top" className="font-pressStart text-[10px]">
                                            {bairro.nome}
                                        </Tooltip>
                                    </Marker>
                                ))}
                            </MapContainer>
                        )
                    )}
                </div>

                {/* LADO DIREITO: INFOS DO BACKEND */}
                {!showPopup && (
                    <div className="w-full lg:w-2/5 bg-white rounded-2xl shadow-xl p-6 text-center border-4 border-vibratingBlue flex flex-col justify-center items-center">
                        {selectedNeighborhood ? (
                            <>
                                <h2 className="text-xl font-bold text-vibratingBlue mb-4">
                                    {selectedNeighborhood.nome}
                                </h2>
                                <p className="text-gray-700 text-xs leading-relaxed mb-4">
                                    {selectedNeighborhood.descricao}
                                </p>
                                <div className="bg-lightGreen/20 p-4 rounded-lg w-full space-y-2">
                                    <p className="text-[10px] text-gray-800 text-left">
                                        <strong>💰 FOCO PREÇO:</strong> {selectedNeighborhood.focoPreco}
                                    </p>
                                    <p className="text-[10px] text-gray-800 text-left">
                                        <strong>🎯 EXPECTATIVA:</strong> {selectedNeighborhood.expectativa}
                                    </p>
                                </div>
                                <button
                                    onClick={handleStartGame}
                                    className="mt-6 px-6 py-3 bg-vibratingBlue hover:bg-blue-700 text-white rounded-xl transition font-bold text-xs"
                                >
                                    ABRIR TAPIOCARIA
                                </button>
                            </>
                        ) : (
                            <p className="text-gray-400 text-xs italic">
                                Selecione um ponto no mapa para ver as estatísticas do bairro
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* MODAL DE TEMPO (POPUP) */}
            {showPopup && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-[1000]">
                    <div className="bg-white rounded-2xl p-10 w-[90%] max-w-lg text-center border-8 border-goldenYellow">
                        <h2 className="text-xl font-bold mb-6">MODO SELECIONADO</h2>
                        <p className="text-sm leading-8">
                            Tempo: <span className="text-vibratingBlue font-bold underline">{tempoDeJogo}</span>
                        </p>
                        <div className="flex gap-4 mt-8">
                            <button onClick={handleGoBack} className="flex-1 bg-crimsonRed text-white py-3 rounded-lg text-xs">VOLTAR</button>
                            <button onClick={handleContinue} className="flex-1 bg-lightGreen text-white py-3 rounded-lg text-xs">CONTINUAR</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}