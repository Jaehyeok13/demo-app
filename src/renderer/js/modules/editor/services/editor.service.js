/**
 * @FileName     : editor.service.js
 * @Description  : 에디터 아이템 저장 IPC 호출
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
 * @description 아이템 내용 저장
 * @param {string} id
 * @param {string} content
 * @returns {Promise<object>}
 */
export const save = (id, content) => ipcClient.item.update(id, { content });
