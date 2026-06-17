import { useState } from "react"

function getIcona(nome) {
  const n = nome.toLowerCase()
  if(n.includes("squat")||n.includes("leg")) return "🦵"
  if(n.includes("push")||n.includes("petto")||n.includes("flessioni")) return "💪"
  if(n.includes("pull")||n.includes("schiena")||n.includes("traz")) return "🔙"
  if(n.includes("spall")||n.includes("press")) return "🏋️"
  if(n.includes("plank")||n.includes("core")||n.includes("crunch")) return "🎯"
  if(n.includes("corsa")||n.includes("cardio")||n.includes("run")) return "🏃"
  if(n.includes("burpee")||n.includes("mountain")) return "⚡"
  if(n.includes("riscald")) return "🔥"
  if(n.includes("defat")||n.includes("stretch")) return "🧘"
  return "⚡"
}

export default function SchedaVisuale({ scheda, onModifica, mostraVideo = false }) {
  const [modifica, setModifica] = useState(false)

  const giorni = ["LUNEDI","MARTEDI","MERCOLEDI","GIOVEDI","VENERDI","SABATO","DOMENICA"]
  const pulisci = (t) => t.replace(/\*\*/g,"").replace(/^[#\s📅🏋️💪🔥⚡🎯🦵🔙🧘🔴🟢🔵]+/,"").trim()

  const righe = scheda.split("\n")
  let sezioniGiorno = [], giornoCorrente = null, righeCorrenti = []

  righe.forEach(r => {
    const t = r.trim()
    if (!t || t === "---") return
    const norm = t.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^A-Z\s]/g,"").trim()
    const isG = giorni.some(g => norm.startsWith(g))
    if (isG) {
      if (giornoCorrente) sezioniGiorno.push({ giorno: giornoCorrente, righe: righeCorrenti })
      giornoCorrente = pulisci(t)
      righeCorrenti = []
    } else if (giornoCorrente) righeCorrenti.push(t)
  })
  if (giornoCorrente) sezioniGiorno.push({ giorno: giornoCorrente, righe: righeCorrenti })

  function parseSezioni(righe) {
    const sezioni = []; let titoloCorrente = null, voci = []
    righe.forEach(r => {
      const t = r.trim()
      if (!t) return
      const isTitolo = t.startsWith("###")||t.startsWith("**")&&t.endsWith("**")||
        t.toUpperCase().includes("RISCALD")||t.toUpperCase().includes("CIRCUIT")||
        t.toUpperCase().includes("DEFAT")||t.toUpperCase().includes("CORE")||
        t.toUpperCase().includes("FINE ")||t.toUpperCase().includes("STRETCHING")
      const pulita = pulisci(t).replace(/^[-•*\[\]\s]*/,"").trim()
      if (isTitolo && pulita) {
        if (titoloCorrente) sezioni.push({titolo:titoloCorrente,voci})
        titoloCorrente = pulita; voci = []
      } else if (pulita && titoloCorrente) voci.push(pulita)
    })
    if (titoloCorrente) sezioni.push({titolo:titoloCorrente,voci})
    return sezioni
  }

  if (modifica) return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"8px"}}>
        <label style={{fontSize:"11px",color:"var(--t2)"}}>Modifica la scheda</label>
        <button onClick={()=>setModifica(false)} style={{background:"var(--gold-dim)",border:".5px solid var(--gold-b)",color:"var(--gold)",borderRadius:"6px",padding:"5px 12px",fontSize:"11px",cursor:"pointer"}}>← Torna</button>
      </div>
      <textarea value={scheda} onChange={e=>onModifica(e.target.value)}
        style={{width:"100%",background:"#0A0A0A",border:".5px solid var(--gold-b)",borderRadius:"8px",padding:"1.25rem",fontSize:"12px",color:"var(--gold)",lineHeight:1.8,resize:"vertical",minHeight:"400px",outline:"none",fontFamily:"monospace"}} />
    </div>
  )

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}>
        <div style={{fontSize:"13px",fontWeight:600,color:"var(--t1)"}}>Scheda allenamento</div>
        <button onClick={()=>setModifica(true)} style={{background:"transparent",border:".5px solid var(--bord)",color:"var(--t2)",borderRadius:"6px",padding:"5px 12px",fontSize:"11px",cursor:"pointer"}}>✏️ Modifica</button>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>
        {sezioniGiorno.map((s, si) => {
          const sezioni = parseSezioni(s.righe)
          return (
            <div key={si} style={{background:"white",borderRadius:"10px",overflow:"hidden",border:"1px solid #E8D5A0",boxShadow:"0 2px 10px rgba(0,0,0,0.1)"}}>
              <div style={{background:"#C9A84C",padding:"10px 16px",display:"flex",alignItems:"center",gap:"10px"}}>
                <span style={{fontSize:"18px"}}>🏋️</span>
                <div style={{fontSize:"14px",fontWeight:900,color:"#0A0A0A",letterSpacing:"0.1em"}}>{s.giorno.toUpperCase()}</div>
              </div>
              <div style={{padding:"14px",background:"white"}}>
                {sezioni.map((sez, szi) => (
                  <div key={szi} style={{marginBottom:"12px"}}>
                    <div style={{background:"#F5F0E8",padding:"6px 10px",fontSize:"12px",fontWeight:700,color:"#C9A84C",borderLeft:"3px solid #C9A84C",marginBottom:"8px",textTransform:"uppercase",letterSpacing:"0.06em"}}>
                      {sez.titolo}
                    </div>
                    {sez.voci.map((v, vi) => (
                      <div key={vi} style={{display:"flex",alignItems:"center",gap:"10px",padding:"6px 8px",borderBottom:"1px solid #F0EDE5"}}>
                        <span style={{fontSize:"18px",flexShrink:0}}>{getIcona(v)}</span>
                        <span style={{fontSize:"12px",color:"#1A1A1A",flex:1,fontWeight:500}}>{v}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
