import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ArrowLeft, FileCode, Globe, Laptop, User } from 'lucide-react';

import Footer from '../../components/Footer';
import Header from '../../components/Header';

export default function Sobre() {
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
    <div className="flex min-h-screen flex-col bg-primaryWhite font-pressStart text-textBlack">
      <Header />

      <div className="flex flex-1 flex-col items-center justify-center px-4 py-24">
        <div className="w-full max-w-3xl border-4 border-black bg-white p-6 shadow-[8px_8px_0px_rgba(0,0,0,1)] md:p-10">
          <div className="mb-10 space-y-6 border-b-4 border-dashed border-gray-200 pb-10 text-justify text-[10px] leading-relaxed md:text-xs">
            <p className="border-l-4 border-lightGreen pl-4">
              Este software é parte integrante do Trabalho de Conclusão de Curso
              (TCC) para a graduação em
              <span className="font-bold text-vibratingBlue">
                {' '}
                Ciência da Computação
              </span>
              .
            </p>
            <p>
              O núcleo pedagógico baseia-se na{' '}
              <span className="font-bold text-crimsonRed">
                Teoria dos Campos Conceituais
              </span>{' '}
              de
              <span className="font-bold italic"> Gérard Vergnaud</span>. O jogo
              utiliza a tripla <span className="underline">SIR</span>{' '}
              (Situações, Invariantes e Resultados) para transformar a gestão de
              uma tapiocaria em um ambiente de aprendizagem matemática ativa.
            </p>
          </div>

          <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2">
            <a
              href="https://github.com/paulo-campos-57/Projeto-TCC-BackEnd/tree/development"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 border-4 border-black p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-1 hover:bg-gray-50 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-0"
            >
              <Laptop size={24} className="text-vibratingBlue" />
              <div className="flex flex-col">
                <span className="text-[8px] font-bold uppercase text-gray-400">
                  Código Fonte
                </span>
                <span className="text-[10px] font-bold">REPOSITÓRIO</span>
              </div>
            </a>

            <a
              href="http://localhost:5000/api-docs/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 border-4 border-black p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-1 hover:bg-gray-50 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-0"
            >
              <FileCode size={24} className="text-crimsonRed" />
              <div className="flex flex-col">
                <span className="text-[8px] font-bold uppercase text-gray-400">
                  Documentação
                </span>
                <span className="text-[10px] font-bold">SWAGGER UI</span>
              </div>
            </a>

            <a
              href="https://github.com/paulo-campos-57"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 border-4 border-black p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-1 hover:bg-gray-50 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-0"
            >
              <User size={24} />
              <div className="flex flex-col">
                <span className="text-[8px] font-bold uppercase text-gray-400">
                  Desenvolvedor
                </span>
                <span className="text-[10px] font-bold">PAULO CAMPOS</span>
              </div>
            </a>

            <div className="flex items-center gap-4 border-4 border-black bg-gray-50 p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
              <Globe size={24} className="text-lightGreen" />
              <div className="flex flex-col">
                <span className="text-[8px] font-bold uppercase text-gray-400">
                  Instituição
                </span>
                <span className="text-[10px] font-bold">CESAR School</span>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              className="group flex items-center gap-3 border-4 border-black bg-vibratingBlue px-12 py-4 text-xs text-primaryWhite shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all hover:bg-blue-700 active:translate-y-1 active:shadow-none md:text-sm"
              onClick={handleHomeClick}
            >
              <ArrowLeft
                size={18}
                className="transition-transform group-hover:-translate-x-1"
              />
              VOLTAR
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
