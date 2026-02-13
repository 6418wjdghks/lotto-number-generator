# Phase 4: 백엔드 및 데이터베이스 확장 계획

> **섹션 인덱스** — `Read(offset, limit)` 참고
> 문서정보 L7 | 확장목표 L15 | 아키텍처설계 L38 | DB스키마 L67 | API엔드포인트 L190
> 구현로드맵 L478 | 개발우선순위 L549 | 보안 L568 | 비용 L589 | 참고자료 L600

## 📋 문서 정보

- **버전**: 1.0.0
- **작성일**: 2026-02-11
- **상태**: 계획 (Phase 3 완료 후 진행)

---

## 🎯 확장 목표

### 현재 상태 (Phase 3)
- ✅ LocalStorage 기반 클라이언트 전용
- ✅ 단일 사용자, 단일 브라우저
- ✅ 추첨 이력 관리 (최대 20개)
- ✅ 여러 세트 동시 추첨

### Phase 4 목표
- 🎯 사용자 인증 시스템 (로그인/회원가입)
- 🎯 사용자별 추첨 이력 관리
- 🎯 당첨 이력 추적 (실제 로또 결과와 비교)
- 🎯 통계 분석 (당첨 확률, 번호 분포 등)
- 🎯 다중 기기 동기화

### Phase 5 목표 (선택)
- 로또 당첨 번호 자동 크롤링
- 당첨 확인 자동화
- 번호 추천 AI
- 사용자 커뮤니티

---

## 🏗️ 아키텍처 설계

> 채택: Option 3 (Supabase). 미채택 옵션(풀스택/Firebase) 분석은 ADR-016 참조.

### 채택된 아키텍처: Supabase

```
┌──────────────────────────────────────────────────────┐
│                   Frontend (Client)                   │
│  ┌────────────────────────────────────────────────┐  │
│  │  HTML/CSS/JavaScript + Supabase Client        │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────┬───────────────────────────────────┘
                   │ Supabase Client
                   │
┌──────────────────▼───────────────────────────────────┐
│                  Supabase Services                    │
│  ┌────────────────────────────────────────────────┐  │
│  │  - Auth (인증)                                 │  │
│  │  - PostgreSQL Database                         │  │
│  │  - REST API (자동 생성)                        │  │
│  │  - Realtime (실시간 구독)                      │  │
│  │  - Storage (파일 저장)                         │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

---

## 📊 데이터베이스 스키마

### users (사용자)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PRIMARY KEY | 사용자 고유 ID |
| username | VARCHAR(50) | UNIQUE, NOT NULL | 사용자명 |
| email | VARCHAR(100) | UNIQUE, NOT NULL | 이메일 |
| password_hash | VARCHAR(255) | NOT NULL | 비밀번호 해시 |
| created_at | TIMESTAMP | DEFAULT NOW() | 가입일 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 수정일 |

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

### lottery_history (추첨 이력)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PRIMARY KEY | 이력 고유 ID |
| user_id | UUID | FOREIGN KEY | 사용자 ID |
| numbers | INTEGER[] | NOT NULL | 추첨 번호 배열 [3,12,19,27,38,42] |
| set_count | INTEGER | DEFAULT 1 | 동시 추첨 세트 수 |
| created_at | TIMESTAMP | DEFAULT NOW() | 추첨 일시 |

```sql
CREATE TABLE lottery_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  numbers INTEGER[6] NOT NULL,
  set_count INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT check_numbers_range CHECK (
    array_length(numbers, 1) = 6 AND
    numbers[1] BETWEEN 1 AND 45 AND
    numbers[2] BETWEEN 1 AND 45 AND
    numbers[3] BETWEEN 1 AND 45 AND
    numbers[4] BETWEEN 1 AND 45 AND
    numbers[5] BETWEEN 1 AND 45 AND
    numbers[6] BETWEEN 1 AND 45
  )
);

CREATE INDEX idx_lottery_history_user_id ON lottery_history(user_id);
CREATE INDEX idx_lottery_history_created_at ON lottery_history(created_at DESC);
```

---

### lottery_results (로또 당첨 번호)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PRIMARY KEY | 결과 고유 ID |
| round_number | INTEGER | UNIQUE, NOT NULL | 회차 (예: 1145) |
| draw_date | DATE | NOT NULL | 추첨일 |
| numbers | INTEGER[] | NOT NULL | 당첨 번호 배열 |
| bonus_number | INTEGER | NOT NULL | 보너스 번호 |
| created_at | TIMESTAMP | DEFAULT NOW() | 등록일 |

```sql
CREATE TABLE lottery_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_number INTEGER UNIQUE NOT NULL,
  draw_date DATE NOT NULL,
  numbers INTEGER[6] NOT NULL,
  bonus_number INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT check_bonus_range CHECK (bonus_number BETWEEN 1 AND 45)
);

CREATE INDEX idx_lottery_results_round ON lottery_results(round_number DESC);
CREATE INDEX idx_lottery_results_draw_date ON lottery_results(draw_date DESC);
```

---

### winning_history (당첨 이력)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PRIMARY KEY | 당첨 이력 고유 ID |
| user_id | UUID | FOREIGN KEY | 사용자 ID |
| lottery_history_id | UUID | FOREIGN KEY | 추첨 이력 ID |
| lottery_result_id | UUID | FOREIGN KEY | 로또 결과 ID |
| matched_count | INTEGER | NOT NULL | 맞춘 개수 (0~6) |
| has_bonus | BOOLEAN | DEFAULT FALSE | 보너스 번호 일치 여부 |
| prize_rank | VARCHAR(20) | | 등수 ('1등', '2등', ..., '낙첨') |
| created_at | TIMESTAMP | DEFAULT NOW() | 확인일 |

```sql
CREATE TABLE winning_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  lottery_history_id UUID REFERENCES lottery_history(id) ON DELETE CASCADE,
  lottery_result_id UUID REFERENCES lottery_results(id),
  matched_count INTEGER NOT NULL,
  has_bonus BOOLEAN DEFAULT FALSE,
  prize_rank VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT check_matched_count CHECK (matched_count BETWEEN 0 AND 6)
);

CREATE INDEX idx_winning_history_user_id ON winning_history(user_id);
CREATE INDEX idx_winning_history_prize_rank ON winning_history(prize_rank);
```

---

## 🔐 API 엔드포인트 설계

### 인증 (Authentication)

#### POST /api/auth/signup
회원가입

**Request**:
```json
{
  "username": "user123",
  "email": "user@example.com",
  "password": "securePassword123!"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-here",
      "username": "user123",
      "email": "user@example.com"
    },
    "token": "jwt-token-here"
  }
}
```

---

#### POST /api/auth/login
로그인

**Request**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123!"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-here",
      "username": "user123",
      "email": "user@example.com"
    },
    "token": "jwt-token-here"
  }
}
```

---

#### GET /api/auth/me
현재 사용자 정보 조회 (인증 필요)

**Headers**:
```
Authorization: Bearer {jwt-token}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "username": "user123",
    "email": "user@example.com",
    "created_at": "2026-02-11T10:30:00Z"
  }
}
```

---

### 추첨 이력 (Lottery History)

#### GET /api/history
사용자의 추첨 이력 조회 (인증 필요)

**Headers**:
```
Authorization: Bearer {jwt-token}
```

**Query Parameters**:
- `limit` (optional): 조회 개수 (기본값: 20)
- `offset` (optional): 오프셋 (기본값: 0)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "total": 150,
    "items": [
      {
        "id": "uuid-1",
        "numbers": [3, 12, 19, 27, 38, 42],
        "set_count": 1,
        "created_at": "2026-02-11T10:30:00Z"
      },
      {
        "id": "uuid-2",
        "numbers": [5, 15, 20, 30, 40, 45],
        "set_count": 3,
        "created_at": "2026-02-11T09:15:00Z"
      }
    ]
  }
}
```

---

#### POST /api/history
추첨 이력 저장 (인증 필요)

**Headers**:
```
Authorization: Bearer {jwt-token}
```

**Request**:
```json
{
  "numbers": [3, 12, 19, 27, 38, 42],
  "set_count": 1
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "numbers": [3, 12, 19, 27, 38, 42],
    "set_count": 1,
    "created_at": "2026-02-11T10:30:00Z"
  }
}
```

---

#### DELETE /api/history/:id
특정 이력 삭제 (인증 필요)

**Response** (200 OK):
```json
{
  "success": true,
  "message": "이력이 삭제되었습니다."
}
```

---

#### DELETE /api/history
전체 이력 삭제 (인증 필요)

**Response** (200 OK):
```json
{
  "success": true,
  "message": "모든 이력이 삭제되었습니다.",
  "deleted_count": 150
}
```

---

### 로또 결과 (Lottery Results)

#### GET /api/results
로또 당첨 번호 조회

**Query Parameters**:
- `round` (optional): 회차 번호
- `limit` (optional): 조회 개수 (기본값: 10)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid-1",
        "round_number": 1145,
        "draw_date": "2026-02-08",
        "numbers": [7, 15, 23, 31, 39, 44],
        "bonus_number": 12
      }
    ]
  }
}
```

---

#### GET /api/results/latest
최신 로또 당첨 번호 조회

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "round_number": 1145,
    "draw_date": "2026-02-08",
    "numbers": [7, 15, 23, 31, 39, 44],
    "bonus_number": 12
  }
}
```

---

### 당첨 확인 (Winning Check)

#### POST /api/check-winning
추첨 이력과 로또 결과 비교 (인증 필요)

**Headers**:
```
Authorization: Bearer {jwt-token}
```

**Request**:
```json
{
  "lottery_history_id": "uuid-here",
  "lottery_result_id": "uuid-here"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "matched_count": 3,
    "has_bonus": false,
    "prize_rank": "4등",
    "matched_numbers": [15, 23, 31]
  }
}
```

---

#### GET /api/winning-history
사용자의 당첨 이력 조회 (인증 필요)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "total_checks": 150,
    "total_wins": 12,
    "items": [
      {
        "id": "uuid-1",
        "round_number": 1145,
        "numbers": [7, 15, 23, 31, 39, 44],
        "matched_count": 3,
        "prize_rank": "4등",
        "created_at": "2026-02-11T10:30:00Z"
      }
    ]
  }
}
```

---

## 🚀 구현 로드맵

### Phase 4.1: 기술 스택 선택 및 환경 설정 (1-2시간)
- [ ] 기술 스택 최종 결정 (Option 1/2/3)
- [ ] 개발 환경 설정
  - Backend 프로젝트 초기화
  - Database 선택 및 설정
  - 배포 플랫폼 선택
- [ ] Git 브랜치 전략 수립
  - `feature/backend` 브랜치 생성

---

### Phase 4.2: 사용자 인증 시스템 (3-4시간)
- [ ] 회원가입 API 구현
- [ ] 로그인 API 구현
- [ ] JWT 토큰 발급 및 검증
- [ ] 비밀번호 해싱 (bcrypt)
- [ ] 인증 미들웨어 구현
- [ ] 프론트엔드 연동
  - 로그인/회원가입 UI
  - 토큰 저장 (LocalStorage 또는 Cookie)

---

### Phase 4.3: 추첨 이력 API (2-3시간)
- [ ] 이력 저장 API 구현
- [ ] 이력 조회 API 구현
- [ ] 이력 삭제 API 구현
- [ ] 페이지네이션 구현
- [ ] 프론트엔드 연동
  - LocalStorage → API 호출로 전환
  - 로딩 상태 처리
  - 에러 처리

---

### Phase 4.4: 로또 결과 및 당첨 확인 (4-5시간)
- [ ] 로또 당첨 번호 크롤링
  - 동행복권 API 또는 웹 크롤링
  - 자동 업데이트 스케줄러
- [ ] 당첨 확인 로직 구현
  - 번호 비교 알고리즘
  - 등수 계산 (1~5등, 낙첨)
- [ ] 당첨 이력 저장 API
- [ ] 통계 API
  - 총 당첨 횟수
  - 등수별 분포
  - 번호별 출현 빈도

---

### Phase 4.5: 배포 및 테스트 (2-3시간)
- [ ] Backend 배포 (Railway/Render)
- [ ] Database 배포 (Railway/Supabase)
- [ ] Frontend 환경변수 설정
- [ ] E2E 테스트
- [ ] 성능 테스트
- [ ] 보안 점검

---

### Phase 4.6: LocalStorage 마이그레이션 (1-2시간)
- [ ] 기존 LocalStorage 데이터 읽기
- [ ] 서버로 업로드 도구 개발
- [ ] 사용자 안내 UI
  - "기존 데이터를 동기화하시겠습니까?"
  - 마이그레이션 진행 상태 표시

---

## 📝 개발 우선순위

### 필수 (P0)
1. 사용자 인증 (회원가입/로그인)
2. 추첨 이력 API (저장/조회/삭제)
3. 프론트엔드 API 연동

### 중요 (P1)
4. 로또 결과 크롤링
5. 당첨 확인 기능
6. 당첨 이력 저장

### 선택 (P2)
7. 통계 분석
8. 번호 추천 AI
9. 사용자 커뮤니티

---

## 🔒 보안 고려사항

### 인증 보안
- 비밀번호: bcrypt 해싱 (최소 10 rounds)
- JWT: 짧은 만료 시간 (15분) + Refresh Token
- HTTPS 강제
- CORS 설정

### API 보안
- Rate Limiting (요청 제한)
- Input Validation (입력 검증)
- SQL Injection 방지 (Parameterized Query)
- XSS 방지 (이미 구현됨 - textContent 사용)

### 데이터 보안
- 개인정보 암호화
- 데이터베이스 백업
- 로그 관리

---

## 💰 비용 예측 (Supabase)

| 항목 | 무료 티어 | 유료 시 |
|------|-----------|---------|
| Auth | 무제한 | $0 |
| Database | 500MB | $25/월 (Pro) |
| API | 무제한 | $0 |
| **총계** | **무료** | **$25/월** |

---

## 📚 참고 자료

### 기술 문서
- [Express.js 공식 문서](https://expressjs.com/)
- [PostgreSQL 공식 문서](https://www.postgresql.org/docs/)
- [JWT 소개](https://jwt.io/introduction)
- [Firebase 공식 문서](https://firebase.google.com/docs)
- [Supabase 공식 문서](https://supabase.com/docs)

### 로또 데이터
- [동행복권 공식 사이트](https://www.dhlottery.co.kr)
- [로또 당첨 번호 API](https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=1145)

---

**다음**: Supabase 대시보드에서 프로젝트 생성 후 URL/KEY 교체
