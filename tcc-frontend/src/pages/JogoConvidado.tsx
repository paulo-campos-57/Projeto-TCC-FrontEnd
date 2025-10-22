import Header from "../components/Header";

export default function JogoConvidado() {
    return (
        <>
            <div className="w-screen h-screen font-pressStart flex flex-col bg-primaryWhite">
                <Header />
                <div className="flex flex-1 flex-col gap-8 justify-center items-center">
                    <h1 className="text-4xl text-textBlack font-bold text-center mt-10">
                        Jogo como Convidado
                    </h1>

                    <div className="flex flex-col justify-center items-center gap-4 w-2/4 bg-lightGreen p-6 rounded-2xl shadow-md">
                        <p className="text-primaryWhite text-center">
                            Selecione uma das opções para iniciar:
                        </p>

                        <div className="flex flex-col w-3/5 gap-4">
                            <button className="w-full bg-goldenYellow text-primaryWhite font-bold py-3 rounded-lg hover:bg-yellow-500 transition duration-200">
                                Jogo de 1 semana
                            </button>
                            <button className="w-full bg-goldenYellow text-primaryWhite font-bold py-3 rounded-lg hover:bg-yellow-500 transition duration-200">
                                Jogo de 15 dias
                            </button>
                            <button className="w-full bg-goldenYellow text-primaryWhite font-bold py-3 rounded-lg hover:bg-yellow-500 transition duration-200">
                                Jogo de 1 mês
                            </button>
                            <button className="w-full bg-goldenYellow text-primaryWhite font-bold py-3 rounded-lg hover:bg-yellow-500 transition duration-200">
                                Jogo livre
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
