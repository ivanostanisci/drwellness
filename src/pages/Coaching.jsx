import { useState } from 'react'

function FormCoaching() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    nome:"", cognome:"", email:"", telefono:"", 
    eta:"", sesso:"M", peso:"", altezza:"",
    obiettivo:"Dimagrimento e definizione", attivita:"moderato",
    luogo:"palestra", intolleranze:"", patologie:"", note:""
  })
  const [loading, setLoading] = useState(false)
  const [foto, setFoto] = useState({ fronte: null, retro: null, sx: null, dx: null })
  const fotoRef = { fronte: null, retro: null, sx: null, dx: null }
  const [done, setDone] = useState(false)
  const ff = (k,v) => setForm(prev=>({...prev,[k]:v}))

  async function invia() {
    setLoading(true)
    try {
      // Generiamo piano e scheda con AI
      const supabaseUrl = "https://pjojacqzpujdesxqqcnf.supabase.co"
      const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqb2phY3F6cHVqZGVzeHFxY25mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3Mjc2MjQsImV4cCI6MjA5NTMwMzYyNH0.cLygQqHlUtCi4esA0a_XcNRxOUL5Z5p5RdB60OmcZ8s"
      
      // Creiamo cliente nel DB
      const bmi = (parseFloat(form.peso) / Math.pow(parseFloat(form.altezza)/100, 2)).toFixed(1)
      const res = await fetch(supabaseUrl + "/rest/v1/clienti", {
        method: "POST",
        headers: {"Content-Type":"application/json","apikey":supabaseKey,"Authorization":"Bearer "+supabaseKey,"Prefer":"return=representation"},
        body: JSON.stringify({
          nome: form.nome, cognome: form.cognome, email: form.email,
          telefono: form.telefono, peso_iniziale: form.peso, altezza: form.altezza,
          obiettivo: form.obiettivo, tipo: "online", attivo: true,
          anamnesi: { attivita: form.attivita, intolleranze: form.intolleranze, patologie: form.patologie },
          antropometrica: { peso: form.peso, altezza: form.altezza, eta: form.eta, sesso: form.sesso, bmi }
        })
      })
      const data = await res.json()
      const cliente = Array.isArray(data) ? data[0] : data
      
      // Genera codice accesso
      const codice = "DRW" + Math.floor(1000 + Math.random() * 9000)
      await fetch(supabaseUrl + "/rest/v1/clienti?id=eq." + cliente.id, {
        method: "PATCH",
        headers: {"Content-Type":"application/json","apikey":supabaseKey,"Authorization":"Bearer "+supabaseKey},
        body: JSON.stringify({codice_accesso: codice})
      })

      // Genera piano
      const promptAlim = "Sei il professionista del settore Dr. Wellness. Genera piano alimentare 7 giorni per: " + form.nome + " " + form.cognome + ", Peso: " + form.peso + "kg, Altezza: " + form.altezza + "cm, Età: " + form.eta + ", Sesso: " + form.sesso + ", Obiettivo: " + form.obiettivo + ", Attività: " + form.attivita + ", Intolleranze: " + (form.intolleranze||"nessuna") + ", Patologie: " + (form.patologie||"nessuna") + ". Includi TDEE, macros e 7 giorni completi con grammature."
      const resAlim = await fetch("https://pjojacqzpujdesxqqcnf.supabase.co/functions/v1/genera-piano", {
        method:"POST",
        headers:{"Content-Type":"application/json","Authorization":"Bearer "+supabaseKey},
        body: JSON.stringify({model:"claude-sonnet-4-5",max_tokens:4000,messages:[{role:"user",content:promptAlim}]})
      })
      const dataAlim = await resAlim.json()
      const piano = dataAlim.content?.[0]?.text || ""

      // Genera scheda
      const promptAllen = "Sei il Personal Trainer Dr. Wellness. Crea scheda allenamento per: " + form.nome + ", Obiettivo: " + form.obiettivo + ", Luogo: " + form.luogo + ", Livello: intermedio, 3 giorni a settimana. Dettagliata con esercizi, serie, ripetizioni e recupero."
      const resAllen = await fetch("https://pjojacqzpujdesxqqcnf.supabase.co/functions/v1/genera-piano", {
        method:"POST",
        headers:{"Content-Type":"application/json","Authorization":"Bearer "+supabaseKey},
        body: JSON.stringify({model:"claude-sonnet-4-5",max_tokens:3000,messages:[{role:"user",content:promptAllen}]})
      })
      const dataAllen = await resAllen.json()
      const scheda = dataAllen.content?.[0]?.text || ""

      // Salviamo piani
      await fetch(supabaseUrl + "/rest/v1/clienti?id=eq." + cliente.id, {
        method:"PATCH",
        headers:{"Content-Type":"application/json","apikey":supabaseKey,"Authorization":"Bearer "+supabaseKey},
        body: JSON.stringify({piano_alimentare: piano, scheda_allenamento: scheda})
      })

      setDone({codice, email: form.email})
    } catch(e) { alert("Errore: " + e.message) }
    setLoading(false)
  }

  if (done) return (
    <div style={{textAlign:"center",padding:"2rem 0"}}>
      <div style={{fontSize:"48px",marginBottom:"16px"}}>🏆</div>
      <div style={{fontSize:"20px",fontWeight:700,color:"#F0E6C8",marginBottom:"8px"}}>Piano pronto!</div>
      <div style={{fontSize:"15px",fontWeight:600,color:"#F0E6C8",marginBottom:"8px"}}>Ciao {done.nome}!</div>
      <div style={{fontSize:"13px",color:"#8A7A5A",marginBottom:"24px",lineHeight:1.8}}>
        La tua richiesta è stata ricevuta con successo!<br/>
        Il Dr. Wellness la elaborerà e ti contatterà entro <strong style={{color:"#C9A84C"}}>24 ore</strong> con il tuo piano personalizzato e le istruzioni per il pagamento.
      </div>
      <div style={{background:"rgba(201,168,76,0.08)",border:"1px solid rgba(201,168,76,0.2)",borderRadius:"10px",padding:"16px",marginBottom:"24px",fontSize:"12px",color:"#8A7A5A",lineHeight:1.7}}>
        📧 Controlla la tua email: <strong style={{color:"#F0E6C8"}}>{done.email}</strong><br/>
        📱 Oppure scrivici su WhatsApp per info immediate
      </div>
      <a href="https://wa.me/393279422703?text=Ciao!%20Ho%20appena%20inviato%20la%20mia%20richiesta%20di%20coaching%20online" target="_blank" style={{display:"inline-flex",alignItems:"center",gap:"8px",background:"#25D366",color:"#fff",border:"none",borderRadius:"8px",padding:"12px 24px",fontSize:"13px",fontWeight:700,textDecoration:"none"}}>
        💬 Scrivici su WhatsApp
      </a>
    </div>
  )

  const input = (label, key, type="text", placeholder="") => (
    <div style={{marginBottom:"14px"}}>
      <label style={{fontSize:"11px",color:"#8A7A5A",marginBottom:"5px",display:"block",textTransform:"uppercase",letterSpacing:"0.08em"}}>{label}</label>
      <input type={type} value={form[key]} onChange={e=>ff(key,e.target.value)} placeholder={placeholder}
        style={{width:"100%",background:"#161616",border:"1px solid rgba(201,168,76,0.15)",borderRadius:"7px",padding:"10px 12px",fontSize:"13px",color:"#F0E6C8",outline:"none",fontFamily:"DM Sans,sans-serif"}} />
    </div>
  )

  const select = (label, key, opts) => (
    <div style={{marginBottom:"14px"}}>
      <label style={{fontSize:"11px",color:"#8A7A5A",marginBottom:"5px",display:"block",textTransform:"uppercase",letterSpacing:"0.08em"}}>{label}</label>
      <select value={form[key]} onChange={e=>ff(key,e.target.value)}
        style={{width:"100%",background:"#161616",border:"1px solid rgba(201,168,76,0.15)",borderRadius:"7px",padding:"10px 12px",fontSize:"13px",color:"#F0E6C8",outline:"none",fontFamily:"DM Sans,sans-serif",cursor:"pointer"}}>
        {opts.map(([v,l])=><option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  )

  return (
    <div>
      {/* Steps */}
      <div style={{display:"flex",gap:"4px",marginBottom:"24px"}}>
        {["Dati personali","Obiettivi","Salute","Foto"].map((s,i)=>(
          <div key={i} style={{flex:1,textAlign:"center"}}>
            <div style={{height:"3px",borderRadius:"2px",background:step>i?"#C9A84C":"rgba(201,168,76,0.2)",marginBottom:"6px"}}></div>
            <div style={{fontSize:"10px",color:step===i+1?"#C9A84C":"#4A4030"}}>{s}</div>
          </div>
        ))}
      </div>

      {step === 1 && (
        <div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 14px"}}>
            {input("Nome","nome","text","Mario")}
            {input("Cognome","cognome","text","Rossi")}
          </div>
          {input("Email","email","email","mario@email.com")}
          {input("Telefono","telefono","tel","+39 333 1234567")}
        </div>
      )}
      {step === 2 && (
        <div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 14px"}}>
            {input("Età","eta","number","30")}
            {select("Sesso","sesso",[["M","Maschio"],["F","Femmina"]])}
            {input("Peso (kg)","peso","number","75")}
            {input("Altezza (cm)","altezza","number","175")}
          </div>
          {select("Obiettivo","obiettivo",[
            ["Dimagrimento e definizione","Dimagrimento e definizione"],
            ["Aumento massa muscolare","Aumento massa muscolare"],
            ["Mantenimento peso forma","Mantenimento peso forma"],
            ["Ricomposizione corporea","Ricomposizione corporea"],
            ["Benessere generale e salute","Benessere generale e salute"],
          ])}
          {select("Livello attività fisica","attivita",[
            ["sedentario","Sedentario — lavoro d'ufficio"],
            ["leggero","Leggero — 1-2 volte a settimana"],
            ["moderato","Moderato — 3-4 volte a settimana"],
            ["intenso","Intenso — 5+ volte a settimana"],
          ])}
          {select("Dove ti alleni","luogo",[
            ["palestra","Palestra"],
            ["casa","Casa"],
            ["aperto","All aperto"],
          ])}
        </div>
      )}
      {step === 3 && (
        <div>
          <div style={{marginBottom:"14px"}}>
            <label style={{fontSize:"11px",color:"#8A7A5A",marginBottom:"5px",display:"block",textTransform:"uppercase",letterSpacing:"0.08em"}}>Intolleranze alimentari</label>
            <input value={form.intolleranze} onChange={e=>ff("intolleranze",e.target.value)} placeholder="Es. lattosio, glutine, nichel..."
              style={{width:"100%",background:"#161616",border:"1px solid rgba(201,168,76,0.15)",borderRadius:"7px",padding:"10px 12px",fontSize:"13px",color:"#F0E6C8",outline:"none",fontFamily:"DM Sans,sans-serif"}} />
          </div>
          <div style={{marginBottom:"14px"}}>
            <label style={{fontSize:"11px",color:"#8A7A5A",marginBottom:"5px",display:"block",textTransform:"uppercase",letterSpacing:"0.08em"}}>Patologie o limitazioni</label>
            <input value={form.patologie} onChange={e=>ff("patologie",e.target.value)} placeholder="Es. diabete, ipertensione, ernia..."
              style={{width:"100%",background:"#161616",border:"1px solid rgba(201,168,76,0.15)",borderRadius:"7px",padding:"10px 12px",fontSize:"13px",color:"#F0E6C8",outline:"none",fontFamily:"DM Sans,sans-serif"}} />
          </div>
          <div style={{marginBottom:"14px"}}>
            <label style={{fontSize:"11px",color:"#8A7A5A",marginBottom:"5px",display:"block",textTransform:"uppercase",letterSpacing:"0.08em"}}>Note aggiuntive</label>
            <textarea value={form.note} onChange={e=>ff("note",e.target.value)} placeholder="Qualcosa che vuoi dirci..."
              style={{width:"100%",background:"#161616",border:"1px solid rgba(201,168,76,0.15)",borderRadius:"7px",padding:"10px 12px",fontSize:"13px",color:"#F0E6C8",outline:"none",fontFamily:"DM Sans,sans-serif",height:"80px",resize:"none"}} />
          </div>
        </div>
      )}

      {/* Prezzo */}
      {step === 4 && (
        <div>
          <div style={{fontSize:"13px",fontWeight:600,color:"#F0E6C8",marginBottom:"4px"}}>Foto del corpo</div>
          <div style={{fontSize:"12px",color:"#8A7A5A",marginBottom:"16px",lineHeight:1.6}}>
            Le foto ci permettono di personalizzare ancora di più il tuo piano. Scatta o carica 4 foto in costume: fronte, retro e lati. Saranno visibili solo al tuo coach.
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"16px"}}>
            {[["fronte","Fronte"],["retro","Retro"],["sx","Lato Sinistro"],["dx","Lato Destro"]].map(([key,label])=>(
              <div key={key} style={{background:"#161616",border:"1px solid rgba(201,168,76,0.15)",borderRadius:"10px",overflow:"hidden"}}>
                <div style={{height:"120px",background:"#0A0A0A",display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
                  {foto[key] 
                    ? <img src={foto[key]} style={{width:"100%",height:"100%",objectFit:"cover"}} alt={label} />
                    : <span style={{fontSize:"32px"}}>📷</span>
                  }
                  {foto[key] && <div style={{position:"absolute",top:"6px",right:"6px",background:"#25D366",borderRadius:"50%",width:"20px",height:"20px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"11px",color:"white"}}>✓</div>}
                </div>
                <div style={{padding:"8px"}}>
                  <div style={{fontSize:"11px",color:foto[key]?"#25D366":"#8A7A5A",marginBottom:"6px",fontWeight:500}}>{label}</div>
                  <label style={{display:"block",background:"rgba(201,168,76,0.1)",border:".5px solid rgba(201,168,76,0.3)",color:"#C9A84C",borderRadius:"6px",padding:"5px",fontSize:"10px",fontWeight:500,cursor:"pointer",textAlign:"center"}}>
                    📁 Carica foto
                    <input type="file" accept="image/*" style={{display:"none"}} onChange={e=>{
                      const file = e.target.files[0]
                      if(!file) return
                      const reader = new FileReader()
                      reader.onload = ev => setFoto(prev=>({...prev,[key]:ev.target.result}))
                      reader.readAsDataURL(file)
                    }} />
                  </label>
                </div>
              </div>
            ))}
          </div>
          <div style={{fontSize:"11px",color:"#4A4030",textAlign:"center"}}>{Object.values(foto).filter(Boolean).length}/4 foto caricate — puoi procedere anche senza</div>
        </div>
      )}

      {step === 4 && (
        <div style={{background:"rgba(201,168,76,0.08)",border:"1px solid rgba(201,168,76,0.2)",borderRadius:"10px",padding:"14px",marginBottom:"16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:"12px",color:"#8A7A5A"}}>Piano completo personalizzato</div>
            <div style={{fontSize:"11px",color:"#4A4030",marginTop:"2px"}}>Piano alimentare + scheda allenamento + area cliente</div>
          </div>
          <div style={{fontSize:"22px",fontWeight:900,color:"#C9A84C"}}>€39,90</div>
        </div>
      )}

      <div style={{display:"flex",gap:"8px",justifyContent:"space-between",marginTop:"8px"}}>
        {step > 1 && (
          <button onClick={()=>setStep(step-1)} style={{background:"transparent",border:"1px solid rgba(201,168,76,0.2)",color:"#8A7A5A",borderRadius:"7px",padding:"10px 20px",fontSize:"13px",cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>
            ← Indietro
          </button>
        )}
        {step < 4 ? (
          <button onClick={()=>setStep(step+1)} disabled={step===1&&(!form.nome||!form.email)} className="btn-gold" style={{marginLeft:"auto"}}>
            Avanti →
          </button>
        ) : (
          <button onClick={invia} disabled={loading||!form.email} className="btn-gold" style={{marginLeft:"auto"}}>
            {loading ? "Invio richiesta..." : "Richiedi il tuo piano — €39,90 →"}
          </button>
        )}
      </div>
    </div>
  )
}

export default function Coaching() {
  return (
    <div style={{minHeight:"100vh",background:"#0A0A0A",fontFamily:"DM Sans,sans-serif",color:"#F0E6C8"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Cormorant+Garamond:wght@400;600;700&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        .btn-gold { background:#C9A84C; color:#0A0A0A; border:none; border-radius:8px; padding:14px 32px; font-size:14px; font-weight:700; cursor:pointer; font-family:DM Sans,sans-serif; letter-spacing:0.05em; transition:all .2s; }
        .btn-gold:hover { background:#E8C46A; transform:translateY(-1px); }
        .btn-wa { background:#25D366; color:#fff; border:none; border-radius:8px; padding:14px 32px; font-size:14px; font-weight:700; cursor:pointer; font-family:DM Sans,sans-serif; display:inline-flex; align-items:center; gap:8px; text-decoration:none; }
      `}</style>

      <div style={{padding:"12px 20px",background:"#111",borderBottom:"1px solid rgba(201,168,76,0.1)"}}>
        <a href="/dashboard" style={{color:"#C9A84C",fontSize:"13px",fontWeight:500,textDecoration:"none",display:"inline-flex",alignItems:"center",gap:"6px"}}>
          ← Torna alla dashboard
        </a>
      </div>
      {/* HERO */}
      <div style={{background:"linear-gradient(180deg,#111 0%,#0A0A0A 100%)",padding:"60px 20px 80px",textAlign:"center",borderBottom:"1px solid rgba(201,168,76,0.2)"}}>
        <div style={{fontSize:"13px",color:"#C9A84C",letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:"16px"}}>DR. WELLNESS — COACHING ONLINE</div>
        <div style={{fontFamily:"Cormorant Garamond,serif",fontSize:"clamp(32px,6vw,56px)",fontWeight:700,color:"#F0E6C8",lineHeight:1.1,marginBottom:"16px"}}>
          Il tuo piano personalizzato<br/><span style={{color:"#C9A84C"}}>in pochi minuti</span>
        </div>
        <div style={{fontSize:"16px",color:"#8A7A5A",maxWidth:"500px",margin:"0 auto 32px",lineHeight:1.7}}>
          Ogni piano è studiato su misura per te: la mia esperienza come Personal Trainer e Professionista del Benessere, per darti risultati reali in meno tempo.
        </div>
        <div style={{display:"inline-flex",alignItems:"center",gap:"12px",background:"rgba(201,168,76,0.1)",border:"1px solid rgba(201,168,76,0.3)",borderRadius:"12px",padding:"12px 24px",marginBottom:"32px"}}>
          <div style={{fontSize:"32px",fontWeight:900,color:"#C9A84C"}}>€39,90</div>
          <div style={{fontSize:"13px",color:"#8A7A5A",textAlign:"left"}}>Piano completo<br/>una tantum</div>
        </div>
        <div style={{display:"flex",gap:"12px",justifyContent:"center",flexWrap:"wrap"}}>
          <button className="btn-gold" onClick={()=>document.getElementById("form").scrollIntoView({behavior:"smooth"})}>
            Inizia ora →
          </button>
          <a href="https://wa.me/393279422703?text=Ciao%20Dr.%20Wellness!%20Vorrei%20info%20sul%20coaching%20online" target="_blank" className="btn-wa">
            💬 WhatsApp
          </a>
        </div>
      </div>

      {/* COSA INCLUDE */}
      <div style={{padding:"60px 20px",maxWidth:"800px",margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:"40px"}}>
          <div style={{fontSize:"11px",color:"#C9A84C",letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:"8px"}}>Cosa ricevi</div>
          <div style={{fontFamily:"Cormorant Garamond,serif",fontSize:"32px",fontWeight:700,color:"#F0E6C8"}}>Tutto quello che ti serve</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:"16px"}}>
          {[
            {icon:"🍽️",titolo:"Piano Alimentare 7 giorni",desc:"Calcolato sul tuo TDEE, obiettivo e intolleranze alimentari"},
            {icon:"🏋️",titolo:"Scheda Allenamento",desc:"Personalizzata per il tuo livello, luogo e obiettivo sportivo"},
            {icon:"📊",titolo:"Calcolo TDEE e Macros",desc:"Calorie e macronutrienti precisi per raggiungere il tuo obiettivo"},
            {icon:"📱",titolo:"Area Cliente Personale",desc:"Accedi sempre ai tuoi piani, invia autocheck, monitora i progressi"},
          ].map((item,i) => (
            <div key={i} style={{background:"#111",border:"1px solid rgba(201,168,76,0.15)",borderRadius:"12px",padding:"20px"}}>
              <div style={{fontSize:"32px",marginBottom:"10px"}}>{item.icon}</div>
              <div style={{fontSize:"14px",fontWeight:600,color:"#F0E6C8",marginBottom:"6px"}}>{item.titolo}</div>
              <div style={{fontSize:"12px",color:"#8A7A5A",lineHeight:1.6}}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* COME FUNZIONA */}
      <div style={{background:"#111",padding:"60px 20px",borderTop:"1px solid rgba(201,168,76,0.1)",borderBottom:"1px solid rgba(201,168,76,0.1)"}}>
        <div style={{maxWidth:"700px",margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:"40px"}}>
            <div style={{fontSize:"11px",color:"#C9A84C",letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:"8px"}}>Come funziona</div>
            <div style={{fontFamily:"Cormorant Garamond,serif",fontSize:"32px",fontWeight:700,color:"#F0E6C8"}}>3 passi semplici</div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:"24px"}}>
            {[
              {num:"01",titolo:"Compila il form",desc:"Inserisci i tuoi dati: obiettivo, peso, altezza, età, stile di vita, intolleranze alimentari"},
              {num:"02",titolo:"L'AI elabora il tuo piano",desc:"Il nostro sistema genera un piano alimentare e una scheda allenamento completamente personalizzati"},
              {num:"03",titolo:"Ricevi e inizia",desc:"Accedi alla tua area personale, scarica i PDF e inizia il tuo percorso verso il cambiamento"},
            ].map((step,i) => (
              <div key={i} style={{display:"flex",gap:"20px",alignItems:"flex-start"}}>
                <div style={{width:"48px",height:"48px",borderRadius:"50%",background:"rgba(201,168,76,0.12)",border:"1px solid rgba(201,168,76,0.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"13px",fontWeight:700,color:"#C9A84C",flexShrink:0}}>
                  {step.num}
                </div>
                <div>
                  <div style={{fontSize:"15px",fontWeight:600,color:"#F0E6C8",marginBottom:"4px"}}>{step.titolo}</div>
                  <div style={{fontSize:"13px",color:"#8A7A5A",lineHeight:1.6}}>{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FORM */}
      <div id="form" style={{padding:"60px 20px",maxWidth:"600px",margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:"40px"}}>
          <div style={{fontSize:"11px",color:"#C9A84C",letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:"8px"}}>Inizia ora</div>
          <div style={{fontFamily:"Cormorant Garamond,serif",fontSize:"32px",fontWeight:700,color:"#F0E6C8",marginBottom:"8px"}}>Crea il tuo piano</div>
          <div style={{fontSize:"13px",color:"#8A7A5A"}}>Compila i dati e ricevi il tuo piano personalizzato</div>
        </div>
        <div style={{background:"#111",border:"1px solid rgba(201,168,76,0.2)",borderRadius:"16px",padding:"32px"}}>
          <FormCoaching />
        </div>
      </div>

      {/* FOOTER */}
      <div style={{background:"#0A0A0A",borderTop:"1px solid rgba(201,168,76,0.1)",padding:"24px 20px",textAlign:"center"}}>
        <div style={{fontSize:"16px",fontWeight:700,color:"#C9A84C",letterSpacing:"0.1em",marginBottom:"4px"}}>DR. WELLNESS</div>
        <div style={{fontSize:"11px",color:"#4A4030"}}>Personal Trainer & Professionista del Benessere · P.IVA in possesso</div>
        <div style={{marginTop:"12px",display:"flex",gap:"12px",justifyContent:"center"}}>
          <a href="https://wa.me/393279422703" target="_blank" style={{fontSize:"12px",color:"#25D366",textDecoration:"none"}}>💬 WhatsApp</a>
        </div>
      </div>
    </div>
  )
}