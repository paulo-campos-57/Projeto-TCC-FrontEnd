import { Routes, Route } from 'react-router-dom'
import Index from './pages/Index'
import Cadastro from './pages/Cadastro'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={< Index />} />
        <Route path="/Cadastro" element={< Cadastro />} />
      </Routes>
    </>
  )
}

export default App
