import React, { useState } from 'react';
import { 
  View,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthService } from '../services/authService';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';
import { shadows } from '../styles/shadows';
import { typography } from '../styles/typography';

type RootStackParamList = {
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

  // 로그인 제출
  const handleSignIn = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Firebase Auth를 사용한 로그인
      const userData = await AuthService.signIn(
        formData.email,
        formData.password
      );
      
      navigation.navigate('Map');
    } catch (error: any) {
      Alert.alert('로그인 실패', error.message || '로그인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 회원가입 페이지로 이동
  const handleSignUp = () => {
    navigation.navigate('SignUp');
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await AuthService.signInWithGoogle();
      navigation.navigate('Map');
    } catch (error: any) {
      Alert.alert('로그인 실패', error.message || 'Google 로그인에 실패했습니다.');

      console.error('Google 로그인 오류:', error);
      
      // 사용자에게 더 친화적인 오류 메시지 표시
      let errorMessage = 'Google 로그인 중 오류가 발생했습니다.';
      
      if (error.message?.includes('토큰을 가져올 수 없습니다')) {
        errorMessage = 'Google 로그인 토큰을 가져올 수 없습니다. 다시 시도해주세요.';
      } else if (error.message?.includes('로그인이 완료되지 않았습니다')) {
        errorMessage = 'Google 로그인이 완료되지 않았습니다. 다시 시도해주세요.';
      } else if (error.message?.includes('network')) {
        errorMessage = '네트워크 연결을 확인하고 다시 시도해주세요.';
      } else if (error.message?.includes('cancelled')) {
        errorMessage = '로그인이 취소되었습니다.';
        return; // 취소된 경우 알림을 표시하지 않음
      }
      
      Alert.alert('로그인 오류', errorMessage, [{ text: '확인' }]);

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 메인 컨텐츠 */}
          <View style={styles.content}>
            {/* 헤더 */}
            <View style={styles.header}>
              <View style={styles.headerLeft} />
              <Text style={styles.headerTitle}>로그인</Text>
              <View style={styles.headerRight} />
            </View>
            
            {/* 뒤로가기 버튼 */}
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>‹</Text>
            </TouchableOpacity>
            {/* 환영 메시지 */}
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeTitle}>다시 오신 것을 환영합니다!</Text>
              <Text style={styles.welcomeSubtitle}>
                Zeromap에 로그인하고{'\n'}친환경적인 라이프스타일을 이어가세요
              </Text>
            </View>

            {/* 로그인 폼 */}
            <View style={styles.formContainer}>
              {/* 이메일 입력 */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>이메일</Text>
                <TextInput
                  style={[styles.textInput, errors.email && styles.inputError]}
                  placeholder="example@email.com"
                  placeholderTextColor={colors.textDisabled}
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              </View>

              {/* 비밀번호 입력 */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>비밀번호</Text>
                <TextInput
                  style={[styles.textInput, errors.password && styles.inputError]}
                  placeholder="비밀번호를 입력해주세요"
                  placeholderTextColor={colors.textDisabled}
                  value={formData.password}
                  onChangeText={(value) => handleInputChange('password', value)}
                  secureTextEntry
                  autoCapitalize="none"
                />
                {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
              </View>
            </View>

            {/* 로그인 버튼 */}
            <TouchableOpacity
              style={[styles.signInButton, isLoading && styles.disabledButton]}
              onPress={handleSignIn}
              disabled={isLoading}
            >
              <Text style={styles.signInButtonText}>
                {isLoading ? '로그인 중...' : '로그인'}
              </Text>
            </TouchableOpacity>

            {/* 구분선 */}
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>또는</Text>
              <View style={styles.divider} />
            </View>

            {/* Google 로그인 버튼 */}
            <TouchableOpacity
              style={[styles.googleButton, isLoading && styles.disabledButton]}
              onPress={handleGoogleSignIn}
              disabled={isLoading}
            >
              <Text style={styles.googleButtonText}>🔍 Google로 계속하기</Text>
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
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
    justifyContent: 'center',
    minHeight: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
    marginBottom: spacing.xl,
    width: '100%',
  },
  backButton: {
    padding: 8,
    position: 'absolute',
    top: 60,
    left: spacing.md,
    zIndex: 1,
  },
  backButtonText: {
    fontSize: 24,
    color: colors.textPrimary,
  },
  headerTitle: {
    fontSize: typography.h3.fontSize,
    color: colors.textPrimary,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerLeft: {
    width: 40,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    width: '100%',
  },
  welcomeTitle: {
    fontSize: typography.h2.fontSize,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  welcomeSubtitle: {
    fontSize: typography.body1.fontSize,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: spacing.xl,
    width: '100%',
    alignItems: 'center',
  },
  inputGroup: {
    marginBottom: spacing.md,
    width: '100%',
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: typography.body1.fontSize,
    color: colors.textPrimary,
    marginBottom: 8,
    marginLeft: 4,
    width: '80%',
    textAlign: 'left',
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.body1.fontSize,
    color: colors.textPrimary,
    backgroundColor: colors.background,
    height: 42,
    width: '80%',
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.caption.fontSize,
    marginTop: spacing.xs,
  },
  signInButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: spacing.sm,
    alignItems: 'center',
    marginBottom: spacing.sm,
    ...shadows.button,
  },
  signInButtonText: {
    color: colors.background,
    fontSize: typography.button.fontSize,
  },
  disabledButton: {
    opacity: 0.6,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    marginHorizontal: spacing.md,
    color: colors.textSecondary,
    fontSize: typography.caption.fontSize,
  },
  googleButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: spacing.sm,
    alignItems: 'center',
    marginBottom: spacing.xl,
    ...shadows.button,
  },
  googleButtonText: {
    color: colors.textPrimary,
    fontSize: typography.button.fontSize,
  },
  signUpSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    color: colors.textSecondary,
    fontSize: typography.body1.fontSize,
  },
  signUpLink: {
    color: colors.primary,
    fontSize: typography.body1.fontSize,
    fontWeight: 'bold',
  },
}); 