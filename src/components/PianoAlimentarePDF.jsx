export default function PianoAlimentarePDF({ piano, cliente }) {

  function scaricaPDF() {
    const giorni = ["LUNEDI","MARTEDI","MERCOLEDI","GIOVEDI","VENERDI","SABATO","DOMENICA","LUNEDI","MARTEDI","MERCOLEDI","GIOVEDI","VENERDI"]
    const icone = { "COLAZIONE": "☀️", "SPUNTINO": "🥗", "PRANZO": "🍽️", "CENA": "🌙" }

    const righe = piano.split("\n")
    
    let sezioniGiorno = []
    let giornoCorrente = null
    let righeCorrenti = []
    let primaRighe = []
    let trovato = false

    righe.forEach(r => {
      const t = r.trim()
      const norm = t.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")
      const isG = giorni.some(g => norm.startsWith(g))
      if (isG) {
        trovato = true
        if (giornoCorrente) sezioniGiorno.push({ giorno: giornoCorrente, righe: righeCorrenti })
        giornoCorrente = t
        righeCorrenti = []
      } else if (trovato) {
        righeCorrenti.push(t)
      } else {
        primaRighe.push(t)
      }
    })
    if (giornoCorrente) sezioniGiorno.push({ giorno: giornoCorrente, righe: righeCorrenti })

    function parsaPasti(righe) {
      const pasti = []
      let tipo = null, voci = []
      righe.forEach(r => {
        const t = r.trim()
        const p = Object.keys(icone).find(k => t.toUpperCase().startsWith(k))
        if (p) { if (tipo) pasti.push({tipo, voci}); tipo = p; voci = [] }
        else if (t && tipo) voci.push(t.replace(/^[-•*]\s*/,"").replace(/\*\*/g,""))
      })
      if (tipo) pasti.push({tipo, voci})
      return pasti
    }

    const colonne = []
    for (let i = 0; i < sezioniGiorno.length; i += 2) colonne.push(sezioniGiorno.slice(i, i+2))

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Piano Alimentare ${cliente?.nome} ${cliente?.cognome}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background:#0A0A0A; color:#F0E6C8; font-family:Arial,sans-serif; }
  .header { background:#0A0A0A; padding:30px 40px 20px; text-align:center; border-bottom:3px solid #C9A84C; }
  .logo { font-size:38px; font-weight:900; color:#C9A84C; letter-spacing:0.15em; }
  .logo-sub { font-size:10px; color:#8A7A5A; letter-spacing:0.2em; margin-top:4px; }
  .titolo { background:#111; padding:20px 40px; text-align:center; border-bottom:1px solid rgba(201,168,76,0.2); }
  .titolo-tipo { font-size:12px; color:#8A7A5A; letter-spacing:0.15em; text-transform:uppercase; margin-bottom:6px; }
  .titolo-nome { font-size:24px; font-weight:700; letter-spacing:0.1em; }
  .nome-bianco { color:#FFF; }
  .nome-oro { color:#C9A84C; }
  .info { background:#161616; padding:14px 40px; border-bottom:1px solid rgba(201,168,76,0.15); font-size:11px; color:#C9A84C; line-height:1.7; }
  .griglia { padding:20px 30px; }
  .riga-giorni { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px; }
  .giorno { background:#111; border:1px solid rgba(201,168,76,0.15); border-radius:4px; overflow:hidden; }
  .giorno-header { background:#C9A84C; padding:10px 16px; text-align:center; font-size:14px; font-weight:900; color:#0A0A0A; letter-spacing:0.12em; }
  .giorno-body { padding:12px; }
  .pasto { margin-bottom:10px; }
  .pasto-titolo { display:flex; align-items:center; gap:6px; margin-bottom:5px; font-size:11px; font-weight:700; color:#C9A84C; letter-spacing:0.08em; }
  .pasto-voce { font-size:11px; color:#E0D0A0; padding-left:22px; line-height:1.6; }
  .note { margin:0 30px 20px; background:#161616; border:1px solid rgba(201,168,76,0.25); border-radius:4px; padding:16px 20px; }
  .note-titolo { font-size:12px; font-weight:700; color:#C9A84C; letter-spacing:0.1em; text-transform:uppercase; margin-bottom:10px; }
  .note-grid { display:grid; grid-template-columns:1fr 1fr; gap:4px; }
  .note-voce { font-size:11px; color:#8A7A5A; line-height:1.6; }
  .footer { background:#0A0A0A; border-top:2px solid #C9A84C; padding:14px 40px; display:flex; justify-content:space-between; align-items:center; }
  .footer-sx { font-size:10px; color:#4A4030; }
  .footer-dx { font-size:12px; font-weight:700; color:#C9A84C; letter-spacing:0.04em; }
  @media print { body { -webkit-print-color-adjust:exact; print-color-adjust:exact; } }
</style>
</head>
<body>
<div class="header">
  <div class="logo">✦ DR. WELLNESS ✦</div>
  <div class="logo-sub">PERSONAL TRAINER & NUTRIZIONISTA</div>
</div>
<div class="titolo">
  <div class="titolo-tipo">PIANO ${(cliente?.obiettivo||"ALIMENTARE").toUpperCase()}</div>
  <div class="titolo-nome">
    <span class="nome-bianco">${cliente?.nome?.toUpperCase()||""} </span>
    <span class="nome-oro">${cliente?.cognome?.toUpperCase()||""}</span>
  </div>
</div>
${primaRighe.filter(r=>r&&!r.startsWith("#")).length > 0 ? `<div class="info">${primaRighe.filter(r=>r).map(r=>`<div>${r.replace(/\*\*/g,"")}</div>`).join("")}</div>` : ""}
<div class="griglia">
${colonne.map(coppia => `
  <div class="riga-giorni">
    ${coppia.map(s => {
      const pasti = parsaPasti(s.righe)
      return `<div class="giorno">
        <div class="giorno-header">${s.giorno.split("-")[0].trim().toUpperCase()}</div>
        <div class="giorno-body">
          ${pasti.map(p => `
            <div class="pasto">
              <div class="pasto-titolo">${icone[p.tipo]||"🍽️"} ${p.tipo}</div>
              ${p.voci.map(v => `<div class="pasto-voce">• ${v}</div>`).join("")}
            </div>
          `).join("")}
        </div>
      </div>`
    }).join("")}
  </div>`).join("")}
</div>
<div class="note">
  <div class="note-titolo">📋 NOTE IMPORTANTI</div>
  <div class="note-grid">
    <div class="note-voce">• Mantieni sempre una buona idratazione — almeno 2L di acqua al giorno</div>
    <div class="note-voce">• Segui il piano con costanza e disciplina</div>
    <div class="note-voce">• Abbina il piano al programma di allenamento</div>
    <div class="note-voce">• Risultati reali arrivano con impegno e costanza</div>
  </div>
</div>
<div class="footer">
  <div class="footer-sx">Convalidato dal Team DRW · ${new Date().toLocaleDateString("it-IT")}</div>
  <div class="footer-dx">PRENDITI CURA DI TE NON PER APPARIRE MA PER EVOLVERE</div>
</div>
<script>window.onload=()=>window.print()</script>
</body>
</html>`

    const w = window.open("", "_blank")
    w.document.write(html)
    w.document.close()
  }

  if (!piano) return null

  return (
    <div style={{display:"flex",justifyContent:"center",marginTop:"1rem"}}>
      <button onClick={scaricaPDF} style={{
        background:"#C9A84C", color:"#0A0A0A", border:"none", borderRadius:"8px",
        padding:"12px 32px", fontSize:"13px", fontWeight:700, cursor:"pointer",
        display:"flex", alignItems:"center", gap:"8px", letterSpacing:"0.05em"
      }}>
        <i className="ti ti-download" style={{fontSize:"16px"}}></i>
        SCARICA PDF
      </button>
    </div>
  )
}
