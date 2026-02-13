/**
 * 로또번호 추첨기 - 인증 (Supabase)
 * 의존: showToast (utils.js), displayHistory (history.js)
 */

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

// Node.js 환경에서 테스트를 위한 모듈 내보내기
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    toggleAuthForm,
    handleSignIn,
    handleSignUp,
    handleSignOut,
    updateAuthUI,
  };
}
