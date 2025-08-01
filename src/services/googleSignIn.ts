import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { signInWithGoogle } from './firebase';

// Google Sign-In 설정
export const configureGoogleSignIn = () => {
  GoogleSignin.configure({
    webClientId: '143037001238-816771b1979bce0cf04f37.apps.googleusercontent.com', // Firebase Console에서 가져온 웹 클라이언트 ID
    offlineAccess: true,
    hostedDomain: '',
    forceCodeForRefreshToken: true,
  });
};

// Google 로그인 함수
export const signInWithGoogleAccount = async () => {
  try {
    // Google Sign-In 상태 확인
    await GoogleSignin.hasPlayServices();
    
    // Google 로그인 실행
    const userInfo = await GoogleSignin.signIn();
    
    // ID 토큰 가져오기
    const tokens = await GoogleSignin.getTokens();
    
    if (tokens.idToken) {
      // Firebase Auth로 로그인
      const result = await signInWithGoogle(tokens.idToken);
      return {
        success: true,
        user: result.user,
        googleUser: userInfo,
      };
    } else {
      throw new Error('Google ID 토큰을 가져올 수 없습니다.');
    }
  } catch (error: any) {
    console.error('Google 로그인 오류:', error);
    
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      throw new Error('로그인이 취소되었습니다.');
    } else if (error.code === statusCodes.IN_PROGRESS) {
      throw new Error('로그인이 진행 중입니다.');
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      throw new Error('Google Play Services를 사용할 수 없습니다.');
    } else {
      throw new Error('Google 로그인 중 오류가 발생했습니다.');
    }
  }
};

// Google 로그아웃 함수
export const signOutFromGoogle = async () => {
  try {
    await GoogleSignin.signOut();
    return { success: true };
  } catch (error) {
    console.error('Google 로그아웃 오류:', error);
    throw error;
  }
};

// 현재 로그인된 Google 사용자 확인
export const getCurrentGoogleUser = async () => {
  try {
    const currentUser = await GoogleSignin.getCurrentUser();
    return currentUser;
  } catch (error) {
    console.error('Google 사용자 확인 오류:', error);
    return null;
  }
}; 