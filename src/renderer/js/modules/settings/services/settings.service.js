/**
 * @FileName     : settings.service.js
 * @Description  : 설정 IPC 호출 + 데이터 가공
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
 * @description 전체 설정 조회
 * @returns {Promise<object>}
 */
export const getAll = () => ipcClient.settings.getAll();

/**
 * @description 특정 키 설정 저장
 * @param {string} key
 * @param {*} value
 * @returns {Promise<object>}
 */
export const set = (key, value) => ipcClient.settings.set(key, value);

/**
 * @description 설정 초기화
 * @returns {Promise<object>}
 */
export const reset = () => ipcClient.settings.reset();
