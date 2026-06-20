/**
 * @FileName     : settings.service.js
 * @Description  : 앱 설정 저장/조회 서비스
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

'use strict';

const SettingsRepository = require('../repositories/settings.repository');

const DEFAULTS = {
  theme   : 'light',
  language: 'ko',
  fontSize: 14,
  autoSave: true,
};

/**
 * @description 특정 키 또는 전체 설정 조회
 * @param {string|null} key
 * @returns {*}
 */
function get(key) {
  const all = SettingsRepository.load();
  return key ? (all[key] ?? DEFAULTS[key] ?? null) : all;
}

/**
 * @description 특정 키 설정 저장
 * @param {string} key
 * @param {*} value
 * @returns {{ ok: boolean, key: string, value: * }}
 */
function set(key, value) {
  const all = SettingsRepository.load();
  all[key]  = value;
  SettingsRepository.save(all);
  return { ok: true, key, value };
}

/**
 * @description 기본값 병합 후 전체 설정 반환
 * @returns {Object}
 */
const getAll = () => ({ ...DEFAULTS, ...SettingsRepository.load() });

/**
 * @description 설정 초기화
 * @returns {{ ok: boolean }}
 */
function reset() {
  SettingsRepository.save({ ...DEFAULTS });
  return { ok: true };
}

module.exports = { get, set, getAll, reset };
