'use strict';

const { contextBridge, ipcRenderer } = require('electron');

    // IS_DEV 감지 (메인 프로세스 인자 및 디버깅 포트 확인)
const IS_DEV = process.argv.includes('--inspect') ||
               process.argv.includes('--remote-debugging-port') ||
               process.env.NODE_ENV === 'development';

contextBridge.exposeInMainWorld('electronAPI', {

      // ── 창 컨트롤 ────────────────────────────
  send: (channel) => {
    const allowed = ['win:minimize', 'win:maximize', 'win:close'];
    if (allowed.includes(channel)) ipcRenderer.send(channel);
  },

      // ── 라이선스 ─────────────────────────────
  license: {
    getHwid  : ()        => ipcRenderer.invoke('license:hwid'),
    getStatus: ()        => ipcRenderer.invoke('license:status'),
    register : (key)     => ipcRenderer.invoke('license:register', key),
    devBypass: (edition) => ipcRenderer.invoke('license:dev-bypass', edition),
  },

      // ── 앱 정보 ──────────────────────────────
  app: {
    getInfo: () => ipcRenderer.invoke('app:info'),
  },

      // ── 환경 정보 ──
  platform: process.platform,
  isDev   : IS_DEV,
});
