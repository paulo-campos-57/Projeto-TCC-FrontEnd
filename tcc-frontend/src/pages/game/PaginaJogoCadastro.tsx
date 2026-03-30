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
        <div className="w-full min-h-screen font-pressStart flex flex-col bg-primaryWhite overflow-y-auto relative">
            <Toaster />
            <Header />

            <div className="flex flex-1 flex-col lg:flex-row gap-8 justify-center items-center px-4 pt-24 pb-20">

                <div className="w-full lg:w-3/5 h-[60vh] md:h-[70vh] border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] bg-white relative z-0">
                    {loading ? (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 animate-pulse text-[10px] md:text-xs">
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

                {!showPopup && (
                    <div className="w-full lg:w-2/5 bg-white border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-6 md:p-8 text-center flex flex-col justify-center items-center">
                        {selectedNeighborhood ? (
                            <>
                                <h2 className="text-sm md:text-lg lg:text-xl font-bold text-vibratingBlue drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] mb-6">
                                    {selectedNeighborhood.nome}
                                </h2>

                                <p className="text-textBlack text-[10px] md:text-xs leading-loose mb-6">
                                    {selectedNeighborhood.descricao}
                                </p>

                                <div className="bg-lightGreen p-4 w-full space-y-4 border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] mb-6">
                                    <p className="text-[8px] md:text-[10px] text-textBlack text-left">
                                        <strong>💰 FOCO PREÇO:</strong> {selectedNeighborhood.focoPreco}
                                    </p>
                                    <p className="text-[8px] md:text-[10px] text-textBlack text-left">
                                        <strong>🎯 EXPECTATIVA:</strong> {selectedNeighborhood.expectativa}
                                    </p>
                                </div>

                                <button
                                    onClick={handleStartGame}
                                    className="w-full px-6 py-4 bg-vibratingBlue text-primaryWhite font-bold text-[10px] md:text-xs border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
                                >
                                    ABRIR TAPIOCARIA
                                </button>
                            </>
                        ) : (
                            <p className="text-gray-400 text-[10px] md:text-xs text-center border-4 border-dashed border-gray-300 p-8 w-full">
                                Selecione um ponto no mapa para ver as estatísticas do bairro.
                            </p>
                        )}
                    </div>
                )}
            </div>

            {showPopup && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-[1000] px-4">
                    <div className="bg-primaryWhite p-8 md:p-10 w-full max-w-lg text-center border-4 border-black shadow-[12px_12px_0px_rgba(0,0,0,1)]">
                        <h2 className="text-sm md:text-xl font-bold text-vibratingBlue drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] mb-8">
                            MODO SELECIONADO
                        </h2>

                        <p className="text-[10px] md:text-xs leading-8 text-textBlack mb-8">
                            Tempo: <span className="text-vibratingBlue font-bold border-b-2 border-black border-dashed pb-1">{tempoDeJogo}</span>
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 mt-4">
                            <button
                                onClick={handleGoBack}
                                className="flex-1 bg-crimsonRed text-primaryWhite py-4 text-[10px] md:text-xs border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
                            >
                                VOLTAR
                            </button>
                            <button
                                onClick={handleContinue}
                                className="flex-1 bg-lightGreen text-textBlack py-4 text-[10px] md:text-xs border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
                            >
                                CONTINUAR
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}