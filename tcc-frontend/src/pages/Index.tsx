import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import NavItem from "../components/NavItem";

export default function Index() {
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    return (
        <>
            <div className="w-screen h-screen flex flex-col bg-primaryWhite">
                <Header />
                <div className="flex flex-1">
                    {/* LADO ESQUERDO - LOGIN */}
                    <div className="w-1/2 h-full flex flex-col justify-center items-center text-textBlack font-bold bg-lightGreen p-8 rounded-none shadow-lg">
                        <h1 className="text-4xl font-bold mb-6">Fazer login</h1>

                        <div className="flex flex-col gap-4 w-2/3 bg-primaryWhite p-6 rounded-2xl shadow-md">
                            <input
                                className="w-full p-3 border-2 bg-primaryWhite border-goldenYellow rounded-lg text-textBlack placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-vibratingBlue focus:border-vibratingBlue transition duration-200"
                                type="email"
                                placeholder="E-mail"
                            />

                            <div className="relative w-full">
                                <input
                                    className="w-full p-3 border-2 bg-primaryWhite border-goldenYellow rounded-lg text-textBlack placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-vibratingBlue focus:border-vibratingBlue transition duration-200 pr-10"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Senha"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-vibratingBlue transition duration-200 focus:outline-none active:outline-none"
                                >
                                    {showPassword ? (
                                        <EyeOff size={22} />
                                    ) : (
                                        <Eye size={22} />
                                    )}
                                </button>
                            </div>

                            <button className="mt-4 bg-vibratingBlue text-primaryWhite font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-goldenYellow hover:text-textBlack transition duration-300">
                                Entrar
                            </button>

                            <div className="text-center text-gray-600 mt-4">
                                Ainda não tem uma conta?
                                <span
                                    className="text-crimsonRed font-bold cursor-pointer ml-2"
                                    onClick={() => navigate('/Cadastro')}>
                                    <NavItem>
                                        Cadastre-se
                                    </NavItem>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* LADO DIREITO - JOGAR SEM CONTA */}
                    <div className="w-1/2 h-full flex flex-col justify-center items-center text-textBlack font-bold bg-primaryWhite p-8 rounded-none shadow-lg">
                        <h1 className="text-4xl font-bold">
                            <NavItem>
                                Jogar sem conta
                            </NavItem>
                        </h1>
                    </div>
                </div>
            </div>
        </>
    );
}
