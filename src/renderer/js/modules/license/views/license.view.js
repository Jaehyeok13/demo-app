/**
 * @FileName     : license.view.js
 * @Description  : 라이선스 UI 렌더링 + DOM 이벤트 바인딩
 *                 ※ IPC 호출 금지 / 비즈니스 로직 금지 / state mutation 금지
 * @Modification :
 *
 * 수정일         수정자      수정내용
 * ──────────── ───────── ───────────────────────────────
 * 2026.06.15.   develJan  최초생성
 * 2026.06.16.   develJan  데모 UI 기준 전체 갱신 대상 id 반영
 *
 * @author  develJan
 * @since   2026.06.15
 * @version 1.1.0
 *
 * Copyright (C) 2026 by develJan Media All right reserved.
 */

const $ = (id) => document.getElementById(id);

/**
 * @description 뷰 초기화 — 버튼 이벤트 바인딩
 * @param {{ onVerify, onDevBypass, onDevReset }} callbacks
 * @returns {void}
 */
export function init({ onVerify, onDevBypass, onDevReset } = {}) {
  $('btnVerify')?.addEventListener('click', () => {
    onVerify?.($('licInput')?.value ?? '');
  });

  $('licInput')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') onVerify?.(e.target.value ?? '');
  });

  $('btnDevStandard')?.addEventListener('click', () => onDevBypass?.('standard'));
  $('btnDevPro')?.addEventListener('click',      () => onDevBypass?.('pro'));
  $('btnDevReset')?.addEventListener('click',    () => onDevReset?.());
}

/**
 * @description HWID 표시 (상단 16자)
 * @param {string} hwid
 * @returns {void}
 */
export function renderHwid(hwid) {
  const short = hwid?.slice(0, 16) ?? '-';
  const set = (id, val) => { const el = $(id); if (el) el.textContent = val; };
  set('licHwid',    hwid ?? '-');
  set('footerHwid', short);
}

/**
 * @description 라이선스 상태 UI 전체 갱신
 * @param {{ editionText, statusText, expiryText, statusClass }} parsed
 * @returns {void}
 */
export function renderStatus({ editionText, statusText, expiryText, statusClass }) {
  const set = (id, val) => { const el = $(id); if (el) el.textContent = val; };

  // 설정 탭
  set('licEdition', editionText);
  set('licStatus',  statusText);
  set('licExpiry',  expiryText);

  // 상단 상태 pill
  set('topStatusText',    statusText);
  set('topBadgeEdition',  editionText);

  // 사이드바
  set('sideLicEdition', editionText);

  // licStatus 색상 클래스 교체
  const statusEl = $('licStatus');
  if (statusEl) {
    statusEl.className = `lic-status-item__value ${statusClass}`;
  }

  // 상태 pill dot 색상
  const pill = $('topStatusPill');
  if (pill) {
    pill.classList.toggle('status-pill--valid', statusClass.includes('success'));
  }
}

/**
 * @description 인증 버튼 로딩 상태
 * @param {boolean} loading
 * @returns {void}
 */
export function setLoading(loading) {
  const btn = $('btnVerify');
  if (!btn) return;
  btn.disabled    = loading;
  btn.textContent = loading ? '인증 중...' : '인증하기';
}

/**
 * @description 토스트 메시지 표시
 * @param {string} message
 * @param {'success'|'error'|'warning'} type
 * @returns {void}
 */
export function showMessage(message, type = 'success') {
  const c = $('toastContainer');
  if (!c) return;
  const t = document.createElement('div');
  t.className   = `toast toast--${type}`;
  t.textContent = message;
  c.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}
