import { Routes, Route } from 'react-router-dom'
import Index from './pages/Index'
import Cadastro from './pages/Cadastro'
import JogoConvidado from './pages/JogoConvidado'
import PaginaJogo from './pages/PaginaJogo'
import TelaDeJogo from './pages/TelaDeJogo'
import JogoCadastro from './pages/JogoCadastro'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={< Index />} />
        <Route path="/Cadastro" element={< Cadastro />} />
        <Route path="/JogoConvidado" element={< JogoConvidado />} />
        <Route path="/PaginaJogo" element={< PaginaJogo />} />
        <Route path="/TelaDeJogo" element={< TelaDeJogo />} />
        <Route path="/JogoCadastro" element={< JogoCadastro />} />
      </Routes>
    </>
  )
}

export default App
