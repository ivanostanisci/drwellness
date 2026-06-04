export default function SchedaAllenamentoPDF({ scheda, cliente }) {
  function scaricaPDF() {
    if (!scheda) return
    const w = window.open("","_blank")
    w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Scheda</title><style>*{margin:0;padding:0;box-sizing:border-box;}body{background:#fff;font-family:Arial,sans-serif;}.header{background:#0A0A0A;padding:20px 40px;text-align:center;}.logo{font-size:30px;font-weight:900;color:#C9A84C;letter-spacing:0.15em;}.logo-sub{font-size:10px;color:#8A7A5A;letter-spacing:0.2em;margin-top:3px;}.titolo{padding:14px 40px;text-align:center;border-bottom:2px solid #1A1A1A;}.t1{font-size:11px;color:#8A7A5A;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:5px;}.t2{font-size:20px;font-weight:700;}.oro{color:#C9A84C;}.body{padding:16px 24px;}.giorno{border:1px solid #DDD;border-radius:4px;margin-bottom:14px;overflow:hidden;}.g-header{background:#E8D5A0;padding:9px 14px;font-size:13px;font-weight:900;color:#1A1A1A;letter-spacing:0.1em;text-transform:uppercase;}.g-body{padding:10px 14px;}.riga{display:flex;align-items:center;gap:8px;padding:4px 0;border-bottom:1px solid #F0EDE5;font-size:11px;color:#333;}.riga:last-child{border:none;}.icona{font-size:16px;width:24px;}.titolo-sez{font-size:11px;font-weight:700;color:#C9A84C;margin:8px 0 4px;text-transform:uppercase;letter-spacing:0.06em;border-left:3px solid #C9A84C;padding-left:6px;}.note{margin:0 24px 14px;background:#F5F0E8;border:1px solid #E8D5A0;border-radius:4px;padding:12px 16px;}.note-t{font-size:11px;font-weight:700;color:#1A1A1A;text-transform:uppercase;margin-bottom:6px;}.footer{background:#0A0A0A;padding:10px 40px;display:flex;justify-content:space-between;align-items:center;}.f1{font-size:10px;color:#6A5A3A;}.f2{font-size:11px;font-weight:700;color:#C9A84C;text-align:right;}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}@page{margin:0;}}</style></head><body>
    <div class="header"><div class="logo">✦ DR. WELLNESS ✦</div><div class="logo-sub">PERSONAL TRAINER & NUTRIZIONISTA</div></div>
    <div class="titolo"><div class="t1">SCHEDA DI ALLENAMENTO</div><span class="t2">${(cliente?.nome||"").toUpperCase()} </span><span class="t2 oro">${(cliente?.cognome||"").toUpperCase()}</span></div>
    <div class="body">${parseScheda(scheda)}</div>
    <div class="note"><div class="note-t">📋 NOTE IMPORTANTI</div><div style="font-size:10px;color:#555;line-height:1.6;">• Esegui gli esercizi con tecnica corretta e controllata<br>• Rispetta i tempi di recupero indicati<br>• Mantieni sempre una buona idratazione<br>• Ascolta il tuo corpo e rispetta i suoi limiti</div></div>
    <div class="footer"><div class="f1">Convalidato dal Team DRW · ${new Date().toLocaleDateString("it-IT")}</div><div class="f2">PRENDITI CURA DI TE NON PER APPARIRE<br>MA PER EVOLVERE</div></div>
    <script>window.onload=()=>setTimeout(()=>window.print(),500)</script></body></html>`)
    w.document.close()
  }

  function parseScheda(testo) {
    const giorni = ["LUNEDI","MARTEDI","MERCOLEDI","GIOVEDI","VENERDI","SABATO","DOMENICA"]
    const icona = (n) => {
      const u = n.toUpperCase()
      if(u.includes("SQUAT")||u.includes("LEG")) return "🦵"
      if(u.includes("PUSH")||u.includes("PETTO")) return "💪"
      if(u.includes("PULL")||u.includes("SCHIENA")||u.includes("TRAZ")) return "🔙"
      if(u.includes("SPALL")||u.includes("PRESS")) return "🏋️"
      if(u.includes("PLANK")||u.includes("CORE")||u.includes("CRUNCH")) return "🎯"
      if(u.includes("CORSA")||u.includes("CARDIO")) return "🏃"
      if(u.includes("BURPEE")||u.includes("MOUNTAIN")) return "⚡"
      if(u.includes("RISCALD")) return "🔥"
      if(u.includes("DEFAT")||u.includes("STRETCH")) return "🧘"
      return "⚡"
    }
    const righe = testo.split("\n")
    let html = "", inGiorno = false, giornoHtml = ""
    righe.forEach(r => {
      const t = r.trim()
      if (!t || t === "---") return
      const norm = t.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^A-Z\s]/g,"").trim()
      const isG = giorni.some(g => norm.startsWith(g))
      const isTitolo = t.startsWith("###") || t.startsWith("**") && t.endsWith("**")
      const isVoce = t.startsWith("-") || t.startsWith("•")
      const pulita = t.replace(/^[#*\s📅🏋️💪🔥⚡]+/,"").replace(/\*\*/g,"").trim()
      if (isG) {
        if (inGiorno) html += giornoHtml + "</div></div>"
        giornoHtml = `<div class="giorno"><div class="g-header">🏋️ ${pulita.toUpperCase()}</div><div class="g-body">`
        inGiorno = true
      } else if (inGiorno) {
        if (isTitolo) giornoHtml += `<div class="titolo-sez">${pulita}</div>`
        else if (isVoce) {
          const testo2 = pulita.replace(/^[-•*\[\]\s]*/,"")
          giornoHtml += `<div class="riga"><span class="icona">${icona(testo2)}</span><span>${testo2}</span></div>`
        } else if (pulita) {
          giornoHtml += `<div class="riga"><span class="icona">⚡</span><span>${pulita}</span></div>`
        }
      }
    })
    if (inGiorno) html += giornoHtml + "</div></div>"
    return html
  }

  if (!scheda) return null
  return (
    <div style={{display:"flex",justifyContent:"center",marginTop:"1rem"}}>
      <button onClick={scaricaPDF} style={{background:"#C9A84C",color:"#0A0A0A",border:"none",borderRadius:"8px",padding:"12px 32px",fontSize:"13px",fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:"8px"}}>
        <i className="ti ti-download" style={{fontSize:"16px"}}></i> SCARICA PDF SCHEDA
      </button>
    </div>
  )
}
