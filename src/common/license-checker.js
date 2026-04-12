  // demo-app/src/common/license-checker.js
  //
  // ★ License Hub BuildManager가 APP_CONFIG 블록을 자동 치환합니다.
  // ── 이 파일은 main 프로세스에서만 require 됩니다 ──

'use strict';

const CryptoJS      = require('crypto-js');
const { machineId } = require('node-machine-id');
const fs            = require('fs');
const path          = require('path');
const os            = require('os');

  // ── 라이선스 파일 경로 (electron app 없이 계산) ──
function getLicensePath(appId) {
  try {
    const { app } = require('electron');
    return path.join(app.getPath('userData'), `.${appId.toLowerCase()}.license`);
  } catch {
    return path.join(os.homedir(), `.${appId.toLowerCase()}.license`);
  }
}

  // ══════════════════════════════════════════════
  // ★★★ BuildManager 치환 대상 블록 ★★★
  // ══════════════════════════════════════════════
const APP_CONFIG = {
  appId    : 'DM01',
  secretKey: 'VxqGEnBakj2jBF8lOTJihBE1h1dkLQIDheFNwpsn',
  mode     : 'development',
};
  // ══════════════════════════════════════════════

const STATUS = Object.freeze({
  VALID        : 'VALID',
  EXPIRED      : 'EXPIRED',
  HWID_MISMATCH: 'HWID_MISMATCH',
  APP_MISMATCH : 'APP_MISMATCH',
  REVOKED      : 'REVOKED',
  INVALID      : 'INVALID',
  NOT_FOUND    : 'NOT_FOUND',
});

class LicenseChecker {
  constructor(options = {}) {
    this._hwid        = null;
    this._appId       = options.appId || APP_CONFIG.appId;
    this._mode        = options.mode  || APP_CONFIG.mode;
    this._secretKey   = options.secretKey || APP_CONFIG.secretKey;
    this._licensePath = getLicensePath(this._appId);

    console.info(`[LicenseChecker] Initialized (AppID: ${this._appId}, Mode: ${this._mode})`);
  }

    // ── HWID 추출 ────────────────────────────────
  async getHwid() {
    console.group('[LicenseChecker] getHwid()');
    if (this._hwid) {
      console.info('Return cached HWID:', this._hwid);
      console.groupEnd();
      return this._hwid;
    }
    try {
      this._hwid = (await machineId()).replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      console.info('HWID extracted successfully:', this._hwid);
    } catch (err) {
      console.error('Failed to extract HWID:', err.message);
      this._hwid = 'UNKNOWN-HWID-0000';
    }
    console.groupEnd();
    return this._hwid;
  }

    // ── 라이선스 파일 저장 ───────────────────────
  saveLicense(key) {
    console.group('[LicenseChecker] saveLicense()');
    try {
      const dir = path.dirname(this._licensePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(this._licensePath, key.trim(), 'utf-8');
      console.info('License file saved:', this._licensePath);
    } catch (err) {
      console.error('Failed to save license file:', err.message);
    }
    console.groupEnd();
  }

    // ── 라이선스 검증 ────────────────────────────
  async verify(licenseKey) {
    console.group('[LicenseChecker] verify()');
    const key = licenseKey || this._readFile();
    
    if (!key) {
      console.info('License key not found (NOT_FOUND)');
      console.groupEnd();
      return this._res(STATUS.NOT_FOUND);
    }

    console.info('Attempting to decrypt license...');
    let payload;
    try {
      payload = this._decrypt(key);
      console.info('Decryption successful:', payload);
    } catch (err) {
      console.error('Decryption failed (INVALID):', err.message);
      console.groupEnd();
      return this._res(STATUS.INVALID);
    }

    if (payload.appId !== this._appId) {
      console.warn(`App ID mismatch: ${payload.appId} != ${this._appId}`);
      console.groupEnd();
      return this._res(STATUS.APP_MISMATCH, null, payload);
    }

      // HWID 검사 — 실제 검증 시에는 모드 상관없이 체크 (사용자 요청: 개발에서도 연동 테스트 필요)
    const hwid = await this.getHwid();
    if (payload.hwid !== 'DEV' && payload.hwid !== hwid) {
      console.warn(`HWID mismatch: ${payload.hwid} != ${hwid}`);
      console.groupEnd();
      return this._res(STATUS.HWID_MISMATCH, null, payload, key);
    }

    if (payload.expiry !== 'PERMANENT') {
      const exp = new Date(payload.expiry);
      if (isNaN(exp) || new Date() > exp) {
        console.warn('License expired:', payload.expiry);
        console.groupEnd();
        return this._res(STATUS.EXPIRED, payload.edition, payload);
      }
    }

    if (payload.revoked) {
      console.warn('License revoked (REVOKED)');
      console.groupEnd();
      return this._res(STATUS.REVOKED, null, payload);
    }

    console.info(`License is valid: ${payload.edition}`);
    console.groupEnd();
    return this._res(STATUS.VALID, payload.edition, payload);
  }

    // ── 개발 전용 강제 우회 ──────────────────────
  devBypass(edition = 'pro') {
    console.group('[LicenseChecker] devBypass()');
    if (this._mode !== 'development') {
      console.error(`devBypass blocked: Current mode is '${this._mode}' (Requires development)`);
      console.groupEnd();
      return this._res(STATUS.INVALID);
    }
    
    const dummyKey = `DEV-BYPASS-${edition.toUpperCase()}-KEY`;
    console.warn(`🔓 DEV BYPASS activated — Edition: ${edition}`);
    const result = this._res(STATUS.VALID, edition, {
      lid  : 'DEV-BYPASS-' + Date.now(),
      appId: this._appId,
      hwid : 'DEV',
      edition,
      expiry: 'PERMANENT',
      issued: new Date().toISOString(),
    }, dummyKey);
    console.groupEnd();
    return result;
  }

    // ── AES-256-CBC 복호화 ───────────────────────
  _decrypt(licenseKey) {
    if (typeof licenseKey !== 'string') throw new Error('라이선스 키가 문자열이 아님');
    
    const parts = licenseKey.trim().split('.');
    if (parts.length !== 2) throw new Error('키 형식 오류 (IV.CT 구조가 아님)');
    
    const [ivB64, ct] = parts;
    const keyBuf      = this._secretKey.substring(0, 32).padEnd(32, '0');
    const key         = CryptoJS.enc.Utf8.parse(keyBuf);
    const iv          = CryptoJS.enc.Base64.parse(ivB64);
    const dec         = CryptoJS.AES.decrypt(ct, key, {
      iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7,
    });
    
    const decryptedStr = dec.toString(CryptoJS.enc.Utf8);
    if (!decryptedStr) throw new Error('복호화 결과가 비어있음 (잘못된 키 또는 Secret)');
    
    return JSON.parse(decryptedStr);
  }

  _readFile() {
    try {
      if (fs.existsSync(this._licensePath)) {
        return fs.readFileSync(this._licensePath, 'utf-8').trim();
      }
      return null;
    } catch (err) {
      console.error('[LicenseChecker] 파일 읽기 오류:', err.message);
      return null;
    }
  }

  _res(status, edition = null, payload = null, key = null) {
    return { status, edition, payload, key };
  }
}

LicenseChecker.STATUS = STATUS;
module.exports        = LicenseChecker;
