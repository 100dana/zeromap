import { initializeApp } from '@react-native-firebase/app';
import storage from '@react-native-firebase/storage';

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyDummyKeyForTestingOnly",
  authDomain: "zeromap-8b449.firebaseapp.com",
  projectId: "zeromap-8b449",
  storageBucket: "zeromap-8b449.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:android:abcdef123456"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);

export { app, storage }; 