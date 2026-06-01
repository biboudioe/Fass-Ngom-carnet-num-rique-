import { useState, useEffect } from "react";

// ─── SUPABASE ─────────────────────────────────────────────────────────────────
const SUPABASE_URL = "https://ftughnsobiwvytgbothh.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0dWdobnNvYml3dnl0Z2JvdGhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyOTQ4MTcsImV4cCI6MjA5NTg3MDgxN30.yNTciBheIMIp8e5eX8gSi7uXigm3ZhbYAqPhaVDM0TU";
const H = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json" };

const db = {
  async getAll() {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/enfants?order=created_at.desc`, { headers: H });
    return r.ok ? r.json() : [];
  },
  async insert(e) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/enfants`, { method: "POST", headers: { ...H, Prefer: "return=representation" }, body: JSON.stringify(toRow(e)) });
    return r.ok;
  },
  async update(e) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/enfants?id=eq.${e.id}`, { method: "PATCH", headers: H, body: JSON.stringify(toRow(e)) });
    return r.ok;
  }
};

const toRow = (e) => ({
  id: e.id, nom: e.nom, date_naissance: e.dateNaissance, sexe: e.sexe,
  numero_carnet: e.numeroCarnet, lieu_naissance: e.lieuNaissance,
  mere: e.mere, pere: e.pere, urgence: e.urgence, medical: e.medical,
  naissance: e.naissance, mesures: e.mesures, vaccins: e.vaccins,
  consultations: e.consultations, hospitalisations: e.hospitalisations,
  medicaments: e.medicaments, developpement: e.developpement, examens: e.examens
});

const fromRow = (r) => ({
  id: r.id, nom: r.nom, dateNaissance: r.date_naissance, sexe: r.sexe,
  numeroCarnet: r.numero_carnet || "", lieuNaissance: r.lieu_naissance || "",
  mere: r.mere || {}, pere: r.pere || {}, urgence: r.urgence || {},
  medical: r.medical || { groupeSanguin: "Inconnu", allergies: [], maladiesChroniques: [], antecedentsFamiliaux: [], notes: "" },
  naissance: r.naissance || { terme: "", poidsNaissance: "", tailleNaissance: "", pcNaissance: "", apgar1: "", apgar5: "", accouchement: "Normal", maternitee: "" },
  mesures: r.mesures || [], vaccins: r.vaccins || [],
  consultations: r.consultations || [], hospitalisations: r.hospitalisations || [],
  medicaments: r.medicaments || [], developpement: r.developpement || [],
  examens: r.examens || []
});

// ─── CONSTANTES ───────────────────────────────────────────────────────────────
const ADMIN = { username: "dispensaire", password: "fassngom2025" };
const VACCINS = ["BCG","Polio OPV 0","Polio OPV 1","Polio OPV 2","Polio OPV 3","DTP-HepB 1","DTP-HepB 2","DTP-HepB 3","Pentavalent 1","Pentavalent 2","Pentavalent 3","Pneumocoque 1","Pneumocoque 2","Pneumocoque 3","Rotavirus 1","Rotavirus 2","Rougeole 1","Rougeole 2","Méningite A","Fièvre Jaune","VAT 1","VAT 2","VAT 3","VAT 4","VAT 5","Hépatite B"];
const GROUPES = ["A+","A-","B+","B-","AB+","AB-","O+","O-","Inconnu"];
const STATUT_V = ["prévu","fait","en retard","annulé"];
const ETAPES_DEV = ["Tient la tête","Se retourne","Tient assis","Se met debout","Marche","Premiers mots","Propreté diurne","Propreté nocturne","Scolarisation"];
const TYPES_EXAMEN = ["NFS","Goutte épaisse","Coproparasitologie","ECBU","Radiographie","Échographie","Électrophorèse Hb","Glycémie","Autre"];

// ─── UTILS ────────────────────────────────────────────────────────────────────
const ageMois = (d) => Math.floor((Date.now() - new Date(d)) / (1000*60*60*24*30.44));
const ageStr = (d) => { const m = ageMois(d); return m < 24 ? `${m} mois` : `${Math.floor(m/12)} an${Math.floor(m/12)>1?"s":""} ${m%12>0?m%12+"m":""}`; };
const fmt = (d) => d ? new Date(d).toLocaleDateString("fr-FR") : "—";
const sc = (s) => ({fait:"#22c55e",prévu:"#3b82f6","en retard":"#ef4444",annulé:"#6b7280"})[s]||"#6b7280";
const waMsg = (e, v) => encodeURIComponent(`🏥 *Dispensaire Fass Ngom*\n\nBonjour ${e.mere?.nom},\n\nVotre enfant *${e.nom}* doit recevoir le vaccin *${v.nom}* le *${fmt(v.datePrevu)}*.\n\n📍 Dispensaire de Fass Ngom\n\nMerci de confirmer en répondant *OUI*.`);

// ─── ATOMS ────────────────────────────────────────────────────────────────────
const css = {
  card: { background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, padding:18 },
  input: { width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"10px 14px", color:"#e2e8f0", fontSize:14, fontFamily:"inherit", outline:"none", boxSizing:"border-box" },
  label: { display:"block", fontSize:11, color:"#64748b", marginBottom:5, fontWeight:700, letterSpacing:.6, textTransform:"uppercase" },
};

const Card = ({ children, style={}, onClick }) => (
  <div onClick={onClick} style={{...css.card, cursor:onClick?"pointer":"default", transition:"border-color .2s", ...style}}
    onMouseEnter={e=>onClick&&(e.currentTarget.style.borderColor="rgba(16,185,129,0.4)")}
    onMouseLeave={e=>onClick&&(e.currentTarget.style.borderColor="rgba(255,255,255,0.07)")}
  >{children}</div>
);

const F = ({ label, children }) => (
  <div style={{marginBottom:14}}>
    <label style={css.label}>{label}</label>
    {children}
  </div>
);

const TI = (props) => <input {...props} style={{...css.input,...(props.style||{})}} />;
const TA = (props) => <textarea {...props} style={{...css.input, minHeight:70, resize:"vertical",...(props.style||{})}} />;
const SL = ({ options, ...p }) => (
  <select {...p} style={{...css.input, background:"#111c28"}}>
    {options.map(o=><option key={o.v??o} value={o.v??o}>{o.l??o}</option>)}
  </select>
);

const Btn = ({ children, onClick, v="primary", sm, full, style={} }) => {
  const vs = {
    primary:{background:"linear-gradient(135deg,#10b981,#059669)",color:"#fff"},
    danger:{background:"linear-gradient(135deg,#ef4444,#dc2626)",color:"#fff"},
    ghost:{background:"rgba(255,255,255,0.06)",color:"#94a3b8",border:"1px solid rgba(255,255,255,0.08)"},
    wa:{background:"linear-gradient(135deg,#25d366,#128c7e)",color:"#fff"},
    blue:{background:"linear-gradient(135deg,#3b82f6,#2563eb)",color:"#fff"},
    amber:{background:"linear-gradient(135deg,#f59e0b,#d97706)",color:"#fff"},
  };
  return <button onClick={onClick} style={{...vs[v],border:vs[v].border||"none",borderRadius:10,padding:sm?"6px 13px":"11px 22px",fontSize:sm?12:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit",width:full?"100%":"auto",transition:"opacity .15s",...style}}
    onMouseEnter={e=>e.currentTarget.style.opacity=".82"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}
  >{children}</button>;
};

const Badge = ({ s }) => <span style={{background:sc(s)+"20",color:sc(s),border:`1px solid ${sc(s)}40`,borderRadius:20,padding:"2px 10px",fontSize:11,fontWeight:700}}>{s?.toUpperCase()}</span>;

const Tag = ({ label, color="#3b82f6", onRemove }) => (
  <span style={{background:color+"18",color,border:`1px solid ${color}30`,borderRadius:20,padding:"3px 10px",fontSize:12,fontWeight:600,display:"inline-flex",alignItems:"center",gap:5,margin:"2px 3px"}}>
    {label}{onRemove&&<span onClick={onRemove} style={{cursor:"pointer",opacity:.7}}>✕</span>}
  </span>
);

const Modal = ({ title, onClose, children, wide }) => (
  <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.8)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={e=>e.target===e.currentTarget&&onClose()}>
    <div style={{background:"#0c1520",border:"1px solid rgba(255,255,255,0.12)",borderRadius:20,padding:24,width:"100%",maxWidth:wide?580:460,maxHeight:"90vh",overflowY:"auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <h3 style={{margin:0,color:"#f1f5f9",fontSize:17}}>{title}</h3>
        <button onClick={onClose} style={{background:"none",border:"none",color:"#475569",fontSize:22,cursor:"pointer"}}>✕</button>
      </div>
      {children}
    </div>
  </div>
);

const Spinner = () => (
  <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:40}}>
    <div style={{width:32,height:32,border:"3px solid rgba(16,185,129,0.2)",borderTop:"3px solid #10b981",borderRadius:"50%",animation:"spin 1s linear infinite"}}/>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

const SectionTitle = ({ icon, title, action }) => (
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
    <span style={{color:"#94a3b8",fontSize:13,fontWeight:700}}>{icon} {title}</span>
    {action}
  </div>
);

const EmptyState = ({ msg }) => <Card><p style={{color:"#334155",textAlign:"center",margin:0,fontSize:13}}>{msg}</p></Card>;

// ─── GRAPHIQUE CROISSANCE ─────────────────────────────────────────────────────
const Chart = ({ data, field, label, unit, color }) => {
  if (data.length < 2) return <p style={{color:"#334155",fontSize:12,textAlign:"center",padding:"8px 0"}}>Minimum 2 mesures pour afficher le graphique</p>;
  const vals = data.map(m=>+m[field]).filter(Boolean);
  if (!vals.length) return null;
  const min = Math.min(...vals)*0.94, max = Math.max(...vals)*1.06;
  const W=300, H=90;
  const px = (i) => (i/(data.length-1))*(W-24)+12;
  const py = (v) => H - ((v-min)/(max-min))*(H-16) - 4;
  const pts = data.map((m,i)=>`${px(i)},${py(+m[field])}`).join(" ");
  return (
    <div style={{marginBottom:16}}>
      <p style={{margin:"0 0 6px",color:"#64748b",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:.6}}>{label}</p>
      <svg width={W} height={H+22} style={{overflow:"visible",maxWidth:"100%"}}>
        <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round"/>
        {data.map((m,i)=>(
          <g key={i}>
            <circle cx={px(i)} cy={py(+m[field])} r={4} fill={color}/>
            <text x={px(i)} y={py(+m[field])-9} textAnchor="middle" fontSize={9} fill="#64748b">{m[field]}{unit}</text>
            <text x={px(i)} y={H+16} textAnchor="middle" fontSize={9} fill="#334155">{m.age_mois}m</text>
          </g>
        ))}
      </svg>
    </div>
  );
};

// ─── FICHE COMPLÈTE ───────────────────────────────────────────────────────────
const Fiche = ({ enfant, onBack, onSave, isAdmin, saving }) => {
  const [tab, setTab] = useState("identite");
  const [m, setM] = useState({});
  const open = k => setM(p=>({...p,[k]:true}));
  const close = k => setM(p=>({...p,[k]:false}));

  // Formulaires
  const [fMesure, setFM] = useState({date:"",poids:"",taille:"",perimetreCranien:"",imc:""});
  const [fVaccin, setFV] = useState({nom:"BCG",datePrevu:"",statut:"prévu",lot:"",site:"",soignant:""});
  const [fConsult, setFC] = useState({date:"",motif:"",diagnostic:"",traitement:"",notes:"",temperature:"",poids:"",soignant:""});
  const [fHospit, setFH] = useState({dateEntree:"",dateSortie:"",motif:"",hopital:"",diagnostic:"",traitement:""});
  const [fMed, setFMed] = useState({nom:"",posologie:"",duree:"",dateDebut:"",prescripteur:""});
  const [fDev, setFDev] = useState({etape:"Tient la tête",dateAcquis:"",ageAcquis:"",notes:""});
  const [fExam, setFEx] = useState({date:"",type:"NFS",resultat:"",notes:"",soignant:""});
  const [editMed, setEM] = useState({...enfant.medical});
  const [editNaiss, setEN] = useState({...enfant.naissance});
  const [editInfo, setEI] = useState({nom:enfant.nom,dateNaissance:enfant.dateNaissance,sexe:enfant.sexe,lieuNaissance:enfant.lieuNaissance,numeroCarnet:enfant.numeroCarnet,mere:{...enfant.mere},pere:{...enfant.pere},urgence:{...enfant.urgence}});
  const [newTag, setNT] = useState({allergie:"",maladie:"",antecedent:""});

  const upd = (data) => onSave({...enfant,...data});
  const der = enfant.mesures.slice(-1)[0];
  const retards = enfant.vaccins.filter(v=>v.statut==="en retard").length;

  const TABS = [
    {k:"identite",icon:"👤"},
    {k:"naissance",icon:"🍼"},
    {k:"médical",icon:"🩺"},
    {k:"mesures",icon:"📏"},
    {k:"vaccins",icon:"💉"},
    {k:"consultations",icon:"📋"},
    {k:"hospitalisations",icon:"🏥"},
    {k:"médicaments",icon:"💊"},
    {k:"développement",icon:"🧠"},
    {k:"examens",icon:"🔬"},
  ];

  return (
    <div>
      {/* Back + saving */}
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:"#10b981",cursor:"pointer",fontSize:14,fontFamily:"inherit"}}>← Retour</button>
        {saving&&<span style={{color:"#64748b",fontSize:12,animation:"pulse 1s infinite"}}>💾 Sauvegarde...</span>}
      </div>

      {/* Header enfant */}
      <Card style={{marginBottom:16}}>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          <div style={{width:62,height:62,borderRadius:"50%",background:enfant.sexe==="F"?"linear-gradient(135deg,#ec4899,#be185d)":"linear-gradient(135deg,#3b82f6,#1d4ed8)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,flexShrink:0}}>
            {enfant.sexe==="F"?"👧":"👦"}
          </div>
          <div style={{flex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
              <h2 style={{margin:0,color:"#f1f5f9",fontSize:20,fontWeight:900}}>{enfant.nom}</h2>
              {enfant.numeroCarnet&&<span style={{color:"#475569",fontSize:12,background:"rgba(255,255,255,0.05)",padding:"2px 8px",borderRadius:8}}>#{enfant.numeroCarnet}</span>}
            </div>
            <p style={{margin:"4px 0 0",color:"#64748b",fontSize:13}}>{ageStr(enfant.dateNaissance)} · Né(e) le {fmt(enfant.dateNaissance)}</p>
            <div style={{display:"flex",gap:5,marginTop:6,flexWrap:"wrap"}}>
              {enfant.medical?.groupeSanguin&&enfant.medical.groupeSanguin!=="Inconnu"&&<Tag label={"🩸 "+enfant.medical.groupeSanguin} color="#ef4444"/>}
              {retards>0&&<Badge s="en retard"/>}
              {enfant.medical?.maladiesChroniques?.map(x=><Tag key={x} label={x} color="#f59e0b"/>)}
              {enfant.medical?.allergies?.map(x=><Tag key={x} label={"⚠️ "+x} color="#ef4444"/>)}
            </div>
          </div>
        </div>
        {/* Dernières mesures */}
        {der&&(
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginTop:14}}>
            {[{l:"Poids",v:der.poids+"kg",i:"⚖️"},{l:"Taille",v:der.taille+"cm",i:"📏"},{l:"PC",v:der.perimetreCranien+"cm",i:"🧠"},{l:"Âge",v:der.age_mois+"m",i:"📅"}].map(s=>(
              <div key={s.l} style={{background:"rgba(255,255,255,0.04)",borderRadius:10,padding:"10px 6px",textAlign:"center"}}>
                <div style={{fontSize:16}}>{s.i}</div>
                <div style={{color:"#f1f5f9",fontWeight:800,fontSize:13}}>{s.v}</div>
                <div style={{color:"#475569",fontSize:10,fontWeight:700}}>{s.l}</div>
              </div>
            ))}
          </div>
        )}
        <div style={{marginTop:12,padding:"10px 12px",background:"rgba(255,255,255,0.03)",borderRadius:10}}>
          <p style={{margin:0,color:"#94a3b8",fontSize:13}}>👩 <strong style={{color:"#e2e8f0"}}>{enfant.mere?.nom}</strong> <span style={{color:"#475569"}}>· {enfant.mere?.telephone}</span></p>
          {enfant.pere?.nom&&<p style={{margin:"4px 0 0",color:"#94a3b8",fontSize:13}}>👨 <strong style={{color:"#e2e8f0"}}>{enfant.pere.nom}</strong> <span style={{color:"#475569"}}>· {enfant.pere.telephone}</span></p>}
          {enfant.urgence?.nom&&<p style={{margin:"4px 0 0",color:"#fbbf24",fontSize:12}}>🆘 Urgence: {enfant.urgence.nom} · {enfant.urgence.telephone}</p>}
        </div>
      </Card>

      {/* Tabs scrollable */}
      <div style={{display:"flex",gap:6,marginBottom:16,overflowX:"auto",paddingBottom:6,scrollbarWidth:"none"}}>
        {TABS.map(t=>(
          <button key={t.k} onClick={()=>setTab(t.k)} style={{background:tab===t.k?"rgba(16,185,129,0.15)":"rgba(255,255,255,0.04)",border:`1px solid ${tab===t.k?"#10b981":"rgba(255,255,255,0.07)"}`,color:tab===t.k?"#10b981":"#64748b",borderRadius:10,padding:"7px 14px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap",flexShrink:0}}>
            {t.icon} {t.k.charAt(0).toUpperCase()+t.k.slice(1)}
          </button>
        ))}
      </div>

      {/* ══ IDENTITÉ ══ */}
      {tab==="identite"&&(
        <div>
          <SectionTitle icon="👤" title="Informations générales" action={isAdmin&&<Btn sm onClick={()=>{setEI({nom:enfant.nom,dateNaissance:enfant.dateNaissance,sexe:enfant.sexe,lieuNaissance:enfant.lieuNaissance,numeroCarnet:enfant.numeroCarnet,mere:{...enfant.mere},pere:{...enfant.pere},urgence:{...enfant.urgence}});open("editInfo");}}>✏️ Modifier</Btn>}/>
          <Card style={{marginBottom:10}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              {[
                {l:"N° Carnet",v:enfant.numeroCarnet||"—"},
                {l:"Date naissance",v:fmt(enfant.dateNaissance)},
                {l:"Lieu naissance",v:enfant.lieuNaissance||"—"},
                {l:"Sexe",v:enfant.sexe==="F"?"Féminin":"Masculin"},
              ].map(x=>(
                <div key={x.l}>
                  <p style={{margin:0,color:"#475569",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:.5}}>{x.l}</p>
                  <p style={{margin:"3px 0 0",color:"#e2e8f0",fontSize:14,fontWeight:600}}>{x.v}</p>
                </div>
              ))}
            </div>
          </Card>
          <Card style={{marginBottom:10}}>
            <p style={{margin:"0 0 12px",color:"#64748b",fontSize:11,fontWeight:700,textTransform:"uppercase"}}>👩 Mère</p>
            <Row label="Nom" val={enfant.mere?.nom}/><Row label="Téléphone" val={enfant.mere?.telephone}/><Row label="Profession" val={enfant.mere?.profession}/><Row label="Adresse" val={enfant.mere?.adresse}/>
          </Card>
          <Card style={{marginBottom:10}}>
            <p style={{margin:"0 0 12px",color:"#64748b",fontSize:11,fontWeight:700,textTransform:"uppercase"}}>👨 Père</p>
            <Row label="Nom" val={enfant.pere?.nom}/><Row label="Téléphone" val={enfant.pere?.telephone}/><Row label="Profession" val={enfant.pere?.profession}/>
          </Card>
          <Card>
            <p style={{margin:"0 0 12px",color:"#fbbf24",fontSize:11,fontWeight:700,textTransform:"uppercase"}}>🆘 Contact d'urgence</p>
            <Row label="Nom" val={enfant.urgence?.nom}/><Row label="Téléphone" val={enfant.urgence?.telephone}/><Row label="Lien" val={enfant.urgence?.lien}/>
          </Card>
        </div>
      )}

      {/* ══ NAISSANCE ══ */}
      {tab==="naissance"&&(
        <div>
          <SectionTitle icon="🍼" title="Données à la naissance" action={isAdmin&&<Btn sm onClick={()=>{setEN({...enfant.naissance});open("editNaiss");}}>✏️ Modifier</Btn>}/>
          <Card>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
              {[
                {l:"Terme",v:enfant.naissance?.terme?enfant.naissance.terme+" SA":"—"},
                {l:"Type accouchement",v:enfant.naissance?.accouchement||"—"},
                {l:"Maternité",v:enfant.naissance?.maternitee||"—"},
                {l:"Poids naissance",v:enfant.naissance?.poidsNaissance?enfant.naissance.poidsNaissance+" kg":"—"},
                {l:"Taille naissance",v:enfant.naissance?.tailleNaissance?enfant.naissance.tailleNaissance+" cm":"—"},
                {l:"PC naissance",v:enfant.naissance?.pcNaissance?enfant.naissance.pcNaissance+" cm":"—"},
                {l:"Score Apgar 1 min",v:enfant.naissance?.apgar1||"—"},
                {l:"Score Apgar 5 min",v:enfant.naissance?.apgar5||"—"},
              ].map(x=>(
                <div key={x.l}>
                  <p style={{margin:0,color:"#475569",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:.5}}>{x.l}</p>
                  <p style={{margin:"3px 0 0",color:"#e2e8f0",fontSize:14,fontWeight:600}}>{x.v}</p>
                </div>
              ))}
            </div>
            {enfant.naissance?.notes&&<div style={{marginTop:14,paddingTop:14,borderTop:"1px solid rgba(255,255,255,0.06)"}}><p style={{margin:"0 0 4px",color:"#475569",fontSize:11,fontWeight:700,textTransform:"uppercase"}}>Notes</p><p style={{margin:0,color:"#94a3b8",fontSize:13}}>{enfant.naissance.notes}</p></div>}
          </Card>
        </div>
      )}

      {/* ══ MÉDICAL ══ */}
      {tab==="médical"&&(
        <div>
          <SectionTitle icon="🩺" title="Dossier médical" action={isAdmin&&<Btn sm onClick={()=>{setEM({...enfant.medical});open("editMed");}}>✏️ Modifier</Btn>}/>
          <Card style={{marginBottom:10}}>
            <p style={lbl}>Groupe sanguin</p>
            <Tag label={"🩸 "+(enfant.medical?.groupeSanguin||"Non renseigné")} color="#ef4444"/>
          </Card>
          <Card style={{marginBottom:10}}>
            <p style={lbl}>Allergies</p>
            {!enfant.medical?.allergies?.length?<span style={{color:"#334155",fontSize:13}}>Aucune allergie connue</span>:enfant.medical.allergies.map(a=><Tag key={a} label={a} color="#ef4444"/>)}
          </Card>
          <Card style={{marginBottom:10}}>
            <p style={lbl}>Maladies chroniques</p>
            {!enfant.medical?.maladiesChroniques?.length?<span style={{color:"#334155",fontSize:13}}>Aucune</span>:enfant.medical.maladiesChroniques.map(x=><Tag key={x} label={x} color="#f59e0b"/>)}
          </Card>
          <Card style={{marginBottom:10}}>
            <p style={lbl}>Antécédents familiaux</p>
            {!enfant.medical?.antecedentsFamiliaux?.length?<span style={{color:"#334155",fontSize:13}}>Aucun renseigné</span>:enfant.medical.antecedentsFamiliaux.map(x=><Tag key={x} label={x} color="#8b5cf6"/>)}
          </Card>
          {enfant.medical?.notes&&<Card><p style={lbl}>Notes médicales</p><p style={{margin:0,color:"#94a3b8",fontSize:13,lineHeight:1.7}}>{enfant.medical.notes}</p></Card>}
        </div>
      )}

      {/* ══ MESURES ══ */}
      {tab==="mesures"&&(
        <div>
          <SectionTitle icon="📏" title="Courbe de croissance" action={isAdmin&&<Btn sm onClick={()=>open("mesure")}>+ Mesure</Btn>}/>
          {enfant.mesures.length>=2&&(
            <Card style={{marginBottom:12,overflowX:"auto"}}>
              <Chart data={enfant.mesures} field="poids" label="Poids" unit="kg" color="#10b981"/>
              <Chart data={enfant.mesures} field="taille" label="Taille" unit="cm" color="#3b82f6"/>
              <Chart data={enfant.mesures} field="perimetreCranien" label="Périmètre crânien" unit="cm" color="#f59e0b"/>
            </Card>
          )}
          {enfant.mesures.slice().reverse().map(x=>(
            <Card key={x.id} style={{marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
                <span style={{color:"#64748b",fontSize:12}}>{fmt(x.date)} · {x.age_mois} mois</span>
                <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
                  <span style={{color:"#10b981",fontWeight:800}}>{x.poids} kg</span>
                  <span style={{color:"#3b82f6",fontWeight:800}}>{x.taille} cm</span>
                  <span style={{color:"#f59e0b",fontWeight:800}}>PC {x.perimetreCranien} cm</span>
                  {x.imc&&<span style={{color:"#a78bfa",fontWeight:800}}>IMC {x.imc}</span>}
                </div>
              </div>
            </Card>
          ))}
          {!enfant.mesures.length&&<EmptyState msg="Aucune mesure enregistrée"/>}
        </div>
      )}

      {/* ══ VACCINS ══ */}
      {tab==="vaccins"&&(
        <div>
          <SectionTitle icon="💉" title="Programme vaccinal" action={isAdmin&&<Btn sm onClick={()=>open("vaccin")}>+ Vaccin</Btn>}/>
          {enfant.vaccins.map(v=>(
            <Card key={v.id} style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
                <div>
                  <p style={{margin:0,color:"#f1f5f9",fontWeight:800,fontSize:15}}>{v.nom}</p>
                  <p style={{margin:"4px 0 0",color:"#475569",fontSize:12}}>Prévu : {fmt(v.datePrevu)}{v.dateFait&&<> · <span style={{color:"#22c55e"}}>Fait : {fmt(v.dateFait)}</span></>}</p>
                  <div style={{display:"flex",gap:12,marginTop:3}}>
                    {v.lot&&<span style={{color:"#334155",fontSize:11}}>Lot : {v.lot}</span>}
                    {v.site&&<span style={{color:"#334155",fontSize:11}}>Site : {v.site}</span>}
                    {v.soignant&&<span style={{color:"#334155",fontSize:11}}>Par : {v.soignant}</span>}
                  </div>
                </div>
                <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
                  <Badge s={v.statut}/>
                  {isAdmin&&v.statut!=="fait"&&(
                    <>
                      <Btn sm v="ghost" onClick={()=>upd({vaccins:enfant.vaccins.map(x=>x.id===v.id?{...x,statut:"fait",dateFait:new Date().toISOString().slice(0,10)}:x)})}>✓ Fait</Btn>
                      <a href={`https://wa.me/${enfant.mere?.telephone?.replace(/[^0-9]/g,"")}?text=${waMsg(enfant,v)}`} target="_blank" rel="noreferrer"><Btn sm v="wa">📲 Rappel</Btn></a>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
          {!enfant.vaccins.length&&<EmptyState msg="Aucun vaccin enregistré"/>}
        </div>
      )}

      {/* ══ CONSULTATIONS ══ */}
      {tab==="consultations"&&(
        <div>
          <SectionTitle icon="📋" title="Consultations" action={isAdmin&&<Btn sm onClick={()=>open("consult")}>+ Consultation</Btn>}/>
          {enfant.consultations.slice().reverse().map(c=>(
            <Card key={c.id} style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8,flexWrap:"wrap",gap:6}}>
                <strong style={{color:"#f1f5f9",fontSize:15}}>{c.motif}</strong>
                <span style={{color:"#64748b",fontSize:12}}>{fmt(c.date)}</span>
              </div>
              <div style={{display:"flex",gap:16,flexWrap:"wrap",marginBottom:c.notes?8:0}}>
                {c.temperature&&<span style={{color:"#f59e0b",fontSize:13}}>🌡️ {c.temperature}°C</span>}
                {c.poids&&<span style={{color:"#10b981",fontSize:13}}>⚖️ {c.poids} kg</span>}
              </div>
              {c.diagnostic&&<p style={{margin:"0 0 4px",color:"#e2e8f0",fontSize:13}}><span style={{color:"#64748b",fontWeight:700}}>Diagnostic : </span>{c.diagnostic}</p>}
              {c.traitement&&<p style={{margin:"0 0 4px",color:"#e2e8f0",fontSize:13}}><span style={{color:"#64748b",fontWeight:700}}>Traitement : </span>{c.traitement}</p>}
              {c.notes&&<p style={{margin:"0 0 4px",color:"#94a3b8",fontSize:13,lineHeight:1.6}}>{c.notes}</p>}
              {c.soignant&&<p style={{margin:0,color:"#475569",fontSize:12}}>👨‍⚕️ {c.soignant}</p>}
            </Card>
          ))}
          {!enfant.consultations.length&&<EmptyState msg="Aucune consultation enregistrée"/>}
        </div>
      )}

      {/* ══ HOSPITALISATIONS ══ */}
      {tab==="hospitalisations"&&(
        <div>
          <SectionTitle icon="🏥" title="Hospitalisations" action={isAdmin&&<Btn sm onClick={()=>open("hospit")}>+ Hospitalisation</Btn>}/>
          {enfant.hospitalisations.slice().reverse().map(h=>(
            <Card key={h.id} style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8,flexWrap:"wrap",gap:6}}>
                <strong style={{color:"#f1f5f9"}}>{h.motif}</strong>
                <span style={{color:"#64748b",fontSize:12}}>{fmt(h.dateEntree)} → {fmt(h.dateSortie)}</span>
              </div>
              <p style={{margin:"0 0 4px",color:"#94a3b8",fontSize:13}}>🏥 {h.hopital}</p>
              {h.diagnostic&&<p style={{margin:"0 0 4px",color:"#e2e8f0",fontSize:13}}><span style={{color:"#64748b",fontWeight:700}}>Diagnostic : </span>{h.diagnostic}</p>}
              {h.traitement&&<p style={{margin:0,color:"#e2e8f0",fontSize:13}}><span style={{color:"#64748b",fontWeight:700}}>Traitement : </span>{h.traitement}</p>}
            </Card>
          ))}
          {!enfant.hospitalisations.length&&<EmptyState msg="Aucune hospitalisation enregistrée"/>}
        </div>
      )}

      {/* ══ MÉDICAMENTS ══ */}
      {tab==="médicaments"&&(
        <div>
          <SectionTitle icon="💊" title="Médicaments / Traitements" action={isAdmin&&<Btn sm onClick={()=>open("med")}>+ Médicament</Btn>}/>
          {enfant.medicaments.slice().reverse().map(x=>(
            <Card key={x.id} style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:6,marginBottom:6}}>
                <strong style={{color:"#f1f5f9",fontSize:15}}>{x.nom}</strong>
                <span style={{color:"#64748b",fontSize:12}}>{fmt(x.dateDebut)}</span>
              </div>
              {x.posologie&&<p style={{margin:"0 0 3px",color:"#94a3b8",fontSize:13}}>💊 {x.posologie}</p>}
              {x.duree&&<p style={{margin:"0 0 3px",color:"#94a3b8",fontSize:13}}>⏱ Durée : {x.duree}</p>}
              {x.prescripteur&&<p style={{margin:0,color:"#475569",fontSize:12}}>👨‍⚕️ {x.prescripteur}</p>}
            </Card>
          ))}
          {!enfant.medicaments.length&&<EmptyState msg="Aucun médicament enregistré"/>}
        </div>
      )}

      {/* ══ DÉVELOPPEMENT ══ */}
      {tab==="développement"&&(
        <div>
          <SectionTitle icon="🧠" title="Développement psychomoteur" action={isAdmin&&<Btn sm onClick={()=>open("dev")}>+ Étape</Btn>}/>
          <Card style={{marginBottom:12,padding:16}}>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {ETAPES_DEV.map(e=>{
                const acquis = enfant.developpement.find(d=>d.etape===e);
                return (
                  <div key={e} style={{background:acquis?"rgba(16,185,129,0.12)":"rgba(255,255,255,0.03)",border:`1px solid ${acquis?"rgba(16,185,129,0.3)":"rgba(255,255,255,0.06)"}`,borderRadius:10,padding:"8px 12px",minWidth:130}}>
                    <p style={{margin:0,color:acquis?"#10b981":"#475569",fontSize:12,fontWeight:700}}>{acquis?"✅":"⏳"} {e}</p>
                    {acquis&&<p style={{margin:"3px 0 0",color:"#64748b",fontSize:11}}>{acquis.ageAcquis} mois · {fmt(acquis.dateAcquis)}</p>}
                  </div>
                );
              })}
            </div>
          </Card>
          {enfant.developpement.map(d=>(
            <Card key={d.id} style={{marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:6}}>
                <strong style={{color:"#10b981"}}>{d.etape}</strong>
                <span style={{color:"#64748b",fontSize:12}}>{fmt(d.dateAcquis)} · {d.ageAcquis} mois</span>
              </div>
              {d.notes&&<p style={{margin:"6px 0 0",color:"#94a3b8",fontSize:13}}>{d.notes}</p>}
            </Card>
          ))}
          {!enfant.developpement.length&&<EmptyState msg="Aucune étape enregistrée"/>}
        </div>
      )}

      {/* ══ EXAMENS ══ */}
      {tab==="examens"&&(
        <div>
          <SectionTitle icon="🔬" title="Examens complémentaires" action={isAdmin&&<Btn sm onClick={()=>open("examen")}>+ Examen</Btn>}/>
          {enfant.examens.slice().reverse().map(x=>(
            <Card key={x.id} style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:6,marginBottom:6}}>
                <strong style={{color:"#f1f5f9"}}>{x.type}</strong>
                <span style={{color:"#64748b",fontSize:12}}>{fmt(x.date)}</span>
              </div>
              {x.resultat&&<p style={{margin:"0 0 4px",color:"#e2e8f0",fontSize:13}}><span style={{color:"#64748b",fontWeight:700}}>Résultat : </span>{x.resultat}</p>}
              {x.notes&&<p style={{margin:"0 0 4px",color:"#94a3b8",fontSize:13}}>{x.notes}</p>}
              {x.soignant&&<p style={{margin:0,color:"#475569",fontSize:12}}>👨‍⚕️ {x.soignant}</p>}
            </Card>
          ))}
          {!enfant.examens.length&&<EmptyState msg="Aucun examen enregistré"/>}
        </div>
      )}

      {/* ══ MODALS ══ */}
      {m.mesure&&<Modal title="📏 Nouvelle mesure" onClose={()=>close("mesure")}>
        <F label="Date"><TI type="date" value={fMesure.date} onChange={e=>setFM({...fMesure,date:e.target.value})}/></F>
        <F label="Poids (kg)"><TI type="number" step="0.1" placeholder="Ex: 8.5" value={fMesure.poids} onChange={e=>setFM({...fMesure,poids:e.target.value})}/></F>
        <F label="Taille (cm)"><TI type="number" step="0.1" placeholder="Ex: 72" value={fMesure.taille} onChange={e=>setFM({...fMesure,taille:e.target.value})}/></F>
        <F label="Périmètre crânien (cm)"><TI type="number" step="0.1" placeholder="Ex: 44" value={fMesure.perimetreCranien} onChange={e=>setFM({...fMesure,perimetreCranien:e.target.value})}/></F>
        <F label="IMC (optionnel)"><TI type="number" step="0.1" placeholder="Calculé automatiquement" value={fMesure.imc} onChange={e=>setFM({...fMesure,imc:e.target.value})}/></F>
        <Btn full onClick={()=>{if(!fMesure.date||!fMesure.poids)return;upd({mesures:[...enfant.mesures,{id:"m"+Date.now(),age_mois:ageMois(enfant.dateNaissance),...fMesure,poids:+fMesure.poids,taille:+fMesure.taille,perimetreCranien:+fMesure.perimetreCranien}]});setFM({date:"",poids:"",taille:"",perimetreCranien:"",imc:""});close("mesure");}}>Enregistrer</Btn>
      </Modal>}

      {m.vaccin&&<Modal title="💉 Ajouter un vaccin" onClose={()=>close("vaccin")} wide>
        <F label="Vaccin"><SL value={fVaccin.nom} onChange={e=>setFV({...fVaccin,nom:e.target.value})} options={VACCINS.map(v=>({v,l:v}))}/></F>
        <F label="Date prévue"><TI type="date" value={fVaccin.datePrevu} onChange={e=>setFV({...fVaccin,datePrevu:e.target.value})}/></F>
        <F label="Statut"><SL value={fVaccin.statut} onChange={e=>setFV({...fVaccin,statut:e.target.value})} options={STATUT_V.map(v=>({v,l:v}))}/></F>
        <F label="N° de lot"><TI placeholder="Ex: BCG-221A" value={fVaccin.lot} onChange={e=>setFV({...fVaccin,lot:e.target.value})}/></F>
        <F label="Site d'injection"><TI placeholder="Ex: Bras gauche, Cuisse droite" value={fVaccin.site} onChange={e=>setFV({...fVaccin,site:e.target.value})}/></F>
        <F label="Soignant"><TI placeholder="Ex: Inf. Ba" value={fVaccin.soignant} onChange={e=>setFV({...fVaccin,soignant:e.target.value})}/></F>
        <Btn full onClick={()=>{if(!fVaccin.datePrevu)return;upd({vaccins:[...enfant.vaccins,{id:"v"+Date.now(),dateFait:null,...fVaccin}]});setFV({nom:"BCG",datePrevu:"",statut:"prévu",lot:"",site:"",soignant:""});close("vaccin");}}>Enregistrer</Btn>
      </Modal>}

      {m.consult&&<Modal title="📋 Nouvelle consultation" onClose={()=>close("consult")} wide>
        <F label="Date"><TI type="date" value={fConsult.date} onChange={e=>setFC({...fConsult,date:e.target.value})}/></F>
        <F label="Motif de consultation"><TI placeholder="Ex: Fièvre, Contrôle 6 mois..." value={fConsult.motif} onChange={e=>setFC({...fConsult,motif:e.target.value})}/></F>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <F label="Température (°C)"><TI type="number" step="0.1" placeholder="Ex: 37.5" value={fConsult.temperature} onChange={e=>setFC({...fConsult,temperature:e.target.value})}/></F>
          <F label="Poids du jour (kg)"><TI type="number" step="0.1" placeholder="Ex: 9.2" value={fConsult.poids} onChange={e=>setFC({...fConsult,poids:e.target.value})}/></F>
        </div>
        <F label="Diagnostic"><TI placeholder="Ex: Paludisme, IRAS..." value={fConsult.diagnostic} onChange={e=>setFC({...fConsult,diagnostic:e.target.value})}/></F>
        <F label="Traitement prescrit"><TI placeholder="Ex: CTA 3j, Paracétamol..." value={fConsult.traitement} onChange={e=>setFC({...fConsult,traitement:e.target.value})}/></F>
        <F label="Observations"><TA placeholder="Notes cliniques, recommandations..." value={fConsult.notes} onChange={e=>setFC({...fConsult,notes:e.target.value})}/></F>
        <F label="Soignant"><TI placeholder="Ex: Inf. Ba, Dr. Ndiaye" value={fConsult.soignant} onChange={e=>setFC({...fConsult,soignant:e.target.value})}/></F>
        <Btn full onClick={()=>{if(!fConsult.date||!fConsult.motif)return;upd({consultations:[...enfant.consultations,{id:"co"+Date.now(),...fConsult}]});setFC({date:"",motif:"",diagnostic:"",traitement:"",notes:"",temperature:"",poids:"",soignant:""});close("consult");}}>Enregistrer</Btn>
      </Modal>}

      {m.hospit&&<Modal title="🏥 Hospitalisation" onClose={()=>close("hospit")} wide>
        <F label="Motif"><TI placeholder="Ex: Paludisme grave, Malnutrition..." value={fHospit.motif} onChange={e=>setFH({...fHospit,motif:e.target.value})}/></F>
        <F label="Hôpital / Centre de santé"><TI placeholder="Ex: Hôpital de Saint-Louis" value={fHospit.hopital} onChange={e=>setFH({...fHospit,hopital:e.target.value})}/></F>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <F label="Date entrée"><TI type="date" value={fHospit.dateEntree} onChange={e=>setFH({...fHospit,dateEntree:e.target.value})}/></F>
          <F label="Date sortie"><TI type="date" value={fHospit.dateSortie} onChange={e=>setFH({...fHospit,dateSortie:e.target.value})}/></F>
        </div>
        <F label="Diagnostic"><TI value={fHospit.diagnostic} onChange={e=>setFH({...fHospit,diagnostic:e.target.value})}/></F>
        <F label="Traitement reçu"><TA value={fHospit.traitement} onChange={e=>setFH({...fHospit,traitement:e.target.value})}/></F>
        <Btn full onClick={()=>{if(!fHospit.motif||!fHospit.dateEntree)return;upd({hospitalisations:[...enfant.hospitalisations,{id:"h"+Date.now(),...fHospit}]});setFH({dateEntree:"",dateSortie:"",motif:"",hopital:"",diagnostic:"",traitement:""});close("hospit");}}>Enregistrer</Btn>
      </Modal>}

      {m.med&&<Modal title="💊 Médicament / Traitement" onClose={()=>close("med")} wide>
        <F label="Nom du médicament"><TI placeholder="Ex: Amoxicilline, CTA..." value={fMed.nom} onChange={e=>setFMed({...fMed,nom:e.target.value})}/></F>
        <F label="Posologie"><TI placeholder="Ex: 250mg 2×/j pendant 7j" value={fMed.posologie} onChange={e=>setFMed({...fMed,posologie:e.target.value})}/></F>
        <F label="Durée"><TI placeholder="Ex: 7 jours, 1 mois..." value={fMed.duree} onChange={e=>setFMed({...fMed,duree:e.target.value})}/></F>
        <F label="Date de début"><TI type="date" value={fMed.dateDebut} onChange={e=>setFMed({...fMed,dateDebut:e.target.value})}/></F>
        <F label="Prescripteur"><TI placeholder="Ex: Dr. Ndiaye" value={fMed.prescripteur} onChange={e=>setFMed({...fMed,prescripteur:e.target.value})}/></F>
        <Btn full onClick={()=>{if(!fMed.nom)return;upd({medicaments:[...enfant.medicaments,{id:"md"+Date.now(),...fMed}]});setFMed({nom:"",posologie:"",duree:"",dateDebut:"",prescripteur:""});close("med");}}>Enregistrer</Btn>
      </Modal>}

      {m.dev&&<Modal title="🧠 Étape développement" onClose={()=>close("dev")}>
        <F label="Étape"><SL value={fDev.etape} onChange={e=>setFDev({...fDev,etape:e.target.value})} options={ETAPES_DEV.map(e=>({v:e,l:e}))}/></F>
        <F label="Date d'acquisition"><TI type="date" value={fDev.dateAcquis} onChange={e=>setFDev({...fDev,dateAcquis:e.target.value})}/></F>
        <F label="Âge (mois)"><TI type="number" placeholder="Ex: 4" value={fDev.ageAcquis} onChange={e=>setFDev({...fDev,ageAcquis:e.target.value})}/></F>
        <F label="Notes"><TI placeholder="Observations..." value={fDev.notes} onChange={e=>setFDev({...fDev,notes:e.target.value})}/></F>
        <Btn full onClick={()=>{if(!fDev.dateAcquis)return;upd({developpement:[...enfant.developpement,{id:"d"+Date.now(),...fDev}]});setFDev({etape:"Tient la tête",dateAcquis:"",ageAcquis:"",notes:""});close("dev");}}>Enregistrer</Btn>
      </Modal>}

      {m.examen&&<Modal title="🔬 Examen complémentaire" onClose={()=>close("examen")} wide>
        <F label="Type d'examen"><SL value={fExam.type} onChange={e=>setFEx({...fExam,type:e.target.value})} options={TYPES_EXAMEN.map(t=>({v:t,l:t}))}/></F>
        <F label="Date"><TI type="date" value={fExam.date} onChange={e=>setFEx({...fExam,date:e.target.value})}/></F>
        <F label="Résultat"><TI placeholder="Ex: Paludisme positif, Hb 8g/dL..." value={fExam.resultat} onChange={e=>setFEx({...fExam,resultat:e.target.value})}/></F>
        <F label="Notes / Interprétation"><TA value={fExam.notes} onChange={e=>setFEx({...fExam,notes:e.target.value})}/></F>
        <F label="Soignant / Laborantin"><TI value={fExam.soignant} onChange={e=>setFEx({...fExam,soignant:e.target.value})}/></F>
        <Btn full onClick={()=>{if(!fExam.date||!fExam.type)return;upd({examens:[...enfant.examens,{id:"ex"+Date.now(),...fExam}]});setFEx({date:"",type:"NFS",resultat:"",notes:"",soignant:""});close("examen");}}>Enregistrer</Btn>
      </Modal>}

      {m.editInfo&&<Modal title="✏️ Modifier informations" onClose={()=>close("editInfo")} wide>
        <F label="N° Carnet"><TI placeholder="Ex: FN-2024-001" value={editInfo.numeroCarnet} onChange={e=>setEI({...editInfo,numeroCarnet:e.target.value})}/></F>
        <F label="Nom complet"><TI value={editInfo.nom} onChange={e=>setEI({...editInfo,nom:e.target.value})}/></F>
        <F label="Date de naissance"><TI type="date" value={editInfo.dateNaissance} onChange={e=>setEI({...editInfo,dateNaissance:e.target.value})}/></F>
        <F label="Lieu de naissance"><TI placeholder="Ex: Fass Ngom, Saint-Louis" value={editInfo.lieuNaissance} onChange={e=>setEI({...editInfo,lieuNaissance:e.target.value})}/></F>
        <F label="Sexe"><SL value={editInfo.sexe} onChange={e=>setEI({...editInfo,sexe:e.target.value})} options={[{v:"M",l:"Masculin"},{v:"F",l:"Féminin"}]}/></F>
        <div style={{borderTop:"1px solid rgba(255,255,255,0.07)",padding:"14px 0 2px",margin:"4px 0 0"}}>
          <p style={lbl}>👩 Mère</p>
          <F label="Nom"><TI value={editInfo.mere.nom||""} onChange={e=>setEI({...editInfo,mere:{...editInfo.mere,nom:e.target.value}})}/></F>
          <F label="Téléphone"><TI value={editInfo.mere.telephone||""} onChange={e=>setEI({...editInfo,mere:{...editInfo.mere,telephone:e.target.value,whatsapp:e.target.value}})}/></F>
          <F label="Profession"><TI value={editInfo.mere.profession||""} onChange={e=>setEI({...editInfo,mere:{...editInfo.mere,profession:e.target.value}})}/></F>
          <F label="Adresse"><TI value={editInfo.mere.adresse||""} onChange={e=>setEI({...editInfo,mere:{...editInfo.mere,adresse:e.target.value}})}/></F>
        </div>
        <div style={{borderTop:"1px solid rgba(255,255,255,0.07)",padding:"14px 0 2px",margin:"4px 0 0"}}>
          <p style={lbl}>👨 Père</p>
          <F label="Nom"><TI value={editInfo.pere.nom||""} onChange={e=>setEI({...editInfo,pere:{...editInfo.pere,nom:e.target.value}})}/></F>
          <F label="Téléphone"><TI value={editInfo.pere.telephone||""} onChange={e=>setEI({...editInfo,pere:{...editInfo.pere,telephone:e.target.value}})}/></F>
          <F label="Profession"><TI value={editInfo.pere.profession||""} onChange={e=>setEI({...editInfo,pere:{...editInfo.pere,profession:e.target.value}})}/></F>
        </div>
        <div style={{borderTop:"1px solid rgba(255,255,255,0.07)",padding:"14px 0 2px",margin:"4px 0 0"}}>
          <p style={{...lbl,color:"#fbbf24"}}>🆘 Contact d'urgence</p>
          <F label="Nom"><TI value={editInfo.urgence.nom||""} onChange={e=>setEI({...editInfo,urgence:{...editInfo.urgence,nom:e.target.value}})}/></F>
          <F label="Téléphone"><TI value={editInfo.urgence.telephone||""} onChange={e=>setEI({...editInfo,urgence:{...editInfo.urgence,telephone:e.target.value}})}/></F>
          <F label="Lien (Ex: Grand-mère, Oncle)"><TI value={editInfo.urgence.lien||""} onChange={e=>setEI({...editInfo,urgence:{...editInfo.urgence,lien:e.target.value}})}/></F>
        </div>
        <Btn full style={{marginTop:8}} onClick={()=>{upd({nom:editInfo.nom,dateNaissance:editInfo.dateNaissance,sexe:editInfo.sexe,lieuNaissance:editInfo.lieuNaissance,numeroCarnet:editInfo.numeroCarnet,mere:editInfo.mere,pere:editInfo.pere,urgence:editInfo.urgence});close("editInfo");}}>Sauvegarder</Btn>
      </Modal>}

      {m.editNaiss&&<Modal title="🍼 Données à la naissance" onClose={()=>close("editNaiss")} wide>
        <F label="Terme (semaines d'aménorrhée)"><TI type="number" placeholder="Ex: 39" value={editNaiss.terme||""} onChange={e=>setEN({...editNaiss,terme:e.target.value})}/></F>
        <F label="Type accouchement"><SL value={editNaiss.accouchement||"Normal"} onChange={e=>setEN({...editNaiss,accouchement:e.target.value})} options={["Normal","Césarienne","Forceps/Ventouse","Prématuré","Autre"].map(v=>({v,l:v}))}/></F>
        <F label="Maternité / Lieu"><TI placeholder="Ex: Dispensaire Fass Ngom" value={editNaiss.maternitee||""} onChange={e=>setEN({...editNaiss,maternitee:e.target.value})}/></F>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <F label="Poids naissance (kg)"><TI type="number" step="0.1" placeholder="Ex: 3.2" value={editNaiss.poidsNaissance||""} onChange={e=>setEN({...editNaiss,poidsNaissance:e.target.value})}/></F>
          <F label="Taille naissance (cm)"><TI type="number" step="0.5" placeholder="Ex: 50" value={editNaiss.tailleNaissance||""} onChange={e=>setEN({...editNaiss,tailleNaissance:e.target.value})}/></F>
          <F label="PC naissance (cm)"><TI type="number" step="0.1" placeholder="Ex: 34" value={editNaiss.pcNaissance||""} onChange={e=>setEN({...editNaiss,pcNaissance:e.target.value})}/></F>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <F label="Score Apgar 1 min"><TI type="number" min="0" max="10" placeholder="0-10" value={editNaiss.apgar1||""} onChange={e=>setEN({...editNaiss,apgar1:e.target.value})}/></F>
          <F label="Score Apgar 5 min"><TI type="number" min="0" max="10" placeholder="0-10" value={editNaiss.apgar5||""} onChange={e=>setEN({...editNaiss,apgar5:e.target.value})}/></F>
        </div>
        <F label="Notes"><TA value={editNaiss.notes||""} onChange={e=>setEN({...editNaiss,notes:e.target.value})}/></F>
        <Btn full onClick={()=>{upd({naissance:editNaiss});close("editNaiss");}}>Sauvegarder</Btn>
      </Modal>}

      {m.editMed&&<Modal title="🩺 Dossier médical" onClose={()=>close("editMed")} wide>
        <F label="Groupe sanguin"><SL value={editMed.groupeSanguin||"Inconnu"} onChange={e=>setEM({...editMed,groupeSanguin:e.target.value})} options={GROUPES.map(g=>({v:g,l:g}))}/></F>
        <F label="Allergies">
          <div style={{marginBottom:8}}>{editMed.allergies?.map(a=><Tag key={a} label={a} color="#ef4444" onRemove={()=>setEM({...editMed,allergies:editMed.allergies.filter(x=>x!==a)})}/>)}</div>
          <div style={{display:"flex",gap:8}}><TI placeholder="Ex: Pénicilline, Arachides..." value={newTag.allergie} onChange={e=>setNT({...newTag,allergie:e.target.value})}/><Btn sm v="blue" onClick={()=>{if(newTag.allergie.trim()){setEM({...editMed,allergies:[...(editMed.allergies||[]),newTag.allergie.trim()]});setNT({...newTag,allergie:""});}}}>+</Btn></div>
        </F>
        <F label="Maladies chroniques">
          <div style={{marginBottom:8}}>{editMed.maladiesChroniques?.map(x=><Tag key={x} label={x} color="#f59e0b" onRemove={()=>setEM({...editMed,maladiesChroniques:editMed.maladiesChroniques.filter(m=>m!==x)})}/>)}</div>
          <div style={{display:"flex",gap:8}}><TI placeholder="Ex: Drépanocytose, Asthme..." value={newTag.maladie} onChange={e=>setNT({...newTag,maladie:e.target.value})}/><Btn sm v="blue" onClick={()=>{if(newTag.maladie.trim()){setEM({...editMed,maladiesChroniques:[...(editMed.maladiesChroniques||[]),newTag.maladie.trim()]});setNT({...newTag,maladie:""});}}}>+</Btn></div>
        </F>
        <F label="Antécédents familiaux">
          <div style={{marginBottom:8}}>{editMed.antecedentsFamiliaux?.map(x=><Tag key={x} label={x} color="#8b5cf6" onRemove={()=>setEM({...editMed,antecedentsFamiliaux:editMed.antecedentsFamiliaux.filter(a=>a!==x)})}/>)}</div>
          <div style={{display:"flex",gap:8}}><TI placeholder="Ex: Diabète (père), HTA (mère)..." value={newTag.antecedent} onChange={e=>setNT({...newTag,antecedent:e.target.value})}/><Btn sm v="blue" onClick={()=>{if(newTag.antecedent.trim()){setEM({...editMed,antecedentsFamiliaux:[...(editMed.antecedentsFamiliaux||[]),newTag.antecedent.trim()]});setNT({...newTag,antecedent:""});}}}>+</Btn></div>
        </F>
        <F label="Notes médicales"><TA value={editMed.notes||""} onChange={e=>setEM({...editMed,notes:e.target.value})}/></F>
        <Btn full onClick={()=>{upd({medical:editMed});close("editMed");}}>Sauvegarder</Btn>
      </Modal>}
    </div>
  );
};

// Helper style
const lbl = { margin:"0 0 10px", color:"#64748b", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:.6 };
const Row = ({ label, val }) => val ? <p style={{margin:"0 0 6px",color:"#94a3b8",fontSize:13}}><span style={{color:"#475569",fontWeight:700}}>{label} : </span>{val}</p> : null;

// ─── LOGIN ────────────────────────────────────────────────────────────────────
const Login = ({ onLogin }) => {
  const [f, setF] = useState({u:"",p:""});
  const [err, setErr] = useState("");
  const [load, setLoad] = useState(false);
  const submit = () => {
    setLoad(true);
    setTimeout(()=>{ if(f.u===ADMIN.username&&f.p===ADMIN.password){onLogin();}else{setErr("Identifiant ou mot de passe incorrect.");} setLoad(false); }, 700);
  };
  return (
    <div style={{minHeight:"100vh",background:"#080e14",display:"flex",alignItems:"center",justifyContent:"center",padding:24,fontFamily:"'Nunito','Segoe UI',sans-serif"}}>
      <div style={{width:"100%",maxWidth:380}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{width:72,height:72,borderRadius:22,background:"linear-gradient(135deg,#10b981,#0d9488)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,margin:"0 auto 16px",boxShadow:"0 0 48px rgba(16,185,129,0.25)"}}>🏥</div>
          <h1 style={{margin:0,color:"#f1f5f9",fontSize:22,fontWeight:900}}>Espace Soignant</h1>
          <p style={{margin:"6px 0 0",color:"#475569",fontSize:13}}>Dispensaire de Fass Ngom</p>
        </div>
        <Card>
          <F label="Identifiant"><TI placeholder="dispensaire" value={f.u} onChange={e=>{setF({...f,u:e.target.value});setErr("");}}/></F>
          <F label="Mot de passe"><TI type="password" placeholder="••••••••" value={f.p} onChange={e=>{setF({...f,p:e.target.value});setErr("");}} onKeyDown={e=>e.key==="Enter"&&submit()}/></F>
          {err&&<p style={{color:"#ef4444",fontSize:13,margin:"-6px 0 14px",textAlign:"center"}}>{err}</p>}
          <Btn full onClick={submit}>{load?"Connexion...":"Se connecter"}</Btn>
        </Card>
      </div>
    </div>
  );
};

// ─── ADMIN APP ────────────────────────────────────────────────────────────────
const AdminApp = ({ onLogout }) => {
  const [list, setList] = useState([]);
  const [load, setLoad] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sel, setSel] = useState(null);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const blank = () => ({nom:"",dateNaissance:"",sexe:"M",numeroCarnet:"",lieuNaissance:"",mere:{nom:"",telephone:"",whatsapp:"",profession:"",adresse:""},pere:{nom:"",telephone:"",profession:""},urgence:{nom:"",telephone:"",lien:""},medical:{groupeSanguin:"Inconnu",allergies:[],maladiesChroniques:[],antecedentsFamiliaux:[],notes:""},naissance:{terme:"",poidsNaissance:"",tailleNaissance:"",pcNaissance:"",apgar1:"",apgar5:"",accouchement:"Normal",maternitee:""},mesures:[],vaccins:[],consultations:[],hospitalisations:[],medicaments:[],developpement:[],examens:[]});
  const [newE, setNE] = useState(blank());

  useEffect(()=>{ db.getAll().then(rows=>{setList(rows.map(fromRow));setLoad(false);}).catch(()=>setLoad(false)); },[]);

  const doSave = async (upd) => {
    setSaving(true);
    setList(p=>p.map(c=>c.id===upd.id?upd:c));
    await db.update(upd);
    setSaving(false);
  };

  const doAdd = async () => {
    if(!newE.nom||!newE.dateNaissance) return;
    const e = {...newE, id:"c"+Date.now()};
    setSaving(true);
    await db.insert(e);
    setList(p=>[e,...p]);
    setShowAdd(false);
    setNE(blank());
    setSaving(false);
  };

  const filtered = list.filter(c=>c.nom.toLowerCase().includes(search.toLowerCase())||c.mere?.nom?.toLowerCase().includes(search.toLowerCase()));

  if(load) return <div style={{minHeight:"100vh",background:"#080e14",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Nunito',sans-serif"}}><div style={{textAlign:"center"}}><Spinner/><p style={{color:"#475569",marginTop:12}}>Chargement depuis Supabase...</p></div></div>;

  if(sel){
    const e = list.find(c=>c.id===sel);
    if(!e){setSel(null);return null;}
    return (
      <div style={{minHeight:"100vh",background:"#080e14",fontFamily:"'Nunito','Segoe UI',sans-serif",color:"#e2e8f0"}}>
        <Header title="Espace Soignant" sub="🟢 Connecté à Supabase" onLogout={onLogout}/>
        <div style={{padding:"18px 16px",maxWidth:640,margin:"0 auto"}}>
          <Fiche enfant={e} isAdmin onBack={()=>setSel(null)} onSave={doSave} saving={saving}/>
        </div>
      </div>
    );
  }

  const retards = list.filter(c=>c.vaccins.some(v=>v.statut==="en retard"));
  const totalFaits = list.reduce((a,c)=>a+c.vaccins.filter(v=>v.statut==="fait").length,0);

  return (
    <div style={{minHeight:"100vh",background:"#080e14",fontFamily:"'Nunito','Segoe UI',sans-serif",color:"#e2e8f0"}}>
      <Header title="Espace Soignant" sub="🟢 Connecté à Supabase" onLogout={onLogout}/>
      <div style={{padding:"18px 16px",maxWidth:640,margin:"0 auto"}}>
        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:18}}>
          {[{l:"Enfants",v:list.length,i:"👶",c:"#3b82f6"},{l:"Vaccins",v:totalFaits,i:"💉",c:"#10b981"},{l:"Retards",v:retards.length,i:"⚠️",c:"#ef4444"},{l:"Hospitalisations",v:list.reduce((a,c)=>a+c.hospitalisations.length,0),i:"🏥",c:"#f59e0b"}].map(s=>(
            <Card key={s.l} style={{textAlign:"center",padding:"12px 6px"}}>
              <div style={{fontSize:18}}>{s.i}</div>
              <div style={{fontSize:22,fontWeight:900,color:s.c,lineHeight:1.2}}>{s.v}</div>
              <div style={{fontSize:10,color:"#475569",fontWeight:700,marginTop:2}}>{s.l}</div>
            </Card>
          ))}
        </div>

        {/* Alertes retards */}
        {retards.length>0&&(
          <Card style={{marginBottom:16,borderColor:"rgba(239,68,68,0.25)",background:"rgba(239,68,68,0.04)"}}>
            <p style={{margin:"0 0 10px",color:"#ef4444",fontWeight:800,fontSize:13}}>⚠️ Vaccins en retard — Envoyer rappels WhatsApp</p>
            {retards.map(c=>{const v=c.vaccins.find(v=>v.statut==="en retard");return(
              <div key={c.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                <div><span style={{color:"#e2e8f0",fontSize:13,fontWeight:700}}>{c.nom}</span><span style={{color:"#64748b",fontSize:12,marginLeft:8}}>{v?.nom}</span></div>
                <div style={{display:"flex",gap:6}}>
                  <Btn sm v="ghost" onClick={()=>setSel(c.id)}>Voir</Btn>
                  {v&&<a href={`https://wa.me/${c.mere?.telephone?.replace(/[^0-9]/g,"")}?text=${waMsg(c,v)}`} target="_blank" rel="noreferrer"><Btn sm v="wa">📲</Btn></a>}
                </div>
              </div>
            );})}
          </Card>
        )}

        {/* Search + Add */}
        <div style={{display:"flex",gap:10,marginBottom:14}}>
          <input placeholder="🔍 Rechercher un enfant ou sa mère..." value={search} onChange={e=>setSearch(e.target.value)} style={{flex:1,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.09)",borderRadius:10,padding:"10px 14px",color:"#e2e8f0",fontSize:14,fontFamily:"inherit",outline:"none"}}/>
          <Btn onClick={()=>setShowAdd(true)}>+ Nouveau</Btn>
        </div>

        {saving&&<p style={{color:"#64748b",fontSize:12,margin:"0 0 10px"}}>💾 Sauvegarde en cours...</p>}

        {filtered.map(c=>{
          const rC=c.vaccins.filter(v=>v.statut==="en retard").length;
          const pC=c.vaccins.filter(v=>v.statut==="prévu").length;
          const der=c.mesures.slice(-1)[0];
          return(
            <Card key={c.id} style={{marginBottom:10}} onClick={()=>setSel(c.id)}>
              <div style={{display:"flex",alignItems:"center",gap:14}}>
                <div style={{width:48,height:48,borderRadius:"50%",background:c.sexe==="F"?"linear-gradient(135deg,#ec4899,#be185d)":"linear-gradient(135deg,#3b82f6,#1d4ed8)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{c.sexe==="F"?"👧":"👦"}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <p style={{margin:0,color:"#f1f5f9",fontWeight:800,fontSize:15,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.nom}</p>
                    {c.numeroCarnet&&<span style={{color:"#334155",fontSize:11}}>#{c.numeroCarnet}</span>}
                  </div>
                  <p style={{margin:"3px 0 0",color:"#64748b",fontSize:12}}>{ageStr(c.dateNaissance)}{der&&` · ${der.poids}kg · ${der.taille}cm`}</p>
                  <p style={{margin:"2px 0 0",color:"#475569",fontSize:11}}>👩 {c.mere?.nom}</p>
                </div>
                <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
                  {rC>0&&<Badge s="en retard"/>}
                  {rC===0&&pC>0&&<Badge s="prévu"/>}
                  {rC===0&&pC===0&&c.vaccins.length>0&&<Badge s="fait"/>}
                  <span style={{color:"#334155",fontSize:16}}>›</span>
                </div>
              </div>
            </Card>
          );
        })}
        {filtered.length===0&&search&&<Card><p style={{color:"#334155",textAlign:"center",margin:0}}>Aucun résultat pour "{search}"</p></Card>}
      </div>

      {showAdd&&<Modal title="👶 Nouvel enfant" onClose={()=>setShowAdd(false)} wide>
        <F label="N° Carnet"><TI placeholder="Ex: FN-2025-001" value={newE.numeroCarnet} onChange={e=>setNE({...newE,numeroCarnet:e.target.value})}/></F>
        <F label="Nom complet"><TI placeholder="Prénom Nom" value={newE.nom} onChange={e=>setNE({...newE,nom:e.target.value})}/></F>
        <F label="Date de naissance"><TI type="date" value={newE.dateNaissance} onChange={e=>setNE({...newE,dateNaissance:e.target.value})}/></F>
        <F label="Lieu de naissance"><TI placeholder="Ex: Fass Ngom" value={newE.lieuNaissance} onChange={e=>setNE({...newE,lieuNaissance:e.target.value})}/></F>
        <F label="Sexe"><SL value={newE.sexe} onChange={e=>setNE({...newE,sexe:e.target.value})} options={[{v:"M",l:"Masculin"},{v:"F",l:"Féminin"}]}/></F>
        <F label="Groupe sanguin"><SL value={newE.medical.groupeSanguin} onChange={e=>setNE({...newE,medical:{...newE.medical,groupeSanguin:e.target.value}})} options={GROUPES.map(g=>({v:g,l:g}))}/></F>
        <div style={{borderTop:"1px solid rgba(255,255,255,0.07)",paddingTop:14,marginTop:4}}>
          <p style={lbl}>👩 Mère</p>
          <F label="Nom"><TI value={newE.mere.nom} onChange={e=>setNE({...newE,mere:{...newE.mere,nom:e.target.value}})}/></F>
          <F label="Téléphone / WhatsApp"><TI placeholder="+221 77 000 00 00" value={newE.mere.telephone} onChange={e=>setNE({...newE,mere:{...newE.mere,telephone:e.target.value,whatsapp:e.target.value}})}/></F>
        </div>
        <Btn full style={{marginTop:8}} onClick={doAdd}>Enregistrer dans Supabase</Btn>
      </Modal>}
    </div>
  );
};

// ─── PARENT APP ───────────────────────────────────────────────────────────────
const ParentApp = ({ onBack }) => {
  const [phone, setPhone] = useState("");
  const [load, setLoad] = useState(false);
  const [mine, setMine] = useState([]);
  const [searched, setSearched] = useState(false);
  const [sel, setSel] = useState(null);

  const chercher = async () => {
    if(phone.length<6) return;
    setLoad(true);
    const all = await db.getAll();
    setMine(all.map(fromRow).filter(c=>c.mere?.telephone?.replace(/\s/g,"").includes(phone.replace(/\s/g,""))));
    setSearched(true);
    setLoad(false);
  };

  if(sel){
    const e = mine.find(c=>c.id===sel);
    return (
      <div style={{minHeight:"100vh",background:"#080e14",fontFamily:"'Nunito','Segoe UI',sans-serif",color:"#e2e8f0"}}>
        <div style={{background:"rgba(255,255,255,0.02)",borderBottom:"1px solid rgba(255,255,255,0.06)",padding:"14px 18px",display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,zIndex:100,backdropFilter:"blur(12px)"}}>
          <button onClick={()=>setSel(null)} style={{background:"none",border:"none",color:"#475569",cursor:"pointer",fontSize:20}}>←</button>
          <span style={{fontSize:22}}>👩‍👦</span>
          <div><p style={{margin:0,color:"#f1f5f9",fontWeight:900,fontSize:15}}>Espace Parent</p><p style={{margin:0,color:"#475569",fontSize:11}}>Dispensaire Fass Ngom</p></div>
        </div>
        <div style={{padding:"18px 16px",maxWidth:640,margin:"0 auto"}}>
          <Fiche enfant={e} isAdmin={false} onBack={()=>setSel(null)} onSave={()=>{}}/>
        </div>
      </div>
    );
  }

  return (
    <div style={{minHeight:"100vh",background:"#080e14",fontFamily:"'Nunito','Segoe UI',sans-serif",color:"#e2e8f0"}}>
      <div style={{background:"rgba(255,255,255,0.02)",borderBottom:"1px solid rgba(255,255,255,0.06)",padding:"14px 18px",display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,zIndex:100,backdropFilter:"blur(12px)"}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:"#475569",cursor:"pointer",fontSize:20}}>←</button>
        <span style={{fontSize:22}}>👩‍👦</span>
        <div><p style={{margin:0,color:"#f1f5f9",fontWeight:900,fontSize:15}}>Espace Parent</p><p style={{margin:0,color:"#475569",fontSize:11}}>Dispensaire Fass Ngom</p></div>
      </div>
      <div style={{padding:"20px 16px",maxWidth:640,margin:"0 auto"}}>
        <Card style={{marginBottom:20}}>
          <p style={{margin:"0 0 12px",color:"#94a3b8",fontSize:13}}>Entrez votre numéro pour accéder au carnet de votre enfant</p>
          <div style={{display:"flex",gap:10}}>
            <TI placeholder="+221 77 000 00 00" value={phone} onChange={e=>{setPhone(e.target.value);setSearched(false);}} style={{flex:1}} onKeyDown={e=>e.key==="Enter"&&chercher()}/>
            <Btn onClick={chercher}>{load?"...":"Chercher"}</Btn>
          </div>
        </Card>
        {load&&<Spinner/>}
        {searched&&!load&&!mine.length&&<Card><p style={{color:"#334155",textAlign:"center",margin:0}}>Aucun enfant trouvé.<br/><span style={{fontSize:12}}>Contactez le dispensaire pour vous enregistrer.</span></p></Card>}
        {mine.map(c=>{
          const prochain=c.vaccins.find(v=>v.statut!=="fait");
          const retard=c.vaccins.some(v=>v.statut==="en retard");
          const der=c.mesures.slice(-1)[0];
          return(
            <Card key={c.id} style={{marginBottom:12}} onClick={()=>setSel(c.id)}>
              <div style={{display:"flex",alignItems:"center",gap:14}}>
                <div style={{width:50,height:50,borderRadius:"50%",background:c.sexe==="F"?"linear-gradient(135deg,#ec4899,#be185d)":"linear-gradient(135deg,#3b82f6,#1d4ed8)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,flexShrink:0}}>{c.sexe==="F"?"👧":"👦"}</div>
                <div style={{flex:1}}>
                  <p style={{margin:0,color:"#f1f5f9",fontWeight:800}}>{c.nom}</p>
                  <p style={{margin:"3px 0 0",color:"#64748b",fontSize:12}}>{ageStr(c.dateNaissance)}{der&&` · ${der.poids}kg`}</p>
                  {prochain&&<p style={{margin:"3px 0 0",color:"#3b82f6",fontSize:12}}>💉 {prochain.nom} · {fmt(prochain.datePrevu)}</p>}
                </div>
                <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
                  {retard&&<Badge s="en retard"/>}
                  <span style={{color:"#334155",fontSize:16}}>›</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

// ─── HEADER ───────────────────────────────────────────────────────────────────
const Header = ({ title, sub, onLogout }) => (
  <div style={{background:"rgba(255,255,255,0.02)",borderBottom:"1px solid rgba(255,255,255,0.06)",padding:"14px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100,backdropFilter:"blur(12px)"}}>
    <div style={{display:"flex",alignItems:"center",gap:10}}>
      <span style={{fontSize:22}}>👨‍⚕️</span>
      <div><p style={{margin:0,color:"#f1f5f9",fontWeight:900,fontSize:15}}>{title}</p><p style={{margin:0,color:"#10b981",fontSize:11}}>{sub}</p></div>
    </div>
    {onLogout&&<Btn sm v="ghost" onClick={onLogout}>Déconnexion</Btn>}
  </div>
);

// ─── ACCUEIL ──────────────────────────────────────────────────────────────────
const Accueil = ({ onAdmin, onParent }) => (
  <div style={{minHeight:"100vh",background:"#080e14",fontFamily:"'Nunito','Segoe UI',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
    <div style={{width:"100%",maxWidth:420,textAlign:"center"}}>
      <div style={{width:88,height:88,borderRadius:28,background:"linear-gradient(135deg,#10b981,#0d9488)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:44,margin:"0 auto 18px",boxShadow:"0 0 60px rgba(16,185,129,0.3)"}}>🏥</div>
      <h1 style={{margin:0,color:"#f1f5f9",fontSize:26,fontWeight:900,letterSpacing:-.5}}>Carnet de Santé</h1>
      <p style={{margin:"6px 0 2px",color:"#10b981",fontSize:16,fontWeight:800}}>Dispensaire Fass Ngom</p>
      <p style={{margin:"0 0 32px",color:"#334155",fontSize:13}}>Suivi pédiatrique · Vaccinations · Croissance</p>
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        {[
          {icon:"👨‍⚕️",title:"Espace Soignant",sub:"Infirmier · Médecin · Administrateur",color:"#10b981",onClick:onAdmin},
          {icon:"👩‍👦",title:"Espace Parent",sub:"Mère · Père · Tuteur légal",color:"#3b82f6",onClick:onParent},
        ].map(btn=>(
          <button key={btn.title} onClick={btn.onClick} style={{background:`linear-gradient(135deg,${btn.color}14,${btn.color}08)`,border:`1px solid ${btn.color}28`,borderRadius:18,padding:"20px 24px",cursor:"pointer",textAlign:"left",fontFamily:"inherit",transition:"border-color .2s"}}
            onMouseEnter={e=>e.currentTarget.style.borderColor=btn.color+"70"} onMouseLeave={e=>e.currentTarget.style.borderColor=btn.color+"28"}>
            <div style={{display:"flex",alignItems:"center",gap:14}}>
              <span style={{fontSize:36}}>{btn.icon}</span>
              <div><p style={{margin:0,color:btn.color,fontWeight:900,fontSize:16}}>{btn.title}</p><p style={{margin:"3px 0 0",color:"#475569",fontSize:12}}>{btn.sub}</p></div>
            </div>
          </button>
        ))}
      </div>
      <p style={{color:"#1a2535",fontSize:11,marginTop:28}}>Fass Ngom · Saint-Louis · Sénégal 🇸🇳</p>
    </div>
  </div>
);

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("accueil");
  const [auth, setAuth] = useState(false);
  if(screen==="accueil") return <Accueil onAdmin={()=>setScreen("login")} onParent={()=>setScreen("parent")}/>;
  if(screen==="login") return <Login onLogin={()=>{setAuth(true);setScreen("admin");}}/>;
  if(screen==="admin"&&auth) return <AdminApp onLogout={()=>{setAuth(false);setScreen("accueil");}}/>;
  if(screen==="parent") return <ParentApp onBack={()=>setScreen("accueil")}/>;
  return null;
}
