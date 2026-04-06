import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Header from '../../components/Header';

export default function Tutorial() {
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

  const steps = [
    'Crie uma conta ou jogue como convidado',
    'Selecione o tempo de jogo (1 semana, 15 dias, 1 mês ou livre)',
    'Escolha o bairro (Isso afetará a preferência dos clientes)',
    'Compre os ingredientes para criar suas tapiocas',
    'Crie a receita com base na demanda do seu bairro',
    'Defina o preço de venda da sua tapioca',
    'Acompanhe as vendas e o feedback dos clientes',
  ];

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-primaryWhite font-pressStart">
      <Header />

      <div className="flex w-full flex-1 flex-col items-center justify-center px-4 py-2">
        <h1 className="mb-2 text-center text-xl drop-shadow-md md:text-3xl">
          Como Jogar
        </h1>

        <p className="mb-4 max-w-2xl text-center text-[10px] text-gray-700 md:text-xs">
          Siga o passo a passo para se tornar o maior vendedor de tapioca!
        </p>

        <div className="mb-6 grid w-full max-w-4xl grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-2">
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex transform items-center rounded-md border-4 border-black bg-white px-3 py-2 shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-transform duration-200 hover:-translate-y-1"
            >
              <div className="mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 border-black bg-vibratingBlue text-xs text-primaryWhite">
                {index + 1}
              </div>

              <p className="text-[9px] leading-snug md:text-[10px]">{step}</p>
            </div>
          ))}
        </div>

        <button
          className="border-4 border-black bg-vibratingBlue px-8 py-2 text-xs text-primaryWhite shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all hover:bg-blue-700 active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)] md:text-sm"
          onClick={handleHomeClick}
        >
          VOLTAR
        </button>
      </div>
    </div>
  );
}
