import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

import Footer from '../../components/Footer';
import Header from '../../components/Header';
import NavItem from '../../components/NavItem';

export default function Index() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    const loadingToast = toast.loading('Autenticando...');

    try {
      const response = await fetch('http://127.0.0.1:5000/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, senha: password }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Bem-vindo, ${data.User?.nome}!`, { id: loadingToast });
        localStorage.setItem('token', JSON.stringify(data.token));
        localStorage.setItem('user', JSON.stringify(data.User));
        setTimeout(() => navigate('/UsuarioHome'), 2000);
      } else {
        toast.error(data.error || 'Falha no login', { id: loadingToast });
      }
    } catch (err) {
      toast.error('Servidor offline ou erro de conexão', { id: loadingToast });
    }
  };

  return (
    <>
      <div className="flex min-h-screen w-full flex-col bg-primaryWhite font-pressStart">
        <Toaster position="top-right" />
        <Header />

        <div className="flex flex-1 flex-col pt-16 md:flex-row">

          <div className="flex w-full flex-col items-center justify-center bg-lightGreen p-6 py-12 font-bold text-textBlack md:w-1/2 md:p-8">
            <h1 className="mb-6 text-center text-xl text-primaryWhite drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] md:text-3xl lg:text-4xl">
              Fazer login
            </h1>

            <form
              onSubmit={handleLogin}
              className="flex w-full max-w-md flex-col gap-4 border-4 border-black bg-primaryWhite p-6 shadow-[6px_6px_0px_rgba(0,0,0,1)]"
            >
              <input
                className="w-full border-4 border-black bg-primaryWhite p-3 text-[10px] text-textBlack placeholder-gray-500 transition duration-200 focus:bg-gray-100 focus:outline-none md:text-xs"
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <div className="relative w-full">
                <input
                  className="w-full border-4 border-black bg-primaryWhite p-3 pr-12 text-[10px] text-textBlack placeholder-gray-500 transition duration-200 focus:bg-gray-100 focus:outline-none md:text-xs"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-black hover:text-vibratingBlue focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <button
                type="submit"
                className="mt-4 border-4 border-black bg-vibratingBlue px-6 py-3 text-[10px] text-primaryWhite shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all hover:bg-blue-700 active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)] md:text-xs"
              >
                ENTRAR
              </button>

              <div className="mt-4 text-center text-[8px] leading-relaxed text-gray-700 md:text-[10px]">
                Ainda não tem uma conta?
                <br className="md:hidden" />
                <span
                  className="ml-2 cursor-pointer font-bold text-crimsonRed hover:underline"
                  onClick={() => navigate('/Cadastro')}
                >
                  Cadastre-se
                </span>
              </div>
            </form>
          </div>

          <div className="flex w-full flex-col items-center justify-center border-t-4 border-black bg-primaryWhite p-8 py-16 font-bold text-textBlack md:w-1/2 md:border-l-4 md:border-t-0">
            <h1
              className="w-full max-w-xs cursor-pointer border-4 border-black bg-white p-6 text-center text-xs shadow-[8px_8px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-1 active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)] md:max-w-md md:text-xl lg:text-2xl"
              onClick={() => setShowConfirmPopup(true)}
            >
              <NavItem>Jogar sem conta</NavItem>
            </h1>
          </div>
        </div>
        <Footer />
      </div>

      {showConfirmPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-sm border-4 border-black bg-primaryWhite p-6 text-center font-pressStart shadow-[8px_8px_0px_rgba(0,0,0,1)] md:p-8">
            <h2 className="mb-4 text-sm text-textBlack md:text-xl">
              Tem certeza? ⚠️
            </h2>
            <p className="mb-8 text-[8px] leading-relaxed text-gray-700 md:text-[10px]">
              Ao jogar sem conta, seu progresso não será salvo e você não terá estatísticas.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <button
                onClick={() => navigate('/JogoConvidado')}
                className="flex-1 border-4 border-black bg-vibratingBlue py-3 text-[10px] text-primaryWhite shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
              >
                SIM
              </button>
              <button
                onClick={() => setShowConfirmPopup(false)}
                className="flex-1 border-4 border-black bg-crimsonRed py-3 text-[10px] text-primaryWhite shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
              >
                CANCELAR
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}