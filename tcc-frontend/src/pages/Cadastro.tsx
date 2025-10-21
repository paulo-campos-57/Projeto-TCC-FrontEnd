import Header from "../components/Header";

export default function Cadastro() {
    return (
        <>
            <div className="font-pressStart w-screen h-screen flex flex-col bg-primaryWhite">
                <Header />
                <div className="h-screen w-screen flex flex-col justify-center items-center">
                    <div className="flex flex-col w-2/4 bg-lightGreen gap-8 justify-center items-center rounded-2xl p-8 shadow-lg">
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
                    </div>
                </div>
            </div>
        </>
    );
}