// ECO GUARD TECHNOLOGIES — render.js
// All render functions: login, header, dashboard, pages, modals

// ─── HELPERS ──────────────────────────────────────────────────────
function t() { return THEMES[state.theme]; }

function genVal(status, scale) {
  const m = status==="critical"?0.6:status==="warning"?0.85:0.97;
  return (m + Math.random()*0.04) * scale;
}

function fmtTime(d) {
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  return s < 60 ? `${s}s ago` : s < 3600 ? `${Math.floor(s/60)}m ago` : `${Math.floor(s/3600)}h ago`;
}

function statusBadgeHTML(status) {
  const map = {
    operational:["rgba(52,211,153,0.15)","#34d399","rgba(52,211,153,0.3)"],
    normal:     ["rgba(52,211,153,0.15)","#34d399","rgba(52,211,153,0.3)"],
    warning:    ["rgba(245,158,11,0.15)","#f59e0b","rgba(245,158,11,0.3)"],
    critical:   ["rgba(239,68,68,0.15)", "#f87171","rgba(239,68,68,0.3)"],
    info:       ["rgba(96,165,250,0.15)","#60a5fa","rgba(96,165,250,0.3)"],
    offline:    ["rgba(107,114,128,0.15)","#9ca3af","rgba(107,114,128,0.3)"],
    Ready:      ["rgba(52,211,153,0.15)","#34d399","rgba(52,211,153,0.3)"],
    Pending:    ["rgba(245,158,11,0.15)","#f59e0b","rgba(245,158,11,0.3)"],
    Archived:   ["rgba(96,165,250,0.15)","#60a5fa","rgba(96,165,250,0.3)"],
  };
  const [bg,col,border] = map[status] || map.info;
  return `<span style="background:${bg};color:${col};border:1px solid ${border};border-radius:5px;font-size:0.7rem;padding:2px 8px;font-weight:600;text-transform:capitalize;white-space:nowrap">${status}</span>`;
}

function miniChartHTML(data, color, unit) {
  if (!data || data.length < 2) return '<div style="height:65px;display:flex;align-items:center;justify-content:center;color:rgba(100,100,100,0.5);font-size:0.7rem">collecting data…</div>';
  const W=300, H=65, pad=4;
  const min=Math.min(...data), max=Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v,i) => {
    const x = pad + (i/(data.length-1))*(W-pad*2);
    const y = H - pad - ((v-min)/range)*(H-pad*2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const last = data[data.length-1];
  const lastX = W - pad;
  const lastY = H - pad - ((last-min)/range)*(H-pad*2);
  const labelY = Math.max(lastY - 6, 10); // keep label inside viewbox
  return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:65px;overflow:visible">
    <polyline points="${pts}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/>
    <circle cx="${lastX.toFixed(1)}" cy="${lastY.toFixed(1)}" r="3" fill="${color}"/>
    <text x="${(lastX-2).toFixed(1)}" y="${labelY.toFixed(1)}" fill="${color}" font-size="9" text-anchor="end">${last.toFixed(1)} ${unit}</text>
  </svg>`;
}

// ─── SVG PIPELINE MAP ─────────────────────────────────────────────
function pipelineSVGHTML(companyId) {
  const th = t();
  const pipelines = PIPELINE_CONFIGS[companyId] || [];
  const sel = state.companyPage.selectedPipeline;
  const sColors = { normal:"#34d399", warning:"#f59e0b", critical:"#ef4444", offline:"#6b7280" };
  const pColors = { operational:"#3b82f6", warning:"#f59e0b", critical:"#ef4444" };

  let svgContent = `
    <defs>
      <pattern id="pgrid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="${th.gridLine}" stroke-width="1"/>
      </pattern>
      <filter id="glow-blue"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <filter id="glow-warn"><feGaussianBlur stdDeviation="4" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <filter id="glow-crit"><feGaussianBlur stdDeviation="5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <rect width="780" height="480" fill="${th.cardGrid}"/>
    <rect width="780" height="480" fill="url(#pgrid)"/>`;

  pipelines.forEach(pl => {
    const isSel = pl.id === sel;
    const col   = pColors[pl.status] || '#3b82f6';
    const filterId = pl.status==='critical' ? 'glow-crit' : pl.status==='warning' ? 'glow-warn' : 'glow-blue';
    const flowCls  = pl.status==='critical' ? 'pipeline-flow-critical' : 'pipeline-flow-slow';

    // Pipe body (thick background tube)
    svgContent += `<path d="${pl.path}" stroke="${isSel ? '#1a3a6b' : '#0f1e36'}" stroke-width="${isSel?14:8}" fill="none" stroke-linecap="round"/>`;
    // Pipe highlight
    svgContent += `<path d="${pl.path}" stroke="${isSel ? col : col+'55'}" stroke-width="${isSel?10:5}" fill="none" stroke-linecap="round" ${isSel?`filter="url(#${filterId})"`:''} style="cursor:pointer" data-pipeline="${pl.id}" data-company="${companyId}"/>`;

    // Animated flow particles (dashes moving through)
    if (isSel) {
      const flowColor = pl.status==='critical' ? '#ef444488' : pl.status==='warning' ? '#f59e0b88' : '#3b82f688';
      svgContent += `<path d="${pl.path}" stroke="${flowColor}" stroke-width="4" fill="none" stroke-linecap="round" class="${flowCls}" style="pointer-events:none"/>`;
      // Second layer — brighter particles
      const brightColor = pl.status==='critical' ? '#fca5a8' : pl.status==='warning' ? '#fcd34d' : '#93c5fd';
      svgContent += `<path d="${pl.path}" stroke="${brightColor}" stroke-width="2" fill="none" stroke-linecap="round" stroke-dasharray="4 28" class="pipeline-flow" style="pointer-events:none;animation-delay:0.4s"/>`;
    }

    // Sensors (only for selected pipeline)
    if (isSel) {
      pl.sensors.forEach(s => {
        const key = `${companyId}-${pl.id}-${s.id}`;
        const isOn = state.sensorStates[key] !== false;
        const effStatus = isOn ? s.status : 'offline';
        const sc = sColors[effStatus] || '#34d399';

        if (effStatus !== 'normal' && effStatus !== 'offline') {
          svgContent += `<circle cx="${s.x}" cy="${s.y}" r="22" fill="none" stroke="${sc}" stroke-width="1.5" opacity="0.5" class="sensor-pulse-ring">
            <animate attributeName="r" from="22" to="34" dur="1.4s" repeatCount="indefinite"/>
            <animate attributeName="opacity" from="0.5" to="0" dur="1.4s" repeatCount="indefinite"/>
          </circle>`;
        }
        svgContent += `<circle cx="${s.x}" cy="${s.y}" r="16" fill="${th.cardGrid}" stroke="${sc}" stroke-width="2.5" style="cursor:pointer"/>`;
        svgContent += `<text x="${s.x}" y="${s.y+5}" text-anchor="middle" fill="${sc}" font-size="10" font-weight="bold" style="pointer-events:none">${s.type[0].toUpperCase()}</text>`;
        if (!isOn) {
          svgContent += `<line x1="${s.x-10}" y1="${s.y-10}" x2="${s.x+10}" y2="${s.y+10}" stroke="#6b7280" stroke-width="2.5" style="pointer-events:none"/>`;
        }
      });
    }
  });

  // Legend
  svgContent += `<g transform="translate(16,446)">
    <text fill="${th.textMuted}" font-size="10" font-weight="600">Sensors: </text>`;
  [["P","Pressure","#60a5fa"],["F","Flow","#a78bfa"],["A","Acoustic","#34d399"],["T","Temp","#f97316"]].forEach(([ch,lbl,col],i) => {
    svgContent += `<g transform="translate(${70+i*130},0)">
      <circle cx="0" cy="-4" r="10" fill="${th.cardGrid}" stroke="${col}" stroke-width="2"/>
      <text x="0" y="-1" text-anchor="middle" fill="${col}" font-size="9" font-weight="bold">${ch}</text>
      <text x="16" y="0" fill="${th.textMuted}" font-size="10">${lbl}</text>
    </g>`;
  });
  svgContent += `</g>`;

  return `<svg viewBox="0 0 780 480" style="width:100%;background:${th.cardGrid};border-radius:8px" id="pipeline-svg">${svgContent}</svg>`;
}

// ─── RENDER ENGINE ────────────────────────────────────────────────
function render() {
  try {
    document.body.style.background = t().bg;
    document.body.style.color = t().text;
    const root = document.getElementById('app');

    if (!root) {
      console.error('App root element not found');
      return;
    }

    if (!state.user) {
      // Login: remove shell class so page scrolls naturally
      document.body.classList.remove('app-active');
      document.body.style.overflow = '';
      root.innerHTML = renderLogin();
      bindLogin();
      return;
    }

    // App shell: fixed height, only #main-content scrolls
    document.body.classList.add('app-active');

    const companyId = state.page.startsWith('company/') ? state.page.split('/')[1] : null;

    root.innerHTML = `
      ${renderHeader()}
      <main id="main-content">
        ${companyId ? renderCompanyPage(companyId)
          : state.page === 'dashboard' ? renderDashboard()
          : state.page === 'alerts'    ? renderAlertsPage()
          : state.page === 'sensors'   ? renderSensorsPage()
          : state.page === 'map'       ? renderMapPage()
          : state.page === 'reports'   ? renderReportsPage()
          : state.page === 'settings'  ? renderSettingsPage()
          : renderDashboard()}
      </main>`;

    bindAll();
  } catch (error) {
    console.error('Render failed:', error);
    const root = document.getElementById('app');
    if (root) {
      root.innerHTML = '<div style="padding:20px;color:red;">Failed to render page. Please refresh.</div>';
    }
  }
}

// ─── LOGIN ────────────────────────────────────────────────────────
function renderLogin() {
  return `
  <div style="min-height:100vh;background:linear-gradient(135deg,#050e1a,#0a1628,#071322);display:flex;align-items:center;justify-content:center;padding:calc(env(safe-area-inset-top) + 1rem) calc(env(safe-area-inset-right) + 1rem) calc(env(safe-area-inset-bottom) + 1rem) calc(env(safe-area-inset-left) + 1rem);position:relative;overflow:hidden">
    <div style="position:absolute;inset:0;background-image:linear-gradient(rgba(34,211,238,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(34,211,238,0.03) 1px,transparent 1px);background-size:40px 40px;pointer-events:none"></div>
    <div style="width:100%;max-width:440px;position:relative;z-index:1">
      <div style="text-align:center;margin-bottom:2rem">
        <div style="display:inline-flex;align-items:center;justify-content:center;width:64px;height:64px;background:linear-gradient(135deg,rgba(34,211,238,0.2),rgba(59,130,246,0.2));border-radius:16px;border:1.5px solid rgba(34,211,238,0.4);margin-bottom:1rem">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" stroke-width="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
        <div style="font-size:1.6rem;font-weight:700;color:#fff;letter-spacing:0.04em;margin-bottom:0.25rem">ECO GUARD</div>
        <div style="font-size:0.78rem;color:rgba(34,211,238,0.6);letter-spacing:0.12em;text-transform:uppercase">Technologies · Pipeline Security</div>
      </div>
      <div style="background:rgba(15,30,54,0.6);border:1px solid rgba(34,211,238,0.2);border-radius:16px;padding:2rem;backdrop-filter:blur(12px)">
        <h2 style="color:#fff;font-size:1rem;font-weight:600;margin-bottom:1.5rem;text-align:center"> Sign in to your account</h2>
        <div id="login-error" style="display:none;background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.3);border-radius:8px;padding:0.65rem 0.9rem;margin-bottom:1rem;color:#fca5a5;font-size:0.82rem"></div>
        <div style="margin-bottom:1rem">
          <label style="display:block;color:rgba(34,211,238,0.8);font-size:0.78rem;font-weight:500;margin-bottom:0.4rem;letter-spacing:0.04em">EMAIL ADDRESS</label>
          <input id="login-email" type="email" placeholder="yourname@ecoguard.com"
            style="width:100%;padding:0.75rem 1rem;background:rgba(5,14,26,0.8);border:1px solid rgba(34,211,238,0.25);border-radius:8px;color:#fff;font-size:0.88rem;outline:none;box-sizing:border-box"/>
        </div>
        <div style="margin-bottom:1.5rem">
          <label style="display:block;color:rgba(34,211,238,0.8);font-size:0.78rem;font-weight:500;margin-bottom:0.4rem;letter-spacing:0.04em">PASSWORD</label>
          <div style="position:relative">
            <input id="login-pw" type="password" placeholder="Enter your password"
              style="width:100%;padding:0.75rem 2.8rem 0.75rem 1rem;background:rgba(5,14,26,0.8);border:1px solid rgba(34,211,238,0.25);border-radius:8px;color:#fff;font-size:0.88rem;outline:none;box-sizing:border-box"/>
            <button id="pw-toggle" type="button" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;color:rgba(34,211,238,0.5);cursor:pointer;padding:4px">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>
        </div>
        <button id="login-btn" style="width:100%;padding:0.85rem;background:linear-gradient(90deg,#0891b2,#2563eb);border:none;border-radius:8px;color:#fff;font-size:0.92rem;font-weight:600;cursor:pointer;letter-spacing:0.04em">Sign In</button>
      </div>
      <div style="margin-top:1.5rem;display:flex;justify-content:space-between;align-items:center">
        <div style="display:flex;align-items:center;gap:6px">
          <div style="width:8px;height:8px;border-radius:50%;background:#34d399;box-shadow:0 0 6px #34d399;animation:pulse 2s infinite"></div>
          <span style="color:#34d399;font-size:0.75rem;font-weight:500">NO ACTIVE INCIDENTS</span>
        </div>
        <span style="color:rgba(34,211,238,0.3);font-size:0.72rem">© 2026 Eco Guard Technologies</span>
      </div>
    </div>
  </div>`;
}

// ─── HEADER ───────────────────────────────────────────────────────
function renderHeader() {
  const th = t();
  const totalAlerts = Object.values(state.alerts).flat().filter(a=>!a.resolved&&a.severity!=='info').length;
  const navItems = state.user.role==='admin'
    ? ["📊 DASHBOARD","📡 SENSORS","🔔 ALERTS","🗺 MAP","📄 REPORTS","⚙️ SETTINGS"]
    : ["📊 DASHBOARD","🔔 ALERTS","🗺 MAP"];

  const alarmDropdown = state.showAlarmDropdown ? `
    <div style="position:absolute;right:0;top:calc(100% + 8px);width:310px;background:${th.header};border:1px solid ${th.borderStrong};border-radius:12px;box-shadow:0 16px 40px rgba(0,0,0,0.5);z-index:200;animation:slideDown 0.2s ease" id="alarm-dropdown">
      <div style="padding:0.75rem 1rem;border-bottom:1px solid ${th.border};display:flex;justify-content:space-between;align-items:center">
        <span style="color:${th.text};font-weight:600;font-size:0.85rem">🔔 Active Alerts</span>
        <button id="close-alarm-dropdown" style="background:none;border:none;color:${th.textMuted};cursor:pointer;font-size:1.1rem">×</button>
      </div>
      <div style="max-height:260px;overflow-y:auto">
        ${Object.values(state.alerts).flat().filter(a=>!a.resolved&&a.severity!=='info').length===0
          ? `<div style="padding:1.5rem;text-align:center;color:${th.textMuted};font-size:0.82rem">No active alerts</div>`
          : Object.values(state.alerts).flat().filter(a=>!a.resolved&&a.severity!=='info').map(a=>`
            <div style="padding:0.7rem 1rem;border-bottom:1px solid ${th.border};display:flex;gap:10px">
              <div style="width:8px;height:8px;border-radius:50%;background:${a.severity==='critical'?'#ef4444':'#f59e0b'};margin-top:5px;flex-shrink:0"></div>
              <div>
                <div style="color:${a.severity==='critical'?'#fca5a5':'#fcd34d'};font-size:0.8rem;font-weight:600">${a.title}</div>
                <div style="color:${th.textFaint};font-size:0.7rem;margin-top:2px">${a.location} · ${fmtTime(a.timestamp)}</div>
              </div>
            </div>`).join('')}
      </div>
      <div style="padding:0.6rem 1rem">
        <button data-nav="alerts" style="width:100%;padding:0.5rem;background:${th.accentBg};border:1px solid ${th.border};border-radius:6px;color:${th.accent};font-size:0.78rem;cursor:pointer">View All Alerts →</button>
      </div>
    </div>` : '';

  const themeDropdown = state.showThemePicker ? `
    <div style="position:absolute;right:0;top:calc(100% + 6px);background:${th.header};border:1px solid ${th.borderStrong};border-radius:10px;box-shadow:0 12px 32px rgba(0,0,0,0.4);z-index:300;min-width:172px;overflow:hidden;animation:slideDown 0.15s ease" id="theme-dropdown">
      ${Object.entries(THEMES).map(([key,th2])=>`
      <button data-theme="${key}" style="width:100%;display:flex;align-items:center;gap:10px;padding:0.6rem 1rem;background:${state.theme===key?th.accentBg:'transparent'};border:none;cursor:pointer;color:${state.theme===key?th.accent:th.text};font-size:0.82rem;text-align:left">
        <span style="width:14px;height:14px;border-radius:50%;background:${th2.swatch};flex-shrink:0;display:inline-block;box-shadow:0 0 5px ${th2.swatch}99"></span>
        <span>${th2.name}</span>
        ${state.theme===key?`<svg style="margin-left:auto" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`:''}
      </button>`).join('')}
    </div>` : '';

  const page = state.page;
  return `
  <header style="background:${th.header};border-bottom:1px solid ${th.headerBorder};position:sticky;top:0;z-index:100;backdrop-filter:blur(12px)">
    <div style="padding:0.65rem 1rem">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.6rem">
        <div data-nav="dashboard" style="display:flex;align-items:center;gap:10px;cursor:pointer">
          <div style="width:36px;height:36px;background:${th.accentBg};border-radius:9px;border:1.5px solid ${th.borderStrong};display:flex;align-items:center;justify-content:center;flex-shrink:0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${th.accent}" stroke-width="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <div>
            <div style="color:${th.text};font-weight:700;font-size:0.95rem;letter-spacing:0.06em">ECO GUARD</div>
            <div style="color:${th.textMuted};font-size:0.62rem;letter-spacing:0.08em">PIPELINE SECURITY</div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:6px">
          <!-- Network dot (v6) -->
          <div title="${networkOnline?'Online':'Offline'}" style="width:8px;height:8px;border-radius:50%;background:${networkOnline?'#34d399':'#ef4444'};box-shadow:0 0 6px ${networkOnline?'#34d399':'#ef4444'};flex-shrink:0"></div>
          <div style="display:flex;align-items:center;gap:5px;padding:3px 8px;background:rgba(52,211,153,0.1);border:1px solid rgba(52,211,153,0.3);border-radius:6px">
            <div style="width:6px;height:6px;border-radius:50%;background:#34d399;animation:pulse 2s infinite"></div>
            <span style="color:#34d399;font-size:0.65rem;font-weight:600;letter-spacing:0.06em">LIVE</span>
          </div>
          <div style="padding:3px 8px;background:${th.accentBg};border:1px solid ${th.border};border-radius:6px">
            <span class="zone-badge-text" style="color:${th.accent};font-size:0.65rem;font-weight:600">${state.user.role==='admin'?'ADMIN':`ZONE ${state.user.zone}`}</span>
          </div>
          <!-- Search button (v6) -->
          <button id="search-btn" title="Search (Ctrl+K)" style="width:32px;height:32px;background:${th.accentBg};border:1px solid ${th.border};border-radius:8px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:${th.textMuted}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </button>
          <!-- Theme Picker -->
          <div style="position:relative">
            <button id="theme-btn" style="padding:0 10px;height:32px;background:${th.accentBg};border:1px solid ${th.border};border-radius:8px;display:flex;align-items:center;gap:5px;cursor:pointer;color:${th.accent};font-size:0.75rem;font-weight:600">
              <span style="width:12px;height:12px;border-radius:50%;background:${THEMES[state.theme].swatch};display:inline-block;flex-shrink:0;box-shadow:0 0 4px ${THEMES[state.theme].swatch}88"></span>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            ${themeDropdown}
          </div>
          <!-- Bell -->
          <div style="position:relative">
            <button id="alarm-btn" style="width:32px;height:32px;background:${totalAlerts>0?'rgba(239,68,68,0.15)':th.accentBg};border:1px solid ${totalAlerts>0?'rgba(239,68,68,0.35)':th.border};border-radius:8px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:${totalAlerts>0?'#f87171':th.accent};${totalAlerts>0?'animation:ring 1.5s ease infinite':''}">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
            </button>
            ${totalAlerts>0?`<span style="position:absolute;top:-4px;right:-4px;min-width:17px;height:17px;background:#ef4444;border-radius:9px;font-size:0.62rem;font-weight:700;color:#fff;display:flex;align-items:center;justify-content:center;padding:0 3px;border:1.5px solid ${th.bg}">${totalAlerts}</span>`:''}
            ${alarmDropdown}
          </div>
          <!-- Logout -->
          <button id="logout-btn" style="width:32px;height:32px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.25);border-radius:8px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#f87171">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </div>
      </div>
      <nav style="display:flex;gap:1px">
        ${navItems.map(tab=>{
          const key=tab.replace(/[^a-zA-Z]/g,'').toLowerCase();
          const active=page===key||(key==='dashboard'&&page.startsWith('company/'));
          const cnt=key==='alerts'&&totalAlerts>0?`<span style="margin-left:5px;background:#ef4444;color:#fff;border-radius:9px;font-size:0.58rem;padding:1px 5px;font-weight:700">${totalAlerts}</span>`:'';
          return `<button data-nav="${key}" style="padding:0.4rem 0.75rem;font-size:0.72rem;font-weight:600;letter-spacing:0.07em;background:none;border:none;border-bottom:2px solid ${active?th.navActive:'transparent'};color:${active?th.navActive:th.navInactive};cursor:pointer;white-space:nowrap">${tab}${cnt}</button>`;
        }).join('')}
      </nav>
    </div>
  </header>
  ${state.showSearch ? renderSearchOverlay() : ''}`;
}

// ─── DASHBOARD ────────────────────────────────────────────────────
function renderDashboard() {
  const th = t();
  const companies = getCompanies();
  const total = Object.values(state.alerts).flat().filter(a=>!a.resolved&&a.severity!=='info').length;
  const crit  = Object.values(state.alerts).flat().filter(a=>!a.resolved&&a.severity==='critical').length;
  const op    = companies.filter(c=>c.status==='operational').length;
  const vis   = state.user.role==='admin' ? companies : companies.filter(c=>c.id===ZONE_PIPELINE_MAP[state.user.zone]);

  // v6: engineer welcome banner
  const myZoneBanner = state.user.role==='engineer' ? `
  <div style="background:linear-gradient(135deg,${th.accentBg},transparent);border:1px solid ${th.borderStrong};border-radius:12px;padding:0.85rem 1.1rem;margin-bottom:1rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
    <div>
      <div style="color:${th.text};font-weight:700;font-size:0.9rem">Welcome back, ${state.user.name.split(' ')[0]}</div>
      <div style="color:${th.textMuted};font-size:0.75rem;margin-top:2px">Zone ${state.user.zone} · ${companies.find(c=>c.id===ZONE_PIPELINE_MAP[state.user.zone])?.name||'Assigned Pipeline'}</div>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
      <div style="padding:4px 10px;background:${th.surface};border:1px solid ${th.border};border-radius:7px;display:flex;align-items:center;gap:6px">
        <div style="width:6px;height:6px;border-radius:50%;background:#34d399;animation:pulse 2s infinite"></div>
        <span style="color:${th.textMuted};font-size:0.72rem;font-weight:600">🟢 ON DUTY</span>
      </div>
      <button id="handover-btn" style="padding:4px 12px;background:${th.accentBg};border:1px solid ${th.borderStrong};border-radius:7px;color:${th.accent};font-size:0.72rem;font-weight:600;cursor:pointer">📋 Shift Handover</button>
    </div>
  </div>` : '';

  return `
  <div style="padding:1rem;max-width:1200px;margin:0 auto" class="fade-in">
    ${myZoneBanner}
    <div class="stat-grid">
      ${[
        ["Total Pipelines", companies.reduce((s,c)=>s+c.pipelines,0), "All monitored", th.accent],
        ["Active Alerts", total, "Require attention", total?th.accent:"#34d399"],
        ["Critical", crit, "Immediate action", crit?"#ef4444":"#34d399"],
        ["Operational", `${op}/${companies.length}`, `${Math.round(op/companies.length*100)}% healthy`, "#34d399"],
      ].map(([l,v,s,c])=>`
      <div style="background:${th.surface};border:1px solid ${th.border};border-radius:12px;padding:1rem">
        <div style="color:${th.textMuted};font-size:0.72rem;margin-bottom:6px">${l}</div>
        <div style="color:${th.text};font-size:1.8rem;font-weight:700;line-height:1">${v}</div>
        <div style="color:${c};font-size:0.72rem;margin-top:8px">${s}</div>
      </div>`).join('')}
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;gap:8px;flex-wrap:wrap">
      <h2 style="color:${th.text};font-size:1rem;font-weight:600;margin:0">
        ${state.user.role==='admin'?'All Pipeline Infrastructure':`Zone ${state.user.zone} — Your Assigned Pipeline`}
      </h2>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
        ${total>0&&state.user.role==='admin'?`
        <button id="resolve-all-btn" style="padding:0.45rem 0.9rem;background:rgba(52,211,153,0.1);border:1px solid rgba(52,211,153,0.3);border-radius:8px;color:#34d399;font-size:0.78rem;font-weight:600;cursor:pointer;white-space:nowrap">✅ Resolve All (${total})</button>`:''}
        ${state.user.role==='admin'?`
        <button id="handover-btn" style="padding:0.45rem 0.9rem;background:${th.accentBg};border:1px solid ${th.border};border-radius:8px;color:${th.textMuted};font-size:0.78rem;font-weight:600;cursor:pointer;white-space:nowrap">📋 Shift Handover</button>
        <button id="add-company-btn" style="display:flex;align-items:center;gap:6px;padding:0.45rem 1rem;background:${th.accentBg};border:1px solid ${th.borderStrong};border-radius:8px;color:${th.accent};font-size:0.82rem;font-weight:600;cursor:pointer;white-space:nowrap">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Add Company
        </button>`:''}
      </div>
    </div>
    <div class="company-grid">
      ${vis.map(c=>{
        const risk=calcRiskScore(c.id);
        const rc=riskColor(risk);
        return `
        <div data-company="${c.id}" class="company-card" style="background:${th.surface};border:1px solid ${c.status==='critical'?'rgba(239,68,68,0.35)':c.status==='warning'?'rgba(245,158,11,0.3)':th.border};border-radius:14px;padding:1.25rem;cursor:pointer;transition:border-color 0.2s">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1rem">
            <div>
              <div style="color:${th.text};font-weight:600;font-size:1rem">${c.name}</div>
              <div style="color:${th.textMuted};font-size:0.78rem;margin-top:2px">${c.region} · ${c.pipelines} pipelines</div>
            </div>
            ${statusBadgeHTML(c.status)}
          </div>
          <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:1rem">
            ${[["Pressure",c.pressure],["Flow",c.flow]].map(([l,s])=>`
            <div style="display:flex;justify-content:space-between;align-items:center">
              <span style="color:${th.textMuted};font-size:0.8rem">${l}</span>
              ${statusBadgeHTML(s)}
            </div>`).join('')}
          </div>
          <!-- v6: risk score bar -->
          <div style="margin-bottom:1rem">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px">
              <span style="color:${th.textMuted};font-size:0.7rem;font-weight:600;letter-spacing:0.06em">RISK SCORE</span>
              <span style="color:${rc};font-size:0.72rem;font-weight:700">${riskLabel(risk)} · ${risk}</span>
            </div>
            <div style="height:5px;background:rgba(255,255,255,0.07);border-radius:3px;overflow:hidden">
              <div style="height:100%;width:${risk}%;background:${rc};border-radius:3px;transition:width 0.6s ease"></div>
            </div>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;padding-top:0.75rem;border-top:1px solid ${th.border}">
            <span style="color:${th.textFaint};font-size:0.72rem">Updated ${c.lastUpdate}</span>
            <span style="color:${th.accent};font-size:0.78rem;display:flex;align-items:center;gap:4px">
              View Details <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </span>
          </div>
        </div>`;
      }).join('')}
    </div>
    <!-- v6: activity feed -->
    ${renderActivityFeed()}
  </div>
  ${state.showAddCompany ? renderAddCompanyModal() : ''}`;
}

// ─── ADD COMPANY MODAL ────────────────────────────────────────────
function renderAddCompanyModal() {
  const th = t();
  const f = state.addCompanyForm;
  return `
  <div id="add-company-overlay" style="position:fixed;inset:0;background:rgba(0,0,0,0.7);backdrop-filter:blur(4px);z-index:1000;display:flex;align-items:center;justify-content:center;padding:1rem">
    <div style="background:${th.bg};border:1px solid ${th.borderStrong};border-radius:16px;padding:1.75rem;width:100%;max-width:460px;box-shadow:0 25px 60px rgba(0,0,0,0.5)">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem">
        <h3 style="color:${th.text};font-size:1rem;font-weight:700;margin:0">Add New Company</h3>
        <button id="close-add-company" style="background:transparent;border:none;color:${th.textMuted};cursor:pointer;font-size:1.5rem;line-height:1;padding:0 4px">×</button>
      </div>
      <div style="display:flex;flex-direction:column;gap:1rem">
        <div>
          <label style="color:${th.textMuted};font-size:0.75rem;font-weight:600;letter-spacing:0.05em;display:block;margin-bottom:5px">COMPANY NAME *</label>
          <input id="ac-name" value="${f.name}" placeholder="e.g. TotalEnergies" style="width:100%;box-sizing:border-box;padding:0.6rem 0.9rem;background:${th.inputBg};border:1px solid ${th.inputBorder};border-radius:8px;color:${th.text};font-size:0.85rem;outline:none">
        </div>
        <div>
          <label style="color:${th.textMuted};font-size:0.75rem;font-weight:600;letter-spacing:0.05em;display:block;margin-bottom:5px">REGION *</label>
          <input id="ac-region" value="${f.region}" placeholder="e.g. North Africa" style="width:100%;box-sizing:border-box;padding:0.6rem 0.9rem;background:${th.inputBg};border:1px solid ${th.inputBorder};border-radius:8px;color:${th.text};font-size:0.85rem;outline:none">
        </div>
        <div>
          <label style="color:${th.textMuted};font-size:0.75rem;font-weight:600;letter-spacing:0.05em;display:block;margin-bottom:5px">NUMBER OF PIPELINES *</label>
          <input id="ac-pipelines" type="number" min="1" max="99" value="${f.pipelines}" placeholder="e.g. 6" style="width:100%;box-sizing:border-box;padding:0.6rem 0.9rem;background:${th.inputBg};border:1px solid ${th.inputBorder};border-radius:8px;color:${th.text};font-size:0.85rem;outline:none">
        </div>
        <div>
          <label style="color:${th.textMuted};font-size:0.75rem;font-weight:600;letter-spacing:0.05em;display:block;margin-bottom:5px">INITIAL STATUS</label>
          <div style="display:flex;gap:0.5rem">
            ${['operational','warning','critical'].map(s=>`
            <button data-ac-status="${s}" style="flex:1;padding:0.5rem;background:${f.status===s?'rgba(34,211,238,0.15)':'transparent'};border:1px solid ${f.status===s?th.borderStrong:th.border};border-radius:8px;color:${f.status===s?th.accent:th.textMuted};font-size:0.75rem;font-weight:600;cursor:pointer;text-transform:capitalize">${s}</button>`).join('')}
          </div>
        </div>
        <div id="ac-error" style="color:#f87171;font-size:0.78rem;display:none"></div>
        <div style="display:flex;gap:0.75rem;margin-top:0.5rem">
          <button id="close-add-company-2" style="flex:1;padding:0.65rem;background:transparent;border:1px solid ${th.border};border-radius:8px;color:${th.textMuted};font-size:0.85rem;cursor:pointer">Cancel</button>
          <button id="save-add-company" style="flex:1;padding:0.65rem;background:${th.accent};border:none;border-radius:8px;color:#000;font-size:0.85rem;font-weight:700;cursor:pointer">Add Company</button>
        </div>
      </div>
    </div>
  </div>`;
}

// ─── COMPANY / PIPELINE PAGE ───────────────────────────────────────
function renderCompanyPage(companyId) {
  const th = t();
  const company = getCompanies().find(c=>c.id===companyId);
  if (!company) return `<div style="padding:2rem;color:#f87171">Company not found.</div>`;

  const sel = state.companyPage.selectedPipeline;
  const tab = state.companyPage.tab;
  const pipelineStatus = company.status==='critical'?'critical':company.status==='warning'?'warning':'normal';

  const selPipelineData = (PIPELINE_CONFIGS[companyId]||[]).find(p=>p.id===sel);
  const activeSensorTypes = new Set(
    (selPipelineData?.sensors||[])
      .filter(s=>state.sensorStates[`${companyId}-${sel}-${s.id}`]!==false)
      .map(s=>s.type)
  );

  const cp = (state.sensorData.pressure.slice(-1)[0]||95).toFixed(1);
  const cf = (state.sensorData.flow.slice(-1)[0]||950).toFixed(0);
  const ca = (state.sensorData.acoustic.slice(-1)[0]||46).toFixed(1);
  const ci = (state.sensorData.infrared.slice(-1)[0]||25).toFixed(1);
  const ct = (state.sensorData.temperature.slice(-1)[0]||25).toFixed(1);
  const cv = (state.sensorData.vibration.slice(-1)[0]||2).toFixed(1);
  const cc = (state.sensorData.corrosion.slice(-1)[0]||0.05).toFixed(3);
  const cg = (state.sensorData.gas.slice(-1)[0]||50).toFixed(0);
  const cw = (state.sensorData.water.slice(-1)[0]||5).toFixed(1);
  const pressureDrop = pipelineStatus==='critical'?15:pipelineStatus==='warning'?8:2;
  const flowImb = ((parseFloat(cf)-parseFloat(cf)*(pipelineStatus==='critical'?0.85:pipelineStatus==='warning'?0.95:0.99))/parseFloat(cf)*100).toFixed(1);

  const sensorReadings = [
    {label:"Pressure",  value:cp, unit:"PSI",   data:state.sensorData.pressure,  color:"#60a5fa", type:"pressure",  status:pressureDrop>10?"critical":pressureDrop>5?"warning":"normal", sub:`Drop: ${pressureDrop}%`},
    {label:"Flow Rate", value:cf, unit:"L/min",  data:state.sensorData.flow,      color:"#a78bfa", type:"flow",      status:parseFloat(flowImb)>8?"critical":parseFloat(flowImb)>4?"warning":"normal", sub:`Imbalance: ${flowImb}%`},
    {label:"Acoustic",  value:ca, unit:"dB",     data:state.sensorData.acoustic,  color:"#34d399", type:"acoustic",  status:pipelineStatus, sub:pipelineStatus==='normal'?'No vibration':'Anomaly detected'},
    {label:"Temp",      value:ci, unit:"°C",     data:state.sensorData.infrared,  color:"#fb923c", type:"infrared",  status:parseFloat(ci)>32?"warning":"normal", sub:parseFloat(ci)>32?"Above threshold":"Normal range"},
    {label:"Temperature", value:ct, unit:"°C",   data:state.sensorData.temperature, color:"#ef4444", type:"temperature", status:parseFloat(ct)>35?"critical":parseFloat(ct)>30?"warning":"normal", sub:parseFloat(ct)>35?"Overheating":"Normal"},
    {label:"Vibration", value:cv, unit:"mm/s",   data:state.sensorData.vibration, color:"#8b5cf6", type:"vibration", status:parseFloat(cv)>3?"warning":"normal", sub:parseFloat(cv)>3?"High vibration":"Stable"},
    {label:"Corrosion", value:cc, unit:"mm/yr", data:state.sensorData.corrosion, color:"#f59e0b", type:"corrosion", status:parseFloat(cc)>0.1?"warning":"normal", sub:parseFloat(cc)>0.1?"Accelerated":"Normal rate"},
    {label:"Gas Level", value:cg, unit:"ppm",    data:state.sensorData.gas,       color:"#10b981", type:"gas",       status:parseFloat(cg)>80?"critical":parseFloat(cg)>60?"warning":"normal", sub:parseFloat(cg)>60?"Elevated":"Safe"},
    {label:"Water Ingress", value:cw, unit:"L/h", data:state.sensorData.water,    color:"#06b6d4", type:"water",     status:parseFloat(cw)>7?"warning":"normal", sub:parseFloat(cw)>7?"Leak detected":"Dry"},
  ];

  const companyAlerts = state.alerts[companyId]||[];
  const activeAlerts  = companyAlerts.filter(a=>!a.resolved);

  // sensor toggle panel
  const pipeline = (PIPELINE_CONFIGS[companyId]||[]).find(p=>p.id===sel);
  const typeColors = {pressure:"#60a5fa",flow:"#a78bfa",acoustic:"#34d399",infrared:"#f97316",temperature:"#ef4444",vibration:"#8b5cf6",corrosion:"#f59e0b",gas:"#10b981",water:"#06b6d4"};
  const allOn = pipeline ? pipeline.sensors.every(s=>state.sensorStates[`${companyId}-${sel}-${s.id}`]!==false) : true;

  const sensorTogglePanel = pipeline ? `
  <div style="background:${th.surface};border:1px solid ${th.border};border-radius:10px;padding:0.85rem;margin-top:0.75rem">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.65rem">
      <span style="color:${th.textMuted};font-size:0.72rem;font-weight:600;letter-spacing:0.06em;text-transform:uppercase">🎛️ Sensor Controls</span>
      <button id="toggle-all-sensors" data-company="${companyId}" data-pipeline="${sel}" data-allon="${allOn}" style="padding:3px 10px;background:${allOn?th.accentBg:'rgba(107,114,128,0.15)'};border:1px solid ${allOn?th.borderStrong:'rgba(107,114,128,0.3)'};border-radius:5px;color:${allOn?th.accent:'#9ca3af'};font-size:0.7rem;cursor:pointer;font-weight:600">
        ${allOn?'All OFF':'All ON'}
      </button>
    </div>
    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:0.5rem">
      ${pipeline.sensors.map(s=>{
        const key=`${companyId}-${sel}-${s.id}`;
        const isOn=state.sensorStates[key]!==false;
        const col=typeColors[s.type]||th.accent;
        return `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:0.5rem 0.7rem;background:${isOn?`${col}12`:'rgba(107,114,128,0.08)'};border:1px solid ${isOn?`${col}40`:'rgba(107,114,128,0.2)'};border-radius:7px">
          <div style="display:flex;align-items:center;gap:6px">
            <div style="width:8px;height:8px;border-radius:50%;background:${isOn?col:'#4b5563'};box-shadow:${isOn?`0 0 5px ${col}`:'none'}"></div>
            <div>
              <div style="color:${isOn?col:'#6b7280'};font-size:0.72rem;font-weight:600;text-transform:capitalize">${s.type}</div>
              <div style="color:${th.textFaint};font-size:0.65rem">${s.id.toUpperCase()}</div>
            </div>
          </div>
          <button data-sensor-key="${key}" data-sensor-val="${isOn}" style="width:36px;height:20px;border-radius:10px;background:${isOn?col:'rgba(75,85,99,0.5)'};border:none;cursor:pointer;position:relative;flex-shrink:0">
            <div style="position:absolute;top:2px;left:${isOn?'18px':'2px'};width:16px;height:16px;border-radius:50%;background:#fff;transition:left 0.2s;box-shadow:0 1px 3px rgba(0,0,0,0.3)"></div>
          </button>
        </div>`;
      }).join('')}
    </div>
  </div>` : '';

  return `
  <div style="display:flex;flex-direction:column" class="fade-in">
    <div style="background:${th.header};border-bottom:1px solid ${th.border};padding:0.65rem 1rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
      <div style="display:flex;align-items:center;gap:8px;min-width:0">
        <button data-nav="dashboard" style="display:flex;align-items:center;gap:4px;color:${th.accent};background:none;border:none;cursor:pointer;font-size:0.78rem;white-space:nowrap;flex-shrink:0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg> Dashboard
        </button>
        <span style="color:${th.textFaint};flex-shrink:0">|</span>
        <div style="min-width:0">
          <span style="color:${th.text};font-weight:600;font-size:0.9rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block">${company.name}</span>
          <span style="color:${th.textMuted};font-size:0.72rem">${company.region}</span>
        </div>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-shrink:0">
        ${statusBadgeHTML(company.status)}
        <div style="display:flex;align-items:center;gap:5px;padding:3px 8px;background:rgba(52,211,153,0.1);border:1px solid rgba(52,211,153,0.25);border-radius:6px">
          <div style="width:5px;height:5px;border-radius:50%;background:#34d399;animation:pulse 2s infinite"></div>
          <span style="color:#34d399;font-size:0.68rem;font-weight:600">LIVE</span>
        </div>
      </div>
    </div>
    <div class="company-split" style="--split-border:${th.border}">
      <!-- Left: Map + controls -->
      <div class="split-left">
        <div id="pipeline-map-container">${pipelineSVGHTML(companyId)}</div>
        ${sensorTogglePanel}
        <div style="margin-top:0.75rem;display:flex;flex-direction:column;gap:0.5rem">
          ${(PIPELINE_CONFIGS[companyId]||[]).map(pl=>{
            const ptKey = `${companyId}|${pl.id}`;
            const hasThreshold = !!state.pipelineThresholds[ptKey];
            return `
          <div style="background:${pl.id===sel?th.accentBg:th.surface};border:1px solid ${pl.id===sel?th.borderStrong:th.border};border-radius:8px;overflow:hidden">
            <div data-select-pipeline="${pl.id}" data-company="${companyId}" style="padding:0.6rem 0.9rem;cursor:pointer;display:flex;justify-content:space-between;align-items:center">
              <div>
                <div style="color:${pl.id===sel?th.accent:th.text};font-size:0.82rem;font-weight:500">${pl.name}</div>
                <div style="color:${th.textFaint};font-size:0.72rem">
                  ${pl.sensors.filter(s=>state.sensorStates[`${companyId}-${pl.id}-${s.id}`]!==false).length}/${pl.sensors.length} sensors active
                  ${hasThreshold?` &middot; <span style="color:#f59e0b">⚙️ Thresholds set</span>`:''}
                </div>
              </div>
              ${statusBadgeHTML(pl.status)}
            </div>
            <div style="padding:0 0.9rem 0.6rem;display:flex;justify-content:flex-end">
              <button data-set-pipeline-threshold="${pl.id}" data-company="${companyId}" data-pipeline-name="${pl.name}"
                style="padding:0.3rem 0.75rem;background:${hasThreshold?'rgba(245,158,11,0.1)':'transparent'};border:1px solid ${hasThreshold?'rgba(245,158,11,0.35)':th.border};border-radius:6px;color:${hasThreshold?'#f59e0b':th.textMuted};font-size:0.7rem;font-weight:600;cursor:pointer">
                ${hasThreshold ? 'Edit Thresholds' : 'Set Thresholds'}
              </button>
            </div>
          </div>`;
          }).join('')}
        </div>
      </div>
      <!-- Right: Sensors / Alerts panel -->
      <div class="split-right">
        <div style="display:flex;background:${th.header};border-bottom:1px solid ${th.border};position:sticky;top:0;z-index:10;flex-shrink:0">
          ${["sensors","alerts"].map(tb=>`
          <button data-tab="${tb}" style="flex:1;padding:0.75rem;font-size:0.78rem;font-weight:600;background:none;border:none;border-bottom:2px solid ${tab===tb?th.navActive:'transparent'};color:${tab===tb?th.navActive:th.navInactive};cursor:pointer;text-transform:uppercase">
            ${tb}${tb==='alerts'&&activeAlerts.filter(a=>a.severity!=='info').length>0?`<span style="margin-left:6px;background:#ef4444;color:#fff;border-radius:9px;font-size:0.6rem;padding:1px 5px;font-weight:700">${activeAlerts.filter(a=>a.severity!=='info').length}</span>`:''}
          </button>`).join('')}
        </div>
        <div class="split-right-body">
          ${tab==='sensors' ? `
          <div style="display:flex;flex-direction:column;gap:0.6rem">
            <div style="padding:0.6rem 0.9rem;background:${pipelineStatus==='critical'?'rgba(239,68,68,0.08)':pipelineStatus==='warning'?'rgba(245,158,11,0.08)':'rgba(52,211,153,0.08)'};border:1px solid ${pipelineStatus==='critical'?'rgba(239,68,68,0.3)':pipelineStatus==='warning'?'rgba(245,158,11,0.3)':'rgba(52,211,153,0.3)'};border-radius:8px">
              <div style="display:flex;justify-content:space-between">
                <span style="color:${th.text};font-size:0.8rem;font-weight:600">System Status</span>
                ${statusBadgeHTML(pipelineStatus==='normal'?'operational':pipelineStatus)}
              </div>
              ${selPipelineData?`<div style="color:${th.textMuted};font-size:0.72rem;margin-top:4px">${selPipelineData.name}</div>`:''}
            </div>
            ${(() => {
              const ptKey = `${companyId}|${sel}`;
              const pt = state.pipelineThresholds[ptKey];
              if (!pt) return '';
              const rows = [
                pt.maxPressure !== undefined ? `Max Pressure: <strong>${pt.maxPressure} PSI</strong>` : null,
                pt.minPressure !== undefined ? `Min Pressure: <strong>${pt.minPressure} PSI</strong>` : null,
                pt.maxFlow     !== undefined ? `Max Flow: <strong>${pt.maxFlow} L/min</strong>` : null,
                pt.minFlow     !== undefined ? `Min Flow: <strong>${pt.minFlow} L/min</strong>` : null,
                pt.maxTemp     !== undefined ? `Max Temp: <strong>${pt.maxTemp} °C</strong>` : null,
                pt.maxVibration!== undefined ? `Max Vibration: <strong>${pt.maxVibration} mm/s</strong>` : null,
                pt.maxCorrosion!== undefined ? `Max Corrosion: <strong>${pt.maxCorrosion} mm/yr</strong>` : null,
              ].filter(Boolean);
              return `
              <div style="padding:0.65rem 0.9rem;background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.25);border-radius:8px">
                <div style="color:#f59e0b;font-size:0.7rem;font-weight:700;letter-spacing:0.06em;margin-bottom:0.5rem">⚙️ PIPELINE THRESHOLDS ACTIVE</div>
                <div style="display:flex;flex-wrap:wrap;gap:0.4rem">
                  ${rows.map(r=>`<span style="background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.2);border-radius:5px;padding:2px 8px;color:${th.textMuted};font-size:0.7rem">${r}</span>`).join('')}
                </div>
              </div>`;
            })()}
            ${sensorReadings.map(s=>{
              const isActive=activeSensorTypes.has(s.type);
              return `
              <div style="background:${th.surface};border:1px solid ${isActive?th.border:'rgba(107,114,128,0.15)'};border-radius:10px;padding:0.75rem;opacity:${isActive?1:0.45}">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:4px">
                  <div>
                    <div style="display:flex;align-items:center;gap:6px">
                      <div style="width:7px;height:7px;border-radius:50%;background:${isActive?s.color:'#4b5563'}"></div>
                      <div style="color:${th.textMuted};font-size:0.72rem;margin-bottom:2px">${s.label}</div>
                    </div>
                    <div style="color:${isActive?th.text:'#6b7280'};font-weight:700;font-size:1.1rem">
                      <span id="sv-${s.type}">${isActive?s.value:'—'}</span> <span style="font-size:0.7rem;font-weight:400;color:${th.textFaint}">${isActive?s.unit:''}</span>
                    </div>
                    <div id="ss-${s.type}" style="color:${isActive?(s.status==='normal'?'#34d399':s.status==='warning'?'#f59e0b':'#ef4444'):'#4b5563'};font-size:0.7rem">
                      ${isActive?s.sub:'⚠️ Sensor offline'}
                    </div>
                  </div>
                  ${statusBadgeHTML(isActive?s.status:'offline')}
                </div>
                ${isActive?`<div id="sc-${s.type}">${miniChartHTML(s.data,s.color,s.unit)}</div>`:''}
              </div>`;
            }).join('')}
          </div>`
          : `
          <div style="display:flex;flex-direction:column;gap:0.6rem">
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px">
              ${[["Critical",activeAlerts.filter(a=>a.severity==='critical').length,"#ef4444","rgba(239,68,68,0.1)"],
                 ["Warning",activeAlerts.filter(a=>a.severity==='warning').length,"#f59e0b","rgba(245,158,11,0.1)"],
                 ["Info",activeAlerts.filter(a=>a.severity==='info').length,"#60a5fa","rgba(96,165,250,0.1)"]
              ].map(([l,c,col,bg])=>`
              <div style="background:${bg};border:1px solid ${col}40;border-radius:8px;padding:0.6rem;text-align:center">
                <div style="color:${col};font-size:1.4rem;font-weight:700">${c}</div>
                <div style="color:${col};font-size:0.68rem">${l}</div>
              </div>`).join('')}
            </div>
            ${activeAlerts.length===0
              ? `<div style="text-align:center;padding:2rem;color:${th.textMuted};font-size:0.82rem"><div style="font-size:2rem;margin-bottom:8px">✅</div>All systems operational</div>`
              : activeAlerts.map(alert=>`
              <div style="background:${th.surface};border:1px solid ${alert.severity==='critical'?'rgba(239,68,68,0.3)':alert.severity==='warning'?'rgba(245,158,11,0.25)':'rgba(96,165,250,0.2)'};border-radius:10px;padding:0.75rem">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px">
                  <div style="color:${alert.severity==='critical'?'#fca5a5':alert.severity==='warning'?'#fcd34d':'#93c5fd'};font-weight:600;font-size:0.82rem;flex:1">${alert.title}</div>
                  ${statusBadgeHTML(alert.severity)}
                </div>
                <p style="color:${th.textMuted};font-size:0.76rem;margin-bottom:8px;line-height:1.5">${alert.description}</p>
                <div style="color:${th.textFaint};font-size:0.7rem;margin-bottom:8px">${alert.location} · ⏱ ${fmtTime(alert.timestamp)}</div>
                ${alert.assignedTo?`<div style="color:#34d399;font-size:0.72rem;margin-bottom:8px">${alert.assignedTo}</div>`:''}
                ${alert.severity!=='info'?`
                <div style="display:flex;gap:6px">
                  <button data-dispatch="${alert.id}" data-company="${companyId}" ${alert.assignedTo?'disabled':''} style="flex:1;padding:0.4rem 0.6rem;background:${th.accentBg};border:1px solid ${th.border};border-radius:6px;color:${alert.assignedTo?th.textFaint:th.accent};font-size:0.72rem;cursor:${alert.assignedTo?'default':'pointer'}">
                    ${alert.assignedTo?'✅ Dispatched':'Dispatch Team'}
                  </button>
                  <button data-resolve="${alert.id}" data-company="${companyId}" style="flex:1;padding:0.4rem 0.6rem;background:rgba(52,211,153,0.1);border:1px solid rgba(52,211,153,0.25);border-radius:6px;color:#34d399;font-size:0.72rem;cursor:pointer">
                    Resolve
                  </button>
                </div>`:''}
              </div>`).join('')}
          </div>`}
        </div>
      </div>
    </div>
  </div>
  ${state.showPipelineThresholdModal ? renderPipelineThresholdModal(th) : ''}`;
}

// ─── ALERTS PAGE ──────────────────────────────────────────────────
function renderAlertsPage() {
  const th = t();
  const all = Object.entries(state.alerts).flatMap(([cid,list])=>list.map(a=>({...a,companyId:cid})));
  const filtered = state.alertFilter==='all'?all:all.filter(a=>a.severity===state.alertFilter);
  const unresolved = all.filter(a=>!a.resolved&&a.severity!=='info');
  const tab = state.alertsSubTab || 'alerts';
  return `
  <div style="padding:1rem;max-width:900px;margin:0 auto" class="fade-in">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem;flex-wrap:wrap;gap:8px">
      <h2 style="color:${th.text};font-size:1rem;font-weight:600">Alerts & Communication</h2>
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        ${['alerts','notifications'].map(tp=>`
        <button data-alerts-tab="${tp}" style="padding:0.3rem 0.8rem;background:${tab===tp?th.accentBg:'transparent'};border:1px solid ${tab===tp?th.borderStrong:th.border};border-radius:6px;color:${tab===tp?th.accent:th.navInactive};font-size:0.73rem;cursor:pointer;font-weight:600;text-transform:capitalize">${tp==='alerts'?'🔔 Alerts':'📣 Notifications'}</button>`).join('')}
      </div>
    </div>

    ${tab === 'notifications' ? renderNotificationLog(th) : `
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:0.75rem;align-items:center">
      ${["all","critical","warning","info"].map(f=>`
      <button data-filter="${f}" style="padding:0.3rem 0.7rem;background:${state.alertFilter===f?th.accentBg:'transparent'};border:1px solid ${state.alertFilter===f?th.borderStrong:th.border};border-radius:6px;color:${state.alertFilter===f?th.accent:th.navInactive};font-size:0.73rem;cursor:pointer;text-transform:capitalize">${f}</button>`).join('')}
      ${unresolved.length>0?`<button id="resolve-all-btn" style="padding:0.3rem 0.8rem;background:rgba(52,211,153,0.1);border:1px solid rgba(52,211,153,0.3);border-radius:6px;color:#34d399;font-size:0.73rem;cursor:pointer;font-weight:600">✅ Resolve All (${unresolved.length})</button>`:''}
    </div>
    <!-- summary stats -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:1rem">
      ${[['📋 Total',all.length,'#60a5fa'],['🔴 Critical',all.filter(a=>!a.resolved&&a.severity==='critical').length,'#ef4444'],['🟡 Warning',all.filter(a=>!a.resolved&&a.severity==='warning').length,'#f59e0b'],['✅ Resolved',all.filter(a=>a.resolved).length,'#34d399']].map(([l,v,c])=>`
      <div style="background:${th.surface};border:1px solid ${c}30;border-radius:8px;padding:0.65rem;text-align:center">
        <div style="color:${c};font-size:1.3rem;font-weight:700">${v}</div>
        <div style="color:${th.textFaint};font-size:0.68rem;margin-top:2px">${l}</div>
      </div>`).join('')}
    </div>
    <div style="display:flex;flex-direction:column;gap:0.75rem">
      ${filtered.map(a=>{
        const co=getCompanies().find(c=>c.id===a.companyId);
        const notes=state.alertNotes[a.id]||[];
        const ack=state.alertAcknowledgments[a.id];
        const hasEsc = !!state.escalationTimers[a.id];
        return `
        <div style="background:${th.surface};border:1px solid ${a.resolved?th.border:a.severity==='critical'?'rgba(239,68,68,0.3)':a.severity==='warning'?'rgba(245,158,11,0.25)':'rgba(96,165,250,0.2)'};border-radius:12px;padding:1rem;opacity:${a.resolved?0.55:1}">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px">
            <div style="flex:1">
              <div style="color:${th.text};font-weight:600;font-size:0.88rem;margin-bottom:2px">${a.title}</div>
              <div style="color:${th.textMuted};font-size:0.72rem">${co?.name||a.companyId} · ${a.location}</div>
            </div>
            <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;justify-content:flex-end">
              ${statusBadgeHTML(a.severity)}${a.resolved?statusBadgeHTML('normal'):''}
              ${ack?`<span style="background:rgba(52,211,153,0.12);border:1px solid rgba(52,211,153,0.3);color:#34d399;font-size:0.62rem;padding:2px 7px;border-radius:4px;font-weight:600">Acknowledged · ${ack.name}</span>`:''}
              ${hasEsc&&!ack?`<span style="background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.3);color:#f59e0b;font-size:0.62rem;padding:2px 7px;border-radius:4px;font-weight:600;animation:pulse 2s infinite">⏱ ESCALATING</span>`:''}
            </div>
          </div>
          <p style="color:${th.textMuted};font-size:0.78rem;margin-bottom:8px;line-height:1.5">${a.description}</p>
          ${notes.length>0?`
          <div style="background:${th.accentBg};border:1px solid ${th.border};border-radius:8px;padding:0.6rem 0.8rem;margin-bottom:8px">
            <div style="color:${th.textMuted};font-size:0.68rem;font-weight:600;margin-bottom:5px;letter-spacing:0.05em">NOTES (${notes.length})</div>
            ${notes.map(n=>`<div style="font-size:0.75rem;color:${th.text};padding:3px 0;border-bottom:1px solid ${th.border}"><span style="color:${th.accent};font-weight:600">${n.author}</span>: ${n.text} <span style="color:${th.textFaint};font-size:0.68rem">· ${fmtTime(n.time)}</span></div>`).join('')}
          </div>`:''}
          ${!a.resolved?`
          <div style="display:flex;gap:6px;margin-bottom:8px">
            <input id="note-input-${a.id}" placeholder="Add a note to this alert…" style="flex:1;padding:0.35rem 0.7rem;background:${th.inputBg};border:1px solid ${th.inputBorder};border-radius:6px;color:${th.text};font-size:0.75rem;outline:none"/>
            <button data-add-note="${a.id}" style="padding:0.35rem 0.75rem;background:${th.accentBg};border:1px solid ${th.borderStrong};border-radius:6px;color:${th.accent};font-size:0.73rem;cursor:pointer;font-weight:600;white-space:nowrap">Add</button>
          </div>`:''}
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px">
            <span style="color:${th.textFaint};font-size:0.72rem">⏱ ${fmtTime(a.timestamp)}${a.assignedTo?` · ${a.assignedTo}`:''}</span>
            <div style="display:flex;gap:6px;flex-wrap:wrap">
              ${!a.resolved&&a.severity!=='info'&&!ack?`<button data-ack-alert="${a.id}" data-company="${a.companyId}" style="padding:0.3rem 0.75rem;background:rgba(251,191,36,0.1);border:1px solid rgba(251,191,36,0.3);border-radius:6px;color:#fbbf24;font-size:0.73rem;cursor:pointer;font-weight:600">Acknowledge</button>`:''}
              ${!a.resolved&&a.severity!=='info'?`<button data-resolve-global="${a.id}" data-company="${a.companyId}" style="padding:0.3rem 0.75rem;background:rgba(52,211,153,0.1);border:1px solid rgba(52,211,153,0.25);border-radius:6px;color:#34d399;font-size:0.73rem;cursor:pointer">✓ Resolve</button>`:''}
            </div>
          </div>
        </div>`;
      }).join('')}
    </div>`}
  </div>`;
}

function renderNotificationLog(th) {
  const log = state.notificationLog;
  const typeIcon = { push: 'Push', email: 'Email', sms: 'SMS' };
  const typeColor = { push: '#60a5fa', email: '#a78bfa', sms: '#34d399' };
  return `
  <div>
    <div style="background:${th.surface};border:1px solid ${th.border};border-radius:12px;padding:1rem;margin-bottom:1rem">
      <div style="color:${th.accent};font-size:0.72rem;font-weight:700;letter-spacing:0.08em;margin-bottom:0.75rem">🔔 NOTIFICATION SETTINGS</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:0.65rem">
        ${[
          ['pushNotifEnabled','Push Notifications','Phone alerts even when app is closed'],
          ['emailAlertEnabled','Email Alerts','Critical alerts via email'],
          ['smsAlertEnabled','SMS Alerts','Critical alerts via text message'],
        ].map(([key,label,sub])=>`
        <div style="display:flex;justify-content:space-between;align-items:center;background:${th.accentBg};border:1px solid ${th.border};border-radius:8px;padding:0.65rem 0.85rem">
          <div>
            <div style="color:${th.text};font-size:0.8rem;font-weight:600">${label}</div>
            <div style="color:${th.textFaint};font-size:0.68rem;margin-top:1px">${sub}</div>
          </div>
          <button data-notif-toggle="${key}" data-val="${state[key]}" style="width:40px;height:22px;border-radius:11px;border:none;background:${state[key]?th.accent:'rgba(100,100,100,0.3)'};cursor:pointer;position:relative;flex-shrink:0;transition:background 0.2s">
            <div style="width:16px;height:16px;background:#fff;border-radius:50%;position:absolute;top:3px;${state[key]?'right:3px':'left:3px'};transition:all 0.2s"></div>
          </button>
        </div>`).join('')}
        <div style="display:flex;justify-content:space-between;align-items:center;background:${th.accentBg};border:1px solid ${th.border};border-radius:8px;padding:0.65rem 0.85rem">
          <div>
            <div style="color:${th.text};font-size:0.8rem;font-weight:600">Escalation Time</div>
            <div style="color:${th.textFaint};font-size:0.68rem;margin-top:1px">Escalate after N minutes unacknowledged</div>
          </div>
          <div style="display:flex;align-items:center;gap:6px">
            <button data-esc-adj="-1" style="width:22px;height:22px;border-radius:5px;background:${th.surface};border:1px solid ${th.border};color:${th.text};cursor:pointer;font-size:0.85rem;display:flex;align-items:center;justify-content:center">−</button>
            <span style="color:${th.accent};font-weight:700;font-size:0.85rem;min-width:28px;text-align:center">${state.escalationMinutes}</span>
            <button data-esc-adj="+1" style="width:22px;height:22px;border-radius:5px;background:${th.surface};border:1px solid ${th.border};color:${th.text};cursor:pointer;font-size:0.85rem;display:flex;align-items:center;justify-content:center">+</button>
            <span style="color:${th.textFaint};font-size:0.72rem">min</span>
          </div>
        </div>
      </div>
    </div>
    <div style="background:${th.surface};border:1px solid ${th.border};border-radius:12px;overflow:hidden">
      <div style="padding:0.75rem 1rem;border-bottom:1px solid ${th.border};display:flex;justify-content:space-between;align-items:center">
        <span style="color:${th.text};font-size:0.85rem;font-weight:600">📣 Notification Log (${log.length})</span>
        <span style="color:${th.textFaint};font-size:0.72rem">Simulated — shows what would be sent</span>
      </div>
      ${log.length === 0 ? `<div style="padding:2rem;text-align:center;color:${th.textMuted};font-size:0.82rem">No notifications yet. Alerts will trigger push/email/SMS entries here.</div>` : `
      <div style="max-height:400px;overflow-y:auto">
        ${log.map(n=>{
          const tc = typeColor[n.type] || th.accent;
          const ti = typeIcon[n.type] || 'Notif';
          return `<div style="padding:0.65rem 1rem;border-bottom:1px solid ${th.border};display:flex;gap:10px;align-items:flex-start">
            <div style="width:32px;height:32px;border-radius:8px;background:${tc}15;border:1px solid ${tc}40;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:1rem">${ti}</div>
            <div style="flex:1;min-width:0">
              <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-bottom:2px">
                <span style="color:${tc};font-size:0.7rem;font-weight:700;text-transform:uppercase">${n.type}</span>
                ${n.escalated?`<span style="background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.3);color:#f87171;font-size:0.62rem;padding:1px 6px;border-radius:4px;font-weight:700">ESCALATED</span>`:''}
                <span style="background:${n.severity==='critical'?'rgba(239,68,68,0.12)':'rgba(245,158,11,0.12)'};border:1px solid ${n.severity==='critical'?'rgba(239,68,68,0.3)':'rgba(245,158,11,0.3)'};color:${n.severity==='critical'?'#f87171':'#fbbf24'};font-size:0.62rem;padding:1px 6px;border-radius:4px;font-weight:700;text-transform:uppercase">${n.severity||'info'}</span>
              </div>
              <div style="color:${th.text};font-size:0.78rem;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${n.alertTitle}</div>
              <div style="color:${th.textFaint};font-size:0.68rem;margin-top:1px">To: ${n.recipient} (${n.recipientEmail}) · ${fmtTime(n.timestamp)}</div>
            </div>
          </div>`;
        }).join('')}
      </div>`}
    </div>
  </div>`;
}

// ─── SENSORS PAGE ─────────────────────────────────────────────────
function renderSensorsPage() {
  const th = t();
  const allSensors = getCompanies().flatMap(c=>
    (PIPELINE_CONFIGS[c.id]||[]).flatMap(pl=>
      pl.sensors.map(s=>({...s,pipeline:pl.name,pipelineId:pl.id,company:c.name,companyId:c.id,companyStatus:c.status,key:`${c.id}-${pl.id}-${s.id}`}))
    )
  );
  const activeCount = allSensors.filter(s=>state.sensorStates[s.key]!==false).length;
  const typeColors  = {pressure:"#60a5fa",flow:"#a78bfa",acoustic:"#34d399",infrared:"#f97316"};
  const allOn = allSensors.every(s=>state.sensorStates[s.key]!==false);
  return `
  <div style="padding:1rem;max-width:1100px;margin:0 auto" class="fade-in">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;flex-wrap:wrap;gap:8px">
      <div>
        <h2 style="color:${th.text};font-size:1rem;font-weight:600">📡 Live Sensor Overview</h2>
        <div style="color:${th.textMuted};font-size:0.78rem;margin-top:2px">${activeCount}/${allSensors.length} sensors active</div>
      </div>
      <button id="toggle-all-global" data-allon="${allOn}" style="padding:0.4rem 1rem;background:${th.accentBg};border:1px solid ${th.borderStrong};border-radius:7px;color:${th.accent};font-size:0.78rem;cursor:pointer;font-weight:600;white-space:nowrap">
        ${allOn?'Turn All OFF':'Turn All ON'}
      </button>
    </div>
    <div class="sensor-grid">
      ${allSensors.map(s=>{
        const rawState = state.sensorStates[s.key];
        const isOn = rawState !== false && rawState !== 'pending-off';
        const isPendingOff = rawState === 'pending-off';
        const col = typeColors[s.type]||th.accent;
        return `
        <div style="background:${th.surface};border:1px solid ${isOn||isPendingOff?th.border:'rgba(107,114,128,0.15)'};border-radius:10px;padding:0.9rem;opacity:${isOn||isPendingOff?1:0.55};transition:opacity 0.25s">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
            <div style="display:flex;align-items:center;gap:8px">
              <div style="width:32px;height:32px;border-radius:8px;background:${col}18;border:1px solid ${isOn?col+'40':isPendingOff?'rgba(245,158,11,0.4)':'rgba(107,114,128,0.2)'};display:flex;align-items:center;justify-content:center">
                <div style="width:10px;height:10px;border-radius:50%;background:${isOn?col:isPendingOff?'#f59e0b':'#4b5563'};box-shadow:${isOn?`0 0 5px ${col}`:isPendingOff?'0 0 5px #f59e0b':'none'}"></div>
              </div>
              <div>
                <div style="color:${isOn?th.text:isPendingOff?'#f59e0b':'#6b7280'};font-size:0.8rem;font-weight:600;text-transform:capitalize">${s.type}</div>
                <div style="color:${th.textFaint};font-size:0.68rem">${s.id.toUpperCase()}${isPendingOff?' — powering down in ~3 min':''}</div>
              </div>
            </div>
            <button data-sensor-key="${s.key}" data-sensor-val="${isOn||isPendingOff}" style="width:40px;height:22px;border-radius:11px;background:${isOn?col:isPendingOff?'#f59e0b':'rgba(75,85,99,0.5)'};border:none;cursor:pointer;position:relative;flex-shrink:0">
              <div style="position:absolute;top:3px;left:${isOn||isPendingOff?'20px':'3px'};width:16px;height:16px;border-radius:50%;background:#fff;transition:left 0.2s;box-shadow:0 1px 3px rgba(0,0,0,0.3)"></div>
            </button>
          </div>
          <div style="color:${th.textMuted};font-size:0.7rem;margin-bottom:2px">${s.pipeline}</div>
          <div style="color:${th.textFaint};font-size:0.68rem">${s.company}</div>
          <div style="margin-top:8px;padding-top:8px;border-top:1px solid ${th.border};display:flex;justify-content:space-between;align-items:center">
            ${statusBadgeHTML(isOn?s.status:isPendingOff?'warning':'offline')}
            <span style="color:${isOn?'#34d399':isPendingOff?'#f59e0b':'#6b7280'};font-size:0.68rem;font-weight:600">${isOn?'🟢 ACTIVE':isPendingOff?'🟡 POWERING DOWN':'🔴 OFFLINE'}</span>
          </div>
        </div>`;
      }).join('')}
    </div>
  </div>`;
}

// ─── MAP PAGE ─────────────────────────────────────────────────────
function renderMapPage() {
  const th = t();
  const companies = getCompanies();

  // Derive status live from alerts
  const liveStatus = (cid) => {
    const hasCrit = (state.alerts[cid]||[]).some(a=>!a.resolved&&a.severity==='critical');
    const hasWarn = (state.alerts[cid]||[]).some(a=>!a.resolved&&a.severity==='warning');
    const co = companies.find(c=>c.id===cid);
    if (hasCrit || co?.status==='critical') return 'critical';
    if (hasWarn || co?.status==='warning') return 'warning';
    return 'operational';
  };

  // Company node positions on SVG
  const nodes = [
    {id:"shell",   name:"Shell Petroleum",    shortName:"Shell",   x:180, y:210},
    {id:"chevron", name:"TotalEnergies Ghana", shortName:"Total",   x:420, y:170},
    {id:"exxon",   name:"Eni Ghana E&P",       shortName:"Eni",     x:660, y:200},
    {id:"bp",      name:"Tullow Oil Ghana",    shortName:"Tullow",  x:360, y:340},
  ];

  // Pipeline connection lines between companies
  const connections = [
    {a:0,b:1, flow:'normal'},
    {a:1,b:2, flow:'normal'},
    {a:0,b:3, flow:'warning'},
    {a:1,b:3, flow:'critical'},
    {a:2,b:3, flow:'normal'},
  ];

  // Engineers grouped by company
  const engineersByCompany = {};
  USERS.filter(u=>u.role==='engineer').forEach(u => {
    const cid = ZONE_PIPELINE_MAP[u.zone];
    if (!engineersByCompany[cid]) engineersByCompany[cid] = [];
    engineersByCompany[cid].push(u);
  });

  // Selected node state
  const sel = state.mapSelectedNode || null;
  const selCompany = sel ? companies.find(c=>c.id===sel) : null;
  const selAlerts  = sel ? (state.alerts[sel]||[]).filter(a=>!a.resolved&&a.severity!=='info') : [];
  const selEngs    = sel ? (engineersByCompany[sel]||[]) : [];

  const colOf = (status) =>
    status==='critical'?'#ef4444':status==='warning'?'#f59e0b':'#34d399';

  // Flow animation class per connection
  const flowCls = (f) =>
    f==='critical'?'pipeline-flow-critical':f==='warning'?'pipeline-flow':'pipeline-flow-slow';

  // Build SVG
  let svgLines = '';
  connections.forEach(({a,b,flow}) => {
    const na=nodes[a], nb=nodes[b];
    const fc = flow==='critical'?'#ef444466':flow==='warning'?'#f59e0b66':'#22d3ee33';
    const fc2 = flow==='critical'?'#fca5a8':flow==='warning'?'#fcd34d':'#67e8f9';
    const mx=(na.x+nb.x)/2, my=(na.y+nb.y)/2-30;
    const pathD=`M ${na.x} ${na.y} Q ${mx} ${my} ${nb.x} ${nb.y}`;
    svgLines += `
      <path d="${pathD}" stroke="${fc}" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path d="${pathD}" stroke="${fc2}" stroke-width="2" fill="none" stroke-linecap="round" stroke-dasharray="10 20" class="${flowCls(flow)}" style="pointer-events:none"/>`;
  });

  let svgNodes = '';
  nodes.forEach(n => {
    const status = liveStatus(n.id);
    const col = colOf(status);
    const isSel = sel===n.id;
    const alertCount = (state.alerts[n.id]||[]).filter(a=>!a.resolved&&a.severity!=='info').length;
    const engs = engineersByCompany[n.id]||[];
    const ringR = isSel ? 38 : 32;
    svgNodes += `
      <g data-company="${n.id}" class="map-node" style="cursor:pointer">
        <!-- Outer pulse ring -->
        <circle cx="${n.x}" cy="${n.y}" r="${ringR}" fill="none" stroke="${col}" stroke-width="${isSel?2:1}" opacity="${isSel?0.5:0.3}">
          <animate attributeName="r" from="${ringR}" to="${ringR+16}" dur="${status==='critical'?'0.9s':'2s'}" repeatCount="indefinite"/>
          <animate attributeName="opacity" from="${isSel?0.5:0.3}" to="0" dur="${status==='critical'?'0.9s':'2s'}" repeatCount="indefinite"/>
        </circle>
        <!-- Selected highlight ring -->
        ${isSel?`<circle cx="${n.x}" cy="${n.y}" r="34" fill="none" stroke="${col}" stroke-width="2.5" stroke-dasharray="6 3"/>`:''}
        <!-- Main node circle -->
        <circle cx="${n.x}" cy="${n.y}" r="26" fill="${isSel?col+'44':col+'1a'}" stroke="${col}" stroke-width="${isSel?2.5:2}"/>
        <!-- Company initial letter -->
        <text x="${n.x}" y="${n.y-2}" text-anchor="middle" fill="${col}" font-size="13" font-weight="bold" style="pointer-events:none">${n.shortName[0]}</text>
        <!-- Pipeline count -->
        <text x="${n.x}" y="${n.y+11}" text-anchor="middle" fill="${col}aa" font-size="8" style="pointer-events:none">${(companies.find(c=>c.id===n.id)?.pipelines||0)}PL</text>
        <!-- Company name label -->
        <text x="${n.x}" y="${n.y+42}" text-anchor="middle" fill="${th.text}" font-size="10" font-weight="600" style="pointer-events:none">${n.shortName}</text>
        <!-- Engineer count badge -->
        <circle cx="${n.x+20}" cy="${n.y-20}" r="9" fill="${th.header}" stroke="${th.accent}" stroke-width="1.5" style="pointer-events:none"/>
        <text x="${n.x+20}" y="${n.y-16}" text-anchor="middle" fill="${th.accent}" font-size="8" font-weight="bold" style="pointer-events:none">${engs.length}</text>
        <!-- Alert badge -->
        ${alertCount>0?`
        <circle cx="${n.x-20}" cy="${n.y-20}" r="9" fill="#ef4444" stroke="${th.header}" stroke-width="1.5" style="pointer-events:none"/>
        <text x="${n.x-20}" y="${n.y-16}" text-anchor="middle" fill="#fff" font-size="8" font-weight="bold" style="pointer-events:none">${alertCount}</text>
        `:''}
      </g>`;
  });

  // Legend
  const legend = `
    <g transform="translate(16, 460)">
      ${[['operational','#34d399','Operational'],['warning','#f59e0b','Warning'],['critical','#ef4444','Critical']].map(([s,c,l],i)=>`
        <circle cx="${i*110}" cy="0" r="5" fill="${c}33" stroke="${c}" stroke-width="1.5"/>
        <text x="${i*110+12}" y="4" fill="${th.textMuted}" font-size="10">${l}</text>
      `).join('')}
      <text x="340" y="4" fill="${th.textFaint}" font-size="9">· badge = engineers · red badge = alerts</text>
    </g>`;

  // Right panel: engineer monitoring
  const rightPanel = sel && selCompany ? `
    <div style="border-top:1px solid ${th.border}">

      <!-- Company header -->
      <div style="padding:0.85rem 1rem;background:${colOf(liveStatus(sel))}15;border-bottom:1px solid ${th.border}">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
          <div style="color:${th.text};font-weight:700;font-size:0.9rem">${selCompany.name}</div>
          ${statusBadgeHTML(liveStatus(sel))}
        </div>
        <div style="color:${th.textMuted};font-size:0.72rem">${selCompany.region} · ${selCompany.pipelines} pipelines</div>
      </div>

      <!-- Active alerts for this company -->
      <div style="padding:0.75rem 1rem;border-bottom:1px solid ${th.border}">
        <div style="color:${th.textMuted};font-size:0.68rem;font-weight:700;letter-spacing:0.08em;margin-bottom:0.5rem">⚠️ ACTIVE ALERTS</div>
        ${selAlerts.length===0
          ? `<div style="color:${th.textFaint};font-size:0.78rem;padding:0.4rem 0">No active alerts</div>`
          : selAlerts.map(a=>`
            <div style="display:flex;gap:8px;align-items:flex-start;padding:0.5rem 0;border-bottom:1px solid ${th.border}">
              <div style="width:7px;height:7px;border-radius:50%;background:${a.severity==='critical'?'#ef4444':'#f59e0b'};margin-top:4px;flex-shrink:0;${a.severity==='critical'?'animation:pulse 0.8s ease infinite':''}"></div>
              <div style="flex:1;min-width:0">
                <div style="color:${a.severity==='critical'?'#fca5a5':'#fcd34d'};font-size:0.75rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${a.title}</div>
                <div style="color:${th.textFaint};font-size:0.68rem;margin-top:1px">${fmtTime(a.timestamp)}</div>
              </div>
              ${!a.resolved?`<button data-resolve="${a.id}" data-company="${sel}" style="padding:2px 7px;background:rgba(52,211,153,0.1);border:1px solid rgba(52,211,153,0.3);border-radius:4px;color:#34d399;font-size:0.65rem;cursor:pointer;flex-shrink:0">Resolve</button>`:''}
            </div>`).join('')}
      </div>

      <!-- Assigned engineers -->
      <div style="padding:0.75rem 1rem">
        <div style="color:${th.textMuted};font-size:0.68rem;font-weight:700;letter-spacing:0.08em;margin-bottom:0.5rem">👷 MONITORING ENGINEERS</div>
        ${selEngs.length===0
          ? `<div style="color:${th.textFaint};font-size:0.78rem">No engineers assigned</div>`
          : selEngs.map(eng=>{
              const zone = eng.zone;
              const zoneAlerts = (state.alerts[sel]||[]).filter(a=>!a.resolved&&a.severity!=='info'&&
                Object.entries(ZONE_PIPELINE_MAP).some(([z,c])=>z===zone&&c===sel));
              const dispatched = (state.alerts[sel]||[]).some(a=>a.assignedTo===eng.name);
              return `
              <div style="display:flex;align-items:center;gap:8px;padding:0.55rem 0.7rem;background:${th.accentBg};border:1px solid ${dispatched?th.borderStrong:th.border};border-radius:8px;margin-bottom:5px">
                <div style="width:30px;height:30px;border-radius:50%;background:${dispatched?'rgba(52,211,153,0.2)':th.surface};border:1.5px solid ${dispatched?'#34d399':th.border};display:flex;align-items:center;justify-content:center;flex-shrink:0">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="${dispatched?'#34d399':th.textMuted}" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                <div style="flex:1;min-width:0">
                  <div style="color:${th.text};font-size:0.75rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${eng.name}</div>
                  <div style="color:${th.textFaint};font-size:0.65rem">Zone ${zone} ${dispatched?'· <span style="color:#34d399">Dispatched</span>':''}</div>
                </div>
                ${dispatched
                  ? `<span style="background:rgba(52,211,153,0.12);border:1px solid rgba(52,211,153,0.3);color:#34d399;font-size:0.62rem;padding:2px 6px;border-radius:4px;flex-shrink:0;font-weight:600">📍 ON SITE</span>`
                  : selAlerts.length>0
                    ? `<button data-dispatch="${selAlerts[0].id}" data-company="${sel}" style="padding:2px 8px;background:${th.accentBg};border:1px solid ${th.borderStrong};border-radius:5px;color:${th.accent};font-size:0.65rem;cursor:pointer;flex-shrink:0;font-weight:600">Alert</button>`
                    : `<span style="background:rgba(52,211,153,0.08);border:1px solid rgba(52,211,153,0.2);color:rgba(52,211,153,0.6);font-size:0.62rem;padding:2px 6px;border-radius:4px;flex-shrink:0">🟢 STANDBY</span>`
                }
              </div>`;
            }).join('')}
        <!-- View company detail button -->
        <button data-company-nav="${sel}" style="margin-top:0.6rem;width:100%;padding:0.5rem;background:${th.accentBg};border:1px solid ${th.borderStrong};border-radius:8px;color:${th.accent};font-size:0.75rem;font-weight:600;cursor:pointer">
          Inspect Pipeline Detail →
        </button>
      </div>
    </div>
  ` : `
    <div style="padding:1.5rem 1rem;text-align:center;color:${th.textMuted};font-size:0.8rem">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="${th.textFaint}" stroke-width="1.5" style="display:block;margin:0 auto 0.5rem"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>
      Tap a company node<br>to view engineers &amp; alerts
    </div>
  `;

  return `
  <div style="padding:1rem;display:flex;flex-direction:column;gap:1rem" class="fade-in">
    <!-- Title row with legend pills -->
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
      <h2 style="color:${th.text};font-size:1rem;font-weight:600;margin:0">🗺️ Ghana Pipeline Network</h2>
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        ${companies.map(c=>{
          const s=liveStatus(c.id);
          const col=colOf(s);
          return `<div style="display:flex;align-items:center;gap:4px;padding:3px 8px;background:${col}15;border:1px solid ${col}40;border-radius:5px">
            <div style="width:6px;height:6px;border-radius:50%;background:${col};${s==='critical'?'animation:pulse 0.8s ease infinite':''}"></div>
            <span style="color:${col};font-size:0.65rem;font-weight:600">${c.name.split(' ')[0]}</span>
          </div>`;
        }).join('')}
      </div>
    </div>

    <!-- Map + right panel side by side on desktop, stacked on mobile -->
    <div style="display:flex;flex-direction:column;gap:1rem">
      <!-- SVG map -->
      <div style="background:${th.surface};border:1px solid ${th.border};border-radius:12px;overflow:hidden">
        <svg viewBox="0 0 860 500" style="width:100%;display:block;background:${th.cardGrid}">
          <defs>
            <pattern id="mapgrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="${th.gridLine}" stroke-width="0.8"/>
            </pattern>
            <radialGradient id="glow-op" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#34d39922"/><stop offset="100%" stop-color="transparent"/></radialGradient>
            <radialGradient id="glow-warn" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#f59e0b22"/><stop offset="100%" stop-color="transparent"/></radialGradient>
            <radialGradient id="glow-crit" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#ef444422"/><stop offset="100%" stop-color="transparent"/></radialGradient>
          </defs>

          <!-- Background grid -->
          <rect width="860" height="500" fill="${th.cardGrid}"/>
          <rect width="860" height="500" fill="url(#mapgrid)"/>

          <!-- Ghana coastline suggestion -->
          <path d="M 60 430 Q 160 410 260 420 Q 380 435 500 415 Q 620 400 740 410 Q 790 415 820 420"
            stroke="${th.accent}25" stroke-width="3" fill="none" stroke-dasharray="8,5"/>
          <text x="440" y="450" fill="${th.textFaint}" font-size="10" text-anchor="middle" font-style="italic">Gulf of Guinea coastline</text>

          <!-- Tano Basin / region labels -->
          <text x="390" y="155" fill="${th.textFaint}" font-size="9" text-anchor="middle">Tano Basin</text>
          <text x="180" y="270" fill="${th.textFaint}" font-size="9" text-anchor="middle">Gulf of Guinea</text>
          <text x="660" y="155" fill="${th.textFaint}" font-size="9" text-anchor="middle">Cape Three Points</text>
          <text x="360" y="390" fill="${th.textFaint}" font-size="9" text-anchor="middle">Jubilee Field</text>

          <!-- Pipeline connections -->
          ${svgLines}

          <!-- Company nodes -->
          ${svgNodes}

          <!-- Legend -->
          ${legend}

          <!-- Title -->
          <text x="430" y="22" fill="${th.textMuted}" font-size="11" text-anchor="middle" font-weight="600">GHANA OFFSHORE PIPELINE NETWORK · LIVE</text>
        </svg>
      </div>

      <!-- Engineer / alert panel -->
      <div style="background:${th.surface};border:1px solid ${sel&&liveStatus(sel)==='critical'?'rgba(239,68,68,0.35)':sel&&liveStatus(sel)==='warning'?'rgba(245,158,11,0.3)':th.border};border-radius:12px;overflow:hidden">
        <!-- Panel header -->
        <div style="padding:0.7rem 1rem;background:${th.header};border-bottom:1px solid ${th.border};display:flex;justify-content:space-between;align-items:center">
          <div style="color:${th.text};font-size:0.8rem;font-weight:600">
            ${sel ? `${selCompany?.name || sel}` : 'Engineer Monitor'}
          </div>
          <div style="display:flex;gap:5px">
            ${companies.map(c=>{
              const s=liveStatus(c.id);
              const col=colOf(s);
              return `<button data-map-node="${c.id}" style="padding:3px 8px;background:${sel===c.id?col+'22':'transparent'};border:1px solid ${sel===c.id?col:th.border};border-radius:5px;color:${sel===c.id?col:th.textMuted};font-size:0.65rem;cursor:pointer;font-weight:600">${c.name.split(' ')[0]}</button>`;
            }).join('')}
          </div>
        </div>
        ${rightPanel}
      </div>
    </div>
  </div>`;
}

// ─── REPORTS PAGE ─────────────────────────────────────────────────
function renderReportsPage() {
  const th = t();
  const companies = getCompanies();
  const reports = [
    ["Monthly Incident Report","April 2026","Ready","📋","monthly-incident"],
    ["Pipeline Health Summary","Q1 2026","Ready","🛢️","pipeline-health"],
    ["Sensor Calibration Log","March 2026","Ready","📡","sensor-calibration"],
    ["Environmental Impact Audit","Q1 2026","Pending","🌿","env-audit"],
    ["Engineer Dispatch Log","April 2026","Ready","👷","engineer-dispatch"],
    ["Annual Safety Review","2025","Archived","🛡️","annual-safety"],
  ];
  return `
  <div style="padding:1rem;max-width:900px;margin:0 auto" class="fade-in">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;flex-wrap:wrap;gap:8px">
      <h2 style="color:${th.text};font-size:1rem;font-weight:600;margin:0">📄 Reports</h2>
      <span style="color:${th.textMuted};font-size:0.75rem">${companies.length} compan${companies.length===1?'y':'ies'} monitored</span>
    </div>
    <div class="report-grid">
      ${reports.map(([title,date,status,icon,key])=>`
      <div style="background:${th.surface};border:1px solid ${th.border};border-radius:12px;padding:1.25rem">
        <div style="font-size:1.8rem;margin-bottom:8px">${icon}</div>
        <div style="color:${th.text};font-weight:600;font-size:0.9rem;margin-bottom:4px">${title}</div>
        <div style="color:${th.textMuted};font-size:0.75rem;margin-bottom:12px">${date}</div>
        <div style="display:flex;justify-content:space-between;align-items:center">
          ${statusBadgeHTML(status)}
          ${status==='Ready'?`<button data-pdf-report="${key}" data-pdf-title="${title}" data-pdf-date="${date}" style="display:flex;align-items:center;gap:5px;padding:0.3rem 0.8rem;background:${th.accentBg};border:1px solid ${th.border};border-radius:6px;color:${th.accent};font-size:0.73rem;cursor:pointer">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Download PDF
          </button>`:''}
        </div>
      </div>`).join('')}
    </div>
  </div>`;
}

// ─── SETTINGS PAGE ────────────────────────────────────────────────
function renderSettingsPage() {
  const th = t();
  const engineers = USERS_DATA.filter(u=>u.role==='engineer');
  const settingsTab = state.settingsTab || 'settings';

  function toggle(on) {
    return `
    <div style="width:44px;height:24px;border-radius:12px;background:${on?th.accent:'rgba(107,114,128,0.4)'};position:relative;flex-shrink:0;transition:background 0.2s;cursor:pointer">
      <div style="position:absolute;top:3px;left:${on?'23px':'3px'};width:18px;height:18px;border-radius:50%;background:#fff;transition:left 0.2s;box-shadow:0 1px 3px rgba(0,0,0,0.3)"></div>
    </div>`;
  }

  const tabs = state.user.role==='admin'
    ? [['settings','⚙️ Settings'],['admin','👥 User Management'],['audit','📋 Audit Log']]
    : [['settings','⚙️ Settings'],['audit','📋 My Activity']];

  return `
  <div style="padding:1rem;max-width:900px;margin:0 auto" class="fade-in">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem;flex-wrap:wrap;gap:8px">
      <h2 style="color:${th.text};font-size:1rem;font-weight:600;margin:0">⚙️ Settings</h2>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button id="handover-btn" style="padding:0.4rem 0.9rem;background:${th.accentBg};border:1px solid ${th.border};border-radius:7px;color:${th.textMuted};font-size:0.78rem;font-weight:600;cursor:pointer">📋 Shift Handover</button>
        ${state.user.role==='admin'?`<button id="export-csv-btn" style="padding:0.4rem 0.9rem;background:${th.accentBg};border:1px solid ${th.border};border-radius:7px;color:${th.textMuted};font-size:0.78rem;font-weight:600;cursor:pointer">📥 Export CSV</button>`:''}
      </div>
    </div>

    <!-- Sub-tabs -->
    <div style="display:flex;gap:4px;margin-bottom:1rem;background:${th.surface};border:1px solid ${th.border};border-radius:10px;padding:4px">
      ${tabs.map(([key,label])=>`
      <button data-settings-tab="${key}" style="flex:1;padding:0.4rem 0.5rem;background:${settingsTab===key?th.header:'transparent'};border:${settingsTab===key?`1px solid ${th.borderStrong}`:'1px solid transparent'};border-radius:7px;color:${settingsTab===key?th.accent:th.navInactive};font-size:0.72rem;font-weight:600;cursor:pointer;white-space:nowrap">${label}</button>`).join('')}
    </div>

    ${settingsTab === 'admin' && state.user.role==='admin' ? renderAdminPanel(th) : ''}
    ${settingsTab === 'audit' ? renderAuditLog(th) : ''}
    ${settingsTab === 'settings' ? `
    <div class="settings-grid">

      <!-- Account card -->
      <div style="background:${th.surface};border:1px solid ${th.border};border-radius:12px;padding:1.25rem">
        <h3 style="color:${th.accent};font-size:0.78rem;font-weight:700;margin-bottom:1rem;letter-spacing:0.08em">👤 YOUR ACCOUNT</h3>
        ${[["Name",state.user.name],["Email",state.user.email],["Role",state.user.role.toUpperCase()],["Zone",state.user.zone],["Session","Active ✓"]].map(([k,v])=>`
        <div style="display:flex;justify-content:space-between;align-items:center;padding:0.5rem 0;border-bottom:1px solid ${th.border}">
          <span style="color:${th.textMuted};font-size:0.8rem">${k}</span>
          <span style="color:${k==='Session'?'#34d399':th.text};font-size:0.8rem;font-weight:500;text-align:right;max-width:60%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${v}</span>
        </div>`).join('')}
        <button id="open-password-modal" style="margin-top:1rem;width:100%;padding:0.5rem;background:${th.accentBg};border:1px solid ${th.borderStrong};border-radius:8px;color:${th.accent};font-size:0.78rem;font-weight:600;cursor:pointer">Change Password</button>
        <button id="open-threshold-modal" style="margin-top:0.5rem;width:100%;padding:0.5rem;background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.28);border-radius:8px;color:#f59e0b;font-size:0.78rem;font-weight:600;cursor:pointer">📊 Set Sensor Thresholds</button>
        ${state.user.role==='engineer'?`
        <div style="margin-top:1rem">
          <div style="color:${th.textMuted};font-size:0.72rem;font-weight:600;margin-bottom:0.5rem;letter-spacing:0.06em">MY AVAILABILITY</div>
          <div style="display:flex;gap:0.4rem">
            ${[['available','#34d399'],['busy','#f59e0b'],['offline','#6b7280']].map(([avail,col])=>{
              const isSel=(state.engineerAvailability[state.user.email]||'available')===avail;
              return `<button data-set-avail="${avail}" style="flex:1;padding:0.45rem 0.3rem;background:${isSel?col+'22':'transparent'};border:1px solid ${isSel?col:th.border};border-radius:7px;color:${isSel?col:th.textMuted};font-size:0.72rem;font-weight:600;cursor:pointer;text-transform:capitalize">${avail}</button>`;
            }).join('')}
          </div>
        </div>`:''}
      </div>

      <!-- Theme card -->
      <div style="background:${th.surface};border:1px solid ${th.border};border-radius:12px;padding:1.25rem">
        <h3 style="color:${th.accent};font-size:0.78rem;font-weight:700;margin-bottom:1rem;letter-spacing:0.08em">🎨 THEME</h3>
        <div style="display:flex;flex-direction:column;gap:0.5rem">
          ${Object.entries(THEMES).map(([key,th2])=>`
          <button data-theme="${key}" style="display:flex;align-items:center;gap:12px;padding:0.65rem 0.9rem;background:${state.theme===key?th.accentBg:'transparent'};border:1px solid ${state.theme===key?th.borderStrong:th.border};border-radius:8px;cursor:pointer;text-align:left">
            <span style="width:16px;height:16px;border-radius:50%;background:${th2.swatch};flex-shrink:0;display:inline-block;box-shadow:0 0 6px ${th2.swatch}99"></span>
            <span style="color:${state.theme===key?th.accent:th.text};font-size:0.82rem;font-weight:500;flex:1">${th2.name}</span>
            ${state.theme===key?`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${th.accent}" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`:''}
          </button>`).join('')}
        </div>
      </div>

      <!-- Alarm settings card -->
      <div style="background:${th.surface};border:1px solid ${th.border};border-radius:12px;padding:1.25rem">
        <h3 style="color:${th.accent};font-size:0.78rem;font-weight:700;margin-bottom:0.25rem;letter-spacing:0.08em">🚨 ALARM SYSTEM</h3>
        <p style="color:${th.textMuted};font-size:0.72rem;margin-bottom:1rem;line-height:1.5">Control alerts, audio and voice announcements.</p>

        <!-- Master toggle -->
        <div style="padding:0.65rem 0.9rem;background:${state.alarmEnabled?'rgba(239,68,68,0.07)':'rgba(107,114,128,0.06)'};border:1px solid ${state.alarmEnabled?'rgba(239,68,68,0.25)':'rgba(107,114,128,0.2)'};border-radius:10px;margin-bottom:0.75rem">
          <div style="display:flex;align-items:center;justify-content:space-between">
            <div>
              <div style="color:${th.text};font-size:0.85rem;font-weight:600">Alarm Alerts</div>
              <div style="color:${th.textMuted};font-size:0.72rem;margin-top:2px">Show modal + trigger audio on critical/warning events</div>
            </div>
            <button id="toggle-alarm-master" data-val="${state.alarmEnabled}" style="background:none;border:none;padding:0;cursor:pointer;flex-shrink:0;margin-left:12px">
              ${toggle(state.alarmEnabled)}
            </button>
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:0.5rem;opacity:${state.alarmEnabled?1:0.4};pointer-events:${state.alarmEnabled?'auto':'none'}">
          <div style="display:flex;align-items:center;justify-content:space-between;padding:0.55rem 0.9rem;background:${th.accentBg};border:1px solid ${th.border};border-radius:8px">
            <div>
              <div style="color:${th.text};font-size:0.8rem;font-weight:500">Sound Effects</div>
              <div style="color:${th.textMuted};font-size:0.7rem;margin-top:1px">Nuclear attack siren</div>
            </div>
            <button id="toggle-alarm-sound" data-val="${state.alarmSoundEnabled}" style="background:none;border:none;padding:0;cursor:pointer;flex-shrink:0;margin-left:12px">
              ${toggle(state.alarmSoundEnabled)}
            </button>
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;padding:0.55rem 0.9rem;background:${th.accentBg};border:1px solid ${th.border};border-radius:8px">
            <div>
              <div style="color:${th.text};font-size:0.8rem;font-weight:500">Voice Announcements</div>
              <div style="color:${th.textMuted};font-size:0.7rem;margin-top:1px">Text-to-speech alert readout</div>
            </div>
            <button id="toggle-alarm-voice" data-val="${state.alarmVoiceEnabled}" style="background:none;border:none;padding:0;cursor:pointer;flex-shrink:0;margin-left:12px">
              ${toggle(state.alarmVoiceEnabled)}
            </button>
          </div>
        </div>

        <div style="margin-top:0.75rem;opacity:${state.alarmEnabled?1:0.4};pointer-events:${state.alarmEnabled?'auto':'none'}">
          <div style="color:${th.textMuted};font-size:0.72rem;margin-bottom:0.5rem">Enable alarms for specific issue types:</div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:0.5rem">
            ${Object.entries(state.alarmTypesEnabled).map(([type, enabled]) => `
            <div style="display:flex;align-items:center;justify-content:space-between;padding:0.45rem 0.7rem;background:${th.accentBg};border:1px solid ${th.border};border-radius:6px">
              <div style="color:${th.text};font-size:0.75rem;font-weight:500;text-transform:capitalize">${type}</div>
              <button id="toggle-alarm-${type}" data-val="${enabled}" style="background:none;border:none;padding:0;cursor:pointer;flex-shrink:0">
                ${toggle(enabled)}
              </button>
            </div>`).join('')}
          </div>
        </div>

        <button id="test-alarm-btn" style="margin-top:0.85rem;width:100%;padding:0.55rem;background:${th.accentBg};border:1px solid ${th.borderStrong};border-radius:8px;color:${th.accent};font-size:0.78rem;font-weight:600;cursor:pointer;opacity:${state.alarmEnabled?1:0.4}" ${state.alarmEnabled?'':'disabled'}>
          Test Alarm Now
        </button>
      </div>

      ${state.user.role==='admin'?`
      <!-- Engineer directory -->
      <div style="background:${th.surface};border:1px solid ${th.border};border-radius:12px;padding:1.25rem" class="settings-full">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;flex-wrap:wrap;gap:8px">
          <h3 style="color:${th.accent};font-size:0.78rem;font-weight:700;margin:0;letter-spacing:0.08em">ENGINEER DIRECTORY & AVAILABILITY</h3>
          <div style="display:flex;gap:10px">
            ${[['available','#34d399'],['busy','#f59e0b'],['offline','#6b7280']].map(([a,c])=>`
            <div style="display:flex;align-items:center;gap:5px">
              <div style="width:7px;height:7px;border-radius:50%;background:${c}"></div>
              <span style="color:${th.textMuted};font-size:0.68rem;text-transform:capitalize">${a}</span>
            </div>`).join('')}
          </div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:0.5rem">
          ${engineers.map(e=>{
            const avail=state.engineerAvailability[e.email]||'available';
            const aCol=avail==='available'?'#34d399':avail==='busy'?'#f59e0b':'#6b7280';
            return `
          <div style="padding:0.6rem 0.9rem;background:${th.accentBg};border:1px solid ${th.border};border-radius:8px;display:flex;justify-content:space-between;align-items:center;gap:8px;min-width:0">
            <div style="display:flex;align-items:center;gap:8px;min-width:0">
              <div style="width:8px;height:8px;border-radius:50%;background:${aCol};flex-shrink:0;box-shadow:0 0 5px ${aCol}"></div>
              <div style="min-width:0">
                <div style="color:${th.text};font-size:0.8rem;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${e.name}</div>
                <div style="color:${th.textFaint};font-size:0.68rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${e.email}</div>
              </div>
            </div>
            <div style="display:flex;gap:5px;flex-shrink:0">
              <span style="background:${th.accentBg};border:1px solid ${th.border};color:${th.accent};font-size:0.68rem;padding:2px 7px;border-radius:6px;font-weight:600">Zone ${e.zone}</span>
              <span style="background:${aCol}22;border:1px solid ${aCol}44;color:${aCol};font-size:0.62rem;padding:2px 6px;border-radius:5px;font-weight:600;text-transform:capitalize">${avail}</span>
            </div>
          </div>`;}).join('')}
        </div>
      </div>`:''}
    </div>` : ''}
  </div>
  ${state.showPasswordModal ? renderPasswordModal(th) : ''}
  ${state.showThresholdModal ? renderThresholdModal(th) : ''}
  ${state.showPipelineThresholdModal ? renderPipelineThresholdModal(th) : ''}`;
}

// ─── ADMIN USER MANAGEMENT PANEL ──────────────────────────────────
function renderAdminPanel(th) {
  const tab = state.adminPanelTab || 'users';
  const users = USERS_DATA;
  const zones = 'ABCDEFGHIJKL'.split('');
  const f = state.adminAddForm;
  return `
  <div style="background:${th.surface};border:1px solid ${th.borderStrong};border-radius:12px;padding:1.25rem;margin-bottom:1rem">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;flex-wrap:wrap;gap:8px">
      <h3 style="color:${th.accent};font-size:0.85rem;font-weight:700;margin:0;letter-spacing:0.06em">👥 USER MANAGEMENT</h3>
      <div style="display:flex;gap:5px">
        ${[['users','Users'],['add','+ Add User']].map(([t2,l])=>`
        <button data-admin-tab="${t2}" style="padding:0.3rem 0.75rem;background:${tab===t2?th.accentBg:'transparent'};border:1px solid ${tab===t2?th.borderStrong:th.border};border-radius:6px;color:${tab===t2?th.accent:th.navInactive};font-size:0.73rem;font-weight:600;cursor:pointer">${l}</button>`).join('')}
      </div>
    </div>

    ${tab === 'add' ? `
    <!-- Add user form -->
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:0.85rem">
      ${[['admin-add-name','text','FULL NAME',f.name,'e.g. Kwame Mensah'],
         ['admin-add-email','email','EMAIL',f.email,'name@ecoguard.com'],
         ['admin-add-password','text','INITIAL PASSWORD',f.password,'e.g. EGB0512345']].map(([id,type,label,val,ph])=>`
      <div>
        <label style="color:${th.textMuted};font-size:0.72rem;font-weight:600;letter-spacing:0.05em;display:block;margin-bottom:4px">${label}</label>
        <input id="${id}" type="${type}" value="${val}" placeholder="${ph}" style="width:100%;box-sizing:border-box;padding:0.55rem 0.8rem;background:${th.inputBg};border:1px solid ${th.inputBorder};border-radius:7px;color:${th.text};font-size:0.82rem;outline:none"/>
      </div>`).join('')}
      <div>
        <label style="color:${th.textMuted};font-size:0.72rem;font-weight:600;letter-spacing:0.05em;display:block;margin-bottom:4px">ROLE</label>
        <div style="display:flex;gap:6px">
          ${['engineer','admin'].map(r=>`
          <button data-admin-role="${r}" style="flex:1;padding:0.5rem;background:${f.role===r?th.accentBg:'transparent'};border:1px solid ${f.role===r?th.borderStrong:th.border};border-radius:7px;color:${f.role===r?th.accent:th.textMuted};font-size:0.75rem;font-weight:600;cursor:pointer;text-transform:capitalize">${r}</button>`).join('')}
        </div>
      </div>
      ${f.role==='engineer'?`
      <div>
        <label style="color:${th.textMuted};font-size:0.72rem;font-weight:600;letter-spacing:0.05em;display:block;margin-bottom:4px">ZONE</label>
        <div style="display:flex;gap:4px;flex-wrap:wrap">
          ${zones.map(z=>`<button data-admin-zone="${z}" style="width:30px;height:30px;background:${f.zone===z?th.accentBg:'transparent'};border:1px solid ${f.zone===z?th.borderStrong:th.border};border-radius:6px;color:${f.zone===z?th.accent:th.textMuted};font-size:0.75rem;font-weight:700;cursor:pointer">${z}</button>`).join('')}
        </div>
      </div>`:''}
    </div>
    <div id="admin-add-error" style="color:#f87171;font-size:0.78rem;margin-top:0.75rem;display:none"></div>
    <button id="admin-save-user" style="margin-top:1rem;padding:0.6rem 1.5rem;background:${th.accent};border:none;border-radius:8px;color:#000;font-size:0.85rem;font-weight:700;cursor:pointer">✅ Create User</button>
    ` : `
    <!-- User list -->
    <div style="display:flex;flex-direction:column;gap:0.5rem">
      ${users.map(u=>`
      <div style="display:flex;align-items:center;gap:10px;padding:0.65rem 0.9rem;background:${th.accentBg};border:1px solid ${th.border};border-radius:9px;flex-wrap:wrap">
        <div style="width:32px;height:32px;border-radius:50%;background:${u.role==='admin'?'rgba(239,68,68,0.15)':th.accentBg};border:1.5px solid ${u.role==='admin'?'#ef4444':th.borderStrong};display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:0.8rem;font-weight:700;color:${u.role==='admin'?'#f87171':th.accent}">${u.name[0]}</div>
        <div style="flex:1;min-width:0">
          <div style="color:${th.text};font-size:0.82rem;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${u.name}</div>
          <div style="color:${th.textFaint};font-size:0.68rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${u.email}</div>
        </div>
        <div style="display:flex;gap:5px;align-items:center;flex-shrink:0;flex-wrap:wrap">
          <span style="background:${u.role==='admin'?'rgba(239,68,68,0.1)':th.accentBg};border:1px solid ${u.role==='admin'?'rgba(239,68,68,0.3)':th.border};color:${u.role==='admin'?'#f87171':th.accent};font-size:0.62rem;padding:2px 7px;border-radius:4px;font-weight:700;text-transform:uppercase">${u.role}</span>
          ${u.zone?`<span style="background:${th.surface};border:1px solid ${th.border};color:${th.textMuted};font-size:0.62rem;padding:2px 6px;border-radius:4px;font-weight:600">Zone ${u.zone}</span>`:''}
          ${u.email !== state.user.email ? `<button data-admin-delete-user="${u.email}" style="padding:2px 8px;background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.25);border-radius:5px;color:#f87171;font-size:0.65rem;cursor:pointer;font-weight:600">Remove</button>` : `<span style="color:${th.textFaint};font-size:0.65rem">(you)</span>`}
        </div>
      </div>`).join('')}
    </div>`}
  </div>`;
}

// ─── AUDIT LOG PANEL ──────────────────────────────────────────────
function renderAuditLog(th) {
  const log = state.user.role==='admin' ? state.auditLog : state.auditLog.filter(e=>e.user===state.user.name);
  const actionColor = { login:'#34d399', logout:'#6b7280', acknowledge:'#fbbf24', resolve:'#34d399', escalate:'#ef4444', notify:'#60a5fa', 'add-user':'#a78bfa', 'remove-user':'#f87171', 'change-password':'#f59e0b' };
  return `
  <div style="background:${th.surface};border:1px solid ${th.border};border-radius:12px;overflow:hidden;margin-bottom:1rem">
    <div style="padding:0.75rem 1rem;border-bottom:1px solid ${th.border};display:flex;justify-content:space-between;align-items:center">
      <span style="color:${th.text};font-size:0.85rem;font-weight:600">📋 Audit Log (${log.length} entries)</span>
      <span style="color:${th.textFaint};font-size:0.72rem">${state.user.role==='admin'?'All users':'Your activity'}</span>
    </div>
    ${log.length===0 ? `<div style="padding:2rem;text-align:center;color:${th.textMuted};font-size:0.82rem">No activity recorded yet. Login, resolve alerts, and manage users to see entries.</div>` : `
    <div style="max-height:500px;overflow-y:auto">
      ${log.map(e=>{
        const ac = actionColor[e.action] || th.accent;
        return `<div style="padding:0.6rem 1rem;border-bottom:1px solid ${th.border};display:flex;gap:10px;align-items:flex-start">
          <div style="width:28px;height:28px;border-radius:7px;background:${ac}15;border:1px solid ${ac}40;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px">
            <div style="width:7px;height:7px;border-radius:50%;background:${ac}"></div>
          </div>
          <div style="flex:1;min-width:0">
            <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-bottom:1px">
              <span style="color:${ac};font-size:0.7rem;font-weight:700;text-transform:uppercase">${e.action}</span>
              <span style="color:${th.textMuted};font-size:0.72rem;font-weight:600">${e.user}</span>
              <span style="color:${th.textFaint};font-size:0.65rem;background:${th.accentBg};padding:1px 5px;border-radius:3px">${e.role}</span>
            </div>
            <div style="color:${th.textMuted};font-size:0.75rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${e.detail}</div>
            <div style="color:${th.textFaint};font-size:0.65rem;margin-top:1px">${e.time ? new Date(e.time).toLocaleString() : ''}</div>
          </div>
        </div>`;
      }).join('')}
    </div>`}
  </div>`;
}

// ─── SENSOR THRESHOLD MODAL ───────────────────────────────────────
function renderThresholdModal(th) {
  const tr = state.sensorThresholds || {};
  const sensorTypes = [
    { key:'pressure',    label:'Pressure',     unit:'PSI',   min:0, max:300,  step:1    },
    { key:'flow',        label:'Flow Rate',     unit:'L/min', min:0, max:3000, step:10   },
    { key:'temperature', label:'Temperature',   unit:'°C',    min:0, max:100,  step:1    },
    { key:'acoustic',    label:'Acoustic',      unit:'dB',    min:0, max:120,  step:1    },
    { key:'infrared',    label:'Infrared Temp', unit:'°C',    min:0, max:100,  step:1    },
    { key:'vibration',   label:'Vibration',     unit:'mm/s',  min:0, max:20,   step:0.5  },
    { key:'corrosion',   label:'Corrosion',     unit:'mm/yr', min:0, max:1,    step:0.01 },
    { key:'gas',         label:'Gas Level',     unit:'ppm',   min:0, max:500,  step:5    },
    { key:'water',       label:'Water Ingress', unit:'L/h',   min:0, max:50,   step:1    },
  ];
  return `
  <div id="threshold-modal-overlay" style="position:fixed;inset:0;background:rgba(0,0,0,0.75);backdrop-filter:blur(4px);z-index:2000;display:flex;align-items:flex-start;justify-content:center;padding:1rem;overflow-y:auto">
    <div style="background:${th.bg};border:1px solid ${th.borderStrong};border-radius:16px;padding:1.75rem;width:100%;max-width:560px;box-shadow:0 25px 60px rgba(0,0,0,0.5);margin:auto">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem">
        <h3 style="color:${th.text};font-size:1rem;font-weight:700;margin:0">📊 Sensor Type Thresholds</h3>
        <button id="close-threshold-modal" style="background:transparent;border:none;color:${th.textMuted};cursor:pointer;font-size:1.5rem;line-height:1">x</button>
      </div>
      <p style="color:${th.textMuted};font-size:0.75rem;margin-bottom:1.25rem;line-height:1.5">Global thresholds applied to all sensors of each type. Readings that exceed these values trigger alerts.</p>
      <div style="display:flex;flex-direction:column;gap:0.85rem">
        ${sensorTypes.map(s => {
          const vals = tr[s.key] || { warn:0, critical:0 };
          return `
          <div style="background:${th.surface};border:1px solid ${th.border};border-radius:10px;padding:0.85rem 1rem">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.65rem">
              <span style="color:${th.text};font-size:0.82rem;font-weight:600">${s.label}</span>
              <span style="color:${th.textFaint};font-size:0.72rem">${s.unit}</span>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem">
              <div>
                <label style="color:#f59e0b;font-size:0.68rem;font-weight:700;letter-spacing:0.05em;display:block;margin-bottom:3px">WARNING</label>
                <input type="number" id="thr-${s.key}-warn" value="${vals.warn}" min="${s.min}" max="${s.max}" step="${s.step}"
                  style="width:100%;box-sizing:border-box;padding:0.45rem 0.7rem;background:${th.inputBg};border:1px solid rgba(245,158,11,0.35);border-radius:7px;color:#f59e0b;font-size:0.85rem;font-weight:600;outline:none"/>
              </div>
              <div>
                <label style="color:#ef4444;font-size:0.68rem;font-weight:700;letter-spacing:0.05em;display:block;margin-bottom:3px">CRITICAL</label>
                <input type="number" id="thr-${s.key}-crit" value="${vals.critical}" min="${s.min}" max="${s.max}" step="${s.step}"
                  style="width:100%;box-sizing:border-box;padding:0.45rem 0.7rem;background:${th.inputBg};border:1px solid rgba(239,68,68,0.35);border-radius:7px;color:#ef4444;font-size:0.85rem;font-weight:600;outline:none"/>
              </div>
            </div>
          </div>`;
        }).join('')}
      </div>
      <div id="threshold-error" style="color:#f87171;font-size:0.78rem;margin-top:0.75rem;display:none"></div>
      <div style="display:flex;gap:0.75rem;margin-top:1.25rem">
        <button id="close-threshold-modal-2" style="flex:1;padding:0.65rem;background:transparent;border:1px solid ${th.border};border-radius:8px;color:${th.textMuted};font-size:0.85rem;cursor:pointer">Cancel</button>
        <button id="save-thresholds" style="flex:2;padding:0.65rem;background:${th.accent};border:none;border-radius:8px;color:#000;font-size:0.85rem;font-weight:700;cursor:pointer">Save Thresholds</button>
      </div>
    </div>
  </div>`;
}

// ─── PIPELINE THRESHOLD MODAL ─────────────────────────────────────
function renderPipelineThresholdModal(th) {
  const target = state.pipelineThresholdTarget;
  if (!target) return '';
  const key = `${target.companyId}|${target.pipelineId}`;
  const existing = state.pipelineThresholds[key] || {};
  const fields = [
    { id:'pt-maxPressure', label:'Max Pressure',    unit:'PSI',   key:'maxPressure', def:120,  min:10, max:500,  step:1   },
    { id:'pt-minPressure', label:'Min Pressure',    unit:'PSI',   key:'minPressure', def:40,   min:0,  max:200,  step:1   },
    { id:'pt-maxFlow',     label:'Max Flow Rate',   unit:'L/min', key:'maxFlow',     def:1200, min:50, max:5000, step:10  },
    { id:'pt-minFlow',     label:'Min Flow Rate',   unit:'L/min', key:'minFlow',     def:300,  min:0,  max:2000, step:10  },
    { id:'pt-maxTemp',     label:'Max Temperature', unit:'°C',    key:'maxTemp',     def:40,   min:5,  max:150,  step:1   },
    { id:'pt-maxVibration',label:'Max Vibration',   unit:'mm/s',  key:'maxVibration',def:4,    min:0,  max:20,   step:0.5 },
    { id:'pt-maxCorrosion',label:'Max Corrosion',   unit:'mm/yr', key:'maxCorrosion',def:0.1,  min:0,  max:1,    step:0.01},
  ];
  return `
  <div id="pipeline-threshold-overlay" style="position:fixed;inset:0;background:rgba(0,0,0,0.75);backdrop-filter:blur(4px);z-index:2000;display:flex;align-items:flex-start;justify-content:center;padding:1rem;overflow-y:auto">
    <div style="background:${th.bg};border:1px solid ${th.borderStrong};border-radius:16px;padding:1.75rem;width:100%;max-width:520px;box-shadow:0 25px 60px rgba(0,0,0,0.5);margin:auto">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.25rem">
        <h3 style="color:${th.text};font-size:1rem;font-weight:700;margin:0">🛢️ Pipeline Thresholds</h3>
        <button id="close-pipeline-threshold" style="background:transparent;border:none;color:${th.textMuted};cursor:pointer;font-size:1.5rem;line-height:1">x</button>
      </div>
      <p style="color:${th.textMuted};font-size:0.75rem;margin-bottom:1.25rem;line-height:1.5">
        Setting limits for: <strong style="color:${th.accent}">${target.pipelineName}</strong>
      </p>
      <div style="display:flex;flex-direction:column;gap:0.75rem">
        ${fields.map(f => {
          const val = existing[f.key] !== undefined ? existing[f.key] : f.def;
          return `
          <div style="background:${th.surface};border:1px solid ${th.border};border-radius:10px;padding:0.8rem 1rem;display:flex;align-items:center;gap:1rem">
            <div style="flex:1">
              <label for="${f.id}" style="color:${th.text};font-size:0.8rem;font-weight:600;display:block;margin-bottom:2px">${f.label}</label>
              <span style="color:${th.textFaint};font-size:0.7rem">${f.unit}</span>
            </div>
            <input type="number" id="${f.id}" value="${val}" min="${f.min}" max="${f.max}" step="${f.step}"
              style="width:110px;padding:0.45rem 0.7rem;background:${th.inputBg};border:1px solid ${th.borderStrong};border-radius:8px;color:${th.accent};font-size:0.9rem;font-weight:700;outline:none;text-align:right"/>
          </div>`;
        }).join('')}
      </div>
      <div id="pipeline-threshold-error" style="color:#f87171;font-size:0.78rem;margin-top:0.75rem;display:none"></div>
      <div style="display:flex;gap:0.75rem;margin-top:1.25rem">
        <button id="close-pipeline-threshold-2" style="flex:1;padding:0.65rem;background:transparent;border:1px solid ${th.border};border-radius:8px;color:${th.textMuted};font-size:0.85rem;cursor:pointer">Cancel</button>
        <button id="save-pipeline-thresholds" style="flex:2;padding:0.65rem;background:${th.accent};border:none;border-radius:8px;color:#000;font-size:0.85rem;font-weight:700;cursor:pointer">Save</button>
      </div>
    </div>
  </div>`;
}

// ─── PASSWORD CHANGE MODAL ────────────────────────────────────────
function renderPasswordModal(th) {
  const f = state.passwordForm;
  return `
  <div id="password-modal-overlay" style="position:fixed;inset:0;background:rgba(0,0,0,0.75);backdrop-filter:blur(4px);z-index:2000;display:flex;align-items:center;justify-content:center;padding:1rem">
    <div style="background:${th.bg};border:1px solid ${th.borderStrong};border-radius:16px;padding:1.75rem;width:100%;max-width:400px;box-shadow:0 25px 60px rgba(0,0,0,0.5)">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem">
        <h3 style="color:${th.text};font-size:1rem;font-weight:700;margin:0">🔒 Change Password</h3>
        <button id="close-password-modal" style="background:transparent;border:none;color:${th.textMuted};cursor:pointer;font-size:1.5rem;line-height:1">×</button>
      </div>
      <div style="display:flex;flex-direction:column;gap:1rem">
        ${[['pw-current','Current Password'],['pw-new','New Password'],['pw-confirm','Confirm New Password']].map(([id,label])=>`
        <div>
          <label style="color:${th.textMuted};font-size:0.75rem;font-weight:600;letter-spacing:0.05em;display:block;margin-bottom:5px">${label.toUpperCase()}</label>
          <input id="${id}" type="password" style="width:100%;box-sizing:border-box;padding:0.6rem 0.9rem;background:${th.inputBg};border:1px solid ${th.inputBorder};border-radius:8px;color:${th.text};font-size:0.85rem;outline:none"/>
        </div>`).join('')}
        ${state.passwordError?`<div style="color:#f87171;font-size:0.78rem;background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.25);border-radius:7px;padding:0.5rem 0.75rem">${state.passwordError}</div>`:''}
        <div style="display:flex;gap:0.75rem">
          <button id="close-password-modal-2" style="flex:1;padding:0.65rem;background:transparent;border:1px solid ${th.border};border-radius:8px;color:${th.textMuted};font-size:0.85rem;cursor:pointer">Cancel</button>
          <button id="save-password" style="flex:1;padding:0.65rem;background:${th.accent};border:none;border-radius:8px;color:#000;font-size:0.85rem;font-weight:700;cursor:pointer">Save</button>
        </div>
      </div>
    </div>
  </div>`;
}

