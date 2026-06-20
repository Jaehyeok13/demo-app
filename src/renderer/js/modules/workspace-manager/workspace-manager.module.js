/**
 * @FileName     : workspace-manager.module.js
 * @Description  : 워크스페이스 관리 흐름 제어
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

import { EventBus } from '../../core/eventBus.js';
import * as WorkspaceService from './services/workspace-manager.service.js';
import * as WorkspaceView    from './views/workspace-manager.view.js';

export function init() {
  console.log('[WorkspaceManager] 초기화');
  WorkspaceView.init({ onDelete: (id) => _handleDelete(id) });
  EventBus.on('item:created', () => _reload());
  EventBus.on('item:deleted', () => _reload());
}

async function _reload() {
  const items = await WorkspaceService.getAll();
  WorkspaceView.render(items);
}

async function _handleDelete(id) {
  console.group('[WorkspaceManager] 아이템 삭제');
  try {
    await WorkspaceService.remove(id);
    EventBus.emit('item:deleted', id);
  } catch (err) {
    console.error('[WorkspaceManager] 삭제 실패:', err);
  } finally { console.groupEnd(); }
}
