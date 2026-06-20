/**
 * @FileName     : editor.view.js
 * @Description  : ToastUI Editor DOM 바인딩 + 저장 버튼 이벤트
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

let _editor = null;
let _callbacks = {};

/**
 * @description 에디터 뷰 초기화 (ToastUI Editor 연동 대기)
 * @param {object} callbacks
 * @returns {void}
 */
export function init(callbacks = {}) {
  _callbacks = callbacks;
  // ToastUI Editor는 해당 컨테이너가 HTML에 추가될 때 별도 초기화
}

/**
 * @description 에디터 인스턴스 설정
 * @param {object} editorInstance
 * @returns {void}
 */
export function setEditor(editorInstance) { _editor = editorInstance; }

/**
 * @description 현재 에디터 내용 반환
 * @returns {string}
 */
export const getContent = () => _editor?.getMarkdown() ?? '';
