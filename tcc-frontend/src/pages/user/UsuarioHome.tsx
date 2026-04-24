import { toast } from 'react-hot-toast/headless';
import { useNavigate } from 'react-router-dom';

import Header from '../../components/Header';

export default function UsuarioHome() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    fetch('http://127.0.0.1:5000/user/logout', {
      method: 'POST',
    });

    toast.success('Logout realizado com sucesso!');
    setTimeout(() => navigate('/'), 2000);
  };

  const userName =
    JSON.parse(localStorage.getItem('user') || '{}').nome || 'Jogador';

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-primaryWhite font-pressStart">
      <Header />

      <div className="mt-8 flex flex-1 flex-col items-center justify-center gap-6 px-4 md:mt-0 md:gap-10">
        <h1 className="text-center text-lg leading-relaxed text-vibratingBlue drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] md:text-3xl lg:text-4xl">
          Bem-vindo(a),
          <br className="md:hidden" /> {userName}!
        </h1>

        <div className="flex w-[90%] max-w-lg flex-col items-center justify-center gap-6 border-4 border-black bg-lightGreen p-8 shadow-[8px_8px_0px_rgba(0,0,0,1)]">
          <p className="text-center text-[10px] leading-relaxed text-primaryWhite drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] md:text-xs">
            Selecione uma das opções:
          </p>

          <div className="mt-2 flex w-full flex-col items-center justify-center gap-4 md:w-4/5">
            <button
              className="w-full border-4 border-black bg-goldenYellow py-4 text-xs text-textBlack shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:-translate-y-2 hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)] md:text-sm"
              onClick={() => navigate('/JogoCadastro')}
            >
              JOGAR
            </button>

            <button
              className="w-full border-4 border-black bg-goldenYellow py-4 text-xs text-textBlack shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:-translate-y-2 hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)] md:text-sm"
              onClick={() => navigate('/Ranking')}
            >
              RANKING
            </button>

            <button
              className="w-full border-4 border-black bg-goldenYellow py-4 text-xs text-textBlack shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:-translate-y-2 hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)] md:text-sm"
              onClick={() => navigate('/Perfil')}
            >
              PERFIL
            </button>

            <div className="my-2 w-full border-b-4 border-black opacity-20"></div>

            <button
              className="w-2/3 border-4 border-black bg-crimsonRed py-3 text-[10px] text-primaryWhite shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:-translate-y-1 hover:bg-red-600 active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)] md:w-1/2 md:text-xs"
              onClick={handleLogout}
            >
              SAIR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
