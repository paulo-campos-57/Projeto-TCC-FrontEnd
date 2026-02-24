import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Header from "../components/Header";

export default function Cadastro() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
        if (confirmPassword && e.target.value !== confirmPassword) {
            setError("As senhas não coincidem");
        } else {
            setError("");
        }
    };

    const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setConfirmPassword(e.target.value);
        if (password && e.target.value !== password) {
            setError("As senhas não coincidem");
        } else {
            setError("");
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("As senhas não coincidem");
            return;
        }
        alert("Cadastro realizado com sucesso!");
    };

    return (
        <div className="font-pressStart w-screen h-screen flex flex-col bg-primaryWhite">
            <Header />
            <div className="h-screen w-screen flex flex-col justify-center items-center">
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col w-2/4 bg-lightGreen gap-8 justify-center items-center rounded-2xl p-8 shadow-lg"
                >
                    <h2 className="font-bold text-2xl text-primaryWhite">Bem vindo!</h2>

                    <input
                        className="w-3/5 p-3 border-2 bg-primaryWhite border-goldenYellow rounded-lg text-textBlack placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-vibratingBlue focus:border-vibratingBlue transition duration-200"
                        type="text"
                        placeholder="Nome"
                    />

                    <input
                        className="w-3/5 p-3 border-2 bg-primaryWhite border-goldenYellow rounded-lg text-textBlack placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-vibratingBlue focus:border-vibratingBlue transition duration-200"
                        type="email"
                        placeholder="E-mail"
                    />

                    <div className="relative w-3/5">
                        <input
                            className="w-full p-3 border-2 bg-primaryWhite border-goldenYellow rounded-lg text-textBlack placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-vibratingBlue focus:border-vibratingBlue transition duration-200 pr-10"
                            type={showPassword ? "text" : "password"}
                            placeholder="Senha"
                            value={password}
                            onChange={handlePasswordChange}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-vibratingBlue transition duration-200 focus:outline-none active:outline-none"
                        >
                            {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                        </button>
                    </div>

                    <div className="relative w-3/5">
                        <input
                            className={`w-full p-3 border-2 ${error ? "border-red-500 focus:ring-red-500" : "border-goldenYellow focus:ring-vibratingBlue"
                                } bg-primaryWhite rounded-lg text-textBlack placeholder-gray-500 focus:outline-none transition duration-200 pr-10`}
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirmar Senha"
                            value={confirmPassword}
                            onChange={handleConfirmPasswordChange}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-vibratingBlue transition duration-200 focus:outline-none active:outline-none"
                        >
                            {showConfirmPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                        </button>

                        {/* Mensagem de erro */}
                        {error && (
                            <p className="absolute -bottom-6 left-0 text-sm text-red-500">
                                {error}
                            </p>
                        )}
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