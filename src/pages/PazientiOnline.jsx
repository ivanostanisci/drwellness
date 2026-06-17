import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { supabase } from '../lib/supabase'

export default function PazientiOnline() {
  const [pazienti, setPazienti] = useState([])
  const [ordini, setOrdini] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    nome:'', cognome:'', email:'', telefono:'',
    peso_iniziale:'', altezza:'', obiettivo:'dimagrimento',
    energia:3, umore:3, sonno:3, motivazione:3,
    note:'', pacchetto:'completo'
  })
  const [generando, setGenerando] = useState(false)
  const [pianoGenerato, setPianoGenerato] = useState('')
  const [msg, setMsg] = useState('')

  useEffect(() => { fetchDati() }, [])

  async function fetchDati() {
    const { data: c } = await supabase.from('clienti').select('*').eq('tipo','online').eq('attivo',true).order('created_at',{ascending:false})
    const { data: o } = await supabase.from('ordini').select('*').order('created_at',{ascending:false})
    if(c) setPazienti(c)
    if(o) setOrdini(o)
    setLoading(false)
  }

  async function generaPianoAI(cliente) {
    setGenerando(true)
    setPianoGenerato('')
    try {
      const prompt = `Sei Dr. Wellness, un personal trainer e nutrizionista esperto. 
Genera un piano completo personalizzato per questo paziente:

Nome: ${cliente.nome} ${cliente.cognome}
Peso: ${cliente.peso_iniziale} kg
Altezza: ${cliente.altezza} cm
Obiettivo: ${cliente.obiettivo}
Livello energia: ${cliente.energia}/5
Qualità sonno: ${cliente.sonno}/5
Motivazione: ${cliente.motivazione}/5
Note: ${cliente.note}

Genera:
1. PIANO ALIMENTARE (7 giorni con colazione, pranzo, cena, spuntini e macros)
2. SCHEDA ALLENAMENTO (3 giorni a settimana con esercizi, serie, ripetizioni)
3. CONSIGLI PERSONALIZZATI (3 consigli specifici per questo paziente)

Sii specifico, pratico e motivante. Usa un tono professionale ma caldo.`

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }]
        })
      })
      const data = await res.json()
      const piano = data.content[0].text
      setPianoGenerato(piano)
      return piano
    } catch(e) {
      console.error(e)
      return 'Errore generazione piano'
    } finally {
      setGenerando(false)
    }
  }

  async function salvaECompleta() {
    setSaving(true)
    // 1. Crea cliente
    const { data: c, error: ce } = await supabase.from('clienti').insert([{
      nome: form.nome, cognome: form.cognome, email: form.email,
      telefono: form.telefono, peso_iniziale: form.peso_iniziale,
      altezza: form.altezza, obiettivo: form.obiettivo,
      note: form.note, tipo: 'online', attivo: true
    }]).select().single()

    if(ce) { setMsg('Errore: '+ce.message); setSaving(false); return }

    // 2. Genera piano AI
    const piano = await generaPianoAI({...form})

    // 3. Salva ordine con piano
    const prezzi = { alimentare:49, scheda:39, completo:89, abbonamento:129 }
    await supabase.from('ordini').insert([{
      cliente_id: c.id,
      importo: prezzi[form.pacchetto] || 89,
      stato: 'pagato',
      piano_ai: piano
    }])

    setMsg('Paziente aggiunto e piano generato!')
    fetchDati()
    setShowModal(false)
    setStep(1)
    setSaving(false)
    setTimeout(()=>setMsg(''),4000)
  }

  const [saving, setSaving] = useState(false)

  const prezzi = { alimentare:'€49', scheda:'€39', completo:'€89', abbonamento:'€129/mese' }

  return (
    <Layout>
      <button onClick={()=>window.history.back()} style={{background:"transparent",border:".5px solid var(--bord)",color:"var(--t2)",borderRadius:"7px",padding:"7px 14px",fontSize:"12px",cursor:"pointer",display:"inline-flex",alignItems:"center",gap:"5px",marginBottom:"1rem"}}><i className="ti ti-arrow-left"></i> Dashboard</button>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1.5rem'}}>
        <div>
          <div style={{fontFamily:'Cormorant Garamond,serif',fontSize:'22px',fontWeight:600,color:'var(--t1)'}}>Pazienti Online</div>
          <div style={{fontSize:'11px',color:'var(--t2)',marginTop:'2px'}}>Visite online · piani generati automaticamente dall'AI</div>
        </div>
        <button className="btn-gold" onClick={()=>{setShowModal(true);setStep(1)}}>
          <i className="ti ti-plus"></i> Nuovo paziente
        </button>
      </div>

      {msg && (
        <div style={{background:'var(--gold-dim)',border:'.5px solid var(--gold-b)',borderRadius:'8px',padding:'10px 14px',fontSize:'12px',color:'var(--gold)',marginBottom:'1rem',display:'flex',alignItems:'center',gap:'8px'}}>
          <i className="ti ti-check-circle"></i> {msg}
        </div>
      )}

      {/* STATS */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'12px',marginBottom:'1.5rem'}}>
        <div className="stat-card">
          <div className="stat-icon"><i className="ti ti-world"></i></div>
          <div className="stat-label">Pazienti online</div>
          <div className="stat-val">{pazienti.length}</div>
          <div className="stat-delta up">↑ in crescita</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><i className="ti ti-robot"></i></div>
          <div className="stat-label">Piani generati AI</div>
          <div className="stat-val">{ordini.filter(o=>o.piano_ai).length}</div>
          <div className="stat-delta up">in automatico</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><i className="ti ti-credit-card"></i></div>
          <div className="stat-label">Incasso totale</div>
          <div className="stat-val">€{ordini.filter(o=>o.stato==='pagato').reduce((acc,o)=>acc+Number(o.importo),0)}</div>
          <div className="stat-delta up">↑ questo mese</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><i className="ti ti-clock"></i></div>
          <div className="stat-label">In attesa</div>
          <div className="stat-val">{ordini.filter(o=>o.stato==='in_attesa').length}</div>
          <div className="stat-delta warn">da convertire</div>
        </div>
      </div>

      {/* TABELLA */}
      <div className="card">
        <div className="card-hdr">
          <span className="card-title"><i className="ti ti-world" style={{color:'var(--gold)',fontSize:'14px'}}></i> Pazienti online</span>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr 80px',gap:'10px',padding:'7px 1.1rem',background:'var(--card2)',fontSize:'10px',color:'var(--t3)',fontWeight:600,textTransform:'uppercase',letterSpacing:'.06em'}}>
          <span>Paziente</span><span>Pacchetto</span><span>Pagamento</span><span>Piano AI</span><span></span>
        </div>

        {loading && <div style={{padding:'2rem',textAlign:'center',fontSize:'12px',color:'var(--t2)'}}>Caricamento...</div>}

        {!loading && pazienti.length === 0 && (
          <div style={{padding:'3rem',textAlign:'center'}}>
            <i className="ti ti-world" style={{fontSize:'36px',display:'block',marginBottom:'12px',color:'var(--t3)'}}></i>
            <div style={{fontSize:'13px',color:'var(--t2)',marginBottom:'8px'}}>Nessun paziente online ancora</div>
            <button className="btn-gold" onClick={()=>{setShowModal(true);setStep(1)}} style={{margin:'0 auto'}}>
              <i className="ti ti-plus"></i> Aggiungi il primo paziente
            </button>
          </div>
        )}

        {pazienti.map((p,i) => {
          const ordine = ordini.find(o=>o.cliente_id===p.id)
          return (
            <div key={p.id} style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr 80px',alignItems:'center',gap:'10px',padding:'10px 1.1rem',borderBottom:i<pazienti.length-1?'.5px solid var(--bord)':'none',fontSize:'12px',cursor:'pointer',transition:'background .15s'}}
              onMouseEnter={e=>e.currentTarget.style.background='var(--hover)'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <div style={{display:'flex',alignItems:'center',gap:'9px'}}>
                <div style={{width:'28px',height:'28px',borderRadius:'50%',background:'var(--gold-dim)',border:'.5px solid var(--gold-b)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'10px',fontWeight:600,color:'var(--gold)',flexShrink:0}}>
                  {p.nome[0]}{p.cognome[0]}
                </div>
                <div>
                  <div style={{fontWeight:500,color:'var(--t1)'}}>{p.nome} {p.cognome}</div>
                  <div style={{fontSize:'10px',color:'var(--t2)'}}>{p.email}</div>
                </div>
              </div>
              <span style={{fontSize:'11px',color:'var(--t2)',textTransform:'capitalize'}}>{ordine ? ordine.importo+'€' : '—'}</span>
              <span className={`pill ${ordine?.stato==='pagato'?'p-ok':'p-warn'}`}>
                {ordine?.stato==='pagato'?'✓ Pagato':'In attesa'}
              </span>
              <span className={`pill ${ordine?.piano_ai?'p-ok':'p-warn'}`}>
                {ordine?.piano_ai?'✓ Generato':'—'}
              </span>
              <span style={{color:'var(--gold)',fontSize:'11px',cursor:'pointer'}} onClick={()=>navigate('/clienti/'+p.id)}>Apri →</span>
            </div>
          )
        })}
      </div>

      {/* MODALE */}
      {showModal && (
        <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setShowModal(false)}>
          <div className="modal" style={{width:'560px'}}>
            <div className="modal-hdr">
              <div className="modal-title">
                <i className="ti ti-world" style={{color:'var(--gold)',fontSize:'16px'}}></i>
                Nuovo Paziente Online
              </div>
              <button onClick={()=>setShowModal(false)} style={{background:'transparent',border:'none',color:'var(--t2)',fontSize:'20px',cursor:'pointer'}}>
                <i className="ti ti-x"></i>
              </button>
            </div>

            {/* STEP INDICATOR */}
            <div style={{display:'flex',alignItems:'center',padding:'1rem 1.25rem',borderBottom:'.5px solid var(--bord)'}}>
              {['Profilo','Salute','Pacchetto','Genera'].map((s,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',flex:i<3?1:'auto'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'5px',fontSize:'11px',fontWeight:500,color:step===i+1?'var(--gold)':step>i+1?'var(--green)':'var(--t3)'}}>
                    <div style={{width:'20px',height:'20px',borderRadius:'50%',background:step===i+1?'var(--gold-dim)':step>i+1?'rgba(122,184,122,0.1)':'var(--card2)',border:`.5px solid ${step===i+1?'var(--gold-b)':step>i+1?'rgba(122,184,122,0.3)':'var(--bord)'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'9px',fontWeight:600}}>
                      {step>i+1?'✓':i+1}
                    </div>
                    {s}
                  </div>
                  {i<3&&<div style={{flex:1,height:'.5px',background:step>i+1?'rgba(122,184,122,0.3)':'var(--bord)',margin:'0 8px'}}></div>}
                </div>
              ))}
            </div>

            <div style={{padding:'1.25rem'}}>

              {/* STEP 1: PROFILO */}
              {step===1 && (
                <div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'10px'}}>
                    <div><label className="flabel">Nome *</label><input className="finput" required value={form.nome} onChange={e=>setForm({...form,nome:e.target.value})} placeholder="Mario" /></div>
                    <div><label className="flabel">Cognome *</label><input className="finput" required value={form.cognome} onChange={e=>setForm({...form,cognome:e.target.value})} placeholder="Rossi" /></div>
                  </div>
                  <div style={{marginBottom:'10px'}}><label className="flabel">Email *</label><input className="finput" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="mario@email.com" /></div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'10px',marginBottom:'10px'}}>
                    <div><label className="flabel">Peso (kg)</label><input className="finput" type="number" value={form.peso_iniziale} onChange={e=>setForm({...form,peso_iniziale:e.target.value})} placeholder="75" /></div>
                    <div><label className="flabel">Altezza (cm)</label><input className="finput" type="number" value={form.altezza} onChange={e=>setForm({...form,altezza:e.target.value})} placeholder="175" /></div>
                    <div><label className="flabel">Obiettivo</label>
                      <select className="fselect" value={form.obiettivo} onChange={e=>setForm({...form,obiettivo:e.target.value})}>
                        <option value="dimagrimento">Dimagrimento</option>
                        <option value="massa">Massa muscolare</option>
                        <option value="mantenimento">Mantenimento</option>
                      </select>
                    </div>
                  </div>
                  <div style={{display:'flex',justifyContent:'flex-end',marginTop:'1rem'}}>
                    <button className="btn-gold" onClick={()=>setStep(2)} disabled={!form.nome||!form.cognome||!form.email}>
                      Avanti <i className="ti ti-arrow-right"></i>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: SALUTE */}
              {step===2 && (
                <div>
                  <div style={{fontSize:'12px',color:'var(--t2)',marginBottom:'1rem'}}>Come si sente il paziente? Questi dati aiutano l'AI a personalizzare il piano.</div>
                  {['energia','umore','sonno','motivazione'].map(field=>(
                    <div key={field} style={{background:'var(--card2)',border:'.5px solid var(--bord)',borderRadius:'8px',padding:'.85rem 1rem',marginBottom:'8px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                      <span style={{fontSize:'12px',fontWeight:500,color:'var(--t1)',textTransform:'capitalize'}}>{field}</span>
                      <div style={{display:'flex',gap:'6px'}}>
                        {[1,2,3,4,5].map(v=>(
                          <button key={v} onClick={()=>setForm({...form,[field]:v})}
                            style={{width:'28px',height:'28px',borderRadius:'6px',border:'.5px solid',borderColor:form[field]>=v?'var(--gold-b)':'var(--bord)',background:form[field]>=v?'var(--gold-dim)':'transparent',color:form[field]>=v?'var(--gold)':'var(--t3)',fontSize:'13px',cursor:'pointer',transition:'all .15s'}}>
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div style={{marginTop:'10px'}}>
                    <label className="flabel">Note aggiuntive per l'AI</label>
                    <textarea className="finput" value={form.note} onChange={e=>setForm({...form,note:e.target.value})} placeholder="Intolleranze, patologie, preferenze alimentari, orari disponibili..." style={{height:'70px',resize:'none'}} />
                  </div>
                  <div style={{display:'flex',gap:'8px',justifyContent:'flex-end',marginTop:'1rem'}}>
                    <button className="btn-outline" onClick={()=>setStep(1)}><i className="ti ti-arrow-left"></i> Indietro</button>
                    <button className="btn-gold" onClick={()=>setStep(3)}>Avanti <i className="ti ti-arrow-right"></i></button>
                  </div>
                </div>
              )}

              {/* STEP 3: PACCHETTO */}
              {step===3 && (
                <div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'1rem'}}>
                    {[
                      {id:'alimentare',nome:'Solo Piano Alimentare',prezzo:'€49',icon:'ti-salad'},
                      {id:'scheda',nome:'Solo Scheda Allenamento',prezzo:'€39',icon:'ti-barbell'},
                      {id:'completo',nome:'Piano Completo',prezzo:'€89',icon:'ti-star'},
                      {id:'abbonamento',nome:'Abbonamento Mensile',prezzo:'€129/mese',icon:'ti-refresh'},
                    ].map(p=>(
                      <div key={p.id} onClick={()=>setForm({...form,pacchetto:p.id})}
                        style={{background:'var(--card2)',border:`.5px solid ${form.pacchetto===p.id?'var(--gold)':'var(--bord)'}`,borderRadius:'10px',padding:'1rem',cursor:'pointer',transition:'all .2s',background:form.pacchetto===p.id?'var(--gold-dim)':'var(--card2)'}}>
                        <i className={`ti ${p.icon}`} style={{fontSize:'20px',color:'var(--gold)',display:'block',marginBottom:'6px'}}></i>
                        <div style={{fontSize:'12px',fontWeight:500,color:'var(--t1)',marginBottom:'3px'}}>{p.nome}</div>
                        <div style={{fontSize:'16px',fontWeight:600,color:'var(--gold)'}}>{p.prezzo}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{display:'flex',gap:'8px',justifyContent:'flex-end'}}>
                    <button className="btn-outline" onClick={()=>setStep(2)}><i className="ti ti-arrow-left"></i> Indietro</button>
                    <button className="btn-gold" onClick={()=>{setStep(4);salvaECompleta()}}>
                      <i className="ti ti-robot"></i> Genera Piano AI
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: GENERAZIONE */}
              {step===4 && (
                <div>
                  <div style={{background:'var(--gold-dim)',border:'.5px solid var(--gold-b)',borderRadius:'10px',padding:'1.5rem',textAlign:'center',marginBottom:'1rem'}}>
                    {generando ? (
                      <>
                        <div style={{width:'40px',height:'40px',borderRadius:'50%',border:'2px solid var(--gold-b)',borderTopColor:'var(--gold)',animation:'spin .8s linear infinite',margin:'0 auto 12px'}}></div>
                        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                        <div style={{fontFamily:'Cormorant Garamond,serif',fontSize:'16px',fontWeight:600,color:'var(--gold)',marginBottom:'4px'}}>AI sta generando il piano...</div>
                        <div style={{fontSize:'11px',color:'var(--t2)'}}>Calcolo TDEE, macros e scheda personalizzata</div>
                      </>
                    ) : pianoGenerato ? (
                      <>
                        <i className="ti ti-check-circle" style={{fontSize:'36px',color:'var(--green)',display:'block',marginBottom:'8px'}}></i>
                        <div style={{fontFamily:'Cormorant Garamond,serif',fontSize:'16px',fontWeight:600,color:'var(--gold)',marginBottom:'4px'}}>Piano generato! 🏆</div>
                        <div style={{fontSize:'11px',color:'var(--t2)'}}>Il paziente può accedere al suo piano nell'app</div>
                      </>
                    ) : (
                      <>
                        <i className="ti ti-alert-circle" style={{fontSize:'36px',color:'var(--red)',display:'block',marginBottom:'8px'}}></i>
                        <div style={{fontSize:'12px',color:'var(--t2)'}}>Errore nella generazione. Riprova.</div>
                      </>
                    )}
                  </div>
                  {pianoGenerato && (
                    <div style={{background:'var(--card2)',border:'.5px solid var(--bord)',borderRadius:'8px',padding:'1rem',maxHeight:'200px',overflowY:'auto',fontSize:'11px',color:'var(--t2)',lineHeight:1.6,whiteSpace:'pre-wrap'}}>
                      {pianoGenerato}
                    </div>
                  )}
                  {pianoGenerato && (
                    <div style={{display:'flex',justifyContent:'flex-end',marginTop:'1rem'}}>
                      <button className="btn-gold" onClick={()=>setShowModal(false)}>
                        <i className="ti ti-check"></i> Fatto
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
