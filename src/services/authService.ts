import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile,
  User,
  UserCredential 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

// 사용자 정보 타입
export interface UserData {
  uid: string;
  email: string;
  nickname: string;
  createdAt: Date;
  lastLoginAt: Date;
}

// 회원가입
export const signUpWithEmail = async (
  email: string, 
  password: string, 
  nickname: string
): Promise<UserData> => {
  try {
    // 사용자 생성
    const userCredential: UserCredential = await createUserWithEmailAndPassword(
      auth, 
      email, 
      password
    );

    const user = userCredential.user;

    // 사용자 프로필 업데이트 (닉네임)
    await updateProfile(user, {
      displayName: nickname
    });

    // Firestore에 사용자 정보 저장
    const userData: UserData = {
      uid: user.uid,
      email: user.email || '',
      nickname: nickname,
      createdAt: new Date(),
      lastLoginAt: new Date()
    };

    await setDoc(doc(db, 'users', user.uid), userData);

    return userData;
  } catch (error: any) {
    console.error('회원가입 오류:', error);
    
    let errorMessage = '회원가입 중 오류가 발생했습니다.';
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = '이미 사용 중인 이메일입니다.';
        break;
      case 'auth/invalid-email':
        errorMessage = '올바르지 않은 이메일 형식입니다.';
        break;
      case 'auth/weak-password':
        errorMessage = '비밀번호가 너무 약합니다. 6자 이상 입력해주세요.';
        break;
      case 'auth/operation-not-allowed':
        errorMessage = '이메일/비밀번호 로그인이 비활성화되어 있습니다.';
        break;
      default:
        errorMessage = error.message || '회원가입 중 오류가 발생했습니다.';
    }
    throw new Error(errorMessage);
  }
};

// 이메일 로그인
export const signInWithEmail = async (
  email: string, 
  password: string
): Promise<UserData> => {
  try {
    // Firebase Auth로 로그인
    const userCredential: UserCredential = await signInWithEmailAndPassword(
      auth, 
      email, 
      password
    );

    const user = userCredential.user;

    // Firestore에서 사용자 정보 가져오기
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (userDoc.exists()) {
      const userData = userDoc.data() as UserData;
      
      // 마지막 로그인 시간 업데이트
      await setDoc(doc(db, 'users', user.uid), {
        ...userData,
        lastLoginAt: new Date()
      }, { merge: true });

      return {
        ...userData,
        lastLoginAt: new Date()
      };
    } else {
      // Firestore에 사용자 정보가 없는 경우
      const userData: UserData = {
        uid: user.uid,
        email: user.email || '',
        nickname: user.displayName || '사용자',
        createdAt: new Date(),
        lastLoginAt: new Date()
      };

      await setDoc(doc(db, 'users', user.uid), userData);
      return userData;
    }
  } catch (error: any) {
    console.error('로그인 오류:', error);
    
    let errorMessage = '로그인 중 오류가 발생했습니다.';
    
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = '등록되지 않은 이메일입니다.';
        break;
      case 'auth/wrong-password':
        errorMessage = '비밀번호가 올바르지 않습니다.';
        break;
      case 'auth/invalid-email':
        errorMessage = '올바르지 않은 이메일 형식입니다.';
        break;
      case 'auth/user-disabled':
        errorMessage = '비활성화된 계정입니다.';
        break;
      case 'auth/too-many-requests':
        errorMessage = '너무 많은 로그인 시도가 있었습니다. 잠시 후 다시 시도해주세요.';
        break;
      default:
        errorMessage = error.message || '로그인 중 오류가 발생했습니다.';
    }
    
    throw new Error(errorMessage);
  }
};

// 로그아웃
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error('로그아웃 오류:', error);
    throw new Error('로그아웃 중 오류가 발생했습니다.');
  }
};

// 현재 사용자 정보 가져오기
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

// 사용자 정보 Firestore에서 가져오기
export const getUserData = async (uid: string): Promise<UserData | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    
    if (userDoc.exists()) {
      return userDoc.data() as UserData;
    }
    
    return null;
  } catch (error) {
    console.error('사용자 정보 가져오기 오류:', error);
    return null;
  }
};

// 인증 상태 변경 리스너
export const onAuthStateChanged = (callback: (user: User | null) => void) => {
  return auth.onAuthStateChanged(callback);
}; 