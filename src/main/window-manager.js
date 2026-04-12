'use strict';

const { BrowserWindow }  = require('electron');
const path               = require('path');
const { WINDOW, IS_DEV } = require('../../config/config');

let mainWin = null;

function createMainWindow() {
  mainWin = new BrowserWindow({
    width          : WINDOW.width,
    height         : WINDOW.height,
    minWidth       : WINDOW.minWidth,
    minHeight      : WINDOW.minHeight,
    backgroundColor: '#0d1117',
    frame          : false,
    titleBarStyle  : 'hidden',
    webPreferences : {
      preload         : path.join(__dirname, '../common/preload.js'),
      contextIsolation: true,
      nodeIntegration : false,
    },
  });

  mainWin.loadFile(path.join(__dirname, '../renderer/index.html'));

  if (IS_DEV) {
    mainWin.webContents.openDevTools({ mode: 'detach' });
  }

  mainWin.on('closed', () => { mainWin = null; });
  return mainWin;
}

function getMainWindow() { return mainWin; }

module.exports = { createMainWindow, getMainWindow };
