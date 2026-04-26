// ECO GUARD TECHNOLOGIES — events.js
// Event binding, sensor interval, PDF, PWA, search helpers, boot

// ─── EVENT BINDING ────────────────────────────────────────────────
function bindLogin() {
  const emailEl = document.getElementById('login-email');
  const pwEl    = document.getElementById('login-pw');
  const errEl   = document.getElementById('login-error');
  const btn     = document.getElementById('login-btn');
  const toggle  = document.getElementById('pw-toggle');

  if (toggle) toggle.addEventListener('click', () => {
    const isText = pwEl.type === 'text';
    pwEl.type = isText ? 'password' : 'text';
  });

  const doLogin = () => {
    const email = emailEl.value.trim();
    const pw    = pwEl.value;
    if (!email || !pw) { errEl.textContent='Please enter email and password.'; errEl.style.display='block'; return; }
    btn.textContent = 'Authenticating…';
    btn.disabled = true;
    setTimeout(() => {
      const user = USERS_DATA.find(u=>u.email.toLowerCase()===email.toLowerCase()&&u.password===pw);
      if (user) {
        state.user = user;
        saveSession(user);
        addAuditEntry('login', `Logged in from ${navigator.userAgent.slice(0,50)}`);
        startSensorInterval();
        render();
        // trigger initial alarm check after 3-minute grace period
        setTimeout(checkAndTriggerAlerts, 180000);
      } else {
        errEl.textContent='Invalid email or password.';
        errEl.style.display='block';
        btn.textContent='Sign In';
        btn.disabled=false;
      }
    }, 600);
  };

  btn.addEventListener('click', doLogin);
  pwEl.addEventListener('keydown', e => { if(e.key==='Enter') doLogin(); });
}

function bindAll() {
  try {
    // Nav buttons
    document.querySelectorAll('[data-nav]').forEach(el => {
      el.addEventListener('click', () => {
        const nav = el.dataset.nav;
        if (nav === 'dashboard') state.page = 'dashboard';
        else state.page = nav;
        state.showAlarmDropdown = false;
        state.showThemePicker   = false;
        render();
      });
    });

    // Company cards
    document.querySelectorAll('[data-company]').forEach(el => {
      // Only navigate if it's a card click (not a resolve/dispatch button inside)
      if (el.tagName === 'DIV' && el.classList.contains('company-card')) {
        el.addEventListener('click', () => {
          state.page = `company/${el.dataset.company}`;
          state.companyPage.selectedPipeline = 'pipeline-1';
          state.companyPage.tab = 'sensors';
          state.sensorData = { pressure:[], flow:[], acoustic:[], infrared:[], temperature:[], vibration:[], corrosion:[], gas:[], water:[] };
          render();
        });
      }
      // Map nodes — select node to show engineer panel (don't navigate away)
      if (el.tagName === 'G' || el.tagName === 'g' || el.classList.contains('map-node')) {
        el.addEventListener('click', () => {
          const cid = el.dataset.company;
          state.mapSelectedNode = state.mapSelectedNode === cid ? null : cid;
          render();
        });
      }
    });

    // Map panel company tab buttons
    document.querySelectorAll('[data-map-node]').forEach(el => {
      el.addEventListener('click', e => {
        e.stopPropagation();
        const cid = el.dataset.mapNode;
        state.mapSelectedNode = state.mapSelectedNode === cid ? null : cid;
        render();
      });
    });

    // "Inspect Pipeline Detail" button on map panel
    document.querySelectorAll('[data-company-nav]').forEach(el => {
      el.addEventListener('click', () => {
        const cid = el.dataset.companyNav;
        state.page = `company/${cid}`;
        state.companyPage.selectedPipeline = 'pipeline-1';
        state.companyPage.tab = 'sensors';
        state.sensorData = { pressure:[], flow:[], acoustic:[], infrared:[], temperature:[], vibration:[], corrosion:[], gas:[], water:[] };
        render();
      });
    });

    // SVG pipeline clicks
    document.querySelectorAll('[data-pipeline]').forEach(el => {
      el.addEventListener('click', e => {
        e.stopPropagation();
        const cid = el.dataset.company;
        const pid = el.dataset.pipeline;
        state.companyPage.selectedPipeline = pid;
        state.sensorData = { pressure:[], flow:[], acoustic:[], infrared:[], temperature:[], vibration:[], corrosion:[], gas:[], water:[] };
        // Partial re-render of map + panel
        const container = document.getElementById('pipeline-map-container');
        if (container) container.innerHTML = pipelineSVGHTML(cid);
        render(); // full render to update panel
      });
    });

    // Pipeline list items
    document.querySelectorAll('[data-select-pipeline]').forEach(el => {
      el.addEventListener('click', () => {
        state.companyPage.selectedPipeline = el.dataset.selectPipeline;
        state.sensorData = { pressure:[], flow:[], acoustic:[], infrared:[], temperature:[], vibration:[], corrosion:[], gas:[], water:[] };
        render();
      });
    });

    // Tabs
    document.querySelectorAll('[data-tab]').forEach(el => {
      el.addEventListener('click', () => {
        state.companyPage.tab = el.dataset.tab;
        render();
      });
    });

    // Theme
    document.querySelectorAll('[data-theme]').forEach(el => {
      el.addEventListener('click', () => {
        state.theme = el.dataset.theme;
        state.showThemePicker = false;
        render();
      });
    });

    // Alert filter
    document.querySelectorAll('[data-filter]').forEach(el => {
      el.addEventListener('click', () => {
        state.alertFilter = el.dataset.filter;
        render();
      });
    });

    // Resolve alert
    document.querySelectorAll('[data-resolve],[data-resolve-global]').forEach(el => {
      el.addEventListener('click', () => {
        const aid = el.dataset.resolve || el.dataset.resolveGlobal;
        const cid = el.dataset.company;
        const alert = (state.alerts[cid]||[]).find(a=>a.id===aid);
        state.alerts[cid] = state.alerts[cid].map(a => a.id===aid ? {...a,resolved:true} : a);
        addAuditEntry('resolve', `Resolved alert: "${alert?.title||aid}" on ${cid}`);
        pushActivity('resolve','OK',`Alert resolved: ${alert?.title||aid}`, cid);
        render();
      });
    });

    // Dispatch
    document.querySelectorAll('[data-dispatch]').forEach(el => {
      el.addEventListener('click', () => {
        const aid = el.dataset.dispatch;
        const cid = el.dataset.company;
        const companyZones = Object.entries(ZONE_PIPELINE_MAP).filter(([z,c])=>c===cid).map(([z])=>z);
        const engByZone = getUsersByZone();
        const engineers = companyZones.map(z=>engByZone[z]).filter(Boolean);
        const assignedNames = engineers.length > 0 ? engineers.map(e=>e.name).join(', ') : 'Field Team';
        state.alerts[cid] = state.alerts[cid].map(a => a.id===aid ? {...a,assignedTo:assignedNames} : a);
        render();
      });
    });

    // Sensor toggles — turning OFF is delayed by 3 minutes
    document.querySelectorAll('[data-sensor-key]').forEach(el => {
      el.addEventListener('click', e => {
        e.stopPropagation();
        const key = el.dataset.sensorKey;
        const cur = el.dataset.sensorVal === 'true';
        if (!state._sensorOffTimers) state._sensorOffTimers = {};
        if (cur) {
          // Turning OFF: schedule after 3-minute delay, show pending state immediately
          if (state._sensorOffTimers[key]) return; // already pending
          state._sensorOffTimers[key] = setTimeout(() => {
            state.sensorStates[key] = false;
            delete state._sensorOffTimers[key];
            render();
          }, 180000); // 3 minutes
          state.sensorStates[key] = 'pending-off';
        } else {
          // Turning ON: instant, cancel any pending off
          if (state._sensorOffTimers[key]) {
            clearTimeout(state._sensorOffTimers[key]);
            delete state._sensorOffTimers[key];
          }
          state.sensorStates[key] = true;
        }
        render();
      });
    });

    // Toggle all sensors (pipeline panel)
    const toggleAllBtn = document.getElementById('toggle-all-sensors');
    if (toggleAllBtn) {
      toggleAllBtn.addEventListener('click', () => {
        const cid = toggleAllBtn.dataset.company;
        const pid = toggleAllBtn.dataset.pipeline;
        const allOn = toggleAllBtn.dataset.allon === 'true';
        const pipeline = (PIPELINE_CONFIGS[cid]||[]).find(p=>p.id===pid);
        if (pipeline) {
          pipeline.sensors.forEach(s => {
            state.sensorStates[`${cid}-${pid}-${s.id}`] = !allOn;
          });
        }
        render();
      });
    }

    // Toggle all global
    const toggleAllGlobal = document.getElementById('toggle-all-global');
    if (toggleAllGlobal) {
      toggleAllGlobal.addEventListener('click', () => {
        const allOn = toggleAllGlobal.dataset.allon === 'true';
        getCompanies().forEach(c => {
          (PIPELINE_CONFIGS[c.id]||[]).forEach(pl => {
            pl.sensors.forEach(s => {
              state.sensorStates[`${c.id}-${pl.id}-${s.id}`] = !allOn;
            });
          });
        });
        render();
      });
    }

    // Header alarm btn
    const alarmBtn = document.getElementById('alarm-btn');
    if (alarmBtn) alarmBtn.addEventListener('click', e => {
      e.stopPropagation();
      state.showAlarmDropdown = !state.showAlarmDropdown;
      state.showThemePicker = false;
      render();
    });

    const closeAlarm = document.getElementById('close-alarm-dropdown');
    if (closeAlarm) closeAlarm.addEventListener('click', () => {
      state.showAlarmDropdown = false;
      render();
    });

    // Theme btn
    const themeBtn = document.getElementById('theme-btn');
    if (themeBtn) themeBtn.addEventListener('click', e => {
      e.stopPropagation();
      state.showThemePicker = !state.showThemePicker;
      state.showAlarmDropdown = false;
      render();
    });

    // Add Company button
    const addCompanyBtn = document.getElementById('add-company-btn');
    if (addCompanyBtn) addCompanyBtn.addEventListener('click', () => {
      state.showAddCompany = true;
      state.addCompanyForm = { name:'', region:'', pipelines:'', status:'operational' };
      render();
    });

    // Add Company modal controls
    const closeAdd1 = document.getElementById('close-add-company');
    const closeAdd2 = document.getElementById('close-add-company-2');
    [closeAdd1, closeAdd2].forEach(btn => {
      if (btn) btn.addEventListener('click', () => {
        state.showAddCompany = false;
        render();
      });
    });

    // Status selector in modal
    document.querySelectorAll('[data-ac-status]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.addCompanyForm.status = btn.dataset.acStatus;
        render();
      });
    });

    // Save new company
    const saveBtn = document.getElementById('save-add-company');
    if (saveBtn) saveBtn.addEventListener('click', () => {
      const name     = document.getElementById('ac-name')?.value.trim();
      const region   = document.getElementById('ac-region')?.value.trim();
      const pipes    = parseInt(document.getElementById('ac-pipelines')?.value, 10);
      const errEl    = document.getElementById('ac-error');
      if (!name || !region || !pipes || pipes < 1) {
        if (errEl) {
          errEl.textContent = 'Please fill in all required fields.';
          errEl.style.display = 'block';
        }
        return;
      }
      const id = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 20);
      const newCompany = {
        id, name, status: state.addCompanyForm.status,
        pipelines: pipes, alerts: 0, region,
        pressure: 'normal', flow: 'normal', lastUpdate: 'just now'
      };
      COMPANIES_DATA.push(newCompany);
      state.alerts[id] = [];
      PIPELINE_CONFIGS[id] = [
        { id:'pipeline-1', name:`Main Pipeline (${name})`, status: state.addCompanyForm.status,
          path:'M 80 200 L 380 180 L 700 200',
          sensors:[
            {id:'s1',type:'pressure',x:180,y:193,status:'normal'},
            {id:'s2',type:'flow',x:390,y:183,status:'normal'},
            {id:'s3',type:'acoustic',x:600,y:196,status:'normal'},
          ]
        }
      ];
      state.showAddCompany = false;
      render();
    });

    // PDF Downloads
    document.querySelectorAll('[data-pdf-report]').forEach(btn => {
      btn.addEventListener('click', () => {
        const key   = btn.dataset.pdfReport;
        const title = btn.dataset.pdfTitle;
        const date  = btn.dataset.pdfDate;
        generatePDF(key, title, date);
      });
    });

    // Alarm master toggle
    const toggleAlarmMaster = document.getElementById('toggle-alarm-master');
    if (toggleAlarmMaster) toggleAlarmMaster.addEventListener('click', () => {
      state.alarmEnabled = toggleAlarmMaster.dataset.val !== 'true';
      render();
    });

    // Alarm sound toggle
    const toggleAlarmSound = document.getElementById('toggle-alarm-sound');
    if (toggleAlarmSound) toggleAlarmSound.addEventListener('click', () => {
      state.alarmSoundEnabled = toggleAlarmSound.dataset.val !== 'true';
      render();
    });

    // Alarm voice toggle
    const toggleAlarmVoice = document.getElementById('toggle-alarm-voice');
    if (toggleAlarmVoice) toggleAlarmVoice.addEventListener('click', () => {
      state.alarmVoiceEnabled = toggleAlarmVoice.dataset.val !== 'true';
      render();
    });

    // Alarm type toggles
    Object.keys(state.alarmTypesEnabled).forEach(type => {
      const toggle = document.getElementById(`toggle-alarm-${type}`);
      if (toggle) toggle.addEventListener('click', () => {
        state.alarmTypesEnabled[type] = toggle.dataset.val !== 'true';
        render();
      });
    });

    // Test alarm
    const testAlarmBtn = document.getElementById('test-alarm-btn');
    if (testAlarmBtn) testAlarmBtn.addEventListener('click', () => {
      const critAlerts = Object.values(state.alerts).flat().filter(a=>!a.resolved&&a.severity==='critical'&&state.alarmTypesEnabled[a.type]);
      const warnAlerts = Object.values(state.alerts).flat().filter(a=>!a.resolved&&a.severity==='warning'&&state.alarmTypesEnabled[a.type]);
      if (critAlerts.length) {
        if (state.alarmSoundEnabled) playAlarmSound('critical');
        if (state.alarmVoiceEnabled) speakAlert(`Critical alarm. ${critAlerts[0].title}. Immediate action required.`);
        showAlarmModal('critical', critAlerts);
      } else if (warnAlerts.length) {
        if (state.alarmSoundEnabled) playAlarmSound('warning');
        if (state.alarmVoiceEnabled) speakAlert(`Warning alert. ${warnAlerts[0].location}. Please investigate.`);
        showAlarmModal('warning', warnAlerts);
      } else {
        if (state.alarmSoundEnabled) playAlarmSound('warning');
        if (state.alarmVoiceEnabled) speakAlert('Test alert. All systems are being monitored. No active emergencies.');
      }
    });

    // Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', () => {
      addAuditEntry('logout', 'User logged out');
      state.user = null;
      clearSession();
      state.page = 'dashboard';
      clearSensorInterval();
      if (state.alarmInterval) { clearInterval(state.alarmInterval); state.alarmInterval = null; }
      window.speechSynthesis && window.speechSynthesis.cancel();
      const modal = document.getElementById('alarm-modal-overlay');
      if (modal) modal.remove();
      render();
    });

    // ── v6: Search button ──────────────────────────────────────────
    const searchBtn = document.getElementById('search-btn');
    if (searchBtn) searchBtn.addEventListener('click', e => {
      e.stopPropagation();
      state.showSearch = true;
      state.showAlarmDropdown = false;
      state.showThemePicker = false;
      render();
      setTimeout(()=>document.getElementById('search-input')?.focus(), 40);
    });

    // Search overlay live input
    bindSearchResultClicks();
    if (state.showSearch) bindSearchInput();

    // Close search
    const closeSearchBtn = document.getElementById('close-search-btn');
    if (closeSearchBtn) closeSearchBtn.addEventListener('click', ()=>{ state.showSearch=false; state.searchQuery=''; render(); });
    const searchOverlay = document.getElementById('search-overlay');
    if (searchOverlay) searchOverlay.addEventListener('click', e=>{ if(e.target===searchOverlay){state.showSearch=false;state.searchQuery='';render();} });

    // ── v6: Shift handover ────────────────────────────────────────
    document.querySelectorAll('#handover-btn').forEach(b=>b.addEventListener('click', generateShiftHandover));

    // ── v6: Resolve all ───────────────────────────────────────────
    const resolveAllBtn = document.getElementById('resolve-all-btn');
    if (resolveAllBtn) resolveAllBtn.addEventListener('click', ()=>{
      let count = 0;
      Object.values(state.alerts).flat().forEach(a=>{ if(!a.resolved&&a.severity!=='info') { a.resolved=true; count++; } });
      addAuditEntry('resolve', `Bulk-resolved ${count} active alerts`);
      pushActivity('resolve','OK','All active alerts bulk-resolved','all');
      render();
    });

    // ── v6: Export CSV ────────────────────────────────────────────
    const csvBtn = document.getElementById('export-csv-btn');
    if (csvBtn) csvBtn.addEventListener('click', exportSensorCSV);

    // ── v6: Alert notes ───────────────────────────────────────────
    document.querySelectorAll('[data-add-note]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const alertId = btn.dataset.addNote;
        const input = document.getElementById(`note-input-${alertId}`);
        const text = input?.value.trim();
        if (!text) return;
        if (!state.alertNotes[alertId]) state.alertNotes[alertId]=[];
        state.alertNotes[alertId].push({author:state.user.name, text, time:new Date()});
        pushActivity('sensor','NOTE',`Note added by ${state.user.name}`,'all');
        render();
      });
    });

    // ── v6: Engineer availability ─────────────────────────────────
    document.querySelectorAll('[data-set-avail]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        state.engineerAvailability[state.user.email] = btn.dataset.setAvail;
        render();
      });
    });

    // ── v7: Alert acknowledge ─────────────────────────────────────
    document.querySelectorAll('[data-ack-alert]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        acknowledgeAlert(btn.dataset.ackAlert, btn.dataset.company);
      });
    });

    // ── v7: Alerts page sub-tabs ──────────────────────────────────
    document.querySelectorAll('[data-alerts-tab]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        state.alertsSubTab = btn.dataset.alertsTab;
        render();
      });
    });

    // ── v7: Notification toggles ──────────────────────────────────
    document.querySelectorAll('[data-notif-toggle]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const key = btn.dataset.notifToggle;
        if (key in state) state[key] = btn.dataset.val !== 'true';
        // Request notification permission if enabling push
        if (key === 'pushNotifEnabled' && state.pushNotifEnabled && 'Notification' in window && Notification.permission === 'default') {
          Notification.requestPermission();
        }
        render();
      });
    });

    // ── v7: Escalation time adjustment ────────────────────────────
    document.querySelectorAll('[data-esc-adj]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const adj = parseInt(btn.dataset.escAdj, 10);
        state.escalationMinutes = Math.max(1, Math.min(60, (state.escalationMinutes||10) + adj));
        render();
      });
    });

    // ── v7: Settings tab ──────────────────────────────────────────
    document.querySelectorAll('[data-settings-tab]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        state.settingsTab = btn.dataset.settingsTab;
        render();
      });
    });

    // ── v7: Admin panel tab ───────────────────────────────────────
    document.querySelectorAll('[data-admin-tab]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        state.adminPanelTab = btn.dataset.adminTab;
        render();
      });
    });

    // ── v7: Admin role selector ───────────────────────────────────
    document.querySelectorAll('[data-admin-role]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        state.adminAddForm.role = btn.dataset.adminRole;
        render();
      });
    });

    // ── v7: Admin zone selector ───────────────────────────────────
    document.querySelectorAll('[data-admin-zone]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        state.adminAddForm.zone = btn.dataset.adminZone;
        render();
      });
    });

    // ── v7: Admin save user ───────────────────────────────────────
    const adminSaveUser = document.getElementById('admin-save-user');
    if (adminSaveUser) adminSaveUser.addEventListener('click', ()=>{
      const name     = document.getElementById('admin-add-name')?.value.trim();
      const email    = document.getElementById('admin-add-email')?.value.trim();
      const password = document.getElementById('admin-add-password')?.value.trim();
      const errEl    = document.getElementById('admin-add-error');
      if (!name || !email || !password) {
        if (errEl) { errEl.textContent='Please fill in name, email, and password.'; errEl.style.display='block'; }
        return;
      }
      if (USERS_DATA.find(u=>u.email.toLowerCase()===email.toLowerCase())) {
        if (errEl) { errEl.textContent='A user with that email already exists.'; errEl.style.display='block'; }
        return;
      }
      const newUser = { email, password, name, role: state.adminAddForm.role, zone: state.adminAddForm.role==='engineer'?state.adminAddForm.zone:'ALL' };
      USERS_DATA.push(newUser);
      state.engineerAvailability[email] = 'available';
      addAuditEntry('add-user', `Added user: ${name} (${email}) role=${newUser.role} zone=${newUser.zone}`);
      pushActivity('sensor','NEW',`New user added: ${name}`, 'all');
      state.adminAddForm = { name:'', email:'', password:'', role:'engineer', zone:'A' };
      state.adminPanelTab = 'users';
      render();
    });

    // ── v7: Admin delete user ─────────────────────────────────────
    document.querySelectorAll('[data-admin-delete-user]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const email = btn.dataset.adminDeleteUser;
        const user = USERS_DATA.find(u=>u.email===email);
        if (!user) return;
        if (!confirm(`Remove ${user.name} from the system?`)) return;
        USERS_DATA = USERS_DATA.filter(u=>u.email!==email);
        addAuditEntry('remove-user', `Removed user: ${user.name} (${email})`);
        pushActivity('sensor','DEL',`User removed: ${user.name}`, 'all');
        render();
      });
    });

    // ── v7: Open password modal ───────────────────────────────────
    const openPwBtn = document.getElementById('open-password-modal');
    if (openPwBtn) openPwBtn.addEventListener('click', ()=>{
      state.showPasswordModal = true;
      state.passwordForm = { current:'', newPw:'', confirm:'' };
      state.passwordError = '';
      render();
    });

    // ── v7: Close password modal ──────────────────────────────────
    [document.getElementById('close-password-modal'), document.getElementById('close-password-modal-2')].forEach(btn=>{
      if (btn) btn.addEventListener('click', ()=>{
        state.showPasswordModal = false;
        state.passwordError = '';
        render();
      });
    });

    // ── v7: Save password ─────────────────────────────────────────
    const savePwBtn = document.getElementById('save-password');
    if (savePwBtn) savePwBtn.addEventListener('click', ()=>{
      const current = document.getElementById('pw-current')?.value;
      const newPw   = document.getElementById('pw-new')?.value;
      const confirm = document.getElementById('pw-confirm')?.value;
      if (current !== state.user.password) { state.passwordError='Current password is incorrect.'; render(); return; }
      if (!newPw || newPw.length < 6) { state.passwordError='New password must be at least 6 characters.'; render(); return; }
      if (newPw !== confirm) { state.passwordError='New passwords do not match.'; render(); return; }
      // Update password in USERS_DATA
      const u = USERS_DATA.find(u=>u.email===state.user.email);
      if (u) u.password = newPw;
      state.user.password = newPw;
      addAuditEntry('change-password', 'Password changed successfully');
      state.showPasswordModal = false;
      state.passwordError = '';
      render();
      // Show brief success toast
      setTimeout(()=>showNetToast('Password updated ✓','#34d399'), 100);
    });

    // Threshold modal
    const openThrBtn = document.getElementById('open-threshold-modal');
    if (openThrBtn) openThrBtn.addEventListener('click', () => {
      state.showThresholdModal = true;
      render();
    });
    [document.getElementById('close-threshold-modal'), document.getElementById('close-threshold-modal-2')].forEach(btn => {
      if (btn) btn.addEventListener('click', () => {
        state.showThresholdModal = false;
        render();
      });
    });
    const saveThrBtn = document.getElementById('save-thresholds');
    if (saveThrBtn) saveThrBtn.addEventListener('click', () => {
      if (!state.sensorThresholds) state.sensorThresholds = {};
      const errEl = document.getElementById('threshold-error');
      const keys = ['pressure','flow','temperature','acoustic','infrared','vibration','corrosion','gas','water'];
      let hasError = false;
      keys.forEach(key => {
        const warnEl = document.getElementById(`thr-${key}-warn`);
        const critEl = document.getElementById(`thr-${key}-crit`);
        if (!warnEl || !critEl) return;
        const warn = parseFloat(warnEl.value);
        const crit = parseFloat(critEl.value);
        if (isNaN(warn) || isNaN(crit) || warn <= 0 || crit <= 0) { hasError = true; return; }
        state.sensorThresholds[key] = { warn, critical: crit };
      });
      if (hasError) {
        if (errEl) { errEl.textContent = 'All thresholds must be positive numbers.'; errEl.style.display = 'block'; }
        return;
      }
      addAuditEntry('threshold-update', 'Sensor type thresholds updated');
      state.showThresholdModal = false;
      render();
      setTimeout(() => showNetToast('Sensor thresholds saved', '#34d399'), 100);
    });

    // Pipeline threshold buttons (per-pipeline, for engineers)
    document.querySelectorAll('[data-set-pipeline-threshold]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        state.pipelineThresholdTarget = {
          pipelineId:   btn.dataset.setPipelineThreshold,
          companyId:    btn.dataset.company,
          pipelineName: btn.dataset.pipelineName,
        };
        state.showPipelineThresholdModal = true;
        render();
      });
    });
    [document.getElementById('close-pipeline-threshold'), document.getElementById('close-pipeline-threshold-2')].forEach(btn => {
      if (btn) btn.addEventListener('click', () => {
        state.showPipelineThresholdModal = false;
        state.pipelineThresholdTarget = null;
        render();
      });
    });
    const savePlThrBtn = document.getElementById('save-pipeline-thresholds');
    if (savePlThrBtn) savePlThrBtn.addEventListener('click', () => {
      const errEl = document.getElementById('pipeline-threshold-error');
      const target = state.pipelineThresholdTarget;
      if (!target) return;
      const fieldKeys = [
        { id:'pt-maxPressure',  key:'maxPressure'  },
        { id:'pt-minPressure',  key:'minPressure'  },
        { id:'pt-maxFlow',      key:'maxFlow'      },
        { id:'pt-minFlow',      key:'minFlow'      },
        { id:'pt-maxTemp',      key:'maxTemp'      },
        { id:'pt-maxVibration', key:'maxVibration' },
        { id:'pt-maxCorrosion', key:'maxCorrosion' },
      ];
      const values = {};
      let hasError = false;
      fieldKeys.forEach(f => {
        const el = document.getElementById(f.id);
        if (!el) return;
        const v = parseFloat(el.value);
        if (isNaN(v) || v < 0) { hasError = true; return; }
        values[f.key] = v;
      });
      // Basic sanity: min must be less than max
      if (!hasError && values.minPressure !== undefined && values.maxPressure !== undefined && values.minPressure >= values.maxPressure) {
        hasError = true;
        if (errEl) { errEl.textContent = 'Min Pressure must be less than Max Pressure.'; errEl.style.display = 'block'; }
      }
      if (!hasError && values.minFlow !== undefined && values.maxFlow !== undefined && values.minFlow >= values.maxFlow) {
        hasError = true;
        if (errEl) { errEl.textContent = 'Min Flow must be less than Max Flow.'; errEl.style.display = 'block'; }
      }
      if (hasError) {
        if (errEl && errEl.style.display === 'none') { errEl.textContent = 'All values must be valid positive numbers.'; errEl.style.display = 'block'; }
        return;
      }
      if (!state.pipelineThresholds) state.pipelineThresholds = {};
      const ptKey = `${target.companyId}|${target.pipelineId}`;
      state.pipelineThresholds[ptKey] = values;
      addAuditEntry('pipeline-threshold-update', `Pipeline thresholds set for ${target.pipelineName}`);
      state.showPipelineThresholdModal = false;
      state.pipelineThresholdTarget = null;
      render();
      setTimeout(() => showNetToast('Pipeline thresholds saved', '#34d399'), 100);
    });

    // Close dropdowns on outside click — handled by persistent listener set up at boot
  } catch (error) {
    console.error('bindAll failed:', error);
  }
}

function outsideClickHandler(e) {
  if (!state.showAlarmDropdown && !state.showThemePicker) return;
  const alarmDrop = document.getElementById('alarm-dropdown');
  const themeDrop = document.getElementById('theme-dropdown');
  const alarmBtn  = document.getElementById('alarm-btn');
  const themeBtn  = document.getElementById('theme-btn');
  const clickedInside =
    (alarmDrop && alarmDrop.contains(e.target)) ||
    (themeDrop && themeDrop.contains(e.target)) ||
    (alarmBtn  && alarmBtn.contains(e.target))  ||
    (themeBtn  && themeBtn.contains(e.target));
  if (!clickedInside) {
    state.showAlarmDropdown = false;
    state.showThemePicker   = false;
    render();
  }
}

// ─── SENSOR INTERVAL ──────────────────────────────────────────────
function startSensorInterval() {
  clearSensorInterval();
  state.sensorInterval = setInterval(() => {
    if (!state.user) return;
    const companyId = state.page.startsWith('company/') ? state.page.split('/')[1] : null;
    if (!companyId) return;
    const company = getCompanies().find(c=>c.id===companyId);
    if (!company) return;
    const ps = company.status==='critical'?'critical':company.status==='warning'?'warning':'normal';

    // Update data arrays
    state.sensorData.pressure = [...state.sensorData.pressure.slice(-19), genVal(ps,100)];
    state.sensorData.flow     = [...state.sensorData.flow.slice(-19),     genVal(ps,1000)];
    state.sensorData.acoustic = [...state.sensorData.acoustic.slice(-19), genVal(ps,50)];
    state.sensorData.infrared = [...state.sensorData.infrared.slice(-19), 20+genVal(ps,10)];
    state.sensorData.temperature = [...state.sensorData.temperature.slice(-19), 20+genVal(ps,15)];
    state.sensorData.vibration = [...state.sensorData.vibration.slice(-19), genVal(ps,5)];
    state.sensorData.corrosion = [...state.sensorData.corrosion.slice(-19), genVal(ps,0.1)];
    state.sensorData.gas = [...state.sensorData.gas.slice(-19), genVal(ps,100)];
    state.sensorData.water = [...state.sensorData.water.slice(-19), genVal(ps,10)];

    // Patch DOM surgically — no full re-render
    patchSensorDOM(companyId, ps);
  }, 1000);

  // Periodic alarm check every 15s
  if (!state.alarmInterval) {
    state.alarmInterval = setInterval(() => {
      if (state.user) checkAndTriggerAlerts();
    }, 15000);
  }
}

function clearSensorInterval() {
  if (state.sensorInterval) { clearInterval(state.sensorInterval); state.sensorInterval=null; }
}

// ─── SURGICAL DOM PATCH (no blink) ────────────────────────────────
function patchSensorDOM(companyId, ps) {
  // Only patch when on the sensors tab of a company page
  if (state.companyPage.tab !== 'sensors') return;
  if (!document.getElementById('sv-pressure')) return; // not rendered yet

  const pressureDrop = ps==='critical'?15:ps==='warning'?8:2;
  const cf = state.sensorData.flow.slice(-1)[0]||950;
  const ci = state.sensorData.infrared.slice(-1)[0]||25;
  const flowImb = ((cf - cf*(ps==='critical'?0.85:ps==='warning'?0.95:0.99))/cf*100).toFixed(1);

  const readings = [
    { key:'pressure', value:(state.sensorData.pressure.slice(-1)[0]||95).toFixed(1), unit:'PSI',
      color:'#60a5fa', sub:`Drop: ${pressureDrop}%`,
      status:pressureDrop>10?'critical':pressureDrop>5?'warning':'normal',
      data:state.sensorData.pressure },
    { key:'flow',     value:cf.toFixed(0), unit:'L/min',
      color:'#a78bfa', sub:`Imbalance: ${flowImb}%`,
      status:parseFloat(flowImb)>8?'critical':parseFloat(flowImb)>4?'warning':'normal',
      data:state.sensorData.flow },
    { key:'acoustic', value:(state.sensorData.acoustic.slice(-1)[0]||46).toFixed(1), unit:'dB',
      color:'#34d399', sub:ps==='normal'?'No vibration':'Anomaly detected',
      status:ps, data:state.sensorData.acoustic },
    { key:'infrared', value:ci.toFixed(1), unit:'°C',
      color:'#fb923c', sub:ci>32?'Above threshold':'Normal range',
      status:ci>32?'warning':'normal', data:state.sensorData.infrared },
  ];

  readings.forEach(r => {
    // Update numeric value
    const valEl = document.getElementById(`sv-${r.key}`);
    if (valEl) valEl.textContent = r.value;

    // Update sub-text
    const subEl = document.getElementById(`ss-${r.key}`);
    if (subEl) subEl.textContent = r.sub;

    // Update mini chart
    const chartEl = document.getElementById(`sc-${r.key}`);
    if (chartEl) chartEl.innerHTML = miniChartHTML(r.data, r.color, r.unit);
  });
}

// ─── PDF GENERATION ───────────────────────────────────────────────
function generatePDF(key, title, date) {
  const companies = getCompanies();
  const alerts    = state.alerts;
  const user      = state.user;
  const now       = new Date().toLocaleString();

  // Build report data per key
  const reportData = {
    'monthly-incident': {
      summary: 'This report summarises all pipeline incidents recorded during the current month across all monitored companies.',
      sections: [
        { heading: 'Incident Overview', rows: companies.map(c => {
          const co_alerts = (alerts[c.id]||[]).filter(a=>!a.resolved && a.severity!=='info');
          return [c.name, c.region, String(co_alerts.length), co_alerts.length?co_alerts[0].severity:'none'];
        }), headers: ['Company','Region','Active Alerts','Highest Severity'] },
        { heading: 'Alert Detail', rows: Object.entries(alerts).flatMap(([cid,list])=>
          list.filter(a=>a.severity!=='info').map(a=>[
            companies.find(c=>c.id===cid)?.name||cid, a.severity.toUpperCase(), a.title, a.location
          ])
        ), headers: ['Company','Severity','Title','Location'] },
      ]
    },
    'pipeline-health': {
      summary: 'Quarterly pipeline health assessment across all monitored infrastructure.',
      sections: [
        { heading: 'Pipeline Status Summary', rows: companies.map(c=>[
          c.name, c.region, String(c.pipelines), c.status, c.pressure, c.flow
        ]), headers: ['Company','Region','Pipelines','Status','Pressure','Flow'] },
        { heading: 'Sensor Configuration', rows: companies.flatMap(c=>
          (PIPELINE_CONFIGS[c.id]||[]).map(p=>[c.name, p.name, String(p.sensors.length), p.status])
        ), headers: ['Company','Pipeline','Sensors','Status'] },
      ]
    },
    'sensor-calibration': {
      summary: 'Calibration log for all active sensors across monitored pipelines.',
      sections: [
        { heading: 'Sensor Inventory', rows: companies.flatMap(c=>
          (PIPELINE_CONFIGS[c.id]||[]).flatMap(p=>p.sensors.map(s=>[
            c.name, p.name, s.id.toUpperCase(), s.type, s.status, 'Calibrated'
          ]))
        ), headers: ['Company','Pipeline','Sensor ID','Type','Status','Calibration'] },
      ]
    },
    'engineer-dispatch': {
      summary: 'Log of engineer assignments and dispatch records for this period.',
      sections: [
        { heading: 'Engineer Zone Assignments', rows: USERS.filter(u=>u.role==='engineer').map(u=>[
          u.name, u.email, `Zone ${u.zone}`, companies.find(c=>c.id===ZONE_PIPELINE_MAP[u.zone])?.name||'Unassigned'
        ]), headers: ['Engineer','Email','Zone','Company'] },
        { heading: 'Alert Assignments', rows: Object.entries(alerts).flatMap(([cid,list])=>
          list.filter(a=>a.assignedTo).map(a=>[a.assignedTo, a.title, a.severity, a.location])
        ).length ? Object.entries(alerts).flatMap(([cid,list])=>
          list.filter(a=>a.assignedTo).map(a=>[a.assignedTo, a.title, a.severity, a.location])
        ) : [['No assignments recorded','—','—','—']],
          headers: ['Assigned To','Alert','Severity','Location'] },
      ]
    },
    'annual-safety': {
      summary: 'Annual safety review covering all pipeline operations for the period.',
      sections: [
        { heading: 'Company Safety Overview', rows: companies.map(c=>{
          const total = (alerts[c.id]||[]).length;
          const res   = (alerts[c.id]||[]).filter(a=>a.resolved).length;
          return [c.name, c.region, String(c.pipelines), String(total), String(res), c.status];
        }), headers: ['Company','Region','Pipelines','Total Alerts','Resolved','Status'] },
      ]
    },
  };

  const data = reportData[key] || {
    summary: 'Report data for this period.',
    sections: [{ heading: 'Summary', rows: companies.map(c=>[c.name, c.status]), headers: ['Company','Status'] }]
  };

  // Use print-to-PDF approach with a styled hidden window
  const win = window.open('', '_blank', 'width=900,height=700');
  if (!win) { alert('Please allow pop-ups to download PDF reports.'); return; }

  const tableStyle = `
    border-collapse:collapse;width:100%;margin-bottom:24px;font-size:12px;
  `;
  const thStyle = `
    background:#0a1628;color:#22d3ee;padding:8px 12px;text-align:left;
    border:1px solid #1e3a5f;font-size:11px;letter-spacing:0.04em;
  `;
  const tdStyle = `padding:7px 12px;border:1px solid #e2e8f0;color:#1e293b;`;
  const trAlt   = `background:#f8fafc;`;

  const sectionsHTML = data.sections.map(sec => `
    <h3 style="color:#0a1628;font-size:14px;font-weight:700;margin:24px 0 10px;border-left:4px solid #22d3ee;padding-left:10px">${sec.heading}</h3>
    <table style="${tableStyle}">
      <thead><tr>${sec.headers.map(h=>`<th style="${thStyle}">${h}</th>`).join('')}</tr></thead>
      <tbody>${sec.rows.map((row,i)=>`
        <tr style="${i%2===1?trAlt:''}">
          ${row.map(cell=>`<td style="${tdStyle}">${cell}</td>`).join('')}
        </tr>`).join('')}
      </tbody>
    </table>
  `).join('');

  win.document.write(`<!DOCTYPE html>
<html><head>
  <meta charset="UTF-8">
  <title>${title} — EcoGuard Technologies</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
    * { margin:0;padding:0;box-sizing:border-box; }
    body { font-family:'Inter',sans-serif;color:#1e293b;background:#fff;padding:40px; }
    @media print {
      body { padding:20px; }
      .no-print { display:none; }
      @page { margin:1.5cm; }
    }
  </style>
</head><body>
  <!-- Header bar -->
  <div style="background:#0a1628;border-radius:10px;padding:24px 28px;margin-bottom:28px;display:flex;justify-content:space-between;align-items:center">
    <div>
      <div style="color:#22d3ee;font-size:11px;font-weight:700;letter-spacing:0.1em;margin-bottom:4px">ECO GUARD TECHNOLOGIES</div>
      <div style="color:#fff;font-size:22px;font-weight:700">${title}</div>
      <div style="color:rgba(34,211,238,0.7);font-size:12px;margin-top:4px">${date}</div>
    </div>
    <div style="text-align:right">
      <div style="color:rgba(255,255,255,0.5);font-size:10px">Generated by</div>
      <div style="color:#22d3ee;font-size:13px;font-weight:600">${user.name}</div>
      <div style="color:rgba(255,255,255,0.4);font-size:10px;margin-top:2px">${now}</div>
    </div>
  </div>

  <!-- Summary -->
  <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:14px 18px;margin-bottom:24px">
    <div style="color:#0369a1;font-size:11px;font-weight:700;letter-spacing:0.05em;margin-bottom:4px">EXECUTIVE SUMMARY</div>
    <p style="color:#1e293b;font-size:13px;line-height:1.6">${data.summary}</p>
  </div>

  <!-- Stats row -->
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:28px">
    ${[
      ['Companies', String(companies.length)],
      ['Total Pipelines', String(companies.reduce((s,c)=>s+c.pipelines,0))],
      ['Active Alerts', String(Object.values(alerts).flat().filter(a=>!a.resolved&&a.severity!=='info').length)],
      ['Operational', String(companies.filter(c=>c.status==='operational').length)+'/'+companies.length],
    ].map(([l,v])=>`
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px 14px">
      <div style="color:#64748b;font-size:10px;font-weight:600;letter-spacing:0.05em">${l.toUpperCase()}</div>
      <div style="color:#0a1628;font-size:22px;font-weight:700;margin-top:4px">${v}</div>
    </div>`).join('')}
  </div>

  <!-- Sections -->
  ${sectionsHTML}

  <!-- Footer -->
  <div style="border-top:2px solid #e2e8f0;margin-top:32px;padding-top:16px;display:flex;justify-content:space-between;align-items:center">
    <div style="color:#94a3b8;font-size:10px">Eco Guard Technologies — Pipeline Security Monitoring System</div>
    <div style="color:#94a3b8;font-size:10px">CONFIDENTIAL — Internal Use Only</div>
  </div>

  <!-- Print button -->
  <div class="no-print" style="position:fixed;bottom:24px;right:24px">
    <button onclick="window.print()" style="background:#0a1628;color:#22d3ee;border:none;border-radius:10px;padding:12px 24px;font-size:14px;font-weight:700;cursor:pointer;box-shadow:0 4px 20px rgba(0,0,0,0.3)">
      Save as PDF
    </button>
  </div>
</body></html>`);
  win.document.close();
  setTimeout(() => win.print(), 600);
}

// ─── PWA INSTALL BANNER ───────────────────────────────────────────
let deferredPrompt = null;

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
  showInstallBanner();
});

function showInstallBanner() {
  if (document.getElementById('install-banner')) return;
  const banner = document.createElement('div');
  banner.id = 'install-banner';
  banner.innerHTML = `
    
    <div class="install-text">
      <div class="install-title">Install Eco Guard</div>
      <div class="install-sub">Add to home screen for quick access</div>
    </div>
    <button class="install-btn" id="install-accept">Install</button>
    <button class="install-close" id="install-dismiss">×</button>`;
  document.body.appendChild(banner);

  document.getElementById('install-accept').addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
    }
    banner.remove();
  });
  document.getElementById('install-dismiss').addEventListener('click', () => banner.remove());
}

// Show banner on iOS (manual instructions)
function checkiOS() {
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone = window.navigator.standalone;
  if (isIOS && !isStandalone) {
    setTimeout(() => {
      if (document.getElementById('install-banner')) return;
      const banner = document.createElement('div');
      banner.id = 'install-banner';
      banner.innerHTML = `
        
        <div class="install-text">
          <div class="install-title">Install on iPhone/iPad</div>
          <div class="install-sub">Tap Share → "Add to Home Screen"</div>
        </div>
        <button class="install-close" id="install-dismiss">×</button>`;
      document.body.appendChild(banner);
      document.getElementById('install-dismiss').addEventListener('click', () => banner.remove());
    }, 3000);
  }
}

// ─── SEARCH HELPERS ───────────────────────────────────────────────
function bindSearchResultClicks() {
  document.querySelectorAll('[data-search-idx]').forEach(el => {
    el.addEventListener('click', () => {
      const idx = parseInt(el.dataset.searchIdx, 10);
      const results = state._searchResults || [];
      if (results[idx]) results[idx].action();
    });
  });
}

function bindSearchInput() {
  const si = document.getElementById('search-input');
  if (!si) return;
  si.addEventListener('input', e => {
    state.searchQuery = e.target.value;
    // Surgically update only the results list — preserves input focus
    const q = (state.searchQuery||'').toLowerCase().trim();
    const results = buildSearchResults(q);
    state._searchResults = results;
    const list = document.getElementById('search-results-list');
    if (!list) return;
    const th = t();
    const TYPE_LABELS = { company:'Company', engineer:'Engineer', alert:'Alert', page:'Page' };
    if (q.length < 2) {
      list.innerHTML = `<div style="padding:2rem;text-align:center;color:${th.textMuted};font-size:0.82rem">Type at least 2 characters to search<br><br><span style="color:${th.textFaint};font-size:0.72rem">Companies &middot; Engineers &middot; Alerts &middot; Pages</span></div>`;
    } else if (results.length === 0) {
      list.innerHTML = `<div style="padding:2rem;text-align:center;color:${th.textMuted};font-size:0.82rem">No results for "<strong>${state.searchQuery.replace(/</g,'&lt;')}</strong>"</div>`;
    } else {
      list.innerHTML = results.map((r,i) => `
        <div data-search-idx="${i}" style="padding:0.7rem 1rem;display:flex;align-items:center;gap:10px;cursor:pointer;border-bottom:1px solid ${th.border};transition:background 0.15s"
          onmouseover="this.style.background='rgba(255,255,255,0.04)'" onmouseout="this.style.background=''">
          <div style="flex:1;min-width:0">
            <div style="color:${th.text};font-size:0.85rem;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${r.label}</div>
            <div style="color:${th.textFaint};font-size:0.72rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${r.sub}</div>
          </div>
          <span style="background:${th.accentBg};border:1px solid ${th.border};color:${th.textMuted};font-size:0.62rem;padding:2px 7px;border-radius:4px;font-weight:600;flex-shrink:0;text-transform:uppercase">${TYPE_LABELS[r.type]||r.type}</span>
        </div>`).join('');
      bindSearchResultClicks();
    }
  });
  si.addEventListener('keydown', e => {
    if (e.key === 'Escape') { state.showSearch = false; state.searchQuery = ''; render(); }
  });
  si.focus();
}

// ─── V6: CTRL+K GLOBAL SHORTCUT ───────────────────────────────────
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    if (!state.user) return;
    state.showSearch = !state.showSearch;
    state.searchQuery = '';
    state._searchResults = [];
    render();
    if (state.showSearch) setTimeout(() => document.getElementById('search-input')?.focus(), 40);
  }
  if (e.key === 'Escape' && state.showSearch) {
    state.showSearch = false;
    state.searchQuery = '';
    render();
  }
});

// ─── V6: SW UPDATE BANNER ─────────────────────────────────────────
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.ready.then(reg => {
    reg.addEventListener('updatefound', () => {
      const nw = reg.installing;
      if (!nw) return;
      nw.addEventListener('statechange', () => {
        if (nw.state === 'installed' && navigator.serviceWorker.controller) {
          const banner = document.createElement('div');
          banner.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:rgba(34,211,238,0.12);border:1px solid rgba(34,211,238,0.4);color:#22d3ee;padding:10px 18px;border-radius:12px;font-size:0.82rem;font-weight:600;z-index:9999;display:flex;align-items:center;gap:12px;backdrop-filter:blur(8px);box-shadow:0 8px 24px rgba(0,0,0,0.4);white-space:nowrap';
          banner.innerHTML = `<span>New version available</span>
            <button onclick="location.reload()" style="background:#22d3ee;color:#000;border:none;border-radius:7px;padding:5px 12px;font-size:0.75rem;font-weight:700;cursor:pointer">Update Now</button>
            <button onclick="this.parentElement.remove()" style="background:none;border:none;color:#22d3ee;cursor:pointer;font-size:1.1rem;padding:0 2px;line-height:1">×</button>`;
          document.body.appendChild(banner);
        }
      });
    });
  }).catch(() => {});
}

// ─── BOOT ─────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  try {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(err => {
        console.warn('Service Worker registration failed:', err);
      });
    }

    // Preload voices
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.getVoices();
        window.speechSynthesis.addEventListener('voiceschanged', () => window.speechSynthesis.getVoices());
      } catch (e) {
        console.warn('Speech synthesis not available:', e);
      }
    }

    // Single persistent outside-click handler (never stacks)
    document.addEventListener('click', outsideClickHandler);

    // Add-company overlay: click outside modal to close
    document.addEventListener('click', e => {
      if (state.showAddCompany && e.target && e.target.id === 'add-company-overlay') {
        state.showAddCompany = false;
        render();
      }
    });

    checkiOS();
    // If session was restored, restart sensor loop and alarm polling
    if (state.user) {
      startSensorInterval();
      setTimeout(checkAndTriggerAlerts, 180000);
    }
    render();
  } catch (error) {
    console.error('App initialization failed:', error);
    document.body.innerHTML = '<div style="padding:20px;color:red;">App failed to load. Please refresh the page.</div>';
  }
});
