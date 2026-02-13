/**
 * 로또번호 추첨기 - 메인 애플리케이션
 * 1-45 범위의 숫자 중 6개를 무작위로 추첨합니다.
 * Phase 4: 듀얼 모드 (비로그인: LocalStorage, 로그인: Supabase)
 */

// LocalStorage 키
const STORAGE_KEY = 'lotto_history';
const EXCLUDED_KEY = 'lotto_excluded';
const THEME_KEY = 'lotto_theme';
const MAX_HISTORY = 20;

/**
 * 로또번호 생성 함수 (메인)
 * 선택된 세트 수만큼 로또번호를 생성합니다.
 */
function generateLottoNumbers() {
  const excludedNumbers = getExcludedNumbers();

  // 남은 번호가 6개 미만이면 추첨 중단
  if (45 - excludedNumbers.length < 6) {
    showToast('최소 6개의 번호가 필요합니다.', 'error');
    return;
  }

  const setCount = getSelectedSetCount();
  const sets = generateMultipleSets(setCount, excludedNumbers);
  displayMultipleSets(sets);

  // 각 세트를 이력에 저장 (fire-and-forget)
  sets.forEach(numbers => {
    saveToHistory(numbers, setCount);
  });
}

/**
 * 단일 로또번호 생성 (내부 함수)
 * Fisher-Yates 셔플 알고리즘을 사용하여 무작위 숫자를 생성합니다.
 * @param {number[]} excludedNumbers - 제외할 번호 배열 (기본값: [])
 * @returns {number[]} 6개의 정렬된 숫자 배열
 */
function generateSingleSet(excludedNumbers = []) {
  // 1부터 45까지의 숫자 중 제외 번호를 뺀 배열 생성
  const numbers = Array.from({ length: 45 }, (_, i) => i + 1)
    .filter(n => !excludedNumbers.includes(n));

  // Fisher-Yates 셔플 알고리즘으로 무작위 섞기
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }

  // 앞의 6개 숫자 선택 후 정렬
  return numbers.slice(0, 6).sort((a, b) => a - b);
}

/**
 * 여러 세트 생성
 * @param {number} count - 생성할 세트 수 (1~5)
 * @param {number[]} excludedNumbers - 제외할 번호 배열 (기본값: [])
 * @returns {Array<number[]>} 세트 배열
 */
function generateMultipleSets(count, excludedNumbers = []) {
  const sets = [];
  for (let i = 0; i < count; i++) {
    sets.push(generateSingleSet(excludedNumbers));
  }
  return sets;
}

/**
 * 선택된 세트 수 조회
 * @returns {number} 세트 수 (1~5)
 */
function getSelectedSetCount() {
  const select = document.getElementById('setCount');
  return parseInt(select.value, 10);
}

/**
 * 여러 세트를 화면에 표시
 * @param {Array<number[]>} sets - 세트 배열
 */
function displayMultipleSets(sets) {
  const container = document.getElementById('setsContainer');
  container.innerHTML = '';

  sets.forEach((numbers, setIndex) => {
    // 세트 카드 생성
    const setCard = document.createElement('div');
    setCard.className = 'set-card';
    setCard.style.animationDelay = `${setIndex * 0.1}s`;

    // 세트 라벨 생성
    const setLabel = document.createElement('div');
    setLabel.className = 'set-label';
    setLabel.textContent = `${setIndex + 1}회차`;

    // 숫자 컨테이너 생성
    const numbersContainer = document.createElement('div');
    numbersContainer.className = 'set-numbers';

    // 숫자 뱃지 생성
    numbers.forEach((num, numIndex) => {
      const numberDiv = document.createElement('div');
      numberDiv.className = 'number';
      numberDiv.textContent = num;
      numberDiv.style.animationDelay = `${(setIndex * 0.1) + (numIndex * 0.05)}s`;
      numbersContainer.appendChild(numberDiv);
    });

    // 복사 버튼 생성
    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn';
    copyBtn.textContent = '📋 복사';
    copyBtn.onclick = () => copyToClipboard(numbers, setIndex + 1);

    setCard.appendChild(setLabel);
    setCard.appendChild(numbersContainer);
    setCard.appendChild(copyBtn);
    container.appendChild(setCard);
  });
}

/**
 * UUID v4 생성 함수
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// ============================================================
// 이력 관리 — LocalStorage (기존 로직)
// ============================================================

/**
 * 추첨 결과를 LocalStorage에 저장
 * @param {number[]} numbers - 추첨된 숫자 배열
 * @param {number} setCount - 동시 추첨 세트 수 (기본값: 1)
 */
function saveToHistoryLocal(numbers, setCount = 1) {
  try {
    const history = loadHistoryLocal();

    const newItem = {
      id: generateUUID(),
      numbers: numbers,
      timestamp: new Date().toISOString(),
      setCount: setCount
    };

    history.unshift(newItem);

    if (history.length > MAX_HISTORY) {
      history.splice(MAX_HISTORY);
    }

    const data = {
      version: '1.0',
      history: history
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('이력 저장 실패:', error);
  }
}

/**
 * LocalStorage에서 이력 로드
 * @returns {Array} 이력 배열
 */
function loadHistoryLocal() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return [];
    }

    const parsed = JSON.parse(data);

    if (parsed.version !== '1.0') {
      console.warn('알 수 없는 데이터 버전:', parsed.version);
      return [];
    }

    return parsed.history || [];
  } catch (error) {
    console.error('이력 로드 실패:', error);
    return [];
  }
}

/**
 * LocalStorage 전체 이력 삭제
 */
function clearHistoryLocal() {
  localStorage.removeItem(STORAGE_KEY);
}

// ============================================================
// 이력 관리 — 듀얼 모드 (LocalStorage / Supabase)
// ============================================================

/**
 * 추첨 결과를 이력에 저장 (듀얼 모드)
 * 로그인 시 Supabase, 아니면 LocalStorage
 * @param {number[]} numbers - 추첨된 숫자 배열
 * @param {number} setCount - 동시 추첨 세트 수 (기본값: 1)
 */
async function saveToHistory(numbers, setCount = 1) {
  if (typeof window !== 'undefined' && window.supabase && window.supabase.isLoggedIn()) {
    try {
      await window.supabase.insertHistory(numbers, setCount);
    } catch (error) {
      console.error('서버 저장 실패:', error);
      showToast('서버 저장에 실패했습니다.', 'error');
    }
  } else {
    saveToHistoryLocal(numbers, setCount);
  }

  // 이력 표시 갱신 (열려있으면)
  const historyList = document.getElementById('historyList');
  if (!historyList.classList.contains('hidden')) {
    displayHistory();
  }
}

/**
 * 이력 로드 (듀얼 모드)
 * 로그인 시 Supabase, 아니면 LocalStorage
 * @returns {Promise<Array>} 이력 배열
 */
async function loadHistory() {
  if (typeof window !== 'undefined' && window.supabase && window.supabase.isLoggedIn()) {
    try {
      const items = await window.supabase.fetchHistory();
      return items.map(item => ({
        id: item.id,
        numbers: item.numbers,
        timestamp: item.created_at,
        setCount: item.set_count
      }));
    } catch (error) {
      console.error('서버 로드 실패:', error);
      return [];
    }
  }
  return loadHistoryLocal();
}

/**
 * 전체 이력 삭제 (듀얼 모드)
 */
async function clearHistory() {
  const history = await loadHistory();
  if (history.length === 0) {
    alert('삭제할 이력이 없습니다.');
    return;
  }

  if (!confirm('모든 추첨 이력을 삭제하시겠습니까?')) {
    return;
  }

  try {
    if (typeof window !== 'undefined' && window.supabase && window.supabase.isLoggedIn()) {
      await window.supabase.deleteAllHistory();
    } else {
      clearHistoryLocal();
    }
    await displayHistory();
    alert('이력이 삭제되었습니다.');
  } catch (error) {
    console.error('이력 삭제 실패:', error);
    alert('이력 삭제에 실패했습니다.');
  }
}

/**
 * 이력 표시
 */
async function displayHistory() {
  const historyList = document.getElementById('historyList');
  const history = await loadHistory();

  historyList.innerHTML = '';

  if (history.length === 0) {
    historyList.innerHTML = '<div class="history-empty">아직 추첨 이력이 없습니다.</div>';
    return;
  }

  history.forEach(item => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'history-item';

    // 시간 표시
    const timeDiv = document.createElement('div');
    timeDiv.className = 'history-time';
    const date = new Date(item.timestamp);
    const timeString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    const setInfo = item.setCount > 1 ? ` (${item.setCount}세트 중)` : '';
    timeDiv.textContent = timeString + setInfo;

    // 숫자 표시
    const numbersDiv = document.createElement('div');
    numbersDiv.className = 'history-numbers';
    numbersDiv.textContent = item.numbers.join(', ');

    itemDiv.appendChild(timeDiv);
    itemDiv.appendChild(numbersDiv);
    historyList.appendChild(itemDiv);
  });
}

/**
 * 이력 표시/숨김 토글
 */
function toggleHistoryView() {
  const historyList = document.getElementById('historyList');
  const toggleText = document.getElementById('historyToggleText');

  if (historyList.classList.contains('hidden')) {
    historyList.classList.remove('hidden');
    toggleText.textContent = '이력 숨기기 ▲';
    displayHistory();
  } else {
    historyList.classList.add('hidden');
    toggleText.textContent = '이력 보기 ▼';
  }
}

/**
 * 클립보드에 복사
 * @param {number[]} numbers - 복사할 숫자 배열
 * @param {number} setNumber - 세트 번호 (선택, 여러 세트일 때)
 * @returns {Promise<boolean>} 성공 여부
 */
async function copyToClipboard(numbers, setNumber = null) {
  try {
    // Clipboard API 지원 확인
    if (!navigator.clipboard) {
      showToast('복사 기능을 지원하지 않는 브라우저입니다.', 'error');
      return false;
    }

    // 텍스트 생성
    const text = numbers.join(', ');

    // 클립보드에 복사
    await navigator.clipboard.writeText(text);

    // 성공 피드백
    const message = setNumber ? `${setNumber}회차 복사되었습니다!` : '복사되었습니다!';
    showToast(message, 'success');

    return true;
  } catch (error) {
    console.error('복사 실패:', error);

    // HTTPS 필요 에러 처리
    if (error.name === 'NotAllowedError') {
      showToast('보안 연결(HTTPS)에서만 사용 가능합니다.', 'error');
    } else {
      showToast('복사에 실패했습니다. 다시 시도해주세요.', 'error');
    }

    return false;
  }
}

/**
 * 제외된 번호 목록 조회
 * @returns {number[]} 제외된 번호 배열
 */
function getExcludedNumbers() {
  const buttons = document.querySelectorAll('.exclude-btn.excluded');
  return Array.from(buttons).map(btn => parseInt(btn.textContent, 10));
}

/**
 * 번호 제외 패널 표시/숨김 토글
 */
function toggleExcludeView() {
  const panel = document.getElementById('excludePanel');
  const toggleText = document.getElementById('excludeToggleText');
  const grid = document.getElementById('excludeGrid');

  if (panel.classList.contains('hidden')) {
    panel.classList.remove('hidden');
    toggleText.textContent = '번호 제외 설정 ▲';

    // 그리드가 비어있으면 초기 생성
    if (grid.children.length === 0) {
      const saved = loadExcludedNumbers();
      for (let i = 1; i <= 45; i++) {
        const btn = document.createElement('button');
        btn.className = 'exclude-btn';
        if (saved.includes(i)) {
          btn.classList.add('excluded');
        }
        btn.textContent = i;
        btn.type = 'button';
        btn.onclick = function() {
          this.classList.toggle('excluded');
          updateExcludeCount();
          saveExcludedNumbers();
        };
        grid.appendChild(btn);
      }
      updateExcludeCount();
    }
  } else {
    panel.classList.add('hidden');
    toggleText.textContent = '번호 제외 설정 ▼';
  }
}

/**
 * 제외 카운터 업데이트
 */
function updateExcludeCount() {
  const excluded = getExcludedNumbers();
  const remaining = 45 - excluded.length;

  document.getElementById('excludeCount').textContent = `제외: ${excluded.length}개`;
  document.getElementById('remainCount').textContent = `남은 번호: ${remaining}개`;

  // 경고 표시/숨김
  const warning = document.getElementById('excludeWarning');
  if (remaining < 6) {
    warning.classList.remove('hidden');
  } else {
    warning.classList.add('hidden');
  }
}

/**
 * 모든 제외 번호 초기화
 */
function resetExcludedNumbers() {
  const buttons = document.querySelectorAll('.exclude-btn.excluded');
  buttons.forEach(btn => btn.classList.remove('excluded'));
  updateExcludeCount();
  clearExcludedNumbers();
}

/**
 * 제외 번호를 LocalStorage에 저장
 */
function saveExcludedNumbers() {
  try {
    const excluded = getExcludedNumbers();
    localStorage.setItem(EXCLUDED_KEY, JSON.stringify(excluded));
  } catch (error) {
    console.error('제외 번호 저장 실패:', error);
  }
}

/**
 * LocalStorage에서 제외 번호 로드
 * @returns {number[]} 제외된 번호 배열
 */
function loadExcludedNumbers() {
  try {
    const data = localStorage.getItem(EXCLUDED_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error('제외 번호 로드 실패:', error);
    return [];
  }
}

/**
 * LocalStorage 제외 번호 삭제
 */
function clearExcludedNumbers() {
  localStorage.removeItem(EXCLUDED_KEY);
}

/**
 * 토스트 메시지 표시
 * @param {string} message - 표시할 메시지
 * @param {string} type - 토스트 타입 ('success' 또는 'error')
 * @param {number} duration - 표시 시간 (ms, 기본값: 2000)
 */
function showToast(message, type = 'success', duration = 2000) {
  // 기존 토스트 제거
  const existingToast = document.querySelector('.toast');
  if (existingToast) {
    existingToast.remove();
  }

  // 토스트 생성
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;

  // DOM에 추가
  document.body.appendChild(toast);

  // 자동 제거
  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, duration);
}

// ============================================================
// 테마 (다크 모드)
// ============================================================

/**
 * 테마 적용
 * @param {string} theme - 'light' 또는 'dark'
 */
function applyTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  updateThemeToggle(theme);
}

/**
 * 토글 버튼 아이콘/aria-label 업데이트
 * @param {string} theme - 'light' 또는 'dark'
 */
function updateThemeToggle(theme) {
  const btn = document.getElementById('btnThemeToggle');
  if (!btn) return;
  if (theme === 'dark') {
    btn.textContent = '☀️';
    btn.setAttribute('aria-label', '라이트 모드 전환');
  } else {
    btn.textContent = '🌙';
    btn.setAttribute('aria-label', '다크 모드 전환');
  }
}

/**
 * 테마 토글 (현재 테마 반전 + 저장)
 */
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  saveTheme(next);
}

/**
 * 테마 로드 (LocalStorage → 시스템설정 → light)
 * @returns {string} 'light' 또는 'dark'
 */
function loadTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
  } catch (error) {
    console.error('테마 로드 실패:', error);
  }
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

/**
 * 테마 저장
 * @param {string} theme - 'light' 또는 'dark'
 */
function saveTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (error) {
    console.error('테마 저장 실패:', error);
  }
}

// ============================================================
// 인증 핸들러
// ============================================================

/**
 * 로그인 폼 토글
 */
function toggleAuthForm() {
  const form = document.getElementById('authForm');
  const toggleText = document.getElementById('authToggleText');

  if (form.classList.contains('hidden')) {
    form.classList.remove('hidden');
    toggleText.textContent = '로그인 / 회원가입 ▲';
  } else {
    form.classList.add('hidden');
    toggleText.textContent = '로그인 / 회원가입 ▼';
  }
}

/**
 * 로그인 처리
 */
async function handleSignIn() {
  if (!window.supabase) {
    showToast('인증 서비스에 연결할 수 없습니다.', 'error');
    return;
  }

  const email = document.getElementById('authEmail').value.trim();
  const password = document.getElementById('authPassword').value;

  if (!email || !password) {
    showToast('이메일과 비밀번호를 입력해주세요.', 'error');
    return;
  }

  const result = await window.supabase.signIn(email, password);

  if (result.success) {
    showToast('로그인 되었습니다!', 'success');
    updateAuthUI();
    // 로그인 후 이력이 열려있으면 갱신
    const historyList = document.getElementById('historyList');
    if (!historyList.classList.contains('hidden')) {
      displayHistory();
    }
  } else {
    showToast(result.error, 'error');
  }
}

/**
 * 회원가입 처리
 */
async function handleSignUp() {
  if (!window.supabase) {
    showToast('인증 서비스에 연결할 수 없습니다.', 'error');
    return;
  }

  const email = document.getElementById('authEmail').value.trim();
  const password = document.getElementById('authPassword').value;

  if (!email || !password) {
    showToast('이메일과 비밀번호를 입력해주세요.', 'error');
    return;
  }

  if (password.length < 6) {
    showToast('비밀번호는 6자 이상이어야 합니다.', 'error');
    return;
  }

  const result = await window.supabase.signUp(email, password);

  if (result.success) {
    if (result.data.access_token) {
      showToast('회원가입 및 로그인 되었습니다!', 'success');
      updateAuthUI();
    } else {
      showToast('이메일 확인 링크를 발송했습니다. 이메일을 확인해주세요.', 'success', 4000);
    }
  } else {
    showToast(result.error, 'error');
  }
}

/**
 * 로그아웃 처리
 */
async function handleSignOut() {
  if (!window.supabase) {
    showToast('인증 서비스에 연결할 수 없습니다.', 'error');
    return;
  }

  await window.supabase.signOut();
  showToast('로그아웃 되었습니다.', 'success');
  updateAuthUI();
  // 로그아웃 후 이력이 열려있으면 로컬 이력으로 갱신
  const historyList = document.getElementById('historyList');
  if (!historyList.classList.contains('hidden')) {
    displayHistory();
  }
}

/**
 * 인증 UI 상태 업데이트
 */
function updateAuthUI() {
  const guestDiv = document.getElementById('authGuest');
  const userDiv = document.getElementById('authUser');
  const emailSpan = document.getElementById('authUserEmail');

  if (window.supabase && window.supabase.isLoggedIn()) {
    const session = window.supabase.getSession();
    guestDiv.classList.add('hidden');
    userDiv.classList.remove('hidden');
    emailSpan.textContent = session.user.email;
  } else {
    guestDiv.classList.remove('hidden');
    userDiv.classList.add('hidden');
    emailSpan.textContent = '';
  }
}

// ============================================================
// 앱 초기화
// ============================================================

/**
 * 페이지 로드 시 세션 확인 및 UI 초기화
 */
function initApp() {
  // 테마 초기화
  const theme = loadTheme();
  applyTheme(theme);

  // 이벤트 바인딩
  document.getElementById('btnGenerate').addEventListener('click', generateLottoNumbers);
  document.getElementById('btnThemeToggle').addEventListener('click', toggleTheme);
  document.getElementById('btnToggleAuth').addEventListener('click', toggleAuthForm);
  document.getElementById('btnSignIn').addEventListener('click', handleSignIn);
  document.getElementById('btnSignUp').addEventListener('click', handleSignUp);
  document.getElementById('btnSignOut').addEventListener('click', handleSignOut);
  document.getElementById('btnToggleExclude').addEventListener('click', toggleExcludeView);
  document.getElementById('btnResetExclude').addEventListener('click', resetExcludedNumbers);
  document.getElementById('btnToggleHistory').addEventListener('click', toggleHistoryView);
  document.getElementById('btnClearHistory').addEventListener('click', clearHistory);

  // 시스템 테마 변경 감지
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
    // LocalStorage에 저장된 값이 없을 때만 시스템 설정 반영
    if (!localStorage.getItem(THEME_KEY)) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });

  // 인증 상태 확인
  if (typeof window !== 'undefined' && window.supabase) {
    updateAuthUI();
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', initApp);
}

// Node.js 환경에서 테스트를 위한 모듈 내보내기
// 테스트 호환성을 위해 Local(동기) 버전을 내보냄
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    STORAGE_KEY,
    EXCLUDED_KEY,
    THEME_KEY,
    MAX_HISTORY,
    generateSingleSet,
    generateMultipleSets,
    generateUUID,
    loadHistory: loadHistoryLocal,
    saveToHistory: saveToHistoryLocal,
    saveExcludedNumbers,
    loadExcludedNumbers,
    clearExcludedNumbers,
  };
}
