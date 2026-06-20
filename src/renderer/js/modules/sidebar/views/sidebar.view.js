/**
 * @FileName     : sidebar.view.js
 * @Description  : 사이드바 DOM 이벤트 바인딩 + 라이선스 카드 렌더링
 *                 ※ IPC 호출 금지 / 비즈니스 로직 금지
 * @Modification :
 *
 * 수정일         수정자      수정내용
 * ──────────── ───────── ───────────────────────────────
 * 2026.06.15.   develJan  최초생성
 * 2026.06.16.   develJan  창 컨트롤 바인딩 추가
 *
 * @author  develJan
 * @since   2026.06.15
 * @version 1.1.0
 *
 * Copyright (C) 2026 by develJan Media All right reserved.
 */

const $ = (id) => document.getElementById(id);

/**
 * @description 사이드바 뷰 초기화 — 창 컨트롤 버튼 바인딩
 * @returns {void}
 */
export function init() {
  $('btnMin')?.addEventListener('click',   () => window.electronAPI?.send('win:minimize'));
  $('btnMax')?.addEventListener('click',   () => window.electronAPI?.send('win:maximize'));
  $('btnClose')?.addEventListener('click', () => window.electronAPI?.send('win:close'));
}

/**
 * @description 사이드바 라이선스 카드 갱신
 * @param {string} editionLabel
 * @param {string} subLabel
 * @returns {void}
 */
export function renderLicCard(editionLabel, subLabel) {
  const edEl  = $('sideLicEdition');
  const subEl = document.querySelector('.lic-card__sub');
  if (edEl)  edEl.textContent  = editionLabel;
  if (subEl) subEl.textContent = subLabel;
}
