/**
 * @FileName     : license.service.js
 * @Description  : 라이선스 비즈니스 로직 — LicenseChecker 래핑, 단일 인스턴스 유지
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

const LicenseChecker = require('../../shared/license/LicenseChecker');
const { APP, isDev } = require('../config');
const LoggerService  = require('./logger.service');

const _checker = new LicenseChecker({
  appId     : APP.id,
  secretKey : APP.secretKey,
  masterKeys: APP.masterKeys,
  mode      : isDev ? 'development' : 'production',
});

let _lastResult = null;

/**
 * @description 라이선스 키 검증 (null 이면 저장된 키 사용)
 * @param {string|null} key
 * @returns {Promise<Object>}
 */
async function verify(key = null) {
  try {
    _lastResult = await _checker.verify(key);
    if (key && _lastResult.status === LicenseChecker.STATUS.VALID) {
      _checker.saveLicense(key);
    }
    LoggerService.info(`[LicenseService] 검증 완료 → ${_lastResult.status} / ${_lastResult.edition}`);
    return _lastResult;
  } catch (err) {
    LoggerService.error('[LicenseService] 검증 오류:', err);
    return { status: 'INVALID', edition: null, payload: null };
  }
}

/**
 * @description 마지막 검증 결과 반환 (캐시)
 * @returns {Object}
 */
const getStatus = () => _lastResult || { status: 'NOT_FOUND', edition: null };

/**
 * @description 개발 모드 우회
 * @param {string} edition
 * @returns {Object}
 */
function devBypass(edition = 'pro') {
  if (!isDev) return { status: 'INVALID', edition: null };
  _lastResult = _checker.devBypass(edition);
  return _lastResult;
}

/**
 * @description 개발 모드 라이선스 초기화
 * @returns {Object}
 */
function devReset() {
  if (!isDev) return { status: 'INVALID', edition: null };
  _checker.clearLicense();
  _lastResult = { status: 'NOT_FOUND', edition: null };
  return _lastResult;
}

/**
 * @description HWID 조회
 * @returns {Promise<string>}
 */
const getHwid = () => _checker.getHwid();

module.exports = { verify, getStatus, devBypass, devReset, getHwid };
