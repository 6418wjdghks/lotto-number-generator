/**
 * 로또번호 추첨기 - 이력 관리 (LocalStorage + Supabase 듀얼 모드) (L2 Feature)
 * 의존: L3 — window.supabase (supabase-config.js), STORAGE_KEY, MAX_HISTORY, generateUUID, showToast (utils.js)
 */

// ============================================================
// LocalStorage (기존 로직)
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
// 듀얼 모드 (LocalStorage / Supabase)
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

// Node.js 환경에서 테스트를 위한 모듈 내보내기
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    saveToHistoryLocal,
    loadHistoryLocal,
    clearHistoryLocal,
    saveToHistory,
    loadHistory,
    displayHistory,
    toggleHistoryView,
    clearHistory,
  };
}
