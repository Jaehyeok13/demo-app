# IPC Flow

## 기본 흐름

```
Renderer (renderer/js/app.js)
  ↓
Module (modules/*/*.module.js)     — 비즈니스 흐름 제어
  ↓
Service (modules/*/*.service.js)   — 데이터 처리 요청
  ↓ ipcClient 호출
IpcClient (core/ipcClient.js)
  ↓ window.electronAPI.license.verify(key)
preload.js
  ↓ ipcRenderer.invoke('license:verify', key)
Main Process
  ↓ ipcMain.handle('license:verify', handler)   ← main/ipc/license.handlers.js
LicenseService.verify(key)                       ← main/services/license.service.js
  ↓ LicenseChecker.verify(key)                  ← shared/license/LicenseChecker.js
  ↓ return { status, edition, payload }
```

## 채널명 관리

`src/shared/constants/ipc.constants.js` 에 전부 정의.
문자열 직접 사용 금지.

## 새 IPC 추가 방법

1. `ipc.constants.js` 에 채널명 추가
2. `src/main/ipc/xxx.handlers.js` 에 핸들러 작성
3. `src/main/ipc/index.js` 에 등록
4. `src/preload/preload.js` 에 expose 추가
5. `src/renderer/js/core/ipcClient.js` 에 래퍼 추가