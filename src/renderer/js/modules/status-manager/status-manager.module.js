/**
 * @FileName     : status-manager.module.js
 * @Description  : 상태값 관리 흐름 제어 (Pro 전용)
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

import { can }   from '../../editions/featureLayer.js';
import { State } from '../../core/state.js';

export function init() {
  const { edition } = State.get();
  if (!can(edition, 'statusManager')) {
    console.log('[StatusManager] Standard Edition — 비활성화');
    return;
  }
  console.log('[StatusManager] Pro Edition — 초기화');
}
