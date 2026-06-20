/**
 * @FileName     : ipcClient.js
 * @Description  : window.electronAPI 래퍼 — 에러 처리 일원화
 *                 ※ 모듈에서 window.electronAPI 직접 호출 금지
 * @Modification :
 *
 * 수정일         수정자      수정내용
 * ──────────── ───────── ───────────────────────────────
 * 2026.04.01.   develJan  최초생성
 * 2026.06.15.   develJan  bpasAPI → electronAPI, item/settings 네임스페이스 신설
 *
 * @author  develJan
 * @since   2026.04.01
 * @version 1.1.0
 *
 * Copyright (C) 2026 by develJan Media All right reserved.
 */

const api = window.electronAPI;
if (!api) throw new Error('[IpcClient] window.electronAPI 를 찾을 수 없습니다. preload.js 로드 여부를 확인하세요.');

/**
 * @description IPC 호출 공통 래퍼 — 에러 로깅 일원화
 * @param {Function} fn
 * @param {string} label
 * @returns {Promise<*>}
 */
async function _call(fn, label) {
  try {
    return await fn();
  } catch (err) {
    console.error(`[IpcClient] ${label} 호출 실패:`, err);
    throw err;
  }
}

const ipcClient = {

  // ── 라이선스 ─────────────────────────────────────
  license: {
    /** @returns {Promise<string>} HWID */
    getHwid  : ()        => _call(() => api.license.getHwid(),     'license.getHwid'),
    /** @returns {Promise<object>} { status, edition, payload } */
    getStatus: ()        => _call(() => api.license.getStatus(),   'license.getStatus'),
    /** @returns {Promise<object>} { status, edition, payload } */
    verify   : (key)     => _call(() => api.license.verify(key),   'license.verify'),
    /** @returns {Promise<object>} */
    devBypass: (edition) => _call(() => api.license.devBypass(edition), 'license.devBypass'),
    /** @returns {Promise<object>} */
    devReset : ()        => _call(() => api.license.devReset(),    'license.devReset'),
  },

  // ── 설정 ─────────────────────────────────────────
  settings: {
    /** @returns {Promise<*>} */
    get   : (key)        => _call(() => api.settings.get(key),          'settings.get'),
    /** @returns {Promise<object>} */
    set   : (key, value) => _call(() => api.settings.set(key, value),   'settings.set'),
    /** @returns {Promise<object>} */
    getAll: ()           => _call(() => api.settings.getAll(),          'settings.getAll'),
    /** @returns {Promise<object>} */
    reset : ()           => _call(() => api.settings.reset(),           'settings.reset'),
  },

  // ── 아이템 ───────────────────────────────────────
  item: {
    /** @returns {Promise<Array>} */
    getAll: ()           => _call(() => api.item.getAll(),              'item.getAll'),
    /** @returns {Promise<object|null>} */
    get   : (id)         => _call(() => api.item.get(id),              'item.get'),
    /** @returns {Promise<object>} */
    create: (data)       => _call(() => api.item.create(data),         'item.create'),
    /** @returns {Promise<object>} */
    update: (id, data)   => _call(() => api.item.update(id, data),     'item.update'),
    /** @returns {Promise<object>} */
    delete: (id)         => _call(() => api.item.delete(id),           'item.delete'),
  },

  // ── 앱 ───────────────────────────────────────────
  app: {
    /** @returns {Promise<object>} { name, version, isDev, platform, appId } */
    getVersion : ()        => _call(() => api.app.getVersion(),         'app.getVersion'),
    /** @returns {Promise<object>} { userData, logs } */
    getPath    : ()        => _call(() => api.app.getPath(),            'app.getPath'),
    /** @returns {Promise<object>} */
    showDialog : (options) => _call(() => api.app.showDialog(options),  'app.showDialog'),
    /** @returns {Promise<void>} */
    restart    : ()        => _call(() => api.app.restart(),            'app.restart'),
  },

  // ── 환경 정보 ────────────────────────────────────
  platform: api.platform,
  isDev   : api.isDev,

  // ── 이벤트 수신 ──────────────────────────────────
  /**
   * @description 메인 프로세스 이벤트 구독
   * @param {string} channel
   * @param {Function} fn
   * @returns {Function} unsubscribe
   */
  on: (channel, fn) => api.on(channel, fn),
};

export default ipcClient;
