/**
 * 로또번호 추첨기 - 테마 (다크 모드)
 * 의존: THEME_KEY (utils.js)
 */

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

// Node.js 환경에서 테스트를 위한 모듈 내보내기
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    saveTheme,
    loadTheme,
    applyTheme,
    updateThemeToggle,
    toggleTheme,
  };
}
