/**
 * @FileName     : app.js
 * @Description  : 렌더러 진입점 — DOMContentLoaded → bootstrap()
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

import { bootstrap } from './core/bootstrap.js';

document.addEventListener('DOMContentLoaded', () => {
  bootstrap();
});
