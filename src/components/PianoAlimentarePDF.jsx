export default function PianoAlimentarePDF({ piano, cliente }) {

  function scaricaPDF() {
    const icone = { "COLAZIONE": "☀️", "SPUNTINO": "🥗", "PRANZO": "🍽️", "CENA": "🌙" }
    const righe = piano.split("\n")
    let sezioniGiorno = [], giornoCorrente = null, righeCorrenti = [], primaRighe = [], trovato = false

    righe.forEach(r => {
      const t = r.trim()
      const norm = t.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")
      const isG = ["LUNEDI","MARTEDI","MERCOLEDI","GIOVEDI","VENERDI","SABATO","DOMENICA"].some(g => norm.startsWith(g))
      if (isG) {
        trovato = true
        if (giornoCorrente) sezioniGiorno.push({ giorno: giornoCorrente, righe: righeCorrenti })
        giornoCorrente = t; righeCorrenti = []
      } else if (trovato) righeCorrenti.push(t)
      else primaRighe.push(t)
    })
    if (giornoCorrente) sezioniGiorno.push({ giorno: giornoCorrente, righe: righeCorrenti })

    function parsaPasti(righe) {
      const pasti = []; let tipo = null, voci = []
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
<title>Piano Alimentare</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background:#FFFFFF; color:#1A1A1A; font-family:Arial,sans-serif; font-size:12px; }
  
  .header { background:#0A0A0A; padding:24px 40px; text-align:center; }
  .logo { font-size:34px; font-weight:900; color:#C9A84C; letter-spacing:0.15em; }
  .logo-sub { font-size:10px; color:#8A7A5A; letter-spacing:0.2em; margin-top:3px; }
  
  .titolo-box { background:#FFFFFF; padding:16px 40px; text-align:center; border-bottom:2px solid #1A1A1A; }
  .titolo-tipo { font-size:20px; font-weight:900; color:#1A1A1A; letter-spacing:0.05em; text-transform:uppercase; }
  .titolo-nome { font-size:20px; font-weight:900; color:#C9A84C; letter-spacing:0.05em; text-transform:uppercase; display:inline; }
  
  .info-bar { background:#F5F0E8; padding:10px 40px; border-bottom:1px solid #DDD; display:flex; gap:40px; }
  .info-item { font-size:11px; color:#333; }
  .info-item strong { color:#C9A84C; }
  
  .griglia { padding:16px 24px; background:#FFFFFF; }
  .riga-giorni { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px; }
  
  .giorno { border:1px solid #DDD; border-radius:3px; overflow:hidden; }
  .giorno-header { background:#E8D5A0; padding:8px 14px; text-align:center; font-size:13px; font-weight:900; color:#1A1A1A; letter-spacing:0.1em; text-transform:uppercase; }
  .giorno-body { padding:10px 12px; background:#FFFFFF; }
  
  .pasto { margin-bottom:9px; }
  .pasto-titolo { display:flex; align-items:center; gap:5px; margin-bottom:4px; font-size:11px; font-weight:700; color:#C9A84C; letter-spacing:0.06em; text-transform:uppercase; }
  .pasto-voce { font-size:11px; color:#333; padding-left:18px; line-height:1.5; }
  .pasto-voce::before { content:"• "; color:#C9A84C; }
  
  .note-box { margin:0 24px 16px; background:#F5F0E8; border:1px solid #E8D5A0; border-radius:3px; padding:14px 18px; }
  .note-titolo { font-size:11px; font-weight:700; color:#1A1A1A; letter-spacing:0.1em; text-transform:uppercase; margin-bottom:8px; }
  .note-grid { display:grid; grid-template-columns:1fr 1fr; gap:3px; }
  .note-voce { font-size:10px; color:#555; line-height:1.5; }
  
  .footer { background:#0A0A0A; padding:12px 40px; display:flex; justify-content:space-between; align-items:center; }
  .footer-sx { font-size:10px; color:#6A5A3A; }
  .footer-dx { font-size:11px; font-weight:700; color:#C9A84C; letter-spacing:0.04em; text-align:right; }
  
  @media print { 
    body { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    @page { margin:0; }
  }
</style>
</head>
<body>

<div class="header">
  <div class="logo">✦ DR. WELLNESS ✦</div>
  <div class="logo-sub">PERSONAL TRAINER & NUTRIZIONISTA</div>
</div>

<div class="titolo-box">
  <span class="titolo-tipo">PIANO ${(cliente?.obiettivo||"ALIMENTARE").toUpperCase()} </span>
  <span class="titolo-nome">${cliente?.nome?.toUpperCase()||""} ${cliente?.cognome?.toUpperCase()||""}</span>
</div>

${primaRighe.filter(r=>r&&!r.startsWith("#")&&r.length>5).length>0 ? `
<div class="info-bar">
  ${primaRighe.filter(r=>r&&!r.startsWith("#")).slice(0,4).map(r=>`<div class="info-item">${r.replace(/\*\*/g,"")}</div>`).join("")}
</div>` : ""}

<div class="griglia">
  ${colonne.map(coppia => `
    <div class="riga-giorni">
      ${coppia.map(s => {
        const pasti = parsaPasti(s.righe)
        return `<div class="giorno">
          <div class="giorno-header">${s.giorno.split("-")[0].trim()}</div>
          <div class="giorno-body">
            ${pasti.map(p => `
              <div class="pasto">
                <div class="pasto-titolo">${icone[p.tipo]||"🍽️"} ${p.tipo}</div>
                ${p.voci.map(v=>`<div class="pasto-voce">${v}</div>`).join("")}
              </div>
            `).join("")}
          </div>
        </div>`
      }).join("")}
    </div>
  `).join("")}
</div>

<div class="note-box">
  <div class="note-titolo">📋 NOTE IMPORTANTI</div>
  <div class="note-grid">
    <div class="note-voce">• Mantieni sempre una buona idratazione — almeno 2L di acqua al giorno</div>
    <div class="note-voce">• Segui il piano con costanza e disciplina</div>
    <div class="note-voce">• Abbina il piano al programma di allenamento</div>
    <div class="note-voce">• Risultati reali arrivano con impegno e costanza nel tempo</div>
  </div>
</div>

<div class="footer">
  <div class="footer-sx">Convalidato dal Team DRW · ${new Date().toLocaleDateString("it-IT")}</div>
  <div class="footer-dx">PRENDITI CURA DI TE NON PER APPARIRE<br>MA PER EVOLVERE</div>
</div>

<script>window.onload=()=>{ setTimeout(()=>window.print(), 500) }</script>
</body>
</html>`

    const w = window.open("","_blank")
    w.document.write(html)
    w.document.close()
  }

  if (!piano) return null

  return (
    <div style={{display:"flex",justifyContent:"center",marginTop:"1rem"}}>
      <button onClick={scaricaPDF} style={{
        background:"#C9A84C",color:"#0A0A0A",border:"none",borderRadius:"8px",
        padding:"12px 32px",fontSize:"13px",fontWeight:700,cursor:"pointer",
        display:"flex",alignItems:"center",gap:"8px",letterSpacing:"0.05em"
      }}>
        <i className="ti ti-download" style={{fontSize:"16px"}}></i>
        SCARICA PDF
      </button>
    </div>
  )
}
