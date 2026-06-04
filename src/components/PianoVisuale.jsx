import { useState } from "react"

export default function PianoVisuale({ piano, onModifica }) {
  const [modifica, setModifica] = useState(false)

  const giorni = ["LUNEDI","MARTEDI","MERCOLEDI","GIOVEDI","VENERDI","SABATO","DOMENICA","LUNEDÌ","MARTEDÌ","MERCOLEDÌ","GIOVEDÌ","VENERDÌ"]
  const iconiPasti = { "COLAZIONE":"☀️", "SPUNTINO":"🥗", "PRANZO":"🍽️", "CENA":"🌙" }
  const coloriPasti = { "COLAZIONE":"#E8A020", "SPUNTINO":"#6BAE6B", "PRANZO":"#4A90D9", "CENA":"#9B6BD9" }

  const pulisci = (t) => t.replace(/\*\*/g,"").replace(/^[#\s📅]+/,"").trim()

  const righe = piano.split("\n")
  let sezioniGiorno = [], giornoCorrente = null, righeCorrenti = [], primaRighe = [], trovato = false

  righe.forEach(r => {
    const t = r.trim()
    const norm = t.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    const pulita = norm.replace(/[^A-Z\s]/g,"").trim()
    const isG = giorni.some(g => pulita.startsWith(g))
    if (isG) {
      trovato = true
      if (giornoCorrente) sezioniGiorno.push({ giorno: giornoCorrente, righe: righeCorrenti })
      giornoCorrente = pulisci(t)
      righeCorrenti = []
    } else if (trovato) righeCorrenti.push(t)
    else primaRighe.push(t)
  })
  if (giornoCorrente) sezioniGiorno.push({ giorno: giornoCorrente, righe: righeCorrenti })

  function parsaPasti(righe) {
    const pasti = []; let tipo = null, voci = []
    righe.forEach(r => {
      const t = r.trim()
      const clean = t.toUpperCase().replace(/[^A-Z\s]/g,"").trim()
      const p = Object.keys(iconiPasti).find(k => clean.startsWith(k))
      if (p) { if (tipo) pasti.push({tipo, voci}); tipo = p; voci = [] }
      else if (t && tipo) {
        const v = pulisci(t).replace(/^[-•*\[\]\s]*/,"").trim()
        if (v) voci.push(v)
      }
    })
    if (tipo) pasti.push({tipo, voci})
    return pasti
  }

  const infoRighe = primaRighe.filter(r => r && !r.startsWith("#") && r.length > 5 && r.trim() !== "---").slice(0,10)

  if (modifica) return (
    <div style={{marginBottom:"1rem"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"8px"}}>
        <label style={{fontSize:"11px",color:"var(--t2)"}}>Modifica il piano</label>
        <button onClick={()=>setModifica(false)} style={{background:"var(--gold-dim)",border:".5px solid var(--gold-b)",color:"var(--gold)",borderRadius:"6px",padding:"5px 12px",fontSize:"11px",cursor:"pointer"}}>
          ← Torna alla visualizzazione
        </button>
      </div>
      <textarea 
        value={piano}
        onChange={e=>onModifica(e.target.value)}
        style={{width:"100%",background:"#0A0A0A",border:".5px solid var(--gold-b)",borderRadius:"8px",padding:"1.25rem",fontSize:"12px",color:"var(--gold)",lineHeight:1.8,resize:"vertical",minHeight:"400px",outline:"none",fontFamily:"monospace"}}
      />
    </div>
  )

  return (
    <div style={{marginBottom:"1rem"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}>
        <div style={{fontSize:"13px",fontWeight:600,color:"var(--t1)"}}>Piano alimentare</div>
        <button onClick={()=>setModifica(true)} style={{background:"transparent",border:".5px solid var(--bord)",color:"var(--t2)",borderRadius:"6px",padding:"5px 12px",fontSize:"11px",cursor:"pointer"}}>
          ✏️ Modifica
        </button>
      </div>

      {/* INFO TDEE */}
      {infoRighe.length > 0 && (
        <div style={{background:"#F5F0E8",borderRadius:"8px",padding:"12px 16px",marginBottom:"16px",border:"1px solid #E8D5A0"}}>
          {infoRighe.map((r,i) => (
            <div key={i} style={{fontSize:"12px",color:"#333",lineHeight:1.7}}>{pulisci(r)}</div>
          ))}
        </div>
      )}

      {/* GRIGLIA GIORNI */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"16px"}}>
        {sezioniGiorno.map((s, si) => {
          const pasti = parsaPasti(s.righe)
          return (
            <div key={si} style={{background:"white",borderRadius:"8px",overflow:"hidden",border:"1px solid #E8D5A0",boxShadow:"0 2px 8px rgba(0,0,0,0.08)"}}>
              <div style={{background:"#C9A84C",padding:"10px 14px",textAlign:"center"}}>
                <div style={{fontSize:"13px",fontWeight:900,color:"#0A0A0A",letterSpacing:"0.1em"}}>{s.giorno.toUpperCase()}</div>
              </div>
              <div style={{padding:"10px 12px",background:"white"}}>
                {pasti.map((p, pi) => (
                  <div key={pi} style={{marginBottom:"8px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:"6px",marginBottom:"4px"}}>
                      <span style={{fontSize:"14px"}}>{iconiPasti[p.tipo]}</span>
                      <span style={{fontSize:"11px",fontWeight:700,color:coloriPasti[p.tipo]||"#C9A84C",letterSpacing:"0.06em"}}>{p.tipo}</span>
                    </div>
                    {p.voci.slice(0,5).map((v,vi) => (
                      <div key={vi} style={{fontSize:"11px",color:"#333",paddingLeft:"20px",lineHeight:1.5}}>• {v}</div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* NOTE */}
      <div style={{background:"#F5F0E8",border:"1px solid #E8D5A0",borderRadius:"8px",padding:"12px 16px"}}>
        <div style={{fontSize:"11px",fontWeight:700,color:"#C9A84C",marginBottom:"6px",textTransform:"uppercase",letterSpacing:"0.08em"}}>📋 Note importanti</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"4px"}}>
          {["Mantieni sempre una buona idratazione — almeno 2L al giorno","Segui il piano con costanza e disciplina","Abbina il piano al programma di allenamento","Risultati reali arrivano con impegno e costanza"].map((n,i) => (
            <div key={i} style={{fontSize:"11px",color:"#555",lineHeight:1.5}}>• {n}</div>
          ))}
        </div>
      </div>
    </div>
  )
}
