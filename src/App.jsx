import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { lazy, Suspense } from "react"

const Dashboard = lazy(() => import("./pages/Dashboard"))
const Clienti = lazy(() => import("./pages/Clienti"))
const SchedaCliente = lazy(() => import("./pages/SchedaCliente"))
const PazientiOnline = lazy(() => import("./pages/PazientiOnline"))
const Autocheck = lazy(() => import("./pages/Autocheck"))
const Alert = lazy(() => import("./pages/Alert"))
const AreaCliente = lazy(() => import("./pages/AreaCliente"))
const Calendario = lazy(() => import("./pages/Calendario"))
const Sessioni = lazy(() => import("./pages/Sessioni"))
const Shop = lazy(() => import("./pages/Shop"))
const Coaching = lazy(() => import("./pages/Coaching"))

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div style={{background:"#0A0A0A",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",color:"#C9A84C",fontSize:"14px"}}>DR. WELLNESS...</div>}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/clienti" element={<Clienti />} />
          <Route path="/clienti/:id" element={<SchedaCliente />} />
          <Route path="/online" element={<PazientiOnline />} />
          <Route path="/autocheck" element={<Autocheck />} />
          <Route path="/alert" element={<Alert />} />
          <Route path="/area-cliente" element={<AreaCliente />} />
          <Route path="/calendario" element={<Calendario />} />
          <Route path="/sessioni" element={<Sessioni />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/coaching" element={<Coaching />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
