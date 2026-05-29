import { useState, useEffect } from "react"
import Layout from "../components/Layout"
import { supabase } from "../lib/supabase"

export default function Shop() {
  const [prodotti, setProdotti] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState("")
  const [form, setForm] = useState({ nome:"", prezzo:"", categoria:"Integratori", emoji:"💊", link:"", descrizione:"" })

  useEffect(() => { fetchProdotti() }, [])

  async function fetchProdotti() {
    const { data } = await supabase.from("prodotti").select("*").order("created_at", { ascending: false })
    if (data) setProdotti(data)
  }

  async function salvaProdotto() {
    setSaving(true)
    await supabase.from("prodotti").insert([form])
    setShowModal(false)
    setForm({ nome:"", prezzo:"", categoria:"Integratori", emoji:"💊", link:"", descrizione:"" })
    fetchProdotti()
    setMsg("Prodotto aggiunto!")
    setSaving(false)
    setTimeout(() => setMsg(""), 3000)
  }

  async function eliminaProdotto(id) {
    await supabase.from("prodotti").delete().eq("id", id)
    fetchProdotti()
  }

  const categorie = ["Integratori","Attrezzatura","Abbigliamento","Accessori","Alimentazione","Altro"]
  const emoji_list = ["💊","🥛","🍎","💪","🏋️","🧘","🥊","👟","🎽","🍶","⚡","🔥"]

  return (
    <Layout>
      <button onClick={()=>window.history.back()} style={{background:"transparent",border:".5px solid var(--bord)",color:"var(--t2)",borderRadius:"7px",padding:"7px 14px",fontSize:"12px",cursor:"pointer",display:"inline-flex",alignItems:"center",gap:"5px",marginBottom:"1rem"}}><i className="ti ti-arrow-left"></i> Dashboard</button>

      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1.5rem"}}>
        <div>
          <div style={{fontSize:"22px",fontWeight:600,color:"var(--t1)"}}>Gestisci Shop</div>
          <div style={{fontSize:"11px",color:"var(--t2)",marginTop:"2px"}}>{prodotti.length} prodotti attivi · visibili nell area clienti</div>
        </div>
        <button className="btn-gold" onClick={()=>setShowModal(true)}><i className="ti ti-plus"></i> Aggiungi prodotto</button>
      </div>

      {msg && <div style={{background:"var(--gold-dim)",border:".5px solid var(--gold-b)",borderRadius:"8px",padding:"10px 14px",fontSize:"12px",color:"var(--gold)",marginBottom:"1rem"}}>{msg}</div>}

      {prodotti.length === 0 ? (
        <div className="card" style={{padding:"3rem",textAlign:"center"}}>
          <i className="ti ti-shopping-bag" style={{fontSize:"40px",color:"var(--t3)",display:"block",marginBottom:"12px"}}></i>
          <div style={{fontSize:"13px",color:"var(--t2)",marginBottom:"16px"}}>Nessun prodotto ancora</div>
          <button className="btn-gold" style={{margin:"0 auto"}} onClick={()=>setShowModal(true)}><i className="ti ti-plus"></i> Aggiungi il primo prodotto</button>
        </div>
      ) : (
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"14px"}}>
          {prodotti.map((p,i)=>(
            <div key={p.id} className="card" style={{margin:0}}>
              <div style={{height:"120px",background:"#050505",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"48px",borderRadius:"12px 12px 0 0"}}>{p.emoji||"💊"}</div>
              <div style={{padding:"1rem"}}>
                <div style={{fontSize:"10px",color:"var(--gold)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:"3px"}}>{p.categoria}</div>
                <div style={{fontSize:"13px",fontWeight:500,color:"var(--t1)",marginBottom:"4px"}}>{p.nome}</div>
                <div style={{fontSize:"11px",color:"var(--t2)",marginBottom:"8px",lineHeight:1.4}}>{p.descrizione}</div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"8px"}}>
                  <div style={{fontSize:"16px",fontWeight:600,color:"var(--gold)"}}>€{p.prezzo}</div>
                  <a href={p.link} target="_blank" style={{background:"var(--gold-dim)",border:".5px solid var(--gold-b)",color:"var(--gold)",borderRadius:"6px",padding:"5px 10px",fontSize:"11px",textDecoration:"none"}}>Vedi →</a>
                </div>
                <button onClick={()=>eliminaProdotto(p.id)} style={{width:"100%",background:"rgba(184,122,122,0.1)",border:".5px solid rgba(184,122,122,0.2)",color:"var(--red)",borderRadius:"6px",padding:"6px",fontSize:"11px",cursor:"pointer"}}>Elimina</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setShowModal(false)}>
          <div className="modal">
            <div className="modal-hdr">
              <div class="modal-title"><i className="ti ti-shopping-bag" style={{color:"var(--gold)"}}></i> Nuovo prodotto</div>
              <button onClick={()=>setShowModal(false)} style={{background:"transparent",border:"none",color:"var(--t2)",fontSize:"20px",cursor:"pointer"}}>✕</button>
            </div>
            <div style={{padding:"1.25rem"}}>
              <div style={{marginBottom:"10px"}}><label className="flabel">Nome prodotto</label><input className="finput" value={form.nome} onChange={e=>setForm({...form,nome:e.target.value})} placeholder="Es. Proteine Whey Gold" /></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"10px"}}>
                <div><label className="flabel">Prezzo (€)</label><input className="finput" type="number" value={form.prezzo} onChange={e=>setForm({...form,prezzo:e.target.value})} placeholder="49.90" /></div>
                <div><label className="flabel">Categoria</label>
                  <select className="fselect" value={form.categoria} onChange={e=>setForm({...form,categoria:e.target.value})}>
                    {categorie.map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div style={{marginBottom:"10px"}}>
                <label className="flabel">Emoji prodotto</label>
                <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
                  {emoji_list.map(e=>(
                    <button key={e} onClick={()=>setForm({...form,emoji:e})} style={{width:"36px",height:"36px",borderRadius:"8px",border:`.5px solid ${form.emoji===e?"var(--gold-b)":"var(--bord)"}`,background:form.emoji===e?"var(--gold-dim)":"transparent",fontSize:"18px",cursor:"pointer"}}>{e}</button>
                  ))}
                </div>
              </div>
              <div style={{marginBottom:"10px"}}><label className="flabel">Link acquisto</label><input className="finput" value={form.link} onChange={e=>setForm({...form,link:e.target.value})} placeholder="https://..." /></div>
              <div style={{marginBottom:"1.25rem"}}><label className="flabel">Descrizione breve</label><textarea className="finput" value={form.descrizione} onChange={e=>setForm({...form,descrizione:e.target.value})} placeholder="Descrizione del prodotto..." style={{height:"60px",resize:"none"}} /></div>
              <div style={{display:"flex",gap:"8px",justifyContent:"flex-end"}}>
                <button className="btn-outline" onClick={()=>setShowModal(false)}>Annulla</button>
                <button className="btn-gold" onClick={salvaProdotto} disabled={saving||!form.nome}>{saving?"Salvando...":"Salva prodotto"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
