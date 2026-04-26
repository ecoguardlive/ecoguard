// ECO GUARD TECHNOLOGIES — data.js
// Themes, users, companies, pipelines, state, session, audit, notifications

// ══════════════════════════════════════════════════════════════════
//  ECO GUARD TECHNOLOGIES  –  Pipeline Security Monitor
//  Pure Vanilla JS/SVG — no external dependencies
// ══════════════════════════════════════════════════════════════════

// ─── THEMES ───────────────────────────────────────────────────────
const THEMES = {
  dark: {
    name:"Dark Ocean", icon:"dark", swatch:"#22d3ee",
    bg:"#060f1e", surface:"rgba(15,30,54,0.6)", surfaceHover:"rgba(15,30,54,0.9)",
    border:"rgba(34,211,238,0.18)", borderStrong:"rgba(34,211,238,0.35)",
    header:"rgba(15,30,54,0.97)", headerBorder:"rgba(34,211,238,0.2)",
    text:"#ffffff", textMuted:"rgba(34,211,238,0.55)", textFaint:"rgba(34,211,238,0.35)",
    accent:"#22d3ee", accentBg:"rgba(34,211,238,0.1)", accentBgHover:"rgba(34,211,238,0.2)",
    navActive:"#22d3ee", navInactive:"rgba(34,211,238,0.45)",
    inputBg:"rgba(5,14,26,0.8)", inputBorder:"rgba(34,211,238,0.25)",
    cardGrid:"#060f1e", gridLine:"#0f1e36", tooltipBg:"#0a1628",
  },
  army: {
    name:"Army Green", icon:"army", swatch:"#4ade80",
    bg:"#0d1a0e", surface:"rgba(20,40,22,0.7)", surfaceHover:"rgba(20,40,22,0.95)",
    border:"rgba(74,222,128,0.18)", borderStrong:"rgba(74,222,128,0.35)",
    header:"rgba(13,26,14,0.97)", headerBorder:"rgba(74,222,128,0.2)",
    text:"#f0fdf4", textMuted:"rgba(74,222,128,0.6)", textFaint:"rgba(74,222,128,0.35)",
    accent:"#4ade80", accentBg:"rgba(74,222,128,0.1)", accentBgHover:"rgba(74,222,128,0.2)",
    navActive:"#4ade80", navInactive:"rgba(74,222,128,0.45)",
    inputBg:"rgba(8,16,9,0.9)", inputBorder:"rgba(74,222,128,0.25)",
    cardGrid:"#0d1a0e", gridLine:"#132615", tooltipBg:"#0d1a0e",
  },
  amber: {
    name:"Amber Alert", icon:"amber", swatch:"#fbbf24",
    bg:"#1a1200", surface:"rgba(40,28,0,0.7)", surfaceHover:"rgba(40,28,0,0.95)",
    border:"rgba(251,191,36,0.18)", borderStrong:"rgba(251,191,36,0.35)",
    header:"rgba(26,18,0,0.97)", headerBorder:"rgba(251,191,36,0.2)",
    text:"#fffbeb", textMuted:"rgba(251,191,36,0.6)", textFaint:"rgba(251,191,36,0.35)",
    accent:"#fbbf24", accentBg:"rgba(251,191,36,0.1)", accentBgHover:"rgba(251,191,36,0.2)",
    navActive:"#fbbf24", navInactive:"rgba(251,191,36,0.45)",
    inputBg:"rgba(13,9,0,0.9)", inputBorder:"rgba(251,191,36,0.25)",
    cardGrid:"#1a1200", gridLine:"#241900", tooltipBg:"#1a1200",
  },
  white: {
    name:"Clean White", icon:"white", swatch:"#0f76a8",
    bg:"#f8fafc", surface:"rgba(255,255,255,0.9)", surfaceHover:"rgba(255,255,255,1)",
    border:"rgba(15,118,168,0.15)", borderStrong:"rgba(15,118,168,0.4)",
    header:"rgba(255,255,255,0.98)", headerBorder:"rgba(15,118,168,0.15)",
    text:"#0f172a", textMuted:"rgba(15,118,168,0.7)", textFaint:"rgba(15,118,168,0.4)",
    accent:"#0f76a8", accentBg:"rgba(15,118,168,0.08)", accentBgHover:"rgba(15,118,168,0.15)",
    navActive:"#0f76a8", navInactive:"rgba(15,118,168,0.45)",
    inputBg:"#f1f5f9", inputBorder:"rgba(15,118,168,0.25)",
    cardGrid:"#f8fafc", gridLine:"#e2e8f0", tooltipBg:"#ffffff",
  },
  slate: {
    name:"Slate Pro", icon:"slate", swatch:"#94a3b8",
    bg:"#0f172a", surface:"rgba(30,41,59,0.7)", surfaceHover:"rgba(30,41,59,0.95)",
    border:"rgba(148,163,184,0.18)", borderStrong:"rgba(148,163,184,0.35)",
    header:"rgba(15,23,42,0.97)", headerBorder:"rgba(148,163,184,0.18)",
    text:"#f1f5f9", textMuted:"rgba(148,163,184,0.75)", textFaint:"rgba(148,163,184,0.4)",
    accent:"#94a3b8", accentBg:"rgba(148,163,184,0.1)", accentBgHover:"rgba(148,163,184,0.2)",
    navActive:"#e2e8f0", navInactive:"rgba(148,163,184,0.5)",
    inputBg:"rgba(15,23,42,0.9)", inputBorder:"rgba(148,163,184,0.2)",
    cardGrid:"#0f172a", gridLine:"#1e293b", tooltipBg:"#1e293b",
  },
};

// ─── USERS ────────────────────────────────────────────────────────
const USERS = [
  { email:"AmoahAnshel@ecoguard.com",            password:"UEBO529325", role:"admin",    name:"Amoah Anshel",                zone:"ALL" },
  { email:"AhwirenAgnesAbrefi@ecoguard.com",     password:"UEB0532325", role:"engineer", name:"Ahwiren Agnes Abrefi",         zone:"A" },
  { email:"AduGyamfiBeatrice@ecoguard.com",      password:"UEB0516825", role:"engineer", name:"Adu Gyamfi Beatrice",          zone:"B" },
  { email:"AduDeborahGyamfi@ecoguard.com",       password:"UEBO511825", role:"engineer", name:"Adu Deborah Gyamfi",           zone:"C" },
  { email:"AdongoRichardAdiba@ecoguard.com",     password:"EUB0515025", role:"engineer", name:"Adongo Richard Adiba",         zone:"D" },
  { email:"BuneraahMartinAnbanbieo@ecoguard.com",password:"UEB0523725", role:"engineer", name:"Buneraah Martin Anbanbieo",   zone:"E" },
  { email:"SapakbonJenniferYindaanpoka@ecoguard.com",password:"UEB0531925",role:"engineer",name:"Sapakbon Jennifer Yindaanpoka",zone:"F"},
  { email:"ChukwukaOluomaMarian@ecoguard.com",   password:"UEB0506925", role:"engineer", name:"Chukwuka Oluoma Marian",       zone:"G" },
  { email:"BoakyeEgyimaNanaYaa@ecoguard.com",    password:"UEB0523925", role:"engineer", name:"Boakye Egyima Nana Yaa",       zone:"H" },
  { email:"TwumasiChristabel@ecoguard.com",      password:"URB0522125", role:"engineer", name:"Twumasi Christabel",           zone:"I" },
  { email:"MensahMary@ecoguard.com",             password:"UEB0532625", role:"engineer", name:"Mensah Mary",                  zone:"J" },
  { email:"AnabaJessica@ecoguard.com",           password:"UEB0531325", role:"engineer", name:"Anaba Jessica",                zone:"K" },
  { email:"LouisaAnimaApraku@ecoguard.com",      password:"UEB0519425", role:"engineer", name:"Louisa Anima Apraku",          zone:"L" },
];

const COMPANIES = [
  { id:"shell",       name:"Shell Petroleum",      status:"operational", pipelines:12, alerts:0, region:"Gulf of Guinea",   pressure:"normal",   flow:"normal",  lastUpdate:"2 min ago" },
  { id:"chevron",     name:"TotalEnergies Ghana",  status:"warning",     pipelines:8,  alerts:2, region:"Tano Basin",       pressure:"warning",  flow:"normal",  lastUpdate:"1 min ago" },
  { id:"exxon",       name:"Eni Ghana E&P",        status:"operational", pipelines:15, alerts:0, region:"Cape Three Points", pressure:"normal",   flow:"normal",  lastUpdate:"3 min ago" },
  { id:"bp",          name:"Tullow Oil Ghana",     status:"critical",    pipelines:10, alerts:1, region:"Jubilee Field",    pressure:"critical", flow:"warning", lastUpdate:"30 sec ago" },
];

const ENGINEERS_BY_ZONE = Object.fromEntries(
  USERS.filter(u => u.role === "engineer").map(u => [u.zone, u])
);
const ZONE_PIPELINE_MAP = {
  A:"shell",B:"shell",C:"chevron",D:"chevron",
  E:"exxon",F:"exxon",G:"bp",H:"bp",I:"shell",J:"chevron",K:"exxon",L:"bp",
};

// ─── PIPELINE CONFIGS ─────────────────────────────────────────────
const PIPELINE_CONFIGS = {
  shell: [
    { id:"pipeline-1", name:"Main Pipeline A (Zone A)", status:"operational",
      path:"M 80 180 L 280 180 L 480 140 L 680 140",
      sensors:[{id:"s1",type:"pressure",x:140,y:180,status:"normal"},{id:"s2",type:"flow",x:330,y:160,status:"normal"},{id:"s3",type:"acoustic",x:520,y:140,status:"normal"},{id:"s4",type:"infrared",x:670,y:140,status:"normal"},{id:"s5",type:"temperature",x:200,y:170,status:"normal"}]},
    { id:"pipeline-2", name:"Secondary Line B (Zone B)", status:"operational",
      path:"M 80 280 L 300 280 L 500 300 L 700 280",
      sensors:[{id:"s6",type:"pressure",x:150,y:280,status:"normal"},{id:"s7",type:"flow",x:380,y:290,status:"normal"},{id:"s8",type:"vibration",x:600,y:285,status:"normal"}]},
    { id:"pipeline-3", name:"Offshore Link (Zone I)", status:"operational",
      path:"M 80 380 L 400 360 L 700 380",
      sensors:[{id:"s9",type:"pressure",x:200,y:374,status:"normal"},{id:"s10",type:"acoustic",x:550,y:368,status:"normal"},{id:"s11",type:"corrosion",x:650,y:375,status:"normal"}]},
  ],
  chevron: [
    { id:"pipeline-1", name:"Tano Main Line (Zone C)", status:"warning",
      path:"M 80 150 L 250 200 L 480 200 L 700 150",
      sensors:[{id:"s12",type:"pressure",x:140,y:170,status:"warning"},{id:"s13",type:"flow",x:350,y:200,status:"normal"},{id:"s14",type:"acoustic",x:580,y:170,status:"warning"},{id:"s15",type:"gas",x:450,y:190,status:"normal"}]},
    { id:"pipeline-2", name:"Deepwater Line D (Zone D)", status:"warning",
      path:"M 80 320 L 350 300 L 620 320 L 700 360",
      sensors:[{id:"s16",type:"pressure",x:200,y:314,status:"warning"},{id:"s17",type:"infrared",x:490,y:308,status:"normal"},{id:"s18",type:"temperature",x:300,y:310,status:"normal"}]},
    { id:"pipeline-3", name:"Export Connector (Zone J)", status:"operational",
      path:"M 80 440 L 400 420 L 700 440",
      sensors:[{id:"s19",type:"flow",x:250,y:434,status:"normal"},{id:"s20",type:"pressure",x:560,y:430,status:"normal"},{id:"s21",type:"water",x:400,y:425,status:"normal"}]},
  ],
  exxon: [
    { id:"pipeline-1", name:"Cape Three Points Alpha (Zone E)", status:"operational",
      path:"M 80 120 L 300 100 L 550 120 L 700 100",
      sensors:[{id:"s22",type:"pressure",x:170,y:114,status:"normal"},{id:"s23",type:"flow",x:410,y:108,status:"normal"},{id:"s24",type:"infrared",x:620,y:112,status:"normal"},{id:"s25",type:"vibration",x:250,y:105,status:"normal"}]},
    { id:"pipeline-2", name:"Offshore F Line (Zone F)", status:"operational",
      path:"M 80 260 L 240 240 L 500 260 L 700 240",
      sensors:[{id:"s26",type:"acoustic",x:160,y:254,status:"normal"},{id:"s27",type:"pressure",x:370,y:250,status:"normal"},{id:"s28",type:"corrosion",x:500,y:255,status:"normal"}]},
    { id:"pipeline-3", name:"Sankofa K Export (Zone K)", status:"operational",
      path:"M 80 400 L 380 380 L 700 400",
      sensors:[{id:"s29",type:"flow",x:220,y:394,status:"normal"},{id:"s30",type:"infrared",x:540,y:390,status:"normal"},{id:"s31",type:"gas",x:350,y:385,status:"normal"}]},
  ],
  bp: [
    { id:"pipeline-1", name:"Jubilee Main G (Zone G)", status:"critical",
      path:"M 80 160 L 220 180 L 460 160 L 680 180",
      sensors:[{id:"s32",type:"pressure",x:140,y:168,status:"critical"},{id:"s33",type:"flow",x:330,y:162,status:"warning"},{id:"s34",type:"acoustic",x:550,y:168,status:"critical"},{id:"s35",type:"temperature",x:200,y:175,status:"critical"}]},
    { id:"pipeline-2", name:"TEN Field H (Zone H)", status:"warning",
      path:"M 80 310 L 300 290 L 550 310 L 700 290",
      sensors:[{id:"s36",type:"infrared",x:180,y:305,status:"warning"},{id:"s37",type:"pressure",x:420,y:300,status:"warning"},{id:"s38",type:"water",x:550,y:295,status:"normal"}]},
    { id:"pipeline-3", name:"Enyenra-Ntomme L (Zone L)", status:"warning",
      path:"M 80 430 L 380 410 L 700 430",
      sensors:[{id:"s39",type:"flow",x:220,y:424,status:"warning"},{id:"s40",type:"pressure",x:540,y:418,status:"normal"},{id:"s41",type:"vibration",x:400,y:415,status:"warning"}]},
  ],
};

// ─── DYNAMIC COMPANIES (mutable, starts with defaults) ────────────
let COMPANIES_DATA = [...COMPANIES]; // mutable copy
// Override COMPANIES reference with a getter proxy pattern
function getCompanies() { return COMPANIES_DATA; }

// ─── STATE ────────────────────────────────────────────────────────
let state = {
  user: null,
  page: "dashboard",
  theme: "dark",
  sensorStates: {},
  showAddCompany: false,
  addCompanyForm: { name:'', region:'', pipelines:'', status:'operational' },
  alerts: {
    bp: [
      { id:"a1", severity:"critical", type:"pressure", title:"Critical Pressure Drop Detected",
        description:"Sudden pressure drop of 15% in main pipeline. Possible leak at junction point. Immediate intervention required.",
        location:"Pipeline 1, Sensor P-001", timestamp:new Date(), resolved:false, assignedTo:null },
      { id:"a2", severity:"warning", type:"flow", title:"Flow Imbalance Warning",
        description:"Inlet-outlet flow differential exceeds 10%. Potential oil loss detected.",
        location:"Pipeline 1, Junction 3", timestamp:new Date(Date.now()-120000), resolved:false, assignedTo:null },
      { id:"a3", severity:"critical", type:"temperature", title:"Overheating Detected",
        description:"Pipeline temperature exceeding safe limits. Risk of material degradation.",
        location:"Pipeline 1, Sensor T-001", timestamp:new Date(Date.now()-60000), resolved:false, assignedTo:null },
    ],
    chevron: [
      { id:"a4", severity:"warning", type:"pressure", title:"Pressure Abnormality Detected",
        description:"Early-stage pressure fluctuation. Monitoring for structural stress.",
        location:"Primary Transport Line, Sensor P-002", timestamp:new Date(Date.now()-60000), resolved:false, assignedTo:null },
      { id:"a5", severity:"warning", type:"flow", title:"Minor Flow Rate Variation",
        description:"Flow rate showing minor variations. Trend analysis underway.",
        location:"Primary Transport Line, Flow Monitor F-001", timestamp:new Date(Date.now()-300000), resolved:false, assignedTo:null },
      { id:"a6", severity:"warning", type:"gas", title:"Gas Leak Suspected",
        description:"Elevated gas levels detected. Potential leak in gas monitoring system.",
        location:"Tano Main Line, Gas Sensor G-001", timestamp:new Date(Date.now()-180000), resolved:false, assignedTo:null },
    ],
    shell: [
      { id:"a7", severity:"info", type:"acoustic", title:"Routine Maintenance Reminder",
        description:"All sensors operational. No abnormalities detected.",
        location:"All Pipelines", timestamp:new Date(Date.now()-600000), resolved:false, assignedTo:null },
      { id:"a8", severity:"warning", type:"vibration", title:"Vibration Anomaly",
        description:"Unusual vibration patterns detected. Possible equipment malfunction.",
        location:"Secondary Line B, Vibration Sensor V-001", timestamp:new Date(Date.now()-240000), resolved:false, assignedTo:null },
    ],
    exxon: [
      { id:"a9", severity:"info", type:"infrared", title:"System Health Check Complete",
        description:"All monitoring systems operational. No anomalies detected.",
        location:"All Pipelines", timestamp:new Date(Date.now()-900000), resolved:false, assignedTo:null },
      { id:"a10", severity:"warning", type:"corrosion", title:"Corrosion Warning",
        description:"Corrosion rate above threshold. Schedule inspection.",
        location:"Offshore F Line, Corrosion Sensor C-001", timestamp:new Date(Date.now()-360000), resolved:false, assignedTo:null },
    ],
  },
  companyPage: { selectedPipeline:"pipeline-1", tab:"sensors" },
  alertFilter: "all",
  showAlarmDropdown: false,
  showThemePicker: false,
  sensorData: { pressure:[], flow:[], acoustic:[], infrared:[], temperature:[], vibration:[], corrosion:[], gas:[], water:[] },
  sensorInterval: null,
  alarmActive: false,
  alarmInterval: null,
  voiceCooldown: false,
  alarmEnabled: true,       // master alarm toggle (sound + modal)
  alarmSoundEnabled: true,  // audio-only sub-toggle
  alarmVoiceEnabled: true,  // voice announcement sub-toggle
  mapSelectedNode: null,    // which company node is selected on the map
  alarmTypesEnabled: { pressure: true, flow: true, acoustic: true, infrared: true, temperature: true, vibration: true, corrosion: true, gas: true, water: true }, // per-type alarm toggles
  // ── v6 additions ──
  showSearch: false,
  searchQuery: '',
  _searchResults: [],
  alertNotes: {},          // alertId -> [{author,text,time}]
  engineerAvailability: {}, // email -> 'available'|'busy'|'offline'
  // ── v7: auth & user management ──
  sessionToken: null,
  showAdminPanel: false,
  adminPanelTab: 'users',   // 'users' | 'add' | 'audit'
  adminEditUser: null,
  adminAddForm: { name:'', email:'', password:'', role:'engineer', zone:'A' },
  showPasswordModal: false,
  passwordForm: { current:'', newPw:'', confirm:'' },
  passwordError: '',
  // ── v7: alert features ──
  alertAcknowledgments: {},  // alertId -> {name, time}
  escalationTimers: {},      // alertId -> escalation timeout tracking
  notificationLog: [],       // simulated push/email/SMS log
  auditLog: [],              // [{time, user, action, detail}]
  pushNotifEnabled: true,
  emailAlertEnabled: true,
  smsAlertEnabled: false,
  escalationMinutes: 10,
  showNotifLog: false,
  // ── Sensor-type thresholds (global defaults) ──
  sensorThresholds: {
    pressure:    { warn: 85,   critical: 70   },  // PSI
    flow:        { warn: 800,  critical: 650  },  // L/min
    temperature: { warn: 30,   critical: 35   },  // °C
    acoustic:    { warn: 45,   critical: 48   },  // dB
    infrared:    { warn: 32,   critical: 38   },  // °C
    vibration:   { warn: 3,    critical: 5    },  // mm/s
    corrosion:   { warn: 0.08, critical: 0.12 },  // mm/yr
    gas:         { warn: 60,   critical: 80   },  // ppm
    water:       { warn: 6,    critical: 9    },  // L/h
  },
  // ── Pipeline-level thresholds (keyed by "companyId|pipelineId") ──
  pipelineThresholds: {},   // e.g. "bp|pipeline-1" -> { maxPressure, maxFlow, maxTemp, minFlow }
  showThresholdModal: false,
  showPipelineThresholdModal: false,
  pipelineThresholdTarget: null,  // { companyId, pipelineId, pipelineName }
};

// ─── V6: INIT ENGINEER AVAILABILITY ──────────────────────────────
USERS.filter(u=>u.role==='engineer').forEach(u => {
  state.engineerAvailability[u.email] = 'available';
});

// ─── V7: MUTABLE USERS (admin can add/remove/edit) ────────────────
let USERS_DATA = [...USERS];
function getUsers() { return USERS_DATA; }
function getUsersByZone() {
  return Object.fromEntries(
    USERS_DATA.filter(u => u.role === 'engineer').map(u => [u.zone, u])
  );
}

// ─── V7: SESSION PERSISTENCE ──────────────────────────────────────
(function restoreSession() {
  try {
    const raw = localStorage.getItem('ecoguard_session');
    if (!raw) return;
    const { token, email, expires } = JSON.parse(raw);
    if (Date.now() > expires) { localStorage.removeItem('ecoguard_session'); return; }
    const user = USERS_DATA.find(u => u.email === email);
    if (user && token) { state.user = user; state.sessionToken = token; }
  } catch(e) { localStorage.removeItem('ecoguard_session'); }
})();

function saveSession(user) {
  try {
    const token = 'tok_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    const exp = Date.now() + 8 * 60 * 60 * 1000;
    localStorage.setItem('ecoguard_session', JSON.stringify({ token, email: user.email, expires: exp }));
    state.sessionToken = token;
  } catch(e) {}
}
function clearSession() {
  try { localStorage.removeItem('ecoguard_session'); } catch(e) {}
  state.sessionToken = null;
}

// ─── V7: AUDIT LOG ────────────────────────────────────────────────
function addAuditEntry(action, detail) {
  if (!state.user) return;
  state.auditLog.unshift({ time: new Date(), user: state.user.name, role: state.user.role, action, detail });
  if (state.auditLog.length > 200) state.auditLog.pop();
}

// ─── V7: SIMULATED PUSH / EMAIL / SMS NOTIFICATIONS ───────────────
function dispatchNotification(type, alert, engineer) {
  const now = new Date();
  const entry = {
    id: 'notif_' + Date.now() + Math.random(),
    type,
    severity: alert.severity,
    alertTitle: alert.title,
    recipient: engineer ? engineer.name : 'All Engineers',
    recipientEmail: engineer ? engineer.email : 'broadcast',
    timestamp: now,
    escalated: false,
  };
  state.notificationLog.unshift(entry);
  if (state.notificationLog.length > 100) state.notificationLog.pop();
  // Browser Push (real Web API)
  if (type === 'push' && state.pushNotifEnabled && 'Notification' in window) {
    if (Notification.permission === 'granted') {
      try { new Notification('EcoGuard ' + alert.severity.toUpperCase(), { body: alert.title + '\n' + alert.location, tag: alert.id }); } catch(e) {}
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }
  return entry;
}

function triggerAlertNotifications(alert, companyId) {
  const companyZones = Object.entries(ZONE_PIPELINE_MAP).filter(([z,c]) => c === companyId).map(([z]) => z);
  const engineers = companyZones.map(z => getUsersByZone()[z]).filter(Boolean);
  // Notify each engineer assigned to this company
  engineers.forEach(engineer => {
    if (state.pushNotifEnabled)  dispatchNotification('push',  alert, engineer);
    if (state.emailAlertEnabled) dispatchNotification('email', alert, engineer);
    if (state.smsAlertEnabled)   dispatchNotification('sms',   alert, engineer);
  });
  if (engineers.length === 0) {
    if (state.pushNotifEnabled)  dispatchNotification('push',  alert, null);
    if (state.emailAlertEnabled) dispatchNotification('email', alert, null);
    if (state.smsAlertEnabled)   dispatchNotification('sms',   alert, null);
  }
  const names = engineers.map(e => e.name).join(', ');
  if (names) addAuditEntry('notify', `${alert.severity} alert "${alert.title}" — notified ${names}`);
}

// ─── V7: ALERT ESCALATION ─────────────────────────────────────────
function startEscalationTimer(alertId, companyId) {
  if (state.escalationTimers[alertId]) return;
  const mins = Math.max(1, state.escalationMinutes || 10);
  const timer = setTimeout(() => {
    const alert = (state.alerts[companyId]||[]).find(a=>a.id===alertId);
    if (!alert || alert.resolved || state.alertAcknowledgments[alertId]) {
      delete state.escalationTimers[alertId]; return;
    }
    const admin = USERS_DATA.find(u=>u.role==='admin');
    if (admin) {
      state.notificationLog.unshift({
        id: 'esc_' + Date.now(), type: 'email', severity: alert.severity,
        alertTitle: '[ESCALATED] ' + alert.title, recipient: admin.name,
        recipientEmail: admin.email, timestamp: new Date(), escalated: true,
      });
      addAuditEntry('escalate', `Alert "${alert.title}" unacknowledged after ${mins}min — escalated to ${admin.name}`);
      pushActivity('alert', '⚠️', `ESCALATED: ${alert.title} — sent to admin`, companyId);
    }
    delete state.escalationTimers[alertId];
  }, mins * 60 * 1000);
  state.escalationTimers[alertId] = timer;
}

function acknowledgeAlert(alertId, companyId) {
  const alert = (state.alerts[companyId]||[]).find(a=>a.id===alertId);
  state.alertAcknowledgments[alertId] = { name: state.user?.name || 'Unknown', time: new Date() };
  if (state.escalationTimers[alertId]) {
    clearTimeout(state.escalationTimers[alertId]);
    delete state.escalationTimers[alertId];
  }
  addAuditEntry('acknowledge', `Alert "${alert?.title||alertId}" acknowledged by ${state.user?.name}`);
  pushActivity('resolve', 'ACK', `Alert acknowledged by ${state.user?.name}`, companyId);
  render();
}

// ─── V6: ACTIVITY FEED ────────────────────────────────────────────
const ACTIVITY_FEED = [
  { id:'act1', type:'alert',    icon:'⚠️', text:'Critical pressure drop detected on Jubilee Main G',           company:'bp',      time: new Date(Date.now()-120000)  },
  { id:'act2', type:'resolve',  icon:'✅', text:'Flow imbalance resolved at Shell Secondary Line B',           company:'shell',   time: new Date(Date.now()-300000)  },
  { id:'act3', type:'dispatch', icon:'👷', text:'Engineer dispatched to TotalEnergies Tano Main Line',         company:'chevron', time: new Date(Date.now()-480000)  },
  { id:'act4', type:'sensor',   icon:'📡', text:'Corrosion sensor C-001 went offline — Eni Offshore F Line',  company:'exxon',   time: new Date(Date.now()-720000)  },
  { id:'act5', type:'report',   icon:'📄', text:'Monthly Incident Report generated for April 2026',           company:'all',     time: new Date(Date.now()-1200000) },
  { id:'act6', type:'alert',    icon:'⚠️', text:'Gas level elevated at Tano Basin Zone C sensor G-001',       company:'chevron', time: new Date(Date.now()-1800000) },
  { id:'act7', type:'resolve',  icon:'✅', text:'Overheating resolved at Jubilee Main, Sensor T-001',          company:'bp',      time: new Date(Date.now()-2400000) },
  { id:'act8', type:'sensor',   icon:'🔧', text:'Calibration complete — all Cape Three Points sensors OK',    company:'exxon',   time: new Date(Date.now()-3600000) },
];
function pushActivity(type, icon, text, company) {
  ACTIVITY_FEED.unshift({ id:'act'+Date.now(), type, icon, text, company, time: new Date() });
  if (ACTIVITY_FEED.length > 20) ACTIVITY_FEED.pop();
}

// ─── V6: NETWORK STATUS ───────────────────────────────────────────
let networkOnline = navigator.onLine;
window.addEventListener('online',  () => { networkOnline = true;  showNetToast('Online',      '#34d399'); });
window.addEventListener('offline', () => { networkOnline = false; showNetToast('No network',  '#ef4444'); });
function showNetToast(msg, col) {
  const e = document.getElementById('net-toast') || document.createElement('div');
  e.id = 'net-toast';
  e.style.cssText = `position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:${col}22;border:1px solid ${col}60;color:${col};padding:8px 20px;border-radius:20px;font-size:0.78rem;font-weight:600;z-index:9999;pointer-events:none;backdrop-filter:blur(8px)`;
  e.textContent = (networkOnline ? '● ' : '○ ') + msg;
  document.body.appendChild(e);
  setTimeout(() => e.remove(), 3000);
}

// ─── V6: RISK SCORE ───────────────────────────────────────────────
function calcRiskScore(companyId) {
  const company = getCompanies().find(c=>c.id===companyId);
  if (!company) return 0;
  const alerts2 = state.alerts[companyId]||[];
  let score = alerts2.filter(a=>!a.resolved&&a.severity==='critical').length * 30
            + alerts2.filter(a=>!a.resolved&&a.severity==='warning').length * 12;
  if (company.pressure==='critical') score+=20;
  if (company.pressure==='warning')  score+=8;
  if (company.flow==='warning')      score+=8;
  if (company.status==='critical')   score+=15;
  if (company.status==='warning')    score+=6;
  return Math.min(100, score);
}
function riskColor(s) { return s>=70?'#ef4444':s>=35?'#f59e0b':'#34d399'; }
function riskLabel(s) { return s>=70?'HIGH':s>=35?'MEDIUM':'LOW'; }

// ─── V6: ACTIVITY FEED HTML ───────────────────────────────────────
function renderActivityFeed() {
  const th = t();
  return `
  <div style="background:${th.surface};border:1px solid ${th.border};border-radius:12px;overflow:hidden;margin-top:1.25rem">
    <div style="padding:0.75rem 1rem;border-bottom:1px solid ${th.border};display:flex;justify-content:space-between;align-items:center">
      <span style="color:${th.text};font-weight:600;font-size:0.85rem">System Activity</span>
      <div style="width:6px;height:6px;border-radius:50%;background:#34d399;animation:pulse 2s infinite"></div>
    </div>
    <div style="max-height:220px;overflow-y:auto">
      ${ACTIVITY_FEED.slice(0,8).map(a=>{
        const col=a.type==='alert'?'#ef4444':a.type==='resolve'?'#34d399':a.type==='dispatch'?'#f59e0b':a.type==='report'?'#60a5fa':'#a78bfa';
        return `<div style="padding:0.6rem 1rem;border-bottom:1px solid ${th.border};display:flex;align-items:flex-start;gap:10px">
          <span style="font-size:1rem;flex-shrink:0;line-height:1.4">${a.icon}</span>
          <div style="flex:1;min-width:0">
            <div style="color:${th.text};font-size:0.78rem;line-height:1.4;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${a.text}</div>
            <div style="color:${th.textFaint};font-size:0.68rem;margin-top:2px">${fmtTime(a.time)}</div>
          </div>
          <div style="width:3px;min-height:32px;border-radius:2px;background:${col};flex-shrink:0;margin-top:4px"></div>
        </div>`;
      }).join('')}
    </div>
  </div>`;
}

// ─── SEARCH ───────────────────────────────────────────────────────
function buildSearchResults(q) {
  const results = [];
  if (!q || q.length < 2) return results;
  const companies = getCompanies();
  // Companies
  companies.forEach(c => {
    if (c.name.toLowerCase().includes(q) || c.region.toLowerCase().includes(q)) {
      results.push({ type:'company', label:c.name, sub:c.region,
        action:() => {
          state.page = `company/${c.id}`;
          state.companyPage.selectedPipeline = 'pipeline-1';
          state.companyPage.tab = 'sensors';
          state.sensorData = {pressure:[],flow:[],acoustic:[],infrared:[],temperature:[],vibration:[],corrosion:[],gas:[],water:[]};
          state.showSearch = false; state.searchQuery = ''; render();
        }
      });
    }
  });
  // Engineers — use USERS_DATA so dynamically added users appear
  USERS_DATA.filter(u => u.role === 'engineer').forEach(u => {
    if (u.name.toLowerCase().includes(q) || (`zone ${u.zone}`).toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) {
      results.push({ type:'engineer', label:u.name, sub:`Zone ${u.zone} — ${u.email}`,
        action:() => { state.page='settings'; state.showSearch=false; state.searchQuery=''; render(); }
      });
    }
  });
  // Alerts — search title, location, description
  Object.entries(state.alerts)
    .flatMap(([cid,list]) => list.map(a => ({...a, companyId:cid})))
    .filter(a => !a.resolved && (
      a.title.toLowerCase().includes(q) ||
      a.location.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q)
    ))
    .slice(0, 4)
    .forEach(a => {
      const co = getCompanies().find(c => c.id === a.companyId);
      results.push({ type:'alert', label:a.title, sub:`${co?.name||a.companyId} — ${a.location}`,
        action:() => { state.page='alerts'; state.showSearch=false; state.searchQuery=''; render(); }
      });
    });
  // Pages
  ['dashboard','alerts','sensors','map','reports','settings']
    .filter(p => p.includes(q))
    .forEach(p => {
      results.push({ type:'page', label:p.charAt(0).toUpperCase()+p.slice(1), sub:'Go to page',
        action:() => { state.page=p; state.showSearch=false; state.searchQuery=''; render(); }
      });
    });
  return results;
}

function renderSearchOverlay() {
  const th = t();
  const q = (state.searchQuery||'').toLowerCase().trim();
  const results = buildSearchResults(q);
  state._searchResults = results;
  const TYPE_LABELS = { company:'Company', engineer:'Engineer', alert:'Alert', page:'Page' };
  return `
  <div id="search-overlay" style="position:fixed;inset:0;background:rgba(0,0,0,0.75);backdrop-filter:blur(8px);z-index:2000;display:flex;flex-direction:column;align-items:center;padding-top:80px;padding-left:1rem;padding-right:1rem">
    <div style="width:100%;max-width:580px">
      <div style="background:${th.header};border:1.5px solid ${th.borderStrong};border-radius:14px;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,0.6)">
        <div style="display:flex;align-items:center;gap:10px;padding:0.85rem 1rem;border-bottom:1px solid ${th.border}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${th.textMuted}" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input id="search-input" value="${(state.searchQuery||'').replace(/"/g,'&quot;')}"
            placeholder="Search companies, engineers, alerts, pages..."
            style="flex:1;background:none;border:none;outline:none;color:${th.text};font-size:0.9rem"
            autocomplete="off" spellcheck="false"/>
          <button id="close-search-btn" style="background:none;border:none;color:${th.textMuted};cursor:pointer;font-size:1.2rem;line-height:1;padding:0 4px">x</button>
        </div>
        <div style="max-height:360px;overflow-y:auto" id="search-results-list">
          ${q.length < 2
            ? `<div style="padding:2rem;text-align:center;color:${th.textMuted};font-size:0.82rem">Type at least 2 characters to search<br><br><span style="color:${th.textFaint};font-size:0.72rem">Companies &middot; Engineers &middot; Alerts &middot; Pages</span></div>`
            : results.length === 0
              ? `<div style="padding:2rem;text-align:center;color:${th.textMuted};font-size:0.82rem">No results for "<strong>${state.searchQuery.replace(/</g,'&lt;')}</strong>"</div>`
              : results.map((r,i) => `
                <div data-search-idx="${i}" style="padding:0.7rem 1rem;display:flex;align-items:center;gap:10px;cursor:pointer;border-bottom:1px solid ${th.border};transition:background 0.15s" onmouseover="this.style.background='rgba(255,255,255,0.04)'" onmouseout="this.style.background=''">
                  <div style="flex:1;min-width:0">
                    <div style="color:${th.text};font-size:0.85rem;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${r.label}</div>
                    <div style="color:${th.textFaint};font-size:0.72rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${r.sub}</div>
                  </div>
                  <span style="background:${th.accentBg};border:1px solid ${th.border};color:${th.textMuted};font-size:0.62rem;padding:2px 7px;border-radius:4px;font-weight:600;flex-shrink:0;text-transform:uppercase">${TYPE_LABELS[r.type]||r.type}</span>
                </div>`).join('')}
        </div>
      </div>
      <div style="text-align:center;margin-top:10px;color:${th.textFaint};font-size:0.72rem">Esc or click outside to close &middot; Ctrl+K to toggle</div>
    </div>
  </div>`;
}

// ─── V6: SHIFT HANDOVER ───────────────────────────────────────────
function generateShiftHandover() {
  const companies = getCompanies();
  const now = new Date();
  const allAlerts2 = Object.entries(state.alerts).flatMap(([cid,list])=>list.map(a=>({...a,companyId:cid})));
  const active2 = allAlerts2.filter(a=>!a.resolved&&a.severity!=='info');
  const availColors2 = {available:'#166534',busy:'#92400e',offline:'#475569'};
  const availBg2    = {available:'#dcfce7', busy:'#fef3c7', offline:'#f1f5f9'};
  const win = window.open('','_blank');
  if (!win) { alert('Please allow popups to generate the handover report.'); return; }
  win.document.write(`<!DOCTYPE html><html><head><title>Shift Handover ${now.toDateString()}</title>
  <style>body{font-family:'Segoe UI',Arial,sans-serif;margin:0;padding:32px;background:#f8fafc;color:#0f172a;font-size:13px}
  h1{font-size:22px;color:#0a1628;margin-bottom:4px}.sub{color:#64748b;font-size:12px;margin-bottom:28px}
  .sec-title{font-size:10px;font-weight:700;letter-spacing:.1em;color:#0369a1;margin:20px 0 10px;text-transform:uppercase;border-bottom:2px solid #bae6fd;padding-bottom:5px}
  .stat-row{display:flex;gap:10px;margin-bottom:20px}.stat{background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:12px;flex:1;text-align:center}
  .stat-v{font-size:26px;font-weight:700;color:#0a1628}.stat-l{font-size:10px;color:#64748b;margin-top:2px}
  .alert-box{background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:12px 14px;margin-bottom:8px;border-left:4px solid #e2e8f0}
  .alert-box.critical{border-left-color:#ef4444}.alert-box.warning{border-left-color:#f59e0b}
  .badge{display:inline-block;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:700;text-transform:uppercase;margin-left:6px}
  .badge.critical{background:#fee2e2;color:#b91c1c}.badge.warning{background:#fef3c7;color:#92400e}
  .eng-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:8px}
  .eng-row{background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:10px 12px;display:flex;justify-content:space-between;align-items:center}
  .act-row{display:flex;gap:10px;padding:8px 0;border-bottom:1px solid #f1f5f9}
  footer{margin-top:40px;padding-top:14px;border-top:2px solid #e2e8f0;display:flex;justify-content:space-between;color:#94a3b8;font-size:10px}
  @media print{body{padding:16px}}</style></head><body>
  <h1>Shift Handover Report</h1>
  <div class="sub">Eco Guard Technologies &middot; ${now.toLocaleString()} &middot; Outgoing: ${state.user.name}</div>
  <div class="stat-row">
    ${[['Companies',companies.length],['Pipelines',companies.reduce((s,c)=>s+c.pipelines,0)],['Active Alerts',active2.length],['Critical',active2.filter(a=>a.severity==='critical').length]].map(([l,v])=>`<div class="stat"><div class="stat-v">${v}</div><div class="stat-l">${l}</div></div>`).join('')}
  </div>
  <div class="sec-title">Active Alerts (${active2.length})</div>
  ${active2.length===0?'<p style="color:#64748b">No active alerts — all systems normal.</p>'
    :active2.map(a=>{const co=companies.find(c=>c.id===a.companyId);const notes2=state.alertNotes[a.id]||[];
    return `<div class="alert-box ${a.severity}"><b>${a.title}</b><span class="badge ${a.severity}">${a.severity}</span>
    <div style="color:#64748b;margin-top:4px">${co?.name||''} &middot; ${a.location}</div>
    <div style="color:#94a3b8;margin-top:2px">${a.description}</div>
    ${a.assignedTo?`<div style="color:#059669;margin-top:4px">${a.assignedTo}</div>`:''}
    ${notes2.length?`<div style="background:#f8fafc;padding:6px 10px;border-radius:6px;margin-top:6px">${notes2.map(n=>`<b>${n.author}:</b> ${n.text}`).join('<br>')}</div>`:''}</div>`;}).join('')}
  <div class="sec-title">Engineer Availability</div>
  <div class="eng-grid">
    ${USERS.filter(u=>u.role==='engineer').map(e=>{const av=state.engineerAvailability[e.email]||'available';
    return `<div class="eng-row"><div><b style="font-size:12px">${e.name}</b><div style="color:#94a3b8;font-size:11px">Zone ${e.zone}</div></div><span style="background:${availBg2[av]};color:${availColors2[av]};font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px">${av.toUpperCase()}</span></div>`;}).join('')}
  </div>
  <div class="sec-title">Recent Activity</div>
  ${ACTIVITY_FEED.slice(0,5).map(a=>`<div class="act-row"><span>${a.icon}</span><span style="flex:1;color:#475569">${a.text}</span><span style="color:#94a3b8">${fmtTime(a.time)}</span></div>`).join('')}
  <footer><span>Eco Guard Technologies — Confidential</span><span>Next shift to acknowledge all active alerts</span></footer>
  <div style="position:fixed;bottom:20px;right:20px"><button onclick="window.print()" style="background:#0a1628;color:#22d3ee;border:none;border-radius:10px;padding:10px 22px;font-size:13px;font-weight:700;cursor:pointer">Save PDF</button></div>
  </body></html>`);
  win.document.close();
  setTimeout(()=>win.print(),500);
}

// ─── V6: CSV EXPORT ───────────────────────────────────────────────
function exportSensorCSV() {
  const types = ['pressure','flow','acoustic','infrared','temperature','vibration','corrosion','gas','water'];
  const maxLen = Math.max(...types.map(k=>state.sensorData[k].length));
  if (maxLen===0) { alert('No sensor data yet. Open a company pipeline first.'); return; }
  const rows=[['timestamp',...types].join(',')];
  for (let i=0;i<maxLen;i++) {
    const ts=new Date(Date.now()-(maxLen-1-i)*1000).toISOString();
    rows.push([ts,...types.map(k=>state.sensorData[k][i]!==undefined?state.sensorData[k][i].toFixed(3):'')].join(','));
  }
  const blob=new Blob([rows.join('\n')],{type:'text/csv'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;a.download='ecoguard-sensor-data.csv';a.click();
  URL.revokeObjectURL(url);
}

