# demoApp

> Accordion-based knowledge — Electron app

---

## ⚠️ 프로젝트 구조 안내

이 프로젝트는 **혼합형 Edition 분기** 구조를 사용한다.

- **전략 A** — 기능만 다를 때      : HTML 하나 + `body[data-edition]` 토글
- **전략 B** — UI/UX 자체가 다를 때: HTML 두 개 (`xxx.html` / `xxx-pro.html`)

화면별 적용 현황은 [화면별 Edition 분기 현황](#화면별-edition-분기-현황) 참고.

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
npm run build:win-n      # NSIS 설치형 (.exe) — x64 + ia32
npm run build:win-p      # 포터블 (.exe) — x64 + ia32, 최대 압축
npm run build:win-all    # NSIS + 포터블 순차 빌드

# macOS
npm run build:mac-m      # Apple Silicon (arm64)
npm run build:mac-i      # Intel (x64)
```

| 플랫폼 | 산출물 위치 |
|---|---|
| Windows NSIS | `dist/demoApp_Setup_x.x.x_x64.exe` |
| Windows 포터블 | `dist/demoApp_Portable_x.x.x_x64.exe` |
| macOS | `dist/demoApp-x.x.x-arm64.pkg` / `.zip` |

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
│  main.js / bootstrap.js / ipc/*.handlers.js             │
│  창 관리 · 트레이 · 파일 I/O · 라이선스                  │
└─────────────────────────────────────────────────────────┘
```

모든 기능은 Edition에 관계없이 동일한 Feature 단위 구조(`module / views / service / state`)로 관리한다.
Edition 간 차이는 **기능 활성화 여부**와 **HTML 분리 여부**로만 구분한다.

상세 내용은 [`docs/architecture.md`](docs/architecture.md) 참고.

---

## 화면별 Edition 분기 현황

> 새 화면 추가 또는 분기 전략 변경 시 이 표를 함께 업데이트한다.

| 화면 | HTML 파일 | 분기 전략 | 비고 |
|---|---|---|---|
| 메인 대시보드 | `dashboard.html` | A — 토글 | 공통 골격, Pro 패널 `.pro-only` 토글 |
| 스플래시 | `splash.html` | — | Edition 무관 |
| 워크스페이스 관리 | `workspace-manager.html` / `workspace-manager-pro.html` | B — HTML 분리 | Pro는 UI/UX 자체가 다름 |

> ⚠️ 이 표는 `src/shared/constants/screen-strategy.map.js` 와 항상 동기화되어야 기한다.
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
