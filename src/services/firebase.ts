import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, signInWithCredential, User } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyBwXR15j0iH_HxERXzNv0QpZshMbaHrghA",
  authDomain: "zeromap-8b449.firebaseapp.com",
  projectId: "zeromap-8b449",
  storageBucket: "zeromap-8b449.firebasestorage.app",
  messagingSenderId: "143037001238",
  appId: "1:143037001238:android:816771b1979bce0cf04f37"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// 서비스 내보내기
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Firebase Auth 관련 함수들
export const signInWithGoogle = async (idToken: string) => {
  try {
    const credential = GoogleAuthProvider.credential(idToken);
    const result = await signInWithCredential(auth, credential);
    return result;
  } catch (error) {
    console.error('Google 로그인 오류:', error);
    throw error;
  }
};

export default app; 