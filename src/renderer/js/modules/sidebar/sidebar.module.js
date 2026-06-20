/**
 * @FileName     : sidebar.module.js
 * @Description  : 사이드바 라이선스 카드 동기화 + 창 컨트롤 위임
 *                 ※ DOM 조작은 view 위임
 * @Modification :
 *
 * 수정일         수정자      수정내용
 * ──────────── ───────── ───────────────────────────────
 * 2026.06.15.   develJan  최초생성
 * 2026.06.16.   develJan  라이선스 상태 연동 추가
 *
 * @author  develJan
 * @since   2026.06.15
 * @version 1.1.0
 *
 * Copyright (C) 2026 by develJan Media All right reserved.
 */

import { EventBus }     from '../../core/eventBus.js';
import * as SidebarView from './views/sidebar.view.js';

/**
 * @description 사이드바 모듈 초기화
 * @returns {void}
 */
export function init() {
  console.log('[Sidebar] 초기화');
  SidebarView.init();

  // 라이선스 상태 변경 → 사이드바 카드 갱신
  EventBus.on('state:license', (result) => {
    const edition = result.edition ?? 'standard';
    const label   = edition === 'pro' ? 'Pro Edition' : 'Free Edition';
    const sub     = edition === 'pro' ? '모든 기능 사용 가능' : '일부 기능 제한';
    SidebarView.renderLicCard(label, sub);
  });
}
