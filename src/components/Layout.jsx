import { NavLink } from "react-router-dom"
import { useState } from "react"

const css = ".dark{--gold:#C9A84C;--gold-dim:rgba(201,168,76,0.12);--gold-b:rgba(201,168,76,0.25);--bg:#0A0A0A;--card:#111;--card2:#161616;--hover:#1A1A1A;--t1:#F0E6C8;--t2:#8A7A5A;--t3:#4A4030;--bord:rgba(201,168,76,0.15);--green:#7AB87A;--red:#B87A7A;}.light{--gold:#9A6F2A;--gold-dim:rgba(154,111,42,0.08);--gold-b:rgba(154,111,42,0.2);--bg:#F7F5F0;--card:#FFF;--card2:#F2EFE8;--hover:#EDE9DF;--t1:#1A1612;--t2:#6B5E45;--t3:#B0A080;--bord:rgba(154,111,42,0.15);--green:#3A7A3A;--red:#9A4A4A;}body{background:var(--bg);color:var(--t1);font-family:DM Sans,sans-serif;}.sidebar{width:220px;background:var(--card);border-right:.5px solid var(--bord);display:flex;flex-direction:column;padding:1.1rem 0;flex-shrink:0;overflow-y:auto;}.logo-area{padding:0 1.1rem 1rem;display:flex;align-items:center;gap:9px;border-bottom:.5px solid var(--bord);margin-bottom:.5rem;}.logo-text{font-size:13px;font-weight:600;color:var(--gold);letter-spacing:.05em;}.logo-sub{font-size:10px;color:var(--t2);}.nav-sec{font-size:9px;font-weight:600;color:var(--t3);text-transform:uppercase;letter-spacing:.1em;padding:0 1.1rem;margin:.6rem 0 .2rem;display:block;}.nav-link{display:flex;align-items:center;gap:9px;padding:7px 1.1rem;font-size:14px;font-weight:600;color:var(--t2);cursor:pointer;border-right:2px solid transparent;transition:all .15s;text-decoration:none;}.nav-link:hover{background:var(--hover);color:var(--t1);}.nav-link.active{background:var(--gold-dim);color:var(--gold);border-right-color:var(--gold);font-weight:500;}.nbadge{background:var(--gold-dim);color:var(--gold);font-size:10px;font-weight:500;border-radius:10px;padding:2px 7px;margin-left:auto;border:.5px solid var(--gold-b);}.main{flex:1;overflow-y:auto;background:var(--bg);padding:1.5rem;}.theme-wrap{margin-top:auto;padding:.9rem 1.1rem 0;border-top:.5px solid var(--bord);}.theme-label{font-size:9px;color:var(--t3);text-transform:uppercase;margin-bottom:6px;}.toggle-row{display:flex;background:var(--card2);border-radius:7px;padding:3px;border:.5px solid var(--bord);gap:3px;}.tbtn{flex:1;display:flex;align-items:center;justify-content:center;gap:4px;padding:5px 4px;border-radius:5px;font-size:10px;font-weight:500;cursor:pointer;border:none;background:transparent;color:var(--t3);transition:all .2s;}.tbtn.active{background:var(--card);color:var(--gold);border:.5px solid var(--gold-b);}.card{background:var(--card);border:.5px solid var(--bord);border-radius:12px;margin-bottom:1.25rem;overflow:hidden;}.card-hdr{display:flex;align-items:center;justify-content:space-between;padding:.9rem 1.1rem;border-bottom:.5px solid var(--bord);}.card-title{font-size:13px;font-weight:500;color:var(--t1);display:flex;align-items:center;gap:7px;}.btn-gold{background:var(--gold);color:#0A0A0A;border:none;border-radius:7px;padding:9px 16px;font-size:12px;font-weight:500;cursor:pointer;display:flex;align-items:center;gap:6px;}.btn-outline{background:transparent;border:.5px solid var(--bord);color:var(--t2);border-radius:7px;padding:9px 14px;font-size:12px;cursor:pointer;display:flex;align-items:center;gap:6px;}.pill{border-radius:20px;padding:2px 9px;font-size:10px;font-weight:500;display:inline-block;}.p-ok{background:rgba(122,184,122,.1);color:var(--green);border:.5px solid rgba(122,184,122,.25);}.p-warn{background:var(--gold-dim);color:var(--gold);border:.5px solid var(--gold-b);}.p-bad{background:rgba(184,122,122,.1);color:var(--red);border:.5px solid rgba(184,122,122,.2);}.p-new{background:rgba(100,140,200,.1);color:#7A9ABB;border:.5px solid rgba(100,140,200,.2);}.stat-card{background:var(--card);border:.5px solid var(--bord);border-radius:10px;padding:1rem;}.stat-icon{width:30px;height:30px;border-radius:7px;background:var(--gold-dim);border:.5px solid var(--gold-b);display:flex;align-items:center;justify-content:center;margin-bottom:8px;font-size:15px;color:var(--gold);}.stat-val{font-size:22px;font-weight:600;color:var(--gold);}.stat-label{font-size:11px;color:var(--t2);margin-bottom:3px;}.stat-delta{font-size:10px;margin-top:3px;}.up{color:var(--green);}.warn{color:var(--gold);}.down{color:var(--red);}.finput{width:100%;background:var(--card2);border:.5px solid var(--bord);border-radius:7px;padding:8px 10px;font-size:13px;color:var(--t1);outline:none;}.finput:focus{border-color:var(--gold);}.fselect{width:100%;background:var(--card2);border:.5px solid var(--bord);border-radius:7px;padding:8px 10px;font-size:12px;color:var(--t1);outline:none;cursor:pointer;}.flabel{font-size:11px;color:var(--t2);margin-bottom:4px;display:block;}.modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.8);display:flex;align-items:center;justify-content:center;z-index:100;}.modal{background:var(--card);border:.5px solid var(--gold-b);border-radius:14px;width:520px;max-height:85vh;overflow-y:auto;}.modal-hdr{display:flex;align-items:center;justify-content:space-between;padding:1rem 1.25rem;border-bottom:.5px solid var(--bord);position:sticky;top:0;background:var(--card);z-index:1;}.modal-title{font-size:17px;font-weight:600;color:var(--t1);display:flex;align-items:center;gap:8px;}"

export default function Layout({ children }) {
  const [tema, setTema] = useState("dark")
  return (
    <div className={tema} style={{display:"flex",height:"100vh"}}>
      <style>{css}</style>
      <div className="sidebar">
        <div style={{padding:"1rem",borderBottom:".5px solid var(--bord)"}}>
          <img src="/logo.jpg" style={{width:"110px",objectFit:"contain",filter:"brightness(0.8) saturate(0.85)"}}/>
        </div>
        <span className="nav-sec">Principale</span>
        <NavLink to="/dashboard" className="nav-link"><i className="ti ti-layout-dashboard"></i> Dashboard</NavLink>
        <NavLink to="/clienti" className="nav-link"><i className="ti ti-users"></i> Clienti</NavLink>
        <NavLink to="/allenamenti" className="nav-link"><i className="ti ti-barbell"></i> Allenamenti</NavLink>
        
        <span className="nav-sec">Online</span>
        <NavLink to="/online" className="nav-link"><i className="ti ti-world"></i> Pazienti Online <span className="nbadge">3</span></NavLink>
        <span className="nav-sec">AI Agent</span>
        <NavLink to="/alert" className="nav-link"><i className="ti ti-bell"></i> Alert <span className="nbadge">3</span></NavLink>
        <NavLink to="/autocheck" className="nav-link"><i className="ti ti-camera"></i> Autocheck <span className="nbadge">2</span></NavLink>
        <NavLink to="/report" className="nav-link"><i className="ti ti-file-analytics"></i> Report AI</NavLink>
        <span className="nav-sec">Gestione</span>
        <NavLink to="/cicli" className="nav-link"><i className="ti ti-calendar-event"></i> Cicli e sessioni</NavLink>
        <NavLink to="/shop" className="nav-link"><i className="ti ti-shopping-bag"></i> Shop</NavLink>
        <NavLink to="/impostazioni" className="nav-link"><i className="ti ti-settings"></i> Impostazioni</NavLink>
        <div className="theme-wrap">
          <div className="theme-label">Tema</div>
          <div className="toggle-row">
            <button className={"tbtn " + (tema==="dark"?"active":"")} onClick={()=>setTema("dark")}><i className="ti ti-moon"></i> Scuro</button>
            <button className={"tbtn " + (tema==="light"?"active":"")} onClick={()=>setTema("light")}><i className="ti ti-sun"></i> Chiaro</button>
          </div>
        </div>
      </div>
      <div className="main">{children}</div>
    </div>
  )
}
