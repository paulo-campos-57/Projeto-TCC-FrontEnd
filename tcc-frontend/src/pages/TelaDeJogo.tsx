import { useLocation } from "react-router-dom";
import Header from "../components/Header";

export default function TelaDeJogo() {
    const location = useLocation();

    const { bairro, tempoDeJogo } = location.state || {};

    return (
        <>
            <div className="font-pressStart w-screen h-screen flex flex-col bg-primaryWhite">
                <Header />
                <div className="h-screen w-screen flex flex-col justify-center items-center">
                    <h1 className="text-2xl">Bem-vindo ao Jogo!</h1>
                    <p>Você está jogando no bairro: {bairro}</p>
                    <p>Você tem {tempoDeJogo} para conseguir vender o maior número de tapiocas possível!</p>
                </div>
            </div>
        </>
    );
}