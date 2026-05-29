import { useEffect, useState } from "react"
import Layout from "../components/Layout"
import { supabase } from "../lib/supabase"

export default function Alert() {
  const [autocheck, setAutocheck] = useState([])
  const [clienti, setClienti] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchDati() }, [])

  async function fetchDati() {
    const { data: a } = await supabase.from("autocheck").select("*, clienti(nome, cognome)").eq("letto_pt", false).order("created_at", { ascending: false })
    const { data: c } = await supabase.from("clienti").select("*").eq("attivo", true)
    if (a) setAutocheck(a)
    if (c) setClienti(c)
    setLoading(false)
  }

  async function segnaLetto(id) {
    await supabase.from("autocheck").update({ letto_pt: true }).eq("id", id)
    fetchDati()
  }

  return (
    <Layout>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1.5rem"}}>
        <div>
          <div style={{fontSize:"22px",fontWeight:600,color:"var(--t1)"}}>Alert & Notifiche</div>
          <div style={{fontSize:"11px",color:"var(--t2)",marginTop:"2px"}}>{autocheck.length} autocheck da leggere</div>
        </div>
      </div>

      <div className="card">
        <div className="card-hdr">
          <span className="card-title"><i className="ti ti-bell" style={{color:"var(--gold)",fontSize:"14px"}}></i> Autocheck ricevuti</span>
        </div>
        {loading && <div style={{padding:"2rem",textAlign:"center",color:"var(--t2)",fontSize:"12px"}}>Caricamento...</div>}
        {!loading && autocheck.length === 0 && (
          <div style={{padding:"3rem",textAlign:"center"}}>
            <i className="ti ti-check-circle" style={{fontSize:"36px",color:"var(--green)",display:"block",marginBottom:"12px"}}></i>
            <div style={{fontSize:"13px",color:"var(--t2)"}}>Nessun alert da leggere</div>
          </div>
        )}
        {autocheck.map((a, i) => (
          <div key={a.id} style={{padding:"1rem 1.1rem",borderBottom:i<autocheck.length-1?".5px solid var(--bord)":"none"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"10px"}}>
              <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                <div style={{width:"32px",height:"32px",borderRadius:"50%",background:"var(--gold-dim)",border:".5px solid var(--gold-b)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"11px",fontWeight:600,color:"var(--gold)"}}>
                  {a.clienti?.nome?.[0]}{a.clienti?.cognome?.[0]}
                </div>
                <div>
                  <div style={{fontSize:"13px",fontWeight:500,color:"var(--t1)"}}>{a.clienti?.nome} {a.clienti?.cognome}</div>
                  <div style={{fontSize:"10px",color:"var(--t2)"}}>{new Date(a.created_at).toLocaleDateString("it-IT")} · Autocheck</div>
                </div>
              </div>
              <button onClick={()=>segnaLetto(a.id)} className="btn-outline" style={{fontSize:"11px",padding:"5px 12px"}}>Segna letto</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"8px",marginBottom:"10px"}}>
              {[["Peso",a.peso+" kg"],["Energia",a.energia+"/5"],["Umore",a.umore+"/5"],["Motivazione",a.motivazione+"/5"]].map(([l,v])=>(
                <div key={l} style={{background:"var(--card2)",border:".5px solid var(--bord)",borderRadius:"6px",padding:"6px 8px",textAlign:"center"}}>
                  <div style={{fontSize:"9px",color:"var(--t3)",marginBottom:"2px"}}>{l}</div>
                  <div style={{fontSize:"12px",fontWeight:600,color:"var(--gold)"}}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"6px"}}>
              {[["Fronte",a.foto_fronte],["Retro",a.foto_retro],["Lato Sx",a.foto_lato_sx],["Lato Dx",a.foto_lato_dx]].map(([l,f])=>(
                <div key={l} style={{background:"#050505",border:".5px solid var(--bord)",borderRadius:"6px",height:"70px",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {f ? <img src={f} style={{width:"100%",height:"100%",objectFit:"cover"}} alt={l} /> : <span style={{fontSize:"9px",color:"var(--t3)"}}>{l}</span>}
                </div>
              ))}
            </div>
            {a.note_cliente && <div style={{marginTop:"8px",fontSize:"11px",color:"var(--t2)",background:"var(--card2)",padding:"8px 10px",borderRadius:"6px",border:".5px solid var(--bord)"}}>{a.note_cliente}</div>}
          </div>
        ))}
      </div>
    </Layout>
  )
}
