# Project Tree & File Guide

> 이 문서는 프로젝트 전체 구조를 설명한다.  
> **파일이 어디에 있는지** + **무엇을 넣는 파일인지** + **무엇을 넣으면 안 되는지** 를 함께 기술한다.  
> 새 파일을 추가하기 전에 반드시 이 문서를 먼저 확인할 것.

---

## 폴더 구조 전체

```
demo
├─ data                              ← 런타임 데이터 (git 제외)
│  ├─ backups                        ← 자동/수동 백업 ZIP
│  ├─ temp                           ← 임시 파일 (앱 종료 시 자동 삭제 대상)
│  └─ user                           ← 사용자 실제 데이터 JSON
│     ├─ items.json
│     └─ settings.json
│
├─ docs                              ← 설계 문서 (코드 아님)
│  ├─ architecture.md                ← 레이어 책임, 데이터 흐름, Feature 구조
│  ├─ edition-flow.md                ← Edition 분기 흐름 및 체크리스트
│  ├─ ipc-flow.md                    ← IPC 채널 흐름, 새 채널 추가 방법
│  └─ tree.md                        ← (이 파일) 구조 가이드
│
├─ resources
│  └─ icons                          ← 앱 아이콘 (win.ico / mac.icns / tray.png)
│
├─ package.json
├─ package-lock.json
├─ README.md
│
└─ src
   ├─ main                           ── [Main Process] Electron Native 레이어
   │  ├─ main.js                     ← 앱 진입점. 단일 인스턴스 보장 + bootstrap 위임만
   │  ├─ bootstrap.js                ← 초기화 순서 오케스트레이터
   │  │                                순서: Logger → IPC 등록 → Window → Tray
   │  ├─ config.js                   ← 전역 설정 중앙 관리
   │  │                                APP.id / APP.secretKey / APP.masterKeys / PATHS
   │  │
   │  ├─ ipc                         ← IPC 핸들러. 기능 단위로 파일 분리
   │  │  ├─ index.js                 ← 전체 핸들러 일괄 등록 (registerAll)
   │  │  ├─ app.handlers.js          ← 앱 레벨: 버전, 경로, 다이얼로그, 재시작
   │  │  ├─ item.handlers.js         ← 아이템 CRUD
   │  │  ├─ license.handlers.js      ← 라이선스 검증/저장/상태조회
   │  │  └─ settings.handlers.js     ← 설정 get/set/reset
   │  │
   │  ├─ services                    ← 비즈니스 로직. Repository를 조립하는 레이어
   │  │  ├─ item.service.js          ← 아이템 validation + nanoid 생성 + repository 위임
   │  │  ├─ license.service.js       ← LicenseChecker 래핑. 단일 인스턴스 유지
   │  │  ├─ logger.service.js        ← 콘솔 + 파일 로그 (app.log)
   │  │  └─ settings.service.js      ← 설정 기본값 병합 + repository 위임
   │  │
   │  ├─ repositories                ← 저장소 접근. 저장 방식만 담당 (로직 없음)
   │  │  ├─ item.repository.js       ← items.json 읽기/쓰기
   │  │  └─ settings.repository.js   ← settings.json 읽기/쓰기
   │  │  ※ SQLite 교체 시 service 레이어는 변경 없음
   │  │
   │  ├─ windows                     ← BrowserWindow 생성 전담
   │  │  ├─ main.window.js           ← 메인 윈도우. Edition에 따라 HTML 분기 로드
   │  │  └─ splash.window.js         ← 스플래시 (frameless, transparent, alwaysOnTop)
   │  │
   │  ├─ tray
   │  │  └─ trayManager.js           ← 시스템 트레이 아이콘 + 컨텍스트 메뉴
   │  │
   │  └─ utils                       ← Main 전용 유틸 (날짜, 파일경로 가공 등)
   │     ※ Renderer와 공유할 유틸은 shared/utils에 넣을 것
   │
   ├─ preload
   │  └─ preload.js                  ← contextBridge 전용. 여기서만 ipcRenderer 사용
   │                                    window.electronAPI.xxx 형태로 노출
   │                                    ※ Node API 직접 노출 금지
   │
   ├─ shared                         ── [공유 레이어] Main + Renderer 모두 사용 가능
   │  ├─ constants
   │  │  ├─ ipc.constants.js         ← IPC 채널명 상수. 문자열 직접 사용 금지
   │  │  └─ app.constants.js         ← EDITION / THEME / TAB 등 앱 공통 열거값
   │  │  └─ screen-strategy.map.js   ← 화면별 Edition 분기 전략 SSOT (A/B 매핑)
   │  │                                 README.md 분기 현황표와 동기화 필수
   │  │
   │  ├─ capabilities
   │  │  ├─ capability-map.js        ← Edition → 기능 활성화 맵 (단일 소스)
   │  │  │                             기능 추가 시 여기만 수정
   │  │  └─ feature-manager.js       ← 현재 edition 기준 can('feature') 조회
   │  │
   │  ├─ license
   │  │  └─ LicenseChecker.js        ← AES-256-CBC 복호화 + HWID 검증 + MasterKey 처리
   │  │
   │  ├─ schemas                     ← 데이터 스키마 정의 (item.schema.js 등)
   │  └─ utils                       ← Main/Renderer 공통 순수 유틸 (date, string 등)
   │
   ├─ renderer                       ── [Renderer Process] UI 레이어
   │  │                                 jQuery / Lodash 사용 허용 구역
   │  │
   │  ├─ view                        ← HTML 진입점. 정적 골격(레이아웃)만 작성
   │  │  │  ※ 파일명 규칙:
   │  │  │    xxx.html               ← Standard 또는 Edition 공통
   │  │  │    xxx-pro.html           ← Pro 전용 (UI/UX 자체가 다를 때만)
   │  │  │
   │  │  ├─ dashboard.html           ← 메인 UI 공통. body[data-edition][data-theme][data-tab]
   │  │  ├─ splash.html              ← 스플래시 화면 (frameless)
   │  │  ├─ workspace-manager.html        ← Standard
   │  │  └─ workspace-manager-pro.html    ← Pro (UI/UX가 다를 경우 분리)
   │  │
   │  ├─ css                         ← 스타일시트. 역할별 폴더 분리
   │  │  ├─ base
   │  │  │  ├─ variables.css         ← CSS 변수(토큰) 전용. 값만 정의, 선택자 없음
   │  │  │  ├─ reset.css             ← 브라우저 기본값 초기화만
   │  │  │  ├─ typography.css        ← 전역 텍스트 스타일 (h1~h6, p, code)
   │  │  │  └─ animations.css        ← 전역 keyframe + 공통 transition 클래스
   │  │  ├─ layout					 ← 앱 전체 레이아웃 (앱 뼈대)
   │  │  │  └─ shell.css             ← 앱 전체 뼈대 (grid, flex, sidebar + content 배치, 전체 높이)
   │  │  │  └─ sidebar.css           ← 왼쪽 메뉴 전용 (사이드바 너비, 배경색, 메뉴 hover)
   │  │  │  └─ topbar.css            ← 상단 헤더 전용
   │  │  │  └─ window-controls.css   ← electron 전용 (최소화, 최대화, 닫기, 드래그 영역)
   │  │  │
   │  │  ├─ components               ← 재사용 UI 컴포넌트 스타일. 컴포넌트당 파일 하나
   │  │  │  ├─ common.css            ← Standard / Pro 공통 컴포넌트
   │  │  │  ├─ button.css
   │  │  │  ├─ toast.css
   │  │  │  ├─ tabs.css
   │  │  │  ├─ card.css
   │  │  │  └─ modal                 ← 분리한 경우
   │  │  │     ├─ modal.css          ← Standard  사용
   │  │  │     └─ modal-pro.css      ← pro 전용 (전략 B HTML에서만 link)
   │  │  ├─ pages                    ← 실제 화면 화면(Page) 단위 스타일. 화면별 폴더 분리
   │  │  │   ├─ dashboard            ← dashboard 화면 스타일
   │  │  │   │  ├─ dashboard.css     ← Standard  사용
   │  │  │   │  └─ dashboard-pro.css ← pro 전용 (전략 B HTML에서만 link)
   │  │  │   │
   │  │  │	 └─ settings
   │  │  │      ├─ settings.css     ← Standard  사용
   │  │  │      └─ settings-pro.css ← pro 전용 (전략 B HTML에서만 link)
   │  │  │
   │  │  ├─ editions                 ← 전략 A: body[data-edition='pro'] 오버라이드
   │  │  │                              전략 B: Pro 전용 HTML에서 직접 link하는 CSS
   │  │  └─ themes                   ← body[data-theme='dark'] CSS 변수 재정의만
   │  │
   │  └─ js
   │     ├─ app.js                   ← 렌더러 진입점. DOMContentLoaded → bootstrap()
   │     │
   │     ├─ core                     ── 렌더러 핵심 인프라. 비즈니스 로직 없음
   │     │  ├─ bootstrap.js          ← 초기화 순서: settings → license → FeatureLayer → modules
   │     │  ├─ state.js              ← 전역 상태 SSOT. setter 경유 변경만 허용
   │     │  │                           setter 내부에서 body.dataset 갱신 + EventBus.emit
   │     │  ├─ eventBus.js           ← 모듈 간 이벤트 통신 (on/off/emit/once)
   │     │  ├─ ipcClient.js          ← window.electronAPI 래퍼. 에러 처리 일원화
   │     │  │                           ※ 모듈에서 window.electronAPI 직접 호출 금지
   │     │  └─ paths.js              ← Renderer 내부 모듈 경로 Barrel. 레이어 넘는 import 경유
   │     │                              ※ Main에서는 import 금지 (Renderer 전용)
   │     │
   │     ├─ editions                 ── Edition UI 활성화 레이어
   │     │  ├─ featureLayer.js       ← CAPABILITY_MAP 기반 .pro-only DOM 토글
   │     │  ├─ pro
   │     │  │  └─ pro-ui.js          ← Pro 전용 패널/기능 초기화
   │     │  └─ standard
   │     │     └─ standard-ui.js     ← Standard 전용 UI 초기화
   │     │
   │     └─ modules                  ── Feature 단위 모듈. 각 폴더가 독립적으로 동작
   │        │  ※ Edition에 관계없이 동일한 구조를 사용한다
   │        │  ※ module / views / service / state 가 기본 단위
   │        │  ※ service·state 가 필요 없는 단순 Feature는 생략 가능
   │        │
   │        ├─ create                ── 아이템 생성
   │        │  ├─ create.module.js   ← EventBus 구독 + View/Service 조립 + 흐름 제어
   │        │  ├─ create.service.js  ← ipcClient 호출 + 데이터 가공
   │        │  ├─ create.state.js    ← 폼 입력값, 유효성 등 로컬 상태
   │        │  └─ views
   │        │     └─ create.view.js  ← HTML 생성 + DOM 이벤트 바인딩
   │        │
   │        ├─ item-detail           ── 아이템 상세 조회/편집
   │        │  ├─ item-detail.module.js
   │        │  ├─ item-detail.service.js
   │        │  └─ views
   │        │     └─ item-detail.view.js
   │        │
   │        ├─ workspace-manager     ── 워크스페이스 관리
   │        │  ├─ workspace-manager.module.js
   │        │  ├─ workspace-manager.service.js
   │        │  └─ views
   │        │     ├─ workspace-manager.view.js       ← Standard HTML에서 import
   │        │     └─ workspace-manager-pro.view.js   ← Pro HTML에서 import (전략 B)
   │        │
   │        ├─ tag-manager           ── 태그 관리 (Pro)
   │        │  ├─ tag-manager.module.js
   │        │  ├─ tag-manager.service.js
   │        │  └─ views
   │        │     └─ tag-manager.view.js
   │        │
   │        ├─ status-manager        ── 상태값 관리 (Pro)
   │        │  ├─ status-manager.module.js
   │        │  ├─ status-manager.service.js
   │        │  └─ views
   │        │     └─ status-manager.view.js
   │        │
   │        ├─ sidebar               ── 사이드바 접기/펼치기, 트리 렌더링
   │        │  ├─ sidebar.module.js
   │        │  └─ views
   │        │     └─ sidebar.view.js
   │        │
   │        ├─ modal                 ── 공통 모달 열기/닫기/콘텐츠 교체
   │        │  ├─ modal.module.js
   │        │  └─ views
   │        │     └─ modal.view.js
   │        │
   │        ├─ editor                ── ToastUI Editor 초기화 및 저장 연동
   │        │  ├─ editor.module.js
   │        │  ├─ editor.service.js
   │        │  └─ views
   │        │     └─ editor.view.js
   │        │
   │        ├─ command               ── 커맨드 팔레트 (단축키 기반)
   │        │  ├─ command.module.js
   │        │  └─ views
   │        │     └─ command.view.js
   │        │
   │        └─ tab-manager           ── 탭 전환
   │           └─ tab-manager.module.js
   │              ※ [data-tab-trigger] / [data-tab-content] 기반. View 불필요
   │
   └─ tests
      ├─ unit
      │  └─ license.test.js          ← LicenseChecker 독립 실행 테스트
      └─ integration                 ← IPC / Repository 통합 테스트
```

---

## Feature 내부 파일 역할

| 파일 | 역할 | 절대 금지 |
|---|---|---|
| `xxx.module.js` | EventBus 구독 + View/Service 조립 + 화면 흐름 제어 | DOM 직접 조작, innerHTML, querySelector |
| `views/xxx.view.js` | HTML 문자열 생성 + DOM 이벤트 바인딩 | IPC 호출, 비즈니스 로직, state mutation |
| `xxx.service.js` | ipcClient 호출 + 데이터 가공 + 캐싱 | DOM 접근, EventBus emit, 상태 직접 변경 |
| `xxx.state.js` | Feature 로컬 상태 관리 | 직접 mutation (`state.x = ...`) |

---

## HTML 파일 명칭 규칙

| 명칭 | 용도 |
|---|---|
| `xxx.html` | Standard 또는 Edition 공통 (기능만 차이날 때) |
| `xxx-pro.html` | Pro 전용 (UI/UX 자체가 다를 때만 분리) |

어느 화면에 어느 전략을 적용했는지는 `README.md` 의 **화면별 Edition 분기 현황** 에 기록한다.

---

## 동일 이름 파일 구분 가이드

| 파일명 | Main (`src/main/`) | Renderer (`src/renderer/js/`) |
|---|---|---|
| `bootstrap.js` | 앱 초기화 오케스트레이터. Window/IPC/Tray 생성 | 렌더러 초기화. 라이선스 → FeatureLayer → 모듈 |
| `services/` | Node.js 파일 I/O, 비즈니스 로직, Repository 조합 | IPC 호출 래핑 + 상태 연동. Node API 없음 |
| `state.js` | 없음 | 렌더러 전역 상태 SSOT |

---

## CSS 폴더 분류 기준

| 질문 | Yes → 위치 |
|---|---|
| 모든 화면에서 쓰이고 특정 컴포넌트에 종속되지 않는가? | `base/` |
| CSS 변수(토큰) 정의인가? | `base/variables.css` |
| 브라우저 기본값을 지우는 스타일인가? | `base/reset.css` |
| h1~h6, p, code 같은 전역 타이포그래피인가? | `base/typography.css` |
| @keyframes 또는 공통 transition 클래스인가? | `base/animations.css` |
| 페이지 골격(sidebar, topbar, grid)인가? | `layout/` |
| 재사용 가능한 UI 조각(modal, button, badge)이고 공통인가? | `components/common/` |
| 재사용 가능한 UI 조각이고 Pro 전용(전략 B)인가? | `components/pro/` |
| `body[data-edition='pro']` 오버라이드인가? | `editions/` |
| `body[data-theme='dark']` 변수 재정의인가? | `themes/` |

---

## 새 기능 추가 시 체크리스트

### 1. 새 Feature 모듈 추가

- [ ] `renderer/js/modules/xxx/` 폴더 생성
- [ ] `xxx.module.js` 작성 (EventBus 구독 + `init()` 노출)
- [ ] `views/xxx.view.js` 작성 (HTML 생성 + 이벤트 바인딩)
- [ ] `xxx.service.js` 작성 (ipcClient 호출 + 데이터 가공, 필요 시)
- [ ] `xxx.state.js` 작성 (로컬 상태 필요 시)
- [ ] `renderer/js/core/bootstrap.js` 에서 `xxx.module.init()` 호출
- [ ] `README.md` 화면별 Edition 분기 현황 업데이트

### 2. 새 IPC 채널 추가

- [ ] `shared/constants/ipc.constants.js` 에 채널명 상수 추가
- [ ] `src/main/ipc/xxx.handlers.js` 핸들러 작성
- [ ] `src/main/ipc/index.js` 에 등록
- [ ] `src/preload/preload.js` 에 expose 추가
- [ ] `src/renderer/js/core/ipcClient.js` 에 래퍼 추가

### 3. Pro 전용 기능 추가

- [ ] `shared/capabilities/capability-map.js` 에 기능 키 추가
- [ ] 전략 A (토글): HTML에 `.pro-only hidden` 추가 + `featureLayer.js` 토글 추가
- [ ] 전략 B (HTML 분리): `xxx-pro.html` 생성 + `main.window.js` 분기 로드 추가
- [ ] `shared/constants/screen-strategy.map.js` 에 화면 항목 추가 (전략 B인 경우 필수)
- [ ] CSS `editions/` 에 오버라이드 추가 (필요 시)
- [ ] `README.md` 화면별 Edition 분기 현황표 업데이트

### 4. 새 데이터 타입 추가

- [ ] `src/main/repositories/xxx.repository.js` 작성
- [ ] `src/main/services/xxx.service.js` 작성
- [ ] `src/main/ipc/xxx.handlers.js` 작성
- [ ] 위 IPC 채널 추가 체크리스트 진행

---

## 절대 금지 사항

| 금지 | 이유 |
|---|---|
| `ipcRenderer` 를 preload 밖에서 직접 사용 | 보안 (contextIsolation) |
| IPC 채널명 문자열 하드코딩 | 오타/불일치 버그 |
| `STATE.xxx = value` 직접 mutation | 사이드이펙트 추적 불가 |
| `window.electronAPI` 를 모듈에서 직접 호출 | ipcClient 일원화 원칙 |
| `view.js` 에서 IPC 직접 호출 | View는 렌더링만. 데이터는 service 경유 |
| `module.js` 에서 innerHTML / querySelector | DOM 조작은 view에 위임 |
| `service.js` 에서 EventBus emit | 이벤트 흐름은 module이 제어 |
| Main 레이어에 UI 렌더링 로직 | 레이어 오염 |
| Renderer 레이어에서 Node.js API 사용 | sandbox 정책 위반 |
| Main 프로세스에서 jQuery / Lodash 사용 | Renderer 전용 라이브러리 |
| `base/` CSS에 컴포넌트 선택자 작성 | 범위 오염 |
| `editions/` `themes/` 에 새 디자인 정의 | 오버라이드 전용 레이어 |