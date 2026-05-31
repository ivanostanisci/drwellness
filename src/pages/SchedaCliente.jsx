import { useEffect, useState } from "react"
import PianoAlimentarePDF from "../components/PianoAlimentarePDF"
import { useParams, useNavigate } from "react-router-dom"
import Layout from "../components/Layout"
import { supabase } from "../lib/supabase"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export default function SchedaCliente() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [cliente, setCliente] = useState(null)
  const [misurazioni, setMisurazioni] = useState([])
  const [autocheck, setAutocheck] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState("anagrafica")
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState("")
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [generando, setGenerando] = useState(false)
  const [pianoAI, setPianoAI] = useState("")

  const [anamnesi, setAnamnesi] = useState({ patologie:"", farmaci:"", allergie:"", intolleranze:"", fumo:"no", alcol:"no", attivita:"sedentario", ore_sonno:"", stress:"3", note:"" })
  const [antropo, setAntropro] = useState({ peso:"", altezza:"", eta:"", sesso:"M", plica_tricipite:"", plica_bicipite:"", plica_sottoscapolare:"", plica_sovrailiaca:"", plica_addome:"", plica_coscia:"", vita:"", fianchi:"", torace:"", braccio_dx:"", braccio_sx:"", coscia_dx:"", coscia_sx:"", polpaccio_dx:"", polpaccio_sx:"" })
  const [nuovaMis, setNuovaMis] = useState({ peso:"", massa_grassa:"", massa_muscolare:"", note:"" })

  useEffect(() => { fetchDati() }, [id])

  async function fetchDati() {
    const { data: c } = await supabase.from("clienti").select("*").eq("id", id).single()
    const { data: m } = await supabase.from("misurazioni").select("*").eq("cliente_id", id).order("data", { ascending: false })
    const { data: a } = await supabase.from("autocheck").select("*").eq("cliente_id", id).order("created_at", { ascending: false })
    if (c) { 
      setCliente(c)
      setAntropro(prev => ({...prev, peso: c.peso_iniziale||"", altezza: c.altezza||"", ...(c.antropometrica||{})}))
      if (c.anamnesi) setAnamnesi(c.anamnesi)
      if (c.piano_alimentare) setPianoAI(c.piano_alimentare)
    }
    if (m) setMisurazioni(m)
    if (a) setAutocheck(a)
    setLoading(false)
  }

  function calcolaBMI() {
    const p = parseFloat(antropo.peso)
    const h = parseFloat(antropo.altezza) / 100
    if (!p || !h) return "—"
    return (p / (h * h)).toFixed(1)
  }

  function classificaBMI() {
    const bmi = parseFloat(calcolaBMI())
    if (isNaN(bmi)) return ""
    if (bmi < 18.5) return "Sottopeso"
    if (bmi < 25) return "Normopeso"
    if (bmi < 30) return "Sovrappeso"
    return "Obesita"
  }

  function calcolaPercentualeGrasso() {
    const { plica_tricipite, plica_bicipite, plica_sottoscapolare, plica_sovrailiaca, eta, sesso } = antropo
    const somma = [plica_tricipite, plica_bicipite, plica_sottoscapolare, plica_sovrailiaca].map(Number).filter(n => !isNaN(n) && n > 0)
    if (somma.length < 4 || !eta) return "—"
    const s = somma.reduce((a, b) => a + b, 0)
    const logS = Math.log10(s)
    const densita = sesso === "M"
      ? 1.1765 - (0.0744 * logS)
      : 1.1333 - (0.0717 * logS)
    const grasso = ((4.95 / densita) - 4.50) * 100
    return grasso.toFixed(1)
  }

  async function salvaModifiche() {
    setSaving(true)
    const { nome, cognome, email, telefono, peso_iniziale, altezza, obiettivo, note } = editForm
    await supabase.from("clienti").update({ nome, cognome, email, telefono, peso_iniziale, altezza, obiettivo, note }).eq("id", id)
    setEditing(false)
    fetchDati()
    setMsg("Cliente aggiornato!")
    setSaving(false)
    setTimeout(() => setMsg(""), 3000)
  }

  async function salvaMisurazione() {
    setSaving(true)
    await supabase.from("misurazioni").insert([{ ...nuovaMis, cliente_id: id }])
    setNuovaMis({ peso:"", massa_grassa:"", massa_muscolare:"", note:"" })
    fetchDati()
    setMsg("Misurazione salvata!")
    setSaving(false)
    setTimeout(() => setMsg(""), 3000)
  }

  async function generaPiano() {
    setGenerando(true)
    // Salviamo anamnesi e antropometrica
    await supabase.from("clienti").update({ anamnesi: anamnesi, antropometrica: antropo }).eq("id", id)
    try {
      const bmi = antropo.altezza ? (parseFloat(antropo.peso||cliente.peso_iniziale||0) / Math.pow(parseFloat(antropo.altezza||cliente.altezza||1)/100, 2)).toFixed(1) : "N/D"
      const prompt = "Sei il nutrizionista Dr. Wellness. Genera un piano alimentare COMPLETO e DETTAGLIATO per 7 giorni per:\n" +
        "Nome: " + cliente.nome + " " + cliente.cognome + "\n" +
        "Peso: " + (antropo.peso||cliente.peso_iniziale||"N/D") + " kg\n" +
        "Altezza: " + (antropo.altezza||cliente.altezza||"N/D") + " cm\n" +
        "BMI: " + bmi + "\n" +
        "Eta: " + (antropo.eta||"N/D") + "\n" +
        "Sesso: " + (antropo.sesso||"N/D") + "\n" +
        "Obiettivo: " + (cliente.obiettivo||"N/D") + "\n" +
        "Livello attivita: " + (anamnesi.attivita||"sedentario") + "\n" +
        "Patologie: " + (anamnesi.patologie||"nessuna") + "\n" +
        "Farmaci: " + (anamnesi.farmaci||"nessuno") + "\n" +
        "Allergie: " + (anamnesi.allergie||"nessuna") + "\n" +
        "Intolleranze: " + (anamnesi.intolleranze||"nessuna") + "\n" +
        "Fumo: " + (anamnesi.fumo||"no") + "\n" +
        "Alcol: " + (anamnesi.alcol||"no") + "\n" +
        "Ore sonno: " + (anamnesi.ore_sonno||"N/D") + "\n" +
        "Stress: " + (anamnesi.stress||"3") + "/5\n\n" +
        "GENERA OBBLIGATORIAMENTE:\n" +
        "1. CALCOLO TDEE E DEFICIT/SURPLUS CALORICO con formula specifica\n" +
        "2. MACRONUTRIENTI GIORNALIERI (proteine/carboidrati/grassi in grammi)\n" +
        "3. PIANO 7 GIORNI COMPLETO (LUNEDI, MARTEDI, MERCOLEDI, GIOVEDI, VENERDI, SABATO, DOMENICA) ognuno con COLAZIONE, SPUNTINO MATTINA, PRANZO, SPUNTINO POMERIGGIO, CENA con grammature precise\n" +
        "4. LISTA DELLA SPESA settimanale\n" +
        "5. NOTE IMPORTANTI e consigli personalizzati\n\n" +
        "Usa formato chiaro con i nomi dei giorni in maiuscolo. Sii molto specifico con le grammature."
      const res = await fetch("https://pjojacqzpujdesxqqcnf.supabase.co/functions/v1/genera-piano", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqb2phY3F6cHVqZGVzeHFxY25mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3Mjc2MjQsImV4cCI6MjA5NTMwMzYyNH0.cLygQqHlUtCi4esA0a_XcNRxOUL5Z5p5RdB60OmcZ8s" },
        body: JSON.stringify({ model: "claude-sonnet-4-5", max_tokens: 4000, messages: [{ role: "user", content: prompt }] })
      })
      const data = await res.json()
      if (data.content && data.content[0]) setPianoAI(data.content[0].text)
    } catch(e) { setMsg("Errore: " + e.message) }
    setGenerando(false)
  }

  const ff = (setter) => (k, v) => setter(prev => ({...prev, [k]: v}))

  const tabs = ["anagrafica","anamnesi","antropometrica","alimentare","allenamento","misurazioni","progressi","autocheck"]
  const tabLabels = { anagrafica:"Anagrafica", anamnesi:"Anamnesi", antropometrica:"Visita", alimentare:"Alimentare", allenamento:"Allenamento", misurazioni:"Misurazioni", progressi:"Progressi", autocheck:"Autocheck" }

  const graficoData = [...misurazioni].reverse().map(m => ({ data: new Date(m.data).toLocaleDateString("it-IT",{day:"2-digit",month:"2-digit"}), peso: m.peso, grasso: m.massa_grassa, muscolo: m.massa_muscolare }))

  if (loading) return <Layout><div style={{padding:"2rem",textAlign:"center",color:"var(--t2)"}}>Caricamento...</div></Layout>
  if (!cliente) return <Layout><div style={{padding:"2rem",textAlign:"center",color:"var(--t2)"}}>Cliente non trovato</div></Layout>

  return (
    <Layout>
      <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"1.25rem"}}>
        <button onClick={()=>navigate("/clienti")} style={{background:"transparent",border:".5px solid var(--bord)",color:"var(--t2)",borderRadius:"7px",padding:"7px 12px",fontSize:"12px",cursor:"pointer",display:"flex",alignItems:"center",gap:"5px"}}><i className="ti ti-arrow-left"></i> Clienti</button>
        <div style={{flex:1}}>
          <div style={{fontSize:"20px",fontWeight:600,color:"var(--t1)"}}>{cliente.nome} {cliente.cognome}</div>
          <div style={{fontSize:"11px",color:"var(--t2)",marginTop:"2px"}}>{cliente.email} · <span style={{textTransform:"capitalize"}}>{cliente.obiettivo}</span></div>
        </div>
        <span className="pill p-ok">Attivo</span>
        <button onClick={()=>{setEditing(true);setEditForm(cliente)}} style={{background:'rgba(201,168,76,0.12)',border:'.5px solid rgba(201,168,76,0.25)',color:'#C9A84C',borderRadius:'7px',padding:'7px 12px',fontSize:'12px',cursor:'pointer',display:'flex',alignItems:'center',gap:'5px'}}>
          <i className="ti ti-edit"></i> Modifica
        </button>
        <button onClick={()=>{navigator.clipboard.writeText('https://drwellness-q4c5.vercel.app/area-cliente');setMsg('Link copiato! Invialo al cliente via WhatsApp o email')}} style={{background:'rgba(201,168,76,0.12)',border:'.5px solid rgba(201,168,76,0.25)',color:'#C9A84C',borderRadius:'7px',padding:'7px 12px',fontSize:'12px',cursor:'pointer',display:'flex',alignItems:'center',gap:'5px'}}>
          <i className="ti ti-link"></i> Copia link cliente
        </button>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"10px",marginBottom:"1.25rem"}}>
        <div className="stat-card"><div className="stat-icon"><i className="ti ti-weight"></i></div><div className="stat-label">Peso iniziale</div><div className="stat-val">{cliente.peso_iniziale||"—"} <span style={{fontSize:"12px"}}>kg</span></div></div>
        <div className="stat-card"><div className="stat-icon"><i className="ti ti-ruler"></i></div><div className="stat-label">Altezza</div><div className="stat-val">{cliente.altezza||"—"} <span style={{fontSize:"12px"}}>cm</span></div></div>
        <div className="stat-card"><div className="stat-icon"><i className="ti ti-chart-bar"></i></div><div className="stat-label">BMI</div><div className="stat-val">{calcolaBMI()} <span style={{fontSize:"11px",color:"var(--t2)"}}>{classificaBMI()}</span></div></div>
        <div className="stat-card"><div className="stat-icon"><i className="ti ti-percentage"></i></div><div className="stat-label">Massa grassa</div><div className="stat-val">{calcolaPercentualeGrasso()} <span style={{fontSize:"12px"}}>%</span></div></div>
      </div>

      {editing && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100}} onClick={e=>e.target===e.currentTarget&&setEditing(false)}>
          <div style={{background:"var(--card)",border:".5px solid var(--gold-b)",borderRadius:"14px",width:"520px",maxHeight:"85vh",overflowY:"auto"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"1rem 1.25rem",borderBottom:".5px solid var(--bord)"}}>
              <div style={{fontSize:"17px",fontWeight:600,color:"var(--t1)"}}>Modifica cliente</div>
              <button onClick={()=>setEditing(false)} style={{background:"transparent",border:"none",color:"var(--t2)",fontSize:"20px",cursor:"pointer"}}>✕</button>
            </div>
            <div style={{padding:"1.25rem"}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"10px"}}>
                <div><label className="flabel">Nome</label><input className="finput" value={editForm.nome||""} onChange={e=>setEditForm({...editForm,nome:e.target.value})} /></div>
                <div><label className="flabel">Cognome</label><input className="finput" value={editForm.cognome||""} onChange={e=>setEditForm({...editForm,cognome:e.target.value})} /></div>
              </div>
              <div style={{marginBottom:"10px"}}><label className="flabel">Email</label><input className="finput" value={editForm.email||""} onChange={e=>setEditForm({...editForm,email:e.target.value})} /></div>
              <div style={{marginBottom:"10px"}}><label className="flabel">Telefono</label><input className="finput" value={editForm.telefono||""} onChange={e=>setEditForm({...editForm,telefono:e.target.value})} /></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"10px",marginBottom:"10px"}}>
                <div><label className="flabel">Peso (kg)</label><input className="finput" type="number" value={editForm.peso_iniziale||""} onChange={e=>setEditForm({...editForm,peso_iniziale:e.target.value})} /></div>
                <div><label className="flabel">Altezza (cm)</label><input className="finput" type="number" value={editForm.altezza||""} onChange={e=>setEditForm({...editForm,altezza:e.target.value})} /></div>
                
              </div>
              <div style={{marginBottom:"1.25rem"}}><label className="flabel">Obiettivo</label>
                <select className="fselect" value={editForm.obiettivo||""} onChange={e=>setEditForm({...editForm,obiettivo:e.target.value})}>
                  <option value="">Seleziona obiettivo</option>
                  <option value="Dimagrimento e definizione">Dimagrimento e definizione</option>
                  <option value="Aumento massa muscolare">Aumento massa muscolare</option>
                  <option value="Mantenimento peso forma">Mantenimento peso forma</option>
                  <option value="Ricomposizione corporea">Ricomposizione corporea</option>
                  <option value="Miglioramento performance sportiva">Miglioramento performance sportiva</option>
                  <option value="Recupero post infortunio">Recupero post infortunio</option>
                  <option value="Benessere generale e salute">Benessere generale e salute</option>
                  <option value="Preparazione gara o evento">Preparazione gara o evento</option>
                </select>
              </div>
              <div style={{marginBottom:"1.25rem"}}><label className="flabel">Note</label><textarea className="finput" value={editForm.note||""} onChange={e=>setEditForm({...editForm,note:e.target.value})} style={{height:"70px",resize:"none"}} /></div>
              <div style={{display:"flex",gap:"8px",justifyContent:"flex-end"}}>
                <button className="btn-outline" onClick={()=>setEditing(false)}>Annulla</button>
                <button className="btn-gold" onClick={salvaModifiche} disabled={saving}>{saving?"Salvando...":"Salva modifiche"}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {msg && <div style={{background:"var(--gold-dim)",border:".5px solid var(--gold-b)",borderRadius:"8px",padding:"10px 14px",fontSize:"12px",color:"var(--gold)",marginBottom:"1rem"}}>{msg}</div>}

      <div style={{display:"flex",gap:"4px",marginBottom:"1.25rem",background:"var(--card)",border:".5px solid var(--bord)",borderRadius:"10px",padding:"4px",overflowX:"auto"}}>
        {tabs.map(t => (
          <button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:"7px 8px",borderRadius:"7px",fontSize:"10px",fontWeight:500,cursor:"pointer",border:"none",background:tab===t?"var(--gold)":"transparent",color:tab===t?"#0A0A0A":"var(--t2)",transition:"all .15s",whiteSpace:"nowrap",minWidth:"70px"}}>
            {tabLabels[t]}
          </button>
        ))}
      </div>

      {tab === "anagrafica" && (
        <div className="card" style={{padding:"1.25rem"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px"}}>
            {[["Nome",cliente.nome],["Cognome",cliente.cognome],["Email",cliente.email],["Telefono",cliente.telefono||"—"],["Peso iniziale",cliente.peso_iniziale?cliente.peso_iniziale+" kg":"—"],["Altezza",cliente.altezza?cliente.altezza+" cm":"—"],["Obiettivo",cliente.obiettivo]].map(([l,v])=>(
              <div key={l} style={{background:"var(--card2)",border:".5px solid var(--bord)",borderRadius:"8px",padding:"10px 12px"}}>
                <div style={{fontSize:"10px",color:"var(--t3)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:"4px"}}>{l}</div>
                <div style={{fontSize:"13px",color:"var(--t1)",fontWeight:500,textTransform:"capitalize"}}>{v}</div>
              </div>
            ))}
          </div>
          {cliente.note && <div style={{background:"var(--card2)",border:".5px solid var(--bord)",borderRadius:"8px",padding:"10px 12px",marginTop:"12px"}}><div style={{fontSize:"10px",color:"var(--t3)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:"4px"}}>Note</div><div style={{fontSize:"12px",color:"var(--t2)",lineHeight:1.6}}>{cliente.note}</div></div>}
        </div>
      )}

      {tab === "anamnesi" && (
        <div className="card" style={{padding:"1.25rem"}}>
          <div style={{fontSize:"13px",fontWeight:500,color:"var(--t1)",marginBottom:"1rem"}}>Anamnesi medica</div>
          <div style={{marginBottom:"10px"}}><label className="flabel">Patologie diagnosticate</label><textarea className="finput" value={anamnesi.patologie} onChange={e=>ff(setAnamnesi)("patologie",e.target.value)} placeholder="Es. diabete, ipertensione, ipotiroidismo..." style={{height:"70px",resize:"none"}} /></div>
          <div style={{marginBottom:"10px"}}><label className="flabel">Farmaci assunti</label><textarea className="finput" value={anamnesi.farmaci} onChange={e=>ff(setAnamnesi)("farmaci",e.target.value)} placeholder="Es. metformina, levotiroxina..." style={{height:"70px",resize:"none"}} /></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"10px"}}>
            <div><label className="flabel">Allergie</label><textarea className="finput" value={anamnesi.allergie} onChange={e=>ff(setAnamnesi)("allergie",e.target.value)} placeholder="Es. arachidi, pesce..." style={{height:"60px",resize:"none"}} /></div>
            <div><label className="flabel">Intolleranze</label><textarea className="finput" value={anamnesi.intolleranze} onChange={e=>ff(setAnamnesi)("intolleranze",e.target.value)} placeholder="Es. lattosio, glutine..." style={{height:"60px",resize:"none"}} /></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"10px",marginBottom:"10px"}}>
            <div><label className="flabel">Fumo</label><select className="fselect" value={anamnesi.fumo} onChange={e=>ff(setAnamnesi)("fumo",e.target.value)}><option value="no">Non fumatore</option><option value="ex">Ex fumatore</option><option value="si">Fumatore</option></select></div>
            <div><label className="flabel">Alcol</label><select className="fselect" value={anamnesi.alcol} onChange={e=>ff(setAnamnesi)("alcol",e.target.value)}><option value="no">Non beve</option><option value="occasionale">Occasionale</option><option value="settimanale">Settimanale</option></select></div>
            <div><label className="flabel">Attivita fisica</label><select className="fselect" value={anamnesi.attivita} onChange={e=>ff(setAnamnesi)("attivita",e.target.value)}><option value="sedentario">Sedentario</option><option value="leggero">Leggero</option><option value="moderato">Moderato</option><option value="intenso">Intenso</option></select></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"10px"}}>
            <div><label className="flabel">Ore di sonno</label><input className="finput" type="number" value={anamnesi.ore_sonno} onChange={e=>ff(setAnamnesi)("ore_sonno",e.target.value)} placeholder="7" /></div>
            <div><label className="flabel">Livello stress (1-5)</label><select className="fselect" value={anamnesi.stress} onChange={e=>ff(setAnamnesi)("stress",e.target.value)}><option value="1">1 Minimo</option><option value="2">2 Basso</option><option value="3">3 Moderato</option><option value="4">4 Alto</option><option value="5">5 Massimo</option></select></div>
          </div>
          <div style={{marginBottom:"1rem"}}><label className="flabel">Note aggiuntive</label><textarea className="finput" value={anamnesi.note} onChange={e=>ff(setAnamnesi)("note",e.target.value)} placeholder="Altre informazioni rilevanti..." style={{height:"70px",resize:"none"}} /></div>
          <div style={{display:"flex",justifyContent:"flex-end"}}><button className="btn-gold" onClick={async()=>{
      await supabase.from("clienti").update({anamnesi:anamnesi}).eq("id",id)
      setMsg("Anamnesi salvata!")
      setTimeout(()=>setMsg(""),3000)
    }}>Salva anamnesi</button></div>
        </div>
      )}

      {tab === "antropometrica" && (
        <div>
          <div className="card" style={{padding:"1.25rem",marginBottom:"1.25rem"}}>
            <div style={{fontSize:"13px",fontWeight:500,color:"var(--t1)",marginBottom:"1rem"}}>Dati biometrici</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:"10px",marginBottom:"1rem"}}>
              <div><label className="flabel">Peso (kg)</label><input className="finput" type="number" value={antropo.peso} onChange={e=>ff(setAntropro)("peso",e.target.value)} placeholder="75" /></div>
              <div><label className="flabel">Altezza (cm)</label><input className="finput" type="number" value={antropo.altezza} onChange={e=>ff(setAntropro)("altezza",e.target.value)} placeholder="175" /></div>
              <div><label className="flabel">Eta</label><input className="finput" type="number" value={antropo.eta} onChange={e=>ff(setAntropro)("eta",e.target.value)} placeholder="30" /></div>
              <div><label className="flabel">Sesso</label><select className="fselect" value={antropo.sesso} onChange={e=>ff(setAntropro)("sesso",e.target.value)}><option value="M">Maschio</option><option value="F">Femmina</option></select></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"10px",marginBottom:"1rem"}}>
              <div style={{background:"var(--gold-dim)",border:".5px solid var(--gold-b)",borderRadius:"8px",padding:"10px",textAlign:"center"}}>
                <div style={{fontSize:"10px",color:"var(--t2)",marginBottom:"4px"}}>BMI</div>
                <div style={{fontSize:"20px",fontWeight:600,color:"var(--gold)"}}>{calcolaBMI()}</div>
                <div style={{fontSize:"10px",color:"var(--t2)"}}>{classificaBMI()}</div>
              </div>
              <div style={{background:"var(--gold-dim)",border:".5px solid var(--gold-b)",borderRadius:"8px",padding:"10px",textAlign:"center"}}>
                <div style={{fontSize:"10px",color:"var(--t2)",marginBottom:"4px"}}>Massa grassa</div>
                <div style={{fontSize:"20px",fontWeight:600,color:"var(--gold)"}}>{calcolaPercentualeGrasso()}%</div>
                <div style={{fontSize:"10px",color:"var(--t2)"}}>Durnin-Womersley</div>
              </div>
              <div style={{background:"var(--gold-dim)",border:".5px solid var(--gold-b)",borderRadius:"8px",padding:"10px",textAlign:"center"}}>
                <div style={{fontSize:"10px",color:"var(--t2)",marginBottom:"4px"}}>Rapporto vita/fianchi</div>
                <div style={{fontSize:"20px",fontWeight:600,color:"var(--gold)"}}>{antropo.vita && antropo.fianchi ? (antropo.vita/antropo.fianchi).toFixed(2) : "—"}</div>
              </div>
            </div>
          </div>

          <div className="card" style={{padding:"1.25rem",marginBottom:"1.25rem"}}>
            <div style={{fontSize:"13px",fontWeight:500,color:"var(--t1)",marginBottom:"1rem"}}>Plicometria (mm)</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"10px"}}>
              {[["plica_tricipite","Tricipite"],["plica_bicipite","Bicipite"],["plica_sottoscapolare","Sottoscapolare"],["plica_sovrailiaca","Sovrailiaca"],["plica_addome","Addome"],["plica_coscia","Coscia"]].map(([k,l])=>(
                <div key={k}><label className="flabel">{l} (mm)</label><input className="finput" type="number" value={antropo[k]} onChange={e=>ff(setAntropro)(k,e.target.value)} placeholder="0" /></div>
              ))}
            </div>
          </div>

          <div className="card" style={{padding:"1.25rem"}}>
            <div style={{fontSize:"13px",fontWeight:500,color:"var(--t1)",marginBottom:"1rem"}}>Circonferenze (cm)</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"10px"}}>
              {[["vita","Vita"],["fianchi","Fianchi"],["torace","Torace"],["braccio_dx","Braccio Dx"],["braccio_sx","Braccio Sx"],["coscia_dx","Coscia Dx"],["coscia_sx","Coscia Sx"],["polpaccio_dx","Polpaccio Dx"],["polpaccio_sx","Polpaccio Sx"]].map(([k,l])=>(
                <div key={k}><label className="flabel">{l} (cm)</label><input className="finput" type="number" value={antropo[k]} onChange={e=>ff(setAntropro)(k,e.target.value)} placeholder="0" /></div>
              ))}
            </div>
            <div style={{display:"flex",justifyContent:"flex-end",marginTop:"1rem"}}><button className="btn-gold" onClick={async()=>{
      await supabase.from("clienti").update({antropometrica:antropo}).eq("id",id)
      setMsg("Visita antropometrica salvata!")
      setTimeout(()=>setMsg(""),3000)
    }}>Salva visita</button></div>
          </div>
        </div>
      )}

      {tab === "alimentare" && (
        <div className="card" style={{padding:"1.25rem"}}>
          <div style={{fontSize:"13px",fontWeight:500,color:"var(--t1)",marginBottom:"1rem"}}>Piano alimentare</div>
          {!pianoAI ? (
            <div>
              <div style={{background:"var(--gold-dim)",border:".5px solid var(--gold-b)",borderRadius:"8px",padding:"1rem",marginBottom:"1rem",fontSize:"12px",color:"var(--t2)"}}>
                Clicca Genera per creare il piano alimentare personalizzato con AI. Per un piano più preciso compila prima Anamnesi e Visita.
              </div>
              <div style={{display:"flex",justifyContent:"flex-end"}}>
                <button className="btn-gold" onClick={generaPiano} disabled={generando}>{generando?"Generando...":"Genera piano AI"}</button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{marginBottom:"1rem"}}>
              <label style={{fontSize:"11px",color:"var(--t2)",marginBottom:"6px",display:"block"}}>Modifica il piano prima di salvarlo</label>
              <textarea 
                value={pianoAI.replace(/\*\*/g,"").replace(/^###\s*/gm,"").replace(/^##\s*/gm,"").replace(/^#\s*/gm,"").replace(/^---$/gm,"")} 
                onChange={e=>setPianoAI(e.target.value)}
                style={{width:"100%",background:"var(--card2)",border:".5px solid var(--bord)",borderRadius:"8px",padding:"1rem",fontSize:"11px",color:"var(--t1)",lineHeight:1.8,resize:"vertical",minHeight:"400px",outline:"none",fontFamily:"DM Sans,sans-serif"}}
              />
            </div>
            <div style={{display:"flex",gap:"8px",justifyContent:"flex-end",marginBottom:"1rem"}}>
              <button className="btn-outline" onClick={()=>setPianoAI("")}>Rigenera</button>
              <button className="btn-gold" onClick={async()=>{
                await supabase.from("clienti").update({piano_alimentare: pianoAI}).eq("id",id)
                setMsg("Piano salvato!")
                setTimeout(()=>setMsg(""),3000)
              }}><i className="ti ti-device-floppy"></i> Salva piano</button>
              {msg === "Piano salvato!" && <span style={{fontSize:"12px",color:"var(--green)",fontWeight:500}}>✓ Piano salvato!</span>}
            </div>
            <PianoAlimentarePDF piano={pianoAI} cliente={cliente} />
            </div>
          )}
        </div>
      )}

      {tab === "allenamento" && (
        <div className="card" style={{padding:"2rem",textAlign:"center"}}>
          <i className="ti ti-barbell" style={{fontSize:"36px",color:"var(--t3)",display:"block",marginBottom:"12px"}}></i>
          <div style={{fontSize:"13px",color:"var(--t2)",marginBottom:"16px"}}>Scheda allenamento personalizzata</div>
          <button className="btn-gold" style={{margin:"0 auto"}}>Crea scheda allenamento</button>
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
            <div style={{marginBottom:"10px"}}><label className="flabel">Note</label><textarea className="finput" value={nuovaMis.note} onChange={e=>setNuovaMis({...nuovaMis,note:e.target.value})} style={{height:"60px",resize:"none"}} placeholder="Note..." /></div>
            <div style={{display:"flex",justifyContent:"flex-end"}}><button className="btn-gold" onClick={salvaMisurazione} disabled={saving}>{saving?"Salvando...":"Salva"}</button></div>
          </div>
          <div className="card">
            <div className="card-hdr"><span className="card-title">Storico</span></div>
            {misurazioni.length === 0 ? <div style={{padding:"2rem",textAlign:"center",fontSize:"12px",color:"var(--t2)"}}>Nessuna misurazione ancora</div> :
            misurazioni.map((m,i)=>(
              <div key={m.id} style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr 2fr",gap:"10px",padding:"10px 1.1rem",borderBottom:i<misurazioni.length-1?".5px solid var(--bord)":"none",fontSize:"12px",alignItems:"center"}}>
                <div style={{color:"var(--t2)"}}>{new Date(m.data).toLocaleDateString("it-IT")}</div>
                <div><span style={{color:"var(--gold)",fontWeight:500}}>{m.peso||"—"}</span> kg</div>
                <div><span style={{color:"var(--t1)"}}>{m.massa_grassa||"—"}</span>% grasso</div>
                <div><span style={{color:"var(--t1)"}}>{m.massa_muscolare||"—"}</span>% muscolo</div>
                <div style={{color:"var(--t2)",fontSize:"11px"}}>{m.note||"—"}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "progressi" && (
        <div>
          <div className="card" style={{padding:"1.25rem",marginBottom:"1.25rem"}}>
            <div style={{fontSize:"13px",fontWeight:500,color:"var(--t1)",marginBottom:"1rem"}}>Andamento peso</div>
            {graficoData.length < 2 ? <div style={{textAlign:"center",padding:"2rem",fontSize:"12px",color:"var(--t2)"}}>Aggiungi almeno 2 misurazioni per vedere il grafico</div> :
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={graficoData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,168,76,0.1)" />
                <XAxis dataKey="data" tick={{fontSize:10,fill:"var(--t2)"}} />
                <YAxis tick={{fontSize:10,fill:"var(--t2)"}} />
                <Tooltip contentStyle={{background:"var(--card)",border:".5px solid var(--gold-b)",borderRadius:"8px",fontSize:"11px"}} />
                <Line type="monotone" dataKey="peso" stroke="#C9A84C" strokeWidth={2} dot={{fill:"#C9A84C",r:4}} name="Peso (kg)" />
              </LineChart>
            </ResponsiveContainer>}
          </div>
          <div className="card" style={{padding:"1.25rem"}}>
            <div style={{fontSize:"13px",fontWeight:500,color:"var(--t1)",marginBottom:"1rem"}}>Composizione corporea</div>
            {graficoData.length < 2 ? <div style={{textAlign:"center",padding:"2rem",fontSize:"12px",color:"var(--t2)"}}>Aggiungi almeno 2 misurazioni per vedere il grafico</div> :
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={graficoData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,168,76,0.1)" />
                <XAxis dataKey="data" tick={{fontSize:10,fill:"var(--t2)"}} />
                <YAxis tick={{fontSize:10,fill:"var(--t2)"}} />
                <Tooltip contentStyle={{background:"var(--card)",border:".5px solid var(--gold-b)",borderRadius:"8px",fontSize:"11px"}} />
                <Line type="monotone" dataKey="grasso" stroke="#B87A7A" strokeWidth={2} dot={{fill:"#B87A7A",r:4}} name="Grasso (%)" />
                <Line type="monotone" dataKey="muscolo" stroke="#7AB87A" strokeWidth={2} dot={{fill:"#7AB87A",r:4}} name="Muscolo (%)" />
              </LineChart>
            </ResponsiveContainer>}
          </div>
        </div>
      )}

      {tab === "autocheck" && (
        <div className="card">
          <div className="card-hdr"><span className="card-title">Autocheck ricevuti</span></div>
          {autocheck.length === 0 ? <div style={{padding:"2rem",textAlign:"center",fontSize:"12px",color:"var(--t2)"}}>Nessun autocheck ancora</div> :
          autocheck.map((a,i)=>(
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
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}
