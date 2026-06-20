/**
 * @FileName     : logger.service.js
 * @Description  : 콘솔 + 파일 로거 서비스
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

const fs   = require('fs');
const path = require('path');

let _logPath = null;
let _isDev   = false;

function init() {
  try {
    const { PATHS, isDev } = require('../config');
    _isDev   = isDev;
    _logPath = path.join(PATHS.LOGS, 'app.log');
    fs.mkdirSync(path.dirname(_logPath), { recursive: true });
  } catch { _logPath = null; }
}

function _write(level, args) {
  const msg = `[${new Date().toISOString()}] [${level}] ${args.map(String).join(' ')}`;
  if (_isDev) console[level === 'ERROR' ? 'error' : 'log'](msg);
  if (_logPath) {
    try { fs.appendFileSync(_logPath, msg + '\n'); } catch { /* ignore */ }
  }
}

const info  = (...args) => _write('INFO',  args);
const warn  = (...args) => _write('WARN',  args);
const error = (...args) => _write('ERROR', args);

module.exports = { init, info, warn, error };
