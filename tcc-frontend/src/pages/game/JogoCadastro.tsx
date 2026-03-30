import toast from "react-hot-toast";
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";

export default function JogoCadastro() {
    const navigate = useNavigate();

    const handleGameMode = async (tempo: string) => {
        try {
            const response = await fetch("http://127.0.0.1:5000/bairro/iniciar_sessao", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tempo })
            });

            const data = await response.json();

            if (response.ok) {
                navigate(data.redirect_to, { state: { tempoDeJogo: data.tempoDeJogo } });
            } else {
                toast.error(data.error);
            }
        } catch (err) {
            toast.error("Erro ao falar com o servidor");
        }
    }

    const userName = JSON.parse(localStorage.getItem("user") || "{}").nome || "Jogador";

    return (
        <>
            <div className="w-full min-h-screen font-pressStart flex flex-col bg-primaryWhite overflow-y-auto">
                <Header />

                <div className="flex flex-1 flex-col gap-4 md:gap-6 justify-center items-center px-4 pt-24 pb-20">

                    <h1 className="text-base md:text-2xl lg:text-3xl text-vibratingBlue drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] text-center leading-relaxed">
                        Bem-vindo(a),<br className="md:hidden" /> {userName}!
                    </h1>

                    <div className="flex flex-col justify-center items-center gap-4 w-[95%] max-w-lg bg-lightGreen p-6 border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)]">
                        <p className="text-primaryWhite text-[8px] md:text-[10px] text-center drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] leading-relaxed">
                            Selecione uma das opções para iniciar:
                        </p>

                        <div className="flex flex-col w-full md:w-4/5 gap-3 mt-2">
                            <button
                                onClick={() => handleGameMode("1 semana")}
                                className="w-full bg-goldenYellow text-textBlack text-[10px] md:text-xs py-3 border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
                            >
                                Jogo de 1 semana
                            </button>
                            <button
                                onClick={() => handleGameMode("15 dias")}
                                className="w-full bg-goldenYellow text-textBlack text-[10px] md:text-xs py-3 border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
                            >
                                Jogo de 15 dias
                            </button>
                            <button
                                onClick={() => handleGameMode("1 mês")}
                                className="w-full bg-goldenYellow text-textBlack text-[10px] md:text-xs py-3 border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
                            >
                                Jogo de 1 mês
                            </button>
                            <button
                                onClick={() => handleGameMode("livre")}
                                className="w-full bg-goldenYellow text-textBlack text-[10px] md:text-xs py-3 border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
                            >
                                Jogo livre
                            </button>
                        </div>

                        <div className="w-full md:w-4/5 border-b-4 border-black my-2 opacity-20"></div>

                        <button
                            className="w-2/3 md:w-1/2 bg-crimsonRed text-primaryWhite text-[10px] md:text-xs py-2 border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:bg-red-600 active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
                            onClick={() => navigate("/UsuarioHome")}
                        >
                            VOLTAR
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}