import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import { Eye, EyeOff } from 'lucide-react';

import Header from '../../components/Header';

export default function Cadastro() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    const loadingToast = toast.loading('Realizando cadastro...');

    try {
      const response = await fetch('http://https://tapiocaria-backend.onrender.com/user/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: nome,
          email: email,
          senha: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Cadastro realizado com sucesso!', { id: loadingToast });
        setTimeout(() => navigate('/'), 2000);
      } else {
        toast.error(data.error || 'Erro ao realizar cadastro', {
          id: loadingToast,
        });
      }
    } catch (err) {
      toast.error('Não foi possível conectar ao servidor', {
        id: loadingToast,
      });
      console.log('Erro no cadastro:', err);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col overflow-y-auto bg-primaryWhite font-pressStart">
      <Toaster position="top-right" />
      <Header />

      <div className="flex w-full flex-1 flex-col items-center justify-center px-4 pb-20 pt-24">
        <form
          onSubmit={handleSubmit}
          className="flex w-full max-w-lg flex-col items-center justify-center gap-6 border-4 border-black bg-lightGreen p-8 shadow-[8px_8px_0px_rgba(0,0,0,1)] md:w-2/3 lg:w-1/2"
        >
          <h2 className="mb-2 text-center text-base font-bold text-primaryWhite drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] md:text-xl">
            BEM-VINDO(A)!
          </h2>

          <input
            className="w-full border-4 border-black bg-primaryWhite p-4 text-[10px] text-textBlack transition-all duration-200 focus:shadow-[4px_4px_0px_rgba(0,0,0,1)] focus:outline-none md:w-4/5 md:text-xs"
            type="text"
            placeholder="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />

          <input
            className="w-full border-4 border-black bg-primaryWhite p-4 text-[10px] text-textBlack transition-all duration-200 focus:shadow-[4px_4px_0px_rgba(0,0,0,1)] focus:outline-none md:w-4/5 md:text-xs"
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="relative w-full md:w-4/5">
            <input
              className="w-full border-4 border-black bg-primaryWhite p-4 pr-12 text-[10px] text-textBlack transition-all duration-200 focus:shadow-[4px_4px_0px_rgba(0,0,0,1)] focus:outline-none md:text-xs"
              type={showPassword ? 'text' : 'password'}
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-4 flex items-center text-textBlack transition-transform hover:scale-110"
            >
              {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
            </button>
          </div>

          <div className="relative mb-4 w-full md:w-4/5">
            <input
              className={`w-full border-4 p-4 ${error ? 'border-crimsonRed' : 'border-black'} bg-primaryWhite pr-12 text-[10px] text-textBlack transition-all duration-200 focus:shadow-[4px_4px_0px_rgba(0,0,0,1)] focus:outline-none md:text-xs`}
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirmar Senha"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (password && e.target.value !== password)
                  setError('As senhas não coincidem');
                else setError('');
              }}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-4 flex items-center text-textBlack transition-transform hover:scale-110"
            >
              {showConfirmPassword ? <EyeOff size={22} /> : <Eye size={22} />}
            </button>
            {error && (
              <p className="absolute -bottom-6 left-0 border-2 border-black bg-crimsonRed px-2 py-0.5 text-[8px] font-bold text-primaryWhite md:text-[10px]">
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="mt-2 w-full border-4 border-black bg-vibratingBlue px-6 py-4 text-[10px] font-bold uppercase text-primaryWhite shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)] md:w-4/5 md:text-xs"
          >
            CADASTRAR
          </button>
        </form>
      </div>
    </div>
  );
}
