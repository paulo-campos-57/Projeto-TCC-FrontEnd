import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import NavItem from "../../components/NavItem";
import Footer from "../../components/Footer";
import toast, { Toaster } from "react-hot-toast";

export default function Index() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPopup, setShowConfirmPopup] = useState(false);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error("Por favor, preencha todos os campos");
            return;
        }

        const loadingToast = toast.loading("Autenticando...");

        try {
            const response = await fetch("http://127.0.0.1:5000/user/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email,
                    senha: password
                }),
            });

            const data = await response.json();

            if (response.ok) {
                console.log("Token recebido:", data.token);

                toast.success(`Bem-vindo, ${data.User?.nome}!`, { id: loadingToast });

                localStorage.setItem("token", JSON.stringify(data.token));
                localStorage.setItem("user", JSON.stringify(data.User));

                setTimeout(() => navigate("/UsuarioHome"), 2000);
            } else {
                toast.error(data.error || "Falha no login", { id: loadingToast });
            }
        } catch (err) {
            console.error("Erro de rede:", err);
            toast.error("Servidor offline ou erro de conexão", { id: loadingToast });
        }
    }

    const handleGuestPlay = () => {
        setShowConfirmPopup(true);
    };

    const confirmGuestPlay = () => {
        setShowConfirmPopup(false);
        navigate('/JogoConvidado');
    };

    const cancelGuestPlay = () => {
        setShowConfirmPopup(false);
    };

    return (
        <>
            <div className="w-screen h-screen font-pressStart flex flex-col bg-primaryWhite">
                <Toaster position="top-right" />
                <Header />
                <div className="flex flex-1">
                    {/* LADO ESQUERDO - LOGIN */}
                    <div className="w-1/2 h-full flex flex-col justify-center items-center text-textBlack font-bold bg-lightGreen p-8">
                        <h1 className="text-2xl md:text-3xl lg:text-4xl mb-6 text-primaryWhite drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] text-center">
                            Fazer login
                        </h1>

                        <form
                            onSubmit={handleLogin}
                            className="flex flex-col gap-4 w-5/6 max-w-md bg-primaryWhite p-6 border-4 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)]"
                        >
                            <input
                                className="w-full p-3 border-4 bg-primaryWhite border-black text-textBlack placeholder-gray-500 focus:outline-none focus:bg-gray-100 transition duration-200 text-[10px] md:text-xs"
                                type="email"
                                placeholder="E-mail"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />

                            <div className="relative w-full">
                                <input
                                    className="w-full p-3 border-4 bg-primaryWhite border-black text-textBlack placeholder-gray-500 focus:outline-none focus:bg-gray-100 transition duration-200 pr-12 text-[10px] md:text-xs"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Senha"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-3 flex items-center text-black hover:text-vibratingBlue transition duration-200 focus:outline-none"
                                >
                                    {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                                </button>
                            </div>

                            <button
                                type="submit"
                                className="mt-4 bg-vibratingBlue text-primaryWhite py-3 px-6 text-xs md:text-sm border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-blue-700 active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)] transition-all"
                            >
                                ENTRAR
                            </button>

                            <div className="text-center text-gray-700 mt-4 text-[9px] md:text-[10px] leading-relaxed">
                                Ainda não tem uma conta?
                                <span
                                    className="text-crimsonRed font-bold cursor-pointer ml-2 hover:underline"
                                    onClick={() => navigate('/Cadastro')}>
                                    Cadastre-se
                                </span>
                            </div>
                        </form>
                    </div>

                    {/* LADO DIREITO - JOGAR COMO CONVIDADO */}
                    <div className="w-1/2 h-full flex flex-col justify-center items-center text-textBlack font-bold bg-primaryWhite p-8 border-l-4 border-black">
                        <h1
                            className="text-lg md:text-2xl lg:text-3xl text-center cursor-pointer p-6 bg-white border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:-translate-y-1 active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)] transition-all"
                            onClick={handleGuestPlay}
                        >
                            <NavItem>Jogar sem conta</NavItem>
                        </h1>
                    </div>
                </div>
                <Footer />
            </div>

            {/* POPUP DE CONFIRMAÇÃO */}
            {showConfirmPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
                    <div
                        className="bg-primaryWhite p-8 border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] w-[90%] max-w-md text-center font-pressStart"
                    >
                        <h2 className="text-xl md:text-2xl mb-4 text-textBlack drop-shadow-[1px_1px_0px_rgba(0,0,0,0.3)]">
                            Tem certeza? ⚠️
                        </h2>
                        <p className="mb-8 text-gray-700 text-[10px] md:text-xs leading-relaxed">
                            Ao jogar sem conta, seu progresso não será salvo e você não terá estatísticas.
                        </p>
                        <div className="flex flex-col md:flex-row justify-center gap-4">
                            <button
                                onClick={confirmGuestPlay}
                                className="bg-vibratingBlue text-primaryWhite py-3 px-4 text-xs md:text-sm border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-blue-700 active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)] transition-all flex-1"
                            >
                                SIM
                            </button>
                            <button
                                onClick={cancelGuestPlay}
                                className="bg-crimsonRed text-primaryWhite py-3 px-4 text-xs md:text-sm border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-red-700 active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)] transition-all flex-1"
                            >
                                CANCELAR
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}