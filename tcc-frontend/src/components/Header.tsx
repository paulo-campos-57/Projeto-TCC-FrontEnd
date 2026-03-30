import { useNavigate } from "react-router-dom";
import NavItem from "./NavItem";
import { useEffect, useState } from "react";

export default function Header() {
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
    };

    return (
        <div className="font-pressStart w-full h-16 bg-vibratingBlue flex justify-between items-center fixed top-0 left-0 right-0 z-50 border-b-4 border-black shadow-[0px_4px_0px_rgba(0,0,0,1)] px-4 md:px-8">

            <div className="flex items-center gap-3 md:gap-4">
                <img src="/vite.svg" className="w-8 md:w-10 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]" alt="Logo" />
                <h1 className="text-primaryWhite text-sm md:text-xl lg:text-2xl drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                    TCC - App
                </h1>
            </div>

            <div className="flex items-center gap-4 md:gap-8 text-primaryWhite text-[8px] md:text-xs">
                <span
                    onClick={handleHomeClick}
                    className="cursor-pointer hover:-translate-y-1 hover:text-yellow-300 active:translate-y-0 transition-all drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                >
                    <NavItem>Início</NavItem>
                </span>
                <span
                    onClick={() => navigate('/Tutorial')}
                    className="cursor-pointer hover:-translate-y-1 hover:text-yellow-300 active:translate-y-0 transition-all drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                >
                    <NavItem>Tutorial</NavItem>
                </span>
                <span
                    className="cursor-pointer hover:-translate-y-1 hover:text-yellow-300 active:translate-y-0 transition-all drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                >
                    <NavItem>Sobre</NavItem>
                </span>
            </div>
        </div>
    );
}