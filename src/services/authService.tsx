import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Google Sign-In 초기화
GoogleSignin.configure({
  webClientId: '143037001238-kadtrtrsmuqiovctg6k4sbh92uquq16p.apps.googleusercontent.com',
  offlineAccess: true,
  forceCodeForRefreshToken: true,
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
  static async createUserInFirestore(userData: Omit<User, 'createdAt' | 'updatedAt'>): Promise<void> {
    try {
      const now = new Date();
      const userDoc = {
        ...userData,
        createdAt: now,
        updatedAt: now,
      };
      
      await firestore()
        .collection('users')
        .doc(userData.userId)
        .set(userDoc);
    } catch (error) {
      console.error('Firestore 사용자 생성 오류:', error);
      throw error;
    }
  }

  // Firestore에서 사용자 정보 가져오기
  static async getUserFromFirestore(userId: string): Promise<User | null> {
    try {
      const userDoc = await firestore()
        .collection('users')
        .doc(userId)
        .get();
      
      if (userDoc.exists) {
        return userDoc.data() as User;
      }
      return null;
    } catch (error) {
      console.error('Firestore 사용자 조회 오류:', error);
      throw error;
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
  static async signInWithGoogle(): Promise<{ user: AuthUser; isNewUser: boolean }> {
    try {
      // Google Sign-In 토큰 가져오기
      // Play Services 확인 (업데이트 다이얼로그 표시)
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      
      // 기존 로그인 상태 확인 및 로그아웃
      try {
        await GoogleSignin.signOut();
      } catch (error) {
        // 이미 로그아웃된 상태일 수 있음
        console.log('기존 로그인 상태 정리 중:', error);
      }
      
      const signInResult = await GoogleSignin.signIn();
      const tokens = await GoogleSignin.getTokens();
      const idToken = tokens.idToken;
      
      if (!idToken) {
        throw new Error('Google ID 토큰을 가져올 수 없습니다.');
      }
      
      // Firebase에 Google 토큰으로 인증
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const userCredential = await auth().signInWithCredential(googleCredential);
      const user = userCredential.user;
      
      // Firestore에서 사용자 정보 확인
      const existingUser = await this.getUserFromFirestore(user.uid);
      
      let isNewUser = false;
      
      // 새 사용자인 경우 Firestore에 저장 (회원가입)
      if (!existingUser) {
        await this.createUserInFirestore({
          userId: user.uid,
          name: user.displayName || '사용자',
          email: user.email || '',
          authProvider: 'google',
          points: 0,
        });
        isNewUser = true;
      }
      
      return {
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        },
        isNewUser: isNewUser
      };
    } catch (error) {
      console.error('Google 로그인 오류:', error);
      throw error;
    }
  }

  // 로그아웃
  static async signOut(): Promise<void> {
    try {
      await GoogleSignin.signOut();
      await auth().signOut();
    } catch (error) {
      throw error;
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

  // 포인트 업데이트
  static async updatePoints(userId: string, points: number): Promise<void> {
    try {
      await firestore()
        .collection('users')
        .doc(userId)
        .update({
          points: points,
          updatedAt: new Date(),
        });
    } catch (error) {
      console.error('포인트 업데이트 오류:', error);
      throw error;
    }
  }

  // 포인트 추가
  static async addPoints(userId: string, pointsToAdd: number): Promise<void> {
    try {
      const userDoc = await firestore()
        .collection('users')
        .doc(userId)
        .get();
      
      if (userDoc.exists) {
        const currentPoints = userDoc.data()?.points || 0;
        await this.updatePoints(userId, currentPoints + pointsToAdd);
      }
    } catch (error) {
      console.error('포인트 추가 오류:', error);
      throw error;
    }
  }
}

export default AuthService; 