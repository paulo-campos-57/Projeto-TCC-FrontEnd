import NavItem from "./NavItem";

export default function Header() {
    return (
        <div className="w-screen h-16 bg-vibratingBlue text-textBlack flex justify-between items-center fixed top-0 left-0 right-0 z-50">
            <div className="flex justify-evenly items-center w-1/6">
                <img src="/vite.svg" className="w-10" />
                <h1 className="text-primaryWhite text-2xl font-bold ml-4">TCC - App</h1>
            </div>
            <div className="flex justify-evenly items-center w-1/6">
                <NavItem>Início</NavItem>
                <NavItem>Sobre</NavItem>
            </div>
        </div>
    );
}