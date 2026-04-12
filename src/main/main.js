'use strict';

const { app, ipcMain } = require('electron');
const path             = require('path');

  // ── config는 main 프로세스에서만 require ──────
const { APP, MODE, IS_DEV }               = require('../../config/config');
const { createMainWindow, getMainWindow } = require('./window-manager');
const LicenseChecker                      = require('../common/license-checker');

if (IS_DEV) {
  try { require('electron-reloader')(module, { ignore: ['dist/'] }); } catch {}
}

app.commandLine.appendSwitch('lang', 'ko');

const checker = new LicenseChecker({ 
  mode     : MODE,
  appId    : APP.id,
  secretKey: 'VxqGEnBakj2jBF8lOTJihBE1h1dkLQIDheFNwpsn'
});
global.licenseState = { status: 'NOT_FOUND', edition: null, payload: null };

  // ══════════════════════════════════════════════
  // 앱 시작
  // ══════════════════════════════════════════════
app.whenReady().then(async () => {
  console.group('[Main] app.whenReady()');
  
  try {
    global.licenseState = await checker.verify();

    console.info('─'.repeat(50));
    console.info(`  ${APP.name} v${APP.version}  [${MODE}]`);
    console.info(`  License Status: ${global.licenseState.status}`);
    console.info(`  Edition       : ${global.licenseState.edition || 'NONE'}`);
    console.info(`  IS_DEV        : ${IS_DEV}`);
    console.info('─'.repeat(50));

    createMainWindow();
  } catch (err) {
    console.error('Error during app initialization:', err);
  } finally {
    console.groupEnd();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
app.on('activate', () => {
  if (!getMainWindow()) createMainWindow();
});

  // ══════════════════════════════════════════════
  // IPC — 창 컨트롤
  // ══════════════════════════════════════════════
ipcMain.on('win:minimize', () => getMainWindow()?.minimize());
ipcMain.on('win:maximize', () => {
  const w = getMainWindow();
  w?.isMaximized() ? w.unmaximize(): w?.maximize();
});
ipcMain.on('win:close', () => getMainWindow()?.close());

  // ══════════════════════════════════════════════
  // IPC — 라이선스
  // ══════════════════════════════════════════════
ipcMain.handle('license:hwid', async () => {
  console.info('[IPC] license:hwid 요청');
  return await checker.getHwid();
});

ipcMain.handle('license:status', () => {
  console.info('[IPC] license:status 요청 ->', global.licenseState.status);
  return global.licenseState;
});

ipcMain.handle('license:register', async (_, key) => {
  console.group('[IPC] license:register');
  
  const result = await checker.verify(key);
  if (result.status === LicenseChecker.STATUS.VALID) {
    checker.saveLicense(key);
    result.key          = key;     // 원본 키 포함
    global.licenseState = result;
    console.info('License registration successful');
  } else {
    console.warn('License registration failed:', result.status);
  }
  
  console.groupEnd();
  return result;
});

  // ── DEV 우회 ──────────────────────────────────
ipcMain.handle('license:dev-bypass', (_, edition = 'pro') => {
  console.group('[IPC] license:dev-bypass');
  
    // IS_DEV 체크는 보안상 main에서 다시 확인
  if (!IS_DEV) {
    console.warn('dev-bypass 시도 차단 — production 모드');
    console.groupEnd();
    return { status: 'INVALID', edition: null, payload: null };
  }
  
  console.info(`🔓 DEV BYPASS 요청 — edition: ${edition}`);
  const result              = checker.devBypass(edition);
        global.licenseState = result;
  
  console.groupEnd();
  return result;
});

  // ══════════════════════════════════════════════
  // IPC — 앱 정보
  // ══════════════════════════════════════════════
ipcMain.handle('app:info', () => {
  return {
    name    : APP.name,
    version : APP.version,
    appId   : APP.id,
    mode    : MODE,
    isDev   : IS_DEV,
    platform: process.platform,
  };
});
