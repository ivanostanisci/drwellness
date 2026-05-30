import { useRef } from "react"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

export default function PianoAlimentarePDF({ piano, cliente }) {
  const pdfRef = useRef(null)

  async function scaricaPDF() {
    const element = pdfRef.current
    const canvas = await html2canvas(element, { scale: 2, backgroundColor: "#0A0A0A" })
    const imgData = canvas.toDataURL("image/png")
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight)
    pdf.save(`Piano_Alimentare_${cliente?.nome}_${cliente?.cognome}.pdf`)
  }

  if (!piano) return null

  // Parse il testo del piano in sezioni
  const sezioni = piano.split("\n").filter(l => l.trim())

  return (
    <div>
      <div style={{display:"flex",gap:"8px",justifyContent:"flex-end",marginBottom:"1rem"}}>
        <button onClick={scaricaPDF} style={{background:"var(--gold)",color:"#0A0A0A",border:"none",borderRadius:"7px",padding:"9px 16px",fontSize:"12px",fontWeight:500,cursor:"pointer",display:"flex",alignItems:"center",gap:"6px"}}>
          <i className="ti ti-download"></i> Scarica PDF
        </button>
      </div>

      <div ref={pdfRef} style={{
        background:"#0A0A0A",
        color:"#F0E6C8",
        fontFamily:"Arial, sans-serif",
        padding:"40px",
        minHeight:"800px"
      }}>
        {/* HEADER */}
        <div style={{textAlign:"center",marginBottom:"30px",borderBottom:"2px solid #C9A84C",paddingBottom:"20px"}}>
          <div style={{fontSize:"32px",fontWeight:700,color:"#C9A84C",letterSpacing:"0.1em",marginBottom:"4px"}}>DR. WELLNESS</div>
          <div style={{fontSize:"13px",color:"#8A7A5A",letterSpacing:"0.05em"}}>Personal Trainer & Nutrizionista</div>
        </div>

        {/* TITOLO */}
        <div style={{textAlign:"center",marginBottom:"30px"}}>
          <div style={{fontSize:"22px",fontWeight:700,color:"#FFFFFF",letterSpacing:"0.05em",textTransform:"uppercase"}}>
            PIANO ALIMENTARE
          </div>
          {cliente && (
            <div style={{fontSize:"18px",fontWeight:600,color:"#C9A84C",marginTop:"8px"}}>
              {cliente.nome?.toUpperCase()} {cliente.cognome?.toUpperCase()}
            </div>
          )}
          {cliente?.obiettivo && (
            <div style={{fontSize:"12px",color:"#8A7A5A",marginTop:"4px",textTransform:"uppercase",letterSpacing:"0.08em"}}>
              Obiettivo: {cliente.obiettivo}
            </div>
          )}
        </div>

        {/* CONTENUTO PIANO */}
        <div style={{fontSize:"12px",lineHeight:"1.8",color:"#E0D0A0",whiteSpace:"pre-wrap"}}>
          {sezioni.map((linea, i) => {
            const isH1 = linea.startsWith("# ")
            const isH2 = linea.startsWith("## ")
            const isH3 = linea.startsWith("### ")
            const isBold = linea.startsWith("**") && linea.endsWith("**")
            const isGiorno = /^(LUNEDI|MARTEDI|MERCOLEDI|GIOVEDI|VENERDI|SABATO|DOMENICA|LUNEDÌ|MARTEDÌ|MERCOLEDÌ|GIOVEDÌ|VENERDÌ)/i.test(linea.trim())
            const isPasto = /^(COLAZIONE|PRANZO|CENA|SPUNTINO)/i.test(linea.trim())

            if (isGiorno) return (
              <div key={i} style={{background:"#C9A84C",color:"#0A0A0A",padding:"8px 16px",fontWeight:700,fontSize:"13px",letterSpacing:"0.08em",marginTop:"16px",marginBottom:"8px",textTransform:"uppercase"}}>
                {linea.trim()}
              </div>
            )
            if (isPasto) return (
              <div key={i} style={{color:"#C9A84C",fontWeight:600,fontSize:"12px",marginTop:"10px",marginBottom:"4px",letterSpacing:"0.05em",textTransform:"uppercase"}}>
                🍽 {linea.trim()}
              </div>
            )
            if (isH1 || isH2) return (
              <div key={i} style={{color:"#C9A84C",fontWeight:700,fontSize:"14px",marginTop:"20px",marginBottom:"8px",borderBottom:"1px solid rgba(201,168,76,0.3)",paddingBottom:"4px"}}>
                {linea.replace(/^#+\s*/, "").replace(/\*\*/g, "")}
              </div>
            )
            if (isH3 || isBold) return (
              <div key={i} style={{color:"#E8C96A",fontWeight:600,fontSize:"12px",marginTop:"12px",marginBottom:"4px"}}>
                {linea.replace(/^#+\s*/, "").replace(/\*\*/g, "")}
              </div>
            )
            return (
              <div key={i} style={{color:"#E0D0A0",paddingLeft: linea.startsWith("-") || linea.startsWith("•") ? "12px" : "0"}}>
                {linea}
              </div>
            )
          })}
        </div>

        {/* FOOTER */}
        <div style={{marginTop:"40px",borderTop:"1px solid rgba(201,168,76,0.3)",paddingTop:"16px",textAlign:"center"}}>
          <div style={{fontSize:"11px",color:"#8A7A5A"}}>Dr. Wellness · Piano generato il {new Date().toLocaleDateString("it-IT")}</div>
          <div style={{fontSize:"10px",color:"#4A4030",marginTop:"4px"}}>Segui il piano con costanza e disciplina · Mantieni una buona idratazione</div>
        </div>
      </div>
    </div>
  )
}
