import { Routes, Route } from 'react-router-dom'
import Index from './pages/auth/Index'
import Cadastro from './pages/auth/Cadastro'
import JogoConvidado from './pages/auth/JogoConvidado'
import PaginaJogo from './pages/auth/PaginaJogo'
import TelaDeJogo from './pages/auth/TelaDeJogo'
import JogoCadastro from './pages/game/JogoCadastro'
import UsuarioHome from './pages/game/UsuarioHome'
import Perfil from './pages/game/Perfil'
import PaginaJogoCadastro from './pages/game/PaginaJogoCadastro'
import TelaDeJogoCadastro from './pages/game/TelaDeJogoCadastro'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={< Index />} />
        <Route path="/Cadastro" element={< Cadastro />} />
        <Route path="/JogoConvidado" element={< JogoConvidado />} />
        <Route path="/PaginaJogo" element={< PaginaJogo />} />
        <Route path="/TelaDeJogo" element={< TelaDeJogo />} />
        <Route path="/UsuarioHome" element={< UsuarioHome />} />
        <Route path="/JogoCadastro" element={< JogoCadastro />} />
        <Route path="/PaginaJogoCadastro" element={< PaginaJogoCadastro />} />
        <Route path="/TelaDeJogoCadastro" element={< TelaDeJogoCadastro />} />
        <Route path="/Perfil" element={< Perfil />} />
      </Routes>
    </>
  )
}

export default App
