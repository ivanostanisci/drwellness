import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { supabase } from '../lib/supabase'
export default function Clienti() {
  const navigate = useNavigate()
  const [clienti, setClienti] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    nome:'', cognome:'', email:'', telefono:'',
    peso_iniziale:'', altezza:'', obiettivo:'dimagrimento',
    calorie_target:'', note:''
  })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => { fetchClienti() }, [])

  async function fetchClienti() {
    const { data, error } = await supabase
      .from('clienti').select('*')
      .eq('attivo', true)
      .order('created_at', { ascending: false })
    if (!error) setClienti(data)
    setLoading(false)
  }

  async function salvaCliente(e) {
    e.preventDefault()
    setSaving(true)
    const codice = 'DRW' + Math.floor(1000 + Math.random() * 9000)
    const { error } = await supabase.from('clienti').insert([{...form, codice_accesso: codice}])
    if (error) {
      setMsg('Errore: ' + error.message)
    } else {
      setMsg('Cliente aggiunto! Codice accesso: ' + 'DRW' + Math.floor(1000 + Math.random() * 9000))
      setShowModal(false)
      setForm({ nome:'', cognome:'', email:'', telefono:'', peso_iniziale:'', altezza:'', obiettivo:'dimagrimento', calorie_target:'', note:'' })
      fetchClienti()
    }
    setSaving(false)
    setTimeout(() => setMsg(''), 3000)
  }

  return (
    <Layout>
      <button onClick={()=>window.history.back()} style={{background:"transparent",border:".5px solid var(--bord)",color:"var(--t2)",borderRadius:"7px",padding:"7px 14px",fontSize:"12px",cursor:"pointer",display:"inline-flex",alignItems:"center",gap:"5px",marginBottom:"1rem"}}><i className="ti ti-arrow-left"></i> Dashboard</button>
      {/* TOPBAR */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1.5rem'}}>
        <div>
          <div style={{fontFamily:'Cormorant Garamond,serif',fontSize:'22px',fontWeight:600,color:'var(--t1)'}}>Clienti</div>
          <div style={{fontSize:'11px',color:'var(--t2)',marginTop:'2px'}}>{clienti.length} clienti attivi</div>
        </div>
        <button className="btn-gold" onClick={()=>setShowModal(true)}>
          <i className="ti ti-plus"></i> Nuovo cliente
        </button>
      </div>

      {/* NOTIFICA */}
      {msg && (
        <div style={{background:'var(--gold-dim)',border:'.5px solid var(--gold-b)',borderRadius:'8px',padding:'10px 14px',fontSize:'12px',color:'var(--gold)',marginBottom:'1rem',display:'flex',alignItems:'center',gap:'8px'}}>
          <i className="ti ti-check-circle"></i> {msg}
        </div>
      )}

      {/* TABELLA */}
      <div className="card">
        <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr 70px',gap:'10px',padding:'7px 1.1rem',background:'var(--card2)',fontSize:'10px',color:'var(--t3)',fontWeight:600,textTransform:'uppercase',letterSpacing:'.06em'}}>
          <span>Cliente</span><span>Contatto</span><span>Peso</span><span>Obiettivo</span><span>Calorie</span><span></span>
        </div>

        {loading && (
          <div style={{padding:'2rem',textAlign:'center',fontSize:'12px',color:'var(--t2)'}}>
            Caricamento...
          </div>
        )}

        {!loading && clienti.length === 0 && (
          <div style={{padding:'3rem',textAlign:'center'}}>
            <i className="ti ti-users" style={{fontSize:'36px',display:'block',marginBottom:'12px',color:'var(--t3)'}}></i>
            <div style={{fontSize:'13px',color:'var(--t2)',marginBottom:'8px'}}>Nessun cliente ancora</div>
            <button className="btn-gold" onClick={()=>setShowModal(true)} style={{margin:'0 auto'}}>
              <i className="ti ti-plus"></i> Aggiungi il primo cliente
            </button>
          </div>
        )}

        {clienti.map((c, i) => (
          <div key={c.id}
            style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr 70px',alignItems:'center',gap:'10px',padding:'10px 1.1rem',borderBottom:i<clienti.length-1?'.5px solid var(--bord)':'none',fontSize:'12px',cursor:'pointer',transition:'background .15s'}}
            onMouseEnter={e=>e.currentTarget.style.background='var(--hover)'}
            onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
            <div style={{display:'flex',alignItems:'center',gap:'9px'}}>
              <div style={{width:'32px',height:'32px',borderRadius:'50%',background:'var(--gold-dim)',border:'.5px solid var(--gold-b)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'11px',fontWeight:600,color:'var(--gold)',flexShrink:0}}>
                {c.nome[0]}{c.cognome[0]}
              </div>
              <div>
                <div style={{fontWeight:500,color:'var(--t1)'}}>{c.nome} {c.cognome}</div>
                <div style={{fontSize:'10px',color:'var(--t2)'}}>{c.email}</div>
              </div>
            </div>
            <span style={{fontSize:'11px',color:'var(--t2)'}}>{c.telefono || '—'}</span>
            <span style={{fontSize:'12px',color:'var(--t1)'}}>{c.peso_iniziale ? c.peso_iniziale+' kg' : '—'}</span>
            <span style={{fontSize:'11px',color:'var(--t2)',textTransform:'capitalize'}}>{c.obiettivo || '—'}</span>
            <span style={{fontSize:'11px',color:'var(--t2)'}}>{c.calorie_target ? c.calorie_target+' kcal' : '—'}</span>
            <span style={{color:'var(--gold)',fontSize:'11px',cursor:'pointer'}} onClick={()=>navigate('/clienti/'+c.id)}>Apri →</span>
                <span style={{color:'var(--t3)',fontSize:'11px',cursor:'pointer',marginLeft:'8px'}} onClick={async()=>{if(window.confirm('Eliminare '+c.nome+' '+c.cognome+'?')){await supabase.from('clienti').delete().eq('id',c.id);fetchClienti()}}}>Elimina</span>
          </div>
        ))}
      </div>

      {/* MODALE NUOVO CLIENTE */}
      {showModal && (
        <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setShowModal(false)}>
          <div className="modal">
            <div className="modal-hdr">
              <div className="modal-title">
                <i className="ti ti-user-plus" style={{color:'var(--gold)',fontSize:'16px'}}></i>
                Nuovo Cliente
              </div>
              <button onClick={()=>setShowModal(false)} style={{background:'transparent',border:'none',color:'var(--t2)',fontSize:'20px',cursor:'pointer'}}>
                <i className="ti ti-x"></i>
              </button>
            </div>
            <form onSubmit={salvaCliente} style={{padding:'1.25rem'}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'10px'}}>
                <div>
                  <label className="flabel">Nome *</label>
                  <input className="finput" required value={form.nome} onChange={e=>setForm({...form,nome:e.target.value})} placeholder="Mario" />
                </div>
                <div>
                  <label className="flabel">Cognome *</label>
                  <input className="finput" required value={form.cognome} onChange={e=>setForm({...form,cognome:e.target.value})} placeholder="Rossi" />
                </div>
              </div>
              <div style={{marginBottom:'10px'}}>
                <label className="flabel">Email *</label>
                <input className="finput" type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="mario@email.com" />
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'10px'}}>
                <div>
                  <label className="flabel">Telefono</label>
                  <input className="finput" value={form.telefono} onChange={e=>setForm({...form,telefono:e.target.value})} placeholder="+39 333 1234567" />
                </div>
                <div>
                  <label className="flabel">Obiettivo</label>
                  <select className="fselect" value={form.obiettivo} onChange={e=>setForm({...form,obiettivo:e.target.value})}>
                    <option value="dimagrimento">Dimagrimento</option>
                    <option value="massa">Massa muscolare</option>
                    <option value="mantenimento">Mantenimento</option>
                  </select>
                </div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'10px',marginBottom:'10px'}}>
                <div>
                  <label className="flabel">Peso iniziale (kg)</label>
                  <input className="finput" type="number" value={form.peso_iniziale} onChange={e=>setForm({...form,peso_iniziale:e.target.value})} placeholder="75" />
                </div>
                <div>
                  <label className="flabel">Altezza (cm)</label>
                  <input className="finput" type="number" value={form.altezza} onChange={e=>setForm({...form,altezza:e.target.value})} placeholder="175" />
                </div>
                <div>
                  <label className="flabel">Calorie target</label>
                  <input className="finput" type="number" value={form.calorie_target} onChange={e=>setForm({...form,calorie_target:e.target.value})} placeholder="2000" />
                </div>
              </div>
              <div style={{marginBottom:'1.25rem'}}>
                <label className="flabel">Note</label>
                <textarea className="finput" value={form.note} onChange={e=>setForm({...form,note:e.target.value})} placeholder="Note sul cliente..." style={{height:'70px',resize:'none'}} />
              </div>
              <div style={{display:'flex',gap:'8px',justifyContent:'flex-end'}}>
                <button type="button" className="btn-outline" onClick={()=>setShowModal(false)}>Annulla</button>
                <button type="submit" className="btn-gold" disabled={saving}>
                  {saving ? <i className="ti ti-loader-2"></i> : <i className="ti ti-check"></i>}
                  {saving ? 'Salvataggio...' : 'Salva cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}
