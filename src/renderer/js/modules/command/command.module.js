/**
 * @FileName     : command.module.js
 * @Description  : 커맨드 팔레트 — Ctrl+K 단축키 기반
 *                 ※ DOM 조작은 view 위임
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
import * as CommandView from './views/command.view.js';

/**
 * @description 커맨드 팔레트 초기화
 * @returns {void}
 */
export function init() {
  console.log('[Command] 초기화');
  CommandView.init({ onClose: () => close() });

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      toggle();
    }
    if (e.key === 'Escape') close();
  });
}

export const open   = () => CommandView.show();
export const close  = () => CommandView.hide();
export const toggle = () => CommandView.isVisible() ? close() : open();
