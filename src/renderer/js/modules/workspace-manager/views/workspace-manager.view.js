/**
 * @FileName     : workspace-manager.view.js
 * @Description  : 워크스페이스 목록 렌더링 + DOM 이벤트 바인딩
 * @Modification :
 *
 * 수정일         수정자      수정내용
 * ──────────── ───────── ───────────────────────────────
 * 2026.06.15.   develJan  최초생성
 *
 * @author  develJan
 * @since   2026.06.15
 * @version 1.0.0
 *
 * Copyright (C) 2026 by develJan Media All right reserved.
 */

let _callbacks = {};

export function init(callbacks = {}) { _callbacks = callbacks; }

/**
 * @description 아이템 목록 렌더링
 * @param {Array} items
 * @returns {void}
 */
export function render(items) {
  console.log('[WorkspaceView] 렌더링, 아이템 수:', items.length);
}
