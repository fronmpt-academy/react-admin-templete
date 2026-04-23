# 거래처 & 거래 관리 시스템 PRD v2

## 서비스 개요
관리자가 자신의 거래처 및 거래 내역을 등록·조회·수정·삭제할 수 있는 웹 기반 관리 시스템.
각 관리자는 독립된 데이터 공간을 가지며(멀티테넌시), 다른 관리자의 데이터에 접근할 수 없다.

---

## 기술 스택
| 영역 | 기술 |
|------|------|
| 호스팅 | Firebase Hosting |
| 프론트엔드 | Vite + React + TypeScript |
| 아키텍처 | Feature-Sliced Design (FSD) |
| 데이터베이스 | Firebase Firestore |
| 스토리지 | 미사용 (향후 확장 예정) |
| 인증 | Firebase Authentication (이메일/비밀번호) |

---

## 준수 사항
- 같은 기능을 하는 코드 중복 생성 금지
- API 요청 관련 로직은 반드시 모듈화하고, 요청 권한 체크
- UI 컴포넌트는 FSD 원칙에 따라 반드시 재사용 (중복 생성 금지)
- 역할과 권한에 따라 접근 가능한 라우트 구분 (private / public)
- 모바일 사용을 위한 반응형 최적화

---

## 사용자 역할
| 역할 | 설명 |
|------|------|
| 관리자(Admin) | 이메일로 자체 가입. 자신이 등록한 거래처·거래 데이터만 접근 가능 |

> 슈퍼 관리자나 역할 계층은 이번 범위에 포함하지 않는다.

---

## 인증 플로우

### 회원가입
- 이메일 + 비밀번호로 신규 계정 생성
- Firebase Authentication `createUserWithEmailAndPassword` 사용
- 가입 성공 시 대시보드로 리디렉션

### 로그인
- 이메일 + 비밀번호로 로그인
- Firebase Authentication `signInWithEmailAndPassword` 사용
- 로그인 성공 시 대시보드로 리디렉션

### 비밀번호 재설정
- 이메일 입력 → Firebase `sendPasswordResetEmail` 호출
- 발송 완료 안내 메시지 표시

### 세션
- Firebase Auth의 자동 세션 유지 (onAuthStateChanged)
- 로그인 상태가 아닌 사용자가 private 라우트 접근 시 /sign-in으로 리디렉션
- 로그인 상태의 사용자가 public 라우트(/sign-in 등) 접근 시 /dashboard로 리디렉션

---

## 라우트 구조

### Public (비로그인 접근 가능)
| 경로 | 화면 |
|------|------|
| /sign-in | 로그인 |
| /sign-up | 회원가입 |
| /forgot-password | 비밀번호 재설정 |

### Private (로그인 필수)
| 경로 | 화면 |
|------|------|
| /dashboard | 대시보드 |
| /clients | 거래처 목록 |
| /transactions | 거래 목록 |

### 기타
| 경로 | 화면 |
|------|------|
| /404 | 404 Not Found |
| * | /404로 리디렉션 |

---

## 데이터 모델 (Firestore)

### 멀티테넌시 원칙
- 모든 데이터는 `users/{uid}/` 하위 서브컬렉션에 저장
- Firestore 보안 규칙: 자신의 UID와 일치하는 경로만 읽기/쓰기 허용

### users/{uid}
| 필드 | 타입 | 설명 |
|------|------|------|
| email | string | 이메일 |
| displayName | string | 표시 이름 |
| createdAt | Timestamp | 가입일시 |

### users/{uid}/clients/{clientId} — 거래처
| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| name | string | ✅ | 거래처명 |
| ceoName | string | | 대표명 |
| ceoContact | string | | 대표 연락처 |
| address | string | | 주소 |
| managerName | string | | 담당자명 |
| managerContact | string | | 담당자 연락처 |
| status | 'active' \| 'inactive' | ✅ | 상태 (기본값: active) |
| createdAt | Timestamp | ✅ | 등록일시 |
| updatedAt | Timestamp | ✅ | 수정일시 |

### users/{uid}/transactions/{transactionId} — 거래
| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| clientId | string | ✅ | 거래처 ID (참조) |
| clientName | string | ✅ | 거래처명 (비정규화, 조회 성능용) |
| date | Timestamp | ✅ | 거래일시 |
| items | string | ✅ | 거래항목 |
| amount | number | ✅ | 거래금액 (원화) |
| status | 'pending' \| 'completed' \| 'cancelled' | ✅ | 거래 상태 (진행중/완료/취소) |
| createdAt | Timestamp | ✅ | 등록일시 |
| updatedAt | Timestamp | ✅ | 수정일시 |

---

## 화면 명세

### 1. 대시보드 (/dashboard)

**요약 카드 (상단 4개)**
| 카드 | 내용 |
|------|------|
| 전체 거래처 수 | 총 거래처 수 + 이번 달 신규 수 |
| 전체 거래금액 | 완료 거래 기준 누적 금액 + 이번 달 합계 |
| 이번 달 거래 건수 | 당월 전체 거래 건수 |
| 진행중 거래 건수 | status = 'pending' 인 거래 수 |

**차트**
| 차트 | 설명 |
|------|------|
| 월별 거래금액 추이 | 최근 12개월 완료 거래금액 합계, 막대 차트 |
| 거래 상태 분포 | 전체 거래의 진행중/완료/취소 비율, 도넛 차트 |

**리스트**
| 리스트 | 설명 |
|--------|------|
| 최근 거래 내역 | 최근 5건: 거래처명, 거래항목, 금액, 상태, 거래일시 |
| 거래금액 기준 상위 거래처 | TOP 5: 거래처명, 완료 거래 총합 금액 |

---

### 2. 거래처 관리 (/clients)

**목록 화면**
- 검색: 거래처명 텍스트 검색
- 필터: 상태 (전체 / 활성 / 비활성)
- 테이블 컬럼: 거래처명, 대표명, 대표 연락처, 담당자명, 담당자 연락처, 상태, 액션(수정/삭제)
- 페이지네이션: 기본 10건/페이지
- Excel 내보내기: 현재 필터 적용된 전체 목록 다운로드 (.xlsx)

**등록/수정 폼** (모달 다이얼로그)
- 거래처명 (필수)
- 대표명, 대표 연락처, 주소, 담당자명, 담당자 연락처 (선택)
- 상태 (활성/비활성, 기본값: 활성)
- 유효성 검사: 연락처 형식 (숫자/하이픈)

**삭제**
- 확인 다이얼로그: "거래처를 삭제하면 관련 거래 내역은 유지됩니다. 삭제하시겠습니까?"
- 삭제 후 목록 갱신

---

### 3. 거래 관리 (/transactions)

**목록 화면**
- 검색: 거래처명 텍스트 검색
- 필터: 날짜 범위 (시작일~종료일), 거래 상태 (전체 / 진행중 / 완료 / 취소)
- 테이블 컬럼: 거래일시, 거래처명, 거래항목, 거래금액, 상태, 액션(수정/삭제)
- 페이지네이션: 기본 10건/페이지
- Excel 내보내기: 현재 필터 적용된 전체 목록 다운로드 (.xlsx)

**등록/수정 폼** (모달 다이얼로그)
- 거래처 선택 (드롭다운, 활성 거래처 목록)
- 거래일시 (날짜 + 시간 피커)
- 거래항목 (텍스트)
- 거래금액 (숫자 입력, 원화 표시)
- 거래 상태 (진행중 / 완료 / 취소)
- 유효성 검사: 거래처 필수, 금액 > 0

**삭제**
- 확인 다이얼로그 표시 후 삭제

---

## 공통 UX 요구사항

### 반응형
- 모바일 (< 600px): 단일 컬럼, 카드형 레이아웃
- 태블릿 (600px ~ 900px): 2컬럼
- 데스크톱 (> 900px): 풀 테이블 레이아웃

### 피드백 상태
| 상태 | 처리 |
|------|------|
| 로딩 | 스켈레톤 또는 스피너 |
| 빈 데이터 | 안내 메시지 + 등록 유도 버튼 |
| API 에러 | 토스트(Snackbar) 알림 |
| 성공 | 토스트(Snackbar) 알림 |

### Excel 내보내기
- 라이브러리: `xlsx` (SheetJS)
- 파일명 형식: `{화면명}_{YYYY-MM-DD}.xlsx`
- 한글 컬럼 헤더 사용

---

## Firestore 보안 규칙 요구사항

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

---

## 핵심 기능 요약
| 기능 | 설명 |
|------|------|
| 인증 | 이메일 회원가입 / 로그인 / 비밀번호 재설정 |
| 대시보드 | 요약 카드 4개 + 차트 2개 + 리스트 2개 |
| 거래처 관리 | CRUD + 검색 + 상태 필터 + Excel 내보내기 |
| 거래 관리 | CRUD + 검색 + 날짜·상태 필터 + Excel 내보내기 |
| 데이터 격리 | 관리자별 독립 데이터 (Firestore 서브컬렉션 + 보안 규칙) |
