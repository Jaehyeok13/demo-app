/**
 * @FileName     : trayManager.js
 * @Description  : 시스템 트레이 아이콘 + 컨텍스트 메뉴
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

const { Tray, Menu, app, nativeImage } = require('electron');
const path = require('path');

let _tray = null;

/**
 * @description 트레이 초기화
 * @param {BrowserWindow} mainWindow
 * @returns {void}
 */
function init(mainWindow) {
  const iconPath = path.join(__dirname, '../../../resources/icons/tray.png');
  const icon = nativeImage.createFromPath(iconPath);
  _tray = new Tray(icon.isEmpty() ? nativeImage.createEmpty() : icon);
  _tray.setToolTip('Demo');

  const menu = Menu.buildFromTemplate([
    { label: '열기',  click: () => { mainWindow.show(); mainWindow.focus(); } },
    { type : 'separator' },
    { label: '종료',  click: () => app.quit() },
  ]);

  _tray.setContextMenu(menu);
  _tray.on('click', () => { mainWindow.show(); mainWindow.focus(); });
}

module.exports = { init };
