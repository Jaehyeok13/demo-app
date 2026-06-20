/**
 * @FileName     : main.window.js
 * @Description  : 메인 윈도우 생성 전담 — Edition에 따라 HTML 분기 로드
 * @Modification :
 *
 * 수정일         수정자      수정내용
 * ──────────── ───────── ───────────────────────────────
 * 2026.04.01.   develJan  최초생성
 * 2026.06.16.   develJan  sandbox: false 추가, show: true 적용
 *
 * @author  develJan
 * @since   2026.04.01
 * @version 1.0.1
 *
 * Copyright (C) 2026 by develJan Media All right reserved.
 */

'use strict';

const { BrowserWindow } = require('electron');
const path = require('path');
const { isDev } = require('../config');

/**
 * @description 메인 윈도우 생성
 * @param {string|null} edition - 'pro' | 'standard' | null
 * @returns {Promise<BrowserWindow>}
 */
async function create(edition = null) {
  const win = new BrowserWindow({
    width          : 1200,
    height         : 800,
    minWidth       : 900,
    minHeight      : 600,
    frame          : false,
    show           : true,
    backgroundColor: '#0f0f1a',
    webPreferences : {
      preload         : path.join(__dirname, '../../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration : false,
      sandbox         : false,
    },
  });

  const { resolveScreenHtml } = require('../../shared/constants/screen-strategy.map');
  const screenHtml = resolveScreenHtml('dashboard', edition);
  const file = path.join(__dirname, '../../renderer/view', screenHtml);

  win.once('ready-to-show', () => {
    win.show();
  });

  await win.loadFile(file);

  if (isDev) win.webContents.openDevTools();

  return win;
}

module.exports = { create };
