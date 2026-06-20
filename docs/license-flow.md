# License Flow

> `LicenseChecker.js` 기준 (v1.0.0 · 2026-04-01)  
> 관련 파일: `src/main/ipc/license.handlers.js`, `src/renderer/js/core/ipcClient.js`, `src/main/bootstrap.js`, `src/renderer/js/core/bootstrap.js`

---

## 1. 전체 검증 흐름

```
verify(licenseKey?)
  │
  ├─[mode=development + _sessionBypass 존재]──→ 세션 우회 결과 즉시 반환 ①
  │
  ├─ 라이선스 키 결정
  │    ├─ 인자로 전달된 licenseKey 우선
  │    └─ 없으면 _readFile() 로 파일에서 로드
  │
  ├─[키 없음]──────────────────────────────────→ NOT_FOUND 반환
  │
  ├─[masterKeys 에 등록된 키]──────────────────→ VALID (edition 직접 매핑) ③
  │
  ├─[mode=development + 'DEV-BYPASS-' prefix]──→ VALID (edition 추출) ②
  │
  ├─ AES-256-CBC 복호화 (_decrypt)
  │    └─[실패]──────────────────────────────→ INVALID 반환
  │
  ├─ appId 일치 검사
  │    └─[불일치]────────────────────────────→ APP_MISMATCH 반환
  │
  ├─ HWID 일치 검사  (payload.hwid !== 'DEV' 인 경우만)
  │    └─[불일치]────────────────────────────→ HWID_MISMATCH 반환
  │
  ├─ 만료일 검사  (payload.expiry !== 'PERMANENT' 인 경우만)
  │    └─[만료]──────────────────────────────→ EXPIRED 반환
  │
  ├─ 폐기 여부 검사  (payload.revoked === true)
  │    └─[폐기됨]────────────────────────────→ REVOKED 반환
  │
  └─ VALID 반환  (edition = payload.edition)
```

---

## 2. 반환 STATUS 정의

| STATUS | 의미 | edition 값 |
|---|---|---|
| `VALID` | 정상 라이선스 | `'standard'` or `'pro'` |
| `EXPIRED` | 만료된 라이선스 | payload의 edition (참고용) |
| `HWID_MISMATCH` | 다른 기기에서 발급된 키 | `null` |
| `APP_MISMATCH` | 다른 앱 ID로 발급된 키 | `null` |
| `REVOKED` | 관리자에 의해 폐기된 키 | `null` |
| `INVALID` | 복호화 실패 / 형식 오류 | `null` |
| `NOT_FOUND` | 라이선스 파일 없음 / 키 없음 | `null` |

---

## 3. Dev 모드 우회 상세

> `NODE_ENV=development` 환경에서만 유효하다.  
> production 빌드에서는 아래 3가지 모두 무효화된다.

### ① 세션 우회 — `devBypass(edition)`

```js
  // bootstrap.js (renderer, dev only)
const checker = new LicenseChecker();
checker.devBypass('pro');  // 또는 'standard'

  // 이후 verify() 호출마다 아래를 즉시 반환 (파일·복호화 없음)
  // { status: 'VALID', edition: 'pro', payload: { lid: 'DEV-BYPASS-...', hwid: 'DEV', ... } }
```

- `LicenseChecker._sessionBypass` 정적 필드에 캐싱.
- 앱 재시작 시 초기화된다.
- `mode !== 'development'` 이면 `devBypass()` 는 `INVALID` 를 반환하고 캐싱하지 않는다.

### ② 파일 우회 — `DEV-BYPASS-*` 키 저장

```
# 라이선스 파일에 직접 저장
DEV-BYPASS-PRO-KEY      → edition: 'pro'
DEV-BYPASS-STANDARD-KEY → edition: 'standard'
```

- `verify()` 내부에서 `key.startsWith('DEV-BYPASS-')` 로 감지.
- 복호화 없이 키 문자열에서 edition 을 추출한다.
- 재시작 후에도 파일이 남아 있으면 유지된다.

### ③ 마스터 키 — `APP_CONFIG.masterKeys`

```js
  // LicenseChecker.js — BuildManager 치환 대상 블록
const APP_CONFIG = {
  masterKeys: {
    'DEMO-STD-MASTER-9999': 'standard',
    'DEMO-PRO-MASTER-8888': 'pro',
  }
};
```

- `mode` 와 무관하게 동작한다.
- HWID·만료·폐기 검사를 전부 스킵하고 `expiry: 'PERMANENT'` 로 처리한다.
- **배포 전 BuildManager 가 반드시 실제 키로 치환해야 한다.**  
  `secretKey` (`REPLACE_WITH_YOUR_SECRET_KEY_32CH`) 도 동일하게 치환 대상이다.

---

## 4. 라이선스 파일 경로

```
  // Electron 환경
{app.getPath('userData')}/.{appId소문자}.license
  // 예: /Users/user/Library/Application Support/Demo/.cd01.license

  // Electron 외 환경 (fallback)
{os.homedir()}/.{appId소문자}.license
```

파일에는 라이선스 키 문자열만 저장된다 (UTF-8, trim).

---

## 5. AES-256-CBC 키 형식

```
{IV_Base64}.{CipherText}
```

- IV        : 16바이트, Base64 인코딩
- CipherText: AES-256-CBC + PKCS#7 패딩
- secretKey : 32자 (부족 시 `'0'` 으로 우측 패딩)
- 복호화 후 JSON 파싱 → payload 객체

### payload 필드

| 필드 | 타입 | 설명 |
|---|---|---|
| `lid` | string | 라이선스 ID |
| `appId` | string | 앱 ID (`'DM-APP-01'`) |
| `hwid` | string | 발급 당시 HWID (`'DEV'` 이면 HWID 검사 스킵) |
| `edition` | string | `'standard'` or `'pro'` |
| `expiry` | string | ISO 8601 날짜 또는 `'PERMANENT'` |
| `issued` | string | ISO 8601 발급일시 |
| `revoked` | boolean? | `true` 이면 폐기 처리 |

---

## 6. App Start → FeatureLayer 연결

```
src/main/bootstrap.js
  └─ registerAll IPC handlers (license:verify, license:save …)

src/renderer/js/core/bootstrap.js
  └─ ipcClient.license.getStatus()          ← core/ipcClient.js
       └─ LicenseService.verify()            ← main/services/license.service.js
            └─ LicenseChecker.verify()       ← shared/license/LicenseChecker.js
                 └─ { status, edition, payload }
  └─ State.setLicense({ status, edition })  ← core/state.js
  └─ FeatureLayer.init(edition)             ← shared/capabilities/feature-manager.js
       ├─ body[data-edition='pro' | 'standard'] 설정
       └─ .pro-only 요소 표시/숨김
  └─ Feature modules init()
```

`VALID` 이외의 status 가 반환되면 `edition` 값은 `null` 을 유지한다.  
렌더러는 `edition === null` 인 경우 UI 표시 라벨로 **'Free'** 를 사용한다  
(코드 레벨 edition 값은 `'standard'` / `'pro'` / `null` 세 가지뿐이며, `'Free'`는 `null`에 대한 표시용 라벨일 뿐 별도 edition 값이 아니다).  
`standard`로의 자동 폴백은 더 이상 하지 않는다.  
라이선스 입력 화면 분기 여부는 `bootstrap.js` 에서 별도로 결정한다.