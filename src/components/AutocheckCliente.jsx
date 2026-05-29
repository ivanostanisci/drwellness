import { useState, useRef } from "react"
import { supabase } from "../lib/supabase"

export default function AutocheckCliente({ clienteId }) {
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
        cliente_id: clienteId,
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

  const s = { card: {background:"#161616",border:".5px solid rgba(201,168,76,0.15)",borderRadius:"10px",padding:"1.25rem",marginBottom:"1rem"}, btn: {background:"#C9A84C",color:"#0A0A0A",border:"none",borderRadius:"7px",padding:"9px 16px",fontSize:"12px",fontWeight:500,cursor:"pointer"}, btnOut: {background:"transparent",border:".5px solid rgba(201,168,76,0.2)",color:"#8A7A5A",borderRadius:"7px",padding:"9px 14px",fontSize:"12px",cursor:"pointer"}, input: {width:"100%",background:"#0A0A0A",border:".5px solid rgba(201,168,76,0.15)",borderRadius:"7px",padding:"8px 10px",fontSize:"13px",color:"#F0E6C8",outline:"none",fontFamily:"DM Sans,sans-serif"}, label: {fontSize:"11px",color:"#8A7A5A",marginBottom:"4px",display:"block"} }

  if (done) return (
    <div style={{textAlign:"center",padding:"2rem"}}>
      <div style={{fontSize:"40px",marginBottom:"12px"}}>🏆</div>
      <div style={{fontSize:"16px",fontWeight:600,color:"#F0E6C8",marginBottom:"6px"}}>Autocheck inviato!</div>
      <div style={{fontSize:"12px",color:"#8A7A5A",marginBottom:"16px"}}>Il tuo PT ricevera il report automaticamente</div>
      <button style={s.btn} onClick={()=>{setDone(false);setFoto({fronte:null,retro:null,sx:null,dx:null});setForm({peso:"",energia:3,umore:3,sonno:3,motivazione:3,note:""});setStep(1)}}>Nuovo autocheck</button>
    </div>
  )

  return (
    <div>
      {camera && (
        <div style={{position:"fixed",inset:0,background:"#000",zIndex:200,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
          <div style={{fontSize:"13px",color:"#C9A84C",marginBottom:"12px",fontWeight:500}}>{slots.find(s=>s.key===fotoAttiva)?.label}</div>
          <video ref={videoRef} autoPlay playsInline style={{width:"100%",maxWidth:"400px",borderRadius:"12px"}} />
          <canvas ref={canvasRef} style={{display:"none"}} />
          <div style={{display:"flex",gap:"16px",marginTop:"20px"}}>
            <button onClick={chiudiCamera} style={{background:"rgba(255,255,255,0.1)",border:".5px solid rgba(255,255,255,0.2)",color:"white",borderRadius:"8px",padding:"10px 20px",fontSize:"13px",cursor:"pointer"}}>Annulla</button>
            <button onClick={scattaFoto} style={{background:"#C9A84C",border:"none",color:"#0A0A0A",borderRadius:"50%",width:"64px",height:"64px",fontSize:"20px",cursor:"pointer"}}>📸</button>
          </div>
        </div>
      )}

      <div style={{display:"flex",gap:"4px",marginBottom:"1rem",background:"#0A0A0A",border:".5px solid rgba(201,168,76,0.15)",borderRadius:"8px",padding:"3px"}}>
        {["Foto","Dati","Invia"].map((label,i)=>(
          <button key={i} onClick={()=>step>i+1&&setStep(i+1)} style={{flex:1,padding:"6px",borderRadius:"6px",fontSize:"11px",fontWeight:500,cursor:"pointer",border:"none",background:step===i+1?"#C9A84C":"transparent",color:step===i+1?"#0A0A0A":"#8A7A5A"}}>
            {step>i+1?"✓ ":""}{label}
          </button>
        ))}
      </div>

      {step===1 && (
        <div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"1rem"}}>
            {slots.map(slot => (
              <div key={slot.key} style={{background:"#161616",border:".5px solid "+(foto[slot.key]?"rgba(122,184,122,0.3)":"rgba(201,168,76,0.1)"),borderRadius:"10px",overflow:"hidden"}}>
                <div style={{height:"100px",background:"#050505",display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden"}}>
                  {foto[slot.key] ? <img src={foto[slot.key]} style={{width:"100%",height:"100%",objectFit:"cover"}} alt={slot.label} /> : <span style={{fontSize:"24px"}}>📷</span>}
                  {foto[slot.key] && <div style={{position:"absolute",top:"6px",right:"6px",background:"#7AB87A",borderRadius:"50%",width:"18px",height:"18px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"10px",color:"white"}}>✓</div>}
                </div>
                <div style={{padding:"8px"}}>
                  <div style={{fontSize:"10px",color:foto[slot.key]?"#7AB87A":"#8A7A5A",marginBottom:"5px",fontWeight:500}}>{slot.label}</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"4px"}}>
                    <button onClick={()=>apriCamera(slot.key)} style={{padding:"5px",borderRadius:"5px",fontSize:"9px",fontWeight:500,cursor:"pointer",border:".5px solid rgba(201,168,76,0.3)",background:"rgba(201,168,76,0.1)",color:"#C9A84C"}}>📸 Scatta</button>
                    <button onClick={()=>{setFotoAttiva(slot.key);fileRef.current.click()}} style={{padding:"5px",borderRadius:"5px",fontSize:"9px",fontWeight:500,cursor:"pointer",border:".5px solid rgba(201,168,76,0.15)",background:"transparent",color:"#8A7A5A"}}>📁 Carica</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>caricaFoto(fotoAttiva,e)} />
          <div style={{fontSize:"11px",color:"#8A7A5A",textAlign:"center",marginBottom:"1rem"}}>{fotoOk}/4 foto</div>
          <div style={{display:"flex",justifyContent:"flex-end"}}><button style={s.btn} onClick={()=>setStep(2)}>Avanti</button></div>
        </div>
      )}

      {step===2 && (
        <div>
          <div style={{marginBottom:"10px"}}>
            <label style={s.label}>Peso attuale (kg)</label>
            <input style={s.input} type="number" value={form.peso} onChange={e=>ff("peso",e.target.value)} placeholder="es. 78.5" />
          </div>
          {[{k:"energia",l:"Energia"},{k:"umore",l:"Umore"},{k:"sonno",l:"Qualita sonno"},{k:"motivazione",l:"Motivazione"}].map(item=>(
            <div key={item.k} style={{background:"#161616",border:".5px solid rgba(201,168,76,0.1)",borderRadius:"8px",padding:"10px 12px",marginBottom:"8px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <span style={{fontSize:"12px",fontWeight:500,color:"#F0E6C8"}}>{item.l}</span>
              <div style={{display:"flex",gap:"6px"}}>
                {[1,2,3,4,5].map(v=>(
                  <button key={v} onClick={()=>ff(item.k,v)} style={{width:"28px",height:"28px",borderRadius:"6px",border:".5px solid",borderColor:form[item.k]>=v?"rgba(201,168,76,0.4)":"rgba(201,168,76,0.1)",background:form[item.k]>=v?"rgba(201,168,76,0.15)":"transparent",color:form[item.k]>=v?"#C9A84C":"#4A4030",fontSize:"12px",cursor:"pointer",fontWeight:500}}>{v}</button>
                ))}
              </div>
            </div>
          ))}
          <div style={{marginTop:"10px",marginBottom:"1rem"}}>
            <label style={s.label}>Note per il PT</label>
            <textarea style={{...s.input,height:"70px",resize:"none"}} value={form.note} onChange={e=>ff("note",e.target.value)} placeholder="Come ti senti? Qualcosa da segnalare?" />
          </div>
          <div style={{display:"flex",gap:"8px",justifyContent:"flex-end"}}>
            <button style={s.btnOut} onClick={()=>setStep(1)}>Indietro</button>
            <button style={s.btn} onClick={()=>setStep(3)}>Avanti</button>
          </div>
        </div>
      )}

      {step===3 && (
        <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"6px",marginBottom:"1rem"}}>
            {slots.map(slot=>(
              <div key={slot.key} style={{background:"#050505",border:".5px solid "+(foto[slot.key]?"rgba(122,184,122,0.3)":"rgba(201,168,76,0.1)"),borderRadius:"8px",height:"60px",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center"}}>
                {foto[slot.key] ? <img src={foto[slot.key]} style={{width:"100%",height:"100%",objectFit:"cover"}} alt={slot.label} /> : <span style={{fontSize:"10px",color:"#4A4030"}}>{slot.label}</span>}
              </div>
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px",marginBottom:"1rem"}}>
            <div style={{background:"#161616",border:".5px solid rgba(201,168,76,0.1)",borderRadius:"8px",padding:"10px",textAlign:"center"}}>
              <div style={{fontSize:"10px",color:"#4A4030",marginBottom:"3px"}}>Peso</div>
              <div style={{fontSize:"16px",fontWeight:600,color:"#C9A84C"}}>{form.peso||"—"} kg</div>
            </div>
            <div style={{background:"#161616",border:".5px solid rgba(201,168,76,0.1)",borderRadius:"8px",padding:"10px",textAlign:"center"}}>
              <div style={{fontSize:"10px",color:"#4A4030",marginBottom:"3px"}}>Energia</div>
              <div style={{fontSize:"16px",fontWeight:600,color:"#C9A84C"}}>{form.energia}/5</div>
            </div>
          </div>
          <div style={{background:"rgba(201,168,76,0.08)",border:".5px solid rgba(201,168,76,0.2)",borderRadius:"8px",padding:"1rem",marginBottom:"1rem",fontSize:"12px",color:"#8A7A5A"}}>
            Il tuo PT ricevera il report con le tue foto e dati.
          </div>
          <div style={{display:"flex",gap:"8px",justifyContent:"flex-end"}}>
            <button style={s.btnOut} onClick={()=>setStep(2)}>Indietro</button>
            <button style={s.btn} onClick={inviaAutocheck} disabled={saving}>{saving?"Invio...":"Invia al PT"}</button>
          </div>
        </div>
      )}
    </div>
  )
}
