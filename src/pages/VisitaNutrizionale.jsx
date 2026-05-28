import { useState } from "react"
import Layout from "../components/Layout"

export default function VisitaNutrizionale() {
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [pianoGenerato, setPianoGenerato] = useState("")
  const [msg, setMsg] = useState("")
  const [form, setForm] = useState({
    nome:"", cognome:"", email:"", sesso:"M", peso:"", altezza:"",
    obiettivo:"dimagrimento", attivita_fisica:"sedentario",
    patologie:"", intolleranze:"", allergie:"",
    colazione:"", pranzo:"", cena:"",
    preferenze:"", cibi_no:"", note:""
  })

  const ff = (k,v) => setForm(prev => ({...prev,[k]:v}))
  const stepLabels = ["Anagrafica","Anamnesi","Abitudini","Preferenze","Piano AI"]

  async function generaPiano() {
    setSaving(true)
    setMsg("")
    try {
      const prompt = "Sei un nutrizionista esperto. Crea un piano alimentare per: " + form.nome + " " + form.cognome + ", Peso: " + form.peso + "kg, Altezza: " + form.altezza + "cm, Obiettivo: " + form.obiettivo + ", Attivita: " + form.attivita_fisica + ", Patologie: " + (form.patologie||"nessuna") + ", Intolleranze: " + (form.intolleranze||"nessuna") + ", Cibi preferiti: " + form.preferenze + ", Cibi non graditi: " + form.cibi_no + ". Genera: 1) TDEE e macros 2) Piano 7 giorni 3) Lista spesa 4) 5 consigli"
      const res = await fetch("http://localhost:3001/api/genera-piano", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, messages: [{ role: "user", content: prompt }] })
      })
      const data = await res.json()
      if(data.content && data.content[0]) {
        setPianoGenerato(data.content[0].text)
        setStep(5)
      } else {
        setMsg("Errore: " + JSON.stringify(data))
      }
    } catch(e) {
      setMsg("Errore: " + e.message)
    }
    setSaving(false)
  }

  return (
    <Layout>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1.5rem"}}>
        <div>
          <div style={{fontSize:"22px",fontWeight:600,color:"var(--t1)"}}>Visita Nutrizionale</div>
          <div style={{fontSize:"11px",color:"var(--t2)",marginTop:"2px"}}>Anamnesi completa e piano alimentare AI</div>
        </div>
      </div>
      <div style={{display:"flex",alignItems:"center",marginBottom:"1.5rem",background:"var(--card)",border:".5px solid var(--bord)",borderRadius:"10px",padding:"1rem 1.5rem"}}>
        {stepLabels.map((s,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",flex:i<4?1:"auto"}}>
            <div style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"11px",fontWeight:500,color:step===i+1?"var(--gold)":step>i+1?"var(--green)":"var(--t3)",cursor:"pointer"}} onClick={()=>step>i+1&&setStep(i+1)}>
              <div style={{width:"22px",height:"22px",borderRadius:"50%",background:step===i+1?"var(--gold-dim)":step>i+1?"rgba(122,184,122,0.1)":"var(--card2)",border:".5px solid "+(step===i+1?"var(--gold-b)":step>i+1?"rgba(122,184,122,0.3)":"var(--bord)"),display:"flex",alignItems:"center",justifyContent:"center",fontSize:"10px",fontWeight:600}}>{step>i+1?"v":i+1}</div>{s}
            </div>
            {i<4&&<div style={{flex:1,height:".5px",background:step>i+1?"rgba(122,184,122,0.3)":"var(--bord)",margin:"0 10px"}}></div>}
          </div>
        ))}
      </div>
      {msg && <div style={{background:"rgba(184,122,122,0.1)",border:".5px solid rgba(184,122,122,0.2)",borderRadius:"8px",padding:"10px 14px",fontSize:"12px",color:"var(--red)",marginBottom:"1rem"}}>{msg}</div>}
      <div className="card" style={{padding:"1.5rem"}}>
        {step===1 && (
          <div>
            <div style={{fontSize:"13px",fontWeight:500,color:"var(--t1)",marginBottom:"1rem"}}>Dati anagrafici</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"10px"}}>
              <div><label className="flabel">Nome</label><input className="finput" value={form.nome} onChange={e=>ff("nome",e.target.value)} placeholder="Mario" /></div>
              <div><label className="flabel">Cognome</label><input className="finput" value={form.cognome} onChange={e=>ff("cognome",e.target.value)} placeholder="Rossi" /></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"10px",marginBottom:"10px"}}>
              <div><label className="flabel">Peso (kg)</label><input className="finput" type="number" value={form.peso} onChange={e=>ff("peso",e.target.value)} placeholder="75" /></div>
              <div><label className="flabel">Altezza (cm)</label><input className="finput" type="number" value={form.altezza} onChange={e=>ff("altezza",e.target.value)} placeholder="175" /></div>
              <div><label className="flabel">Sesso</label><select className="fselect" value={form.sesso} onChange={e=>ff("sesso",e.target.value)}><option value="M">Maschio</option><option value="F">Femmina</option></select></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"1.5rem"}}>
              <div><label className="flabel">Obiettivo</label><select className="fselect" value={form.obiettivo} onChange={e=>ff("obiettivo",e.target.value)}><option value="dimagrimento">Dimagrimento</option><option value="massa">Massa</option><option value="mantenimento">Mantenimento</option></select></div>
              <div><label className="flabel">Attivita fisica</label><select className="fselect" value={form.attivita_fisica} onChange={e=>ff("attivita_fisica",e.target.value)}><option value="sedentario">Sedentario</option><option value="leggero">Leggero</option><option value="moderato">Moderato</option><option value="intenso">Intenso</option></select></div>
            </div>
            <div style={{display:"flex",justifyContent:"flex-end"}}><button className="btn-gold" onClick={()=>setStep(2)}>Avanti</button></div>
          </div>
        )}
        {step===2 && (
          <div>
            <div style={{fontSize:"13px",fontWeight:500,color:"var(--t1)",marginBottom:"1rem"}}>Anamnesi medica</div>
            <div style={{marginBottom:"10px"}}><label className="flabel">Patologie</label><textarea className="finput" value={form.patologie} onChange={e=>ff("patologie",e.target.value)} placeholder="Es. diabete, ipertensione..." style={{height:"70px",resize:"none"}} /></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"1.5rem"}}>
              <div><label className="flabel">Intolleranze</label><textarea className="finput" value={form.intolleranze} onChange={e=>ff("intolleranze",e.target.value)} placeholder="Es. lattosio, glutine..." style={{height:"70px",resize:"none"}} /></div>
              <div><label className="flabel">Allergie</label><textarea className="finput" value={form.allergie} onChange={e=>ff("allergie",e.target.value)} placeholder="Es. arachidi..." style={{height:"70px",resize:"none"}} /></div>
            </div>
            <div style={{display:"flex",gap:"8px",justifyContent:"flex-end"}}><button className="btn-outline" onClick={()=>setStep(1)}>Indietro</button><button className="btn-gold" onClick={()=>setStep(3)}>Avanti</button></div>
          </div>
        )}
        {step===3 && (
          <div>
            <div style={{fontSize:"13px",fontWeight:500,color:"var(--t1)",marginBottom:"1rem"}}>Abitudini alimentari</div>
            <div style={{marginBottom:"10px"}}><label className="flabel">Colazione tipica</label><textarea className="finput" value={form.colazione} onChange={e=>ff("colazione",e.target.value)} placeholder="Es. caffe e biscotti..." style={{height:"65px",resize:"none"}} /></div>
            <div style={{marginBottom:"10px"}}><label className="flabel">Pranzo tipico</label><textarea className="finput" value={form.pranzo} onChange={e=>ff("pranzo",e.target.value)} placeholder="Es. pasta con sugo..." style={{height:"65px",resize:"none"}} /></div>
            <div style={{marginBottom:"1.5rem"}}><label className="flabel">Cena tipica</label><textarea className="finput" value={form.cena} onChange={e=>ff("cena",e.target.value)} placeholder="Es. carne con verdure..." style={{height:"65px",resize:"none"}} /></div>
            <div style={{display:"flex",gap:"8px",justifyContent:"flex-end"}}><button className="btn-outline" onClick={()=>setStep(2)}>Indietro</button><button className="btn-gold" onClick={()=>setStep(4)}>Avanti</button></div>
          </div>
        )}
        {step===4 && (
          <div>
            <div style={{fontSize:"13px",fontWeight:500,color:"var(--t1)",marginBottom:"1rem"}}>Preferenze</div>
            <div style={{marginBottom:"10px"}}><label className="flabel">Cibi preferiti</label><textarea className="finput" value={form.preferenze} onChange={e=>ff("preferenze",e.target.value)} placeholder="Es. pollo, riso, pesce..." style={{height:"80px",resize:"none"}} /></div>
            <div style={{marginBottom:"1.5rem"}}><label className="flabel">Cibi non graditi</label><textarea className="finput" value={form.cibi_no} onChange={e=>ff("cibi_no",e.target.value)} placeholder="Es. fegato, pesce azzurro..." style={{height:"80px",resize:"none"}} /></div>
            <div style={{background:"var(--gold-dim)",border:".5px solid var(--gold-b)",borderRadius:"8px",padding:"1rem",marginBottom:"1.5rem",fontSize:"12px",color:"var(--t2)"}}>Clicca Genera Piano AI per creare un piano alimentare completo in pochi secondi.</div>
            <div style={{display:"flex",gap:"8px",justifyContent:"flex-end"}}><button className="btn-outline" onClick={()=>setStep(3)}>Indietro</button><button className="btn-gold" onClick={generaPiano} disabled={saving}>{saving?"Generando...":"Genera Piano AI"}</button></div>
          </div>
        )}
        {step===5 && (
          <div>
            <div style={{textAlign:"center",marginBottom:"1.5rem"}}>
              <div style={{fontSize:"40px",marginBottom:"8px"}}>🏆</div>
              <div style={{fontSize:"20px",fontWeight:600,color:"var(--t1)",marginBottom:"4px"}}>Piano Generato!</div>
            </div>
            <div style={{background:"var(--card2)",border:".5px solid var(--bord)",borderRadius:"10px",padding:"1.25rem",maxHeight:"400px",overflowY:"auto",fontSize:"12px",color:"var(--t2)",lineHeight:1.8,whiteSpace:"pre-wrap",marginBottom:"1rem"}}>{pianoGenerato}</div>
            <div style={{display:"flex",gap:"8px",justifyContent:"flex-end"}}>
              <button className="btn-outline" onClick={()=>{setStep(1);setPianoGenerato("")}}>Nuova visita</button>
              <button className="btn-gold" onClick={()=>window.print()}>Stampa</button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
