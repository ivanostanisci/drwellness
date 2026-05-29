import { useState, useEffect } from "react"
import Layout from "../components/Layout"
import { supabase } from "../lib/supabase"

const PRODOTTI_LIBRERIA = [
  { nome:"Creatina Monoidrato", categoria:"Integratori", emoji:"⚡", descrizione:"5g al giorno per forza e potenza", link:"https://amzn.to/creatina" },
  { nome:"Proteine Whey", categoria:"Integratori", emoji:"🥛", descrizione:"Proteine in polvere post allenamento", link:"https://amzn.to/whey" },
  { nome:"Omega 3", categoria:"Integratori", emoji:"🐟", descrizione:"Acidi grassi essenziali EPA e DHA", link:"https://amzn.to/omega3" },
  { nome:"Vitamina D3", categoria:"Vitamine", emoji:"☀️", descrizione:"1000-2000 UI al giorno", link:"https://amzn.to/vitd3" },
  { nome:"Magnesio", categoria:"Minerali", emoji:"💊", descrizione:"Recupero muscolare e sonno", link:"https://amzn.to/magnesio" },
  { nome:"Zinco", categoria:"Minerali", emoji:"💊", descrizione:"Supporto immunitario e ormonale", link:"https://amzn.to/zinco" },
  { nome:"BCAA", categoria:"Integratori", emoji:"💪", descrizione:"Aminoacidi ramificati per il recupero", link:"https://amzn.to/bcaa" },
  { nome:"Pre-workout", categoria:"Integratori", emoji:"🔥", descrizione:"Energia e focus per l allenamento", link:"https://amzn.to/preworkout" },
  { nome:"Glutammina", categoria:"Integratori", emoji:"💊", descrizione:"Recupero e sistema immunitario", link:"https://amzn.to/glutammina" },
  { nome:"Collagene", categoria:"Integratori", emoji:"🦴", descrizione:"Articolazioni e pelle", link:"https://amzn.to/collagene" },
  { nome:"Beta Alanina", categoria:"Integratori", emoji:"⚡", descrizione:"Resistenza muscolare", link:"https://amzn.to/betaalanina" },
  { nome:"Melatonina", categoria:"Vitamine", emoji:"🌙", descrizione:"Supporto al sonno", link:"https://amzn.to/melatonina" },
  { nome:"Vitamina C", categoria:"Vitamine", emoji:"🍊", descrizione:"Antiossidante e immunità", link:"https://amzn.to/vitc" },
  { nome:"Multivitaminico", categoria:"Vitamine", emoji:"🌈", descrizione:"Supporto nutrizionale completo", link:"https://amzn.to/multi" },
  { nome:"Proteine Vegan", categoria:"Integratori", emoji:"🌱", descrizione:"Proteine da pisello e riso", link:"https://amzn.to/vegan" },
  { nome:"Olio MCT", categoria:"Alimentazione", emoji:"🫙", descrizione:"Energia rapida da grassi sani", link:"https://amzn.to/mct" },
  { nome:"Barrette Proteiche", categoria:"Alimentazione", emoji:"🍫", descrizione:"Snack proteico pratico", link:"https://amzn.to/barrette" },
  { nome:"Tappetino Yoga", categoria:"Attrezzatura", emoji:"🧘", descrizione:"Antiscivolo 6mm spessore", link:"https://amzn.to/tappetino" },
  { nome:"Elastici Resistenza", categoria:"Attrezzatura", emoji:"🏋️", descrizione:"Set 5 livelli di resistenza", link:"https://amzn.to/elastici" },
  { nome:"Bilanciere", categoria:"Attrezzatura", emoji:"🏋️", descrizione:"Bilanciere olimpionico 20kg", link:"https://amzn.to/bilanciere" },
]

export default function Shop() {
  const [prodotti, setProdotti] = useState([])
  const [ricerca, setRicerca] = useState("")
  const [suggerimenti, setSuggerimenti] = useState([])
  const [msg, setMsg] = useState("")
  const [prezzo, setPrezzo] = useState("")
  const [selezionato, setSelezionato] = useState(null)

  useEffect(() => { fetchProdotti() }, [])

  async function fetchProdotti() {
    const { data } = await supabase.from("prodotti").select("*").order("created_at", { ascending: false })
    if (data) setProdotti(data)
  }

  function cercaSuggerimenti(val) {
    setRicerca(val)
    setSelezionato(null)
    if (val.length >= 2) {
      setSuggerimenti(PRODOTTI_LIBRERIA.filter(p => p.nome.toLowerCase().includes(val.toLowerCase())).slice(0,6))
    } else {
      setSuggerimenti([])
    }
  }

  function selezionaProdotto(p) {
    setSelezionato(p)
    setRicerca(p.nome)
    setSuggerimenti([])
  }

  async function aggiungiProdotto() {
    if (!selezionato || !prezzo) return
    await supabase.from("prodotti").insert([{ ...selezionato, prezzo }])
    setRicerca("")
    setPrezzo("")
    setSelezionato(null)
    fetchProdotti()
    setMsg("Prodotto aggiunto allo shop!")
    setTimeout(() => setMsg(""), 3000)
  }

  async function eliminaProdotto(id) {
    await supabase.from("prodotti").delete().eq("id", id)
    fetchProdotti()
  }

  return (
    <Layout>
      <button onClick={()=>window.history.back()} style={{background:"transparent",border:".5px solid var(--bord)",color:"var(--t2)",borderRadius:"7px",padding:"7px 14px",fontSize:"12px",cursor:"pointer",display:"inline-flex",alignItems:"center",gap:"5px",marginBottom:"1rem"}}><i className="ti ti-arrow-left"></i> Dashboard</button>

      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1.5rem"}}>
        <div>
          <div style={{fontSize:"22px",fontWeight:600,color:"var(--t1)"}}>Gestisci Shop</div>
          <div style={{fontSize:"11px",color:"var(--t2)",marginTop:"2px"}}>{prodotti.length} prodotti visibili ai clienti</div>
        </div>
      </div>

      {msg && <div style={{background:"var(--gold-dim)",border:".5px solid var(--gold-b)",borderRadius:"8px",padding:"10px 14px",fontSize:"12px",color:"var(--gold)",marginBottom:"1rem"}}>{msg}</div>}

      <div className="card" style={{padding:"1.25rem",marginBottom:"1.25rem"}}>
        <div style={{fontSize:"13px",fontWeight:500,color:"var(--t1)",marginBottom:"1rem"}}>Aggiungi prodotto allo shop</div>
        <div style={{position:"relative",marginBottom:"10px"}}>
          <label className="flabel">Cerca prodotto</label>
          <input className="finput" value={ricerca} onChange={e=>cercaSuggerimenti(e.target.value)} placeholder="Es. cre, pro, omega..." />
          {suggerimenti.length > 0 && (
            <div style={{position:"absolute",top:"100%",left:0,right:0,background:"var(--card)",border:".5px solid var(--gold-b)",borderRadius:"8px",zIndex:10,boxShadow:"0 8px 24px rgba(0,0,0,0.4)",marginTop:"4px"}}>
              {suggerimenti.map((s,i)=>(
                <div key={i} onClick={()=>selezionaProdotto(s)}
                  style={{padding:"10px 14px",cursor:"pointer",borderBottom:i<suggerimenti.length-1?".5px solid var(--bord)":"none",display:"flex",alignItems:"center",gap:"10px",fontSize:"12px",color:"var(--t1)"}}
                  onMouseEnter={e=>e.currentTarget.style.background="var(--hover)"}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <span style={{fontSize:"18px"}}>{s.emoji}</span>
                  <div>
                    <div style={{fontWeight:500}}>{s.nome}</div>
                    <div style={{fontSize:"10px",color:"var(--t2)"}}>{s.categoria} · {s.descrizione}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {selezionato && (
          <div style={{background:"var(--gold-dim)",border:".5px solid var(--gold-b)",borderRadius:"8px",padding:"10px 12px",marginBottom:"10px",display:"flex",alignItems:"center",gap:"10px",fontSize:"12px"}}>
            <span style={{fontSize:"20px"}}>{selezionato.emoji}</span>
            <div style={{flex:1}}>
              <div style={{fontWeight:500,color:"var(--t1)"}}>{selezionato.nome}</div>
              <div style={{fontSize:"10px",color:"var(--t2)"}}>{selezionato.descrizione}</div>
            </div>
          </div>
        )}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"10px"}}>
          <div>
            <label className="flabel">Prezzo consigliato (€)</label>
            <input className="finput" type="number" value={prezzo} onChange={e=>setPrezzo(e.target.value)} placeholder="29.90" />
          </div>
          <div style={{display:"flex",alignItems:"flex-end"}}>
            <button className="btn-gold" style={{width:"100%"}} onClick={aggiungiProdotto} disabled={!selezionato||!prezzo}>
              <i className="ti ti-plus"></i> Aggiungi allo shop
            </button>
          </div>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"14px"}}>
        {prodotti.map(p=>(
          <div key={p.id} className="card" style={{margin:0}}>
            <div style={{height:"100px",background:"#050505",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"44px",borderRadius:"12px 12px 0 0"}}>{p.emoji||"💊"}</div>
            <div style={{padding:"1rem"}}>
              <div style={{fontSize:"10px",color:"var(--gold)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:"3px"}}>{p.categoria}</div>
              <div style={{fontSize:"13px",fontWeight:500,color:"var(--t1)",marginBottom:"3px"}}>{p.nome}</div>
              <div style={{fontSize:"10px",color:"var(--t2)",marginBottom:"8px",lineHeight:1.4}}>{p.descrizione}</div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"8px"}}>
                <div style={{fontSize:"16px",fontWeight:600,color:"var(--gold)"}}>€{p.prezzo}</div>
                <a href={p.link} target="_blank" style={{background:"var(--gold-dim)",border:".5px solid var(--gold-b)",color:"var(--gold)",borderRadius:"6px",padding:"5px 10px",fontSize:"11px",textDecoration:"none"}}>Vedi →</a>
              </div>
              <button onClick={()=>eliminaProdotto(p.id)} style={{width:"100%",background:"rgba(184,122,122,0.1)",border:".5px solid rgba(184,122,122,0.2)",color:"var(--red)",borderRadius:"6px",padding:"6px",fontSize:"11px",cursor:"pointer"}}>Rimuovi</button>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  )
}
