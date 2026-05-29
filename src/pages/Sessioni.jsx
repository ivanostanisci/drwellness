import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Layout from "../components/Layout"
import { supabase } from "../lib/supabase"

export default function Sessioni() {
  const [cicli, setCicli] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => { fetchCicli() }, [])

  async function fetchCicli() {
    const { data } = await supabase
      .from("cicli")
      .select("*, clienti(nome, cognome, obiettivo)")
      .eq("attivo", true)
      .order("created_at", { ascending: false })
    if (data) setCicli(data)
    setLoading(false)
  }

  async function segnaSessione(ciclo) {
    const nuove = ciclo.sessioni_completate + 1
    await supabase.from("cicli").update({ sessioni_completate: nuove }).eq("id", ciclo.id)
    fetchCicli()
  }

  async function nuovoCiclo(clienteId) {
    await supabase.from("cicli").update({ attivo: false }).eq("cliente_id", clienteId).eq("attivo", true)
    await supabase.from("cicli").insert([{ cliente_id: clienteId, sessioni_totali: 16, sessioni_completate: 0, attivo: true }])
    fetchCicli()
  }

  const inScadenza = cicli.filter(c => c.sessioni_totali - c.sessioni_completate <= 3)
  const completati = cicli.filter(c => c.sessioni_completate >= c.sessioni_totali)
  const attivi = cicli.filter(c => c.sessioni_completate < c.sessioni_totali)

  return (
    <Layout>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1.5rem"}}>
        <div>
          <div style={{fontSize:"22px",fontWeight:600,color:"var(--t1)"}}>Sessioni & Cicli</div>
          <div style={{fontSize:"11px",color:"var(--t2)",marginTop:"2px"}}>{attivi.length} cicli attivi · {inScadenza.length} in scadenza</div>
        </div>
      </div>

      {inScadenza.length > 0 && (
        <div style={{background:"rgba(184,122,122,0.1)",border:".5px solid rgba(184,122,122,0.2)",borderRadius:"10px",padding:"1rem 1.25rem",marginBottom:"1.25rem"}}>
          <div style={{fontSize:"12px",fontWeight:500,color:"var(--red)",marginBottom:"8px",display:"flex",alignItems:"center",gap:"6px"}}>
            <i className="ti ti-alert-circle"></i> Cicli in scadenza
          </div>
          {inScadenza.map(c => (
            <div key={c.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",fontSize:"12px",color:"var(--t2)",marginBottom:"4px"}}>
              <span><strong style={{color:"var(--t1)"}}>{c.clienti?.nome} {c.clienti?.cognome}</strong> — {c.sessioni_totali - c.sessioni_completate} sessioni rimanenti</span>
              <button onClick={()=>nuovoCiclo(c.cliente_id)} style={{background:"var(--gold-dim)",border:".5px solid var(--gold-b)",color:"var(--gold)",borderRadius:"6px",padding:"4px 10px",fontSize:"11px",cursor:"pointer"}}>Rinnova ciclo</button>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <div className="card-hdr">
          <span className="card-title"><i className="ti ti-refresh" style={{color:"var(--gold)",fontSize:"14px"}}></i> Cicli attivi</span>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1.5fr 1fr 1fr",gap:"10px",padding:"7px 1.1rem",background:"var(--card2)",fontSize:"10px",color:"var(--t3)",fontWeight:600,textTransform:"uppercase",letterSpacing:".06em"}}>
          <span>Cliente</span><span>Progresso</span><span>Sessioni</span><span>Mancanti</span><span></span>
        </div>

        {loading && <div style={{padding:"2rem",textAlign:"center",fontSize:"12px",color:"var(--t2)"}}>Caricamento...</div>}

        {!loading && attivi.length === 0 && (
          <div style={{padding:"3rem",textAlign:"center"}}>
            <i className="ti ti-calendar-off" style={{fontSize:"36px",color:"var(--t3)",display:"block",marginBottom:"12px"}}></i>
            <div style={{fontSize:"13px",color:"var(--t2)",marginBottom:"8px"}}>Nessun ciclo attivo</div>
            <div style={{fontSize:"11px",color:"var(--t3)"}}>Apri la scheda di un cliente per creare un ciclo</div>
          </div>
        )}

        {attivi.map((c, i) => {
          const mancanti = c.sessioni_totali - c.sessioni_completate
          const percentuale = (c.sessioni_completate / c.sessioni_totali) * 100
          const inScad = mancanti <= 3
          return (
            <div key={c.id} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1.5fr 1fr 1fr",alignItems:"center",gap:"10px",padding:"10px 1.1rem",borderBottom:i<attivi.length-1?".5px solid var(--bord)":"none",fontSize:"12px"}}>
              <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                <div style={{width:"28px",height:"28px",borderRadius:"50%",background:"var(--gold-dim)",border:".5px solid var(--gold-b)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"10px",fontWeight:600,color:"var(--gold)",flexShrink:0,cursor:"pointer"}} onClick={()=>navigate("/clienti/"+c.cliente_id)}>
                  {c.clienti?.nome?.[0]}{c.clienti?.cognome?.[0]}
                </div>
                <div>
                  <div style={{fontWeight:500,color:"var(--t1)",cursor:"pointer"}} onClick={()=>navigate("/clienti/"+c.cliente_id)}>{c.clienti?.nome} {c.clienti?.cognome}</div>
                  <div style={{fontSize:"10px",color:"var(--t2)",textTransform:"capitalize"}}>{c.clienti?.obiettivo}</div>
                </div>
              </div>
              <div>
                <div style={{background:"var(--card2)",borderRadius:"4px",height:"6px",marginBottom:"3px"}}>
                  <div style={{height:"6px",borderRadius:"4px",background:inScad?"var(--red)":"var(--gold)",width:percentuale+"%",transition:"width .3s"}}></div>
                </div>
                <div style={{fontSize:"10px",color:"var(--t3)"}}>{Math.round(percentuale)}%</div>
              </div>
              <div style={{fontSize:"12px",color:"var(--t1)"}}>{c.sessioni_completate} / {c.sessioni_totali}</div>
              <span style={{fontSize:"13px",fontWeight:600,color:inScad?"var(--red)":"var(--t1)"}}>{mancanti}</span>
              <button onClick={()=>segnaSessione(c)} style={{background:"var(--gold-dim)",border:".5px solid var(--gold-b)",color:"var(--gold)",borderRadius:"6px",padding:"5px 10px",fontSize:"11px",cursor:"pointer",fontWeight:500}}>
                + Sessione
              </button>
            </div>
          )
        })}
      </div>

      {completati.length > 0 && (
        <div className="card" style={{marginTop:"1.25rem"}}>
          <div className="card-hdr"><span className="card-title" style={{color:"var(--green)"}}>✓ Cicli completati</span></div>
          {completati.map((c,i) => (
            <div key={c.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 1.1rem",borderBottom:i<completati.length-1?".5px solid var(--bord)":"none",fontSize:"12px"}}>
              <div style={{fontWeight:500,color:"var(--t1)"}}>{c.clienti?.nome} {c.clienti?.cognome}</div>
              <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                <span className="pill p-ok">{c.sessioni_totali}/{c.sessioni_totali} completate</span>
                <button onClick={()=>nuovoCiclo(c.cliente_id)} className="btn-gold" style={{padding:"5px 12px",fontSize:"11px"}}>Rinnova</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}
