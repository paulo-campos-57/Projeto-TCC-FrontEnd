import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import Header from '../../components/Header';

export default function JogoCadastro() {
  const navigate = useNavigate();

  const handleGameMode = async (tempo: string) => {
    try {
      const response = await fetch(
        'http://127.0.0.1:5000/bairro/iniciar_sessao',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tempo }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        navigate(data.redirect_to, {
          state: { tempoDeJogo: data.tempoDeJogo },
        });
      } else {
        toast.error(data.error);
      }
    } catch (err) {
      toast.error('Erro ao falar com o servidor');
    }
  };

  const userName =
    JSON.parse(localStorage.getItem('user') || '{}').nome || 'Jogador';

  return (
    <>
      <div className="flex min-h-screen w-full flex-col overflow-y-auto bg-primaryWhite font-pressStart">
        <Header />

        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 pb-20 pt-24 md:gap-6">
          <h1 className="text-center text-base leading-relaxed text-vibratingBlue drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] md:text-2xl lg:text-3xl">
            Bem-vindo(a),
            <br className="md:hidden" /> {userName}!
          </h1>

          <div className="flex w-[95%] max-w-lg flex-col items-center justify-center gap-4 border-4 border-black bg-lightGreen p-6 shadow-[8px_8px_0px_rgba(0,0,0,1)]">
            <p className="text-center text-[8px] leading-relaxed text-primaryWhite drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] md:text-[10px]">
              Selecione uma das opções para iniciar:
            </p>

            <div className="mt-2 flex w-full flex-col gap-3 md:w-4/5">
              <button
                onClick={() => handleGameMode('1 semana')}
                className="w-full border-4 border-black bg-goldenYellow py-3 text-[10px] text-textBlack shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)] md:text-xs"
              >
                Jogo de 1 semana
              </button>
              <button
                onClick={() => handleGameMode('15 dias')}
                className="w-full border-4 border-black bg-goldenYellow py-3 text-[10px] text-textBlack shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)] md:text-xs"
              >
                Jogo de 15 dias
              </button>
              <button
                onClick={() => handleGameMode('1 mês')}
                className="w-full border-4 border-black bg-goldenYellow py-3 text-[10px] text-textBlack shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)] md:text-xs"
              >
                Jogo de 1 mês
              </button>
              <button
                onClick={() => handleGameMode('livre')}
                className="w-full border-4 border-black bg-goldenYellow py-3 text-[10px] text-textBlack shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)] md:text-xs"
              >
                Jogo livre
              </button>
            </div>

            <div className="my-2 w-full border-b-4 border-black opacity-20 md:w-4/5"></div>

            <button
              className="w-2/3 border-4 border-black bg-crimsonRed py-2 text-[10px] text-primaryWhite shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:-translate-y-1 hover:bg-red-600 active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)] md:w-1/2 md:text-xs"
              onClick={() => navigate('/UsuarioHome')}
            >
              VOLTAR
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
