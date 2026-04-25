import { Route, Routes } from 'react-router-dom';

import ProtectedRoute from './components/ProtectedRoute';
import Cadastro from './pages/guest/Cadastro';
import Index from './pages/guest/Index';
import JogoConvidado from './pages/guest/JogoConvidado';
import PaginaJogo from './pages/guest/PaginaJogo';
import Sobre from './pages/guest/Sobre';
import TelaDeJogo from './pages/guest/TelaDeJogo';
import Tutorial from './pages/guest/Tutorial';
import JogoCadastro from './pages/user/JogoCadastro';
import PaginaJogoCadastro from './pages/user/PaginaJogoCadastro';
import Perfil from './pages/user/Perfil';
import Ranking from './pages/user/Ranking';
import TelaDeJogoCadastro from './pages/user/TelaDeJogoCadastro';
import UsuarioHome from './pages/user/UsuarioHome';

function App() {
  return (
    <>
      <Routes>
        {/** Rotas públicas **/}
        <Route path="/" element={<Index />} />
        <Route path="/Cadastro" element={<Cadastro />} />
        <Route path="/Tutorial" element={<Tutorial />} />
        <Route path="/JogoConvidado" element={<JogoConvidado />} />
        <Route path="/PaginaJogo" element={<PaginaJogo />} />
        <Route path="/TelaDeJogo" element={<TelaDeJogo />} />
        <Route path="/Sobre" element={<Sobre />} />

        {/** Rotas protegidas **/}
        <Route element={<ProtectedRoute />}>
          <Route path="/UsuarioHome" element={<UsuarioHome />} />
          <Route path="/JogoCadastro" element={<JogoCadastro />} />
          <Route path="/PaginaJogoCadastro" element={<PaginaJogoCadastro />} />
          <Route path="/TelaDeJogoCadastro" element={<TelaDeJogoCadastro />} />
          <Route path="/Perfil" element={<Perfil />} />
          <Route path="/Ranking" element={<Ranking />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
