# 셋업 & 배포 가이드

이 프로젝트(거래처·거래 관리자 웹앱)를 처음 받는 사람이 **로컬 실행 → 프로덕션 배포** 까지 한 번에 완료할 수 있도록 정리한 가이드. 모든 명령은 macOS / Linux 기준이며 Windows 는 PowerShell 로 동등하게 실행 가능.

---

## 0. 사전 준비물

| 항목 | 버전 | 확인 |
|------|------|------|
| Node.js | ≥ 20 | `node -v` |
| pnpm | ≥ 10 | `pnpm -v` (없으면 `npm i -g pnpm`) |
| Git | any | `git --version` |
| Google 계정 | — | Firebase 콘솔 로그인용 (회사 / 개인 무관) |

> 패키지 매니저는 **반드시 `pnpm`**. `npm` / `yarn` 으로 install 하면 lockfile 이 어긋나 빌드가 깨질 수 있다.

---

## 1. 저장소 클론 & 의존성 설치

```bash
git clone <이 저장소 URL>
cd react-admin-templete
pnpm install
```

---

## 2. Firebase 계정 & 프로젝트 만들기

### 2-1. Firebase 콘솔 로그인

1. https://console.firebase.google.com 접속.
2. 우상단 **로그인** → 사용할 Google 계정으로 로그인. (없다면 https://accounts.google.com/signup 에서 먼저 만들 것)
3. 처음이라면 Firebase 이용약관 동의 화면이 한 번 나옴 — 동의 후 계속.

### 2-2. 프로젝트 생성

1. **프로젝트 추가** 클릭.
2. **프로젝트 이름** 입력 (예: `my-partners-manage`). 이름은 콘솔 표시용이며, 실제 식별자인 **프로젝트 ID** 는 자동 생성된다 (필요 시 편집 가능).
3. Google Analytics 사용 여부는 선택. 이 프로젝트는 사용하지 않아도 무방.
4. 프로젝트가 생성될 때까지 잠시 대기.

### 2-3. 웹 앱 등록 & config 복사

1. 프로젝트 개요 화면에서 **웹 아이콘 `</>`** 클릭.
2. 앱 닉네임(예: `partners-web`) 입력. **Firebase Hosting 도 설정** 체크박스는 체크해둔다.
3. **앱 등록** 누르면 다음과 비슷한 코드가 나온다:

```js
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "my-partners-manage.firebaseapp.com",
  projectId: "my-partners-manage",
  storageBucket: "my-partners-manage.firebasestorage.app",
  messagingSenderId: "000000000000",
  appId: "1:0000:web:..."
};
```

이 6 개 값을 다음 단계에서 `.env.local` 에 채워넣을 거니 창을 닫지 말 것 (나중에 콘솔 → 톱니 → **프로젝트 설정** → **내 앱** 에서 다시 볼 수도 있음).

---

## 3. Authentication & Firestore 활성화

### 3-1. 이메일/비밀번호 인증 활성화

1. 좌측 메뉴 **빌드 → Authentication → 시작하기**.
2. **Sign-in method** 탭 → **이메일/비밀번호** 클릭 → **사용 설정** 토글 ON → 저장.

### 3-2. Firestore 데이터베이스 만들기

1. 좌측 메뉴 **빌드 → Firestore Database → 데이터베이스 만들기**.
2. **위치**: `asia-northeast3 (Seoul)` 권장. 한 번 정하면 변경 불가.
3. 모드: **프로덕션 모드** 선택 (보안 규칙은 이후 단계에서 별도 배포한다).
4. **만들기**.

---

## 4. 로컬 환경변수 작성

```bash
cp .env.example .env.local
```

`.env.local` 을 열어 2-3 단계에서 복사한 값을 채운다:

```
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=000000000000
VITE_FIREBASE_APP_ID=1:000...:web:...
```

> `.env.local` 은 `.gitignore` 에 등록되어 있어 커밋되지 않는다. 절대 다른 사람에게 공유하지 말 것.

---

## 5. 개발 서버 띄우고 첫 가입

```bash
pnpm dev
```

브라우저에서 http://localhost:3039 접속.

1. 자동으로 `/sign-in` 으로 리디렉션됨.
2. **회원가입** 링크 → 이메일 / 표시 이름 / 비밀번호(6 자 이상) 입력 → **가입하기**.
3. 가입 성공 시 `/dashboard` 로 자동 이동. 사이드바 우상단 아바타 → **Logout** 으로 로그아웃.

가입한 계정은 Firebase 콘솔 **Authentication → Users** 에서 확인할 수 있다. Firestore 의 `users/{uid}` 경로에 프로필 문서도 자동 생성된다.

---

## 6. Firebase CLI 설치 & 프로젝트 연결

### 6-1. CLI 설치 + 로그인

```bash
npm install -g firebase-tools
firebase --version
firebase login
```

`firebase login` 은 브라우저가 열리며 **Google 계정 인증** 을 요구한다. 2-1 에서 사용한 계정과 동일해야 한다.

### 6-2. 로컬 프로젝트와 Firebase 프로젝트 매핑

저장소 루트에 이미 `.firebaserc` 가 있다:

```json
{ "projects": { "default": "my-partners-manage" } }
```

내 Firebase 프로젝트 ID 가 다르면 직접 수정하거나 다음 명령으로 갱신:

```bash
firebase use --add
# 목록에서 본인 프로젝트 선택 → alias 는 default 로 입력
```

`firebase projects:list` 로 본인 계정에 보이는 프로젝트 목록을 확인할 수 있다.

---

## 7. Firestore 보안 규칙 배포

이 프로젝트의 멀티테넌시는 보안 규칙으로 강제된다. 규칙을 배포하지 않으면 다른 사용자의 데이터가 노출되거나 모든 쓰기가 차단될 수 있다.

```bash
firebase deploy --only firestore:rules
```

배포되는 내용은 `firestore.rules` 에 정의돼 있고 핵심은 한 줄:

```
match /users/{uid}/{document=**} {
  allow read, write: if request.auth != null && request.auth.uid == uid;
}
```

→ 본인 uid 와 일치하는 경로만 본인이 읽기/쓰기 가능.

---

## 8. Hosting 배포

### 8-1. 프로덕션 빌드

```bash
pnpm build
```

`dist/` 디렉토리에 정적 자산이 생성된다. (`firebase.json` 의 `hosting.public` 이 `dist` 로 지정돼 있음)

### 8-2. 프리뷰 채널로 먼저 검증 (권장)

프로덕션을 덮어쓰기 전에 임시 URL 로 확인:

```bash
firebase hosting:channel:deploy preview
```

명령이 끝나면 `https://<project-id>--preview-xxxx.web.app` 같은 임시 URL 이 출력된다. 그 URL 에서 가입/로그인/CRUD 가 정상 동작하는지 확인.

### 8-3. 프로덕션 배포

프리뷰가 OK 면:

```bash
firebase deploy --only hosting
```

배포 완료 후 출력되는 **Hosting URL** (`https://<project-id>.web.app` 또는 `https://<project-id>.firebaseapp.com`) 에 접속해 확인.

> 호스팅 + 보안 규칙을 한 번에 올리려면 `firebase deploy` (--only 없이).

---

## 9. (선택) 커스텀 도메인 연결

1. Firebase 콘솔 → **Hosting → 커스텀 도메인 추가**.
2. 도메인 입력 후 안내되는 TXT / A 레코드를 도메인 등록업체 DNS 에 추가.
3. 인증서 발급까지 보통 24 시간 이내 완료.

---

## 10. 자주 묻는 문제

| 증상 | 원인 / 조치 |
|------|------------|
| 콘솔에 `[firebase] 누락된 환경 변수` 경고 | `.env.local` 의 6 개 키가 비어 있음. 2-3 단계 다시 확인 후 dev 서버 재시작. |
| 가입 시 `auth/operation-not-allowed` | Authentication 의 Email/Password 가 비활성화돼 있음 → 3-1 단계 수행. |
| Firestore 에서 `Missing or insufficient permissions` | 보안 규칙 미배포 또는 잘못된 경로로 접근. 7 단계 수행 + `users/{uid}/...` 경로인지 확인. |
| `firebase deploy` 가 다른 프로젝트로 가려 함 | `.firebaserc` 의 `default` 가 다른 프로젝트 ID. `firebase use <project-id>` 로 전환. |
| 빌드는 성공하는데 호스팅이 404 | `firebase.json` 의 `public` 값이 `dist` 인지, 빌드 직후에 deploy 했는지 확인. |
| `pnpm build` 가 TS 에러로 실패 | `pnpm tsc:watch` 로 정확한 위치 확인. CI 에서도 동일하게 실패하니 fix 후 재시도. |

---

## 11. 배포 체크리스트

매 배포 직전 다음을 확인:

- [ ] `.env.local` 값이 배포 대상 Firebase 프로젝트의 것과 일치
- [ ] `pnpm lint && pnpm build` 가 로컬에서 성공
- [ ] `firestore.rules` 변경분이 있다면 `firebase deploy --only firestore:rules` 도 실행
- [ ] 프리뷰 채널에서 가입/로그인/거래처 CRUD/거래 CRUD 가 정상 동작
- [ ] 프로덕션 배포 후 동일 시나리오를 다시 한 번 검증

---

## 참고

- 기존 간이판: [`docs/firebase-setup.md`](docs/firebase-setup.md) — 본 문서가 상위 호환.
- 도메인 / 기능 명세: [`docs/prd-v2.md`](docs/prd-v2.md).
- 코드 레이아웃 / 개발 규약: [`CLAUDE.md`](CLAUDE.md).
