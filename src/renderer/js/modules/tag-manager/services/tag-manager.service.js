/**
 * @FileName     : tag-manager.service.js
 * @Description  : 태그 관리 IPC 호출 (Pro 전용)
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

// Pro 전용 — 현재 아이템의 tags 필드 활용
import ipcClient from '../../../core/ipcClient.js';

/**
 * @description 전체 아이템에서 태그 목록 추출
 * @returns {Promise<string[]>}
 */
export async function getAllTags() {
  const items = await ipcClient.item.getAll();
  const tags  = new Set(items.flatMap(i => i.tags ?? []));
  return [...tags].sort();
}
