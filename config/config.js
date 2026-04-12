'use strict';

  // ★ 새 프로젝트 생성 시 APP 항목만 수정하면 됩니다.
const APP = {
  id     : 'DM01',
  name   : 'Demo App',
  version: '1.0.0',
};

  // ── 실행 모드 감지 ────────────────────────────
const MODE   = process.argv.includes('--inspect') ? 'development' : 'production';
const IS_DEV = MODE === 'development';

  // ── 경로 ─────────────────────────────────────
const path = require('path');
const os   = require('os');

const USER_DATA = (() => {
  try {
    const { app } = require('electron');
    return app.getPath('userData');
  } catch {
    return os.homedir();
  }
})();

const PATHS = {
  licenseFile: path.join(USER_DATA, `.${APP.id.toLowerCase()}.license`),
};

// ── 창 설정 ──────────────────────────────────
const WINDOW = {
  width    : 960,
  height   : 640,
  minWidth : 800,
  minHeight: 560,
};

module.exports = { APP, MODE, IS_DEV, PATHS, WINDOW };
