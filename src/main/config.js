/**
 * @FileName     : config.js
 * @Description  : 전역 설정 중앙 관리 — APP.id / secretKey / masterKeys / PATHS
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

const { app } = require('electron');
const path    = require('path');

const args    = process.argv.slice(2);
const modeArg = args.find(a => a.startsWith('--mode='));
const MODE    = modeArg ? modeArg.split('=')[1] : (process.env.NODE_ENV || 'production');

const isDev = MODE === 'development'
  || args.includes('--inspect')
  || args.includes('--inspect-brk');

const APP = {
  name: 'Demo App',
  id  : 'DM-APP-01',
    // BuildManager 배포 전 실제 키로 교체
  secretKey : 'REPLACE_WITH_YOUR_SECRET_KEY_32CH',
  masterKeys: {
    'DEMO-STD-MASTER-9999': 'standard',
    'DEMO-PRO-MASTER-8888': 'pro',
  },
};

const PATHS = {
  LOGS: path.join(app.getPath('userData'), 'logs'),
  DATA: app.getPath('userData'),
};

module.exports = { APP, PATHS, isDev, MODE };

