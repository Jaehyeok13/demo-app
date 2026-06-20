/**
 * @FileName     : item-detail.service.js
 * @Description  : 아이템 상세 조회/수정/삭제 IPC 호출
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

/** @returns {Promise<object|null>} */
export const get    = (id)         => ipcClient.item.get(id);
/** @returns {Promise<object>} */
export const update = (id, data)   => ipcClient.item.update(id, data);
/** @returns {Promise<object>} */
export const remove = (id)         => ipcClient.item.delete(id);
