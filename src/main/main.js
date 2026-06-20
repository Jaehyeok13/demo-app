  /**
 * @FileName    : main.js
 * @Description : 앱 진입점 — 단일 인스턴스 보장 + bootstrap 위임만
 * @Modification: 
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

try {
  require('electron-reloader')(module);
} catch (_) {}

const { app }   = require('electron');
const Bootstrap = require('./bootstrap');

  // 단일 인스턴스 보장
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => Bootstrap.onSecondInstance());
  app.whenReady().then(() => Bootstrap.init());
  app.on('activate', () => Bootstrap.onActivate());
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
}
