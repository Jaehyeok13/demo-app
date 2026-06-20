/**
 * @FileName     : preload.js
 * @Description  : Electron Preload Script — Renderer와 Main 사이의 가교
 * @Modification :
 *
 * 수정일         수정자      수정내용
 * ──────────── ───────── ───────────────────────────────
 * 2026.04.01.   develJan  최초생성
 * 2026.06.15.   develJan  신버전 아키텍처 적용 (settings/item 추가, workflow 제거)
 *
 * @author  develJan
 * @since   2026.04.01
 * @version 1.1.0
 *
 * Copyright (C) 2026 by develJan Media All right reserved.
 */

'use strict';

const { contextBridge, ipcRenderer } = require('electron');
const { IPC } = require('../shared/constants/ipc.constants');

const args    = process.argv.slice(2);
const modeArg = args.find(a => a.startsWith('--mode='));
const MODE    = modeArg ? modeArg.split('=')[1] : (process.env.NODE_ENV || 'production');
const IS_DEV  = MODE === 'development' || args.includes('--inspect') || args.includes('--inspect-brk');

contextBridge.exposeInMainWorld('electronAPI', {
  send: (channel, ...args) => {
    const allowed = ['win:minimize', 'win:maximize', 'win:close'];
    if (allowed.includes(channel)) ipcRenderer.send(channel, ...args);
  },
  license: {
    getHwid  : ()        => ipcRenderer.invoke(IPC.LICENSE.GET_HWID),
    getStatus: ()        => ipcRenderer.invoke(IPC.LICENSE.GET_STATUS),
    verify   : (key)     => ipcRenderer.invoke(IPC.LICENSE.VERIFY, key),
    devBypass: (edition) => ipcRenderer.invoke(IPC.LICENSE.DEV_BYPASS, edition),
    devReset : ()        => ipcRenderer.invoke(IPC.LICENSE.DEV_RESET),
  },
  settings: {
    get   : (key)        => ipcRenderer.invoke(IPC.SETTINGS.GET, key),
    set   : (key, value) => ipcRenderer.invoke(IPC.SETTINGS.SET, key, value),
    getAll: ()           => ipcRenderer.invoke(IPC.SETTINGS.GET_ALL),
    reset : ()           => ipcRenderer.invoke(IPC.SETTINGS.RESET),
  },
  item: {
    getAll: ()           => ipcRenderer.invoke(IPC.ITEM.GET_ALL),
    get   : (id)         => ipcRenderer.invoke(IPC.ITEM.GET, id),
    create: (data)       => ipcRenderer.invoke(IPC.ITEM.CREATE, data),
    update: (id, data)   => ipcRenderer.invoke(IPC.ITEM.UPDATE, id, data),
    delete: (id)         => ipcRenderer.invoke(IPC.ITEM.DELETE, id),
  },
  app: {
    getVersion : () => ipcRenderer.invoke(IPC.APP.GET_VERSION),
    getPath    : () => ipcRenderer.invoke(IPC.APP.GET_PATH),
    showDialog : (options) => ipcRenderer.invoke(IPC.APP.SHOW_DIALOG, options),
    restart    : () => ipcRenderer.invoke(IPC.APP.RESTART),
  },
  on: (channel, fn) => {
    const allowed = ['app:theme-changed'];
    if (allowed.includes(channel)) {
      const wrapper = (_, ...args) => fn(...args);
      ipcRenderer.on(channel, wrapper);
      return () => ipcRenderer.removeListener(channel, wrapper);
    }
  },
  platform: process.platform,
  isDev   : IS_DEV,
});
