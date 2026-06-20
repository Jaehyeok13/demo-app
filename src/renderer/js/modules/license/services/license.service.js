/**
 * @FileName     : license.service.js
 * @Description  : 라이선스 IPC 호출 + 데이터 가공
 *                 ※ DOM 접근 금지 / EventBus emit 금지 / 상태 직접 변경 금지
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

import ipcClient from '../../../core/ipcClient.js';

/**
 * @description 저장된 라이선스 상태 조회
 * @returns {Promise<object>} { status, edition, payload }
 */
export const getStatus = () => ipcClient.license.getStatus();

/**
 * @description 라이선스 키 검증
 * @param {string} key
 * @returns {Promise<object>} { status, edition, payload }
 */
export const verify = (key) => ipcClient.license.verify(key);

/**
 * @description HWID 조회
 * @returns {Promise<string>}
 */
export const getHwid = () => ipcClient.license.getHwid();

/**
 * @description Dev 우회
 * @param {string} edition
 * @returns {Promise<object>}
 */
export const devBypass = (edition) => ipcClient.license.devBypass(edition);

/**
 * @description Dev 초기화
 * @returns {Promise<object>}
 */
export const devReset = () => ipcClient.license.devReset();

/**
 * @description 라이선스 결과에서 UI용 텍스트 추출
 * @param {object} result
 * @returns {{ editionText: string, statusText: string, expiryText: string, statusClass: string }}
 */
export function parseResult(result) {
  const STATUS_LABEL = {
    VALID        : '인증됨',
    EXPIRED      : '만료됨',
    HWID_MISMATCH: 'HWID 불일치',
    APP_MISMATCH : '앱 불일치',
    REVOKED      : '폐기됨',
    INVALID      : '유효하지 않음',
    NOT_FOUND    : '미인증',
  };
  const editionText = result.edition === 'pro' ? 'Pro Edition'
    : result.edition === 'standard'             ? 'Standard Edition'
    : 'Free Edition';
  const statusText  = STATUS_LABEL[result.status] ?? result.status;
  const expiryText  = result.payload?.expiry === 'PERMANENT' ? '영구'
    : result.payload?.expiry ? result.payload.expiry.slice(0, 10) : '-';
  const statusClass = result.status === 'VALID' ? 'lic-status-item__value--success' : 'lic-status-item__value--danger';
  return { editionText, statusText, expiryText, statusClass };
}
