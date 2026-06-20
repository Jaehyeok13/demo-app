/**
 * @FileName     : create.service.js
 * @Description  : 아이템 생성 IPC 호출 + 데이터 가공
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
 * @description 아이템 생성
 * @param {{ title: string, content?: string, tags?: string[] }} data
 * @returns {Promise<object>} 생성된 아이템
 */
export async function create(data) {
  if (!data.title?.trim()) throw new Error('제목은 필수입니다.');
  return ipcClient.item.create({
    title  : data.title.trim(),
    content: data.content ?? '',
    tags   : data.tags    ?? [],
  });
}

/**
 * @description 전체 아이템 조회
 * @returns {Promise<Array>}
 */
export const getAll = () => ipcClient.item.getAll();
