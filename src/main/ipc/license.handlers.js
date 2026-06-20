/**
 * @FileName     : license.handlers.js
 * @Description  : 라이선스 관련 IPC 핸들러
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

const { ipcMain }    = require('electron');
const { IPC }        = require('../../shared/constants/ipc.constants');
const LicenseService = require('../services/license.service');

function registerLicenseHandlers() {
  ipcMain.handle(IPC.LICENSE.GET_HWID,   () => LicenseService.getHwid());
  ipcMain.handle(IPC.LICENSE.GET_STATUS, () => LicenseService.getStatus());
  ipcMain.handle(IPC.LICENSE.VERIFY,     async (_, key) => LicenseService.verify(key));
  ipcMain.handle(IPC.LICENSE.DEV_BYPASS, (_, edition) => LicenseService.devBypass(edition));
  ipcMain.handle(IPC.LICENSE.DEV_RESET,  () => LicenseService.devReset());
}

module.exports = { registerLicenseHandlers };
