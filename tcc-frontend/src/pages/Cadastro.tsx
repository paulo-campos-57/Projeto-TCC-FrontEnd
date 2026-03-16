import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Header from "../components/Header";
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
            const response = await fetch("http://127.0.0.1:5000/register", {
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
        }
    };

    return (
        <div className="font-pressStart w-screen h-screen flex flex-col bg-primaryWhite">
            <Toaster position="top-right" />
            <Header />
            <div className="h-screen w-screen flex flex-col justify-center items-center">
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col w-2/4 bg-lightGreen gap-8 justify-center items-center rounded-2xl p-8 shadow-lg"
                >
                    <h2 className="font-bold text-2xl text-primaryWhite">Bem vindo!</h2>

                    <input
                        className="w-3/5 p-3 border-2 bg-primaryWhite border-goldenYellow rounded-lg text-textBlack focus:outline-none focus:ring-2 focus:ring-vibratingBlue transition duration-200"
                        type="text"
                        placeholder="Nome"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        required
                    />

                    <input
                        className="w-3/5 p-3 border-2 bg-primaryWhite border-goldenYellow rounded-lg text-textBlack focus:outline-none focus:ring-2 focus:ring-vibratingBlue transition duration-200"
                        type="email"
                        placeholder="E-mail"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <div className="relative w-3/5">
                        <input
                            className="w-full p-3 border-2 bg-primaryWhite border-goldenYellow rounded-lg text-textBlack focus:outline-none transition duration-200 pr-10"
                            type={showPassword ? "text" : "password"}
                            placeholder="Senha"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-3 flex items-center text-gray-500">
                            {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                        </button>
                    </div>

                    <div className="relative w-3/5">
                        <input
                            className={`w-full p-3 border-2 ${error ? "border-red-500" : "border-goldenYellow"} bg-primaryWhite rounded-lg text-textBlack focus:outline-none transition duration-200 pr-10`}
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
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-3 flex items-center text-gray-500">
                            {showConfirmPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                        </button>
                        {error && <p className="absolute -bottom-6 left-0 text-sm text-red-500">{error}</p>}
                    </div>

                    <button
                        type="submit"
                        className="mt-4 bg-vibratingBlue text-primaryWhite font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition duration-200"
                    >
                        Cadastrar
                    </button>
                </form>
            </div>
        </div>
    );
}