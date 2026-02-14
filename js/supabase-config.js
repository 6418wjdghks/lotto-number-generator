/**
 * Supabase REST API 래퍼 (L3 Foundation)
 * 순수 fetch() + REST API만 사용 (SDK 미사용)
 * 전역 객체 window.supabase로 노출
 * 설정값은 config/supabase.json → config.js에서 전역 제공
 *   (SUPABASE_URL, SUPABASE_ANON_KEY, SESSION_KEY)
 */

(function() {
  'use strict';

  // ============================================================
  // 세션 관리
  // ============================================================

  /**
   * 저장된 세션(토큰) 반환
   * @returns {object|null} 세션 객체 또는 null
   */
  function getSession() {
    try {
      const data = localStorage.getItem(SESSION_KEY);
      if (!data) return null;
      return JSON.parse(data);
    } catch (error) {
      console.error('세션 로드 실패:', error);
      return null;
    }
  }

  /**
   * 세션 LocalStorage 저장
   * @param {object} data - 세션 데이터 (access_token, user 등)
   */
  function saveSession(data) {
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('세션 저장 실패:', error);
    }
  }

  /**
   * 세션 삭제
   */
  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
  }

  /**
   * 로그인 여부 확인
   * @returns {boolean}
   */
  function isLoggedIn() {
    return getSession() !== null;
  }

  // ============================================================
  // Auth API
  // ============================================================

  /**
   * 회원가입
   * @param {string} email
   * @param {string} password
   * @returns {Promise<object>} 결과 객체 { success, data?, error? }
   */
  async function signUp(email, password) {
    try {
      const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error_description || data.msg || '회원가입에 실패했습니다.' };
      }

      // 세션 저장 (이메일 확인이 필요 없는 경우)
      if (data.access_token) {
        saveSession(data);
      }

      return { success: true, data };
    } catch (error) {
      console.error('회원가입 오류:', error);
      return { success: false, error: '네트워크 오류가 발생했습니다.' };
    }
  }

  /**
   * 로그인
   * @param {string} email
   * @param {string} password
   * @returns {Promise<object>} 결과 객체 { success, data?, error? }
   */
  async function signIn(email, password) {
    try {
      const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error_description || data.msg || '로그인에 실패했습니다.' };
      }

      saveSession(data);
      return { success: true, data };
    } catch (error) {
      console.error('로그인 오류:', error);
      return { success: false, error: '네트워크 오류가 발생했습니다.' };
    }
  }

  /**
   * 로그아웃
   * @returns {Promise<object>} 결과 객체 { success, error? }
   */
  async function signOut() {
    const session = getSession();
    if (session && session.access_token) {
      try {
        await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (error) {
        console.error('로그아웃 API 오류:', error);
      }
    }
    clearSession();
    return { success: true };
  }

  /**
   * 현재 사용자 정보 조회
   * @returns {Promise<object|null>} 사용자 객체 또는 null
   */
  async function getUser() {
    const session = getSession();
    if (!session || !session.access_token) return null;

    try {
      const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) return null;
      return response.json();
    } catch (error) {
      console.error('사용자 조회 오류:', error);
      return null;
    }
  }

  // ============================================================
  // History API
  // ============================================================

  /**
   * 이력 조회
   * @param {number} limit - 최대 조회 수 (기본값: 50)
   * @returns {Promise<Array>} 이력 배열
   */
  async function fetchHistory(limit = 50) {
    const session = getSession();
    if (!session) return [];

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/lottery_history?user_id=eq.${session.user.id}&order=created_at.desc&limit=${limit}`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) throw new Error('이력 조회 실패');
    return response.json();
  }

  /**
   * 이력 저장
   * @param {number[]} numbers - 추첨된 숫자 배열
   * @param {number} setCount - 세트 수
   * @returns {Promise<object>} 저장된 항목
   */
  async function insertHistory(numbers, setCount = 1) {
    const session = getSession();
    if (!session) throw new Error('로그인이 필요합니다.');

    const response = await fetch(`${SUPABASE_URL}/rest/v1/lottery_history`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        user_id: session.user.id,
        numbers: numbers,
        set_count: setCount
      })
    });

    if (!response.ok) throw new Error('이력 저장 실패');
    const data = await response.json();
    return data[0];
  }

  /**
   * 전체 이력 삭제
   * @returns {Promise<void>}
   */
  async function deleteAllHistory() {
    const session = getSession();
    if (!session) throw new Error('로그인이 필요합니다.');

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/lottery_history?user_id=eq.${session.user.id}`,
      {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) throw new Error('이력 삭제 실패');
  }

  // ============================================================
  // 전역 노출
  // ============================================================

  window.supabase = {
    getSession,
    saveSession,
    clearSession,
    isLoggedIn,
    signUp,
    signIn,
    signOut,
    getUser,
    fetchHistory,
    insertHistory,
    deleteAllHistory
  };
})();
