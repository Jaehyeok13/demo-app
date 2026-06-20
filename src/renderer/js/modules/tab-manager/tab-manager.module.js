/**
 * @FileName     : tab-manager.module.js
 * @Description  : 탭 전환 — [data-tab-trigger] / [data-tab-content] 기반
 *                 View 불필요 — 구조가 단순하여 module에서 DOM 이벤트 위임만 처리
 * @Modification :
 *
 * 수정일         수정자      수정내용
 * ──────────── ───────── ───────────────────────────────
 * 2026.06.15.   develJan  최초생성
 * 2026.06.16.   develJan  EventBus 'tab:switch' 연동 추가
 *
 * @author  develJan
 * @since   2026.06.15
 * @version 1.1.0
 *
 * Copyright (C) 2026 by develJan Media All right reserved.
 */

import { State }    from '../../core/state.js';
import { EventBus } from '../../core/eventBus.js';

/**
 * @description 탭 매니저 초기화
 * @returns {void}
 */
export function init() {
  console.log('[TabManager] 초기화');

  // 클릭 이벤트 위임 — data-tab 속성 기반
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-tab]');
    if (!trigger) return;
    const tab = trigger.dataset.tab;
    if (tab) switchTab(tab);
  });

  // EventBus로 외부에서 탭 전환 가능
  EventBus.on('tab:switch', (tab) => switchTab(tab));

  // State 변경 → UI 동기화
  EventBus.on('state:tab', (tab) => _updateUI(tab));
}

/**
 * @description 탭 전환 실행
 * @param {string} tab
 * @returns {void}
 */
export function switchTab(tab) {
  State.setActiveTab(tab);
}

/**
 * @description 탭 UI 갱신 — trigger active / content 표시
 * @param {string} tab
 * @returns {void}
 */
function _updateUI(tab) {
  // 탑바 탭 버튼
  document.querySelectorAll('[data-tab]').forEach(el => {
    el.classList.toggle('active', el.dataset.tab === tab);
  });

  // 콘텐츠 패널
  document.querySelectorAll('[data-role="tab-panel"]').forEach(el => {
    el.classList.toggle('active', el.id === `content-${tab}`);
  });
}
