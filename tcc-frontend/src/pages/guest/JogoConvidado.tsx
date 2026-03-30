import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";

export default function JogoConvidado() {
    const navigate = useNavigate();

    const handleGameMode = (tempo: string) => {
        navigate('/PaginaJogo', { state: { tempoDeJogo: tempo } });
    }

    return (
        <div className="w-full min-h-screen font-pressStart flex flex-col bg-primaryWhite overflow-y-auto">
            <Header />

            <div className="flex-1 w-full flex flex-col gap-8 justify-center items-center px-4 pt-24 pb-20">
                <h1 className="text-xl md:text-3xl text-textBlack font-bold text-center uppercase drop-shadow-[2px_2px_0px_rgba(0,0,0,0.2)]">
                    Jogo Convidado
                </h1>

                <div className="flex flex-col justify-center items-center gap-6 w-full max-w-lg md:w-2/3 lg:w-1/2 bg-lightGreen p-8 border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)]">
                    <p className="text-[10px] md:text-xs text-primaryWhite text-center font-bold drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] uppercase mb-2">
                        Selecione o tempo de jogo:
                    </p>

                    <div className="flex flex-col w-full md:w-4/5 gap-4">
                        <button
                            onClick={() => handleGameMode("1 semana")}
                            className="w-full bg-goldenYellow text-textBlack font-bold py-4 px-6 text-[10px] md:text-xs border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 uppercase"
                        >
                            1 Semana
                        </button>
                        <button
                            onClick={() => handleGameMode("15 dias")}
                            className="w-full bg-goldenYellow text-textBlack font-bold py-4 px-6 text-[10px] md:text-xs border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 uppercase"
                        >
                            15 Dias
                        </button>
                        <button
                            onClick={() => handleGameMode("1 mês")}
                            className="w-full bg-goldenYellow text-textBlack font-bold py-4 px-6 text-[10px] md:text-xs border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 uppercase"
                        >
                            1 Mês
                        </button>
                        <button
                            onClick={() => handleGameMode("livre")}
                            className="w-full bg-goldenYellow text-textBlack font-bold py-4 px-6 text-[10px] md:text-xs border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 uppercase"
                        >
                            Jogo Livre
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}