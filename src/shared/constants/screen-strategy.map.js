/**
 * @FileName     : screen-strategy.map.js
 * @Description  : 화면별 Edition 분기 전략 정의 (Single Source of Truth)
 *                  - 전략 A: HTML 하나 + body[data-edition] 토글
 *                  - 전략 B: HTML 두 개 (xxx.html / xxx-pro.html)
 *                  README.md '화면별 Edition 분기 현황' 표와 항상 동기화할 것.
 * @Modification :
 *
 * 수정일         수정자      수정내용
 * ──────────── ───────── ───────────────────────────────
 * 2026.06.17.   develJan  최초생성 (화면별 분기 전략 SSOT 정의)
 *
 * @author  develJan
 * @since   2026.06.17
 * @version 1.0.0
 *
 * Copyright (C) 2026 by develJan Media All right reserved.
 */

/**
 * @description Edition 분기 전략 식별자
 *   - 'A' : HTML 하나 + CSS/DOM 토글 (기능·버튼 일부만 차이)
 *   - 'B' : HTML 두 개로 분리 (레이아웃·플로우 자체가 다름)
 *   - null: Edition 과 무관한 화면 (예: 스플래시)
 */
const STRATEGY = {
  TOGGLE: 'A',
  SPLIT: 'B',
  NONE: null,
};

const SCREEN_STRATEGY = {
  dashboard: {
    strategy: STRATEGY.TOGGLE,
    html: 'dashboard.html',
    note: '공통 골격, Pro 패널 .pro-only 토글',
  },

  splash: {
    strategy: STRATEGY.NONE,
    html: 'splash.html',
    note: 'Edition 무관',
  },

  'workspace-manager': {
    strategy: STRATEGY.SPLIT,
    html: {
      standard: 'workspace-manager.html',
      pro: 'workspace-manager-pro.html',
    },
    note: 'Pro는 UI/UX 자체가 다름',
  },
};

function resolveScreenHtml(screenKey, edition) {
  const screen = SCREEN_STRATEGY[screenKey];

  if (!screen) {
    throw new Error(`[screen-strategy] 등록되지 않은 화면 키: ${screenKey}`);
  }

  if (screen.strategy === STRATEGY.SPLIT) {
    return screen.html[edition] ?? screen.html.standard;
  }

  return screen.html;
}

module.exports = {
  STRATEGY,
  SCREEN_STRATEGY,
  resolveScreenHtml,
};
