/**
 * 로또번호 추첨기 - 순수 로직 자동 테스트
 * 실행: node --test test/test-logic.js
 * Node.js 18+ 내장 node:test 사용 (외부 의존성 없음)
 */

const { describe, it, before, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

// localStorage 모킹 (Node.js에는 없음)
global.localStorage = {
  _store: {},
  getItem(key) { return this._store[key] ?? null; },
  setItem(key, value) { this._store[key] = String(value); },
  removeItem(key) { delete this._store[key]; },
  clear() { this._store = {}; },
};

// document 최소 모킹 (saveToHistory 내부에서 참조)
global.document = {
  getElementById() {
    return { classList: { contains() { return true; } } };
  },
  querySelector() { return null; },
};

const {
  STORAGE_KEY,
  MAX_HISTORY,
  generateSingleSet,
  generateMultipleSets,
  generateUUID,
  loadHistory,
  saveToHistory,
} = require('../js/app.js');

// ============================================================
// A. generateSingleSet()
// ============================================================

describe('generateSingleSet()', () => {
  it('6개의 숫자를 생성한다', () => {
    const numbers = generateSingleSet();
    assert.equal(numbers.length, 6);
  });

  it('모든 숫자가 1~45 범위이다', () => {
    for (let i = 0; i < 100; i++) {
      const numbers = generateSingleSet();
      assert.ok(numbers.every(n => n >= 1 && n <= 45));
    }
  });

  it('중복된 숫자가 없다', () => {
    for (let i = 0; i < 100; i++) {
      const numbers = generateSingleSet();
      assert.equal(new Set(numbers).size, 6);
    }
  });

  it('오름차순으로 정렬된다', () => {
    for (let i = 0; i < 100; i++) {
      const numbers = generateSingleSet();
      const sorted = [...numbers].sort((a, b) => a - b);
      assert.deepEqual(numbers, sorted);
    }
  });

  it('랜덤성이 충분하다 (100회 중 90%+ 고유 조합)', () => {
    const results = new Set();
    for (let i = 0; i < 100; i++) {
      results.add(generateSingleSet().join(','));
    }
    assert.ok(results.size >= 90, `고유 조합 ${results.size}/100`);
  });

  it('분포가 균등하다 (1000회 표준편차 검증)', () => {
    const iterations = 1000;
    const frequency = new Array(46).fill(0);
    for (let i = 0; i < iterations; i++) {
      generateSingleSet().forEach(n => frequency[n]++);
    }
    const counts = frequency.slice(1);
    const total = counts.reduce((a, b) => a + b, 0);
    const average = total / 45;
    const variance = counts.reduce((sum, c) => sum + Math.pow(c - average, 2), 0) / 45;
    const stdDev = Math.sqrt(variance);
    const threshold = average * 0.3;
    assert.ok(stdDev <= threshold, `분포 불균등 (stdDev ${stdDev.toFixed(2)} > ${threshold.toFixed(2)})`);
  });

  it('제외된 번호가 결과에 포함되지 않는다', () => {
    const excluded = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    for (let i = 0; i < 100; i++) {
      const numbers = generateSingleSet(excluded);
      assert.ok(numbers.every(n => !excluded.includes(n)));
    }
  });

  it('빈 제외 배열은 기존 동작과 동일하다', () => {
    const numbers = generateSingleSet([]);
    assert.equal(numbers.length, 6);
    assert.ok(numbers.every(n => n >= 1 && n <= 45));
  });

  it('제외 후에도 6개 생성, 정렬, 중복 없음', () => {
    const numbers = generateSingleSet([10, 20, 30, 40]);
    assert.equal(numbers.length, 6);
    assert.equal(new Set(numbers).size, 6);
    assert.deepEqual(numbers, [...numbers].sort((a, b) => a - b));
  });
});

// ============================================================
// B. generateMultipleSets()
// ============================================================

describe('generateMultipleSets()', () => {
  it('요청한 세트 수만큼 생성한다', () => {
    assert.equal(generateMultipleSets(1).length, 1);
    assert.equal(generateMultipleSets(3).length, 3);
    assert.equal(generateMultipleSets(5).length, 5);
  });

  it('모든 세트가 유효하다 (6개, 범위, 정렬, 중복 없음)', () => {
    const sets = generateMultipleSets(5);
    for (const set of sets) {
      assert.equal(set.length, 6);
      assert.ok(set.every(n => n >= 1 && n <= 45));
      assert.equal(new Set(set).size, 6);
      assert.deepEqual(set, [...set].sort((a, b) => a - b));
    }
  });

  it('제외 번호가 모든 세트에 적용된다', () => {
    const excluded = [1, 2, 3, 4, 5];
    const sets = generateMultipleSets(3, excluded);
    for (const set of sets) {
      assert.ok(set.every(n => !excluded.includes(n)));
    }
  });
});

// ============================================================
// C. generateUUID()
// ============================================================

describe('generateUUID()', () => {
  it('UUID v4 형식이다', () => {
    const uuid = generateUUID();
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
    assert.ok(regex.test(uuid), `UUID 형식 불일치: ${uuid}`);
  });

  it('100개 생성 시 모두 고유하다', () => {
    const uuids = new Set();
    for (let i = 0; i < 100; i++) {
      uuids.add(generateUUID());
    }
    assert.equal(uuids.size, 100);
  });
});

// ============================================================
// D. loadHistory() + saveToHistory()
// ============================================================

describe('loadHistory()', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('빈 저장소에서 빈 배열을 반환한다', () => {
    assert.deepEqual(loadHistory(), []);
  });

  it('정상 데이터를 로드한다', () => {
    const data = {
      version: '1.0',
      history: [
        { id: 'test-1', numbers: [1, 2, 3, 4, 5, 6], timestamp: '2026-02-11T10:00:00Z', setCount: 1 }
      ]
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    const history = loadHistory();
    assert.equal(history.length, 1);
    assert.deepEqual(history[0].numbers, [1, 2, 3, 4, 5, 6]);
  });

  it('잘못된 JSON에서 빈 배열을 반환한다', () => {
    const origError = console.error;
    console.error = () => {};
    localStorage.setItem(STORAGE_KEY, 'not valid json {{{');
    assert.deepEqual(loadHistory(), []);
    console.error = origError;
  });

  it('미지원 버전에서 빈 배열을 반환한다', () => {
    const origWarn = console.warn;
    console.warn = () => {};
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: '999.0', history: [{}] }));
    assert.deepEqual(loadHistory(), []);
    console.warn = origWarn;
  });
});

describe('saveToHistory()', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('이력을 저장하고 로드할 수 있다', () => {
    saveToHistory([3, 12, 19, 27, 38, 42]);
    const history = loadHistory();
    assert.equal(history.length, 1);
    assert.deepEqual(history[0].numbers, [3, 12, 19, 27, 38, 42]);
  });

  it('id, timestamp, setCount가 자동 생성된다', () => {
    saveToHistory([1, 2, 3, 4, 5, 6], 3);
    const item = loadHistory()[0];
    assert.ok(item.id && item.id.length > 0);
    assert.ok(!isNaN(new Date(item.timestamp).getTime()));
    assert.equal(item.setCount, 3);
  });

  it('setCount 기본값은 1이다', () => {
    saveToHistory([1, 2, 3, 4, 5, 6]);
    assert.equal(loadHistory()[0].setCount, 1);
  });

  it('최신 항목이 맨 앞에 온다', () => {
    saveToHistory([1, 2, 3, 4, 5, 6]);
    saveToHistory([7, 8, 9, 10, 11, 12]);
    const history = loadHistory();
    assert.deepEqual(history[0].numbers, [7, 8, 9, 10, 11, 12]);
    assert.deepEqual(history[1].numbers, [1, 2, 3, 4, 5, 6]);
  });

  it('최대 20개를 초과하지 않는다', () => {
    for (let i = 0; i < 25; i++) {
      saveToHistory(generateSingleSet());
    }
    assert.equal(loadHistory().length, MAX_HISTORY);
  });
});
