# Edition Flow

## 흐름

```
LicenseChecker.verify()
  → { status: 'VALID', edition: 'pro' }
  ↓
State.setLicense(result)          ← core/state.js
  → State.edition                 = 'pro'
  → document.body.dataset.edition = 'pro'
  ↓
FeatureLayer.init('pro')          ← shared/capabilities/feature-manager.js
  → CAPABILITY_MAP['pro'] 로드
  → .pro-only 요소 hidden 제거
  → .standard-only 요소 hidden 추가
  ↓
CSS 자동 분기
  body[data-edition='pro'] .pro-panel { display: block }
```

## 기능 추가 체크리스트

- [ ] `shared/capabilities/capability-map.js` 에 기능 키 추가
- [ ] `renderer/js/editions/featureLayer.js` 에 DOM 제어 추가 (필요 시)
- [ ] HTML에 `.pro-only` 클래스 추가
- [ ] CSS에 `body[data-edition='pro'] .xxx` 규칙 추가

## Master Key

개발/운영 테스트용 마스터 키는 `src/main/config.js → APP.masterKeys` 에 정의.
LicenseChecker가 우선 체크하므로 실제 암호화 없이 즉시 VALID 처리됨.