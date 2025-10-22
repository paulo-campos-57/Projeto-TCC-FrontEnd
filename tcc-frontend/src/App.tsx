import { Routes, Route } from 'react-router-dom'
import Index from './pages/Index'
import Cadastro from './pages/Cadastro'
import JogoConvidado from './pages/JogoConvidado'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={< Index />} />
        <Route path="/Cadastro" element={< Cadastro />} />
        <Route path="/JogoConvidado" element={< JogoConvidado />} />
      </Routes>
    </>
  )
}

export default App
