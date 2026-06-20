/**
 * @FileName     : create.view.js
 * @Description  : 피처 그리드 + 활동 로그 + 시스템 상태 렌더링
 * @Modification :
 *
 * 수정일         수정자      수정내용
 * ──────────── ───────── ───────────────────────────────
 * 2026.06.15.   develJan  최초생성
 * 2026.06.16.   develJan  데모 UI 기준 피처 그리드/활동/로그 구현
 *
 * @author  develJan
 * @since   2026.06.15
 * @version 1.1.0
 *
 * Copyright (C) 2026 by develJan Media All right reserved.
 */

const $ = (id) => document.getElementById(id);

const FEATURES = [
  { icon: '📊', name: '기본 데이터 조회', desc: '기본 데이터를 조회하고 관리합니다.', pro: false },
  { icon: '📄', name: 'CSV 내보내기',     desc: '데이터를 CSV 파일로 내보냅니다.',    pro: false },
  { icon: '📈', name: '고급 차트',        desc: '다양한 고급 차트와 분석 기능을 제공합니다.', pro: true },
  { icon: '📋', name: 'PDF 출력',         desc: '보고서를 PDF 파일로 저장합니다.',      pro: true },
  { icon: '🔗', name: 'API 연동',         desc: '외부 서비스와 연동합니다.',             pro: true },
  { icon: '💾', name: '자동 백업',        desc: '데이터를 자동으로 백업합니다.',         pro: true },
];

const _activities = [];

/**
 * @description 뷰 초기화 — 로그 지우기, 활동 초기값 세팅
 * @param {object} callbacks
 * @returns {void}
 */
export function init(callbacks = {}) {
  $('btnClearLogs')?.addEventListener('click', () => {
    const el = $('realtimeLogs');
    if (el) el.innerHTML = '';
  });

  // 시작 활동 기록
  _addActivity('success', '앱을 시작했습니다.');
}

/**
 * @description 피처 그리드 렌더링 (대시보드 + 전체 기능 탭)
 * @returns {void}
 */
export function renderFeatureGrid() {
  const edition = document.body.dataset.edition ?? 'standard';
  _renderGrid('dashFeatureGrid', FEATURES.slice(0, 5), edition);
  _renderGrid('fullFeatureGrid', FEATURES, edition);
}

/**
 * @description 에디션 변경 시 피처 그리드 갱신
 * @param {string} edition
 * @returns {void}
 */
export function updateEdition(edition) {
  _renderGrid('dashFeatureGrid', FEATURES.slice(0, 5), edition);
  _renderGrid('fullFeatureGrid', FEATURES, edition);
}

/**
 * @description 활동 항목 추가
 * @param {'success'|'primary'|'warning'|'danger'} type
 * @param {string} message
 * @returns {void}
 */
export function addActivity(type, message) {
  _addActivity(type, message);
}

/**
 * @description 실시간 로그 한 줄 추가
 * @param {'INFO'|'WARN'|'ERROR'} level
 * @param {string} message
 * @returns {void}
 */
export function appendLog(level, message) {
  const container = $('realtimeLogs');
  if (!container) return;
  const time = new Date().toLocaleTimeString('ko-KR', { hour12: false });
  const cls  = level === 'WARN' ? 'log-line--warn'
             : level === 'ERROR' ? 'log-line--error'
             : 'log-line--info';
  const line = document.createElement('div');
  line.className   = `log-line ${cls}`;
  line.textContent = `[${time}] [${level}] ${message}`;
  container.appendChild(line);
  container.scrollTop = container.scrollHeight;
}

/**
 * @description 토스트 메시지 표시
 * @param {string} msg
 * @param {'success'|'error'|'warning'} type
 * @returns {void}
 */
export function showToast(msg, type = 'success') {
  const c = $('toastContainer');
  if (!c) return;
  const t = document.createElement('div');
  t.className   = `toast toast--${type}`;
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

// ── Private ──────────────────────────────────────────

function _renderGrid(containerId, features, edition) {
  const container = $(containerId);
  if (!container) return;
  container.innerHTML = features.map(f => {
    const locked = f.pro && edition !== 'pro';
    const badge  = f.pro
      ? `<span class="feat-card__badge feat-card__badge--pro">PRO</span>`
      : `<span class="feat-card__badge feat-card__badge--free">FREE</span>`;
    const action = locked
      ? `<div class="feat-card__lock">🔒 Pro 필요</div>`
      : `<button class="btn btn--primary btn--sm">사용하기</button>`;
    return `<div class="feat-card ${locked ? 'feat-card--locked' : 'feat-card--active'}">
      <div class="feat-card__icon">${f.icon}</div>
      ${badge}
      <div class="feat-card__name">${f.name}</div>
      <div class="feat-card__desc">${f.desc}</div>
      ${action}
    </div>`;
  }).join('');
}

function _addActivity(type, message) {
  const container = $('activityList');
  if (!container) return;
  const time = new Date().toLocaleTimeString('ko-KR', { hour12: false });
  const item = document.createElement('div');
  item.className = 'activity-item';
  item.innerHTML = `
    <span class="dot dot--${type}"></span>
    <span>${message}</span>
    <span class="activity-item__time">${time}</span>`;
  container.appendChild(item);
}
