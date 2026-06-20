/**
 * @FileName     : app.handlers.js
 * @Description  : 앱 전역 및 창 컨트롤 IPC 핸들러
 * @Modification :
 *
 * 수정일         수정자      수정내용
 * ──────────── ───────── ───────────────────────────────
 * 2026.04.01.   develJan  최초생성
 * 2026.06.15.   develJan  신버전 아키텍처 적용 (workflow/stats/설정 중복 핸들러 제거)
 *
 * @author  develJan
 * @since   2026.04.01
 * @version 1.1.0
 *
 * Copyright (C) 2026 by develJan Media All right reserved.
 */

'use strict';

const { ipcMain, BrowserWindow, app, dialog } = require('electron');
const { IPC }        = require('../../shared/constants/ipc.constants');
const { APP, isDev } = require('../config');

/**
 * @description 앱 전역 및 창 컨트롤 IPC 핸들러 등록
 * @returns {void}
 */
function registerAppHandlers() {
  ipcMain.on('win:minimize', (event) => {
    BrowserWindow.fromWebContents(event.sender)?.minimize();
  });

  ipcMain.on('win:maximize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win?.isMaximized()) win.unmaximize();
    else win?.maximize();
  });

  ipcMain.on('win:close', (event) => {
    BrowserWindow.fromWebContents(event.sender)?.close();
  });

  ipcMain.handle(IPC.APP.GET_VERSION, () => ({
    name    : APP.name,
    version : app.getVersion(),
    isDev   : isDev,
    platform: process.platform,
    appId   : APP.id,
  }));

  ipcMain.handle(IPC.APP.GET_PATH, () => ({
    userData: app.getPath('userData'),
    logs    : app.getPath('logs'),
  }));

  ipcMain.handle(IPC.APP.SHOW_DIALOG, async (event, options) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    return await dialog.showMessageBox(win, options);
  });

  ipcMain.handle(IPC.APP.RESTART, () => {
    app.relaunch();
    app.exit(0);
  });
}

module.exports = { registerAppHandlers };
