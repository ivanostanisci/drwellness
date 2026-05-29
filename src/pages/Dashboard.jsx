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
