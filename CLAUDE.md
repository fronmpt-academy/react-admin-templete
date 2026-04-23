# CLAUDE.md

이 프로젝트는 Minimal UI 템플릿(Vite + React + MUI) 위에 Firebase 기반 **거래처 & 거래 관리 시스템**을 구축하는 작업이다. 단일 원천(Source of Truth)은 `docs/prd-v2.md`이며, 이 문서와 충돌 시 PRD 를 우선한다.

## 프로젝트 개요

- 관리자(Admin)가 자신의 거래처·거래 내역을 CRUD 하는 웹 관리자.
- 멀티테넌시: 각 관리자는 독립 데이터 공간. 다른 관리자의 데이터에 접근 불가.
- 현재 작업 브랜치: `withFirebase` — Firebase Auth + Firestore 통합 중.

## 기술 스택

- Vite 6 + React 19 + TypeScript (strict)
- MUI v7 (`@mui/material`, `@mui/lab`) + Emotion
- 아키텍처: **Feature-Sliced Design (FSD)**
- 인증: Firebase Authentication (이메일/비밀번호)
- 데이터베이스: Firebase Firestore
- 호스팅: Firebase Hosting
- 차트: ApexCharts (`react-apexcharts`)
- 라우팅: `react-router` v7 / `react-router-dom`
- 날짜: `dayjs`
- Excel: `xlsx` (SheetJS) — PRD 요구사항, 설치 필요 시 `pnpm add xlsx`

## 패키지 매니저

- **반드시 `pnpm` 사용**. `npm`/`yarn` 금지.
- 의존성 변경은 `pnpm add` / `pnpm remove`, 스크립트 실행은 `pnpm <script>`.

## 주요 명령어

| 목적 | 명령어 |
|------|--------|
| 개발 서버 (포트 3039) | `pnpm dev` |
| 프로덕션 빌드 (tsc + vite) | `pnpm build` |
| Lint 검사 | `pnpm lint` |
| Lint 자동 수정 | `pnpm lint:fix` |
| Prettier 검사 | `pnpm fm:check` |
| Prettier 자동 수정 | `pnpm fm:fix` |
| Lint + Format 전체 수정 | `pnpm fix:all` |
| TypeScript 감시 모드 | `pnpm tsc:watch` |

**작업 완료 선언 전 반드시 `pnpm lint && pnpm build` 가 성공해야 한다.** 통과 여부를 실제로 실행해 확인하기 전에는 "완료" 라고 말하지 말 것.

## FSD 아키텍처 — 엄격히 준수

레이어 의존 방향 (단방향). `eslint-plugin-boundaries` 로 강제되며 위반 시 빌드 실패:

```
app → pages → widgets → features → entities → shared
```

- 상위 레이어는 하위 레이어만 import 가능 (역방향 금지).
- 같은 레이어 간 상호 import 금지 (boundaries 기본값 `disallow`).
- `shared` 는 아무 것도 import 하지 않는다.

### 경로 별칭 (tsconfig `paths` + Vite alias)

| 별칭 | 대상 |
|------|------|
| `@app/*` | `src/app/*` |
| `@pages/*` | `src/pages/*` |
| `@widgets/*` | `src/widgets/*` |
| `@features/*` | `src/features/*` |
| `@entities/*` | `src/entities/*` |
| `@shared/*` | `src/shared/*` |

상대 경로 대신 별칭을 사용하고, import 순서는 `eslint-plugin-perfectionist` 규칙(레이어 그룹 순서)에 맞춘다.

### 신규 슬라이스 배치 가이드

- **도메인 모델/타입/API 레포지토리** → `entities/<domain>` (예: `entities/client`, `entities/transaction`).
- **특정 사용자 행동** (로그인, 거래처 등록 모달, Excel 내보내기 등) → `features/<action>`.
- **페이지 단위 조합 UI** (대시보드 차트 블록, 거래 목록 테이블 컨테이너) → `widgets/<block>`.
- **라우트 엔트리** → `pages/<route>`.
- **범용 UI/유틸/설정** → `shared/*`. Firebase 초기화 클라이언트는 `shared/api/firebase` 에 둔다.

## 개발 준수사항 (PRD 발췌)

- **코드 중복 금지**: 동일 기능의 컴포넌트/훅/유틸을 새로 만들기 전에 기존 자산 재사용 가능 여부를 먼저 검토.
- **API 로직 모듈화**: Firestore 요청은 `entities/*/api` (또는 `shared/api`) 에 집약하고, 호출 시 `request.auth.uid` 기반 접근 권한이 보장되는 경로만 사용.
- **라우트 권한 분리**: public (`/sign-in`, `/sign-up`, `/forgot-password`) / private (`/dashboard`, `/clients`, `/transactions`) 가드 필수. 미로그인 → `/sign-in`, 로그인 상태의 public 접근 → `/dashboard` 로 리디렉션.
- **반응형**: 모바일 <600px 단일 컬럼, 태블릿 600–900px 2컬럼, 데스크톱 >900px 풀 테이블. MUI breakpoint 사용.
- **피드백 UX**: 로딩은 skeleton/spinner, 에러/성공은 Snackbar 토스트, 빈 상태는 안내 메시지 + 등록 유도.

## Firestore 데이터 모델

모든 도메인 데이터는 `users/{uid}/` 하위 서브컬렉션에 저장 — 멀티테넌시의 기반.

- `users/{uid}` — 사용자 프로필
- `users/{uid}/clients/{clientId}` — 거래처
- `users/{uid}/transactions/{transactionId}` — 거래 (거래처명은 `clientName` 으로 비정규화 저장)

보안 규칙은 `request.auth.uid == uid` 매칭으로만 읽기/쓰기 허용. 자세한 스키마·필수 필드는 `docs/prd-v2.md` 참조.

## 코딩 스타일

- TypeScript `strict: true`. `any` 는 허용되지만 (`@typescript-eslint/no-explicit-any: 0`) 도메인 타입은 `entities/*/model` 에 명시적으로 정의.
- `@typescript-eslint/consistent-type-imports` — 타입 전용 import 는 `import type` 사용.
- `@typescript-eslint/no-shadow` — 변수 섀도잉 금지.
- React: `react/self-closing-comp`, `react/jsx-boolean-value` 준수. `react-in-jsx-scope` 는 불필요.
- `consistent-return`, `default-case` (`no default` 주석으로만 스킵), `arrow-body-style: as-needed`.
- 주석은 기본적으로 쓰지 않는다. 비자명한 WHY 만 한 줄로 남긴다.

## 커밋 규율

- 커밋은 하나의 관심사로 좁힌다. 보안/하드닝 작업은 XSS/auth/CSP 등 개별 커밋.
- 같은 세션에서 추가했다가 제거한 변경은 초기 결정이 잘못됐다는 신호 — 올바른 결정을 memory 에 남긴다.
- 커밋 메시지에 `Co-Authored-By: Claude ...` 트레일러를 **절대** 추가하지 말 것.
- 파괴적 git 작업(`reset --hard`, `push --force`, 브랜치 삭제 등)은 사용자 명시 요청 없이 실행 금지.

## 참고 문서

- `docs/prd-v2.md` — 현행 PRD (v2). 기능 명세의 최종 기준.
- `docs/prd.md` — 구버전 참고용.
- `README.md` — 원본 Minimal UI 템플릿 안내 (유지, 수정 금지).