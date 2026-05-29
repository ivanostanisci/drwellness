import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Layout from "../components/Layout"
import { supabase } from "../lib/supabase"

export default function SchedaCliente() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [cliente, setCliente] = useState(null)
  const [misurazioni, setMisurazioni] = useState([])
  const [autocheck, setAutocheck] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState("profilo")
  const [nuovaMis, setNuovaMis] = useState({ peso: "", massa_grassa: "", massa_muscolare: "", note: "" })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState("")

  useEffect(() => { fetchDati() }, [id])

  async function fetchDati() {
    const { data: c } = await supabase.from("clienti").select("*").eq("id", id).single()
    const { data: m } = await supabase.from("misurazioni").select("*").eq("cliente_id", id).order("data", { ascending: false })
    const { data: a } = await supabase.from("autocheck").select("*").eq("cliente_id", id).order("created_at", { ascending: false })
    if (c) setCliente(c)
    if (m) setMisurazioni(m)
    if (a) setAutocheck(a)
    setLoading(false)
  }

  async function salvaMisurazione() {
    setSaving(true)
    await supabase.from("misurazioni").insert([{ ...nuovaMis, cliente_id: id }])
    setNuovaMis({ peso: "", massa_grassa: "", massa_muscolare: "", note: "" })
    fetchDati()
    setMsg("Misurazione salvata!")
    setSaving(false)
    setTimeout(() => setMsg(""), 3000)
  }

  if (loading) return <Layout><div style={{padding:"2rem",textAlign:"center",color:"var(--t2)"}}>Caricamento...</div></Layout>
  if (!cliente) return <Layout><div style={{padding:"2rem",textAlign:"center",color:"var(--t2)"}}>Cliente non trovato</div></Layout>

  const tabs = ["profilo", "misurazioni", "autocheck", "allenamento", "alimentare"]

  return (
    <Layout>
      <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"1.5rem"}}>
        <button onClick={()=>navigate("/clienti")} style={{background:"transparent",border:".5px solid var(--bord)",color:"var(--t2)",borderRadius:"7px",padding:"7px 12px",fontSize:"12px",cursor:"pointer",display:"flex",alignItems:"center",gap:"5px"}}>
          <i className="ti ti-arrow-left"></i> Clienti
        </button>
        <div style={{flex:1}}>
          <div style={{fontSize:"22px",fontWeight:600,color:"var(--t1)"}}>{cliente.nome} {cliente.cognome}</div>
          <div style={{fontSize:"11px",color:"var(--t2)",marginTop:"2px"}}>{cliente.email} · {cliente.obiettivo}</div>
        </div>
        <span className="pill p-ok">Attivo</span>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"10px",marginBottom:"1.5rem"}}>
        <div className="stat-card"><div className="stat-icon"><i className="ti ti-weight"></i></div><div className="stat-label">Peso iniziale</div><div className="stat-val">{cliente.peso_iniziale || "—"} <span style={{fontSize:"13px"}}>kg</span></div></div>
        <div className="stat-card"><div className="stat-icon"><i className="ti ti-ruler"></i></div><div className="stat-label">Altezza</div><div className="stat-val">{cliente.altezza || "—"} <span style={{fontSize:"13px"}}>cm</span></div></div>
        <div className="stat-card"><div className="stat-icon"><i className="ti ti-flame"></i></div><div className="stat-label">Calorie target</div><div className="stat-val">{cliente.calorie_target || "—"} <span style={{fontSize:"13px"}}>kcal</span></div></div>
        <div className="stat-card"><div className="stat-icon"><i className="ti ti-target"></i></div><div className="stat-label">Obiettivo</div><div className="stat-val" style={{fontSize:"14px",textTransform:"capitalize"}}>{cliente.obiettivo || "—"}</div></div>
      </div>

      <div style={{display:"flex",gap:"0",marginBottom:"1.25rem",background:"var(--card)",border:".5px solid var(--bord)",borderRadius:"10px",padding:"4px",overflowX:"auto"}}>
        {tabs.map(t => (
          <button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:"8px 12px",borderRadius:"7px",fontSize:"11px",fontWeight:500,cursor:"pointer",border:"none",background:tab===t?"var(--gold)":"transparent",color:tab===t?"#0A0A0A":"var(--t2)",textTransform:"capitalize",transition:"all .15s",whiteSpace:"nowrap"}}>
            {t}
          </button>
        ))}
      </div>

      {msg && <div style={{background:"var(--gold-dim)",border:".5px solid var(--gold-b)",borderRadius:"8px",padding:"10px 14px",fontSize:"12px",color:"var(--gold)",marginBottom:"1rem"}}>{msg}</div>}

      {tab === "profilo" && (
        <div className="card" style={{padding:"1.25rem"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px"}}>
            {[
              ["Nome", cliente.nome],
              ["Cognome", cliente.cognome],
              ["Email", cliente.email],
              ["Telefono", cliente.telefono || "—"],
              ["Peso iniziale", cliente.peso_iniziale ? cliente.peso_iniziale + " kg" : "—"],
              ["Altezza", cliente.altezza ? cliente.altezza + " cm" : "—"],
              ["Obiettivo", cliente.obiettivo],
              ["Calorie target", cliente.calorie_target ? cliente.calorie_target + " kcal" : "—"],
            ].map(([label, val]) => (
              <div key={label} style={{background:"var(--card2)",border:".5px solid var(--bord)",borderRadius:"8px",padding:"10px 12px"}}>
                <div style={{fontSize:"10px",color:"var(--t3)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:"4px"}}>{label}</div>
                <div style={{fontSize:"13px",color:"var(--t1)",fontWeight:500,textTransform:"capitalize"}}>{val}</div>
              </div>
            ))}
          </div>
          {cliente.note && (
            <div style={{background:"var(--card2)",border:".5px solid var(--bord)",borderRadius:"8px",padding:"10px 12px",marginTop:"12px"}}>
              <div style={{fontSize:"10px",color:"var(--t3)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:"4px"}}>Note</div>
              <div style={{fontSize:"12px",color:"var(--t2)",lineHeight:1.6}}>{cliente.note}</div>
            </div>
          )}
        </div>
      )}

      {tab === "misurazioni" && (
        <div>
          <div className="card" style={{padding:"1.25rem",marginBottom:"1.25rem"}}>
            <div style={{fontSize:"13px",fontWeight:500,color:"var(--t1)",marginBottom:"1rem"}}>Nuova misurazione</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"10px",marginBottom:"10px"}}>
              <div><label className="flabel">Peso (kg)</label><input className="finput" type="number" value={nuovaMis.peso} onChange={e=>setNuovaMis({...nuovaMis,peso:e.target.value})} placeholder="78.5" /></div>
              <div><label className="flabel">Massa grassa (%)</label><input className="finput" type="number" value={nuovaMis.massa_grassa} onChange={e=>setNuovaMis({...nuovaMis,massa_grassa:e.target.value})} placeholder="22" /></div>
              <div><label className="flabel">Massa muscolare (%)</label><input className="finput" type="number" value={nuovaMis.massa_muscolare} onChange={e=>setNuovaMis({...nuovaMis,massa_muscolare:e.target.value})} placeholder="38" /></div>
            </div>
            <div style={{marginBottom:"10px"}}><label className="flabel">Note</label><textarea className="finput" value={nuovaMis.note} onChange={e=>setNuovaMis({...nuovaMis,note:e.target.value})} style={{height:"60px",resize:"none"}} placeholder="Note sulla misurazione..." /></div>
            <div style={{display:"flex",justifyContent:"flex-end"}}><button className="btn-gold" onClick={salvaMisurazione} disabled={saving}>{saving?"Salvando...":"Salva misurazione"}</button></div>
          </div>
          <div className="card">
            <div className="card-hdr"><span className="card-title">Storico misurazioni</span></div>
            {misurazioni.length === 0 ? (
              <div style={{padding:"2rem",textAlign:"center",fontSize:"12px",color:"var(--t2)"}}>Nessuna misurazione ancora</div>
            ) : misurazioni.map((m, i) => (
              <div key={m.id} style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr 2fr",gap:"10px",padding:"10px 1.1rem",borderBottom:i<misurazioni.length-1?".5px solid var(--bord)":"none",fontSize:"12px",alignItems:"center"}}>
                <div style={{color:"var(--t2)"}}>{new Date(m.data).toLocaleDateString("it-IT")}</div>
                <div><span style={{color:"var(--gold)",fontWeight:500}}>{m.peso || "—"}</span> kg</div>
                <div><span style={{color:"var(--t1)"}}>{m.massa_grassa || "—"}</span>% grasso</div>
                <div><span style={{color:"var(--t1)"}}>{m.massa_muscolare || "—"}</span>% muscolo</div>
                <div style={{color:"var(--t2)",fontSize:"11px"}}>{m.note || "—"}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "autocheck" && (
        <div className="card">
          <div className="card-hdr"><span className="card-title">Autocheck ricevuti</span></div>
          {autocheck.length === 0 ? (
            <div style={{padding:"2rem",textAlign:"center",fontSize:"12px",color:"var(--t2)"}}>Nessun autocheck ancora</div>
          ) : autocheck.map((a, i) => (
            <div key={a.id} style={{padding:"1rem 1.1rem",borderBottom:i<autocheck.length-1?".5px solid var(--bord)":"none"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"10px"}}>
                <div style={{fontSize:"12px",fontWeight:500,color:"var(--t1)"}}>{new Date(a.created_at).toLocaleDateString("it-IT")}</div>
                <span className="pill p-ok">{a.peso} kg</span>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"8px",marginBottom:"10px"}}>
                {[["Energia",a.energia],["Umore",a.umore],["Sonno",a.sonno_qualita],["Motivazione",a.motivazione]].map(([l,v])=>(
                  <div key={l} style={{background:"var(--card2)",border:".5px solid var(--bord)",borderRadius:"6px",padding:"6px 8px",textAlign:"center"}}>
                    <div style={{fontSize:"9px",color:"var(--t3)",marginBottom:"2px"}}>{l}</div>
                    <div style={{fontSize:"13px",fontWeight:600,color:"var(--gold)"}}>{v}/5</div>
                  </div>
                ))}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"6px"}}>
                {[["Fronte",a.foto_fronte],["Retro",a.foto_retro],["Lato Sx",a.foto_lato_sx],["Lato Dx",a.foto_lato_dx]].map(([l,f])=>(
                  <div key={l} style={{background:"#050505",border:".5px solid var(--bord)",borderRadius:"6px",height:"60px",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    {f ? <img src={f} style={{width:"100%",height:"100%",objectFit:"cover"}} alt={l} /> : <span style={{fontSize:"9px",color:"var(--t3)"}}>{l}</span>}
                  </div>
                ))}
              </div>
              {a.note_cliente && <div style={{marginTop:"8px",fontSize:"11px",color:"var(--t2)",background:"var(--card2)",padding:"8px 10px",borderRadius:"6px"}}>{a.note_cliente}</div>}
            </div>
          ))}
        </div>
      )}

      {tab === "allenamento" && (
        <div className="card" style={{padding:"2rem",textAlign:"center"}}>
          <i className="ti ti-barbell" style={{fontSize:"36px",color:"var(--t3)",display:"block",marginBottom:"12px"}}></i>
          <div style={{fontSize:"13px",color:"var(--t2)"}}>Scheda allenamento — prossimamente</div>
        </div>
      )}

      {tab === "alimentare" && (
        <div className="card" style={{padding:"2rem",textAlign:"center"}}>
          <i className="ti ti-salad" style={{fontSize:"36px",color:"var(--t3)",display:"block",marginBottom:"12px"}}></i>
          <div style={{fontSize:"13px",color:"var(--t2)"}}>Piano alimentare — prossimamente</div>
        </div>
      )}
    </Layout>
  )
}
