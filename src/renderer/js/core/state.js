/**
 * @FileName     : state.js
 * @Description  : 전역 상태 SSOT — setter 경유 변경만 허용
 *                 setter 내부에서 body.dataset 갱신 + EventBus.emit
 *                 ※ IpcClient 의존 없음. 직접 mutation(STATE.x = ...) 금지
 * @Modification :
 *
 * 수정일         수정자      수정내용
 * ──────────── ───────── ───────────────────────────────
 * 2026.04.01.   develJan  최초생성
 * 2026.06.15.   develJan  IpcClient 의존 완전 제거, setter 순수화, setTheme async 제거
 *
 * @author  develJan
 * @since   2026.04.01
 * @version 1.1.0
 *
 * Copyright (C) 2026 by develJan Media All right reserved.
 */

import { EventBus } from './eventBus.js';

const _state = {
  edition   : 'standard',
  theme     : 'dark',
  activeTab : 'dashboard',
  license   : { status: 'NOT_FOUND', edition: null, payload: null },
  appInfo   : { name: '', version: '', isDev: false, platform: '', appId: '' },
};

/**
 * @description 에디션 설정 — body.dataset 동기화 + 이벤트 발행
 * @param {{ status: string, edition: string|null, payload: object|null }} result
 * @returns {void}
 */
function setLicense(result) {
  _state.license = result;
  const edition  = result.edition ?? 'standard';
  _state.edition = edition;
  document.body.dataset.edition = edition;
  EventBus.emit('state:license', result);
  EventBus.emit('state:edition', edition);
}

/**
 * @description 테마 설정 — body.dataset 동기화 + 이벤트 발행
 * @param {string} theme - 'light' | 'dark' | 'system'
 * @returns {void}
 */
function setTheme(theme) {
  const resolved = theme === 'system'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme;
  _state.theme = resolved;
  document.body.dataset.theme = resolved;
  EventBus.emit('state:theme', resolved);
}

/**
 * @description 활성 탭 설정 — body.dataset 동기화 + 이벤트 발행
 * @param {string} tab
 * @returns {void}
 */
function setActiveTab(tab) {
  _state.activeTab = tab;
  document.body.dataset.tab = tab;
  EventBus.emit('state:tab', tab);
}

/**
 * @description 앱 정보 저장
 * @param {object} info
 * @returns {void}
 */
function setAppInfo(info) {
  _state.appInfo = info;
  EventBus.emit('state:appInfo', info);
}

/**
 * @description 현재 상태 스냅샷 반환 (읽기 전용)
 * @returns {object}
 */
const get = () => ({ ..._state });

export const State = { setLicense, setTheme, setActiveTab, setAppInfo, get };
