import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

import { firestore } from '@shared/api/firebase';

type UserProfile = {
  email: string;
  displayName: string;
};

export const ensureUserProfile = async (
  uid: string,
  profile: UserProfile
): Promise<void> => {
  const ref = doc(firestore, 'users', uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return;
  await setDoc(ref, {
    ...profile,
    createdAt: serverTimestamp(),
  });
};
