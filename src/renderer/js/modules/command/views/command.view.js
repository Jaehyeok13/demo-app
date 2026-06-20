/**
 * @FileName     : command.view.js
 * @Description  : 커맨드 팔레트 DOM 렌더링 + 이벤트 바인딩
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

let _el = null;

export function init(callbacks = {}) {
  // 커맨드 팔레트 컨테이너 동적 생성
  _el = document.createElement('div');
  _el.id        = 'commandPalette';
  _el.className = 'command-palette hidden';
  _el.innerHTML = `
    <div class="command-palette__inner">
      <input class="command-palette__input" placeholder="명령어 검색..." id="cmdInput" />
      <div class="command-palette__list" id="cmdList"></div>
    </div>`;
  document.body.appendChild(_el);

  _el.addEventListener('click', (e) => {
    if (e.target === _el) callbacks.onClose?.();
  });
}

export const show      = () => _el?.classList.remove('hidden');
export const hide      = () => _el?.classList.add('hidden');
export const isVisible = () => !_el?.classList.contains('hidden');
