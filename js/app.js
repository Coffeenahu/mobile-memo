// ===========================
// 상태 (State)
// ===========================
const state = {
    notes: [],
    currentView: 'list',
    editingId: null,
    searchQuery: '',
    sortOption: 'updated-desc',
    editingColor: 'gray',
    colorFilter: 'all',
};

// ===========================
// DOM 요소
// ===========================
const listView      = document.getElementById('list-view');
const editView      = document.getElementById('edit-view');
const searchInput   = document.getElementById('search-input');
const sortSelect    = document.getElementById('sort-select');
const notesContainer = document.getElementById('notes-container');
const fab           = document.getElementById('fab');
const editTitle     = document.getElementById('edit-title');
const editBody      = document.getElementById('edit-body');
const btnBack         = document.getElementById('btn-back');
const btnSave         = document.getElementById('btn-save');
const btnDelete       = document.getElementById('btn-delete');
const btnStar         = document.getElementById('btn-star');
const btnShare        = document.getElementById('btn-share');
const colorPicker     = document.getElementById('color-picker');
const colorFilterBar  = document.getElementById('color-filter-bar');
const autosaveStatus  = document.getElementById('autosave-status');

// ===========================
// 초기화
// ===========================
function init() {
    state.notes = loadNotes();
    state.sortOption = loadSortOption();
    sortSelect.value = state.sortOption;
    state.colorFilter = localStorage.getItem('mobile-memo-color-filter') || 'all';
    updateColorFilter(state.colorFilter);
    renderList();
    bindEvents();
    registerSW();
}

function bindEvents() {
    // 검색
    searchInput.addEventListener('input', function () {
        state.searchQuery = this.value;
        renderList();
    });

    // 정렬
    sortSelect.addEventListener('change', function () {
        state.sortOption = this.value;
        saveSortOption(this.value);
        renderList();
    });

    // 새 메모
    fab.addEventListener('click', openNew);

    // 메모 카드 클릭 (이벤트 위임)
    notesContainer.addEventListener('click', function (e) {
        const starBtn = e.target.closest('.star-btn');
        if (starBtn) {
            toggleStar(Number(starBtn.dataset.id));
            return;
        }
        const card = e.target.closest('.note-card');
        if (card) openEdit(Number(card.dataset.id));
    });

    // 편집 뷰 버튼
    btnBack.addEventListener('click', () => showView('list'));
    btnSave.addEventListener('click', saveNote);
    btnDelete.addEventListener('click', function () {
        if (confirm('정말 삭제할까요?')) {
            deleteNote(state.editingId);
        }
    });
    btnStar.addEventListener('click', function () {
        if (state.editingId !== null) toggleStar(state.editingId);
    });
    btnShare.addEventListener('click', shareNote);

    // 자동 저장
    let autosaveTimer = null;
    function scheduleAutosave() {
        clearTimeout(autosaveTimer);
        autosaveTimer = setTimeout(autoSave, 1000);
    }
    editTitle.addEventListener('input', scheduleAutosave);
    editBody.addEventListener('input', scheduleAutosave);

    // 색상 필터
    colorFilterBar.addEventListener('click', function (e) {
        const chip = e.target.closest('.filter-chip');
        if (!chip) return;
        state.colorFilter = chip.dataset.color;
        localStorage.setItem('mobile-memo-color-filter', state.colorFilter);
        updateColorFilter(state.colorFilter);
        renderList();
    });

    // 색상 선택
    colorPicker.addEventListener('click', function (e) {
        const dot = e.target.closest('.color-dot');
        if (!dot) return;
        state.editingColor = dot.dataset.color;
        updateColorPicker(state.editingColor);
        if (state.editingId !== null) {
            const note = state.notes.find(n => n.id === state.editingId);
            if (note) {
                note.color = state.editingColor;
                saveNotes();
                renderList();
            }
        }
    });
}

// ===========================
// 라우팅
// ===========================
function showView(view) {
    state.currentView = view;
    listView.hidden = (view !== 'list');
    editView.hidden = (view !== 'edit');
}

function openNew() {
    const existingDraft = state.notes.find(n => n.draft);
    if (existingDraft) {
        openEdit(existingDraft.id);
        return;
    }
    state.editingId = null;
    editTitle.value = '';
    editBody.value = '';
    btnDelete.hidden = true;
    updateStarBtn(false);
    state.editingColor = 'gray';
    updateColorPicker('gray');
    showView('edit');
    editTitle.focus();
}

function openEdit(id) {
    const note = state.notes.find(n => n.id === id);
    if (!note) return;

    state.editingId = id;
    editTitle.value = note.title;
    editBody.value = note.body;
    btnDelete.hidden = false;
    updateStarBtn(note.starred);
    state.editingColor = note.color || 'gray';
    updateColorPicker(state.editingColor);
    showView('edit');
    editBody.focus();
}

// ===========================
// CRUD
// ===========================
function saveNote() {
    const title = editTitle.value.trim();
    const body  = editBody.value.trim();

    if (!title && !body) {
        alert('내용을 입력하세요.');
        return;
    }

    const now = new Date().toISOString();

    if (state.editingId === null) {
        // 새 메모 추가
        state.notes.unshift({
            id: Date.now(),
            title,
            body,
            starred: false,
            color: state.editingColor,
            draft: false,
            createdAt: now,
            updatedAt: now,
        });
    } else {
        // 기존 메모 수정
        const note = state.notes.find(n => n.id === state.editingId);
        if (note) {
            note.title     = title;
            note.body      = body;
            note.color     = state.editingColor;
            note.draft     = false;
            note.updatedAt = now;
        }
    }

    saveNotes();
    renderList();
    showView('list');
}

function deleteNote(id) {
    state.notes = state.notes.filter(n => n.id !== id);
    saveNotes();
    renderList();
    showView('list');
}

// ===========================
// 렌더링
// ===========================
function renderList() {
    const query = state.searchQuery.toLowerCase();

    const filtered = state.notes
        .filter(n => {
            const matchSearch = n.title.toLowerCase().includes(query) ||
                                n.body.toLowerCase().includes(query);
            const matchColor  = state.colorFilter === 'all' ||
                                (n.color || 'gray') === state.colorFilter;
            return matchSearch && matchColor;
        });

    const sorted = sortNotes(filtered, state.sortOption);

    notesContainer.innerHTML = '';

    if (sorted.length === 0) {
        const msg = query
            ? '검색 결과가 없어요.'
            : '메모가 없어요.\n＋를 눌러 첫 메모를 작성하세요.';
        const div = document.createElement('div');
        div.className = 'empty-state';
        div.textContent = msg;
        notesContainer.appendChild(div);
        return;
    }

    sorted.forEach(note => {
        notesContainer.appendChild(createCard(note));
    });
}

function createCard(note) {
    const div = document.createElement('div');
    div.className = 'note-card' + (note.starred ? ' starred' : '');
    div.dataset.id = note.id;

    // 스와이프 배경 (우 → 별, 좌 → 삭제)
    const bgRight = document.createElement('div');
    bgRight.className = 'swipe-bg swipe-bg--right';
    bgRight.textContent = '★';

    const bgLeft = document.createElement('div');
    bgLeft.className = 'swipe-bg swipe-bg--left';
    bgLeft.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>';

    // 스와이프 콘텐츠 (움직이는 레이어)
    const swipeContent = document.createElement('div');
    swipeContent.className = 'swipe-content';

    const colorBar = document.createElement('div');
    colorBar.className = 'note-color-bar color--' + (note.color || 'gray');

    const body = document.createElement('div');
    body.className = 'note-card-body';

    const topRow = document.createElement('div');
    topRow.className = 'note-top-row';

    const titleEl = document.createElement('div');
    titleEl.className = 'note-title';
    titleEl.textContent = note.title || '(제목 없음)';

    const starBtn = document.createElement('button');
    starBtn.className = 'star-btn';
    starBtn.dataset.id = note.id;
    starBtn.setAttribute('aria-label', note.starred ? '즐겨찾기 해제' : '즐겨찾기');
    starBtn.textContent = note.starred ? '★' : '☆';

    topRow.appendChild(titleEl);
    topRow.appendChild(starBtn);

    const preview = getPreview(note.body);
    const metaEl = document.createElement('div');
    metaEl.className = 'note-meta';
    const draftBadge = note.draft ? '<span class="draft-badge">임시저장</span> ' : '';
    metaEl.innerHTML = draftBadge + formatDate(note.updatedAt) + (preview ? ' · ' + preview : '');

    body.appendChild(topRow);
    body.appendChild(metaEl);
    swipeContent.appendChild(colorBar);
    swipeContent.appendChild(body);

    div.appendChild(bgRight);
    div.appendChild(bgLeft);
    div.appendChild(swipeContent);

    addSwipeListeners(div, swipeContent, bgRight, bgLeft, note.id);
    return div;
}

// ===========================
// 스와이프 액션
// ===========================
function addSwipeListeners(card, content, bgRight, bgLeft, noteId) {
    let threshold = 0;
    let startX = 0, startY = 0, currentX = 0;
    let dirLocked = false, isHorizontal = false;

    card.addEventListener('touchstart', function (e) {
        threshold = card.offsetWidth * 0.6;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        currentX = 0;
        dirLocked = false;
        isHorizontal = false;
        content.style.transition = 'none';
    }, { passive: true });

    card.addEventListener('touchmove', function (e) {
        const dx = e.touches[0].clientX - startX;
        const dy = e.touches[0].clientY - startY;

        if (!dirLocked) {
            dirLocked = true;
            isHorizontal = Math.abs(dx) > Math.abs(dy);
        }
        if (!isHorizontal) return;

        e.preventDefault();
        currentX = dx;
        content.style.transform = `translateX(${dx}px)`;

        const progress = Math.min(Math.abs(dx) / threshold, 1);
        if (dx > 0) {
            bgRight.style.opacity = progress;
            bgLeft.style.opacity = 0;
        } else {
            bgLeft.style.opacity = progress;
            bgRight.style.opacity = 0;
        }
    }, { passive: false });

    card.addEventListener('touchend', function () {
        if (!isHorizontal) return;

        content.style.transition = 'transform 0.2s ease';
        bgRight.style.opacity = 0;
        bgLeft.style.opacity = 0;

        if (Math.abs(currentX) >= threshold) {
            if (currentX < 0) {
                // 좌 스와이프 → 삭제
                content.style.transform = 'translateX(-110%)';
                setTimeout(() => deleteNote(noteId), 200);
            } else {
                // 우 스와이프 → 즐겨찾기 토글
                content.style.transform = 'translateX(0)';
                toggleStar(noteId);
            }
        } else {
            content.style.transform = 'translateX(0)';
        }
        currentX = 0;
    });
}

// ===========================
// 자동 저장
// ===========================
let autosaveStatusTimer = null;

function autoSave() {
    const title = editTitle.value.trim();
    const body  = editBody.value.trim();
    if (!title && !body) return;

    const now = new Date().toISOString();

    if (state.editingId === null) {
        // 새 메모 임시저장으로 생성
        const newNote = {
            id: Date.now(),
            title,
            body,
            starred: false,
            color: state.editingColor,
            draft: true,
            createdAt: now,
            updatedAt: now,
        };
        state.notes.unshift(newNote);
        state.editingId = newNote.id;
        btnDelete.hidden = false;
        saveNotes();
        renderList();
        showAutosaveStatus();
        return;
    } else {
        const note = state.notes.find(n => n.id === state.editingId);
        if (!note) return;
        note.title     = title;
        note.body      = body;
        note.updatedAt = now;
    }

    saveNotes();
    showAutosaveStatus();
}

function showAutosaveStatus() {
    autosaveStatus.textContent = '저장됨';
    autosaveStatus.classList.add('visible');
    clearTimeout(autosaveStatusTimer);
    autosaveStatusTimer = setTimeout(() => {
        autosaveStatus.classList.remove('visible');
    }, 1000);
}

// ===========================
// 색상 라벨
// ===========================
function updateColorPicker(color) {
    colorPicker.querySelectorAll('.color-dot').forEach(dot => {
        dot.classList.toggle('active', dot.dataset.color === color);
    });
}

function updateColorFilter(color) {
    colorFilterBar.querySelectorAll('.filter-chip').forEach(chip => {
        chip.classList.toggle('active', chip.dataset.color === color);
    });
}

// ===========================
// 공유
// ===========================
function shareNote() {
    if (!navigator.share) {
        alert('이 브라우저는 공유 기능을 지원하지 않아요.');
        return;
    }
    const title = editTitle.value.trim() || '메모';
    const text  = editBody.value.trim();
    if (!title && !text) return;
    navigator.share({ title, text }).catch(() => {});
}

// ===========================
// 정렬
// ===========================
function sortNotes(notes, option) {
    return [...notes].sort((a, b) => {
        if (a.draft !== b.draft) return a.draft ? -1 : 1;
        if (a.starred !== b.starred) return a.starred ? -1 : 1;
        switch (option) {
            case 'updated-asc':
                return new Date(a.updatedAt) - new Date(b.updatedAt);
            case 'created-desc':
                return new Date(b.createdAt) - new Date(a.createdAt);
            case 'title-asc':
                return (a.title || '').localeCompare(b.title || '', 'ko', { sensitivity: 'base' });
            default: // updated-desc
                return new Date(b.updatedAt) - new Date(a.updatedAt);
        }
    });
}

function loadSortOption() {
    return localStorage.getItem('mobile-memo-sort') || 'updated-desc';
}

function saveSortOption(option) {
    localStorage.setItem('mobile-memo-sort', option);
}

// ===========================
// 즐겨찾기
// ===========================
function toggleStar(id) {
    const note = state.notes.find(n => n.id === id);
    if (!note) return;
    note.starred = !note.starred;
    saveNotes();
    renderList();
    if (state.editingId === id) updateStarBtn(note.starred);
}

function updateStarBtn(starred) {
    btnStar.textContent = starred ? '★' : '☆';
    btnStar.classList.toggle('active', !!starred);
    btnStar.setAttribute('aria-label', starred ? '즐겨찾기 해제' : '즐겨찾기');
}

// ===========================
// 유틸
// ===========================
function formatDate(iso) {
    const d = new Date(iso);
    return `${d.getMonth() + 1}/${d.getDate()}`;
}

function getPreview(text) {
    if (!text) return '';
    return text.split('\n').slice(0, 2).join(' ').substring(0, 60);
}

// ===========================
// LocalStorage
// ===========================
function loadNotes() {
    try {
        return JSON.parse(localStorage.getItem('mobile-memo-notes')) || [];
    } catch {
        return [];
    }
}

function saveNotes() {
    localStorage.setItem('mobile-memo-notes', JSON.stringify(state.notes));
}

// ===========================
// Service Worker 등록
// ===========================
function registerSW() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js').catch(function (err) {
            console.warn('SW 등록 실패:', err);
        });
    }
}

// ===========================
// 키보드 단축키
// ===========================
document.addEventListener('keydown', function (e) {
    const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName);
    const ctrl = e.ctrlKey || e.metaKey;

    if (state.currentView === 'edit') {
        if (ctrl && e.key === 's') {
            e.preventDefault();
            saveNote();
        } else if (e.key === 'Escape') {
            showView('list');
        } else if (ctrl && e.key === 'd') {
            e.preventDefault();
            if (state.editingId !== null && confirm('정말 삭제할까요?')) {
                deleteNote(state.editingId);
            }
        }
    } else if (state.currentView === 'list') {
        if (ctrl && e.key === 'm' && !isTyping) {
            e.preventDefault();
            openNew();
        } else if (ctrl && e.key === 'f') {
            e.preventDefault();
            searchInput.focus();
        }
    }
});

// ===========================
// 시작
// ===========================
init();
