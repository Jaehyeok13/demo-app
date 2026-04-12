'use strict';

const api = window.electronAPI;

  // ── [로그 그룹] 앱 시작 ────────────────────────────
console.group('🚀 [Renderer] Application Starting');
console.info('Platform:', api.platform);
console.info('Initial isDev (from preload):', api.isDev);
console.groupEnd();

const FEATURES = [
  { id: 'view_basic',  name: '기본 뷰',       icon: '📊', tier: 'free', desc: '기본 데이터 조회' },
  { id: 'csv_export',  name: 'CSV 내보내기',  icon: '📥', tier: 'free', desc: 'CSV 형식 내보내기' },
  { id: 'adv_chart',   name: '고급 차트',     icon: '📈', tier: 'pro',  desc: '시계열 / 비교 분석' },
  { id: 'pdf_export',  name: 'PDF 출력',      icon: '📄', tier: 'pro',  desc: '보고서 PDF 저장' },
  { id: 'auto_backup', name: '자동 백업',      icon: '💾', tier: 'pro',  desc: '스케줄 자동 백업' },
  { id: 'api_sync',    name: 'API 연동',      icon: '🔄', tier: 'pro',  desc: '외부 서비스 연동' },
];

const RESULTS = {
  view_basic : `[📊 기본 뷰] ✅ 실행됨\n───────────────\n항목 A : 1,240\n항목 B : 856\n합계   : 2,096`,
  csv_export : `[📥 CSV] ✅ 실행됨\n───────────────\nexport_${Date.now()}.csv 저장\n총 1,024행`,
  adv_chart  : `[📈 고급 차트] ✅ Pro 기능\n───────────────\n시계열 12개월\n트렌드 +14.2%`,
  pdf_export : `[📄 PDF] ✅ Pro 기능\n───────────────\n4페이지 생성 완료`,
  auto_backup: `[💾 자동 백업] ✅ Pro 기능\n───────────────\n매일 02:00 스케줄`,
  api_sync   : `[🔄 API 연동] ✅ Pro 기능\n───────────────\n342건 동기화 / 1.2s`,
};

let _edition = null;
let _hwid    = null;

  // ══════════════════════════════════════════════
  // 이벤트 바인딩
  // ══════════════════════════════════════════════
function setupEventListeners() {
  console.group('🔗 [Renderer] Setting up Event Listeners');
  
  try {
    document.getElementById('btnMin').addEventListener('click',   () => api.send('win:minimize'));
    document.getElementById('btnMax').addEventListener('click',   () => api.send('win:maximize'));
    document.getElementById('btnClose').addEventListener('click', () => api.send('win:close'));

    document.querySelectorAll('.tab').forEach(tab =>
      tab.addEventListener('click', () => switchTab(tab))
    );

    document.getElementById('btnCopyHwid').addEventListener('click', copyHwid);
    document.getElementById('btnRegister').addEventListener('click', registerLicense);
    
    document.querySelectorAll('.btnToggleKey').forEach(btn => {
      btn.addEventListener('click', toggleLicenseKey);
    });
    document.querySelectorAll('.btnCopyKey').forEach(btn => {
      btn.addEventListener('click', copyLicenseKey);
    });

      // 개발 모드 우회 버튼 (isDev 체크 없이 요소 존재 여부로 등록)
    const btnFree  = document.getElementById('bypassFree');
    const btnPro   = document.getElementById('bypassPro');
    const btnReset = document.getElementById('bypassReset');

    if (btnFree)  btnFree.addEventListener('click',  () => devBypass('free'));
    if (btnPro)   btnPro.addEventListener('click',   () => devBypass('pro'));
    if (btnReset) btnReset.addEventListener('click', () => devReset());

    console.info('✅ 모든 이벤트 리스너 등록 완료');
  } catch (err) {
    console.error('❌ 리스너 등록 중 오류:', err.message);
  }
  
  console.groupEnd();
}

  // ══════════════════════════════════════════════
  // 초기화
  // ══════════════════════════════════════════════
async function init() {
  console.group('🏁 [Renderer] Initializing App');
  try {
    const info = await api.app.getInfo();
    console.info('앱 정보 수신:', info);
    
    document.getElementById('appLogo').textContent   = `🗓️ ${info.name}`;
                            document.title           = info.name;
    document.getElementById('infoAppId').textContent = info.appId;
    document.getElementById('infoMode').textContent  = info.mode;

    const mb             = document.getElementById('modeBadge');
          mb.textContent = info.mode;
    if (info.isDev) {
      mb.classList.add('dev');
      document.getElementById('devPanel').style.display = 'block';
      console.info('🛠️ Dev Panel Enabled');
    }

    _hwid = await api.license.getHwid();
    console.info('HWID 수신:', _hwid);
    document.getElementById('licHwid').textContent   = _hwid;
    document.getElementById('hwidShort').textContent = 'HWID: ' + _hwid.substring(0, 12) + '…';

    const status = await api.license.getStatus();
    console.info('라이선스 상태 수신:', status);
    applyLicense(status);
  } catch (err) {
    console.error('초기화 중 오류:', err);
  } finally {
    console.groupEnd();
  }
}

function applyLicense(result) {
  console.group('[Renderer] applyLicense()');
  console.info('상태:', result.status, '에디션:', result.edition);
  
  _edition = result.status === 'VALID' ? result.edition : null;

  const eb             = document.getElementById('editionBadge');
        eb.className   = 'edition-badge ' + (_edition || '');
        eb.textContent = _edition ? _edition.toUpperCase() : '미인증';

  const dotCls = { VALID:'ok', EXPIRED:'warn', NOT_FOUND:'', INVALID:'err', HWID_MISMATCH:'err', APP_MISMATCH:'err' };
  const txtMap = {
    VALID        : `✅ 인증됨 (${(_edition||'').toUpperCase()})`,
    EXPIRED      : '⚠️ 라이선스 만료됨',
    HWID_MISMATCH: '❌ HWID 불일치 — 이 PC에서 사용 불가',
    APP_MISMATCH : '❌ 다른 앱의 라이선스',
    NOT_FOUND    : '미인증 — 라이선스 탭에서 키를 입력하세요',
    INVALID      : '❌ 유효하지 않은 라이선스',
  };
  document.getElementById('statusDot').className    = 'dot ' + (dotCls[result.status] || '');
  document.getElementById('statusText').textContent = txtMap[result.status] || '알 수 없는 상태';

  document.getElementById('infoEdition').textContent   = _edition ? _edition.toUpperCase(): '—';
  document.getElementById('infoExpiry').textContent    = 
                          result.payload?.expiry     === 'PERMANENT' ? '영구'
    :  result.payload?.expiry ? result.payload.expiry.substring(0, 10): '—';

  const bMap           = { VALID:'ok', EXPIRED:'warn', NOT_FOUND:'none', INVALID:'fail', HWID_MISMATCH:'fail', APP_MISMATCH:'fail' };
  const lMap           = { VALID:'✅ 인증됨', EXPIRED:'⚠️ 만료됨', NOT_FOUND:'미인증', INVALID:'❌ 오류', HWID_MISMATCH:'❌ HWID 불일치', APP_MISMATCH:'❌ 앱 불일치' };
  const sb             = document.getElementById('licStatusBadge');
        sb.className   = 'lic-status-badge ' + (bMap[result.status] || 'none');
        sb.textContent = lMap[result.status] || '미인증';

  const edLabel     = document.getElementById('licEdLabel');
  const expRow      = document.getElementById('licExpRow');
  const mainKeyCard = document.getElementById('mainKeyCard');
  const licKeyCard  = document.getElementById('licKeyCard');

  if (_edition) {
                            edLabel.textContent          = _edition.toUpperCase();
                            expRow.style.display         = 'flex';
    document.getElementById('licExpLabel').textContent   = 
                            result.payload?.expiry     === 'PERMANENT' ? '영구' : result.payload?.expiry?.substring(0,10) || '—';
    
      // 인증된 키 표시
    if (result.key) {
      console.info('🔑 License Key found, updating cards');
      [mainKeyCard, licKeyCard].forEach(card => {
        if (card) {
                             card.style.borderColor    = 'var(--go)';
          card.querySelector('.lic-lbl').style.color   = 'var(--go)';
          card.querySelector('.maskedKey').textContent = '••••-••••-••••-••••';
          card.querySelector('.realKey').textContent   = result.key;
        }
      });
      resetKeyVisibility();
    } else {
      console.warn('⚠️ License Key missing in result');
      [mainKeyCard, licKeyCard].forEach(card => {
        if (card) {
                             card.style.borderColor    = 'var(--bd)';
          card.querySelector('.lic-lbl').style.color   = 'var(--t2)';
          card.querySelector('.maskedKey').textContent = '인증 전';
          card.querySelector('.realKey').textContent   = '';
        }
      });
    }
  } else {
    edLabel.textContent  = '';
    expRow.style.display = 'none';
    [mainKeyCard, licKeyCard].forEach(card => {
      if (card) {
                           card.style.borderColor    = 'var(--bd)';
        card.querySelector('.lic-lbl').style.color   = 'var(--t2)';
        card.querySelector('.maskedKey').textContent = '인증 전';
        card.querySelector('.realKey').textContent   = '';
      }
    });
  }

  renderFeatures();
  console.groupEnd();
}

function toggleLicenseKey(e) {
  const card     = e.target.closest('.lic-card');
  const masked   = card.querySelector('.maskedKey');
  const real     = card.querySelector('.realKey');
  const btn      = card.querySelector('.btnToggleKey');
  const isHidden = real.style.display === 'none';

  if (isHidden) {
    real.style.display   = 'inline';
    masked.style.display = 'none';
    btn.textContent      = '🙈 숨기기';
  } else {
    real.style.display   = 'none';
    masked.style.display = 'inline';
    btn.textContent      = '👁️ 보기';
  }
}

function resetKeyVisibility() {
  document.querySelectorAll('.realKey').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.maskedKey').forEach(el => el.style.display = 'inline');
  document.querySelectorAll('.btnToggleKey').forEach(el => el.textContent = '👁️ 보기');
}

async function copyLicenseKey(e) {
  const card = e.target.closest('.lic-card');
  const key  = card.querySelector('.realKey').textContent;
  await navigator.clipboard.writeText(key);
  toast('라이선스 키 복사됨', 'success');
}

function switchTab(el) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('tab-' + el.dataset.tab).classList.add('active');
}

function renderFeatures() {
  document.getElementById('featGrid').innerHTML = FEATURES.map(f => {
    const ok       = _edition === 'pro' || f.tier === 'free';
    const tierHtml = f.tier   === 'pro'
      ? `<span class="feat-tier ${ok ? 'pro' : 'lock'}">${ok ? 'PRO' : '🔒 PRO'}</span>`
      :  `<span class="feat-tier free">FREE</span>`;
    return `<div class="feat-card ${ok ? '' : 'locked'}">
      ${tierHtml}
      <div class = "feat-icon">${f.icon}</div>
      <div class = "feat-name">${f.name}</div>
      <div class = "feat-desc">${f.desc}</div>
    </div>`;
  }).join('');

  const rb           = document.getElementById('runBtns');
        rb.innerHTML = FEATURES.map(f => {
    const ok  = _edition === 'pro' || f.tier === 'free';
    const cls = (ok && f.tier === 'pro') ? 'pro-btn' : '';
    return `<button class="${cls}" data-feat="${f.id}">${f.icon} ${f.name}</button>`;
  }).join('');

  const newRb = rb.cloneNode(true);
  rb.parentNode.replaceChild(newRb, rb);
  newRb.addEventListener('click', e => {
    const btn = e.target.closest('[data-feat]');
    if (btn) runFeature(btn.dataset.feat);
  });
}

function runFeature(id) {
  console.group(`[Renderer] runFeature(${id})`);
  const f   = FEATURES.find(x => x.id === id);
  const out = document.getElementById('runOut');
  const ok  = _edition === 'pro' || f.tier === 'free';

  if (!_edition) {
    console.warn('인증 필요');
    out.textContent = `[${f.icon} ${f.name}]\n⛔ 라이선스 인증이 필요합니다.`;
    out.style.color = 'var(--r)';
    console.groupEnd();
    return;
  }
  if (!ok) {
    console.warn('Pro 전용 기능 접근 차단');
    out.textContent = `[${f.icon} ${f.name}]\n🔒 Pro 라이선스 전용 기능입니다.`;
    out.style.color = 'var(--r)';
    console.groupEnd();
    return;
  }
  console.info('기능 실행 성공');
  out.textContent = RESULTS[id] || `[${f.name}] ✅ 실행됨`;
  out.style.color = 'var(--g)';
  console.groupEnd();
}

async function copyHwid() {
  await navigator.clipboard.writeText(_hwid || '');
  toast('HWID 복사됨', 'success');
}

async function registerLicense() {
  console.group('[Renderer] registerLicense()');
  const key   = document.getElementById('licInput').value.trim();
  const resEl = document.getElementById('licResult');
  if (!key) {
    toast('키를 입력하세요', 'error');
    console.groupEnd();
    return;
  }

  try {
    const result = await api.license.register(key);
    console.info('등록 결과:', result.status);
    
    const msgMap = {
      VALID        : { cls:'ok',   msg:`✅ 인증 성공!\n에디션: ${result.edition?.toUpperCase()}` },
      EXPIRED      : { cls:'warn', msg:'⚠️ 만료된 라이선스입니다.' },
      HWID_MISMATCH: { cls:'fail', msg:`❌ 이 PC에서 사용할 수 없습니다.` },
      APP_MISMATCH : { cls:'fail', msg:`❌ 다른 앱의 라이선스입니다.` },
      INVALID      : { cls:'fail', msg:'❌ 유효하지 않은 키입니다.' },
    };
    const m                   = msgMap[result.status] || { cls:'fail', msg:'알 수 없는 오류' };
          resEl.className     = 'lic-result ' + m.cls;
          resEl.textContent   = m.msg;
          resEl.style.display = 'block';

    if (result.status === 'VALID') {
      applyLicense(result);
      toast('✅ 인증 완료!', 'success');
    }
  } catch (err) {
    console.error('등록 중 오류:', err);
  } finally {
    console.groupEnd();
  }
}

async function devBypass(edition) {
  console.group(`🔓 [Renderer] devBypass(${edition})`);
  try {
    console.info('메인 프로세스에 우회 요청 중...');
    const result = await api.license.devBypass(edition);
    console.info('우회 결과:', result);
    applyLicense(result);
    toast(`🔓 DEV 우회 인증 — ${edition.toUpperCase()}`, 'success');
  } catch (err) {
    console.error('우회 중 오류:', err);
  } finally {
    console.groupEnd();
  }
}

async function devReset() {
  console.info('[Renderer] devReset()');
  applyLicense({ status: 'NOT_FOUND', edition: null, payload: null });
  toast('↩ 라이선스 초기화 (메모리만)', 'success');
}

function toast(msg, type = '') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'show ' + type;
  clearTimeout(el._t);
  el._t = setTimeout(() => el.className = '', 2400);
}

setupEventListeners();
init();
