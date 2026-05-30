import { useRef } from "react"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

export default function PianoAlimentarePDF({ piano, cliente }) {
  const pdfRef = useRef(null)

  async function scaricaPDF() {
    const element = pdfRef.current
    const canvas = await html2canvas(element, { 
      scale: 2, 
      backgroundColor: "#0A0A0A",
      useCORS: true
    })
    const imgData = canvas.toDataURL("image/png")
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width
    let position = 0
    const pageHeight = pdf.internal.pageSize.getHeight()
    
    if (pdfHeight <= pageHeight) {
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight)
    } else {
      let remainingHeight = pdfHeight
      while (remainingHeight > 0) {
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight)
        remainingHeight -= pageHeight
        position -= pageHeight
        if (remainingHeight > 0) pdf.addPage()
      }
    }
    pdf.save("Piano_Alimentare_" + (cliente?.nome||"") + "_" + (cliente?.cognome||"") + ".pdf")
  }

  if (!piano) return null

  const righe = piano.split("\n")
  
  const giorni = ["LUNEDI","MARTEDI","MERCOLEDI","GIOVEDI","VENERDI","SABATO","DOMENICA","LUNEDÌ","MARTEDÌ","MERCOLEDÌ","GIOVEDÌ","VENERDÌ"]
  const pasti = ["COLAZIONE","PRANZO","CENA","SPUNTINO"]
  const pastiIcon = {"COLAZIONE":"☀️","PRANZO":"🍽","CENA":"🌙","SPUNTINO":"🥗"}

  function renderRiga(riga, i) {
    const t = riga.trim()
    if (!t) return <div key={i} style={{height:"8px"}}></div>
    
    const isGiorno = giorni.some(g => t.toUpperCase().startsWith(g))
    const isPasto = pasti.some(p => t.toUpperCase().startsWith(p))
    const isTitolo = t.startsWith("##") || t.startsWith("**") && t.endsWith("**")
    const isLista = t.startsWith("-") || t.startsWith("•") || t.startsWith("*") && !t.endsWith("*")
    
    const testo = t.replace(/^#+\s*/, "").replace(/\*\*/g, "").replace(/^[-•*]\s*/, "")
    const pastoKey = pasti.find(p => t.toUpperCase().startsWith(p))

    if (isGiorno) return (
      <div key={i} style={{
        background:"#C9A84C",
        color:"#0A0A0A",
        padding:"10px 20px",
        fontWeight:700,
        fontSize:"15px",
        letterSpacing:"0.1em",
        marginTop:"20px",
        marginBottom:"8px",
        textTransform:"uppercase",
        fontFamily:"Arial Black, sans-serif"
      }}>{testo}</div>
    )
    
    if (isPasto) return (
      <div key={i} style={{
        display:"flex",
        alignItems:"center",
        gap:"8px",
        color:"#C9A84C",
        fontWeight:700,
        fontSize:"13px",
        marginTop:"12px",
        marginBottom:"6px",
        letterSpacing:"0.05em",
        textTransform:"uppercase"
      }}>
        <span>{pastiIcon[pastoKey]||"🍽"}</span>
        <span>{testo}</span>
      </div>
    )
    
    if (isTitolo) return (
      <div key={i} style={{
        color:"#C9A84C",
        fontWeight:700,
        fontSize:"14px",
        marginTop:"20px",
        marginBottom:"8px",
        borderBottom:"1px solid rgba(201,168,76,0.4)",
        paddingBottom:"6px"
      }}>{testo}</div>
    )
    
    if (isLista) return (
      <div key={i} style={{
        color:"#F0E6C8",
        fontSize:"12px",
        paddingLeft:"16px",
        marginBottom:"3px",
        lineHeight:"1.6",
        display:"flex",
        gap:"6px"
      }}>
        <span style={{color:"#C9A84C",flexShrink:0}}>•</span>
        <span>{testo}</span>
      </div>
    )
    
    return (
      <div key={i} style={{
        color:"#E0D0A0",
        fontSize:"12px",
        lineHeight:"1.7",
        marginBottom:"3px"
      }}>{testo}</div>
    )
  }

  return (
    <div>
      <div ref={pdfRef} style={{
        background:"#0A0A0A",
        color:"#F0E6C8",
        fontFamily:"Arial, sans-serif",
        padding:"40px 40px 60px",
      }}>
        {/* HEADER CON LOGO */}
        <div style={{textAlign:"center",marginBottom:"30px",paddingBottom:"20px",borderBottom:"2px solid #C9A84C"}}>
          <div style={{
            fontSize:"36px",
            fontWeight:900,
            color:"#C9A84C",
            letterSpacing:"0.15em",
            fontFamily:"Arial Black, sans-serif",
            marginBottom:"4px"
          }}>DR. WELLNESS</div>
          <div style={{fontSize:"12px",color:"#8A7A5A",letterSpacing:"0.08em",textTransform:"uppercase"}}>Personal Trainer & Nutrizionista</div>
        </div>

        {/* TITOLO PIANO */}
        <div style={{textAlign:"center",marginBottom:"30px"}}>
          <div style={{fontSize:"11px",color:"#8A7A5A",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:"6px"}}>PIANO DIMAGRIMENTO</div>
          <div style={{
            fontSize:"24px",
            fontWeight:700,
            color:"#FFFFFF",
            letterSpacing:"0.08em",
            textTransform:"uppercase"
          }}>
            {cliente?.nome?.toUpperCase()} {cliente?.cognome?.toUpperCase()}
          </div>
          {cliente?.obiettivo && (
            <div style={{
              display:"inline-block",
              background:"rgba(201,168,76,0.15)",
              border:"1px solid rgba(201,168,76,0.4)",
              color:"#C9A84C",
              fontSize:"11px",
              padding:"4px 16px",
              borderRadius:"20px",
              marginTop:"8px",
              textTransform:"uppercase",
              letterSpacing:"0.06em"
            }}>{cliente.obiettivo}</div>
          )}
        </div>

        {/* PIANO */}
        <div>{righe.map((r, i) => renderRiga(r, i))}</div>

        {/* NOTE IMPORTANTI */}
        <div style={{
          marginTop:"30px",
          background:"rgba(201,168,76,0.08)",
          border:"1px solid rgba(201,168,76,0.25)",
          borderRadius:"8px",
          padding:"16px 20px"
        }}>
          <div style={{fontSize:"11px",fontWeight:700,color:"#C9A84C",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:"8px"}}>
            📋 NOTE IMPORTANTI
          </div>
          <div style={{fontSize:"11px",color:"#8A7A5A",lineHeight:"1.7"}}>
            • Mantieni sempre una buona idratazione — bevi almeno 2 litri di acqua al giorno<br/>
            • Segui il piano con costanza e disciplina<br/>
            • Abbina il piano alimentare al programma di allenamento<br/>
            • Risultati reali arrivano con impegno e costanza nel tempo
          </div>
        </div>

        {/* FOOTER */}
        <div style={{
          marginTop:"30px",
          paddingTop:"16px",
          borderTop:"1px solid rgba(201,168,76,0.25)",
          display:"flex",
          justifyContent:"space-between",
          alignItems:"center"
        }}>
          <div style={{fontSize:"11px",color:"#4A4030"}}>Dr. Wellness · {new Date().toLocaleDateString("it-IT")}</div>
          <div style={{fontSize:"13px",fontWeight:700,color:"#C9A84C",letterSpacing:"0.05em"}}>ALLENATI OGGI PER IL TUO DOMANI MIGLIORE</div>
        </div>
      </div>

      {/* BOTTONE SCARICA */}
      <div style={{display:"flex",justifyContent:"center",marginTop:"1.5rem"}}>
        <button onClick={scaricaPDF} style={{
          background:"#C9A84C",
          color:"#0A0A0A",
          border:"none",
          borderRadius:"8px",
          padding:"12px 32px",
          fontSize:"13px",
          fontWeight:700,
          cursor:"pointer",
          display:"flex",
          alignItems:"center",
          gap:"8px",
          letterSpacing:"0.05em"
        }}>
          <i className="ti ti-download" style={{fontSize:"16px"}}></i>
          SCARICA PDF
        </button>
      </div>
    </div>
  )
}
