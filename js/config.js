/**
 * 설정 로더 (L3 Foundation — Data)
 * config/*.json을 로드하여 전역 상수로 노출
 * initApp()에서 loadConfig() 호출 후 사용 가능
 */

// 앱 상수 (config/constants.json)
let STORAGE_KEY;
let EXCLUDED_KEY;
let THEME_KEY;
let MAX_HISTORY;

// Supabase 설정 (config/supabase.json)
let SUPABASE_URL;
let SUPABASE_ANON_KEY;
let SESSION_KEY;

/**
 * JSON 설정 파일을 로드하여 전역 변수에 할당
 * @returns {Promise<void>}
 */
async function loadConfig() {
  const [constants, supabase] = await Promise.all([
    fetch('/config/constants.json').then(r => r.json()),
    fetch('/config/supabase.json').then(r => r.json())
  ]);

  STORAGE_KEY = constants.STORAGE_KEY;
  EXCLUDED_KEY = constants.EXCLUDED_KEY;
  THEME_KEY = constants.THEME_KEY;
  MAX_HISTORY = constants.MAX_HISTORY;

  SUPABASE_URL = supabase.url;
  SUPABASE_ANON_KEY = supabase.anonKey;
  SESSION_KEY = supabase.sessionKey;
}
