/**
 * @FileName     : eventBus.js
 * @Description  : 모듈 간 이벤트 통신 (on/off/emit/once)
 * @Modification :
 *
 * 수정일         수정자      수정내용
 * ──────────── ───────── ───────────────────────────────
 * 2026.04.01.   develJan  최초생성
 *
 * @author  develJan
 * @since   2026.04.01
 * @version 1.0.0
 *
 * Copyright (C) 2026 by develJan Media All right reserved.
 */

const _listeners = new Map();

/**
 * @description 이벤트 구독
 * @param {string} event
 * @param {Function} fn
 * @returns {void}
 */
const on = (event, fn) => {
  if (!_listeners.has(event)) _listeners.set(event, new Set());
  _listeners.get(event).add(fn);
};

/**
 * @description 이벤트 구독 해제
 * @param {string} event
 * @param {Function} fn
 * @returns {void}
 */
const off = (event, fn) => {
  _listeners.get(event)?.delete(fn);
};

/**
 * @description 이벤트 발행
 * @param {string} event
 * @param {*} payload
 * @returns {void}
 */
const emit = (event, payload) => {
  _listeners.get(event)?.forEach(fn => fn(payload));
};

/**
 * @description 이벤트 1회 구독 후 자동 해제
 * @param {string} event
 * @param {Function} fn
 * @returns {void}
 */
const once = (event, fn) => {
  const wrapper = (payload) => { fn(payload); off(event, wrapper); };
  on(event, wrapper);
};

export const EventBus = { on, off, emit, once };
