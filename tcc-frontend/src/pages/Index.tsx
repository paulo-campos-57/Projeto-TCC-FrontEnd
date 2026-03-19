import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import NavItem from "../components/NavItem";
import Footer from "../components/Footer";
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
                    <div className="w-1/2 h-full flex flex-col justify-center items-center text-textBlack font-bold bg-lightGreen p-8 rounded-none shadow-lg">
                        <h1 className="text-4xl font-bold mb-6 text-primaryWhite">Fazer login</h1>

                        <form
                            onSubmit={handleLogin}
                            className="flex flex-col gap-4 w-2/3 bg-primaryWhite p-6 rounded-2xl shadow-md"
                        >
                            <input
                                className="w-full p-3 border-2 bg-primaryWhite border-goldenYellow rounded-lg text-textBlack placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-vibratingBlue transition duration-200"
                                type="email"
                                placeholder="E-mail"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />

                            <div className="relative w-full">
                                <input
                                    className="w-full p-3 border-2 bg-primaryWhite border-goldenYellow rounded-lg text-textBlack placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-vibratingBlue transition duration-200 pr-10"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Senha"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-vibratingBlue transition duration-200 focus:outline-none"
                                >
                                    {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                                </button>
                            </div>

                            <button
                                type="submit"
                                className="mt-4 bg-vibratingBlue text-primaryWhite font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition duration-200"
                            >
                                Entrar
                            </button>

                            <div className="text-center text-gray-600 mt-4 text-xs">
                                Ainda não tem uma conta?
                                <span
                                    className="text-crimsonRed font-bold cursor-pointer ml-2"
                                    onClick={() => navigate('/Cadastro')}>
                                    Cadastre-se
                                </span>
                            </div>
                        </form>
                    </div>

                    {/* LADO DIREITO - JOGAR COMO CONVIDADO */}
                    <div className="w-1/2 h-full flex flex-col justify-center items-center text-textBlack font-bold bg-primaryWhite p-8 rounded-none shadow-lg">
                        <h1
                            className="text-4xl font-bold cursor-pointer"
                            onClick={handleGuestPlay}
                        >
                            <NavItem>Jogar sem conta</NavItem>
                        </h1>
                    </div>
                </div>
                <Footer />
            </div>

            {/* POPUP DE CONFIRMAÇÃO (mantido original) */}
            {showConfirmPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-primaryWhite p-8 rounded-2xl shadow-2xl w-96 text-center font-pressStart">
                        <h2 className="text-2xl font-bold mb-4 text-textBlack">Tem certeza? ⚠️</h2>
                        <p className="mb-6 text-gray-700 text-sm">
                            Ao jogar sem conta, seu progresso não será salvo e você não terá estatísticas.
                        </p>
                        <div className="flex justify-center gap-4">
                            <button onClick={confirmGuestPlay} className="bg-vibratingBlue text-primaryWhite py-2 px-4 rounded-lg flex-1">Sim</button>
                            <button onClick={cancelGuestPlay} className="bg-crimsonRed text-primaryWhite py-2 px-4 rounded-lg flex-1">Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}