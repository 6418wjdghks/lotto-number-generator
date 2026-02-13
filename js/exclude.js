/**
 * 로또번호 추첨기 - 번호 제외 기능
 * 의존: EXCLUDED_KEY (utils.js)
 */

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

// Node.js 환경에서 테스트를 위한 모듈 내보내기
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getExcludedNumbers,
    toggleExcludeView,
    updateExcludeCount,
    resetExcludedNumbers,
    saveExcludedNumbers,
    loadExcludedNumbers,
    clearExcludedNumbers,
  };
}
