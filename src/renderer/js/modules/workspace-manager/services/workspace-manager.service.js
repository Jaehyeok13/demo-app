/**
 * @FileName     : workspace-manager.service.js
 * @Description  : 워크스페이스 관련 IPC 호출 (아이템 전체 조회/관리)
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

/** @returns {Promise<Array>} */
export const getAll = () => ipcClient.item.getAll();
/** @returns {Promise<object>} */
export const create = (data) => ipcClient.item.create(data);
/** @returns {Promise<object>} */
export const remove = (id)   => ipcClient.item.delete(id);
