# Design: 색상별 필터링 (Color Filter)

- **작성일**: 2026-03-05
- **Phase**: Design
- **참고**: [features-implementation.plan.md](../../01-plan/features/features-implementation.plan.md) 섹션 1

---

## 1. UI 구조

헤더 아래 검색/정렬 바와 노트 목록 사이에 필터 칩 행을 추가한다.

```
┌─────────────────────────────────┐
│ [검색창................] [정렬▼] │  ← 기존 header-controls
├─────────────────────────────────┤
│ [전체] [●] [●] [●] [●] [●]     │  ← 신규 color-filter-bar
├─────────────────────────────────┘
│ 메모 카드 목록...               │
```

### 필터 칩 구성

| 칩 | data-color | 표시 |
|----|-----------|------|
| 전체 | `all` | "전체" 텍스트 |
| 회색 | `gray` | 채워진 원 (회색) |
| 빨강 | `red` | 채워진 원 (빨강) |
| 주황 | `orange` | 채워진 원 (주황) |
| 노랑 | `yellow` | 채워진 원 (노랑) |
| 초록 | `green` | 채워진 원 (초록) |
| 파랑 | `blue` | 채워진 원 (파랑) |
| 보라 | `purple` | 채워진 원 (보라) |

---

## 2. HTML 변경 (index.html)

`app-header` 아래, `notes-container` 위에 삽입:

```html
<div id="color-filter-bar" class="color-filter-bar">
    <button class="filter-chip active" data-color="all">전체</button>
    <button class="filter-chip" data-color="gray"></button>
    <button class="filter-chip" data-color="red"></button>
    <button class="filter-chip" data-color="orange"></button>
    <button class="filter-chip" data-color="yellow"></button>
    <button class="filter-chip" data-color="green"></button>
    <button class="filter-chip" data-color="blue"></button>
    <button class="filter-chip" data-color="purple"></button>
</div>
```

---

## 3. CSS 스타일

```css
.color-filter-bar {
    display: flex;
    gap: 8px;
    padding: 8px 16px;
    overflow-x: auto;         /* 칩이 많아도 가로 스크롤 */
    border-bottom: 1px solid var(--border-subtle);
    background: var(--bg-surface);
}

/* "전체" 텍스트 칩 */
.filter-chip[data-color="all"] {
    padding: 4px 12px;
    border-radius: 20px;
    border: 1.5px solid var(--border-card);
    background: none;
    font-size: 0.82rem;
    color: var(--text-secondary);
    cursor: pointer;
    white-space: nowrap;
}

/* 색상 원형 칩 */
.filter-chip:not([data-color="all"]) {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 2.5px solid transparent;
    cursor: pointer;
}

/* 색상별 배경 — 편집뷰 color-dot과 동일한 색 사용 */
.filter-chip[data-color="gray"]   { background: #cbd5e1; }
.filter-chip[data-color="red"]    { background: #f87171; }
.filter-chip[data-color="orange"] { background: #fb923c; }
.filter-chip[data-color="yellow"] { background: #fbbf24; }
.filter-chip[data-color="green"]  { background: #4ade80; }
.filter-chip[data-color="blue"]   { background: #60a5fa; }
.filter-chip[data-color="purple"] { background: #c084fc; }

/* 선택 상태 */
.filter-chip.active[data-color="all"] {
    background: var(--accent);
    color: #fff;
    border-color: var(--accent);
}

.filter-chip.active:not([data-color="all"]) {
    border-color: var(--text-secondary);
    transform: scale(1.15);
}
```

---

## 4. JavaScript 변경 (js/app.js)

### 4.1 state 추가
```js
const state = {
    ...
    colorFilter: 'all',   // 'all' | 'gray' | 'red' | 'blue' | 'green' | 'yellow'
};
```

### 4.2 init() — LocalStorage 복원
```js
state.colorFilter = localStorage.getItem('mobile-memo-color-filter') || 'all';
// 칩 활성 상태 반영
updateColorFilter(state.colorFilter);
```

### 4.3 이벤트 바인딩
```js
document.getElementById('color-filter-bar').addEventListener('click', function (e) {
    const chip = e.target.closest('.filter-chip');
    if (!chip) return;
    state.colorFilter = chip.dataset.color;
    localStorage.setItem('mobile-memo-color-filter', state.colorFilter);
    updateColorFilter(state.colorFilter);
    renderList();
});
```

### 4.4 updateColorFilter()
```js
function updateColorFilter(color) {
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.classList.toggle('active', chip.dataset.color === color);
    });
}
```

### 4.5 renderList() — 필터 조건 추가
```js
const filtered = state.notes.filter(n => {
    const matchSearch = n.title.toLowerCase().includes(query) ||
                        n.body.toLowerCase().includes(query);
    const matchColor  = state.colorFilter === 'all' ||
                        (n.color || 'gray') === state.colorFilter;
    return matchSearch && matchColor;
});
```

---

## 5. 인터랙션

- 칩 탭 → 해당 색상만 표시, 선택된 칩 강조
- "전체" 탭 → 모든 메모 표시
- 검색과 필터는 AND 조건으로 동시 적용
- 선택 상태 LocalStorage 저장 → 앱 재시작 후 유지

---

## 6. 엣지 케이스

| 상황 | 처리 |
|------|------|
| 선택된 색상의 메모가 없음 | 기존 empty-state 메시지 표시 |
| color 필드 없는 구 메모 | `gray`로 간주 |
| 임시저장(draft) 메모 | 색상 필터 적용 (color 필드 있음) |
