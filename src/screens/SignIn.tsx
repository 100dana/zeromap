import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { signInWithGoogleAccount } from '../services/googleSignIn';
import { signInWithEmail } from '../services/authService';
import { commonStyles } from '../styles/commonStyles';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';
import { shadows } from '../styles/shadows';
import { typography } from '../styles/typography';

type RootStackParamList = {
  Home: undefined;
  Map: undefined;
  MapDetail: undefined;
  SignUp: undefined;
  SignIn: undefined;
  MyPage: undefined;
  Settings: undefined;
};

export default function SignIn() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'SignIn'>>();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);

  // 입력 필드 변경 핸들러
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 에러 메시지 초기화
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // 유효성 검사
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    // 이메일 검증
    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식을 입력해주세요.';
    }

    // 비밀번호 검증
    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 로그인 제출 (임시로 주석처리)
  const handleSignIn = async () => {
    // TODO: Firebase Auth 로그인 로직 구현 예정
    /*
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Firebase Auth를 사용한 로그인
      const userData = await signInWithEmail(
        formData.email,
        formData.password
      );
      
      Alert.alert(
        '로그인 성공',
        `${userData.nickname}님, 환영합니다!`,
        [
          {
            text: '확인',
            onPress: () => navigation.navigate('Home'),
          },
        ]
      );
    } catch (error: any) {
      console.error('로그인 오류:', error);
      Alert.alert('로그인 실패', error.message);
    } finally {
      setIsLoading(false);
    }
    */
    
    // 임시: 바로 홈 화면으로 이동
    navigation.navigate('Home');
  };

  // 회원가입 페이지로 이동
  const handleSignUp = () => {
    navigation.navigate('SignUp');
  };

  // Google 로그인 처리 (임시로 주석처리)
  const handleGoogleSignIn = async () => {
    // TODO: Google 로그인 로직 구현 예정
    /*
    setIsLoading(true);
    try {
      const result = await signInWithGoogleAccount();
      Alert.alert(
        '로그인 성공',
        `${result.user.email}님, 환영합니다!`,
        [
          {
            text: '확인',
            onPress: () => navigation.navigate('Home'),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('로그인 실패', error.message);
    } finally {
      setIsLoading(false);
    }
    */
    
    // 임시: 바로 홈 화면으로 이동
    navigation.navigate('Home');
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <KeyboardAvoidingView 
        style={commonStyles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={commonStyles.scrollView}
          contentContainerStyle={commonStyles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 헤더 */}
          <View style={commonStyles.header}>
            <TouchableOpacity 
              style={commonStyles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={commonStyles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={commonStyles.headerTitle}>로그인</Text>
            <View style={commonStyles.headerRight} />
          </View>

          {/* 메인 컨텐츠 */}
          <View style={commonStyles.content}>
            {/* 환영 메시지 */}
            <View style={commonStyles.welcomeSection}>
              <Text style={commonStyles.welcomeTitle}>다시 오신 것을 환영합니다!</Text>
              <Text style={commonStyles.welcomeSubtitle}>
                Zero Map에 로그인하여 친환경 라이프스타일을 이어가세요
              </Text>
            </View>

            {/* 로그인 폼 */}
            <View style={commonStyles.formContainer}>
              {/* 이메일 입력 */}
              <View style={commonStyles.inputGroup}>
                <Text style={commonStyles.inputLabel}>이메일</Text>
                <TextInput
                  style={[commonStyles.textInput, errors.email && commonStyles.inputError]}
                  placeholder="example@email.com"
                  placeholderTextColor={colors.textDisabled}
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {errors.email && <Text style={commonStyles.errorText}>{errors.email}</Text>}
              </View>

              {/* 비밀번호 입력 */}
              <View style={commonStyles.inputGroup}>
                <Text style={commonStyles.inputLabel}>비밀번호</Text>
                <TextInput
                  style={[commonStyles.textInput, errors.password && commonStyles.inputError]}
                  placeholder="비밀번호를 입력해주세요"
                  placeholderTextColor={colors.textDisabled}
                  value={formData.password}
                  onChangeText={(value) => handleInputChange('password', value)}
                  secureTextEntry
                  autoCapitalize="none"
                />
                {errors.password && <Text style={commonStyles.errorText}>{errors.password}</Text>}
              </View>
            </View>

            {/* 로그인 버튼 */}
            <TouchableOpacity
              style={[styles.signInButton, isLoading && commonStyles.disabledButton]}
              onPress={handleSignIn}
              disabled={isLoading}
            >
              <Text style={styles.signInButtonText}>
                {isLoading ? '로그인 중...' : '로그인'}
              </Text>
            </TouchableOpacity>

            {/* 구분선 */}
            <View style={commonStyles.dividerContainer}>
              <View style={commonStyles.divider} />
              <Text style={commonStyles.dividerText}>또는</Text>
              <View style={commonStyles.divider} />
            </View>

            {/* Google 로그인 버튼 */}
            <TouchableOpacity
              style={[commonStyles.googleButton, isLoading && commonStyles.disabledButton]}
              onPress={handleGoogleSignIn}
              disabled={isLoading}
            >
              <Text style={commonStyles.googleButtonText}>🔍 Google로 계속하기</Text>
            </TouchableOpacity>

            {/* 회원가입 링크 */}
            <View style={styles.signUpSection}>
              <Text style={styles.signUpText}>계정이 없으신가요? </Text>
              <TouchableOpacity onPress={handleSignUp}>
                <Text style={styles.signUpLink}>회원가입하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // 기존 스타일에서 공통 스타일로 대체할 수 없는 것들만 유지
  signInButton: {
    ...commonStyles.button,
    ...commonStyles.primaryButton,
  },
  signInButtonText: {
    ...commonStyles.buttonText,
  },
  signUpSection: {
    ...commonStyles.linkSection,
  },
  signUpText: {
    ...commonStyles.linkText,
  },
  signUpLink: {
    ...commonStyles.link,
  },
}); 