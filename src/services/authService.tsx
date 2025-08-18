import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Google Sign-In 초기화
GoogleSignin.configure({
  webClientId: '143037001238-kadtrtrsmuqiovctg6k4sbh92uquq16p.apps.googleusercontent.com',
  offlineAccess: true,
  forceCodeForRefreshToken: true,
  scopes: ['profile', 'email'],
});

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface User {
  userId: string;
  name: string;
  email: string;
  authProvider: 'email' | 'google' | 'kakao';
  points: number;
  createdAt: Date;
  updatedAt: Date;
}

export class AuthService {
  // Firestore에 사용자 정보 저장
  static async createUserInFirestore(user: any): Promise<void> {
    try {
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email?.split('@')[0] || '사용자',
        photoURL: user.photoURL || null,
        createdAt: firestore.FieldValue.serverTimestamp(),
        lastLoginAt: firestore.FieldValue.serverTimestamp(),
        points: 0
      };

      await firestore()
        .collection('users')
        .doc(user.uid)
        .set(userData);
    } catch (error) {
      // 오류 무시
    }
  }

  // Firestore에서 사용자 정보 가져오기
  static async getUserFromFirestore(uid: string): Promise<any> {
    try {
      const doc = await firestore()
        .collection('users')
        .doc(uid)
        .get();

      if (doc.exists) {
        return doc.data();
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  // 현재 사용자 상태 감지
  static onAuthStateChanged(callback: (user: AuthUser | null) => void) {
    return auth().onAuthStateChanged((user: FirebaseAuthTypes.User | null) => {
      if (user) {
        callback({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        });
      } else {
        callback(null);
      }
    });
  }

  // 이메일/비밀번호로 회원가입
  static async signUp(email: string, password: string, name: string): Promise<AuthUser> {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;
      
      // Firestore에 사용자 정보 저장
      await this.createUserInFirestore({
        userId: user.uid,
        name: name,
        email: email,
        authProvider: 'email',
        points: 0,
      });
      
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      };
    } catch (error) {
      throw error;
    }
  }

  // 이메일/비밀번호로 로그인
  static async signIn(email: string, password: string): Promise<AuthUser> {
    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      const user = userCredential.user;
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      };
    } catch (error) {
      throw error;
    }
  }

  // Google 회원가입/로그인 (새 사용자는 회원가입, 기존 사용자는 로그인)
  static async signInWithGoogle(): Promise<any> {
    try {

      // Google Sign-In 토큰 가져오기
      await GoogleSignin.hasPlayServices();
      
      // 기존 로그인 상태 확인 및 로그아웃
      try {
        console.log('기존 로그인 상태 정리 중...');
        await GoogleSignin.signOut();
        console.log('기존 로그인 상태 정리 완료');
      } catch (error) {
        console.log('기존 로그인 상태 정리 중:', error);
      }
      
      // Google Sign-In 실행
      console.log('Google Sign-In 시작...');

      const signInResult = await GoogleSignin.signIn();
      console.log('Google Sign-In 결과:', signInResult);
      
      if (!signInResult) {
        throw new Error('Google 로그인이 완료되지 않았습니다.');
      }
      
      // 잠시 대기하여 로그인 프로세스 완료 보장
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 토큰 가져오기 (재시도 로직 포함)
      console.log('Google 토큰 가져오기 시작...');
      let tokens;
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          console.log(`토큰 가져오기 시도 ${retryCount + 1}/${maxRetries}...`);
          tokens = await GoogleSignin.getTokens();
          console.log('토큰 가져오기 성공:', tokens ? '토큰 존재' : '토큰 없음');
          break;
        } catch (tokenError) {
          retryCount++;
          console.log(`토큰 가져오기 시도 ${retryCount}/${maxRetries} 실패:`, tokenError);
          
          if (retryCount >= maxRetries) {
            console.error('최대 재시도 횟수 초과');
            throw new Error('Google 토큰을 가져올 수 없습니다. 다시 시도해주세요.');
          }
          
          // 잠시 대기 후 재시도
          console.log(`${retryCount}초 후 재시도...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      const idToken = tokens?.idToken;
      if (!idToken) {
        console.error('토큰 객체:', tokens);
        throw new Error('Google ID 토큰을 가져올 수 없습니다.');
      }
      
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      return auth().signInWithCredential(googleCredential);
    } catch (error) {
      throw error;
    }
  }

  // 로그아웃
  static async signOut(): Promise<void> {
    try {
      await auth().signOut();
    } catch (error) {
    }
  }

  // 비밀번호 재설정
  static async resetPassword(email: string): Promise<void> {
    try {
      await auth().sendPasswordResetEmail(email);
    } catch (error) {
      throw error;
    }
  }

  // 현재 사용자 정보 가져오기
  static getCurrentUser(): AuthUser | null {
    const user = auth().currentUser;
    if (user) {
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      };
    }
    return null;
  }

  // 사용자 프로필 업데이트
  static async updateProfile(displayName?: string, photoURL?: string): Promise<void> {
    try {
      const user = auth().currentUser;
      if (user) {
        await user.updateProfile({
          displayName: displayName || user.displayName,
          photoURL: photoURL || user.photoURL,
        });
      }
    } catch (error) {
      throw error;
    }
  }

  static async updateUserPoints(userId: string, points: number): Promise<void> {
    try {
      await firestore()
        .collection('users')
        .doc(userId)
        .update({
          points: firestore.FieldValue.increment(points),
          updatedAt: firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
    }
  }

  static async addUserPoints(userId: string, pointsToAdd: number): Promise<void> {
    try {
      await firestore()
        .collection('users')
        .doc(userId)
        .update({
          points: firestore.FieldValue.increment(pointsToAdd),
          updatedAt: firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
    }
  }
}

export default AuthService; 