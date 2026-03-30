import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "../../components/Header";

export default function Tutorial() {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const user = localStorage.getItem("user");
        setIsLoggedIn(!!user);
    }, []);

    const handleHomeClick = () => {
        if (isLoggedIn) {
            navigate('/UsuarioHome');
        } else {
            navigate('/');
        }
    }

    const steps = [
        "Crie uma conta ou jogue como convidado",
        "Selecione o tempo de jogo (1 semana, 15 dias, 1 mês ou livre)",
        "Escolha o bairro (Isso afetará a preferência dos clientes)",
        "Compre os ingredientes para criar suas tapiocas",
        "Crie a receita com base na demanda do seu bairro",
        "Defina o preço de venda da sua tapioca",
        "Acompanhe as vendas e o feedback dos clientes"
    ];

    return (
        <div className="font-pressStart h-screen overflow-hidden flex flex-col bg-primaryWhite">
            <Header />

            <div className="flex-1 w-full flex flex-col justify-center items-center px-4 py-2">

                <h1 className="text-xl md:text-3xl mb-2 text-center drop-shadow-md">
                    Como Jogar
                </h1>

                <p className="text-[10px] md:text-xs mb-4 text-center max-w-2xl text-gray-700">
                    Siga o passo a passo para se tornar o maior vendedor de tapioca!
                </p>

                <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3 mb-6">
                    {steps.map((step, index) => (
                        <div
                            key={index}
                            className="flex items-center py-2 px-3 bg-white border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] rounded-md transform hover:-translate-y-1 transition-transform duration-200"
                        >
                            <div className="flex-shrink-0 w-8 h-8 bg-vibratingBlue text-primaryWhite flex items-center justify-center text-xs border-2 border-black rounded-full mr-3">
                                {index + 1}
                            </div>

                            <p className="text-[9px] md:text-[10px] leading-snug">
                                {step}
                            </p>
                        </div>
                    ))}
                </div>

                <button
                    className="px-8 py-2 bg-vibratingBlue text-primaryWhite text-xs md:text-sm border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-blue-700 active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)] transition-all"
                    onClick={handleHomeClick}
                >
                    VOLTAR
                </button>
            </div>
        </div>
    );
}