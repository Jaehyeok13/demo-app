/**
 * @FileName     : modal.module.js
 * @Description  : 공통 모달 열기/닫기/확인 흐름 제어
 *                 ※ DOM 조작 금지
 * @Modification :
 *
 * 수정일         수정자      수정내용
 * ──────────── ───────── ───────────────────────────────
 * 2026.06.15.   develJan  최초생성
 * 2026.06.16.   develJan  순환 import 완전 제거
 *
 * @author  develJan
 * @since   2026.06.15
 * @version 1.1.0
 *
 * Copyright (C) 2026 by develJan Media All right reserved.
 */

import { EventBus }   from '../../core/eventBus.js';
import * as ModalView from './views/modal.view.js';

let _confirmCallback = null;

/**
 * @description 모달 모듈 초기화
 * @returns {void}
 */
export function init() {
  console.log('[Modal] 초기화');
  ModalView.init({
    onConfirm: () => _handleConfirm(),
    onCancel : () => close(),
  });

  EventBus.on('modal:open',  ({ title, body, onConfirm }) => open(title, body, onConfirm));
  EventBus.on('modal:close', () => close());
}

/**
 * @description 모달 열기
 * @param {string} title
 * @param {string} body
 * @param {Function|null} onConfirm
 * @returns {void}
 */
export function open(title, body, onConfirm = null) {
  _confirmCallback = onConfirm;
  ModalView.render(title, body);
  ModalView.show();
}

/**
 * @description 모달 닫기
 * @returns {void}
 */
export function close() {
  _confirmCallback = null;
  ModalView.hide();
}

/**
 * @description 확인 콜백 실행 후 닫기
 * @returns {void}
 */
function _handleConfirm() {
  _confirmCallback?.();
  close();
}
