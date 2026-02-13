/**
 * 로또번호 추첨기 - 유틸리티 & 상수
 */

// LocalStorage 키
const STORAGE_KEY = 'lotto_history';
const EXCLUDED_KEY = 'lotto_excluded';
const THEME_KEY = 'lotto_theme';
const MAX_HISTORY = 20;

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

// Node.js 환경에서 테스트를 위한 모듈 내보내기
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    STORAGE_KEY,
    EXCLUDED_KEY,
    THEME_KEY,
    MAX_HISTORY,
    generateUUID,
    showToast,
    copyToClipboard,
  };
}
