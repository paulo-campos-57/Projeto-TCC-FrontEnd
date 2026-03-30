import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

export default function Cadastro() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError("As senhas não coincidem");
            return;
        }

        const loadingToast = toast.loading("Realizando cadastro...");

        try {
            const response = await fetch("http://127.0.0.1:5000/user/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    nome: nome,
                    email: email,
                    senha: password,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("Cadastro realizado com sucesso!", { id: loadingToast });
                setTimeout(() => navigate("/"), 2000);
            } else {
                toast.error(data.error || "Erro ao realizar cadastro", { id: loadingToast });
            }
        } catch (err) {
            toast.error("Não foi possível conectar ao servidor", { id: loadingToast });
            console.log("Erro no cadastro:", err);
        }
    };

    return (
        <div className="font-pressStart w-full min-h-screen flex flex-col bg-primaryWhite overflow-y-auto">
            <Toaster position="top-right" />
            <Header />

            <div className="flex-1 w-full flex flex-col justify-center items-center px-4 pt-24 pb-20">
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col w-full max-w-lg md:w-2/3 lg:w-1/2 bg-lightGreen gap-6 justify-center items-center p-8 border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)]"
                >
                    <h2 className="font-bold text-base md:text-xl text-primaryWhite drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] text-center mb-2">
                        BEM-VINDO(A)!
                    </h2>

                    <input
                        className="w-full md:w-4/5 p-4 border-4 bg-primaryWhite border-black text-[10px] md:text-xs text-textBlack focus:outline-none focus:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all duration-200"
                        type="text"
                        placeholder="Nome"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        required
                    />

                    <input
                        className="w-full md:w-4/5 p-4 border-4 bg-primaryWhite border-black text-[10px] md:text-xs text-textBlack focus:outline-none focus:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all duration-200"
                        type="email"
                        placeholder="E-mail"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <div className="relative w-full md:w-4/5">
                        <input
                            className="w-full p-4 border-4 bg-primaryWhite border-black text-[10px] md:text-xs text-textBlack focus:outline-none focus:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all duration-200 pr-12"
                            type={showPassword ? "text" : "password"}
                            placeholder="Senha"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-4 flex items-center text-textBlack hover:scale-110 transition-transform">
                            {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                        </button>
                    </div>

                    <div className="relative w-full md:w-4/5 mb-4">
                        <input
                            className={`w-full p-4 border-4 ${error ? "border-crimsonRed" : "border-black"} bg-primaryWhite text-[10px] md:text-xs text-textBlack focus:outline-none focus:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all duration-200 pr-12`}
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirmar Senha"
                            value={confirmPassword}
                            onChange={(e) => {
                                setConfirmPassword(e.target.value);
                                if (password && e.target.value !== password) setError("As senhas não coincidem");
                                else setError("");
                            }}
                            required
                        />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-4 flex items-center text-textBlack hover:scale-110 transition-transform">
                            {showConfirmPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                        </button>
                        {error && (
                            <p className="absolute -bottom-6 left-0 text-[8px] md:text-[10px] text-primaryWhite bg-crimsonRed border-2 border-black px-2 py-0.5 font-bold">
                                {error}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="mt-2 w-full md:w-4/5 bg-vibratingBlue text-primaryWhite font-bold py-4 px-6 text-[10px] md:text-xs border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 uppercase"
                    >
                        CADASTRAR
                    </button>
                </form>
            </div>
        </div>
    );
}