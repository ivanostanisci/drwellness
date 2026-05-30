import jsPDF from "jspdf"

export default function PianoAlimentarePDF({ piano, cliente }) {

  function scaricaPDF() {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
    const W = 210, margin = 12
    let y = 0

    // Colori
    const nero = [10, 10, 10]
    const oro = [201, 168, 76]
    const oroChiaro = [232, 213, 160]
    const bianco = [255, 255, 255]
    const grigio = [245, 240, 232]
    const testoscuro = [26, 26, 26]
    const testomedio = [80, 70, 50]

    function newPageIfNeeded(h) {
      if (y + h > 285) { doc.addPage(); y = 10 }
    }

    // ===== HEADER NERO =====
    doc.setFillColor(...nero)
    doc.rect(0, 0, W, 28, "F")
    doc.setTextColor(...oro)
    doc.setFontSize(22)
    doc.setFont("helvetica", "bold")
    doc.text("✦ DR. WELLNESS ✦", W/2, 14, { align: "center" })
    doc.setFontSize(7)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(138, 122, 90)
    doc.text("PERSONAL TRAINER & NUTRIZIONISTA", W/2, 21, { align: "center" })
    y = 28

    // ===== LINEA ORO =====
    doc.setFillColor(...oro)
    doc.rect(0, y, W, 0.8, "F")
    y += 0.8

    // ===== TITOLO =====
    doc.setFillColor(255, 255, 255)
    doc.rect(0, y, W, 18, "F")
    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(...testomedio)
    doc.text("PIANO " + (cliente?.obiettivo||"ALIMENTARE").toUpperCase(), W/2, y+6, { align: "center" })
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(...testoscuro)
    const nomeCompleto = ((cliente?.nome||"") + " ").toUpperCase()
    const cognome = (cliente?.cognome||"").toUpperCase()
    const nomeW = doc.getTextWidth(nomeCompleto)
    const totW = nomeW + doc.getTextWidth(cognome)
    const startX = W/2 - totW/2
    doc.text(nomeCompleto, startX, y+14)
    doc.setTextColor(...oro)
    doc.text(cognome, startX + nomeW, y+14)
    y += 18

    // ===== LINEA =====
    doc.setFillColor(...oroChiaro)
    doc.rect(0, y, W, 0.5, "F")
    y += 4

    // ===== PARSER PIANO =====
    const righe = piano.split("\n")
    const giorni = ["LUNEDI","MARTEDI","MERCOLEDI","GIOVEDI","VENERDI","SABATO","DOMENICA"]
    const icone = { "COLAZIONE":"COLAZIONE", "SPUNTINO":"SPUNTINO", "PRANZO":"PRANZO", "CENA":"CENA" }

    let sezioniGiorno = [], giornoCorrente = null, righeCorrenti = [], primaRighe = [], trovato = false
    righe.forEach(r => {
      const t = r.trim()
      const norm = t.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")
      const isG = giorni.some(g => norm.startsWith(g))
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
        else if (t && tipo) voci.push(t.replace(/^[-•*\[\]\s]*/,"").replace(/\*\*/g,"").trim())
      })
      if (tipo) pasti.push({tipo, voci})
      return pasti
    }

    // ===== INFO TDEE =====
    const infoRighe = primaRighe.filter(r => r && !r.startsWith("#") && r.length > 3).slice(0,8)
    if (infoRighe.length > 0) {
      doc.setFillColor(...grigio)
      doc.rect(margin, y, W-margin*2, infoRighe.length*4+4, "F")
      doc.setFontSize(7.5)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(...testomedio)
      infoRighe.forEach(r => {
        y += 4
        doc.text(r.replace(/\*\*/g,"").replace(/^#+\s*/,"").substring(0,90), margin+2, y)
      })
      y += 6
    }

    // ===== GIORNI IN COPPIE =====
    const colW = (W - margin*2 - 4) / 2
    for (let i = 0; i < sezioniGiorno.length; i += 2) {
      const coppia = sezioniGiorno.slice(i, i+2)
      
      // Calcoliamo altezza coppia
      let maxH = 0
      coppia.forEach(s => {
        const pasti = parsaPasti(s.righe)
        let h = 10 // header
        pasti.forEach(p => { h += 7 + p.voci.length * 4 })
        h += 4
        if (h > maxH) maxH = h
      })

      newPageIfNeeded(maxH + 4)

      coppia.forEach((s, ci) => {
        const x = margin + ci * (colW + 4)
        const pasti = parsaPasti(s.righe)

        // Header giorno oro
        doc.setFillColor(...oroChiaro)
        doc.rect(x, y, colW, 9, "F")
        doc.setFontSize(9)
        doc.setFont("helvetica", "bold")
        doc.setTextColor(...testoscuro)
        doc.text(s.giorno.split("-")[0].trim().toUpperCase().substring(0,20), x + colW/2, y+6, { align: "center" })

        // Body bianco
        doc.setFillColor(255,255,255)
        doc.rect(x, y+9, colW, maxH-9, "F")
        doc.setDrawColor(...oroChiaro)
        doc.rect(x, y, colW, maxH, "S")

        let py = y + 13
        pasti.forEach(p => {
          doc.setFontSize(8)
          doc.setFont("helvetica", "bold")
          doc.setTextColor(...oro)
          const emoji = p.tipo === "COLAZIONE" ? "☀ " : p.tipo === "PRANZO" ? "🍽 " : p.tipo === "CENA" ? "🌙 " : "● "
          doc.text(p.tipo, x+3, py)
          py += 4
          doc.setFontSize(7.5)
          doc.setFont("helvetica", "normal")
          doc.setTextColor(...testoscuro)
          p.voci.slice(0,6).forEach(v => {
            doc.text("• " + v.substring(0,38), x+4, py)
            py += 3.8
          })
          py += 1
        })
      })
      y += maxH + 4
    }

    // ===== NOTE IMPORTANTI =====
    newPageIfNeeded(30)
    doc.setFillColor(...grigio)
    doc.rect(margin, y, W-margin*2, 28, "F")
    doc.setDrawColor(...oroChiaro)
    doc.rect(margin, y, W-margin*2, 28, "S")
    doc.setFontSize(8)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(...oro)
    doc.text("📋 NOTE IMPORTANTI", margin+4, y+6)
    doc.setFontSize(7.5)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(...testomedio)
    const note = [
      "• Mantieni sempre una buona idratazione — almeno 2L di acqua al giorno",
      "• Segui il piano con costanza e disciplina",
      "• Abbina il piano alimentare al programma di allenamento",
      "• Risultati reali arrivano con impegno e costanza nel tempo"
    ]
    note.forEach((n, i) => {
      const nx = i < 2 ? margin+4 : W/2+2
      const ny = y + 11 + (i % 2) * 5
      doc.text(n, nx, ny)
    })
    y += 32

    // ===== FOOTER =====
    const fY = 290
    doc.setFillColor(...nero)
    doc.rect(0, fY-6, W, 12, "F")
    doc.setFontSize(7)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(100, 90, 60)
    doc.text("Convalidato dal Team DRW · " + new Date().toLocaleDateString("it-IT"), margin, fY)
    doc.setTextColor(...oro)
    doc.setFont("helvetica", "bold")
    doc.text("PRENDITI CURA DI TE NON PER APPARIRE MA PER EVOLVERE", W-margin, fY, { align: "right" })

    doc.save("Piano_Alimentare_" + (cliente?.nome||"") + "_" + (cliente?.cognome||"") + ".pdf")
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
