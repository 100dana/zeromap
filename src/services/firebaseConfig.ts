import app from '@react-native-firebase/app';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

// 🔒 보안 주의사항:
// 1. google-services.json (Android) 및 GoogleService-Info.plist (iOS) 파일이 
//    프로젝트에 올바르게 설정되어 있는지 확인하세요.
// 2. 이 파일들은 .gitignore에 포함되어 있어야 합니다.
// 3. 프로덕션 환경에서는 환경 변수를 사용하여 API 키를 관리하는 것을 권장합니다.
// 4. Firebase Console에서 보안 규칙을 적절히 설정하세요.

export { app, storage, firestore, auth };