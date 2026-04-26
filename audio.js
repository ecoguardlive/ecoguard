// ECO GUARD TECHNOLOGIES — audio.js
// Audio engine, speech synthesis, alarm modal

// ─── AUDIO ENGINE ─────────────────────────────────────────────────
let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function playAlarmSound(severity) {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    const duration = severity === 'critical' ? 4 : 3; // longer for critical nuclear alert

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.3, now);
    masterGain.gain.exponentialRampToValueAtTime(0.01, now + duration);
    masterGain.connect(ctx.destination);

    // Nuclear bomb alarm: rapid high-frequency oscillations
    const osc = ctx.createOscillator();
    osc.type = 'square'; // harsh, piercing sound
    osc.frequency.setValueAtTime(900, now);

    // Create rapid frequency modulation for nuclear siren effect
    const freqMod = ctx.createOscillator();
    freqMod.type = 'sawtooth';
    freqMod.frequency.setValueAtTime(severity === 'critical' ? 3 : 2, now); // faster for critical

    const freqGain = ctx.createGain();
    freqGain.gain.setValueAtTime(200, now); // modulation depth

    freqMod.connect(freqGain);
    freqGain.connect(osc.frequency);

    // Add secondary oscillator for richer tone
    const osc2 = ctx.createOscillator();
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(950, now);

    const freqMod2 = ctx.createOscillator();
    freqMod2.type = 'sawtooth';
    freqMod2.frequency.setValueAtTime(severity === 'critical' ? 3.1 : 2.1, now); // slightly offset

    const freqGain2 = ctx.createGain();
    freqGain2.gain.setValueAtTime(180, now);

    freqMod2.connect(freqGain2);
    freqGain2.connect(osc2.frequency);

    const osc2Gain = ctx.createGain();
    osc2Gain.gain.setValueAtTime(0.15, now);

    osc.connect(masterGain);
    osc2.connect(osc2Gain);
    osc2Gain.connect(masterGain);

    osc.start(now);
    osc.stop(now + duration);
    freqMod.start(now);
    freqMod.stop(now + duration);

    osc2.start(now);
    osc2.stop(now + duration);
    freqMod2.start(now);
    freqMod2.stop(now + duration);

    // Add pulsing effect for urgency
    const pulseGain = ctx.createGain();
    pulseGain.gain.setValueAtTime(1, now);

    // Create rapid pulses
    for (let i = 0; i < duration * 10; i++) {
      const pulseTime = now + i * 0.1;
      pulseGain.gain.setValueAtTime(1, pulseTime);
      pulseGain.gain.setValueAtTime(0.7, pulseTime + 0.05);
    }

    // Apply pulse to master gain
    pulseGain.connect(masterGain.gain);

  } catch(e) { /* audio not available */ }
}

function speakAlert(text) {
  if (!('speechSynthesis' in window) || state.voiceCooldown) return;
  state.voiceCooldown = true;

  // Cancel any currently speaking utterance
  try { window.speechSynthesis.cancel(); } catch(e) {}

  const utt = new SpeechSynthesisUtterance(text);
  utt.rate = 0.88; utt.pitch = 0.8; utt.volume = 1;
  utt.lang = 'en-US';

  // Reset cooldown when speech ends (or errors), not on a fixed timer
  utt.onend = () => { state.voiceCooldown = false; };
  utt.onerror = () => { state.voiceCooldown = false; };

  // Safety-net: always reset after 15s in case onend never fires (some browsers)
  setTimeout(() => { state.voiceCooldown = false; }, 15000);

  function doSpeak() {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const preferred = voices.find(v => /david|mark|daniel|george|james/i.test(v.name) && /en/i.test(v.lang))
        || voices.find(v => v.lang === 'en-US')
        || voices.find(v => /en/i.test(v.lang))
        || voices[0];
      if (preferred) utt.voice = preferred;
    }
    // Resume AudioContext if suspended (required after page load on many mobile browsers)
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    try {
      window.speechSynthesis.speak(utt);
      // Chrome desktop bug: speech can stall; kick it every 10s while speaking
      const kickTimer = setInterval(() => {
        if (!window.speechSynthesis.speaking) { clearInterval(kickTimer); return; }
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }, 10000);
      utt.onend = () => { clearInterval(kickTimer); state.voiceCooldown = false; };
      utt.onerror = () => { clearInterval(kickTimer); state.voiceCooldown = false; };
    } catch(e) {
      state.voiceCooldown = false;
    }
  }

  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    doSpeak();
  } else {
    // Voices not loaded yet — wait for voiceschanged then speak
    const onVoices = () => {
      window.speechSynthesis.removeEventListener('voiceschanged', onVoices);
      doSpeak();
    };
    window.speechSynthesis.addEventListener('voiceschanged', onVoices);
    // Fallback: if voiceschanged never fires, speak anyway after 500ms
    setTimeout(() => {
      window.speechSynthesis.removeEventListener('voiceschanged', onVoices);
      if (state.voiceCooldown) doSpeak();
    }, 500);
  }
}

// ─── ALARM MODAL ──────────────────────────────────────────────────
function showAlarmModal(severity, alerts) {
  // Remove any existing modal
  const existing = document.getElementById('alarm-modal-overlay');
  if (existing) existing.remove();

  const isCritical = severity === 'critical';
  const alert = alerts[0];
  const companyId = Object.entries(state.alerts).find(([cid, list]) =>
    list.some(a => a.id === alert.id)
  )?.[0];
  const company = getCompanies().find(c => c.id === companyId);
  // Collect ALL engineers assigned to zones that belong to this company
  const companyZones = Object.entries(ZONE_PIPELINE_MAP).filter(([z,c]) => c === companyId).map(([z]) => z);
  const engineersByZone = getUsersByZone();
  const companyEngineers = companyZones.map(z => engineersByZone[z]).filter(Boolean);

  const overlay = document.createElement('div');
  overlay.id = 'alarm-modal-overlay';
  overlay.style.cssText = `
    position:fixed;inset:0;z-index:9000;display:flex;align-items:center;justify-content:center;
    padding:1rem;background:${isCritical ? 'rgba(120,0,0,0.55)' : 'rgba(100,60,0,0.45)'};
    backdrop-filter:blur(6px);animation:fadeIn 0.2s ease;
  `;

  const borderColor = isCritical ? '#ef4444' : '#f59e0b';
  const glowColor   = isCritical ? 'rgba(239,68,68,0.25)' : 'rgba(245,158,11,0.2)';
  const titleColor  = isCritical ? '#fca5a5' : '#fcd34d';
  const bgColor     = isCritical ? 'rgba(20,5,5,0.97)' : 'rgba(20,14,2,0.97)';
  const badgeBg     = isCritical ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.12)';

  overlay.innerHTML = `
    <div style="width:100%;max-width:460px;background:${bgColor};border:2px solid ${borderColor};border-radius:18px;
      box-shadow:0 0 60px ${glowColor},0 20px 60px rgba(0,0,0,0.7);overflow:hidden;animation:slideDown 0.25s ease">

      <!-- Pulsing top bar -->
      <div style="height:5px;background:linear-gradient(90deg,${borderColor},${isCritical?'#fbbf24':borderColor});
        animation:pulse 0.8s ease infinite"></div>

      <div style="padding:1.5rem 1.5rem 0.75rem">
        <!-- Severity badge + title -->
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:1rem">
          <div style="width:44px;height:44px;border-radius:12px;background:${badgeBg};border:1.5px solid ${borderColor};
            display:flex;align-items:center;justify-content:center;flex-shrink:0;animation:pulse ${isCritical?'0.7s':'1.2s'} ease infinite">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${borderColor}" stroke-width="2">
              ${isCritical
                ? '<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>'
                : '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>'}
            </svg>
          </div>
          <div>
            <div style="color:${borderColor};font-size:0.65rem;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;margin-bottom:2px">
              ${isCritical ? 'CRITICAL ALARM — IMMEDIATE ACTION REQUIRED' : 'WARNING ALERT — INVESTIGATION REQUIRED'}
            </div>
            <div style="color:${titleColor};font-size:1rem;font-weight:700;line-height:1.3">${alert.title}</div>
          </div>
        </div>

        <!-- Alert details -->
        <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:0.85rem;margin-bottom:1rem">
          <div style="color:rgba(255,255,255,0.55);font-size:0.72rem;margin-bottom:6px;line-height:1.55">${alert.description}</div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">
            <span style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:5px;
              padding:3px 8px;color:rgba(255,255,255,0.5);font-size:0.7rem">
              ${alert.location}
            </span>
            <span style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:5px;
              padding:3px 8px;color:rgba(255,255,255,0.5);font-size:0.7rem">
              ${company?.name || companyId}
            </span>
          </div>
        </div>

        <!-- Engineer notifications — one row per assigned engineer -->
        ${companyEngineers.length > 0 ? `
        <div style="background:rgba(34,211,238,0.07);border:1px solid rgba(34,211,238,0.2);border-radius:10px;padding:0.6rem 0.75rem;margin-bottom:1rem">
          <div style="color:#22d3ee;font-size:0.7rem;font-weight:700;letter-spacing:0.05em;margin-bottom:0.5rem;text-transform:uppercase">Assigned Engineers — Notified</div>
          ${companyEngineers.map(eng => {
            const engZone = companyZones.find(z => engineersByZone[z]?.email === eng.email) || '';
            return '<div style="display:flex;align-items:center;gap:10px;padding:0.4rem 0;border-top:1px solid rgba(34,211,238,0.1)">'
              + '<div style="width:30px;height:30px;border-radius:8px;background:rgba(34,211,238,0.12);border:1px solid rgba(34,211,238,0.3);display:flex;align-items:center;justify-content:center;flex-shrink:0">'
              + '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" stroke-width="1.8"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'
              + '</div>'
              + '<div style="flex:1;min-width:0">'
              + '<div style="color:rgba(255,255,255,0.85);font-size:0.8rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + eng.name + ' <span style="color:rgba(34,211,238,0.6);font-size:0.68rem;font-weight:400">Zone ' + engZone + '</span></div>'
              + '<div style="color:rgba(34,211,238,0.5);font-size:0.67rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + eng.email + '</div>'
              + '</div>'
              + '<div style="background:rgba(52,211,153,0.12);border:1px solid rgba(52,211,153,0.3);border-radius:6px;padding:3px 8px;font-size:0.65rem;color:#34d399;font-weight:600;flex-shrink:0">NOTIFIED</div>'
              + '</div>';
          }).join('')}
        </div>` : ''}
      </div>

      <!-- Action buttons -->
      <div style="padding:0 1.5rem 1.5rem;display:flex;gap:0.75rem">
        <button id="alarm-modal-goto" style="flex:1;padding:0.7rem 0.5rem;background:${isCritical?'rgba(239,68,68,0.15)':'rgba(245,158,11,0.12)'};
          border:1.5px solid ${borderColor};border-radius:10px;color:${titleColor};font-size:0.82rem;font-weight:700;cursor:pointer">
          View Alert
        </button>
        <button id="alarm-modal-dismiss" style="flex:1;padding:0.7rem 0.5rem;background:rgba(255,255,255,0.06);
          border:1.5px solid rgba(255,255,255,0.12);border-radius:10px;color:rgba(255,255,255,0.6);font-size:0.82rem;font-weight:600;cursor:pointer">
          Acknowledge
        </button>
      </div>
    </div>`;

  document.body.appendChild(overlay);

  // Bind modal buttons
  document.getElementById('alarm-modal-goto')?.addEventListener('click', () => {
    overlay.remove();
    state.page = 'alerts';
    render();
  });
  document.getElementById('alarm-modal-dismiss')?.addEventListener('click', () => {
    // Acknowledge all currently active alerts in this alarm batch so the loop
    // does not re-trigger the modal every 15 s until they are manually resolved.
    alerts.forEach(a => {
      if (!state.alertAcknowledgments[a.id]) {
        state.alertAcknowledgments[a.id] = { name: state.user?.name || 'Unknown', time: new Date() };
        if (state.escalationTimers[a.id]) {
          clearTimeout(state.escalationTimers[a.id]);
          delete state.escalationTimers[a.id];
        }
      }
    });
    overlay.remove();
    render();
  });
  // Click outside: same — acknowledge and close
  overlay.addEventListener('click', e => {
    if (e.target === overlay) {
      alerts.forEach(a => {
        if (!state.alertAcknowledgments[a.id]) {
          state.alertAcknowledgments[a.id] = { name: state.user?.name || 'Unknown', time: new Date() };
          if (state.escalationTimers[a.id]) {
            clearTimeout(state.escalationTimers[a.id]);
            delete state.escalationTimers[a.id];
          }
        }
      });
      overlay.remove();
      render();
    }
  });
}

function checkAndTriggerAlerts() {
  if (!state.alarmEnabled) return;

  const allAlertEntries = Object.entries(state.alerts).flatMap(([cid,list]) => list.map(a=>({...a,companyId:cid})));
  const critAlerts = allAlertEntries.filter(a => !a.resolved && a.severity === 'critical' && state.alarmTypesEnabled[a.type] && !state.alertAcknowledgments[a.id]);
  const warnAlerts = allAlertEntries.filter(a => !a.resolved && a.severity === 'warning' && state.alarmTypesEnabled[a.type] && !state.alertAcknowledgments[a.id]);

  // Start escalation timers for any unacknowledged alerts without one yet
  allAlertEntries.filter(a=>!a.resolved&&a.severity!=='info').forEach(a => {
    if (!state.alertAcknowledgments[a.id] && !state.escalationTimers[a.id]) {
      startEscalationTimer(a.id, a.companyId);
      // Only trigger notifications on first encounter (no notif logged yet)
      const alreadyNotified = state.notificationLog.some(n => n.alertTitle === a.title || n.alertTitle === '[ESCALATED] ' + a.title);
      if (!alreadyNotified) triggerAlertNotifications(a, a.companyId);
    }
  });

  if (critAlerts.length > 0) {
    if (state.alarmSoundEnabled) playAlarmSound('critical');
    if (state.alarmVoiceEnabled) speakAlert(`Critical alarm. ${critAlerts[0].title}. Immediate action required.`);
    showAlarmModal('critical', critAlerts);
  } else if (warnAlerts.length > 0) {
    if (state.alarmSoundEnabled) playAlarmSound('warning');
    if (state.alarmVoiceEnabled) speakAlert(`Warning alert. ${warnAlerts[0].location}. Please investigate.`);
    showAlarmModal('warning', warnAlerts);
  }
}

