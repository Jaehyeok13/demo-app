# Architecture Overview

## 핵심 설계 원칙

```
License → Capability → UI → Feature
```

Single App + Edition Layer 구조.  
앱을 여러 벌로 만들지 않는다.

모든 UI 기능은 Edition(Standard / Pro)에 관계없이 동일한 Feature 단위 구조로 관리한다.  
Edition 간 차이는 구조가 아닌 **기능 활성화 여부**와 **HTML 분리 여부**로만 구분한다.

---

## 기술 스택

| 구분 | 기술 |
|---|---|
| 런타임 | Electron 33 |
| 렌더러 | ES Modules + jQuery 3.7 + Lodash 4 |
| 에디터 | ToastUI Editor (Markdown / WYSIWYG 전환) |
| 스타일 | CSS 변수 기반 다크/라이트/시스템 테마 |
| 데이터 | JSON 파일 (userData 폴더) |
| 정렬 | SortableJS |
| 빌드 | electron-builder |
| 암호화 | crypto-js (AES-256-CBC) |
| ID 생성 | nanoid |

> jQuery와 Lodash는 렌더러(Renderer) 전용이다.  
> Main 프로세스(Node.js)에서는 사용하지 않는다.

---

## 프로세스 레이어 구조

```
┌─────────────────────────────────────────────────────────┐
│                    렌더러 프로세스                        │
│  *.html (정적 골격)                                      │
│  ES Modules + jQuery + Lodash                           │
│  Feature Modules (module / views / service / state)     │
├─────────────────────────────────────────────────────────┤
│                    preload.js                           │
│  contextBridge — window.electronAPI (최소 권한만 노출)    │
├─────────────────────────────────────────────────────────┤
│                    메인 프로세스                          │
│  main.js / bootstrap.js / ipc/*.handlers.js             │
│  창 관리 · 트레이 · 파일 I/O · 라이선스                     │
└─────────────────────────────────────────────────────────┘
```

---

## 레이어 책임 원칙

| 레이어 | 파일 위치 | 역할 | 절대 금지 |
|---|---|---|---|
| View | `modules/*/views/*.view.js` | HTML 생성 + DOM 이벤트 바인딩 | IPC 호출, 비즈니스 로직, state mutation |
| Module | `modules/*/*.module.js` | 비즈니스 흐름 제어 + View/Service 조립 | DOM 조작, innerHTML, querySelector |
| Service | `modules/*/*.service.js` | ipcClient 호출 + 데이터 가공 + 캐싱 | DOM 접근, EventBus emit, 상태 직접 변경 |
| State | `core/state.js` + `modules/*/xxx.state.js` | 전역/로컬 상태 SSOT. setter 경유만 허용 | 직접 mutation (`STATE.x = ...`) |
| IPC Client | `core/ipcClient.js` | 모든 IPC 단일 게이트웨이 | DOM 접근, 상태 직접 변경 |
| Main | `main/ipc/*.handlers.js` | IPC 수신 + 서비스 위임 + 파일 I/O | UI 렌더링, Renderer 상태 접근 |

---

## 데이터 흐름

```
사용자 액션
    ↓
View (modules/*/views/*.view.js)   — DOM 이벤트만 수신 → module 콜백 전달
    ↓
Module (modules/*/*.module.js)     — 비즈니스 흐름 제어
    ↓
Service (modules/*/*.service.js)   — 데이터 처리 요청
    ↓
ipcClient.js                       — IPC 단일 게이트웨이
    ↓
Main Process                       — 핸들러 → 서비스 → 파일 I/O
    ↓
EventBus.emit()                    — 결과 전파
    ↓
State.set()                        — 상태 갱신 + body.dataset 동기화
    ↓
View 재렌더                        — eventBus.on() 구독 View가 처리
```

---

## Feature Based Architecture

모든 기능은 Edition에 관계없이 동일한 Feature 단위 구조를 사용한다.

### Feature 기본 구조

```
modules/xxx/
├─ xxx.module.js              ← EventBus 구독 + View/Service 조립 + 흐름 제어
├─ xxx.service.js             ← ipcClient 호출 + 데이터 가공 (필요 시)
├─ xxx.state.js               ← Feature 로컬 상태 (필요 시)
└─ views/
   └─ xxx.view.js             ← HTML 생성 + DOM 이벤트 바인딩
```

### 파일 간 의존 방향

```
module.js
  ├─→ views/xxx.view.js     (렌더링 위임)
  ├─→ xxx.service.js        (데이터 처리 위임)
  └─→ xxx.state.js          (상태 조회/변경)

views/xxx.view.js
  └─→ module.js             (DOM 이벤트를 module로 콜백 전달만)

xxx.service.js
  └─→ ipcClient.js          (IPC 단일 게이트웨이)
```

### Feature 목록

| Feature | 폴더 | Edition |
|---|---|---|
| 아이템 생성 | `modules/create/` | All |
| 아이템 상세 | `modules/item-detail/` | All |
| 워크스페이스 관리 | `modules/workspace-manager/` | All |
| 태그 관리 | `modules/tag-manager/` | Pro |
| 상태값 관리 | `modules/status-manager/` | Pro |
| 사이드바 | `modules/sidebar/` | All |
| 공통 모달 | `modules/modal/` | All |
| 에디터 | `modules/editor/` | All |
| 커맨드 팔레트 | `modules/command/` | All |
| 탭 전환 | `modules/tab-manager/` | All |

---

## Edition 분기 전략 (혼합형)

Edition 간 차이를 두는 방법은 두 가지이며, 상황에 따라 선택한다.

### 전략 A — HTML 하나 + CSS/DOM 토글

골격은 동일하고 **기능·버튼 일부만 차이날 때** 사용한다.

```css
body[data-edition='pro'] .pro-panel { display: block; }
```

```js
FeatureLayer.can('bulkExport')   // → true(pro) / false(standard)
```

```html
<div class="pro-only hidden">...</div>
<!-- FeatureLayer.init() 시 자동 토글 -->
```

### 전략 B — HTML 두 개

**레이아웃·플로우·UI/UX 자체가 다를 때** 사용한다.

```
renderer/view/
├─ workspace-manager.html          ← Standard
└─ workspace-manager-pro.html      ← Pro
```

Main 프로세스에서 Edition에 따라 다른 HTML을 로드한다.

화면별 전략(A/B)과 파일명은 `shared/constants/screen-strategy.map.js` 에서 단일 관리하며,
`main.window.js` 는 이 맵을 조회만 한다 (분기 로직 하드코딩 금지).

```js
// main/windows/main.window.js
import { resolveScreenHtml } from '../../shared/constants/screen-strategy.map.js';

const file = resolveScreenHtml('workspace-manager', edition);
win.loadFile(file);
```

새 화면을 전략 B로 추가할 때는 `main.window.js` 를 수정하지 않고
`screen-strategy.map.js` 의 `SCREEN_STRATEGY` 에 항목만 추가한다.

### 전략 B — CSS / JS 처리

**CSS**
Pro HTML에서 Pro 전용 CSS를 직접 link한다. 오버라이드가 아닌 별도 파일로 관리.

컴포넌트 스타일은 `components/` 안에서 `common/` 과 `pro/` 폴더로 구분한다.

```
css/components/
├─ common/                        ← Standard / Pro 공통 컴포넌트
│  ├─ modal.css
│  └─ button.css
└─ components/
   ├─ button.css		  ← Standard / Pro 분리
   └─ button-pro.css
```

```html
<!-- workspace-manager-pro.html -->
<link rel="stylesheet" href="../css/components/pro/workspace-manager-pro.css">
```

**JS (View 분리)**
Module/Service는 공유, View 파일만 분리한다.

```
modules/workspace-manager/
├─ workspace-manager.module.js      ← 공통
├─ workspace-manager.service.js     ← 공통
└─ views/
   ├─ workspace-manager.view.js          ← Standard HTML에서 import
   └─ workspace-manager-pro.view.js      ← Pro HTML에서 import
```

### 전략 선택 기준

| 상황 | 전략 |
|---|---|
| 버튼·패널·메뉴 일부 차이 | A (HTML 하나 + 토글) |
| 레이아웃·플로우 자체가 다름 | B (HTML 두 개) |
| Pro 전용 완전히 새 화면 | B (HTML 두 개) |

> 어느 전략을 선택했는지는 `README.md` 의 화면별 Edition 분기 현황표에 기록한다.

---

## License Flow

```
App Start
  ↓
bootstrap.js (main)
  ↓ registerAll IPC
  ↓ MainWindow.create()
  ↓
bootstrap.js (renderer)
  ↓ ipcClient.license.getStatus()
  ↓ STATE.setLicense(result)
  ↓ FeatureLayer.init(edition)
  ↓ CSS body[data-edition] 자동 분기
  ↓ Feature modules init()
```

### Dev 모드 우회 (NODE_ENV=development 한정)

운영 검증 로직을 건드리지 않고 렌더러 개발을 진행할 수 있도록 3가지 우회 경로를 제공한다.  
**production 빌드에서는 아래 3가지 모두 동작하지 않는다.**

| 방식 | 트리거 | 동작 | 비고 |
|---|---|---|---|
| **세션 우회** | `LicenseChecker.devBypass('pro')` 호출 | `_sessionBypass` 정적 필드에 결과를 캐싱. 이후 `verify()` 호출 시 파일/복호화 없이 즉시 반환 | 앱 재시작 시 초기화 |
| **파일 우회** | `DEV-BYPASS-PRO-KEY` (또는 `-STD-`) 형식의 키를 라이선스 파일에 저장 | `verify()` 내부에서 prefix 감지 → 복호화 없이 edition 추출 후 VALID 반환 | 재시작 후에도 유지 |
| **마스터 키** | `APP_CONFIG.masterKeys` 에 등록된 키를 라이선스 파일에 저장 | 복호화 없이 edition 직접 매핑 → HWID·만료 검사 전부 스킵 | 빌드 시 BuildManager가 교체 |

> 세션 우회(방식 1)와 파일 우회(방식 2)는 `mode === 'development'` 조건으로 분기한다.  
> 마스터 키(방식 3)는 mode와 무관하게 동작하므로 **배포 전 반드시 BuildManager 치환 대상(`REPLACE_WITH_YOUR_SECRET_KEY_32CH`)과 함께 실제 키로 교체해야 한다.**

자세한 검증 순서 및 HWID 연동 흐름은 [`license-flow.md`](./license-flow.md) 를 참고한다.

---

## IPC 명명 규칙

채널명은 `src/shared/constants/ipc.constants.js` 에서 중앙 관리.  
문자열 직접 사용 금지.

```
license:verify
license:save
settings:get
item:create
app:getVersion
```

---

## 보안 정책

- `contextIsolation: true` / `nodeIntegration: false`
- `preload.js` 를 통해 최소 API만 렌더러에 노출 (`window.electronAPI`)
- Renderer에서 `window.electronAPI` 직접 호출 금지 → `ipcClient.js` 경유

---

## 개발 코딩 규약

파일 헤더 · JSDoc · 로그 · 네이밍 · HTML 생성 규칙 등 실무 작성 기준은  
[`coding-convention.md`](./coding-convention.md) 에서 관리한다.