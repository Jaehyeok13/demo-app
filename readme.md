emo/
├── package.json              ← win/mac 빌드 스크립트 포함
├── electron-builder.json     ← NSIS(Win) + DMG(Mac) 설정
├── config/config.js          ← 전역 상수 (AppID, 경로, 창 크기)
└── src/
    ├── main/
    │   ├── main.js           ← 앱 시작 + IPC 핸들러 전담
    │   └── window-manager.js ← BrowserWindow 생성 분리
    ├── common/
    │   ├── preload.js        ← contextBridge (보안 구조)
    │   └── license-checker.js← ★ Hub 빌드 시 secretKey 자동 치환
    └── renderer/
        ├── index.html        ← 3탭 구조 (메인/기능/라이선스)
        ├── style.css         ← 분리된 스타일
        └── app.js            ← Free/Pro 기능 분기 로직



demo/
├── package.json                    # 프로젝트 설정 + 빌드 스크립트
├── electron-builder.json           # 빌드 설정 (win/mac 분리)
│
├── config/
│   └── config.js                   # 전역 상수 · 경로 · 창 설정
│
├── src/
│   ├── main/                       # 메인 프로세스
│   │   ├── main.js                 # 앱 초기화 · 모듈 조립
│   │   └── window-manager.js       # BrowserWindow 생성 관리
│   │
│   ├── common/                     # 공통 모듈
│   │   ├── preload.js              # IPC 브릿지 (contextBridge)
│   │   └── license-checker.js      # ★ HWID + 라이선스 검증 (Hub 연동)
│   │
│   └── renderer/                   # 렌더러 프로세스 (UI)
│       ├── index.html              # 메인 화면
│       ├── style.css               # 스타일
│       └── app.js                  # UI 로직 (Free/Pro 기능 분기)
│
└── assets/                         # 아이콘 등 정적 리소스
    └── icon.png

🔗 새 프로젝트 만들 때 체크리스트
파일	바꿀 것
config/config.js	APP.name, APP.appId
license-checker.js	APP_CONFIG.appId (Hub가 자동 치환)
renderer/app.js	FEATURES 배열 + FEATURE_RESULTS
electron-builder.json	appId, productName
package.json	name, version



새 프로젝트 만들 때 바꿀 것: 

config/config.js → APP.id, APP.name
license-checker.js → APP_CONFIG.appId (Hub 빌드 시 자동 치환)
renderer/app.js → FEATURES 배열 + RESULTS 객체