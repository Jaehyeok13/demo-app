/**
 * @FileName     : item-detail.module.js
 * @Description  : 아이템 상세 조회/편집 흐름 제어
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

import { EventBus }       from '../../core/eventBus.js';
import * as ItemDetailService from './services/item-detail.service.js';
import * as ItemDetailView    from './views/item-detail.view.js';

export function init() {
  console.log('[ItemDetail] 초기화');
  ItemDetailView.init({
    onUpdate: (id, data) => _handleUpdate(id, data),
    onDelete: (id)       => _handleDelete(id),
  });
  EventBus.on('item:open', (id) => _load(id));
}

async function _load(id) {
  console.group('[ItemDetail] 아이템 로드');
  try {
    const item = await ItemDetailService.get(id);
    if (item) ItemDetailView.render(item);
  } catch (err) {
    console.error('[ItemDetail] 로드 실패:', err);
  } finally { console.groupEnd(); }
}

async function _handleUpdate(id, data) {
  console.group('[ItemDetail] 아이템 수정');
  try {
    const item = await ItemDetailService.update(id, data);
    EventBus.emit('item:updated', item);
    ItemDetailView.render(item);
  } catch (err) {
    console.error('[ItemDetail] 수정 실패:', err);
  } finally { console.groupEnd(); }
}

async function _handleDelete(id) {
  console.group('[ItemDetail] 아이템 삭제');
  try {
    await ItemDetailService.remove(id);
    EventBus.emit('item:deleted', id);
  } catch (err) {
    console.error('[ItemDetail] 삭제 실패:', err);
  } finally { console.groupEnd(); }
}
