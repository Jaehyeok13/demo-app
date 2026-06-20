/**
 * @FileName     : ipc.constants.js
 * @Description  : IPC 채널명 상수
 * @Modification :
 *
 * 수정일         수정자      수정내용
 * ──────────── ───────── ───────────────────────────────
 * 2026.04.01.   develJan  최초생성
 * 2026.06.16.   develJan  .mjs dual module 분리 제거
 *
 * @author  develJan
 * @since   2026.04.01
 * @version 1.0.2
 *
 * Copyright (C) 2026 by develJan Media All right reserved.
 */

'use strict';

const IPC = {
  LICENSE : {
    GET_HWID   : 'license:getHwid',
    GET_STATUS : 'license:getStatus',
    VERIFY     : 'license:verify',
    DEV_BYPASS : 'license:devBypass',
    DEV_RESET  : 'license:devReset',
  },
  SETTINGS: {
    GET    : 'settings:get',
    SET    : 'settings:set',
    GET_ALL: 'settings:getAll',
    RESET  : 'settings:reset',
  },
  ITEM    : {
    GET_ALL: 'item:getAll',
    GET    : 'item:get',
    CREATE : 'item:create',
    UPDATE : 'item:update',
    DELETE : 'item:delete',
  },
  APP     : {
    GET_VERSION : 'app:getVersion',
    GET_PATH    : 'app:getPath',
    SHOW_DIALOG : 'app:showDialog',
    RESTART     : 'app:restart',
  },
};

module.exports = { IPC };
