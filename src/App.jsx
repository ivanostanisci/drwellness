import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Dashboard from "./pages/Dashboard"
import Clienti from "./pages/Clienti"
import PazientiOnline from "./pages/PazientiOnline"
import Allenamenti from "./pages/Allenamenti"
import VisitaNutrizionale from "./pages/VisitaNutrizionale"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/clienti" element={<Clienti />} />
        <Route path="/online" element={<PazientiOnline />} />
        <Route path="/allenamenti" element={<Allenamenti />} />
        <Route path="/nutrizionale" element={<VisitaNutrizionale />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App