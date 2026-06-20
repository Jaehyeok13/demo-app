/**
 * @FileName     : settings.repository.js
 * @Description  : settings.json 읽기/쓰기 전담
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
const { app } = require('electron');

const FILE = path.join(app.getPath('userData'), 'settings.json');

const load = () => {
  try {
    if (!fs.existsSync(FILE)) return {};
    return JSON.parse(fs.readFileSync(FILE, 'utf8'));
  } catch { return {}; }
};

const save = (data) => {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2), 'utf8');
};

module.exports = { load, save };
