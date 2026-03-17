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
        <div className="font-pressStart w-screen h-16 bg-vibratingBlue text-textBlack flex justify-between items-center fixed top-0 left-0 right-0 z-50">
            <div className="flex justify-evenly items-center w-1/5">
                <img src="/vite.svg" className="w-10" />
                <h1 className="text-primaryWhite text-2xl font-bold ml-4">TCC - App</h1>
            </div>
            <div className="flex justify-evenly items-center w-1/6 text-primaryWhite">
                <span onClick={handleHomeClick} className="cursor-pointer">
                    <NavItem>Início</NavItem>
                </span>
                <span className="cursor-pointer">
                    <NavItem>Sobre</NavItem>
                </span>
            </div>
        </div>
    );
}