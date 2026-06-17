import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Layout from "../components/Layout"
import { supabase } from "../lib/supabase"

export default function Dashboard() {
  const [clienti, setClienti] = useState([])
  const [autocheck, setAutocheck] = useState([])
  const [appuntamenti, setAppuntamenti] = useState([])
  const [mese, setMese] = useState(new Date())
  const [showModal, setShowModal] = useState(false)
  const [selectedDay, setSelectedDay] = useState(null)
  const [newApp, setNewApp] = useState({ ora:"09:00", cliente:"", tipo:"Allenamento" })
  const navigate = useNavigate()

  const [richieste, setRichieste] = useState([])
  useEffect(() => {
    supabase.from("clienti").select("*").eq("attivo", true).then(({data}) => data && setClienti(data))
    supabase.from("autocheck").select("*").eq("letto_pt", false).then(({data}) => data && setAutocheck(data))
    supabase.from("clienti").select("*").eq("attivo", false).eq("tipo", "online").then(({data}) => data && setRichieste(data))
  }, [])

  const oggi = new Date()
  const anno = mese.getFullYear()
  const meseNum = mese.getMonth()
  const primoGiorno = new Date(anno, meseNum, 1).getDay()
  const giorniMese = new Date(anno, meseNum+1, 0).getDate()
  const nomiMesi = ["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"]
  const nomiGiorni = ["Dom","Lun","Mar","Mer","Gio","Ven","Sab"]

  function getAppsGiorno(giorno) {
    const data = anno+"-"+String(meseNum+1).padStart(2,"0")+"-"+String(giorno).padStart(2,"0")
    return appuntamenti.filter(a => a.data === data)
  }

  function aggiungi() {
    const data = anno+"-"+String(meseNum+1).padStart(2,"0")+"-"+String(selectedDay).padStart(2,"0")
    setAppuntamenti([...appuntamenti, { id:Date.now(), data, ...newApp }])
    setShowModal(false)
    setNewApp({ ora:"09:00", cliente:"", tipo:"Allenamento" })
  }

  const box = [
    { label:"Clienti attivi", val:clienti.length, delta:"Vedi tutti →", icon:"ti-users", path:"/clienti" },
    { label:"Sessioni da fare", val:0, delta:"Alimentazioni e schede →", icon:"ti-repeat", path:"/sessioni" },
    { label:"Autocheck ricevuti", val:autocheck.length, delta:autocheck.length>0?"Da leggere →":"Nessuno", icon:"ti-camera", path:"/alert" },
  ]

  return (
    <Layout>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"2rem"}}>
        <div>
          <div style={{fontSize:"22px",fontWeight:600,color:"var(--t1)"}}>Buongiorno 👋</div>
          <div style={{fontSize:"11px",color:"var(--t2)",marginTop:"2px"}}>{new Date().toLocaleDateString("it-IT",{weekday:"long",day:"numeric",month:"long",year:"numeric"})} · Dr. Wellness</div>
        </div>
        <button className="btn-gold" onClick={()=>navigate("/clienti")}><i className="ti ti-plus"></i> Nuovo cliente</button>
      </div>

      {richieste.length > 0 && (
        <div onClick={()=>navigate("/online")} style={{background:"rgba(184,122,122,0.1)",border:"1px solid rgba(184,122,122,0.3)",borderRadius:"12px",padding:"14px 20px",marginBottom:"1.5rem",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between"}}
          onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(184,122,122,0.6)"}
          onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(184,122,122,0.3)"}>
          <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
            <div style={{width:"36px",height:"36px",borderRadius:"50%",background:"rgba(184,122,122,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"16px"}}>🔔</div>
            <div>
              <div style={{fontSize:"13px",fontWeight:600,color:"#F0E6C8"}}>{richieste.length} nuova richiesta coaching in attesa</div>
              <div style={{fontSize:"11px",color:"#8A7A5A",marginTop:"2px"}}>Clicca per elaborare il piano</div>
            </div>
          </div>
          <div style={{fontSize:"12px",color:"#C9A84C",fontWeight:500}}>Elabora →</div>
        </div>
      )}

      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"16px",marginBottom:"2rem"}}>
        {box.map(b=>(
          <div key={b.label} onClick={()=>navigate(b.path)}
            onMouseEnter={e=>e.currentTarget.style.borderColor="var(--gold)"}
            onMouseLeave={e=>e.currentTarget.style.borderColor="var(--bord)"}
            style={{background:"var(--card)",border:".5px solid var(--bord)",borderRadius:"14px",padding:"2rem",textAlign:"center",cursor:"pointer",transition:"border-color .2s"}}>
            <div style={{width:"52px",height:"52px",borderRadius:"14px",background:"var(--gold-dim)",border:".5px solid var(--gold-b)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 1rem",fontSize:"22px",color:"var(--gold)"}}>
              <i className={"ti "+b.icon}></i>
            </div>
            <div style={{fontSize:"38px",fontWeight:700,color:"var(--gold)",lineHeight:1,marginBottom:"6px"}}>{b.val}</div>
            <div style={{fontSize:"14px",fontWeight:500,color:"var(--t1)",marginBottom:"4px"}}>{b.label}</div>
            <div style={{fontSize:"11px",color:"var(--t2)"}}>{b.delta}</div>
          </div>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 280px",gap:"1.25rem"}}>
        <div className="card">
          <div className="card-hdr">
            <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
              <button onClick={()=>setMese(new Date(anno,meseNum-1,1))} style={{background:"transparent",border:".5px solid var(--bord)",color:"var(--t2)",borderRadius:"6px",width:"28px",height:"28px",cursor:"pointer"}}>‹</button>
              <span style={{fontSize:"14px",fontWeight:500,color:"var(--t1)"}}>{nomiMesi[meseNum]} {anno}</span>
              <button onClick={()=>setMese(new Date(anno,meseNum+1,1))} style={{background:"transparent",border:".5px solid var(--bord)",color:"var(--t2)",borderRadius:"6px",width:"28px",height:"28px",cursor:"pointer"}}>›</button>
            </div>
            <button className="btn-gold" style={{padding:"6px 12px",fontSize:"11px"}} onClick={()=>{setSelectedDay(oggi.getDate());setShowModal(true)}}><i className="ti ti-plus"></i> Aggiungi</button>
          </div>
          <div style={{padding:"1rem"}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:"2px",marginBottom:"8px"}}>
              {nomiGiorni.map(g=><div key={g} style={{textAlign:"center",fontSize:"10px",color:"var(--t3)",fontWeight:600,padding:"4px"}}>{g}</div>)}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:"3px"}}>
              {Array(primoGiorno).fill(null).map((_,i)=><div key={"e"+i}></div>)}
              {Array(giorniMese).fill(null).map((_,i)=>{
                const giorno = i+1
                const apps = getAppsGiorno(giorno)
                const isOggi = giorno===oggi.getDate() && meseNum===oggi.getMonth() && anno===oggi.getFullYear()
                return (
                  <div key={giorno} onClick={()=>{setSelectedDay(giorno);setShowModal(true)}}
                    style={{minHeight:"46px",borderRadius:"7px",padding:"4px",cursor:"pointer",background:isOggi?"var(--gold-dim)":"transparent",border:isOggi?".5px solid var(--gold-b)":".5px solid transparent"}}
                    onMouseEnter={e=>e.currentTarget.style.background="var(--hover)"}
                    onMouseLeave={e=>e.currentTarget.style.background=isOggi?"var(--gold-dim)":"transparent"}>
                    <div style={{fontSize:"11px",fontWeight:isOggi?600:400,color:isOggi?"var(--gold)":"var(--t2)",marginBottom:"2px"}}>{giorno}</div>
                    {apps.slice(0,2).map(a=>(
                      <div key={a.id} style={{fontSize:"9px",background:"var(--gold-dim)",color:"var(--gold)",borderRadius:"3px",padding:"1px 4px",marginBottom:"1px",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{a.ora} {a.cliente}</div>
                    ))}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-hdr"><span className="card-title"><i className="ti ti-list" style={{color:"var(--gold)",fontSize:"14px"}}></i> Prossimi appuntamenti</span></div>
          {appuntamenti.length === 0 ? (
            <div style={{padding:"2rem",textAlign:"center",fontSize:"12px",color:"var(--t2)"}}>
              <i className="ti ti-calendar-off" style={{fontSize:"28px",color:"var(--t3)",display:"block",marginBottom:"8px"}}></i>
              Nessun appuntamento.<br/>Clicca su un giorno.
            </div>
          ) : appuntamenti.sort((a,b)=>a.data.localeCompare(b.data)).map(a=>(
            <div key={a.id} style={{display:"flex",alignItems:"center",gap:"10px",padding:"9px 1.1rem",borderBottom:".5px solid var(--bord)"}}>
              <div style={{width:"34px",height:"34px",borderRadius:"8px",background:"var(--gold-dim)",border:".5px solid var(--gold-b)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <div style={{fontSize:"11px",fontWeight:600,color:"var(--gold)"}}>{a.data.split("-")[2]}</div>
                <div style={{fontSize:"9px",color:"var(--t2)"}}>{nomiMesi[parseInt(a.data.split("-")[1])-1].slice(0,3)}</div>
              </div>
              <div>
                <div style={{fontSize:"12px",fontWeight:500,color:"var(--t1)"}}>{a.cliente}</div>
                <div style={{fontSize:"10px",color:"var(--t2)"}}>{a.ora} · {a.tipo}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setShowModal(false)}>
          <div className="modal">
            <div className="modal-hdr">
              <div className="modal-title"><i className="ti ti-calendar-plus" style={{color:"var(--gold)"}}></i> Appuntamento — {selectedDay} {nomiMesi[meseNum]}</div>
              <button onClick={()=>setShowModal(false)} style={{background:"transparent",border:"none",color:"var(--t2)",fontSize:"20px",cursor:"pointer"}}>✕</button>
            </div>
            <div style={{padding:"1.25rem"}}>
              <div style={{marginBottom:"10px"}}><label className="flabel">Cliente</label><input className="finput" value={newApp.cliente} onChange={e=>setNewApp({...newApp,cliente:e.target.value})} placeholder="Nome cliente" /></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"1.25rem"}}>
                <div><label className="flabel">Ora</label><input className="finput" type="time" value={newApp.ora} onChange={e=>setNewApp({...newApp,ora:e.target.value})} /></div>
                <div><label className="flabel">Tipo</label>
                  <select className="fselect" value={newApp.tipo} onChange={e=>setNewApp({...newApp,tipo:e.target.value})}>
                    <option>Allenamento</option>
                    <option>Visita nutrizionale</option>
                    <option>Visita antropometrica</option>
                    <option>Check progressi</option>
                    <option>Altro</option>
                  </select>
                </div>
              </div>
              <div style={{display:"flex",gap:"8px",justifyContent:"flex-end"}}>
                <button className="btn-outline" onClick={()=>setShowModal(false)}>Annulla</button>
                <button className="btn-gold" onClick={aggiungi} disabled={!newApp.cliente}>Salva</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
