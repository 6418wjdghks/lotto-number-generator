/**
 * 로또번호 추첨기 - 메인 애플리케이션
 * 1-45 범위의 숫자 중 6개를 무작위로 추첨합니다.
 * Phase 3: 추첨 이력 저장 및 관리, 여러 세트 동시 추첨
 */

// LocalStorage 키
const STORAGE_KEY = 'lotto_history';
const MAX_HISTORY = 20;

/**
 * 로또번호 생성 함수 (메인)
 * 선택된 세트 수만큼 로또번호를 생성합니다.
 */
function generateLottoNumbers() {
  const setCount = getSelectedSetCount();
  const sets = generateMultipleSets(setCount);
  displayMultipleSets(sets);

  // 각 세트를 이력에 저장
  sets.forEach(numbers => {
    saveToHistory(numbers, setCount);
  });
}

/**
 * 단일 로또번호 생성 (내부 함수)
 * Fisher-Yates 셔플 알고리즘을 사용하여 무작위 숫자를 생성합니다.
 * @returns {number[]} 6개의 정렬된 숫자 배열
 */
function generateSingleSet() {
  // 1부터 45까지의 숫자 배열 생성
  const numbers = Array.from({ length: 45 }, (_, i) => i + 1);

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
 * @returns {Array<number[]>} 세트 배열
 */
function generateMultipleSets(count) {
  const sets = [];
  for (let i = 0; i < count; i++) {
    sets.push(generateSingleSet());
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

    setCard.appendChild(setLabel);
    setCard.appendChild(numbersContainer);
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

/**
 * 추첨 결과를 이력에 저장
 * @param {number[]} numbers - 추첨된 숫자 배열
 * @param {number} setCount - 동시 추첨 세트 수 (기본값: 1)
 */
function saveToHistory(numbers, setCount = 1) {
  try {
    // 기존 이력 로드
    const history = loadHistory();

    // 새 항목 생성
    const newItem = {
      id: generateUUID(),
      numbers: numbers,
      timestamp: new Date().toISOString(),
      setCount: setCount
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
