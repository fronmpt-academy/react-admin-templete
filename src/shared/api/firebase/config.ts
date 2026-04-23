import type { FirebaseApp } from 'firebase/app';

import { getApps, initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const missing = Object.entries(firebaseConfig)
  .filter(([, v]) => !v)
  .map(([k]) => k);

if (missing.length > 0 && import.meta.env.DEV) {
  console.warn(
    `[firebase] 누락된 환경 변수: ${missing.join(', ')}. .env.local 을 설정하세요.`
  );
}

export const firebaseApp: FirebaseApp = getApps()[0] ?? initializeApp(firebaseConfig);
