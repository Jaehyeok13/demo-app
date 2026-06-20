/**
 * @FileName     : modal.view.js
 * @Description  : 모달 HTML 제어 + DOM 이벤트 바인딩
 *                 ※ 순환 import 방지 — module 콜백을 직접 받아 처리
 * @Modification :
 *
 * 수정일         수정자      수정내용
 * ──────────── ───────── ───────────────────────────────
 * 2026.06.15.   develJan  최초생성
 * 2026.06.16.   develJan  순환 import 제거 — callbacks 패턴으로 전환
 *
 * @author  develJan
 * @since   2026.06.15
 * @version 1.0.1
 *
 * Copyright (C) 2026 by develJan Media All right reserved.
 */

const $ = (id) => document.getElementById(id);

let _onConfirm = null;
let _onCancel  = null;

/**
 * @description 모달 뷰 초기화 — 버튼 이벤트 바인딩
 * @param {{ onConfirm: Function, onCancel: Function }} callbacks
 * @returns {void}
 */
export function init({ onConfirm, onCancel } = {}) {
  _onConfirm = onConfirm;
  _onCancel  = onCancel;

  $('btnModalConfirm')?.addEventListener('click', () => _onConfirm?.());
  $('btnModalCancel')?.addEventListener('click',  () => _onCancel?.());
  $('modalOverlay')?.addEventListener('click', (e) => {
    if (e.target === $('modalOverlay')) _onCancel?.();
  });
}

/**
 * @description 모달 내용 갱신
 * @param {string} title
 * @param {string} body
 * @returns {void}
 */
export function render(title, body) {
  const titleEl = $('modalTitle');
  const bodyEl  = $('modalBody');
  if (titleEl) titleEl.textContent = title;
  if (bodyEl)  bodyEl.textContent  = body;
}

/** @returns {void} */
export const show = () => $('modalOverlay')?.classList.remove('hidden');

/** @returns {void} */
export const hide = () => $('modalOverlay')?.classList.add('hidden');
