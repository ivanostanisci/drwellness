import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Dashboard from "./pages/Dashboard"
import Clienti from "./pages/Clienti"
import SchedaCliente from "./pages/SchedaCliente"
import PazientiOnline from "./pages/PazientiOnline"
import Allenamenti from "./pages/Allenamenti"
import Autocheck from "./pages/Autocheck"
import Alert from "./pages/Alert"
import AreaCliente from "./pages/AreaCliente"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/clienti" element={<Clienti />} />
        <Route path="/clienti/:id" element={<SchedaCliente />} />
        <Route path="/online" element={<PazientiOnline />} />
        <Route path="/allenamenti" element={<Allenamenti />} />
        <Route path="/autocheck" element={<Autocheck />} />
        <Route path="/alert" element={<Alert />} />
        <Route path="/area-cliente" element={<AreaCliente />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App