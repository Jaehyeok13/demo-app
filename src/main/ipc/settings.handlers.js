/**
 * @FileName     : settings.handlers.js
 * @Description  : 설정 관련 IPC 핸들러
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

const { ipcMain }     = require('electron');
const SettingsService = require('../services/settings.service');
const { IPC }         = require('../../shared/constants/ipc.constants');

function registerSettingsHandlers() {
  ipcMain.handle(IPC.SETTINGS.GET,     async (_e, key) => SettingsService.get(key));
  ipcMain.handle(IPC.SETTINGS.SET,     async (_e, key, value) => SettingsService.set(key, value));
  ipcMain.handle(IPC.SETTINGS.GET_ALL, async () => SettingsService.getAll());
  ipcMain.handle(IPC.SETTINGS.RESET,   async () => SettingsService.reset());
}

module.exports = { registerSettingsHandlers };
