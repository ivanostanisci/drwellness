import AutocheckCliente from "../components/AutocheckCliente"
import { useState } from "react"
import { supabase } from "../lib/supabase"

export default function AreaCliente() {
  const [step, setStep] = useState("login")
  const [email, setEmail] = useState("")
  const [cliente, setCliente] = useState(null)
  const [tab, setTab] = useState("profilo")
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState("")

  async function accedi() {
    setLoading(true)
    setMsg("")
    const { data, error } = await supabase.from("clienti").select("*").eq("email", email.toLowerCase()).single()
    if (error || !data) {
      setMsg("Email non trovata. Contatta il tuo PT.")
    } else {
      setCliente(data)
      setStep("area")
    }
    setLoading(false)
  }

  if (step === "login") return (
    <div style={{minHeight:"100vh",background:"#0A0A0A",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"DM Sans,sans-serif",padding:"1rem"}}>
      <style>{"@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&display=swap'); @import url('https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css');"}</style>
      <div style={{width:"100%",maxWidth:"380px"}}>
        <div style={{textAlign:"center",marginBottom:"2rem"}}>
          <svg width="48" height="54" viewBox="0 0 18 20" fill="none" style={{margin:"0 auto 12px",display:"block"}}>
            <path d="M9 1L2 4V10C2 14.4 5 18.3 9 19.5C13 18.3 16 14.4 16 10V4L9 1Z" stroke="#C9A84C" strokeWidth="1.2" fill="rgba(201,168,76,0.15)"/>
            <path d="M6 10L8 12L12 8" stroke="#C9A84C" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div style={{fontSize:"22px",fontWeight:600,color:"#F0E6C8",letterSpacing:".05em"}}>DR. WELLNESS</div>
          <div style={{fontSize:"12px",color:"#8A7A5A",marginTop:"4px"}}>Area Riservata Clienti</div>
        </div>
        <div style={{background:"#111",border:".5px solid rgba(201,168,76,0.25)",borderRadius:"14px",padding:"1.5rem"}}>
          <div style={{fontSize:"14px",fontWeight:500,color:"#F0E6C8",marginBottom:"1.25rem"}}>Accedi alla tua area</div>
          {msg && <div style={{background:"rgba(184,122,122,0.1)",border:".5px solid rgba(184,122,122,0.2)",borderRadius:"8px",padding:"10px 12px",fontSize:"12px",color:"#B87A7A",marginBottom:"1rem"}}>{msg}</div>}
          <div style={{marginBottom:"1rem"}}>
            <label style={{fontSize:"11px",color:"#8A7A5A",marginBottom:"4px",display:"block"}}>La tua email</label>
            <input
              style={{width:"100%",background:"#161616",border:".5px solid rgba(201,168,76,0.15)",borderRadius:"7px",padding:"10px 12px",fontSize:"13px",color:"#F0E6C8",outline:"none",fontFamily:"DM Sans,sans-serif"}}
              type="email" value={email} onChange={e=>setEmail(e.target.value)}
              placeholder="mario@email.com"
              onKeyDown={e=>e.key==="Enter"&&accedi()}
            />
          </div>
          <button onClick={accedi} disabled={loading||!email}
            style={{width:"100%",background:"#C9A84C",color:"#0A0A0A",border:"none",borderRadius:"7px",padding:"11px",fontSize:"13px",fontWeight:500,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>
            {loading ? "Accesso..." : "Accedi"}
          </button>
          <div style={{fontSize:"11px",color:"#4A4030",textAlign:"center",marginTop:"1rem"}}>Non hai un account? Contatta il tuo Personal Trainer</div>
        </div>
      </div>
    </div>
  )

  const tabs = ["profilo","piano alimentare","allenamento","autocheck"]

  return (
    <div style={{minHeight:"100vh",background:"#0A0A0A",fontFamily:"DM Sans,sans-serif",color:"#F0E6C8"}}>
      <style>{"@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&display=swap'); @import url('https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css'); *{box-sizing:border-box;margin:0;padding:0;}"}</style>
      <div style={{background:"#111",borderBottom:".5px solid rgba(201,168,76,0.15)",padding:"1rem 1.5rem",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
          <svg width="28" height="32" viewBox="0 0 18 20" fill="none">
            <path d="M9 1L2 4V10C2 14.4 5 18.3 9 19.5C13 18.3 16 14.4 16 10V4L9 1Z" stroke="#C9A84C" strokeWidth="1.2" fill="rgba(201,168,76,0.15)"/>
            <path d="M6 10L8 12L12 8" stroke="#C9A84C" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div>
            <div style={{fontSize:"12px",fontWeight:600,color:"#C9A84C",letterSpacing:".04em"}}>DR. WELLNESS</div>
            <div style={{fontSize:"10px",color:"#8A7A5A"}}>Ciao, {cliente.nome}!</div>
          </div>
        </div>
        <button onClick={()=>{setStep("login");setCliente(null);setEmail("")}} style={{background:"transparent",border:".5px solid rgba(201,168,76,0.2)",color:"#8A7A5A",borderRadius:"6px",padding:"6px 12px",fontSize:"11px",cursor:"pointer"}}>Esci</button>
      </div>

      <div style={{padding:"1.25rem"}}>
        <div style={{display:"flex",gap:"4px",marginBottom:"1.25rem",background:"#111",border:".5px solid rgba(201,168,76,0.15)",borderRadius:"10px",padding:"4px",overflowX:"auto"}}>
          {tabs.map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:"8px 10px",borderRadius:"7px",fontSize:"11px",fontWeight:500,cursor:"pointer",border:"none",background:tab===t?"#C9A84C":"transparent",color:tab===t?"#0A0A0A":"#8A7A5A",transition:"all .15s",whiteSpace:"nowrap",textTransform:"capitalize"}}>
              {t}
            </button>
          ))}
        </div>

        {tab === "profilo" && (
          <div style={{background:"#111",border:".5px solid rgba(201,168,76,0.15)",borderRadius:"12px",padding:"1.25rem"}}>
            <div style={{textAlign:"center",marginBottom:"1.5rem"}}>
              <div style={{width:"60px",height:"60px",borderRadius:"50%",background:"rgba(201,168,76,0.12)",border:".5px solid rgba(201,168,76,0.25)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 10px",fontSize:"20px",fontWeight:600,color:"#C9A84C"}}>
                {cliente.nome[0]}{cliente.cognome[0]}
              </div>
              <div style={{fontSize:"18px",fontWeight:600,color:"#F0E6C8"}}>{cliente.nome} {cliente.cognome}</div>
              <div style={{fontSize:"12px",color:"#8A7A5A",marginTop:"2px",textTransform:"capitalize"}}>{cliente.obiettivo}</div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
              {[["Peso iniziale",cliente.peso_iniziale?cliente.peso_iniziale+" kg":"—"],["Altezza",cliente.altezza?cliente.altezza+" cm":"—"],["Calorie target",cliente.calorie_target?cliente.calorie_target+" kcal":"—"],["Obiettivo",cliente.obiettivo||"—"]].map(([l,v])=>(
                <div key={l} style={{background:"#161616",border:".5px solid rgba(201,168,76,0.1)",borderRadius:"8px",padding:"10px 12px"}}>
                  <div style={{fontSize:"10px",color:"#4A4030",textTransform:"uppercase",letterSpacing:".06em",marginBottom:"4px"}}>{l}</div>
                  <div style={{fontSize:"13px",color:"#F0E6C8",fontWeight:500,textTransform:"capitalize"}}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "piano alimentare" && (
          <div style={{background:"#111",border:".5px solid rgba(201,168,76,0.15)",borderRadius:"12px",padding:"1.25rem"}}>
            <div style={{fontSize:"14px",fontWeight:500,color:"#F0E6C8",marginBottom:"1rem"}}>Il tuo piano alimentare</div>
            <div style={{background:"#161616",border:".5px solid rgba(201,168,76,0.1)",borderRadius:"8px",padding:"1.25rem",fontSize:"12px",color:"#8A7A5A",lineHeight:1.8,minHeight:"200px",textAlign:"center",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <div>
                <i className="ti ti-salad" style={{fontSize:"36px",color:"#4A4030",display:"block",marginBottom:"12px"}}></i>
                Il tuo piano alimentare sara disponibile qui dopo la visita con il tuo PT
              </div>
            </div>
          </div>
        )}

        {tab === "allenamento" && (
          <div style={{background:"#111",border:".5px solid rgba(201,168,76,0.15)",borderRadius:"12px",padding:"1.25rem"}}>
            <div style={{fontSize:"14px",fontWeight:500,color:"#F0E6C8",marginBottom:"1rem"}}>La tua scheda allenamento</div>
            <div style={{background:"#161616",border:".5px solid rgba(201,168,76,0.1)",borderRadius:"8px",padding:"1.25rem",fontSize:"12px",color:"#8A7A5A",lineHeight:1.8,minHeight:"200px",textAlign:"center",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <div>
                <i className="ti ti-barbell" style={{fontSize:"36px",color:"#4A4030",display:"block",marginBottom:"12px"}}></i>
                La tua scheda allenamento sara disponibile qui dopo la visita con il tuo PT
              </div>
            </div>
          </div>
        )}

        {tab === "autocheck" && <AutocheckCliente clienteId={cliente.id} />}
      </div>
    </div>
  )
}
