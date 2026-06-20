/**
 * @FileName     : bootstrap.js
 * @Description  : 앱 초기화 오케스트레이터 — 순서 제어 중앙화
 *                 순서: Logger → IPC 등록 → Window → Tray
 * @Modification :
 *
 * 수정일         수정자      수정내용
 * ──────────── ───────── ───────────────────────────────
 * 2026.04.01.   develJan  최초생성
 * 2026.06.15.   develJan  로그 한글화
 *
 * @author  develJan
 * @since   2026.04.01
 * @version 1.0.1
 *
 * Copyright (C) 2026 by develJan Media All right reserved.
 */

'use strict';

const { app }       = require('electron');
const MainWindow    = require('./windows/main.window');
const SplashWindow  = require('./windows/splash.window');
const TrayManager   = require('./tray/trayManager');
const IpcRegistry   = require('./ipc/index');
const LoggerService = require('./services/logger.service');

let _mainWindow = null;

/**
 * @description 앱 최초 실행 초기화
 *              순서: Logger → IPC 등록 → 라이선스 사전 검증 → Window → Tray
 * @returns {Promise<void>}
 */
async function init() {
  try {
    LoggerService.init();
    LoggerService.info('[Bootstrap] 앱 시작 중...');

    const splash = SplashWindow.create();
    const updateSplash = (msg) => {
      if (splash && !splash.isDestroyed()) {
        splash.webContents.executeJavaScript(`document.getElementById('splashStatus').textContent = "${msg}";`);
      }
    };

    updateSplash('로깅 시스템 초기화...');
    await new Promise(resolve => setTimeout(resolve, 300));

    IpcRegistry.registerAll();
    LoggerService.info('[Bootstrap] IPC 핸들러 등록 완료');
    updateSplash('IPC 핸들러 등록 완료...');
    await new Promise(resolve => setTimeout(resolve, 300));

    const LicenseService = require('./services/license.service');
    updateSplash('라이선스 정보 확인 중...');
    const licenseResult  = await LicenseService.verify();
    LoggerService.info(`[Bootstrap] 라이선스 검증 완료 — edition: ${licenseResult.edition ?? 'standard'}`);
    await new Promise(resolve => setTimeout(resolve, 400));

    updateSplash('메인 윈도우 생성 중...');
    await new Promise(resolve => setTimeout(resolve, 500));

    _mainWindow = await MainWindow.create(licenseResult.edition);
    splash.close();
    LoggerService.info('[Bootstrap] 메인 윈도우 생성 완료');

    TrayManager.init(_mainWindow);
    LoggerService.info('[Bootstrap] 트레이 초기화 완료');

    LoggerService.info('[Bootstrap] 앱 준비 완료');
  } catch (err) {
    LoggerService.error('[Bootstrap] 초기화 실패:', err);
    app.quit();
  }
}

/**
 * @description macOS: Dock 아이콘 클릭 시 윈도우 복원
 * @returns {void}
 */
function onActivate() {
  if (!_mainWindow || _mainWindow.isDestroyed()) {
    MainWindow.create().then(w => { _mainWindow = w; });
  } else {
    _mainWindow.show();
  }
}

/**
 * @description 두 번째 인스턴스 실행 시 기존 윈도우 포커스
 * @returns {void}
 */
function onSecondInstance() {
  if (_mainWindow) {
    if (_mainWindow.isMinimized()) _mainWindow.restore();
    _mainWindow.focus();
  }
}

module.exports = { init, onActivate, onSecondInstance };
