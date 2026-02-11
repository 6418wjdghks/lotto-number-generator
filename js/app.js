/**
 * 로또번호 추첨기 - 메인 애플리케이션
 * 1-45 범위의 숫자 중 6개를 무작위로 추첨합니다.
 * Phase 3: 추첨 이력 저장 및 관리
 */

// LocalStorage 키
const STORAGE_KEY = 'lotto_history';
const MAX_HISTORY = 20;

/**
 * 로또번호 생성 함수
 * Fisher-Yates 셔플 알고리즘을 사용하여 무작위 숫자를 생성합니다.
 */
function generateLottoNumbers() {
  // 1부터 45까지의 숫자 배열 생성
  const numbers = Array.from({ length: 45 }, (_, i) => i + 1);

  // Fisher-Yates 셔플 알고리즘으로 무작위 섞기
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }

  // 앞의 6개 숫자 선택 후 정렬
  const lottoNumbers = numbers.slice(0, 6).sort((a, b) => a - b);

  // 화면에 표시
  displayNumbers(lottoNumbers);

  // 이력에 저장
  saveToHistory(lottoNumbers);
}

/**
 * 숫자를 화면에 표시하는 함수
 * @param {number[]} numbers - 표시할 숫자 배열 (길이: 6)
 */
function displayNumbers(numbers) {
  const container = document.getElementById('numbersContainer');
  container.innerHTML = '';

  numbers.forEach((num, index) => {
    const numberDiv = document.createElement('div');
    numberDiv.className = 'number';
    numberDiv.textContent = num;
    numberDiv.style.animationDelay = `${index * 0.1}s`;
    container.appendChild(numberDiv);
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

/**
 * 추첨 결과를 이력에 저장
 * @param {number[]} numbers - 추첨된 숫자 배열
 */
function saveToHistory(numbers) {
  try {
    // 기존 이력 로드
    const history = loadHistory();

    // 새 항목 생성
    const newItem = {
      id: generateUUID(),
      numbers: numbers,
      timestamp: new Date().toISOString(),
      setCount: 1
    };

    // 배열 맨 앞에 추가 (최신순)
    history.unshift(newItem);

    // 20개 초과 시 오래된 항목 제거
    if (history.length > MAX_HISTORY) {
      history.splice(MAX_HISTORY);
    }

    // LocalStorage에 저장
    const data = {
      version: '1.0',
      history: history
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

    // 이력 표시 갱신 (열려있으면)
    const historyList = document.getElementById('historyList');
    if (!historyList.classList.contains('hidden')) {
      displayHistory();
    }
  } catch (error) {
    console.error('이력 저장 실패:', error);
  }
}

/**
 * 이력 로드
 * @returns {Array} 이력 배열
 */
function loadHistory() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return [];
    }

    const parsed = JSON.parse(data);

    // 버전 검증
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
 * 이력 표시
 */
function displayHistory() {
  const historyList = document.getElementById('historyList');
  const history = loadHistory();

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
    timeDiv.textContent = timeString;

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
 * 전체 이력 삭제
 */
function clearHistory() {
  const history = loadHistory();

  if (history.length === 0) {
    alert('삭제할 이력이 없습니다.');
    return;
  }

  if (confirm('모든 추첨 이력을 삭제하시겠습니까?')) {
    try {
      localStorage.removeItem(STORAGE_KEY);
      displayHistory();
      alert('이력이 삭제되었습니다.');
    } catch (error) {
      console.error('이력 삭제 실패:', error);
      alert('이력 삭제에 실패했습니다.');
    }
  }
}
