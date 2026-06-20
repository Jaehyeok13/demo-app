/**
 * @FileName     : demo.module.js
 * @Description  : Temp.html 데모의 통합 로직 관리 모듈
 * @Modification :
 */

import { EventBus } from '../../core/eventBus.js';
import { State } from '../../core/state.js';
import * as ModalModule from '../modal/modal.module.js';

// Constants for storage
const CACHE_KEYS = {
  THEME: 'demo.theme',
  NOTIFICATION: 'demo.notification',
  LICENSE: 'demo.license',
  CUSTOM_THEMES: 'demo.customThemes',
  SETTINGS: 'demo.settings'
};

// Default State matching temp.html
const STATE = {
  notifSettings: JSON.parse(localStorage.getItem(CACHE_KEYS.SETTINGS)) || {
    position: 'bottom-right',
    autoClose: 'true',
    duration: '3000',
    mode: 'toast'
  },
  customThemes: JSON.parse(sessionStorage.getItem(CACHE_KEYS.CUSTOM_THEMES)) || [],
  system: {
    appId: 'DM-APP-01',
    machineId: sessionStorage.getItem('demo.machineId') || 'MC-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
    hwid: 'HW-' + Array.from({length: 4}, () => Math.random().toString(36).substring(2, 6).toUpperCase()).join('-'),
    sessionId: sessionStorage.getItem('demo.sessionId') || 'SS-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
    buildVersion: 'v1.2.0-demo'
  }
};

const DEFAULT_PRESETS = [
  { id: 'dark', name: 'Cosmic Dark', icon: '🌓', bg: '#07050a', text: '#f1f5f9', border: 'var(--color-border)', isPremium: false },
  { id: 'light', name: 'Light Slate', icon: '☀️', bg: '#ffffff', text: '#1e293b', border: 'var(--color-border)', isPremium: false },
  { id: 'midnight', name: 'Midnight Neon', icon: '🪐', bg: '#020617', text: '#22d3ee', border: 'var(--color-border)', isPremium: true },
  { id: 'focus', name: 'Zen Forest', icon: '🌿', bg: '#022c22', text: '#34d399', border: 'var(--color-border)', isPremium: true },
  { id: 'ocean', name: 'Ocean Blue', icon: '🌀', bg: '#0b1528', text: '#93c5fd', border: 'var(--color-border)', isPremium: true },
  { id: 'purple', name: 'Amethyst Purple', icon: '🔮', bg: '#12071f', text: '#d8b4fe', border: 'var(--color-border)', isPremium: true },
  { id: 'sunset', name: 'Sunset Orange', icon: '🌇', bg: '#1b0a05', text: '#fdba74', border: 'var(--color-border)', isPremium: true },
  { id: 'forest', name: 'Emerald Forest', icon: '🌲', bg: '#06170c', text: '#86efac', border: 'var(--color-border)', isPremium: true }
];

export function init() {
  console.log('[Demo Module] 초기화');
  
  sessionStorage.setItem('demo.machineId', STATE.system.machineId);
  sessionStorage.setItem('demo.sessionId', STATE.system.sessionId);
  
  syncLoadedConfiguration();
  bindEvents();
  renderDynamicThemesGrid();
  renderGlobalCustomThemeSlots();
  renderGlobalStorageTableView();
  appendDiagLog('INFO', 'Application Boot Sequence initialized.');
}

function bindEvents() {
  // Event Delegation for buttons
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-action]');
    if (!trigger) return;
    const action = trigger.dataset.action;
    
    if (action === 'toggle-accordion') {
      const targetId = trigger.dataset.target;
      const content = document.getElementById(targetId);
      if (content) content.classList.toggle('hidden');
    }
    else if (action === 'toast-success') createToast("인증 성공 고지", "정품 계정 라이선스가 승격 승인되었습니다.", "success");
    else if (action === 'toast-info') createToast("연동 헬스 모니터", "수신 연결 실시간 포지션 테스트 중입니다.", "info");
    else if (action === 'toast-warning') createToast("자료 소거 우려", "지정한 가상 키가 비어있을 수 있습니다.", "warning");
    else if (action === 'toast-error') createToast("가동 시스템 차단", "프리미엄 세그먼트 잠금이 작동되었습니다.", "error");
    else if (action.startsWith('modal-')) {
      const size = action.replace('modal-', '');
      triggerSizeModal(size);
    }
    else if (action === 'copy-hwid') {
      navigator.clipboard.writeText(STATE.system.hwid).then(() => {
        appendDiagLog('INFO', `Hardware Device HWID copied: [${STATE.system.hwid}]`);
        createToast("HWID 복사 완료", "HWID가 복사되었습니다.", "success");
      });
    }
    else if (action === 'session-save') saveSessionSandbox();
    else if (action === 'session-load') loadSessionSandbox();
    else if (action === 'clear-logs') clearDiagLogs();
    else if (action === 'fire-custom-toast') fireCustomToast();
    else if (action === 'fire-custom-modal') fireCustomModal();
    else if (action === 'seed-storage') seedInitialMockRegistry();
    else if (action === 'wipe-storage') wipeAllMockRegistry();
    else if (action === 'save-custom-theme') saveUserCustomTheme();
    else if (action === 'test-notif') sendTestNotification();
    else if (action === 'fill-lic') autoFillLicKey(trigger.dataset.key);
    else if (action === 'submit-lic') validateLicSubmit();
    else if (action === 'close-modal') {
      document.getElementById('modalOverlay').classList.add('hidden');
    }
    else if (action === 'focus-lic') {
       setTimeout(() => {
          document.getElementById('licFormKey')?.focus();
       }, 150);
    }
    else if (action === 'copy-spec') {
       const val = trigger.dataset.val;
       const target = trigger.dataset.target;
       copySpecInfo(val, target);
    }
  });

  // Event Delegation for settings menus
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-settings-menu]');
    if (!trigger) return;
    const menuId = trigger.dataset.settingsMenu;
    
    document.querySelectorAll('[data-settings-menu]').forEach(el => el.classList.remove('active'));
    trigger.classList.add('active');

    document.querySelectorAll('.settings-panel-content').forEach(el => el.classList.add('hidden'));
    const panel = document.getElementById(`set-panel-${menuId}`);
    if (panel) panel.classList.remove('hidden');
    
    appendDiagLog('INFO', `Settings sub-panel changed: [${menuId.toUpperCase()}]`);
  });

  // Settings change monitors
  document.getElementById('setNotifMode')?.addEventListener('change', handleNotificationModeChange);
  document.querySelectorAll('[data-action="save-notif"]').forEach(el => {
    el.addEventListener('change', saveNotificationSettings);
  });
  
  // Theme Toggle Quick Button
  document.getElementById('btnThemeToggle')?.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const target = current === 'light' ? 'dark' : 'light';
    applyAestheticTheme(target);
  });

  // Modal template shortcut
  document.getElementById('fcModalTpl')?.addEventListener('change', applyModalTplShortcut);
  
  // Custom Theme slots click
  document.getElementById('customThemesShelf')?.addEventListener('click', (e) => {
     const applyBtn = e.target.closest('.theme-apply-btn');
     if (applyBtn) {
       const name = applyBtn.dataset.name;
       const p = applyBtn.dataset.p;
       const s = applyBtn.dataset.s;
       const a = applyBtn.dataset.a;
       applyCustomCompiledColors(p, s, a, name);
       return;
     }

     const delBtn = e.target.closest('.theme-del-btn');
     if (delBtn) {
       deleteCustomThemeSlot(delBtn.dataset.id);
     }
  });

  // Keyboard
  document.addEventListener('keydown', (e) => {
    if (e.key === "Escape") document.getElementById('modalOverlay').classList.add('hidden');
  });

  // Search logic
  const searchInput = document.getElementById('sidebarSearch');
  if (searchInput) {
    searchInput.addEventListener('input', handleSearchInput);
  }
}

function handleSearchInput(e) {
  const val = e.target.value.trim().toLowerCase();
  const list = document.getElementById("autocompleteList");
  if (!list) return;

  const searchableFeatures = [
    { name: "알림 데모", tab: "home" },
    { name: "모달 사이즈 테스트", tab: "home" },
    { name: "HWID 식별자 복사", tab: "home" },
    { name: "Storage 저장 세션 테스트", tab: "home" },
    { name: "Notification Center 설정", tab: "features" },
    { name: "Modal Builder 대형 팝업", tab: "features" },
    { name: "Aesthetics 테마 컬러 체인저", tab: "features" },
    { name: "Storage Real-time Registry 테이블", tab: "features" },
    { name: "알림 위치 타이밍 정밀제어", tab: "settings" },
    { name: "사용자 컬러 피커 커스텀테마 가동", tab: "settings" },
    { name: "가상 마스터 라이선스 마운팅", tab: "settings" },
    { name: "디바이스 상세 Profile 확인", tab: "settings" }
  ];

  if (!val) {
    list.classList.add("hidden");
    list.innerHTML = "";
    return;
  }

  const matches = searchableFeatures.filter(f => f.name.toLowerCase().includes(val));
  if (matches.length === 0) {
    list.innerHTML = '<div style="padding:8px; color:var(--color-text-muted); font-size:10px;">일치 검색 없음</div>';
    list.classList.remove("hidden");
    return;
  }

  list.innerHTML = matches.map(f => {
    return `
      <button type="button" class="search-match-btn" style="width:100%;text-align:left;padding:8px;font-size:11px;background:none;border:none;border-bottom:1px solid var(--color-border);color:var(--text-main);cursor:pointer;display:flex;justify-content:space-between;" 
        onclick="document.getElementById('sidebarSearch').value=''; document.getElementById('autocompleteList').classList.add('hidden'); document.querySelector('[data-tab=\\'${f.tab}\\']').click();">
        <span>${f.name}</span>
        <span style="font-size:9px;font-weight:bold;color:var(--accent);">${f.tab.toUpperCase()}</span>
      </button>
    `;
  }).join('');
  
  list.classList.remove("hidden");
}

function syncLoadedConfiguration() {
  document.getElementById("homeHwidText").textContent = STATE.system.hwid.substring(0, 22) + "...";
  document.getElementById("sysAppId").textContent = STATE.system.appId;
  document.getElementById("sysMachineId").textContent = STATE.system.machineId;
  document.getElementById("sysSessionId").textContent = STATE.system.sessionId;
  document.getElementById("sysBuildVersion").textContent = STATE.system.buildVersion;
  
  document.getElementById("footerHwid").textContent = STATE.system.hwid;
  document.getElementById("footerSession").textContent = STATE.system.sessionId;
  
  const notifSettings = STATE.notifSettings;
  const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
  setVal("setNotifPosition", notifSettings.position);
  setVal("setNotifAutoclose", notifSettings.autoClose);
  setVal("setNotifDuration", notifSettings.duration);
  setVal("setNotifMode", notifSettings.mode || 'toast');

  handleNotificationModeChange();
  
  const savedTheme = localStorage.getItem(CACHE_KEYS.THEME) || 'dark';
  applyAestheticTheme(savedTheme, true);
  
  const lic = localStorage.getItem(CACHE_KEYS.LICENSE) || 'Free';
  State.setLicense({ edition: lic.toLowerCase(), status: lic === 'Free' ? 'INVALID' : 'VALID' });
  applyLicGradeRendering(lic);
}

function copySpecInfo(value, label) {
  navigator.clipboard.writeText(value).then(() => {
    appendDiagLog('INFO', `Device info copied: ${label} [${value}]`);
    createToast("복사 완료", `${label} 정보가 클립보드에 무해하게 보관되었습니다.`, "success");
  });
}

export function appendDiagLog(type, msg) {
  const box = document.getElementById("diagConsoleBox");
  if (!box) return;

  const d = new Date();
  const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
  
  let colorClass = 'text-success';
  if (type === 'WARN') colorClass = 'text-warning';
  if (type === 'ERROR') colorClass = 'text-danger';

  const html = `
    <div class="log-entry">
      <span class="log-time">[${time}]</span>
      <span class="log-type ${colorClass}">[${type}]</span>
      <span class="log-msg">${msg}</span>
    </div>
  `;

  box.insertAdjacentHTML('beforeend', html);
  box.scrollTop = box.scrollHeight;
}

function clearDiagLogs() {
  const box = document.getElementById("diagConsoleBox");
  if (box) box.innerHTML = '';
  appendDiagLog('INFO', 'Diag System logs cleared by user.');
}

// ----------------------------------------------------
// UI Renderers & Component Control
// ----------------------------------------------------

function handleNotificationModeChange() {
  const select = document.getElementById("setNotifMode");
  const mode = select ? select.value : 'toast';
  STATE.notifSettings.mode = mode;

  const toastFields = document.getElementById("toastConfigFields");
  const modalFields = document.getElementById("modalConfigFields");

  if (mode === 'toast') {
    toastFields?.classList.remove("hidden");
    modalFields?.classList.add("hidden");
  } else {
    toastFields?.classList.add("hidden");
    modalFields?.classList.remove("hidden");
  }
  
  localStorage.setItem(CACHE_KEYS.SETTINGS, JSON.stringify(STATE.notifSettings));
}

function saveNotificationSettings() {
  const getVal = id => document.getElementById(id)?.value;
  STATE.notifSettings.position = getVal("setNotifPosition");
  STATE.notifSettings.autoClose = getVal("setNotifAutoclose");
  STATE.notifSettings.duration = getVal("setNotifDuration");
  STATE.notifSettings.mode = getVal("setNotifMode");

  localStorage.setItem(CACHE_KEYS.SETTINGS, JSON.stringify(STATE.notifSettings));
  appendDiagLog('SUCCESS', `Notification parameters cached: Position [${STATE.notifSettings.position}], Mode [${STATE.notifSettings.mode}]`);
  createToast("알림 설정 저장 완료", "설정 파라미터가 디렉터리 캐시에 온전히 저장 고정되었습니다.", "success");
}

let toastIdCounter = 0;
function createToast(title, message, type) {
  if (STATE.notifSettings.mode === 'modal') {
    showModal(title, `<p>${message}</p>`, 'sm');
    return;
  }

  const pos = STATE.notifSettings.position || 'bottom-right';
  const container = document.getElementById(`toast-${pos}`);
  if (!container) return;

  const id = `toast-rt-${toastIdCounter++}`;
  let icon = 'ℹ️';
  let themeClass = 'toast--info';
  
  if (type === 'success') { icon = '✅'; themeClass = 'toast--success'; }
  else if (type === 'warning') { icon = '⚠️'; themeClass = 'toast--warning'; }
  else if (type === 'error') { icon = '❌'; themeClass = 'toast--error'; }

  const el = document.createElement('div');
  el.className = `toast ${themeClass} toast-enter`;
  el.id = id;
  el.innerHTML = `
    <div class="toast__header">
       <span class="toast__title">${icon} ${title}</span>
       <button type="button" class="toast__close" onclick="document.getElementById('${id}').remove()">×</button>
    </div>
    <div class="toast__body">${message}</div>
  `;

  container.appendChild(el);

  // Trigger anim
  setTimeout(() => {
    el.classList.remove('toast-enter');
  }, 10);

  if (STATE.notifSettings.autoClose === 'true') {
     const delay = parseInt(STATE.notifSettings.duration) || 3000;
     setTimeout(() => {
       if (document.getElementById(id)) {
           el.classList.add('toast-exit');
           setTimeout(() => el.remove(), 200);
       }
     }, delay);
  }
}

function showModal(title, bodyHTML, size) {
  const bd = document.getElementById("modalOverlay");
  const panel = document.getElementById("modalPanel");
  if (!bd || !panel) return;

  document.getElementById("modalTitle").textContent = title;
  document.getElementById("modalBody").innerHTML = `<div class="modal-html">${bodyHTML}</div>`;

  panel.className = 'modal';
  if (size) panel.classList.add(`modal--${size}`);

  bd.classList.remove("hidden");
  appendDiagLog('INFO', `Modular overlay modal opened: Title [${title}], Size [${size}]`);
}

function triggerSizeModal(size) {
  if (size === 'sm') showModal("인증 검증 완료", "<p>✓ 전달된 정품 라이선스가 완벽 보증되었습니다.</p>", "sm");
  else if (size === 'md') showModal("시스템 고지", "<p>임시 등록 기록을 암호화하여 저장 관리합니다.</p>", "md");
  else if (size === 'lg') showModal("제어 스펙", "<p>[LOG-0312] Hardware sequence checked.</p>", "lg");
  else if (size === 'full') showModal("서비스 이용 가이드", "<p>모든 기능을 정기 검사하는 데모 모드입니다.</p>", "full");
}

function fireCustomToast() {
  createToast(
    document.getElementById("fcToastTitle")?.value || "테스트",
    document.getElementById("fcToastMsg")?.value || "성공",
    document.getElementById("fcToastType")?.value || "info"
  );
}

function fireCustomModal() {
  showModal(
    document.getElementById("fcModalTitle")?.value || "테스트",
    document.getElementById("fcModalBody")?.value || "성공",
    document.getElementById("fcModalSize")?.value || "md"
  );
}

function sendTestNotification() {
  createToast("알림 테스트", "이것은 전역 구성에 따른 실시간 송출 테스트입니다.", "success");
}

function applyModalTplShortcut(e) {
  const val = e.target.value;
  const body = document.getElementById("fcModalBody");
  if (!body) return;
  if(val === 'custom') body.value = "본 대시보드의 테스트 가상 노드는 정밀한 렌더러를 탑재합니다.";
  if(val === 'terms') body.value = "이용약관: 클라이언트 데이터 유지보수 권리 명시.\n제4조 사용자의 테마캐싱 규칙...";
  if(val === 'sysinfo') body.value = "하드웨어 ID: HW-F33\n세션 해시: SS-23A\n빌드: v1.0.0";
}

// ----------------------------------------------------
// Sandboxes
// ----------------------------------------------------
function saveSessionSandbox() {
   const key = document.getElementById("p1SessionKey")?.value;
   const val = document.getElementById("p1SessionVal")?.value;
   if(key && val) {
      sessionStorage.setItem('demo.sandbox.' + key, val);
      createToast("세션 데이터 캐싱", `[${key}] 데이터가 세션 캐시에 쓰였습니다.`, "success");
   }
}

function loadSessionSandbox() {
  let listHTML = "<ul>";
  for(let i=0; i<sessionStorage.length; i++) {
     let k = sessionStorage.key(i);
     if (k.startsWith("demo.sandbox.")) {
        listHTML += `<li><strong>${k.replace('demo.sandbox.','')}:</strong> ${sessionStorage.getItem(k)}</li>`;
     }
  }
  listHTML += "</ul>";
  showModal("저장된 세션 상태", listHTML.length > 9 ? listHTML : "데이터 없음", "sm");
}

// ----------------------------------------------------
// Theming & Registry
// ----------------------------------------------------
window.handleThemeSelect = function(themeId, isLocked) {
  if (isLocked) {
     createToast("라이선스 활성 필요", `'${themeId.toUpperCase()}' 테마는 Premium 프리셋으로 Standard 이상 에디션에서 사용 가능합니다.`, "warning");
     return;
  }
  applyAestheticTheme(themeId);
  renderDynamicThemesGrid();
}

function renderDynamicThemesGrid() {
  const lic = State.get().license?.edition || 'free';
  const isLocked = lic === 'free';
  const current = document.documentElement.getAttribute('data-theme') || 'dark';

  const html = DEFAULT_PRESETS.map(preset => {
    let lockedStr = preset.isPremium && isLocked;
    const activeClass = preset.id === current ? 'theme-btn--active' : '';
    const clickAttr = `onclick="window.handleThemeSelect('${preset.id}', ${lockedStr})"`;
    return `
      <button ${clickAttr} type="button" class="theme-btn ${activeClass}" style="background-color: ${preset.bg}; color: ${preset.text}; border-color: ${preset.border}">
         ${preset.icon} ${lockedStr ? '🔒 ' + preset.name : preset.name}
      </button>
    `;
  }).join('');
  
  const target1 = document.getElementById('presetThemesFeatures');
  const target2 = document.getElementById('presetThemesSettings');
  if(target1) target1.innerHTML = html;
  if(target2) target2.innerHTML = html;
}

function applyAestheticTheme(themeId, isStartup = false) {
  document.documentElement.setAttribute('data-theme', themeId);
  localStorage.setItem(CACHE_KEYS.THEME, themeId);
  if (!isStartup) {
     createToast("테마 변경 완료", `[${themeId.toUpperCase()}] 프리셋 활성`, "success");
     appendDiagLog('SUCCESS', `Render mode updated: Preset [${themeId}]`);
  }
  renderDynamicThemesGrid();
}

function saveUserCustomTheme() {
   const name = document.getElementById('cpThemeName')?.value || 'Custom Theme';
   const primary = document.getElementById('cpPrimary')?.value;
   const secondary = document.getElementById('cpSecondary')?.value;
   const accent = document.getElementById('cpAccent')?.value;

   const lic = State.get().license?.edition || 'free';
   let limit = 1;
   if(lic === 'standard') limit = 5;
   if(lic === 'pro') limit = 999;

   if (STATE.customThemes.length >= limit) {
      createToast("권한 초과", "선택한 에디션의 슬롯 한계에 도달했습니다.", "error");
      return;
   }

   STATE.customThemes.push({ id: 'usr-'+Date.now(), name, primary, secondary, accent });
   sessionStorage.setItem(CACHE_KEYS.CUSTOM_THEMES, JSON.stringify(STATE.customThemes));
   
   createToast("저장 완료", "커스텀 테마 슬롯 생성됨.", "success");
   renderGlobalCustomThemeSlots();
}

function renderGlobalCustomThemeSlots() {
   const shelf = document.getElementById('customThemesShelf');
   if(!shelf) return;
   
   const lic = State.get().license?.edition || 'free';
   let limit = 1;
   if(lic === 'standard') limit = 5;
   if(lic === 'pro') limit = '무제한';
   
   const quota = document.getElementById('customThemeQuota');
   if(quota) quota.textContent = `Free 슬롯: ${STATE.customThemes.length} / ${limit}`;

   if (STATE.customThemes.length === 0) {
      shelf.innerHTML = '<span class="text-secondary italic">저장된 사용자 지정 테마가 없습니다.</span>';
      return;
   }

   shelf.innerHTML = STATE.customThemes.map(t => `
     <div class="custom-theme-pill" style="border-left: 3px solid ${t.primary}">
       <button class="theme-apply-btn" data-name="${t.name}" data-p="${t.primary}" data-s="${t.secondary}" data-a="${t.accent}">${t.name}</button>
       <button class="theme-del-btn" data-id="${t.id}">&times;</button>
     </div>
   `).join('');
   
   renderGlobalStorageTableView();
}

function deleteCustomThemeSlot(id) {
   STATE.customThemes = STATE.customThemes.filter(t => t.id !== id);
   sessionStorage.setItem(CACHE_KEYS.CUSTOM_THEMES, JSON.stringify(STATE.customThemes));
   renderGlobalCustomThemeSlots();
}

function applyCustomCompiledColors(primary, secondary, accent, name) {
   document.documentElement.style.setProperty('--accent', primary);
   document.documentElement.style.setProperty('--bg-base', secondary);
   document.documentElement.style.setProperty('--bg-card', secondary);
   document.documentElement.style.setProperty('--bg-border', accent);
   createToast("적용 완료", `${name} 적용됨. (Custom CSS Vars)`, "success");
}

function autoFillLicKey(key) {
  const el = document.getElementById('licFormKey');
  if(el) el.value = key;
}

function validateLicSubmit() {
  const keyMatch = document.getElementById('licFormKey')?.value.toUpperCase();
  if(!keyMatch) { createToast("오류", "키를 입력해주세요.", "error"); return; }
  
  let match = 'Free';
  if(keyMatch.includes('PRO')) match = 'Pro';
  else if(keyMatch.includes('STD')) match = 'Standard';

  localStorage.setItem(CACHE_KEYS.LICENSE, match);
  State.setLicense({ edition: match.toLowerCase(), status: 'VALID' });
  applyLicGradeRendering(match);
  createToast("승급 확인", `${match} 에디션 활성화.`, "success");
  launchConfettiCelebration();
}

function launchConfettiCelebration() {
  const colors = ['#6366f1', '#10b981', '#3b82f6', '#f59e0b', '#ec4899'];
  for (let i = 0; i < 35; i++) {
    const el = document.createElement('div');
    el.style.position = 'absolute';
    el.style.pointerEvents = 'none';
    el.style.borderRadius = '50%';
    el.style.zIndex = '9999';
    const dim = Math.random() * 8 + 4;
    el.style.width = dim + 'px';
    el.style.height = dim + 'px';
    el.style.left = Math.random() * window.innerWidth + 'px';
    el.style.top = Math.random() * (window.innerHeight * 0.45) + 'px';
    el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    el.style.opacity = '0.82';
    el.style.transition = 'all 1.5s cubic-bezier(0.1, 0.9, 0.2, 1)';
    document.body.appendChild(el);
    
    // Simulate bounce falling
    setTimeout(() => {
        el.style.transform = `translateY(${Math.random() * 200 + 100}px)`;
        el.style.opacity = '0';
    }, 10);

    setTimeout(() => el.remove(), 1500);
  }
}

function applyLicGradeRendering(gradeStr) {
  const topBadge = document.getElementById('topBadgeEdition');
  const topStatus = document.getElementById('topStatusText');
  const sideEdition = document.getElementById('sideLicEdition');
  
  if(topBadge) topBadge.textContent = `Demo ${gradeStr}`;
  if(sideEdition) sideEdition.textContent = `Demo ${gradeStr}`;

  if(gradeStr === 'Pro') {
     if(topStatus) topStatus.textContent = '● 정품인증 (Demo Pro)';
  } else if (gradeStr === 'Standard') {
     if(topStatus) topStatus.textContent = '● 라이선스 활성 (Demo Standard)';
  } else {
     if(topStatus) topStatus.textContent = '● 미인증 (Demo Free)';
  }

  renderDynamicThemesGrid();
  renderGlobalCustomThemeSlots();
  renderGlobalStorageTableView();
}

function renderGlobalStorageTableView() {
  const target = document.getElementById("fsStorageList");
  if (!target) return;
  const items = [
    { k: 'demo.theme', v: localStorage.getItem(CACHE_KEYS.THEME) || 'dark' },
    { k: 'demo.license', v: localStorage.getItem(CACHE_KEYS.LICENSE) || 'Free' },
    { k: 'demo.settings', v: localStorage.getItem(CACHE_KEYS.SETTINGS) || '{}' },
    { k: 'demo.customThemes', v: `[${STATE.customThemes.length} slots]` }
  ];

  target.innerHTML = items.map(i => `
    <div class="storage-row text-xs flex justify-between border-b border-theme/30 p-1">
      <span class="text-primary font-bold">${i.k}</span>
      <span class="text-secondary">${i.v}</span>
    </div>
  `).join('');
}

function seedInitialMockRegistry() {
  localStorage.setItem(CACHE_KEYS.LICENSE, 'Standard');
  localStorage.setItem(CACHE_KEYS.THEME, 'midnight');
  location.reload();
}

function wipeAllMockRegistry() {
  localStorage.removeItem(CACHE_KEYS.LICENSE);
  localStorage.removeItem(CACHE_KEYS.THEME);
  localStorage.removeItem(CACHE_KEYS.SETTINGS);
  sessionStorage.removeItem(CACHE_KEYS.CUSTOM_THEMES);
  location.reload();
}
