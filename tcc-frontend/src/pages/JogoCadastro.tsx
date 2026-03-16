import toast from "react-hot-toast";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";

export default function JogoCadastro() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        fetch("http://127.0.0.1:5000/logout", {
            method: "POST"
        });

        toast.success("Logout realizado com sucesso!");
        setTimeout(() => navigate("/"), 2000);
    }

    const handleGameMode = (tempo: string) => {
        navigate('/PaginaJogo', { state: { tempoDeJogo: tempo } });
    }

    return (
        <>
            <div className="w-screen h-screen font-pressStart flex flex-col bg-primaryWhite">
                <Header />
                <div className="flex flex-1 flex-col gap-8 justify-center items-center">
                    <h1 className="text-4xl text-textBlack font-bold text-center mt-10">
                        Bem-vindo {JSON.parse(localStorage.getItem("user") || "{}").nome || "Jogador"}!
                    </h1>
                    <div className="flex flex-col justify-center items-center gap-4 w-2/4 bg-lightGreen p-6 rounded-2xl shadow-md">
                        <p className="text-primaryWhite text-center">
                            Selecione uma das opções para iniciar:
                        </p>

                        <div className="flex flex-col w-3/5 gap-4">
                            <button
                                onClick={() => handleGameMode("1 semana")}
                                className="w-full bg-goldenYellow text-primaryWhite font-bold py-3 rounded-lg hover:bg-yellow-500 transition duration-200"
                            >
                                Jogo de 1 semana
                            </button>
                            <button
                                onClick={() => handleGameMode("15 dias")}
                                className="w-full bg-goldenYellow text-primaryWhite font-bold py-3 rounded-lg hover:bg-yellow-500 transition duration-200"
                            >
                                Jogo de 15 dias
                            </button>
                            <button
                                onClick={() => handleGameMode("1 mês")}
                                className="w-full bg-goldenYellow text-primaryWhite font-bold py-3 rounded-lg hover:bg-yellow-500 transition duration-200"
                            >
                                Jogo de 1 mês
                            </button>
                            <button
                                onClick={() => handleGameMode("livre")}
                                className="w-full bg-goldenYellow text-primaryWhite font-bold py-3 rounded-lg hover:bg-yellow-500 transition duration-200"
                            >
                                Jogo livre
                            </button>
                        </div>
                    </div>
                    <button className="w-1/6 h-1/8 bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-700"
                        onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </div>
        </>
    );
}