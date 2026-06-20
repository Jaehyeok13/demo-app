/**
 * @FileName     : capability-map.js
 * @Description  : Edition → 기능 활성화 맵
 * @Modification :
 *
 * 수정일         수정자      수정내용
 * ──────────── ───────── ───────────────────────────────
 * 2026.04.01.   develJan  최초생성
 * 2026.06.16.   develJan  ES Module 형식으로 통일
 *
 * @author  develJan
 * @since   2026.04.01
 * @version 1.0.2
 *
 * Copyright (C) 2026 by develJan Media All right reserved.
 */

export const CAPABILITY_MAP = {
  standard: {
    tagManager   : false,
    statusManager: false,
    bulkExport   : false,
    advancedChart: false,
    apiConnect   : false,
  },
  pro: {
    tagManager   : true,
    statusManager: true,
    bulkExport   : true,
    advancedChart: true,
    apiConnect   : true,
  },
};
