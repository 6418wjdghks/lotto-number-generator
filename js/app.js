/**
 * 로또번호 추첨기 - 메인 애플리케이션 (진입점)
 * 모듈 로딩 순서: utils → theme → exclude → lottery → history → auth → app
 */

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
  // 유틸리티 모듈 로드 및 전역 설정 (다른 모듈의 함수가 참조)
  const utils = require('./utils.js');
  Object.keys(utils).forEach(key => { global[key] = utils[key]; });

  const lottery = require('./lottery.js');
  const history = require('./history.js');
  const exclude = require('./exclude.js');

  module.exports = {
    STORAGE_KEY: utils.STORAGE_KEY,
    EXCLUDED_KEY: utils.EXCLUDED_KEY,
    THEME_KEY: utils.THEME_KEY,
    MAX_HISTORY: utils.MAX_HISTORY,
    generateSingleSet: lottery.generateSingleSet,
    generateMultipleSets: lottery.generateMultipleSets,
    generateUUID: utils.generateUUID,
    loadHistory: history.loadHistoryLocal,
    saveToHistory: history.saveToHistoryLocal,
    saveExcludedNumbers: exclude.saveExcludedNumbers,
    loadExcludedNumbers: exclude.loadExcludedNumbers,
    clearExcludedNumbers: exclude.clearExcludedNumbers,
  };
}
