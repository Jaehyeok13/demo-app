# Demo App

> Electron UI Component & Architecture Showcase

---

## ⚠️ 프로젝트 구조 안내

이 프로젝트는 **혼합형 Edition 분기** 구조를 사용한다.

- **전략 A** — 기능만 다를 때      : HTML 하나 + `body[data-edition]` 토글
- **전략 B** — UI/UX 자체가 다를 때: HTML 두 개 (`xxx.html` / `xxx-pro.html`)

화면별 적용 현황은 [화면별 Edition 분기 현황](#화면별-edition-분기-현황) 참고.

---
## 프로젝트 개요

Demo App은 Electron 기반 데스크톱 애플리케이션으로 다양한 UI 컴포넌트와 애플리케이션 아키텍처를 검증하기 위한 Showcase 프로젝트이다.

본 프로젝트는 실제 업무 시스템이 아닌 다음 기능을 테스트하고 검증하기 위한 데모 플랫폼을 목적으로 한다.

## 주요 기능

* Theme System
* License System
* Toast Notification
* Modal Popup
* Settings Management
* State Management
* EventBus
* IPC Communication
* Component Architecture

---

## 시스템 요구사항

| 항목 | 요구사항 |
|---|---|
| OS | macOS 10.15 이상 / Windows 10 이상 |
| Node.js | 18.0.0 이상 |
| npm | 9.0.0 이상 |

---

## 설치 및 실행

```bash
npm install       # 최초 1회 의존성 설치
npm run dev       # 개발 모드 실행 (DevTools 자동 오픈)
npm start         # 일반 실행 (production 모드)
```

> `dev` 모드는 `--inspect` 플래그로 Node.js 디버거를 활성화한다.

---

## 배포 빌드

```bash
# Windows
npm run build: win-n      # NSIS 설치형 (.exe) — x64 + ia32
npm run build: win-p      # 포터블 (.exe) — x64 + ia32, 최대 압축
npm run build: win-all    # NSIS + 포터블 순차 빌드

# macOS
npm run build: mac-m      # Apple Silicon (arm64)
npm run build: mac-i      # Intel (x64)
```

| 플랫폼 | 산출물 위치 |
|---|---|
| Windows NSIS | `dist/Demo App_Setup_x.x.x_x64.exe` |
| Windows 포터블 | `dist/Demo App_Portable_x.x.x_x64.exe` |
| macOS | `dist/Demo App-x.x.x-arm64.pkg` / `.zip` |

> macOS 빌드 오류 시: `sudo ln -sf $(which python3) /usr/local/bin/python`

---

## 기술 스택

| 구분 | 기술 |
|---|---|
| 런타임 | Electron 33 |
| 렌더러 | ES Modules + jQuery 3.7 + Lodash 4 |
| 에디터 | ToastUI Editor (Markdown / WYSIWYG 전환) |
| 스타일 | CSS 변수 기반 다크/라이트/시스템 테마 |
| 데이터 | JSON 파일 (userData 폴더) |
| 정렬 | SortableJS (드래그 앤 드롭) |
| 빌드 | electron-builder |
| 암호화 | crypto-js (AES-256-CBC) |
| ID 생성 | nanoid |

### 주요 의존성

| 패키지 | 버전 | 용도 |
|---|---|---|
| `@fortawesome/fontawesome-free` | ^7.2.0 | 아이콘 |
| `adm-zip` | ^0.5.17 | ZIP 가져오기 처리 |
| `crypto-js` | ^4.2.0 | 라이선스 AES-256-CBC 복호화 |
| `nanoid` | ^3.3.11 | 고유 ID 생성 |
| `node-machine-id` | ^1.1.12 | HWID 기반 라이선스 검증 |
| `xlsx` | ^0.18.5 | 엑셀 내보내기 |

---

## 아키텍처 개요

```
┌─────────────────────────────────────────────────────────┐
│                    렌더러 프로세스                        │
│  *.html (정적 골격)                                      │
│  ES Modules + jQuery + Lodash                            │
│  Feature Modules (module / views / service / state)      │
├─────────────────────────────────────────────────────────┤
│                    preload.js                            │
│  contextBridge — window.electronAPI (최소 권한만 노출)    │
├─────────────────────────────────────────────────────────┤
│                    메인 프로세스                          │
│ main.js / bootstrap.js / ipc  /*.handlers.js             │
│  창 관리 · 트레이 · 파일 I/O · 라이선스                  │
└─────────────────────────────────────────────────────────┘
```

모든 기능은 Edition에 관계없이 동일한 Feature 단위 구조(`module / views / service / state`)로 관리한다.
Edition 간 차이는 **기능 활성화 여부**와 **HTML 분리 여부**로만 구분한다.

상세 내용은 [`docs/architecture.md`](docs/architecture.md) 참고.

---

## 화면 구성

### 공통 레이아웃

```text
┌─────────────────────────────────────────────────┐
│ Header                                          │
├──────────┬──────────────────────────────────────┤
│ Sidebar  │ Main Content                         │
├──────────┴──────────────────────────────────────┤
│ Footer                                          │
└─────────────────────────────────────────────────┘
```

---

## Header

전역 상태 표시 영역

## 제공 기능

### App Information

* App Name
* Version
* Current Edition

### Navigation

* Home
* Components
* Settings

### Quick Action

* Theme Toggle
* License Status

---

# Sidebar

좌측 네비게이션

## 메뉴

```text
🏠 Home

⚡ Components

⚙ Settings

──────────────

📘 Guide
```

## 기능

* 메뉴 이동
* 현재 위치 표시
* 상태 표시

---

# Home

애플리케이션 상태 요약 화면

## Dashboard Card

### Theme Status

현재 적용된 테마 표시

### License Status

현재 라이선스 표시

### Notification Status

Toast / Modal 상태 표시

### System Status

앱 실행 상태 표시

---

## Recent Events

최근 발생한 이벤트 출력

예시

* Theme Changed
* License Changed
* Toast Fired
* Modal Opened
* Settings Saved

---

## Quick Actions

즉시 테스트

* Toast Test
* Modal Test
* Theme Test
* License Test

---

# Components

UI 컴포넌트 테스트 공간

---

## Toast Demo

알림 기능 테스트

### 지원 타입

* Success
* Info
* Warning
* Error

### 지원 위치

* Top Left
* Top Right
* Bottom Left
* Bottom Right
* Center

### 지원 기능

* Auto Close
* Duration
* Position
* Preview

---

## Modal Demo

모달 기능 테스트

### 지원 타입

* Default
* Confirm
* Warning
* Input
* Fullscreen

### 지원 기능

* ESC Close
* Backdrop Close
* Custom Action
* Dynamic Content

---

# Settings

설정 화면

좌측 메뉴 + 우측 상세 패널 구조

```text
┌──────────────┬─────────────────────────┐
│ 일반         │                         │
│ 알림         │                         │
│ 테마         │     설정 상세 영역       │
│ 라이선스     │                         │
│ 시스템       │                         │
└──────────────┴─────────────────────────┘
```

---

# 알림 설정

## Notification Mode

* Toast
* Modal

## Toast Position

* Top Left
* Top Right
* Bottom Left
* Bottom Right
* Center

## Duration

* 1000ms
* 2000ms
* 3000ms
* 5000ms
* 10000ms

## Auto Close

* Enabled
* Disabled

## 지원 기능

* 설정 저장
* 실시간 테스트

---

# 테마 설정

프로젝트 핵심 기능

---

## Preset Theme

기본 제공 테마

### Free

* Light
* Dark

### Standard 이상

* Midnight
* Ocean
* Purple
* Forest
* Sunset
* Focus

총 8개 제공

---

## Theme Preview

선택된 테마를 실시간 미리보기

Preview 영역

* Header
* Sidebar
* Card
* Button
* Toast

실제 애플리케이션과 동일한 CSS Variables 사용

---

## Custom Theme

사용자 정의 테마 생성

### 설정 가능 색상

* Primary
* Secondary
* Accent
* Background
* Surface
* Text

### 기능

* 저장
* 적용
* 삭제
* 초기화

---

## Theme Slot 제한

| License      | Slots     |
| ------------ | --------- |
| Free (null)  | 1         |
| Standard     | 5         |
| Professional | Unlimited |

---

# 라이선스 설정

라이선스 기능 검증

## 지원 등급

* Standard
* Professional
`Free` 는 별도 edition 값이 아니라, 라이선스가 없거나(`NOT_FOUND`) 무효(`INVALID`)일 때
`edition === null` 상태를 렌더러가 표시하는 UI 라벨이다.

## Demo Key

```text
DEMO-STD-MASTER-9999
DEMO-PRO-MASTER-8888
```

## 기능

* 즉시 전환
* UI 갱신
* 기능 잠금 해제
* 라이선스 비교

---

## 라이선스별 기능

| 기능             |  Free (null) | Standard | Professional |
| -------------- | ---- | -------- | ------------ |
| Light Theme    | ✓    | ✓        | ✓            |
| Dark Theme     | ✓    | ✓        | ✓            |
| Premium Themes | ✗    | ✓        | ✓            |
| Custom Theme   | 1    | 5        | Unlimited    |

---

# 시스템 정보

실행 환경 확인

## Application

* App ID
* Version
* Build Version

## Runtime

* Electron Version
* Node Version
* Chrome Version

## Device

* Machine ID
* HWID
* Session ID

## 기능

* Copy
* Refresh

---

# 데이터 저장 구조

## AppData

```text
AppData
└─ Demo App
   ├─ settings.json
   ├─ themes.json
   ├─ license.json
   ├─ system.json
   ├─ logs/
   │   └─ app.log
   └─ cache/
```

---

# settings.json

사용자 환경설정

```json
{
  "theme": {
    "current": "dark"
  },

  "notification": {
    "mode": "toast",
    "position": "top-right",
    "duration": 3000,
    "autoClose": true
  },

  "ui": {
    "sidebarCollapsed": false,
    "lastTab": "home"
  }
}
```

---

# themes.json

사용자 정의 테마

```json
{
  "themes": []
}
```

---

# .{appId소문자}.license

라이선스 키 문자열만 저장 (UTF-8, trim). JSON 객체가 아니다.
키가 없거나 무효하면 파일 자체가 없거나 검증 실패 → edition: null → UI 'Free' 표시.

```text
{IV_Base64}.{CipherText}
```

경로: `{app.getPath('userData')}/.da01.license`

---

# system.json

시스템 정보

```json
{
  "appId": "DM-APP-01",
  "machineId": "",
  "hwid": "",
  "buildVersion": "1.0.0"
}
```

---

# 상태(State)

```javascript
state = {
  activeTab: 'home',

  license: {
    edition: null   // UI 표시 시 'Free'
  },

  theme: {
    current: 'dark'
  },

  notification: {
    mode: 'toast',
    position: 'top-right',
    duration: 3000,
    autoClose: true
  }
}
```
---

## 화면별 Edition 분기 현황

> 새 화면 추가 또는 분기 전략 변경 시 이 표를 함께 업데이트한다.

| 화면 | HTML 파일 | 분기 전략 | 비고 |
|---|---|---|---|
| 메인 대시보드 | `dashboard.html` | A — 토글 | 공통 골격, Pro 패널 `.pro-only` 토글 |
| 스플래시 | `splash.html` | — | Edition 무관 |
| 워크스페이스 관리 | `workspace-manager.html` / `workspace-manager-pro.html` | B — HTML 분리 | Pro는 UI/UX 자체가 다름 |

> ⚠️ 이 표는 `src/shared/constants/screen-strategy.map.js` 와 항상 동기화되어야 한다.
> 화면 추가/전략 변경 시 **표와 파일을 함께** 수정할 것.

**전략 A** — HTML 하나 + `body[data-edition]` CSS/DOM 토글 (기능·버튼 일부만 차이)

**전략 B** — HTML 두 개 (`xxx.html` / `xxx-pro.html`) (레이아웃·플로우 자체가 다름)

---

## 보안 정책

- `contextIsolation: true` / `nodeIntegration: false`
- Renderer는 `window.electronAPI` 만 사용 (`ipcClient.js` 경유)
- IPC 채널명은 `shared/constants/ipc.constants.js` 에서 중앙 관리

---

## 문서

| 문서 | 내용 |
|---|---|
| [`docs/architecture.md`](docs/architecture.md) | 레이어 책임, 데이터 흐름, Feature 구조, Edition 분기 전략 |
| [`docs/tree.md`](docs/tree.md) | 전체 폴더 구조 및 파일 역할 가이드 |
| [`docs/ipc-flow.md`](docs/ipc-flow.md) | IPC 채널 흐름, 새 채널 추가 방법 |
| [`docs/edition-flow.md`](docs/edition-flow.md) | Edition 분기 흐름 및 체크리스트 |
| [`docs/license-flow.md`](docs/license-flow.md) | 라이선스 검증 흐름 상세 |
| [`docs/coding-convention.md`](docs/coding-convention.md) | 파일 헤더, JSDoc, 로그, 네이밍 규칙 |
