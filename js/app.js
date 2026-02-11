/**
 * 로또번호 추첨기 - 메인 애플리케이션
 * 1-45 범위의 숫자 중 6개를 무작위로 추첨합니다.
 */

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
