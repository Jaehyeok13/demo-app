/**
 * @FileName     : featureLayer.js
 * @Description  : CAPABILITY_MAP 기반 .pro-only DOM 토글
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

import { CAPABILITY_MAP } from '../../../shared/capabilities/capability-map.js';

/**
 * @description Edition 기반 DOM 토글 초기화
 * @param {string} edition - 'standard' | 'pro'
 * @returns {void}
 */
export function init(edition) {
  document.body.dataset.edition = edition;

  // .pro-only 요소 표시/숨김
  document.querySelectorAll('.pro-only').forEach(el => {
    el.classList.toggle('hidden', edition !== 'pro');
  });

  // .standard-only 요소 표시/숨김
  document.querySelectorAll('.standard-only').forEach(el => {
    el.classList.toggle('hidden', edition === 'pro');
  });
}

/**
 * @description 특정 기능 활성화 여부 조회
 * @param {string} edition
 * @param {string} feature
 * @returns {boolean}
 */
export const can = (edition, feature) => !!CAPABILITY_MAP[edition]?.[feature];
