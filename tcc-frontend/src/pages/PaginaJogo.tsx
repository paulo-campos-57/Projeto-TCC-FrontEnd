import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";

export default function PaginaJogo() {
    const location = useLocation();
    const navigate = useNavigate();
    const { tempoDeJogo } = location.state || {};
    const [showPopup, setShowPopup] = useState(true);

    const handleContinue = () => {
        setShowPopup(false);
    };

    const handleGoBack = () => {
        navigate('/JogoConvidado');
    };

    return (
        <div className="w-screen h-screen font-pressStart flex flex-col bg-primaryWhite relative">
            <Header />
            <div className="flex flex-1 flex-col gap-8 justify-center items-center">
                <h1 className="text-3xl font-bold text-textBlack">
                    Tempo de jogo selecionado: {tempoDeJogo || "não definido"}
                </h1>
            </div>

            {showPopup && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-50">
                    <div className="bg-white rounded-2xl shadow-xl p-10 w-[90%] max-w-lg text-center flex flex-col gap-6">
                        <h2 className="text-2xl font-bold text-textBlack">
                            Tempo de jogo selecionado
                        </h2>
                        <p className="text-lg text-gray-700 text-center">
                            {tempoDeJogo ? (
                                tempoDeJogo.toLowerCase() === "livre" ? (
                                    <>
                                        Você escolheu o modo <strong>livre</strong>! <br />
                                        <hr className="my-4" />
                                        Nesse modo, você pode jogar sem limites de tempo, apenas divirta-se,
                                        explore suas estratégias e veja até onde consegue chegar
                                        como mestre das tapiocas!
                                    </>
                                ) : (
                                    <>
                                        Você escolheu <strong>{tempoDeJogo}</strong> como tempo de jogo. <br />
                                        <hr className="my-4" />
                                        Durante esse período, seu objetivo é vender o maior número possível
                                        de tapiocas e acumular a maior quantia de dinheiro antes
                                        que o tempo acabe.
                                        <br />
                                        Boa sorte, vendedor(a)!
                                    </>
                                )
                            ) : (
                                "Nenhum tempo foi selecionado."
                            )}
                        </p>

                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={handleGoBack}
                                className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition font-bold"
                            >
                                Voltar
                            </button>
                            <button
                                onClick={handleContinue}
                                className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition font-bold"
                            >
                                Continuar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
