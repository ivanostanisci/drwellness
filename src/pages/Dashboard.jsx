import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { supabase } from '../lib/supabase'

export default function Dashboard() {
  const [clienti, setClienti] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchClienti()
  }, [])

  async function fetchClienti() {
    const { data, error } = await supabase
      .from('clienti')
      .select('*')
      .eq('attivo', true)
      .order('created_at', { ascending: false })
    if (!error) setClienti(data)
    setLoading(false)
  }

  return (
    <Layout>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1.5rem'}}>
        <div>
          <div style={{fontFamily:'Cormorant Garamond,serif',fontSize:'22px',fontWeight:600,color:'var(--t1)'}}>Buongiorno 👋</div>
          <div style={{fontSize:'11px',color:'var(--t2)',marginTop:'2px'}}>
            {new Date().toLocaleDateString('it-IT',{weekday:'long',day:'numeric',month:'long',year:'numeric'})} · Dr. Wellness
          </div>
        </div>
        <button className="btn-gold" onClick={()=>window.location.href='/clienti'}>
          <i className="ti ti-plus"></i> Nuovo cliente
        </button>
      </div>

      {/* METRICHE */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'12px',marginBottom:'1.5rem'}}>
        <div className="stat-card">
          <div className="stat-icon"><i className="ti ti-users"></i></div>
          <div className="stat-label">Clienti attivi</div>
          <div className="stat-val">{clienti.length}</div>
          <div className="stat-delta up">↑ in crescita</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><i className="ti ti-barbell"></i></div>
          <div className="stat-label">Sessioni settimana</div>
          <div className="stat-val">9</div>
          <div className="stat-delta warn">3 da fare</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><i className="ti ti-robot"></i></div>
          <div className="stat-label">Alert AI attivi</div>
          <div className="stat-val">3</div>
          <div className="stat-delta down">1 critico</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><i className="ti ti-camera"></i></div>
          <div className="stat-label">Autocheck ricevuti</div>
          <div className="stat-val">2</div>
          <div className="stat-delta warn">da leggere</div>
        </div>
      </div>

      {/* TABELLA CLIENTI */}
      <div className="card">
        <div className="card-hdr">
          <span className="card-title">
            <i className="ti ti-users" style={{color:'var(--gold)',fontSize:'14px'}}></i>
            Clienti attivi
          </span>
          <span style={{fontSize:'11px',color:'var(--gold)',cursor:'pointer'}} onClick={()=>window.location.href='/clienti'}>
            Vedi tutti →
          </span>
        </div>

        {/* HEADER TABELLA */}
        <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1.3fr 1fr 60px',gap:'10px',padding:'7px 1.1rem',background:'var(--card2)',fontSize:'10px',color:'var(--t3)',fontWeight:600,textTransform:'uppercase',letterSpacing:'.06em'}}>
          <span>Cliente</span><span>Obiettivo</span><span>Ciclo</span><span>Stato</span><span></span>
        </div>

        {loading && (
          <div style={{padding:'2rem',textAlign:'center',fontSize:'12px',color:'var(--t2)'}}>
            <i className="ti ti-loader-2" style={{fontSize:'20px',display:'block',marginBottom:'8px'}}></i>
            Caricamento...
          </div>
        )}

        {!loading && clienti.length === 0 && (
          <div style={{padding:'2rem',textAlign:'center',fontSize:'12px',color:'var(--t2)'}}>
            <i className="ti ti-users" style={{fontSize:'28px',display:'block',marginBottom:'8px',color:'var(--t3)'}}></i>
            Nessun cliente ancora.<br/>
            <span style={{color:'var(--gold)',cursor:'pointer'}} onClick={()=>window.location.href='/clienti'}>Aggiungi il primo cliente →</span>
          </div>
        )}

        {clienti.map((c, i) => (
          <div key={c.id} style={{display:'grid',gridTemplateColumns:'2fr 1fr 1.3fr 1fr 60px',alignItems:'center',gap:'10px',padding:'9px 1.1rem',borderBottom:i<clienti.length-1?'.5px solid var(--bord)':'none',fontSize:'12px',cursor:'pointer',transition:'background .15s'}}
            onMouseEnter={e=>e.currentTarget.style.background='var(--hover)'}
            onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
            <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
              <div style={{width:'28px',height:'28px',borderRadius:'50%',background:'var(--gold-dim)',border:'.5px solid var(--gold-b)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'10px',fontWeight:600,color:'var(--gold)',flexShrink:0}}>
                {c.nome[0]}{c.cognome[0]}
              </div>
              <div>
                <div style={{fontWeight:500,color:'var(--t1)'}}>{c.nome} {c.cognome}</div>
                <div style={{fontSize:'10px',color:'var(--t2)'}}>{c.peso_iniziale} kg</div>
              </div>
            </div>
            <span style={{fontSize:'11px',color:'var(--t2)',textTransform:'capitalize'}}>{c.obiettivo || '—'}</span>
            <div>
              <div style={{background:'var(--card2)',borderRadius:'4px',height:'5px',marginBottom:'2px'}}>
                <div style={{height:'5px',borderRadius:'4px',background:'var(--gold)',width:'50%'}}></div>
              </div>
              <div style={{fontSize:'9px',color:'var(--t3)'}}>in corso</div>
            </div>
            <span className="pill p-ok">In target</span>
            <span style={{color:'var(--gold)',fontSize:'11px'}}>Apri →</span>
          </div>
        ))}
      </div>

      {/* SESSIONI OGGI */}
      <div className="card">
        <div className="card-hdr">
          <span className="card-title">
            <i className="ti ti-calendar" style={{color:'var(--gold)',fontSize:'14px'}}></i>
            Sessioni oggi
          </span>
          <span style={{fontSize:'10px',color:'var(--t2)'}}>
            {new Date().toLocaleDateString('it-IT',{weekday:'short',day:'numeric',month:'short'})}
          </span>
        </div>
        <div style={{padding:'1rem',fontSize:'12px',color:'var(--t2)',textAlign:'center'}}>
          Nessuna sessione programmata oggi
        </div>
      </div>
    </Layout>
  )
}
