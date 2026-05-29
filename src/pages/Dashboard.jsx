import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Layout from "../components/Layout"
import { supabase } from "../lib/supabase"

export default function Dashboard() {
  const [clienti, setClienti] = useState([])
  const [autocheck, setAutocheck] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    supabase.from("clienti").select("*").eq("attivo", true).then(({data}) => data && setClienti(data))
    supabase.from("autocheck").select("*").eq("letto_pt", false).then(({data}) => data && setAutocheck(data))
  }, [])

  const box = [
    { label:"Clienti attivi", val:clienti.length, delta:"Vedi tutti →", icon:"ti-users", path:"/clienti", color:"up" },
    { label:"Sessioni da fare", val:0, delta:"Alimentazioni e schede →", icon:"ti-repeat", path:"/sessioni", color:"warn" },
    { label:"Autocheck ricevuti", val:autocheck.length, delta:autocheck.length>0?"Da leggere →":"Nessuno", icon:"ti-camera", path:"/alert", color:"down" },
    { label:"Appuntamenti", val:0, delta:"Aggiungi →", icon:"ti-calendar-event", path:"/calendario", color:"warn" },
  ]

  return (
    <Layout>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1.5rem"}}>
        <div>
          <div style={{fontSize:"22px",fontWeight:600,color:"var(--t1)"}}>Buongiorno 👋</div>
          <div style={{fontSize:"11px",color:"var(--t2)",marginTop:"2px"}}>{new Date().toLocaleDateString("it-IT",{weekday:"long",day:"numeric",month:"long",year:"numeric"})} · Dr. Wellness</div>
        </div>
        <button className="btn-gold" onClick={()=>navigate("/clienti")}><i className="ti ti-plus"></i> Nuovo cliente</button>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"12px",marginBottom:"1.5rem"}}>
        {box.map(b=>(
          <div key={b.label} className="stat-card" style={{cursor:"pointer",transition:"border-color .2s"}}
            onClick={()=>navigate(b.path)}
            onMouseEnter={e=>e.currentTarget.style.borderColor="var(--gold)"}
            onMouseLeave={e=>e.currentTarget.style.borderColor="var(--bord)"}>
            <div className="stat-icon"><i className={"ti "+b.icon}></i></div>
            <div className="stat-label">{b.label}</div>
            <div className="stat-val">{b.val}</div>
            <div className={"stat-delta "+b.color}>{b.delta}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-hdr">
          <span className="card-title"><i className="ti ti-calendar" style={{color:"var(--gold)",fontSize:"14px"}}></i> Sessioni oggi</span>
          <span style={{fontSize:"10px",color:"var(--t2)"}}>{new Date().toLocaleDateString("it-IT",{weekday:"short",day:"numeric",month:"short"})}</span>
        </div>
        <div style={{padding:"1rem",fontSize:"12px",color:"var(--t2)",textAlign:"center",cursor:"pointer"}} onClick={()=>navigate("/calendario")}>
          Nessuna sessione · <span style={{color:"var(--gold)"}}>Aggiungi appuntamento →</span>
        </div>
      </div>
    </Layout>
  )
}
