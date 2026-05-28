import { useState, useRef } from "react"
import Layout from "../components/Layout"
import { supabase } from "../lib/supabase"

export default function Autocheck() {
  const [foto, setFoto] = useState({ fronte: null, retro: null, sx: null, dx: null })
  const [step, setStep] = useState(1)
  const [fotoAttiva, setFotoAttiva] = useState(null)
  const [camera, setCamera] = useState(false)
  const [form, setForm] = useState({ peso: "", energia: 3, umore: 3, sonno: 3, motivazione: 3, note: "" })
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const fileRef = useRef(null)
  const streamRef = useRef(null)

  const slots = [
    { key: "fronte", label: "Fronte" },
    { key: "retro", label: "Retro" },
    { key: "sx", label: "Lato Sinistro" },
    { key: "dx", label: "Lato Destro" }
  ]

  async function apriCamera(key) {
    setFotoAttiva(key)
    setCamera(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
    } catch(e) { alert("Camera non disponibile: " + e.message) }
  }

  function scattaFoto() {
    const canvas = canvasRef.current
    const video = videoRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext("2d").drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL("image/jpeg")
    setFoto(prev => ({ ...prev, [fotoAttiva]: dataUrl }))
    chiudiCamera()
  }

  function chiudiCamera() {
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
    setCamera(false)
    setFotoAttiva(null)
  }

  function caricaFoto(key, e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setFoto(prev => ({ ...prev, [key]: ev.target.result }))
    reader.readAsDataURL(file)
  }

  async function inviaAutocheck() {
    setSaving(true)
    try {
      await supabase.from("autocheck").insert([{
        peso: form.peso,
        energia: form.energia,
        umore: form.umore,
        sonno_qualita: form.sonno,
        motivazione: form.motivazione,
        note_cliente: form.note,
        foto_fronte: foto.fronte,
        foto_retro: foto.retro,
        foto_lato_sx: foto.sx,
        foto_lato_dx: foto.dx,
        letto_pt: false
      }])
      setDone(true)
    } catch(e) { alert("Errore: " + e.message) }
    setSaving(false)
  }

  const ff = (k, v) => setForm(prev => ({ ...prev, [k]: v }))
  const fotoOk = Object.values(foto).filter(Boolean).length

  if (done) return (
    <Layout>
      <div style={{textAlign:"center",padding:"4rem 1rem"}}>
        <div style={{fontSize:"50px",marginBottom:"16px"}}>🏆</div>
        <div style={{fontSize:"22px",fontWeight:600,color:"var(--t1)",marginBottom:"8px"}}>Autocheck inviato!</div>
        <div style={{fontSize:"13px",color:"var(--t2)",marginBottom:"24px"}}>Il tuo PT riceverà il report automaticamente</div>
        <button className="btn-gold" onClick={()=>{setDone(false);setFoto({fronte:null,retro:null,sx:null,dx:null});setForm({peso:"",energia:3,umore:3,sonno:3,motivazione:3,note:""});setStep(1)}}>Nuovo autocheck</button>
      </div>
    </Layout>
  )

  return (
    <Layout>
      {camera && (
        <div style={{position:"fixed",inset:0,background:"#000",zIndex:200,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
          <div style={{fontSize:"13px",color:"var(--gold)",marginBottom:"12px",fontWeight:500}}>
            {slots.find(s=>s.key===fotoAttiva)?.label}
          </div>
          <video ref={videoRef} autoPlay playsInline style={{width:"100%",maxWidth:"400px",borderRadius:"12px"}} />
          <canvas ref={canvasRef} style={{display:"none"}} />
          <div style={{display:"flex",gap:"16px",marginTop:"20px"}}>
            <button onClick={chiudiCamera} style={{background:"rgba(255,255,255,0.1)",border:".5px solid rgba(255,255,255,0.2)",color:"white",borderRadius:"8px",padding:"10px 20px",fontSize:"13px",cursor:"pointer"}}>Annulla</button>
            <button onClick={scattaFoto} style={{background:"var(--gold)",border:"none",color:"#0A0A0A",borderRadius:"50%",width:"64px",height:"64px",fontSize:"20px",cursor:"pointer"}}>📸</button>
          </div>
        </div>
      )}

      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1.5rem"}}>
        <div>
          <div style={{fontSize:"22px",fontWeight:600,color:"var(--t1)"}}>Autocheck</div>
          <div style={{fontSize:"11px",color:"var(--t2)",marginTop:"2px"}}>Foto + dati ogni 7/14/21/28 giorni</div>
        </div>
      </div>

      <div style={{display:"flex",gap:"0",marginBottom:"1.5rem",background:"var(--card)",border:".5px solid var(--bord)",borderRadius:"10px",padding:"1rem 1.5rem",alignItems:"center"}}>
        {["Foto","Dati","Invia"].map((s,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",flex:i<2?1:"auto"}}>
            <div style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"11px",fontWeight:500,color:step===i+1?"var(--gold)":step>i+1?"var(--green)":"var(--t3)",cursor:"pointer"}} onClick={()=>step>i+1&&setStep(i+1)}>
              <div style={{width:"22px",height:"22px",borderRadius:"50%",background:step===i+1?"var(--gold-dim)":step>i+1?"rgba(122,184,122,0.1)":"var(--card2)",border:".5px solid "+(step===i+1?"var(--gold-b)":step>i+1?"rgba(122,184,122,0.3)":"var(--bord)"),display:"flex",alignItems:"center",justifyContent:"center",fontSize:"10px",fontWeight:600}}>{step>i+1?"v":i+1}</div>{s}
            </div>
            {i<2&&<div style={{flex:1,height:".5px",background:step>i+1?"rgba(122,184,122,0.3)":"var(--bord)",margin:"0 10px"}}></div>}
          </div>
        ))}
      </div>

      <div className="card" style={{padding:"1.5rem"}}>

        {step===1 && (
          <div>
            <div style={{fontSize:"13px",fontWeight:500,color:"var(--t1)",marginBottom:"1rem"}}>Scatta o carica le foto</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:"12px",marginBottom:"1.5rem"}}>
              {slots.map(slot => (
                <div key={slot.key} style={{background:"var(--card2)",border:".5px solid "+(foto[slot.key]?"rgba(122,184,122,0.3)":"var(--bord)"),borderRadius:"10px",overflow:"hidden"}}>
                  <div style={{height:"120px",background:"#050505",display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden"}}>
                    {foto[slot.key]
                      ? <img src={foto[slot.key]} style={{width:"100%",height:"100%",objectFit:"cover"}} alt={slot.label} />
                      : <i className="ti ti-camera" style={{fontSize:"32px",color:"var(--t3)"}}></i>
                    }
                    {foto[slot.key] && (
                      <div style={{position:"absolute",top:"6px",right:"6px",background:"var(--green)",borderRadius:"50%",width:"20px",height:"20px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"11px",color:"white"}}>✓</div>
                    )}
                  </div>
                  <div style={{padding:"8px 10px"}}>
                    <div style={{fontSize:"11px",fontWeight:500,color:foto[slot.key]?"var(--green)":"var(--t2)",marginBottom:"6px"}}>{slot.label}</div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"5px"}}>
                      <button onClick={()=>apriCamera(slot.key)} style={{padding:"5px",borderRadius:"6px",fontSize:"10px",fontWeight:500,cursor:"pointer",border:".5px solid var(--gold-b)",background:"var(--gold-dim)",color:"var(--gold)"}}>📸 Scatta</button>
                      <button onClick={()=>{setFotoAttiva(slot.key);fileRef.current.click()}} style={{padding:"5px",borderRadius:"6px",fontSize:"10px",fontWeight:500,cursor:"pointer",border:".5px solid var(--bord)",background:"transparent",color:"var(--t2)"}}>📁 Carica</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>caricaFoto(fotoAttiva,e)} />
            <div style={{fontSize:"11px",color:"var(--t2)",marginBottom:"1rem",textAlign:"center"}}>{fotoOk}/4 foto {fotoOk===4?"✓ tutte caricate":"— puoi continuare anche senza"}</div>
            <div style={{display:"flex",justifyContent:"flex-end"}}>
              <button className="btn-gold" onClick={()=>setStep(2)}>Avanti</button>
            </div>
          </div>
        )}

        {step===2 && (
          <div>
            <div style={{fontSize:"13px",fontWeight:500,color:"var(--t1)",marginBottom:"1rem"}}>Come stai?</div>
            <div style={{marginBottom:"12px"}}>
              <label className="flabel">Peso attuale (kg)</label>
              <input className="finput" type="number" value={form.peso} onChange={e=>ff("peso",e.target.value)} placeholder="es. 78.5" />
            </div>
            {[{k:"energia",l:"Energia"},{k:"umore",l:"Umore"},{k:"sonno",l:"Qualita sonno"},{k:"motivazione",l:"Motivazione"}].map(item=>(
              <div key={item.k} style={{background:"var(--card2)",border:".5px solid var(--bord)",borderRadius:"8px",padding:"10px 12px",marginBottom:"8px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <span style={{fontSize:"12px",fontWeight:500,color:"var(--t1)"}}>{item.l}</span>
                <div style={{display:"flex",gap:"6px"}}>
                  {[1,2,3,4,5].map(v=>(
                    <button key={v} onClick={()=>ff(item.k,v)} style={{width:"28px",height:"28px",borderRadius:"6px",border:".5px solid",borderColor:form[item.k]>=v?"var(--gold-b)":"var(--bord)",background:form[item.k]>=v?"var(--gold-dim)":"transparent",color:form[item.k]>=v?"var(--gold)":"var(--t3)",fontSize:"12px",cursor:"pointer",fontWeight:500}}>{v}</button>
                  ))}
                </div>
              </div>
            ))}
            <div style={{marginTop:"12px",marginBottom:"1.5rem"}}>
              <label className="flabel">Note per il PT</label>
              <textarea className="finput" value={form.note} onChange={e=>ff("note",e.target.value)} placeholder="Come ti senti? Qualcosa da segnalare?" style={{height:"70px",resize:"none"}} />
            </div>
            <div style={{display:"flex",gap:"8px",justifyContent:"flex-end"}}>
              <button className="btn-outline" onClick={()=>setStep(1)}>Indietro</button>
              <button className="btn-gold" onClick={()=>setStep(3)}>Avanti</button>
            </div>
          </div>
        )}

        {step===3 && (
          <div>
            <div style={{fontSize:"13px",fontWeight:500,color:"var(--t1)",marginBottom:"1rem"}}>Riepilogo autocheck</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"8px",marginBottom:"1rem"}}>
              {slots.map(slot=>(
                <div key={slot.key} style={{background:"var(--card2)",border:".5px solid "+(foto[slot.key]?"rgba(122,184,122,0.3)":"var(--bord)"),borderRadius:"8px",height:"70px",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {foto[slot.key]
                    ? <img src={foto[slot.key]} style={{width:"100%",height:"100%",objectFit:"cover"}} alt={slot.label} />
                    : <span style={{fontSize:"10px",color:"var(--t3)"}}>No foto</span>
                  }
                </div>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:"8px",marginBottom:"1.5rem"}}>
              <div style={{background:"var(--card2)",border:".5px solid var(--bord)",borderRadius:"8px",padding:"10px"}}>
                <div style={{fontSize:"10px",color:"var(--t3)",marginBottom:"3px"}}>Peso</div>
                <div style={{fontSize:"16px",fontWeight:600,color:"var(--gold)"}}>{form.peso||"—"} kg</div>
              </div>
              <div style={{background:"var(--card2)",border:".5px solid var(--bord)",borderRadius:"8px",padding:"10px"}}>
                <div style={{fontSize:"10px",color:"var(--t3)",marginBottom:"3px"}}>Energia</div>
                <div style={{fontSize:"16px",fontWeight:600,color:"var(--gold)"}}>{form.energia}/5</div>
              </div>
            </div>
            <div style={{background:"var(--gold-dim)",border:".5px solid var(--gold-b)",borderRadius:"8px",padding:"1rem",marginBottom:"1.5rem",fontSize:"12px",color:"var(--t2)"}}>
              Il tuo PT ricevera automaticamente il report con le foto e i tuoi dati.
            </div>
            <div style={{display:"flex",gap:"8px",justifyContent:"flex-end"}}>
              <button className="btn-outline" onClick={()=>setStep(2)}>Indietro</button>
              <button className="btn-gold" onClick={inviaAutocheck} disabled={saving}>{saving?"Invio...":"Invia al PT"}</button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
