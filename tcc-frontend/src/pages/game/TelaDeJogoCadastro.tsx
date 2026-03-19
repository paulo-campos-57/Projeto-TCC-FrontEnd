import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../components/Header";

export default function TelaDeJogoCadastro() {
    const location = useLocation();
    const navigate = useNavigate();

    const { config } = (location.state as { config?: any }) || {};

    if (!config) {
        return (
            <div className="h-screen flex flex-col items-center justify-center font-pressStart">
                <p>Erro: Sessão de jogo não encontrada.</p>
                <button onClick={() => navigate('/JogoCadastro')} className="mt-4 bg-blue-500 p-2 text-white">Voltar</button>
            </div>
        );
    }

    return (
        <div className="w-screen h-screen font-pressStart flex flex-col bg-primaryWhite overflow-hidden">
            <Header />

            <div className="flex-1 flex flex-col items-center justify-center p-4">

                <div className="w-full max-w-5xl">

                    <div className="flex justify-between items-center bg-vibratingBlue text-white p-6 rounded-xl shadow-lg mb-8">
                        <div>
                            <h1 className="text-lg md:text-xl">Bairro: {config.bairro.nome}</h1>
                            <p className="text-[10px] mt-2">Modo: {config.tempoDeJogo}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-base md:text-lg">💰 R$ 100,00</p>
                            <p className="text-[10px]">Satisfação: 3/10</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Área de Preparação */}
                        <div className="bg-lightGreen/20 border-4 border-dashed border-lightGreen p-8 md:p-12 rounded-2xl flex flex-col items-center justify-center min-h-[250px]">
                            <p className="text-xs md:text-sm text-center">Área de Preparação de Tapioca</p>
                            <div className="mt-8 text-5xl animate-bounce">🍳</div>
                        </div>

                        {/* Área de Clientes */}
                        <div className="bg-white border-4 border-vibratingBlue p-8 md:p-12 rounded-2xl flex flex-col items-center justify-center min-h-[250px] shadow-sm">
                            <p className="text-xs md:text-sm text-center">Fila de Clientes</p>
                            <p className="text-[9px] md:text-[10px] mt-6 text-gray-400 italic text-center">
                                Aguardando clientes da {config.bairro.nome}...
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}