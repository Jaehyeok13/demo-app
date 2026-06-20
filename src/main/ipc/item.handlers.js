/**
 * @FileName     : item.handlers.js
 * @Description  : 아이템(데이터) 관련 IPC 핸들러
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

const { ipcMain }   = require('electron');
const ItemService   = require('../services/item.service');
const { IPC }       = require('../../shared/constants/ipc.constants');

function registerItemHandlers() {
  ipcMain.handle(IPC.ITEM.GET_ALL, async () => ItemService.getAll());
  ipcMain.handle(IPC.ITEM.GET,     async (_e, id) => ItemService.getById(id));
  ipcMain.handle(IPC.ITEM.CREATE,  async (_e, data) => ItemService.create(data));
  ipcMain.handle(IPC.ITEM.UPDATE,  async (_e, id, data) => ItemService.update(id, data));
  ipcMain.handle(IPC.ITEM.DELETE,  async (_e, id) => ItemService.remove(id));
}

module.exports = { registerItemHandlers };
