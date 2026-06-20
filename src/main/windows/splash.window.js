/**
 * @FileName     : splash.window.js
 * @Description  : 스플래시 윈도우 (frameless, transparent, alwaysOnTop)
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

const { BrowserWindow, app } = require('electron');
const path = require('path');
const { APP } = require('../config');

/**
 * @description 스플래시 윈도우 생성
 * @returns {BrowserWindow}
 */
function create() {
  const win = new BrowserWindow({
    width          : 400,
    height         : 300,
    frame          : false,
    transparent    : true,
    alwaysOnTop    : true,
    resizable      : false,
    show           : false,
    webPreferences : { contextIsolation: true },
  });
  
  win.loadFile(path.join(__dirname, '../../renderer/view/splash.html'));
  
  win.once('ready-to-show', () => {
    win.webContents.executeJavaScript(`
      document.querySelector('.splash__name').textContent = "${APP.name}";
      document.querySelector('.splash__ver').textContent = "v${app.getVersion()}";
    `);
    win.show();
  });
  
  return win;
}

module.exports = { create };
