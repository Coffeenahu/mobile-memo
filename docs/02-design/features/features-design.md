# Features Design

- **작성일**: 2026-03-05
- **Phase**: Design
- **참고**: [features-implementation.plan.md](../../01-plan/features/features-implementation.plan.md)

---

## 1. 메모 색상 라벨 (Color Label)

### 1.1 UI/UX
- 메모 카드 좌측에 세로 색상 바(4~6px) 표시
- 색상 선택 UI: 편집/생성 뷰 하단에 원형 버튼 또는 select box
- 색상 필터 UI: 목록 뷰 상단에 색상별 필터 버튼 그룹
- 색상 팔레트: 빨강, 파랑, 초록, 노랑, 회색(기본) + 전체 보기
- 선택된 색상은 카드와 편집 뷰 모두에 반영
- 필터 선택 시 해당 색상 메모만 표시, '전체' 선택 시 모든 메모 표시
- 색상별 시인성, 접근성(명암비) 고려

### 1.2 데이터 구조
```js
{
  id: number,
  title: string,
  body: string,
  createdAt: string,
  updatedAt: string,
  starred: boolean,
  color: string // 'red' | 'blue' | 'green' | 'yellow' | 'gray'
}
```

### 1.3 컴포넌트 구조
- NoteCard
  - ColorBar (div.note-label--{color})
  - Content (title, body, star)
- EditView
  - ColorSelector (색상 선택 UI)
- ListView
  - ColorFilter (색상별 필터 버튼 그룹)

### 1.4 스타일 가이드
- 색상 바: width 4~6px, border-radius 적용
- 색상별 클래스:
  - .note-label--red { background: #ff6b6b; }
  - .note-label--blue { background: #228be6; }
  - .note-label--green { background: #51cf66; }
  - .note-label--yellow { background: #ffe066; }
  - .note-label--gray { background: #dee2e6; }
- 카드 hover/active 시 색상 강조

### 1.5 인터랙션
- 색상 선택 시 즉시 미리보기 반영
- 저장/취소 시 선택값 유지/복원
- 필터 버튼 클릭 시 선택 상태 토글 및 메모 목록 즉시 필터링
- 필터 상태는 앱 재시작 후에도 유지
- 기존 메모는 gray로 자동 지정

### 1.6 반응형
- 모바일: 색상 바 두께/간격 최적화
- 데스크톱: hover 효과 추가

### 1.7 접근성
- 색상만으로 구분 어려운 사용자를 위해 색상명 툴팁 제공
- 충분한 명암비 확보

### 1.8 예시
```
|■■| 제목 | 내용 ... |
|■■| ...  | ...     |
```

### 1.9 색상별 필터링 (Color Filtering)

#### 1.9.1 UX 원칙
- 태그 기능과 유사하게 색상별 메모 분류 및 필터링
- 목록 뷰에서 색상별 빠른 필터링 지원
- 다중 필터 불필요 (단일 색상 선택)
- 필터 상태 유지 및 직관적 UI

#### 1.9.2 인터랙션 디자인
- 필터 버튼: 각 색상별 원형 버튼 + '전체' 버튼
- 선택 상태: 버튼 배경색으로 활성화 표시
- 필터링 결과: 선택된 색상 메모만 즉시 표시
- 상태 유지: 앱 재시작 후에도 필터 상태 복원

#### 1.9.3 시각적 디자인
- 필터 버튼 그룹: 검색창 아래에 가로 배치
- 버튼 크기: 32px 원형, 색상별 배경색
- 활성화 표시: 테두리 또는 그림자 효과
- '전체' 버튼: 회색 배경, 'ALL' 텍스트

#### 1.9.4 모바일 최적화
- 터치 친화적: 충분한 버튼 크기와 간격
- 스와이프와 조합: 필터링된 상태에서도 스와이프 동작 유지
- 반응형: 작은 화면에서 버튼 크기 조정

---

## 2. 키보드 단축키 (Keyboard Shortcuts)

### 2.1 UX 원칙
- 데스크톱/태블릿 환경에서 빠른 작업 흐름 지원
- 단축키 입력 시 즉각적 피드백(저장, 뒤로가기, 삭제 등)
- 모바일 환경에서는 단축키 미지원(오작동 방지)
- 브라우저 기본 동작(Ctrl+S 등) 방지

### 2.2 단축키 매핑
| 기능         | 단축키      | 피드백/동작         |
|--------------|-------------|---------------------|
| 저장         | Ctrl+S      | 저장 후 알림/토스트 |
| 뒤로가기     | Esc         | 목록 뷰로 전환      |
| 새 메모      | Ctrl+N      | 새 메모 편집 뷰 진입|
| 검색 포커스  | Ctrl+F      | 검색창 포커스       |
| 삭제         | Ctrl+D      | 삭제 확인 후 실행   |

### 2.3 인터랙션 플로우
- 편집 뷰에서 Ctrl+S 입력 → 저장 함수 실행 → "저장됨" 토스트 표시
- 편집 뷰에서 Esc 입력 → 목록 뷰로 전환
- 목록 뷰에서 Ctrl+N 입력 → 새 메모 편집 뷰 진입
- 목록 뷰에서 Ctrl+F 입력 → 검색창 포커스
- 편집 뷰에서 Ctrl+D 입력 → 삭제 확인 다이얼로그 → 삭제 실행

### 2.4 접근성/피드백
- 단축키 입력 시 시각적 피드백(토스트, 다이얼로그 등)
- 단축키 안내: 도움말/설정 화면, 툴팁 등에서 노출(선택)
- 실수 방지: 삭제 등 위험 동작은 확인 다이얼로그 추가

### 2.5 예외/오작동 방지
- 모바일 환경에서는 단축키 이벤트 무시
- 브라우저 기본 동작 방지
- 입력 포커스가 텍스트필드일 때 일부 단축키 무시(예: Ctrl+N)

### 2.6 예시 UI
- 도움말/설정 화면에 단축키 목록 표기
- 토스트: "저장되었습니다", "삭제되었습니다" 등
- 삭제: "정말 삭제하시겠습니까?" 다이얼로그

### 2.7 테스트 시나리오
- 각 단축키 입력 시 기능 정상 동작 및 피드백 확인
- 모바일/데스크톱 환경별 오작동 없는지 확인
- 텍스트 입력 중 단축키 오작동 방지 확인

---

## 3. 다크모드 (Dark Mode)

### 3.1 UX 원칙
- 시스템 설정(prefers-color-scheme)에 자동 연동
- 수동 토글 없이 자연스러운 테마 전환
- 색상 대비 유지로 가독성 확보
- 부드러운 전환 애니메이션

### 3.2 색상 팔레트
#### 밝은 테마
- 배경: #ffffff
- 텍스트: #333333
- 카드: #f9f9f9
- 테두리: #e0e0e0
- 강조: #007bff

#### 어두운 테마
- 배경: #1a1a1a
- 텍스트: #e0e0e0
- 카드: #2d2d2d
- 테두리: #404040
- 강조: #4dabf7

### 3.3 코드 구조
#### CSS 변수 및 다크모드 스타일
```css
:root {
    --bg-color: #ffffff;
    --text-color: #333333;
    --card-bg: #f9f9f9;
    --border-color: #e0e0e0;
    --accent-color: #007bff;
}

/* prefers-color-scheme 자동 적용 */
@media (prefers-color-scheme: dark) {
    :root {
        --bg-color: #1a1a1a;
        --text-color: #e0e0e0;
        --card-bg: #2d2d2d;
        --border-color: #404040;
        --accent-color: #4dabf7;
    }
}

body {
    background-color: var(--bg-color);
    color: var(--text-color);
    transition: background-color 0.3s, color 0.3s;
}

.note-card {
    background-color: var(--card-bg);
    border: 1px solid var(--border-color);
    transition: background-color 0.3s, border-color 0.3s;
}
```

#### 테마 적용 함수
```javascript
function applyTheme() {
    // prefers-color-scheme에 따라 자동 적용 (CSS에서 처리)
    // 추가 로직 불필요
}
```

### 3.4 인터랙션
- 시스템 설정 변경 시 즉시 테마 전환
- CSS 변수로 모든 색상 체계 구축
- prefers-color-scheme 미디어 쿼리 활용

### 3.5 접근성
- WCAG AA 준수 색상 대비
- 시스템 설정 존중
- 시각적 전환 피드백

### 3.6 예시
```
밝은 테마          어두운 테마
┌─────────────┐    ┌─────────────┐
│█████████████│    │             │
│█████████████│    │█████████████│
│█████████████│    │█████████████│
└─────────────┘    └─────────────┘
```

---

## 4. 내보내기/가져오기 (Export/Import)

### 4.1 UX 원칙
- 간단한 백업/복원 기능
- JSON 파일 포맷으로 호환성 확보
- 사용자 친화적 에러 메시지
- 데이터 무결성 보장

### 4.2 인터랙션 플로우
- 내보내기: 버튼 클릭 → JSON 파일 다운로드
- 가져오기: 버튼 클릭 → 파일 선택 → 파싱 → 복원

### 4.3 코드 구조
#### 내보내기 함수
```javascript
function exportNotes() {
    const data = JSON.stringify(state.notes, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mobile-memo-notes.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
```

#### 가져오기 함수
```javascript
function importNotesFromFile(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const imported = JSON.parse(e.target.result);
            if (!Array.isArray(imported)) throw new Error('잘못된 파일 형식');
            state.notes = imported;
            saveNotes(state.notes);
            renderList();
            alert('가져오기가 완료되었습니다.');
        } catch (err) {
            alert('가져오기 실패: ' + err.message);
        }
    };
    reader.readAsText(file);
}
```

### 4.4 UI 컴포넌트
- 내보내기 버튼: 목록 뷰 헤더
- 가져오기 버튼: 목록 뷰 헤더
- 파일 입력: 숨김 처리

### 4.5 예시
```
[내보내기] [가져오기]
     ↓
mobile-memo-notes.json 다운로드
```

---

## 5. 카카오톡 공유 (KakaoTalk Share)

### 5.1 UX 원칙
- 간편한 메모 공유
- 카카오톡 앱 연동
- 제목+내용 텍스트 전송
- 모바일 환경 최적화

### 5.2 인터랙션 플로우
- 공유 버튼 클릭 → 카카오톡 공유창 → 메시지 전송

### 5.3 코드 구조
#### SDK 초기화
```javascript
Kakao.init('YOUR_APP_KEY');
```

#### 공유 함수
```javascript
function shareToKakao(note) {
    Kakao.Link.sendDefault({
        objectType: 'text',
        text: `제목: ${note.title}\n내용: ${note.body}`,
        link: {
            mobileWebUrl: window.location.href,
            webUrl: window.location.href
        }
    });
}
```

### 5.4 UI 컴포넌트
- 공유 버튼: 메모 카드에 추가
- 카카오톡 공유창: SDK 제공

### 5.5 예시
```
메모 카드
┌─────────────────┐
│ 제목: 샘플 메모   │
│ 내용: 메모 내용... │
│ [카카오톡 공유]   │
└─────────────────┘
```

---

## 6. 스와이프 액션 (Swipe Action)

### 3.1 UI/UX
- 메모 카드 전체를 좌/우로 드래그 가능
- 좌로 스와이프: 삭제(휴지통 아이콘, 빨간 배경)
- 우로 스와이프: 즐겨찾기(별 아이콘, 노란 배경)
- 스와이프 진행 중 배경/아이콘 점진적 노출
- 액션 임계값(예: 60px) 도달 시 진동/애니메이션
- 액션 완료 후 카드 사라지거나 상태 변경

### 3.2 컴포넌트 구조
- NoteCard
  - SwipeContainer (터치 이벤트 처리)
    - ActionBackground (좌/우 배경+아이콘)
    - CardContent (title, body, star, color bar)

### 3.3 스타일 가이드
- 스와이프 배경: 좌(빨강 #fa5252), 우(노랑 #ffe066)
- 아이콘: 휴지통(좌), 별(우), 크기 20~24px
- 카드 이동: transform: translateX(), transition 적용
- 모바일 우선, 데스크톱은 hover만

### 3.4 인터랙션
- 터치 시작 → 이동 → 임계값 도달 시 액션
- 임계값 미만 복귀(스냅백 애니메이션)
- 액션 완료 시 카드 fade out/상태 갱신
- 실수 방지: 임계값, 진동, confirm 등

### 3.5 접근성
- 터치 영역 충분히 확보
- 시각적 피드백 명확히
- 데스크톱 환경 안내(비활성)

### 3.6 예시
```
[ |  ←  |  카드 내용  |  ★  | ]
[ |  →  |  카드 내용  |  ★  | ]
```

---

## 4. 기존 앱 디자인 (Mobile Memo)

### 4.1 설계 목표 및 원칙
#### 설계 목표
- 빌드 도구 없이 `index.html`을 열기만 하면 실행되는 앱
- 모바일 퍼스트 — 360px 이상에서 터치 친화적 UI
- PWA(manifest + SW)로 홈 화면 설치 및 오프라인 동작 지원
- 단방향 데이터 흐름: `state 변경 → render() 호출 → DOM 갱신`

#### 설계 원칙
- **단순성**: 함수 1개 = 역할 1개 (CRUD / 렌더링 / 라우팅 분리)
- **명확한 상태**: 전역 변수 최소화, 상태는 `state` 객체 하나로 관리
- **오류 격리**: LocalStorage 오류는 try/catch로 처리, UI는 정상 동작

### 4.2 아키텍처
#### 전체 구조
```
브라우저
  │
  ├── index.html          ← 뼈대 (두 화면 모두 포함, JS로 show/hide)
  ├── css/style.css       ← 모바일 퍼스트 스타일
  ├── js/app.js           ← 상태 + 렌더링 + 이벤트 + 라우팅
  │
  ├── manifest.json       ← PWA: 앱 이름·아이콘·테마 색
  ├── sw.js               ← PWA: 정적 파일 캐시 (Cache-First)
  └── icons/              ← 홈 화면 아이콘 (192, 512px)
```

#### 화면 흐름 (라우팅)
```
앱 시작
  │
  ├── SW 등록 → 캐시 확인
  │
  ├── state 초기화 (LocalStorage 로드)
  │
  ├── 목록 뷰 렌더링 (renderList)
  │
  ├── 이벤트 바인딩 (bindEvents)
  │
  ├── 사용자 상호작용
      │
      ├── 목록 뷰
      │   ├── 검색 입력 → renderList (필터링)
      │   ├── FAB 클릭 → 새 메모 편집 뷰
      │   └── 메모 카드 클릭 → 해당 메모 편집 뷰
      │
      └── 편집 뷰
          ├── 제목/내용 입력 → 실시간 저장 (debounce)
          ├── 뒤로 버튼 → 목록 뷰
          ├── 저장 버튼 → 목록 뷰 + 저장
          └── 삭제 버튼 → 삭제 확인 → 목록 뷰
```

### 4.3 데이터 모델
```js
// 메모 객체
{
  id: number,           // 고유 ID (Date.now() 사용)
  title: string,        // 제목 (최대 100자)
  body: string,         // 내용 (무제한)
  createdAt: string,    // 생성일 (ISO 8601)
  updatedAt: string,    // 수정일 (ISO 8601)
}

// 상태 객체
const state = {
  notes: [],            // 메모 배열
  currentView: 'list',  // 'list' | 'edit'
  editingId: null,      // 편집 중 메모 ID
  searchQuery: '',      // 검색어
};
```

### 4.4 UI 컴포넌트
#### 목록 뷰 (list-view)
- 헤더: 앱 제목 + 검색창
- 메모 카드 목록 (notes-container)
- FAB (Floating Action Button): 새 메모 추가

#### 편집 뷰 (edit-view)
- 헤더: 뒤로 버튼 + 제목 + 저장/삭제 버튼
- 제목 입력창 (edit-title)
- 내용 입력창 (edit-body)

#### 메모 카드 (note-card)
- 제목 + 내용 미리보기
- 즐겨찾기 버튼 (★)
- 생성일 표시

### 4.5 스타일 가이드
- **색상 팔레트**:
  - 배경: #ffffff (흰색)
  - 텍스트: #333333 (어두운 회색)
  - 카드: #f9f9f9 (연한 회색)
  - 강조: #007bff (파란색)
- **폰트**: 시스템 기본 (sans-serif)
- **간격**: 8px 그리드 (padding, margin)
- **반응형**: 360px ~ 768px (모바일 ~ 태블릿)

### 4.6 인터랙션
- **터치 우선**: 버튼 크기 최소 44px
- **즉각적 피드백**: 클릭 시 시각적 효과
- **오프라인 지원**: LocalStorage 기반, SW 캐시
- **데이터 지속성**: 입력 시 자동 저장 (debounce 300ms)

### 4.7 접근성
- 시맨틱 HTML (header, main, button 등)
- ARIA 레이블 (aria-label)
- 키보드 내비게이션 지원
- 충분한 색상 대비 (WCAG AA 준수)

### 4.8 구현 가이드
#### 초기화 (init)
```js
function init() {
  state.notes = loadNotes();
  renderList();
  bindEvents();
  registerSW();
}
```

#### 렌더링 (render)
```js
function renderList() {
  // 검색 필터링 + 정렬
  const filtered = state.notes.filter(/* 검색 로직 */);
  // DOM 생성 및 삽입
}
```

#### 이벤트 바인딩 (bindEvents)
```js
function bindEvents() {
  // 검색, FAB, 카드 클릭 등
  searchInput.addEventListener('input', () => {
    state.searchQuery = searchInput.value;
    renderList();
  });
}
```

#### LocalStorage 연동
```js
function loadNotes() {
  try {
    return JSON.parse(localStorage.getItem('mobile-memo-notes')) || [];
  } catch {
    return [];
  }
}

function saveNotes(notes) {
  localStorage.setItem('mobile-memo-notes', JSON.stringify(notes));
}
```

### 4.9 PWA 설정
#### manifest.json
```json
{
  "name": "Mobile Memo",
  "short_name": "Memo",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#007bff",
  "background_color": "#ffffff",
  "icons": [
    { "src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

#### sw.js (Cache-First)
```js
const CACHE_NAME = 'mobile-memo-v1';
const urlsToCache = ['/', '/index.html', '/css/style.css', '/js/app.js'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
```

### 4.10 테스트 및 배포
- **로컬 테스트**: `index.html` 브라우저 열기
- **모바일 테스트**: Live Server + 스마트폰 접속
- **PWA 테스트**: HTTPS 환경에서 홈 화면 설치 확인
- **배포**: Vercel/GitHub Pages (SW는 HTTPS 필수)

---

## 5. 자동저장 (Auto Save)

### 5.1 UX 원칙
- 백그라운드에서 자동 저장되어 사용자가 저장을 의식하지 않음
- 데이터 분실 걱정 없이 자유로운 입력 가능
- 300ms 딜레이로 성능과 사용자 경험 균형
- 저장 실패 시 사용자에게 알림 (선택)

### 5.2 피드백
- 저장 표시: 편집 뷰 하단에 "저장됨" 텍스트 표시 (1초 후 사라짐)
- 저장 중 표시: 타이핑 시 "저장 중..." 표시 (선택)
- 실패 시: "저장 실패" 메시지 + 재시도 버튼

### 7.3 코드 구조
#### Debounce 함수
```javascript
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}
```

#### 자동 저장 적용
```javascript
const debouncedSave = debounce(() => {
    if (state.editingId !== null) {
        const note = state.notes.find(n => n.id === state.editingId);
        if (note) {
            note.title = editTitle.value;
            note.body = editBody.value;
            note.updatedAt = new Date().toISOString();
            saveNotes(state.notes);
        }
    }
}, 300);

editTitle.addEventListener('input', debouncedSave);
editBody.addEventListener('input', debouncedSave);
```

### 5.4 접근성
- 저장 상태를 시각적/청각적으로 제공 (선택)
- 키보드 사용자도 동일한 자동 저장 적용
- 저장 실패 시 명확한 에러 메시지

### 5.5 예시 UI
```
편집 뷰
┌─────────────────────────────────┐
│ 제목 입력창                     │
│                                 │
│ 내용 입력창                     │
│                                 │
│                                 │
│                                 │
└─────────────────────────────────┘
저장됨  ← 하단 표시 (1초 후 사라짐)
```

### 5.6 테스트 시나리오
- 빠른 타이핑 시 마지막 입력만 저장되는지 확인
- 긴 텍스트 입력 시 성능 저하 없는지 확인
- 저장 표시가 사용자에게 방해가 되지 않는지 확인
- 오프라인 상태에서 저장 동작 확인