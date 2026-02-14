/**
 * 로또번호 추첨기 - 추첨 핵심 로직 + 결과 표시 (L2 Feature)
 * 의존: L3 — copyToClipboard (utils.js)
 */

/**
 * 단일 로또번호 생성 (내부 함수)
 * Fisher-Yates 셔플 알고리즘을 사용하여 무작위 숫자를 생성합니다.
 * @param {number[]} excludedNumbers - 제외할 번호 배열 (기본값: [])
 * @returns {number[]} 6개의 정렬된 숫자 배열
 */
function generateSingleSet(excludedNumbers = []) {
  // 1부터 45까지의 숫자 중 제외 번호를 뺀 배열 생성
  const numbers = Array.from({ length: 45 }, (_, i) => i + 1)
    .filter(n => !excludedNumbers.includes(n));

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
 * @param {number[]} excludedNumbers - 제외할 번호 배열 (기본값: [])
 * @returns {Array<number[]>} 세트 배열
 */
function generateMultipleSets(count, excludedNumbers = []) {
  const sets = [];
  for (let i = 0; i < count; i++) {
    sets.push(generateSingleSet(excludedNumbers));
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

    // 복사 버튼 생성
    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn';
    copyBtn.textContent = '📋 복사';
    copyBtn.type = 'button';
    copyBtn.onclick = () => copyToClipboard(numbers, setIndex + 1);

    setCard.appendChild(setLabel);
    setCard.appendChild(numbersContainer);
    setCard.appendChild(copyBtn);
    container.appendChild(setCard);
  });
}

// Node.js 환경에서 테스트를 위한 모듈 내보내기
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    generateSingleSet,
    generateMultipleSets,
    getSelectedSetCount,
    displayMultipleSets,
  };
}
