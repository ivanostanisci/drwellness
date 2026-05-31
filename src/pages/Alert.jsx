import { useEffect, useState } from "react"
import Layout from "../components/Layout"
import { supabase } from "../lib/supabase"

export default function Alert() {
  const [autocheck, setAutocheck] = useState([])
  const [loading, setLoading] = useState(true)
  const [report, setReport] = useState({})
  const [generando, setGenerando] = useState({})

  useEffect(() => { fetchDati() }, [])

  async function fetchDati() {
    const { data } = await supabase
      .from("autocheck")
      .select("*, clienti(nome, cognome, obiettivo, peso_iniziale)")
      .eq("letto_pt", false)
      .order("created_at", { ascending: false })
    if (data) setAutocheck(data)
    setLoading(false)
  }

  async function segnaLetto(id) {
    await supabase.from("autocheck").update({ letto_pt: true }).eq("id", id)
    fetchDati()
  }

  async function generaReport(a) {
    setGenerando(prev => ({...prev, [a.id]: true}))
    try {
      const prompt = "Sei il Dr. Wellness, personal trainer e nutrizionista. Analizza questo autocheck del cliente " + 
        a.clienti?.nome + " " + a.clienti?.cognome + " (obiettivo: " + (a.clienti?.obiettivo||"N/D") + "):\n" +
        "Peso attuale: " + a.peso + " kg (peso iniziale: " + (a.clienti?.peso_iniziale||"N/D") + " kg)\n" +
        "Energia: " + a.energia + "/5\n" +
        "Umore: " + a.umore + "/5\n" +
        "Qualita sonno: " + a.sonno_qualita + "/5\n" +
        "Motivazione: " + a.motivazione + "/5\n" +
        "Note cliente: " + (a.note_cliente||"nessuna") + "\n\n" +
        "Fornisci: 1) Valutazione generale (2-3 righe) 2) Punti di attenzione 3) Consigli pratici per questa settimana. Sii diretto e professionale."
      
      const res = await fetch("https://pjojacqzpujdesxqqcnf.supabase.co/functions/v1/genera-piano", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqb2phY3F6cHVqZGVzeHFxY25mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3Mjc2MjQsImV4cCI6MjA5NTMwMzYyNH0.cLygQqHlUtCi4esA0a_XcNRxOUL5Z5p5RdB60OmcZ8s"
        },
        body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 500, messages: [{ role: "user", content: prompt }] })
      })
      const data = await res.json()
      if (data.content?.[0]?.text) {
        setReport(prev => ({...prev, [a.id]: data.content[0].text}))
      }
    } catch(e) { console.error(e) }
    setGenerando(prev => ({...prev, [a.id]: false}))
  }

  return (
    <Layout>
      <button onClick={()=>window.history.back()} style={{background:"transparent",border:".5px solid var(--bord)",color:"var(--t2)",borderRadius:"7px",padding:"7px 14px",fontSize:"12px",cursor:"pointer",display:"inline-flex",alignItems:"center",gap:"5px",marginBottom:"1rem"}}><i className="ti ti-arrow-left"></i> Dashboard</button>

      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1.5rem"}}>
        <div>
          <div style={{fontSize:"22px",fontWeight:600,color:"var(--t1)"}}>Autocheck ricevuti</div>
          <div style={{fontSize:"11px",color:"var(--t2)",marginTop:"2px"}}>{autocheck.length} da leggere</div>
        </div>
      </div>

      <div className="card">
        {loading && <div style={{padding:"2rem",textAlign:"center",color:"var(--t2)",fontSize:"12px"}}>Caricamento...</div>}
        {!loading && autocheck.length === 0 && (
          <div style={{padding:"3rem",textAlign:"center"}}>
            <i className="ti ti-check-circle" style={{fontSize:"36px",color:"var(--green)",display:"block",marginBottom:"12px"}}></i>
            <div style={{fontSize:"13px",color:"var(--t2)"}}>Nessun autocheck da leggere</div>
          </div>
        )}
        {autocheck.map((a, i) => (
          <div key={a.id} style={{padding:"1.25rem 1.1rem",borderBottom:i<autocheck.length-1?".5px solid var(--bord)":"none"}}>
            
            {/* Header cliente */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1rem"}}>
              <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                <div style={{width:"36px",height:"36px",borderRadius:"50%",background:"var(--gold-dim)",border:".5px solid var(--gold-b)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"12px",fontWeight:600,color:"var(--gold)"}}>
                  {a.clienti?.nome?.[0]}{a.clienti?.cognome?.[0]}
                </div>
                <div>
                  <div style={{fontSize:"13px",fontWeight:600,color:"var(--t1)"}}>{a.clienti?.nome} {a.clienti?.cognome}</div>
                  <div style={{fontSize:"10px",color:"var(--t2)"}}>{new Date(a.created_at).toLocaleDateString("it-IT",{day:"2-digit",month:"long",year:"numeric"})} · {a.clienti?.obiettivo}</div>
                </div>
              </div>
              <button onClick={()=>segnaLetto(a.id)} style={{background:"var(--card2)",border:".5px solid var(--bord)",color:"var(--t2)",borderRadius:"6px",padding:"5px 12px",fontSize:"11px",cursor:"pointer"}}>
                ✓ Segna letto
              </button>
            </div>

            {/* Dati */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:"8px",marginBottom:"1rem"}}>
              {[["Peso",a.peso+" kg"],["Energia",a.energia+"/5"],["Umore",a.umore+"/5"],["Sonno",a.sonno_qualita+"/5"],["Motivazione",a.motivazione+"/5"]].map(([l,v])=>(
                <div key={l} style={{background:"var(--card2)",border:".5px solid var(--bord)",borderRadius:"6px",padding:"8px",textAlign:"center"}}>
                  <div style={{fontSize:"9px",color:"var(--t3)",marginBottom:"3px",textTransform:"uppercase"}}>{l}</div>
                  <div style={{fontSize:"13px",fontWeight:600,color:"var(--gold)"}}>{v}</div>
                </div>
              ))}
            </div>

            {/* Foto */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"8px",marginBottom:"1rem"}}>
              {[["Fronte",a.foto_fronte],["Retro",a.foto_retro],["Lato Sx",a.foto_lato_sx],["Lato Dx",a.foto_lato_dx]].map(([l,f])=>(
                <div key={l} style={{background:"#050505",border:".5px solid var(--bord)",borderRadius:"8px",height:"80px",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
                  {f ? <img src={f} style={{width:"100%",height:"100%",objectFit:"cover"}} alt={l} /> : <span style={{fontSize:"10px",color:"var(--t3)"}}>{l}</span>}
                  {f && <div style={{position:"absolute",bottom:"4px",left:"4px",fontSize:"9px",background:"rgba(0,0,0,0.6)",color:"white",padding:"1px 5px",borderRadius:"3px"}}>{l}</div>}
                </div>
              ))}
            </div>

            {/* Note cliente */}
            {a.note_cliente && (
              <div style={{background:"var(--card2)",border:".5px solid var(--bord)",borderRadius:"8px",padding:"10px 12px",marginBottom:"1rem",fontSize:"12px",color:"var(--t2)"}}>
                <span style={{color:"var(--t3)",fontSize:"10px",textTransform:"uppercase",letterSpacing:".06em"}}>Note cliente: </span>{a.note_cliente}
              </div>
            )}

            {/* Report AI */}
            {report[a.id] ? (
              <div style={{background:"var(--gold-dim)",border:".5px solid var(--gold-b)",borderRadius:"8px",padding:"1rem"}}>
                <div style={{fontSize:"11px",fontWeight:600,color:"var(--gold)",marginBottom:"8px",display:"flex",alignItems:"center",gap:"6px"}}>
                  <i className="ti ti-robot"></i> Report AI Dr. Wellness
                </div>
                <div style={{fontSize:"12px",color:"var(--t2)",lineHeight:1.7,whiteSpace:"pre-wrap"}}>{report[a.id]}</div>
              </div>
            ) : (
              <button onClick={()=>generaReport(a)} disabled={generando[a.id]} style={{background:"var(--gold-dim)",border:".5px solid var(--gold-b)",color:"var(--gold)",borderRadius:"7px",padding:"8px 16px",fontSize:"12px",fontWeight:500,cursor:"pointer",display:"flex",alignItems:"center",gap:"6px"}}>
                <i className="ti ti-robot"></i> {generando[a.id] ? "Generando report..." : "Genera report AI"}
              </button>
            )}
          </div>
        ))}
      </div>
    </Layout>
  )
}
