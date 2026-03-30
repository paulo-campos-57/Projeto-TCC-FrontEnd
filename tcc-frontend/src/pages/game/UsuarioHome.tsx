import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import { toast } from "react-hot-toast/headless";

export default function UsuarioHome() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        fetch("http://127.0.0.1:5000/user/logout", {
            method: "POST"
        });

        toast.success("Logout realizado com sucesso!");
        setTimeout(() => navigate("/"), 2000);
    }

    const userName = JSON.parse(localStorage.getItem("user") || "{}").nome || "Jogador";

    return (
        <div className="w-full h-screen font-pressStart flex flex-col bg-primaryWhite overflow-hidden">
            <Header />

            <div className="flex flex-1 flex-col gap-6 md:gap-10 justify-center items-center px-4 mt-8 md:mt-0">

                <h1 className="text-lg md:text-3xl lg:text-4xl text-vibratingBlue drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] text-center leading-relaxed">
                    Bem-vindo(a),<br className="md:hidden" /> {userName}!
                </h1>

                <div className="flex flex-col justify-center items-center gap-6 w-[90%] max-w-lg bg-lightGreen p-8 border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)]">

                    <p className="text-primaryWhite text-[10px] md:text-xs text-center drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] leading-relaxed">
                        Selecione uma das opções:
                    </p>

                    <div className="flex flex-col w-full md:w-4/5 gap-4 justify-center items-center mt-2">

                        <button
                            className="w-full bg-goldenYellow text-textBlack text-xs md:text-sm py-4 border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:-translate-y-2 hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
                            onClick={() => navigate("/JogoCadastro")}
                        >
                            JOGAR
                        </button>

                        <button
                            className="w-full bg-goldenYellow text-textBlack text-xs md:text-sm py-4 border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:-translate-y-2 hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
                            onClick={() => navigate("/Perfil")}
                        >
                            PERFIL
                        </button>

                        <div className="w-full border-b-4 border-black my-2 opacity-20"></div>

                        <button
                            className="w-2/3 md:w-1/2 bg-crimsonRed text-primaryWhite text-[10px] md:text-xs py-3 border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:bg-red-600 active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
                            onClick={handleLogout}
                        >
                            SAIR
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}