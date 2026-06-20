/**
 * @FileName     : ipc/index.js
 * @Description  : IPC 핸들러 통합 등록소 — 기능 단위 분리 후 여기서 일괄 등록
 * @Modification :
 *
 * 수정일         수정자      수정내용
 * ──────────── ───────── ───────────────────────────────
 * 2026.04.01.   develJan  최초생성
 *
 * @author  develJan
 * @since   2026.04.01
 * @version 1.0.0
 *
 * Copyright (C) 2026 by develJan Media All right reserved.
 */

'use strict';

const { registerLicenseHandlers  } = require('./license.handlers');
const { registerSettingsHandlers } = require('./settings.handlers');
const { registerItemHandlers     } = require('./item.handlers');
const { registerAppHandlers      } = require('./app.handlers');

function registerAll() {
  registerLicenseHandlers();
  registerSettingsHandlers();
  registerItemHandlers();
  registerAppHandlers();
}

module.exports = { registerAll };
