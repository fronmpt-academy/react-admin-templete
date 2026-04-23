# Firebase 셋업 가이드

이 프로젝트는 Firebase Authentication 과 Firestore 를 사용한다. 신규 환경 구축 시 아래 절차를 따른다.

## 1. Firebase 프로젝트 생성

1. https://console.firebase.google.com 접속 → **프로젝트 추가**.
2. 프로젝트 이름 입력 후 생성. Google Analytics 는 선택사항.

## 2. Web 앱 등록

1. 프로젝트 개요에서 **웹 아이콘(`</>`)** 클릭.
2. 앱 닉네임 입력, Firebase Hosting 체크 (원하면) 후 등록.
3. 출력되는 `firebaseConfig` 객체의 6 개 값을 복사.

## 3. 로컬 환경변수 설정

```bash
cp .env.example .env.local
```

`.env.local` 에 위에서 복사한 값을 입력:

```
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=000000000000
VITE_FIREBASE_APP_ID=1:000...:web:...
```

## 4. Authentication 활성화

1. 콘솔 → **Authentication** → **시작하기**.
2. **Sign-in method** 탭 → **Email/Password** 활성화.

## 5. Firestore Database 생성

1. 콘솔 → **Firestore Database** → **데이터베이스 만들기**.
2. 위치 선택 (예: `asia-northeast3` Seoul).
3. 프로덕션 모드 시작.

## 6. 보안 규칙 배포

Firebase CLI 설치:

```bash
npm install -g firebase-tools
firebase login
firebase use --add   # 로컬 프로젝트와 연결
```

규칙 배포:

```bash
firebase deploy --only firestore:rules
```

배포되는 규칙은 `firestore.rules` 에 정의되어 있으며 `users/{uid}` 경로를 본인만 읽기/쓰기 허용한다.

## 7. (선택) Hosting 배포

```bash
pnpm build
firebase deploy --only hosting
```

## 8. 로컬 개발 실행

```bash
pnpm dev
```

`http://localhost:3039` 접속 → `/sign-up` 에서 계정 생성 → `/dashboard` 진입.
