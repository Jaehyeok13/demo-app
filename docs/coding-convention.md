# Coding Convention

> 이 문서는 프로젝트의 실무 작성 기준을 정의한다.  
> 아키텍처 설계 구조는 [`architecture.md`](./architecture.md) 를 참고한다.

---

## 1. 파일 헤더 규칙

모든 파일 최상단에 아래 블록을 작성한다.

```javascript
/**
 * @FileName     : data.js
 * @Description  : 애플리케이션 상수 및 초기 데이터 정의 (Static Data & Constants)
 * @Modification :
 *
 * 수정일         수정자      수정내용
 * ──────────── ───────── ───────────────────────────────
 * 2026.06.10.   develJan  최초생성 (태그 컬러 및 초기 문서 데이터 정의)
 *
 * @author  develJan
 * @since   2026.06.10
 * @version 1.0.0
 *
 * Copyright (C) 2026 by develJan Media All right reserved.
 */
```

### Modification 기록 기준

| 상황 | 기록 여부 |
|---|---|
| 최초 생성 | 필수 |
| 기능 추가 / 버그 수정 / 리팩터링 | 필수 |
| 오탈자·주석 수정 등 단순 텍스트 교정 | 생략 가능 |

### 버전 업데이트 기준

| 변경 규모 | 버전 | 예시 |
|---|---|---|
| 버그 수정 / 소규모 수정 | patch `1.0.x` | `1.0.0 → 1.0.1` |
| 기능 추가 / 인터페이스 변경 | minor `1.x.0` | `1.0.1 → 1.1.0` |
| 구조 변경 / 하위 호환 불가 | major `x.0.0` | `1.1.0 → 2.0.0` |

> Modification 테이블에는 수정 내용 요약만 기록한다.  
> 변경 상세 내역은 [`log_history.md`](./log_history.md) 에서 관리한다.

---

## 2. JSDoc 필수

### 2-1. 함수 JSDoc

모든 함수에 JSDoc 을 작성한다. 다른 모듈에서 호출 시 파라미터와 반환값을 즉시 파악할 수 있어야 한다.

```javascript
/**
 * @description 라이선스 상태를 적용하고 UI를 업데이트한다.
 * @param {object} result 라이선스 확인 결과
 * @param {string} result.status 라이선스 상태값 (VALID | EXPIRED | …)
 * @param {string|null} result.edition 에디션 ('standard' | 'pro' | null)
 * @returns {void}
 */
export function applyLicense(result) {
```

```javascript
/**
 * @description 문서를 저장한다.
 * @param {Object} doc 저장할 문서
 * @returns {Promise<boolean>} 저장 성공 여부
 */
async function saveDocument(doc) {
```

### 2-2. `@returns` 생략 기준

| 상황 | 처리 |
|---|---|
| 반환값이 없는 함수 | `@returns {void}` 명시 |
| DOM 이벤트 핸들러 | `@returns` 생략 가능 |
| 콜백 함수 (인자로 전달되는 익명 함수) | `@returns` 생략 가능 |

---

## 3. 로그 — 한글 필수

콘솔 로그는 반드시 한글로 작성한다. 영문 로그는 금지한다.

```javascript
// ✅ 허용
console.group('[Sidebar] 즐겨찾기 토글');
console.log('문서 ID:', docId);
console.groupEnd();

// ❌ 금지
console.log('save start');
console.log('toggle favorite', docId);
```

---

## 4. 비동기 — try/catch/finally 필수

비동기 함수는 반드시 `try/catch/finally` 구조로 작성한다.  
`finally` 에서 `console.groupEnd()` 를 호출해 로그 그룹이 항상 닫히도록 보장한다.

```javascript
async function saveDocument(doc) {
  console.group('[Editor] 문서 저장');
  try {
    await ipcClient.saveItem(doc);
  } catch (error) {
    console.error('문서 저장 실패', error);
  } finally {
    console.groupEnd();
  }
}
```

---

## 5. 함수 작성 원칙

- **단일 책임 원칙** — 함수 하나는 하나의 역할만 담당한다.
- **100줄 초과 금지** — 초과 시 기능 단위로 분리한다.
- **중복 로직 분리** — 2곳 이상 반복되면 `utils/` 로 추출한다.

---

## 6. 전역 변수 금지

`window.*` 신규 전역 변수 추가를 금지한다. 상태는 반드시 State 레이어를 경유한다.

```javascript
// ❌ 금지
window._zenInterval = setInterval(…);
window._tempState   = {};

// ✅ 허용
State.set('zenTime', 25 * 60);
```

---

## 7. 저장소 규칙

브라우저 저장소 신규 사용을 금지한다. 모든 데이터는 IPC → userData JSON 을 경유한다.

```
❌ localStorage / sessionStorage 신규 사용 금지
✅ ipcClient → userData JSON 경유
```

---

## 8. DOM 접근 — View 레이어만

DOM 조작은 `modules/*/views/*.view.js` 에서만 허용한다.  
Module / Service / State 레이어에서의 `document.querySelector`, `innerHTML` 직접 사용은 금지한다.  
→ 레이어별 상세 금지 사항은 [`architecture.md — 레이어 책임 원칙`](./architecture.md#레이어-책임-원칙) 참고.

---

## 9. 네이밍 규칙

| 대상 | 규칙 | 예시 |
|---|---|---|
| 파일명 | `기능.레이어.js` | `sidebar.module.js` |
| 이벤트 상수 | `EVENTS.대문자_스네이크` | `EVENTS.ITEM_LOADED` |
| 이벤트명 | `도메인:동사` | `item:loaded` |

---

## 10. HTML 생성 규칙 — 골격 vs 동적

### 판단 기준

```
Q: "이 HTML이 앱을 켰을 때 데이터 없이도 존재하는가?"
  YES → *.html 에 직접 작성  (골격 HTML)
  NO  → *.view.js 에서 JS로 동적 생성
```

| 구분 | 위치 | 예시 |
|---|---|---|
| 골격 HTML | `renderer/view/*.html` | 레이아웃, 빈 컨테이너, 고정 버튼 |
| 동적 HTML | `modules/*/views/*.view.js` | 아이템 목록, 태그 칩, 모달 내용 |

### ID / Class 사용 규칙

View 파일에서 HTML 생성 시 `function-catalog.md` 에 정의된 ID / Class 를 그대로 사용한다.  
임의 ID / Class 신규 추가 시 반드시 `function-catalog.md` 에 먼저 등록한다.

---

## 11. 레이어 책임 원칙

| 레이어 | 파일 위치 | 역할 | 절대 금지 |
|---|---|---|---|
| View | `modules/*/views/*.view.js` | HTML 생성 + DOM 이벤트 바인딩 | IPC 호출, 비즈니스 로직, state mutation |
| Module | `modules/*/*.module.js` | 비즈니스 흐름 제어 + View/Service 조립 | DOM 조작, innerHTML, querySelector |
| Service | `modules/*/services/*.service.js` | ipcClient 호출 + 데이터 가공 + 캐싱 | DOM 접근, EventBus emit, 상태 직접 변경 |
| State | `core/state.js` + `modules/*/xxx.state.js` | 전역/로컬 상태 SSOT. setter 경유만 허용 | 직접 mutation (`STATE.x = ...`) |
| IPC Client | `core/ipcClient.js` | 모든 IPC 단일 게이트웨이 | DOM 접근, 상태 직접 변경 |
| Main | `main/ipc/*.handlers.js` | IPC 수신 + 서비스 위임 + 파일 I/O | UI 렌더링, Renderer 상태 접근 |

---

## 12. Import & Module Path Rules

### 12-1. 기본 원칙

- ES Module(`import` / `export`)만 사용한다. `require()`(CommonJS) 금지.
- **확장자를 생략하지 않는다.** 번들러 없는 순수 ESM 환경이므로 `.js` 누락 시 Main(Node)·Renderer(브라우저) 양쪽에서 모듈 해석 에러가 발생한다.
- `export default` 지양, **named export** 를 기본으로 한다 (barrel 재export 시 이름 추적이 명확해짐).

✅ 허용
```javascript
import { state } from '../core/state.js';
export function applyLicense() {}
```

❌ 금지
```javascript
const state = require('../core/state.js');   // CommonJS 금지
import { state } from '../core/state';       // 확장자 누락 금지
export default function applyLicense() {}    // default export 지양
```

---

### 12-2. `importmap` 사용 금지 (Production)

`importmap` 은 개발 모드에서는 동작하지만, `asar` 패키징 시 경로 해석이 깨질 위험이 있어
**프로덕션 빌드에서는 사용하지 않는다.** 대신 `paths.js` Barrel 파일로 경로를 중앙 관리한다.

---

### 12-3. Barrel File (`renderer/js/core/paths.js`)

`paths.js` 는 **Renderer 내부** 모듈 경로를 모아주는 Barrel 파일이다.  
Main 프로세스는 Renderer View를 import 하지 않으므로, 이 파일은 Renderer 전용이며 Main에서 import 하지 않는다.

| 상황 | 규칙 |
|---|---|
| 같은 feature 폴더 내부 (`xxx.module.js` ↔ `xxx.service.js` ↔ `views/xxx.view.js`) | 상대경로 직접 import 허용 |
| 다른 feature / core / editions 등 **레이어를 넘어가는 import** | `paths.js` 경유 권장 |

✅ 권장 (레이어를 넘어가는 경우)
```javascript
import { themeView } from '../../core/paths.js';
```

✅ 허용 (같은 feature 폴더 내부)
```javascript
import { renderThemeCard } from './views/theme.view.js';
```

❌ 지양 (레이어를 넘어가는 깊은 상대경로 직접 참조)
```javascript
import { themeView } from '../../../modules/theme/views/theme.view.js';
```

---

### 12-4. Main ↔ Renderer Import 방향

| From → To | 허용 여부 | 이유 |
|---|---|---|
| `shared/*` → Main, Renderer | ✅ 양쪽 허용 | 공유 비즈니스 로직 (License, Capability 등) |
| `main/*` → Renderer | ❌ 금지 | Node API 노출 위험, contextIsolation 정책 위반 |
| `renderer/*` → Main | ❌ 금지 | jQuery / Lodash 등 Renderer 전용 라이브러리가 Main(Node)으로 침투 금지 |
| `renderer/js/core/paths.js` | Renderer 내부에서만 사용 | Main은 Renderer View를 import 하지 않음 |



HTML 속성은 요소 유형별로 아래 순서를 따른다.  
가독성과 일관성을 위해 속성이 많을 경우 **한 줄에 하나씩** 작성한다.

---

### 13-1. Form Elements

적용 대상: `<input>` `<select>` `<textarea>` `<button>` `<option>`

```
1. type
2. id
3. name
4. class

5. 상태 속성
   checked / selected / disabled / readonly / required

6. 기능 속성
   value / placeholder / minlength / maxlength / min / max / step

7. data-*

8. aria-* / role
```

```html
<!-- ✅ 올바른 예 -->
<input
    type="text"
    id="themeName"
    name="themeName"
    class="form-input"
    value=""
    placeholder="테마명을 입력하세요"
    maxlength="30"
    data-action="rename-theme"
    aria-label="테마명 입력" />

<!-- ✅ 올바른 예 -->
<button
    type="button"
    id="saveBtn"
    class="btn btn-primary"
    disabled
    data-action="save">
    저장
</button>
```

---

### 13-2. General Elements

적용 대상: `<div>` `<section>` `<article>` `<span>` `<ul>` `<li>` `<nav>` 등 일반 컨테이너

```
1. id
2. class
3. data-*
4. aria-* / role
```

> `name` 속성은 Form Elements 전용이다. 일반 요소에 사용하지 않는다.

```html
<!-- ✅ 올바른 예 -->
<div
    id="settingsPanel"
    class="settings-panel"
    data-tab="theme"
    role="tabpanel"
    aria-labelledby="themeTab">
</div>
```

---

### 13-3. Anchor Elements

적용 대상: `<a>`

```
1. href
2. target
3. rel
4. id
5. class
6. data-*
7. aria-*
```

```html
<!-- ✅ 올바른 예 -->
<a
    href="#"
    target="_blank"
    rel="noopener noreferrer"
    id="themeLink"
    class="nav-link"
    data-tab="theme">
    Theme
</a>
```

---

### 13-4. Image Elements

적용 대상: `<img>`

```
1. src
2. alt
3. width
4. height
5. id
6. class
7. data-*
```

```html
<!-- ✅ 올바른 예 -->
<img
    src="./assets/logo.png"
    alt="Demo App Logo"
    width="32"
    height="32"
    class="logo" />
```

> `alt` 는 생략 금지. 장식 목적이라면 `alt=""` 로 명시한다.

---

## 14. data-* 작성 규칙

### 14-1. 네이밍 원칙

기능 단위로 의미가 명확한 이름만 허용한다.

| 용도 | 속성명 | 예시 |
|---|---|---|
| 클릭/이벤트 트리거 | `data-action` | `data-action="save"` |
| 요소의 역할 구분 | `data-role` | `data-role="item-card"` |
| 탭 연결 | `data-tab` | `data-tab="theme"` |
| 연결 대상 지정 | `data-target` | `data-target="#modal"` |

```html
<!-- ✅ 허용 -->
<button data-action="save">저장</button>
<div data-role="item-card" data-target="#detail">...</div>

<!-- ❌ 금지 — 의미 불분명 -->
<button data-a="1">저장</button>
<div data-test="x" data-temp="1">...</div>
```

### 14-2. JS Selector 우선순위

이 프로젝트는 `data-*` 기반 선택자를 기본으로 한다.  
클래스 선택자는 **스타일 전용**이며 JS 로직에서 지양한다.

```
1순위  data-role    → 요소 역할 식별
2순위  data-action  → 이벤트 핸들러 바인딩
3순위  data-tab     → 탭 전환 연결
4순위  id           → 단일 요소 직접 참조 (동적 생성 요소 등)
5순위  class        → 지양. 스타일 전용으로만 사용
```

```javascript
// ✅ 권장
$('[data-action="save"]').on('click', handleSave);
$('[data-role="item-card"]').addClass('active');

// ❌ 지양 — 스타일용 class를 JS 로직에 사용
$('.btn-save').on('click', handleSave);
$('.item-card').addClass('active');
```

> View 파일에서 이벤트를 바인딩할 때도 동일한 우선순위를 따른다.

---

## 15. 데이터 흐름

```
사용자 액션
    ↓
View (modules/*/views/*.view.js)   — DOM 이벤트만 수신 → module 콜백 전달
    ↓
Module (*.module.js)               — 비즈니스 흐름 제어
    ↓
Service (*.service.js)             — 데이터 처리 요청
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

## 16. CSS 및 스타일링 규칙

### 공통 스타일 관리
모든 공통 스타일은 CSS 파일에서 분리하여 관리한다. (뷰 파일 내 인라인 스타일 지양)

```
css/
 ├─ base/
 ├─ layout/
 ├─ components/
 └─ themes/
```

### HTML 클래스 작성
HTML에는 의미 기반 클래스(Semantic Classes)를 사용하여 작성한다.  
Tailwind CSS의 유틸리티 클래스는 실제 빌드 및 배포되는 프로덕션 코드에 적용하지 않는다. (단, 디자인 레퍼런스 및 프로토타이핑 테스트의 구성, 간격, 모달, 토스트 레이아웃 참고 등 개발 용도로 한정하여 활용 가능)

```html
<!-- ✅ 권장 -->
<div class="settings-panel">
  <div class="theme-card">
    <button class="btn-primary">저장</button>
  </div>
</div>
```

### 테마 시스템 정책
프로젝트의 테마는 **CSS Variables** 기반으로 일괄 관리하여 지원한다.

```css
/* 예시 */
:root {
  --bg-color: #0f172a;
  --surface-color: #111827;
  --text-color: #ffffff;
  --primary-color: #6366f1;
}
```

---

## 17. CSS Naming Convention (BEM)

### 17-1. 기본 원칙

본 프로젝트는 BEM(Block Element Modifier) 방식을 따른다.

---

### 17-2. 구조

- Block: 독립 컴포넌트
- Element: 구성 요소
- Modifier: 상태 / 변형

---

### 17-3. 예시

```
.toast
.toast__container
.toast__item
.toast__title

.toast__item--success
.toast__item--error
```

Tailwind 유틸리티 클래스(`fixed top-4 left-4 z-[9999] ...`)가 HTML에 남아있는 경우,
위 BEM 네이밍으로 치환하고 해당 스타일은 CSS 파일로 옮긴다.

```html
<!-- ❌ 금지 -->
<div class="fixed top-4 left-4 z-[9999] flex flex-col gap-2 max-w-sm pointer-events-none">

<!-- ✅ 허용 -->
<div class="toast__container toast__container--tl">
```

동적으로 추가/제거되는 CSS 클래스는
해당 화면을 담당하는 `*.view.js` 에서만 처리한다.
Service 계층에서는 classList 조작을 금지한다.

```javascript
// toast.view.js
export function showToast(message, type) {
  const toast = createToastElement(message);

  toast.classList.add('is-active');
  toast.classList.add(`toast__item--${type}`);

  container.appendChild(toast);
}
```

허용
- toast.view.js
- modal.view.js
- settings.view.js
- license.view.js　← `licenseBadge.classList.add('license-badge--pro')` 같은 처리 포함

금지
- toast.service.js
- theme.service.js
- license.service.js

---

### 17-4. 금지 사항

- Tailwind utility class를 HTML에서 직접 사용 금지
- 의미 없는 class 사용 금지 (.a, .test, .temp)
- JS에서 스타일 class 직접 생성 금지

---

### 17-5. 상태 클래스 규칙

공통 상태는 is-* prefix 사용

.is-active
.is-hidden
.is-loading

---

### 17-6. JS와 연결 규칙

- View layer에서만 BEM class 추가/제거 가능
- Service / Module에서는 DOM class 변경 금지

> **원칙: 클래스를 추가하는 책임 = 해당 화면(View)을 담당하는 파일.**
> `settings.view.js` / `theme.view.js` / `license.view.js` / `toast.view.js` / `modal.view.js` 등
> 각자 자기 화면의 `classList.add()` / `remove()` / `toggle()` 을 직접 담당한다.

---

### 17-7. 클래스 책임 흐름 정리

시멘틱 클래스(BEM, §17-1~17-5) · CSS 결과물 위치(§16) · 동적 클래스 주입(§17-6) 을
레이어 흐름 한 줄로 정리하면 다음과 같다.

```
CSS 정의 (BEM 클래스 선언)
    ↓
components/*.css                  ← 클래스가 어떤 모양일지 정의만 함. 선택자만 존재, 로직 없음

상태 결정 (이 클래스를 붙여야 하는가?)
    ↓
*.module.js                       ← 조건 판단·흐름 제어. classList 직접 조작은 하지 않음

DOM(classList) 변경 (실제로 클래스를 붙인다)
    ↓
views/*.view.js                   ← classList.add/remove/toggle 실행 — 유일한 실행 지점

IPC / Storage (서버·파일 데이터 필요 시)
    ↓
*.service.js                      ← ipcClient 호출. DOM 접근·classList 조작 금지
```

| 단계 | 책임 파일 | 하는 일 | 하지 않는 일 |
|---|---|---|---|
| CSS 정의 | `components/*.css` | BEM 클래스의 실제 스타일 선언 | 로직, 조건 분기 |
| 상태 결정 | `*.module.js` | "이 클래스를 적용해야 하는가" 판단 후 view 함수 호출 | `classList.add()` 직접 호출 |
| DOM 적용 | `views/*.view.js` | module이 넘긴 결과를 받아 실제 `classList` 변경 | IPC 호출, 비즈니스 판단 |
| 데이터 처리 | `*.service.js` | ipcClient 경유 데이터 조회/저장 | DOM 접근, classList 조작 |

> 즉 "클래스가 어떻게 보일지"는 CSS, "언제 붙일지"는 Module, "실제로 붙이는 동작"은 View, "데이터가 필요하면" Service가 맡는다.
> 이 4단계는 §11 레이어 책임 원칙과 동일한 구조이며, BEM/클래스 주입에 한정해 다시 표현한 것이다.