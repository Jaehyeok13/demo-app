/**
 * @FileName     : settings.view.js
 * @Description  : 설정 관련 DOM 이벤트 바인딩
 *                 ※ IPC 호출 금지 / 비즈니스 로직 금지
 * @Modification :
 *
 * 수정일         수정자      수정내용
 * ──────────── ───────── ───────────────────────────────
 * 2026.06.15.   develJan  최초생성
 * 2026.06.16.   develJan  테마 토글 버튼 바인딩
 *
 * @author  develJan
 * @since   2026.06.15
 * @version 1.1.0
 *
 * Copyright (C) 2026 by develJan Media All right reserved.
 */

const $ = (id) => document.getElementById(id);

/**
 * @description 뷰 초기화 — 테마 토글 버튼 바인딩
 * @param {{ onThemeToggle: Function }} callbacks
 * @returns {void}
 */
export function init({ onThemeToggle } = {}) {
  $('btnThemeToggle')?.addEventListener('click', () => onThemeToggle?.());
}

/**
 * @description 테마 버튼 아이콘 갱신
 * @param {string} theme
 * @returns {void}
 */
export function updateThemeBtn(theme) {
  const btn = $('btnThemeToggle');
  if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}
