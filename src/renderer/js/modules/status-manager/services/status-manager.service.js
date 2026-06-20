/**
 * @FileName     : status-manager.service.js
 * @Description  : 상태값 관리 IPC 호출 (Pro 전용)
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

// Pro 전용 — 상태값은 settings에 저장
import ipcClient from '../../../core/ipcClient.js';

/** @returns {Promise<string[]>} */
export const getStatuses = () => ipcClient.settings.get('statuses').then(v => v ?? ['진행 중', '완료', '보류']);
/** @returns {Promise<object>} */
export const saveStatuses = (list) => ipcClient.settings.set('statuses', list);
