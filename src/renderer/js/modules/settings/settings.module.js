/**
 * @FileName     : settings.module.js
 * @Description  : 설정 로드 + 테마 적용 흐름 제어
 *                 ※ DOM 조작 금지
 * @Modification :
 *
 * 수정일         수정자      수정내용
 * ──────────── ───────── ───────────────────────────────
 * 2026.06.15.   develJan  최초생성
 * 2026.06.16.   develJan  테마 토글 버튼 콜백 방식으로 전환
 *
 * @author  develJan
 * @since   2026.06.15
 * @version 1.1.0
 *
 * Copyright (C) 2026 by develJan Media All right reserved.
 */

import { State }            from '../../core/state.js';
import * as SettingsService from './services/settings.service.js';
import * as SettingsView    from './views/settings.view.js';

/**
 * @description 설정 모듈 초기화
 * @returns {Promise<void>}
 */
export async function init() {
  console.group('[Settings] 초기화');
  try {
    const settings = await SettingsService.getAll();

    // 테마 적용
    if (settings.theme) State.setTheme(settings.theme);

    // 뷰 바인딩 — 테마 토글
    SettingsView.init({
      onThemeToggle: () => _toggleTheme(),
    });

    console.log('[Settings] 초기화 완료:', settings);
  } catch (err) {
    console.error('[Settings] 초기화 실패:', err);
  } finally {
    console.groupEnd();
  }
}

/**
 * @description 테마 토글 (dark ↔ light)
 * @returns {Promise<void>}
 */
async function _toggleTheme() {
  console.group('[Settings] 테마 토글');
  try {
    const current = document.body.dataset.theme ?? 'dark';
    const next    = current === 'dark' ? 'light' : 'dark';
    State.setTheme(next);
    await SettingsService.set('theme', next);
    SettingsView.updateThemeBtn(next);
    console.log('[Settings] 테마 변경:', next);
  } catch (err) {
    console.error('[Settings] 테마 변경 실패:', err);
  } finally {
    console.groupEnd();
  }
}
