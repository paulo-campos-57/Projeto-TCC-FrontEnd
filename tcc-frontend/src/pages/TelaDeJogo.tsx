import { useState } from "react";
import { useLocation } from "react-router-dom";
import Header from "../components/Header";

export default function TelaDeJogo() {
    const location = useLocation();

    const { bairro, tempoDeJogo } = location.state || {};

    const [showPopup, setShowPopup] = useState(true);
    const [budget, setBudget] = useState(100);
    const [ingredients, setIngredients] = useState([
        { nome: "Goma de Tapioca", preco: 10, comprado: false },
        { nome: "Queijo Coalho", preco: 15, comprado: false },
        { nome: "Coco Ralado", preco: 8, comprado: false },
        { nome: "Leite Condensado", preco: 12, comprado: false },
    ]);

    const buyIngridient = (index: number) => {
        const item = ingredients[index];
        if (!item) return;
        if (item.comprado) return;
        if (budget < item.preco) {
            alert("Orçamento insuficiente!");
            return;
        }

        const newIngredients = [...ingredients];
        newIngredients[index].comprado = true;
        setIngredients(newIngredients);
        setBudget(budget - item.preco);
    };

    const allDone = ingredients.every((ing) => ing.comprado);

    const confirm = () => {
        if (!allDone) {
            alert("Compre todos os ingredientes antes de começar!");
            return;
        }
        setShowPopup(false);
    };

    const showIngredients = () => {
        const comprados = ingredients.filter((i) => i.comprado);
        if (comprados.length === 0) {
            return <p className="text-gray-600">Nenhum ingrediente comprado ainda.</p>;
        }
        return (
            <ul className="mt-4 flex flex-wrap justify-center gap-3">
                {comprados.map((item, index) => (
                    <li
                        key={index}
                        className="bg-green-100 border border-green-400 px-4 py-2 rounded-xl text-sm font-semibold"
                    >
                        {item.nome}
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <div className="font-pressStart w-screen h-screen flex flex-col bg-primaryWhite relative">
            <Header />

            {/* Conteúdo do jogo */}
            {!showPopup && (
                <div className="h-full flex flex-col justify-center items-center">
                    <h1 className="text-2xl">Bem-vindo ao Jogo!</h1>
                    <p>Você está jogando no bairro: {bairro}</p>
                    <p>Você tem {tempoDeJogo} para vender o maior número de tapiocas possível!</p>
                    <div className="w-full max-w-lg mt-6">
                        <h2 className="text-lg mb-2">Ingredientes Comprados:</h2>
                        {showIngredients()}
                    </div>
                </div>
            )}

            {/* Popup inicial */}
            {showPopup && (
                <div className="absolute inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
                    <div className="bg-white w-11/12 md:w-3/4 lg:w-2/3 h-5/6 rounded-2xl shadow-xl p-6 flex flex-col justify-between">
                        <div>
                            <h2 className="text-2xl text-center mb-4">Preparação para o jogo</h2>
                            <p className="text-center text-lg mb-4">
                                Bairro: <strong>{bairro}</strong> <br />
                                Tempo de jogo: <strong>{tempoDeJogo}</strong>
                            </p>

                            <div className="text-center mb-6">
                                <p className="text-xl">💰 Orçamento: R$ {budget}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {ingredients.map((item, index) => (
                                    <div
                                        key={index}
                                        className={`border rounded-xl p-4 text-center transition ${item.comprado
                                            ? "bg-green-100 border-green-400"
                                            : "bg-gray-100 hover:bg-gray-200"
                                            }`}
                                    >
                                        <p className="text-lg">{item.nome}</p>
                                        <p className="text-sm mb-2">Preço: R$ {item.preco}</p>
                                        <button
                                            disabled={item.comprado}
                                            onClick={() => buyIngridient(index)}
                                            className={`px-4 py-2 rounded-xl font-bold ${item.comprado
                                                ? "bg-green-400 cursor-default text-white"
                                                : "bg-blue-500 hover:bg-blue-600 text-white"
                                                }`}
                                        >
                                            {item.comprado ? "Comprado" : "Comprar"}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="text-center mt-6">
                            <button
                                onClick={confirm}
                                className={`px-6 py-3 rounded-xl text-lg font-bold ${allDone
                                    ? "bg-green-600 hover:bg-green-700 text-white"
                                    : "bg-gray-400 text-gray-700 cursor-not-allowed"
                                    }`}
                            >
                                Começar Jogo
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}