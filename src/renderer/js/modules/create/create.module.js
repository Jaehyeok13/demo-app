/**
 * @FileName     : create.module.js
 * @Description  : 피처 그리드 + 활동 로그 + 시스템 상태 흐름 제어
 * @Modification :
 *
 * 수정일         수정자      수정내용
 * ──────────── ───────── ───────────────────────────────
 * 2026.06.15.   develJan  최초생성
 * 2026.06.16.   develJan  데모 UI 기준 재구성
 *
 * @author  develJan
 * @since   2026.06.15
 * @version 1.1.0
 *
 * Copyright (C) 2026 by develJan Media All right reserved.
 */

import { EventBus }       from '../../core/eventBus.js';
import * as CreateView    from './views/create.view.js';

/**
 * @description 모듈 초기화
 * @returns {void}
 */
export function init() {
  console.log('[Create] 초기화');

  // 뷰 초기화
  CreateView.init();
  CreateView.renderFeatureGrid();

  // 라이선스 변경 시 피처 그리드 갱신
  EventBus.on('state:edition', (edition) => {
    CreateView.updateEdition(edition);
    const label = edition === 'pro' ? 'Pro' : 'Free';
    CreateView.addActivity('primary', `${label} Edition으로 실행 중입니다.`);
    CreateView.appendLog('INFO', `Edition set to: ${edition}`);
  });

  // 부팅 로그 출력
  CreateView.appendLog('INFO', `Application started (v${_getVersion()})`);
  CreateView.appendLog('INFO', `Mode: ${window.electronAPI?.isDev ? 'development' : 'production'}`);
  CreateView.appendLog('WARN', 'License not verified');
}

/**
 * @description 외부에서 로그 추가
 * @param {'INFO'|'WARN'|'ERROR'} level
 * @param {string} message
 * @returns {void}
 */
export function log(level, message) {
  CreateView.appendLog(level, message);
}

/**
 * @description 외부에서 활동 추가
 * @param {string} type
 * @param {string} message
 * @returns {void}
 */
export function activity(type, message) {
  CreateView.addActivity(type, message);
}

function _getVersion() {
  return document.getElementById('appVersion')?.textContent?.replace('v', '') ?? '1.0.0';
}
