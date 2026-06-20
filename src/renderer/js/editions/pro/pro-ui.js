/**
 * @FileName     : pro-ui.js
 * @Description  : Pro Edition 전용 UI 초기화
 *                 FeatureLayer.init('pro') 이후 호출됨
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

import { EventBus } from '../../core/eventBus.js';

/**
 * @description Pro 전용 UI 초기화
 * @returns {void}
 */
export function init() {
  console.log('[ProUI] Pro Edition UI 초기화');
  // Pro 전용 패널/기능 활성화
  // tag-manager, status-manager 등은 각 module.init() 에서 처리
  EventBus.emit('pro:ready', true);
}
