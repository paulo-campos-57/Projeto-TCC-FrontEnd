import { useNavigate } from 'react-router-dom';

import Header from '../../components/Header';

export default function JogoConvidado() {
  const navigate = useNavigate();

  const handleGameMode = (tempo: string) => {
    navigate('/PaginaJogo', { state: { tempoDeJogo: tempo } });
  };

  return (
    <div className="flex min-h-screen w-full flex-col overflow-y-auto bg-primaryWhite font-pressStart">
      <Header />

      <div className="flex w-full flex-1 flex-col items-center justify-center gap-8 px-4 pb-20 pt-24">
        <h1 className="text-center text-xl font-bold uppercase text-textBlack drop-shadow-[2px_2px_0px_rgba(0,0,0,0.2)] md:text-3xl">
          Jogo Convidado
        </h1>

        <div className="flex w-full max-w-lg flex-col items-center justify-center gap-6 border-4 border-black bg-lightGreen p-8 shadow-[8px_8px_0px_rgba(0,0,0,1)] md:w-2/3 lg:w-1/2">
          <p className="mb-2 text-center text-[10px] font-bold uppercase text-primaryWhite drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] md:text-xs">
            Selecione o tempo de jogo:
          </p>

          <div className="flex w-full flex-col gap-4 md:w-4/5">
            <button
              onClick={() => handleGameMode('1 semana')}
              className="w-full border-4 border-black bg-goldenYellow px-6 py-4 text-[10px] font-bold uppercase text-textBlack shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)] md:text-xs"
            >
              1 Semana
            </button>
            <button
              onClick={() => handleGameMode('15 dias')}
              className="w-full border-4 border-black bg-goldenYellow px-6 py-4 text-[10px] font-bold uppercase text-textBlack shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)] md:text-xs"
            >
              15 Dias
            </button>
            <button
              onClick={() => handleGameMode('1 mês')}
              className="w-full border-4 border-black bg-goldenYellow px-6 py-4 text-[10px] font-bold uppercase text-textBlack shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)] md:text-xs"
            >
              1 Mês
            </button>
            <button
              onClick={() => handleGameMode('livre')}
              className="w-full border-4 border-black bg-goldenYellow px-6 py-4 text-[10px] font-bold uppercase text-textBlack shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)] md:text-xs"
            >
              Jogo Livre
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
