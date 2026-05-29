import { useState, useEffect } from 'react'
import Layout from '../components/Layout'

export default function Allenamenti() {
  const [ricerca, setRicerca] = useState('')
  const [selezionato, setSelezionato] = useState(null)
  const [filtro, setFiltro] = useState('Tutti')

  const muscoli = ['Tutti','chest','back','shoulders','upper arms','upper legs','waist','cardio']

  const esercizi = [
    { name:'Bench Press', bodyPart:'chest', equipment:'barbell', targetMuscles:['pectorals','triceps'], secondaryMuscles:['deltoids'], instructions:['Sdraiati sulla panca piatta','Impugna il bilanciere largo','Abbassa al petto controllato','Spingi su espirando'] },
    { name:'Squat', bodyPart:'upper legs', equipment:'barbell', targetMuscles:['quadriceps','glutes'], secondaryMuscles:['hamstrings'], instructions:['Bilanciere sul trapezio','Piedi larghezza spalle','Scendi fino a cosce parallele','Risali spingendo coi talloni'] },
    { name:'Deadlift', bodyPart:'back', equipment:'barbell', targetMuscles:['lower back','hamstrings'], secondaryMuscles:['glutes','traps'], instructions:['Piedi sotto il bilanciere','Schiena dritta petto fuori','Solleva estendendo gambe e fianchi','Abbassa controllato'] },
    { name:'Pull Up', bodyPart:'back', equipment:'body weight', targetMuscles:['latissimus dorsi'], secondaryMuscles:['biceps'], instructions:['Impugna la sbarra','Parti con braccia distese','Tira il mento sopra la sbarra','Abbassa lentamente'] },
    { name:'Shoulder Press', bodyPart:'shoulders', equipment:'dumbbell', targetMuscles:['deltoids'], secondaryMuscles:['triceps'], instructions:['Manubri alle spalle','Spingi verso l alto','Abbassa lentamente'] },
    { name:'Bicep Curl', bodyPart:'upper arms', equipment:'dumbbell', targetMuscles:['biceps'], secondaryMuscles:['forearms'], instructions:['Manubri ai lati','Piega le braccia','Abbassa controllato'] },
    { name:'Plank', bodyPart:'waist', equipment:'body weight', targetMuscles:['core','abs'], secondaryMuscles:['shoulders'], instructions:['Avambracci a terra','Corpo in linea retta','Contrai addome e glutei','Mantieni la posizione'] },
    { name:'Leg Press', bodyPart:'upper legs', equipment:'machine', targetMuscles:['quadriceps','glutes'], secondaryMuscles:['hamstrings'], instructions:['Siediti sulla macchina','Piedi sulla piattaforma','Abbassa a 90 gradi','Spingi senza bloccare le ginocchia'] },
    { name:'Lat Pulldown', bodyPart:'back', equipment:'cable', targetMuscles:['latissimus dorsi'], secondaryMuscles:['biceps'], instructions:['Impugna la barra larga','Petto in fuori','Tira verso il petto','Risali lentamente'] },
    { name:'Running', bodyPart:'cardio', equipment:'body weight', targetMuscles:['legs','heart'], secondaryMuscles:['core'], instructions:['Riscaldamento camminando','Aumenta il ritmo','Postura eretta','Respira ritmicamente'] },
    { name:'Romanian Deadlift', bodyPart:'upper legs', equipment:'barbell', targetMuscles:['hamstrings','glutes'], secondaryMuscles:['lower back'], instructions:['Bilanciere davanti','Piega le anche indietro','Abbassa lungo le gambe','Risali contraendo i glutei'] },
    { name:'Tricep Pushdown', bodyPart:'upper arms', equipment:'cable', targetMuscles:['triceps'], secondaryMuscles:['forearms'], instructions:['Stai davanti al cavo','Gomiti fissi al corpo','Spingi verso il basso','Risali lentamente'] },
  ]

  const filtrati = filtro === 'Tutti' ? esercizi : esercizi.filter(e => e.bodyPart === filtro)
  const cercati = ricerca ? filtrati.filter(e => e.name.toLowerCase().includes(ricerca.toLowerCase())) : filtrati

  return (
    <Layout>
      <button onClick={()=>window.history.back()} style={{background:"transparent",border:".5px solid var(--bord)",color:"var(--t2)",borderRadius:"7px",padding:"7px 14px",fontSize:"12px",cursor:"pointer",display:"inline-flex",alignItems:"center",gap:"5px",marginBottom:"1rem"}}><i className="ti ti-arrow-left"></i> Dashboard</button>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1.5rem'}}>
        <div>
          <div style={{fontFamily:'Cormorant Garamond,serif',fontSize:'22px',fontWeight:600,color:'var(--t1)'}}>Allenamenti</div>
          <div style={{fontSize:'11px',color:'var(--t2)',marginTop:'2px'}}>Libreria esercizi con tutorial</div>
        </div>
        <button className="btn-gold"><i className="ti ti-plus"></i> Nuova scheda</button>
      </div>

      <div style={{position:'relative',marginBottom:'1rem'}}>
        <i className="ti ti-search" style={{position:'absolute',left:'12px',top:'50%',transform:'translateY(-50%)',color:'var(--t2)',fontSize:'14px'}}></i>
        <input className="finput" style={{paddingLeft:'36px'}} placeholder="Cerca esercizio..." value={ricerca} onChange={e=>setRicerca(e.target.value)} />
      </div>

      <div style={{display:'flex',gap:'6px',flexWrap:'wrap',marginBottom:'1.25rem'}}>
        {muscoli.map(m=>(
          <button key={m} onClick={()=>setFiltro(m)} style={{padding:'5px 12px',borderRadius:'20px',fontSize:'11px',fontWeight:500,cursor:'pointer',border:'.5px solid',borderColor:filtro===m?'var(--gold)':'var(--bord)',background:filtro===m?'var(--gold-dim)':'transparent',color:filtro===m?'var(--gold)':'var(--t2)',fontFamily:'DM Sans,sans-serif',transition:'all .15s'}}>
            {m}
          </button>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px'}}>
        {cercati.map((e,i)=>(
          <div key={i} className="card" style={{margin:0,cursor:'pointer'}} onClick={()=>setSelezionato(e)}
            onMouseEnter={el=>el.currentTarget.style.borderColor='var(--gold)'}
            onMouseLeave={el=>el.currentTarget.style.borderColor='var(--bord)'}>
            <div style={{height:'120px',background:'#050505',display:'flex',alignItems:'center',justifyContent:'center',borderRadius:'12px 12px 0 0'}}>
              <i className="ti ti-barbell" style={{fontSize:'40px',color:'var(--t3)'}}></i>
            </div>
            <div style={{padding:'.85rem 1rem'}}>
              <div style={{fontSize:'12px',fontWeight:500,color:'var(--t1)',marginBottom:'5px'}}>{e.name}</div>
              <div style={{display:'flex',gap:'6px'}}>
                <span className="pill p-warn" style={{fontSize:'9px'}}>{e.bodyPart}</span>
                <span className="pill" style={{fontSize:'9px',background:'rgba(122,154,187,0.1)',color:'#7A9ABB',border:'.5px solid rgba(122,154,187,0.2)'}}>{e.equipment}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selezionato && (
        <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setSelezionato(null)}>
          <div className="modal" style={{width:'540px'}}>
            <div className="modal-hdr">
              <div className="modal-title"><i className="ti ti-barbell" style={{color:'var(--gold)',fontSize:'16px'}}></i> {selezionato.name}</div>
              <button onClick={()=>setSelezionato(null)} style={{background:'transparent',border:'none',color:'var(--t2)',fontSize:'20px',cursor:'pointer'}}><i className="ti ti-x"></i></button>
            </div>
            <div style={{padding:'1.25rem'}}>
              <div style={{height:'180px',background:'#050505',borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'1rem'}}>
                <i className="ti ti-barbell" style={{fontSize:'60px',color:'var(--t3)'}}></i>
              </div>
              <div style={{display:'flex',gap:'6px',marginBottom:'1rem'}}>
                <span className="pill p-warn">{selezionato.bodyPart}</span>
                <span className="pill" style={{background:'rgba(122,154,187,0.1)',color:'#7A9ABB',border:'.5px solid rgba(122,154,187,0.2)'}}>{selezionato.equipment}</span>
              </div>
              <div style={{marginBottom:'1rem'}}>
                <div style={{fontSize:'10px',color:'var(--t3)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:'6px'}}>Muscoli target</div>
                <div style={{display:'flex',gap:'5px',flexWrap:'wrap'}}>
                  {selezionato.targetMuscles.map((m,i)=><span key={i} className="pill p-ok" style={{fontSize:'10px'}}>{m}</span>)}
                </div>
              </div>
              <div style={{marginBottom:'1rem'}}>
                <div style={{fontSize:'10px',color:'var(--t3)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:'8px',display:'flex',alignItems:'center',gap:'5px'}}><i className="ti ti-list-check" style={{color:'var(--gold)'}}></i> Istruzioni</div>
                {selezionato.instructions.map((s,i)=>(
                  <div key={i} style={{display:'flex',gap:'10px',marginBottom:'7px',padding:'8px 10px',background:'var(--card2)',borderRadius:'7px',border:'.5px solid var(--bord)'}}>
                    <div style={{width:'20px',height:'20px',borderRadius:'50%',background:'var(--gold-dim)',border:'.5px solid var(--gold-b)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'10px',fontWeight:600,color:'var(--gold)',flexShrink:0}}>{i+1}</div>
                    <div style={{fontSize:'12px',color:'var(--t2)',lineHeight:1.5}}>{s}</div>
                  </div>
                ))}
              </div>
              <div style={{display:'flex',gap:'8px',justifyContent:'flex-end'}}>
                <button className="btn-outline" onClick={()=>setSelezionato(null)}>Chiudi</button>
                <button className="btn-gold"><i className="ti ti-plus"></i> Aggiungi a scheda</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
