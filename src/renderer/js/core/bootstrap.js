/**
 * @FileName     : bootstrap.js
 * @Description  : 렌더러 초기화 순서 오케스트레이터
 *                 순서: settings → license → FeatureLayer → modules
 * @Modification :
 *
 * 수정일         수정자      수정내용
 * ──────────── ───────── ───────────────────────────────
 * 2026.06.15.   develJan  최초생성
 * 2026.06.16.   develJan  데모 UI 기준 부팅 로그/활동 연동
 *
 * @author  develJan
 * @since   2026.06.15
 * @version 1.1.0
 *
 * Copyright (C) 2026 by develJan Media All right reserved.
 */

import { State }         from './state.js';
import { EventBus }      from './eventBus.js';
import ipcClient         from './ipcClient.js';
import * as FeatureLayer from '../editions/featureLayer.js';
import * as ProUI        from '../editions/pro/pro-ui.js';
import * as StandardUI   from '../editions/standard/standard-ui.js';

import * as TabManager     from '../modules/tab-manager/tab-manager.module.js';
import * as ModalModule    from '../modules/modal/modal.module.js';
import * as LicenseModule  from '../modules/license/license.module.js';
import * as SettingsModule from '../modules/settings/settings.module.js';
import * as SidebarModule  from '../modules/sidebar/sidebar.module.js';
import * as DemoModule     from '../modules/demo/demo.module.js';

/**
 * @description 렌더러 부트스트랩
 * @returns {Promise<void>}
 */
export async function bootstrap() {
  console.group('[Bootstrap] 렌더러 초기화 시작');
  try {

    // 1. 앱 정보 로드
    const appInfo = await ipcClient.app.getVersion();
    State.setAppInfo(appInfo);
    _updateAppInfoUI(appInfo);
    console.log('[Bootstrap] 앱 정보 로드 완료:', appInfo.version);

    // 2. 설정 로드 → 테마 적용
    await SettingsModule.init();

    // 3. 공통 인프라 모듈 (탭, 모달)
    TabManager.init();
    ModalModule.init();

    // 4. 사이드바
    SidebarModule.init();

    // 5. 피처 그리드/로그 뷰 (라이선스 확인 전에 먼저 렌더링)
    DemoModule.init();

    // 6. 라이선스 상태 조회 → State
    const licResult = await ipcClient.license.getStatus();
    State.setLicense(licResult);

    if (licResult.edition === 'pro') ProUI.init();
    else StandardUI.init();

    // 7. 라이선스 모듈 (설정 탭 UI 바인딩)
    await LicenseModule.init();

    // 8. 부팅 활동 로그
    const edition = licResult.edition ?? 'standard';

    if (licResult.status !== 'VALID') {
      DemoModule.appendDiagLog('WARN', 'License not verified');
    }

    DemoModule.appendDiagLog('INFO', `Edition set to: ${edition}`);

    // 9. Dev 패널
    if (ipcClient.isDev) {
      document.getElementById('devToolsSection')?.classList.remove('hidden');
    }

    // 10. 테마 변경 수신
    ipcClient.on('app:theme-changed', (theme) => State.setTheme(theme));

    console.log('[Bootstrap] 초기화 완료 ✓');

  } catch (err) {
    console.error('[Bootstrap] 초기화 실패:', err);
  } finally {
    console.groupEnd();
  }
}

/**
 * @description 앱 정보 UI 반영
 * @param {object} info
 * @returns {void}
 */
function _updateAppInfoUI(info) {
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('appName', info.name);
  set('appVersion', `v${info.version}`);
  set('footerVer',  info.version);
  set('footerAppId', info.appId);
}
