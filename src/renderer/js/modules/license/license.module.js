/**
 * @FileName     : license.module.js
 * @Description  : 라이선스 상태 조회 + State 저장 + Dev 우회 패널 흐름 제어
 *                 ※ DOM 조작 금지 / innerHTML 금지 / querySelector 금지
 * @Modification :
 *
 * 수정일         수정자      수정내용
 * ──────────── ───────── ───────────────────────────────
 * 2026.06.15.   develJan  최초생성
 * 2026.06.16.   develJan  신버전 아키텍처 기준 재정비
 *
 * @author  develJan
 * @since   2026.06.15
 * @version 1.1.0
 *
 * Copyright (C) 2026 by develJan Media All right reserved.
 */

import { State }           from '../../core/state.js';
import { EventBus }        from '../../core/eventBus.js';
import * as FeatureLayer   from '../../editions/featureLayer.js';
import * as LicenseService from './services/license.service.js';
import * as LicenseView    from './views/license.view.js';

/**
 * @description 라이선스 모듈 초기화
 * @returns {Promise<void>}
 */
export async function init() {
  console.group('[License] 초기화');
  try {
    // HWID 조회 → 뷰 반영
    const hwid = await LicenseService.getHwid();
    LicenseView.renderHwid(hwid);

    // 현재 State 기준 UI 반영
    const result = State.get().license;
    LicenseView.renderStatus(LicenseService.parseResult(result));

    // 뷰 이벤트 바인딩
    LicenseView.init({
      onVerify   : (key)     => _handleVerify(key),
      onDevBypass: (edition) => _handleDevBypass(edition),
      onDevReset : ()        => _handleDevReset(),
    });

    // 라이선스 상태 변경 시 뷰 자동 갱신
    EventBus.on('state:license', (result) => {
      LicenseView.renderStatus(LicenseService.parseResult(result));
    });

    console.log('[License] 초기화 완료');
  } catch (err) {
    console.error('[License] 초기화 실패:', err);
  } finally {
    console.groupEnd();
  }
}

/**
 * @description 라이선스 검증 처리
 * @param {string} key
 * @returns {Promise<void>}
 */
async function _handleVerify(key) {
  console.group('[License] 검증 시작');
  try {
    if (!key?.trim()) {
      LicenseView.showMessage('라이선스 키를 입력해주세요.', 'warning');
      return;
    }
    LicenseView.setLoading(true);
    const result = await LicenseService.verify(key.trim());

    // State 갱신 → EventBus 자동 발행 → FeatureLayer 적용
    State.setLicense(result);
    FeatureLayer.init(result.edition ?? 'standard');

    if (result.status === 'VALID') {
      const label = result.edition === 'pro' ? 'Pro' : 'Standard';
      LicenseView.showMessage(`인증 성공 — ${label} Edition 활성화`, 'success');
      EventBus.emit('license:verified', result);
    } else {
      const { statusText } = LicenseService.parseResult(result);
      LicenseView.showMessage(`인증 실패: ${statusText}`, 'error');
    }
  } catch (err) {
    console.error('[License] 검증 실패:', err);
    LicenseView.showMessage('오류가 발생했습니다. 다시 시도해주세요.', 'error');
  } finally {
    LicenseView.setLoading(false);
    console.groupEnd();
  }
}

/**
 * @description Dev 우회 처리
 * @param {string} edition
 * @returns {Promise<void>}
 */
async function _handleDevBypass(edition) {
  console.group('[License] Dev 우회');
  try {
    const result = await LicenseService.devBypass(edition);
    State.setLicense(result);
    FeatureLayer.init(edition);
    LicenseView.showMessage(`Dev 우회 — ${edition} 적용`, 'success');
    EventBus.emit('license:verified', result);
    console.log('[License] Dev 우회 완료:', edition);
  } catch (err) {
    console.error('[License] Dev 우회 실패:', err);
  } finally {
    console.groupEnd();
  }
}

/**
 * @description Dev 초기화 처리
 * @returns {Promise<void>}
 */
async function _handleDevReset() {
  console.group('[License] Dev 초기화');
  try {
    const result = await LicenseService.devReset();
    State.setLicense(result);
    FeatureLayer.init('standard');
    LicenseView.showMessage('라이선스 초기화 완료', 'success');
    console.log('[License] Dev 초기화 완료');
  } catch (err) {
    console.error('[License] Dev 초기화 실패:', err);
  } finally {
    console.groupEnd();
  }
}
