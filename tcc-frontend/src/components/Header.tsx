import { useEffect, useState } from 'react';
import { useNavigate, type To } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

import NavItem from './NavItem';

export default function Header() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('user');
    setIsLoggedIn(!!user);
  }, []);

  const handleHomeClick = () => {
    const path = isLoggedIn ? '/UsuarioHome' : '/';
    navigate(path);
    setIsMenuOpen(false);
  };

  const navTo = (path: To) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b-4 border-black bg-vibratingBlue font-pressStart shadow-[0px_4px_0px_rgba(0,0,0,1)]">
      <div className="flex h-16 items-center justify-between px-4 md:px-8">

        <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleHomeClick()}>
          <img
            src="/logo.png"
            className="w-8 h-auto drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] md:w-10"
            alt="Logo"
          />
          <h1 className="text-sm text-primaryWhite drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] md:text-xl lg:text-2xl">
            Tapiocaria
          </h1>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs text-primaryWhite">
          <button onClick={handleHomeClick} className="hover:-translate-y-1 hover:text-yellow-300 transition-all">
            <NavItem>Início</NavItem>
          </button>
          <button onClick={() => navTo('/Tutorial')} className="hover:-translate-y-1 hover:text-yellow-300 transition-all">
            <NavItem>Tutorial</NavItem>
          </button>
          <button onClick={() => navTo('/Sobre')} className="hover:-translate-y-1 hover:text-yellow-300 transition-all">
            <NavItem>Sobre</NavItem>
          </button>
        </nav>

        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-primaryWhite p-1 border-2 border-black bg-black/20"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-vibratingBlue border-t-4 border-black p-4 flex flex-col gap-4 text-[10px] text-primaryWhite animate-in slide-in-from-top duration-300">
          <span onClick={handleHomeClick} className="py-2 active:text-yellow-300">
            <NavItem>Início</NavItem>
          </span>
          <span onClick={() => navTo('/Tutorial')} className="py-2 active:text-yellow-300">
            <NavItem>Tutorial</NavItem>
          </span>
          <span onClick={() => navTo('/Sobre')} className="py-2 active:text-yellow-300">
            <NavItem>Sobre</NavItem>
          </span>
        </div>
      )}
    </header>
  );
}