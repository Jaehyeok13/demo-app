/**
 * @FileName     : LicenseChecker.js
 * @Description  : AES-256-CBC 복호화 + HWID 검증 + MasterKey 처리
 * @Modification :
 *
 * 수정일         수정자      수정내용
 * ──────────── ───────── ───────────────────────────────
 * 2026.04.01.   develJan  최초생성
 * 2026.06.15.   develJan  appId/secretKey/masterKeys 교체, _sessionBypass 추가
 *                         devReset() 추가, revoked 검사 추가, 로그 한글화
 *
 * @author  develJan
 * @since   2026.04.01
 * @version 1.1.0
 *
 * Copyright (C) 2026 by develJan Media All right reserved.
 */

'use strict';

const CryptoJS = require('crypto-js');
const os       = require('os');
const fs       = require('fs');
const path     = require('path');

let _machineId = null;
try { _machineId = require('node-machine-id').machineIdSync(true); } catch { _machineId = null; }

class LicenseChecker {

  // ── 상태 상수 ──────────────────────────────────────
  static STATUS = {
    VALID        : 'VALID',
    EXPIRED      : 'EXPIRED',
    HWID_MISMATCH: 'HWID_MISMATCH',
    APP_MISMATCH : 'APP_MISMATCH',
    REVOKED      : 'REVOKED',
    INVALID      : 'INVALID',
    NOT_FOUND    : 'NOT_FOUND',
  };

  // 세션 우회 캐시 (static — 인스턴스 공유)
  static _sessionBypass = null;

  /**
   * @description LicenseChecker 생성자
   * @param {{ appId: string, secretKey: string, masterKeys: object, mode: string }} opts
   */
  constructor({ appId, secretKey, masterKeys = {}, mode = 'production' }) {
    this._appId      = appId;
    this._secretKey  = (secretKey + '00000000000000000000000000000000').slice(0, 32);
    this._masterKeys = masterKeys;
    this._mode       = mode;
  }

  // ── 공개 메서드 ────────────────────────────────────

  /**
   * @description 라이선스 검증 메인 진입점
   * @param {string|null} licenseKey
   * @returns {Promise<{ status: string, edition: string|null, payload: object|null }>}
   */
  async verify(licenseKey = null) {
    // ① 세션 우회 (development만)
    if (this._mode === 'development' && LicenseChecker._sessionBypass) {
      console.log('[LicenseChecker] 세션 우회 결과 반환');
      return LicenseChecker._sessionBypass;
    }

    // 키 결정: 인자 → 파일
    const key = licenseKey?.trim() || this._readFile();
    if (!key) return this._result(LicenseChecker.STATUS.NOT_FOUND, null, null);

    // ③ 마스터 키
    if (this._masterKeys[key] !== undefined) {
      const edition = this._masterKeys[key];
      console.log('[LicenseChecker] 마스터 키 인식:', edition);
      return this._result(LicenseChecker.STATUS.VALID, edition, {
        lid: 'MASTER', appId: this._appId, hwid: 'DEV',
        edition, expiry: 'PERMANENT', issued: new Date().toISOString(),
      });
    }

    // ② 파일 우회 (development만)
    if (this._mode === 'development' && key.startsWith('DEV-BYPASS-')) {
      const edition = key.includes('-PRO-') ? 'pro' : 'standard';
      console.log('[LicenseChecker] 파일 우회 인식:', edition);
      return this._result(LicenseChecker.STATUS.VALID, edition, {
        lid: key, appId: this._appId, hwid: 'DEV',
        edition, expiry: 'PERMANENT', issued: new Date().toISOString(),
      });
    }

    // AES 복호화
    const payload = this._decrypt(key);
    if (!payload) return this._result(LicenseChecker.STATUS.INVALID, null, null);

    // appId 검사
    if (payload.appId !== this._appId) {
      console.log('[LicenseChecker] App ID 불일치:', payload.appId, '≠', this._appId);
      return this._result(LicenseChecker.STATUS.APP_MISMATCH, null, null);
    }

    // HWID 검사
    if (payload.hwid !== 'DEV') {
      const hwid = await this.getHwid();
      if (hwid !== payload.hwid) {
        console.log('[LicenseChecker] HWID 불일치');
        return this._result(LicenseChecker.STATUS.HWID_MISMATCH, null, null);
      }
    }

    // 만료일 검사
    if (payload.expiry !== 'PERMANENT') {
      if (new Date(payload.expiry) < new Date()) {
        console.log('[LicenseChecker] 라이선스 만료:', payload.expiry);
        return this._result(LicenseChecker.STATUS.EXPIRED, payload.edition, payload);
      }
    }

    // 폐기 검사
    if (payload.revoked === true) {
      console.log('[LicenseChecker] 폐기된 라이선스');
      return this._result(LicenseChecker.STATUS.REVOKED, null, null);
    }

    console.log('[LicenseChecker] 검증 성공:', payload.edition);
    return this._result(LicenseChecker.STATUS.VALID, payload.edition, payload);
  }

  /**
   * @description 개발 모드 세션 우회 설정
   * @param {string} edition - 'standard' | 'pro'
   * @returns {{ status: string, edition: string, payload: object }}
   */
  devBypass(edition = 'pro') {
    if (this._mode !== 'development') {
      return this._result(LicenseChecker.STATUS.INVALID, null, null);
    }
    const result = this._result(LicenseChecker.STATUS.VALID, edition, {
      lid    : `DEV-BYPASS-${edition.toUpperCase()}-KEY`,
      appId  : this._appId,
      hwid   : 'DEV',
      edition,
      expiry : 'PERMANENT',
      issued : new Date().toISOString(),
    });
    LicenseChecker._sessionBypass = result;
    return result;
  }

  /**
   * @description 세션 우회 초기화
   * @returns {void}
   */
  devReset() {
    LicenseChecker._sessionBypass = null;
  }

  /**
   * @description 라이선스 키를 파일에 저장
   * @param {string} key
   * @returns {void}
   */
  saveLicense(key) {
    try {
      fs.writeFileSync(this._licensePath(), key.trim(), 'utf8');
    } catch (err) {
      console.error('[LicenseChecker] 라이선스 저장 실패:', err.message);
    }
  }

  /**
   * @description 라이선스 파일 삭제
   * @returns {void}
   */
  clearLicense() {
    try {
      const p = this._licensePath();
      if (fs.existsSync(p)) fs.unlinkSync(p);
    } catch (err) {
      console.error('[LicenseChecker] 라이선스 삭제 실패:', err.message);
    }
  }

  /**
   * @description HWID 반환
   * @returns {Promise<string>}
   */
  async getHwid() {
    if (_machineId) return _machineId;
    // fallback: os 기반 해시
    return require('crypto').createHash('md5')
      .update(os.hostname() + os.platform())
      .digest('hex')
      .toUpperCase();
  }

  // ── Private ────────────────────────────────────────

  /**
   * @description 라이선스 파일 경로 반환
   * @returns {string}
   */
  _licensePath() {
    const appId = this._appId.toLowerCase();
    try {
      const { app } = require('electron');
      return path.join(app.getPath('userData'), `.${appId}.license`);
    } catch {
      return path.join(os.homedir(), `.${appId}.license`);
    }
  }

  /**
   * @description 라이선스 파일 읽기
   * @returns {string|null}
   */
  _readFile() {
    try {
      const p = this._licensePath();
      if (!fs.existsSync(p)) return null;
      return fs.readFileSync(p, 'utf8').trim() || null;
    } catch {
      return null;
    }
  }

  /**
   * @description AES-256-CBC 복호화
   * @param {string} key - '{IV_Base64}.{CipherText}' 형식
   * @returns {object|null} payload
   */
  _decrypt(key) {
    try {
      const [ivB64, cipherText] = key.split('.');
      if (!ivB64 || !cipherText) return null;

      const iv         = CryptoJS.enc.Base64.parse(ivB64);
      const secretKey  = CryptoJS.enc.Utf8.parse(this._secretKey);
      const decrypted  = CryptoJS.AES.decrypt(cipherText, secretKey, {
        iv,
        mode   : CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });
      const json = decrypted.toString(CryptoJS.enc.Utf8);
      return JSON.parse(json);
    } catch {
      return null;
    }
  }

  /**
   * @description 결과 객체 생성
   * @param {string} status
   * @param {string|null} edition
   * @param {object|null} payload
   * @returns {{ status: string, edition: string|null, payload: object|null }}
   */
  _result(status, edition, payload) {
    return { status, edition, payload };
  }
}

module.exports = LicenseChecker;
