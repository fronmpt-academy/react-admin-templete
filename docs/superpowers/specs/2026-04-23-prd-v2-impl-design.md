# PRD v2 구현 설계 (보조 스펙)

최종 기능 스펙은 `docs/prd-v2.md`. 이 문서는 PRD v2 구현 시 도구 선택과 구조상 결정을 정리한 보조 스펙이며 PRD 와 충돌 시 PRD 가 우선한다.

## 브레인스토밍 결정 요약

| 항목 | 결정 | 근거 |
|------|------|------|
| Q1. 기존 템플릿 예제 처리 | **유지 (옵션 B)** | 변경 폭 최소화 — 기존 blog/products/user-management 화면·엔티티는 남기고 신규 기능을 옆에 추가 |
| Q2. Firebase 프로젝트 | **미보유 (옵션 C)** | 구현은 `import.meta.env.VITE_FIREBASE_*` 참조 구조로 작성. `.env.example` + README 셋업 가이드 제공. 실제 런타임 검증은 사용자 설정 이후 |
| Q3. 폼·상태 관리 | **RHF + zod + TanStack Query (옵션 A)** | 폼 검증 일관성, Firestore 쿼리 캐시/invalidation, 대시보드 다중 쿼리 관리에 유리 |

## 구조 결정

### 디렉터리 배치 (FSD)

- `shared/api/firebase/` — `config.ts` (env 로드 + `initializeApp`), `auth.ts` (`getAuth` export), `firestore.ts` (`getFirestore` export)
- `shared/lib/query/` — TanStack Query `QueryClient` 싱글톤
- `shared/lib/notistack/` — SnackbarProvider 래퍼 + `useNotify()` 훅
- `shared/router/components/` — `AuthGuard`, `GuestGuard`
- `entities/client/`, `entities/transaction/` — model(타입/zod 스키마) + api(Firestore CRUD 레포) + ui(라벨/뱃지)
- `entities/auth/` — `useAuthUser` 훅 + `AuthContext` (onAuthStateChanged 구독)
- `features/auth/` — sign-in·sign-up·forgot-password 폼 (RHF + zod)
- `features/client/` — 거래처 등록 모달, 수정 모달, 삭제 확인, Excel export
- `features/transaction/` — 거래 등록 모달, 수정 모달, 삭제 확인, Excel export
- `widgets/client-table/`, `widgets/transaction-table/` — 목록·필터·페이지네이션 컨테이너
- `widgets/dashboard-*` — 요약 카드 4, 차트 2, 리스트 2 를 위한 블록 widget
- `pages/sign-in/` (기존), `pages/sign-up/`, `pages/forgot-password/`, `pages/clients/`, `pages/transactions/`, `pages/dashboard/` (교체)

### 데이터 흐름

1. `AuthProvider` (entities/auth) 가 `onAuthStateChanged` 로 `uid` 추적.
2. 모든 Firestore CRUD 는 `entities/<domain>/api/` 의 함수가 `uid` 를 인자로 받아 `users/{uid}/<collection>` 경로만 접근.
3. React Query `queryKey` 는 `['clients', uid, ...filters]` 형태로 격리 — 다른 관리자 로그인 시 캐시 자동 분리.
4. mutation 성공 시 해당 query invalidate + notistack success 토스트. 실패 시 error 토스트.

### 라우트 가드

- `AuthGuard` — `uid` 로드 대기 중엔 Splash, 비로그인 시 `/sign-in` 리디렉션.
- `GuestGuard` — 로그인 상태에서 `/sign-in`, `/sign-up`, `/forgot-password` 접근 시 `/dashboard` 리디렉션.
- 라우트 트리 갱신: 기존 `DashboardLayout` 아래 private 라우트를 `AuthGuard` 로 감싸고, `AuthLayout` 아래 public 라우트는 `GuestGuard` 로 감싼다.
- 기존 템플릿 라우트(`/products`, `/blog`, `/user`)는 유지하되 private 그룹에 포함.

### 페이지네이션

- **클라이언트 사이드**: Firestore 에서 전체 로드 → React Query 캐싱 → `useMemo` 필터 → MUI `TablePagination` (10/25/50).
- 1인 관리자 데이터량(~수천 건) 범위를 가정. 데이터가 10,000+ 건으로 성장하면 `startAfter` 커서 기반으로 전환. 전환 지점은 코드 주석 대신 본 문서에 기록.

### 타임존·날짜 처리

- `dayjs` + `utc`, `timezone` 플러그인 로딩. 기본 존 `Asia/Seoul`.
- Firestore `Timestamp` ↔ `dayjs` 변환은 `shared/lib/date/` 유틸에 집약.
- "이번 달" 집계는 로컬(KST) 기준 `startOf('month')`, `endOf('month')`.

### Excel 내보내기

- `xlsx` 패키지 추가.
- `features/<domain>/lib/exportToXlsx.ts` 에 공용 구현(한글 헤더, 파일명 `{화면명}_{YYYY-MM-DD}.xlsx`).
- 현재 필터 적용된 **전체** 데이터를 내보낸다 (페이지네이션 무시).

### 폼 검증 (zod)

- `entities/client/model/schema.ts`, `entities/transaction/model/schema.ts` 에 입력 폼용 zod 스키마 정의.
- 연락처: `/^[0-9-]*$/` 정규식, 공백 허용하지 않음.
- 거래금액: `z.number().positive()`.
- Firestore 저장 직전 `Timestamp` 변환, 조회 직후 `Date` 변환하는 어댑터를 api 레이어에 둔다.

### 피드백 UX

- 로딩: MUI `Skeleton` (목록), `CircularProgress` (모달 내부 상태).
- 빈 데이터: `widgets/<domain>-table` 내부에 안내 + "등록하기" 버튼.
- 성공/에러: notistack 토스트(공통 위치 `bottom-right`, duration 3000ms).

### Firebase 구성 아티팩트

- `.env.example` — `VITE_FIREBASE_API_KEY` 등 6 개 키 자리.
- `.gitignore` — `.env.local` 추가.
- `firebase.json` — Hosting 빌드 `dist/` + Firestore rules 경로.
- `firestore.rules` — PRD 명시 규칙 그대로.
- README 하단에 Firebase 프로젝트 셋업 섹션 추가.

## 의존성 추가 목록

| 패키지 | 용도 |
|--------|------|
| `firebase` | Auth + Firestore SDK |
| `@tanstack/react-query` | 서버 상태 관리 |
| `react-hook-form` | 폼 상태 |
| `zod` | 스키마 검증 |
| `@hookform/resolvers` | RHF ↔ zod 연결 |
| `@mui/x-date-pickers` | 날짜/시간 피커 |
| `notistack` | Snackbar provider |
| `xlsx` | Excel 내보내기 |

## 범위 및 비포함

- 슈퍼 관리자, 역할 계층: PRD 명시 — 이번 범위 아님.
- 파일 스토리지: 미사용.
- 실시간 리스너(onSnapshot): 초기엔 일회성 `getDocs` + React Query invalidation 로 충분. 필요 시 별도 티켓으로 추가.
- 기존 템플릿 예제 제거: 이번 범위 아님 (Q1=B).

## 구현 단계 개요

(상세는 writing-plans 단계에서 분해)

1. Firebase + 패키지 설치, env 템플릿, Firestore rules
2. shared 인프라: query client, notistack provider, firebase init, route guards
3. 인증: entities/auth, features/auth, pages(sign-in/up/forgot-password)
4. entities/client, features/client, pages/clients, widgets/client-table
5. entities/transaction, features/transaction, pages/transactions, widgets/transaction-table
6. 대시보드 교체: 요약 카드 + 차트 + 리스트
7. 라우터 통합 (가드 + 신규 라우트)
8. 반응형 확인, lint, build

각 단계는 별도 커밋.
