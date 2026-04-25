import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import NavItem from './NavItem';

export default function Header() {
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('user');
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
    <div className="fixed left-0 right-0 top-0 z-50 flex h-16 w-full items-center justify-between border-b-4 border-black bg-vibratingBlue px-4 font-pressStart shadow-[0px_4px_0px_rgba(0,0,0,1)] md:px-8">
      <div className="flex items-center gap-3 md:gap-4">
        <img
          src="/vite.svg"
          className="w-8 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] md:w-10"
          alt="Logo"
        />
        <h1 className="text-sm text-primaryWhite drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] md:text-xl lg:text-2xl">
          TCC - App
        </h1>
      </div>

      <div className="flex items-center gap-4 text-[8px] text-primaryWhite md:gap-8 md:text-xs">
        <span
          onClick={handleHomeClick}
          className="cursor-pointer drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-1 hover:text-yellow-300 active:translate-y-0"
        >
          <NavItem>Início</NavItem>
        </span>
        <span
          onClick={() => navigate('/Tutorial')}
          className="cursor-pointer drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-1 hover:text-yellow-300 active:translate-y-0"
        >
          <NavItem>Tutorial</NavItem>
        </span>
        <span
          onClick={() => navigate('/Sobre')}
          className="cursor-pointer drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-1 hover:text-yellow-300 active:translate-y-0"
        >
          <NavItem>Sobre</NavItem>
        </span>
      </div>
    </div>
  );
}
