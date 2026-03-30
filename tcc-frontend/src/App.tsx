import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Index from './pages/guest/Index'
import Cadastro from './pages/guest/Cadastro'
import JogoConvidado from './pages/guest/JogoConvidado'
import PaginaJogo from './pages/guest/PaginaJogo'
import TelaDeJogo from './pages/guest/TelaDeJogo'
import JogoCadastro from './pages/user/JogoCadastro'
import UsuarioHome from './pages/user/UsuarioHome'
import Perfil from './pages/user/Perfil'
import PaginaJogoCadastro from './pages/user/PaginaJogoCadastro'
import TelaDeJogoCadastro from './pages/user/TelaDeJogoCadastro'
import Tutorial from './pages/guest/Tutorial'

function App() {
  return (
    <>
      <Routes>
        {/** Rotas públicas **/}
        <Route path="/" element={< Index />} />
        <Route path="/Cadastro" element={< Cadastro />} />
        <Route path="/Tutorial" element={< Tutorial />} />
        <Route path="/JogoConvidado" element={< JogoConvidado />} />
        <Route path="/PaginaJogo" element={< PaginaJogo />} />
        <Route path="/TelaDeJogo" element={< TelaDeJogo />} />

        {/** Rotas protegidas **/}
        <Route element={<ProtectedRoute />}>
          <Route path="/UsuarioHome" element={< UsuarioHome />} />
          <Route path="/JogoCadastro" element={< JogoCadastro />} />
          <Route path="/PaginaJogoCadastro" element={< PaginaJogoCadastro />} />
          <Route path="/TelaDeJogoCadastro" element={< TelaDeJogoCadastro />} />
          <Route path="/Perfil" element={< Perfil />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
