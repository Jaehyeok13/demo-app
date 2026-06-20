/**
 * @FileName     : editor.module.js
 * @Description  : ToastUI Editor 초기화 및 저장 연동 흐름 제어
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

import { EventBus }     from '../../core/eventBus.js';
import * as EditorService from './services/editor.service.js';
import * as EditorView    from './views/editor.view.js';

let _currentId = null;

export function init() {
  console.log('[Editor] 초기화');
  EditorView.init({ onSave: (content) => _handleSave(content) });
  EventBus.on('item:open', (id) => { _currentId = id; });
}

async function _handleSave(content) {
  if (!_currentId) return;
  console.group('[Editor] 저장');
  try {
    await EditorService.save(_currentId, content);
    EventBus.emit('item:saved', _currentId);
    console.log('[Editor] 저장 완료:', _currentId);
  } catch (err) {
    console.error('[Editor] 저장 실패:', err);
  } finally { console.groupEnd(); }
}
