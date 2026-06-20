/**
 * @FileName     : feature-manager.js
 * @Description  : 현재 edition 기준 can('feature') 조회
 * @Modification :
 *
 * 수정일         수정자      수정내용
 * ──────────── ───────── ───────────────────────────────
 * 2026.04.01.   develJan  최초생성
 * 2026.06.15.   develJan  setCapabilityMap() 추가
 * 2026.06.16.   develJan  ES Module 형식으로 통일
 *
 * @author  develJan
 * @since   2026.04.01
 * @version 1.0.2
 *
 * Copyright (C) 2026 by develJan Media All right reserved.
 */

import { CAPABILITY_MAP } from './capability-map.js';

let _map = CAPABILITY_MAP;

export const setCapabilityMap = (map) => { _map = map; };
export const can = (edition, feature) => !!(_map[edition]?.[feature]);

export { CAPABILITY_MAP };
