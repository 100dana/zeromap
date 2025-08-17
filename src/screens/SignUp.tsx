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
  Modal,
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

export default function SignUp() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'SignUp'>>();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nickname: '',
  });
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  // 입력 필드 변경 핸들러
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식을 입력해주세요.';
    }

    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요.';
    } else if (formData.password.length < 8) {
      newErrors.password = '비밀번호는 8자 이상이어야 합니다.';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호를 다시 입력해주세요.';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }

    if (!formData.nickname) {
      newErrors.nickname = '닉네임을 입력해주세요.';
    } else if (formData.nickname.length < 2) {
      newErrors.nickname = '닉네임은 2자 이상이어야 합니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      await AuthService.signUp(formData.email, formData.password, formData.nickname);
      Alert.alert('회원가입 성공', `${formData.nickname}님, 환영합니다!`, [
        { text: '확인', onPress: () => { setShowEmailModal(false); navigation.navigate('Map'); } }
      ]);
    } catch (error: any) {
      console.error('회원가입 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = () => {
    navigation.navigate('SignIn');
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await AuthService.signInWithGoogle();
      const message = result.isNewUser ? '회원가입 성공' : '로그인 성공';
      const name = result.user.displayName || result.user.email;
      Alert.alert(message, `${name}님, 환영합니다!`, [
        { text: '확인', onPress: () => navigation.navigate('Map') }
      ]);
    } catch (error: any) {
      console.error('Google 로그인 오류:', error);
      

      // 사용자에게 오류 메시지 표시
      let errorMessage = 'Google 로그인 중 오류가 발생했습니다.';
      
      if (error.code === 'SIGN_IN_CANCELLED') {
        errorMessage = '로그인이 취소되었습니다.';
      } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
        errorMessage = 'Google Play Services를 사용할 수 없습니다.';
      } else if (error.code === 'SIGN_IN_REQUIRED') {
        errorMessage = 'Google 계정으로 다시 로그인해주세요.';
      } else if (error.message?.includes('activity is null')) {
        errorMessage = '앱을 다시 시작한 후 다시 시도해주세요.';
      }
      
      Alert.alert('로그인 오류', errorMessage);
      
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

  // 이메일 회원가입 선택
  const handleEmailSignUp = async () => {
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      Alert.alert('알림', '모든 필드를 입력해주세요.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('알림', '비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      setIsLoading(true);
      // TODO: 이메일 회원가입 로직 구현
      await AuthService.signUpWithEmail(formData.email, formData.password);
      Alert.alert('회원가입 성공', '회원가입이 완료되었습니다.', [
        { text: '확인', onPress: () => navigation.navigate('Map') }
      ]);
    } catch (error: any) {
      Alert.alert('회원가입 실패', error.message || '회원가입에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setShowEmailModal(false);
    // 폼 데이터 초기화
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      nickname: '',
    });
    setErrors({});
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
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.headerLeft} />
              <Text style={styles.headerTitle}>회원가입</Text>
              <View style={styles.headerRight} />
            </View>
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeTitle}>Zero Map에 오신 것을 환영합니다!</Text>
              <Text style={styles.welcomeSubtitle}>
                친환경적인 라이프스타일을 함께 만들어가요
              </Text>
            </View>

            {/* 회원가입 방법 선택 */}
            <View style={styles.selectionContainer}>
              
              <TouchableOpacity
                style={[styles.selectionButton, styles.emailButton, isLoading && styles.disabledButton]}
                onPress={handleEmailSignUp}
                disabled={isLoading}
              >
                <Text style={styles.emailButtonText}>📧 이메일로 가입하기</Text>
              </TouchableOpacity>

              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>또는</Text>
                <View style={styles.divider} />
              </View>

              <TouchableOpacity
                style={[styles.selectionButton, styles.googleButton, isLoading && styles.disabledButton]}
                onPress={handleGoogleSignIn}
                disabled={isLoading}
              >
                <Text style={styles.googleButtonText}>🔍 Google로 계속하기</Text>
              </TouchableOpacity>
            </View>

            {/* 로그인 링크 */}
            <View style={styles.signInSection}>
              <Text style={styles.signInText}>이미 계정이 있으신가요? </Text>
              <TouchableOpacity onPress={handleSignIn}>
                <Text style={styles.signInLink}>로그인하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 이메일 회원가입 모달 */}
      <Modal
        visible={showEmailModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseModal}
      >
        <SafeAreaView style={styles.modalContainer} edges={['left', 'right', 'bottom']}>
          <KeyboardAvoidingView 
            style={styles.modalKeyboardAvoidingView}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <ScrollView 
              style={styles.modalScrollView}
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.modalHeader}>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={handleCloseModal}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
                <Text style={styles.modalHeaderTitle}>이메일 회원가입</Text>
                <View style={styles.modalHeaderRight} />
              </View>

              <View style={styles.modalContent}>
                <View style={styles.formContainer}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>이메일 *</Text>
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
                    <Text style={styles.inputLabel}>비밀번호 *</Text>
                    <TextInput
                      style={[styles.textInput, errors.password && styles.inputError]}
                      placeholder="8자 이상 입력해주세요"
                      placeholderTextColor={colors.textDisabled}
                      value={formData.password}
                      onChangeText={(value) => handleInputChange('password', value)}
                      secureTextEntry
                      autoCapitalize="none"
                    />
                    {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                  </View>

                  {/* 비밀번호 확인 */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>비밀번호 확인 *</Text>
                    <TextInput
                      style={[styles.textInput, errors.confirmPassword && styles.inputError]}
                      placeholder="비밀번호를 다시 입력해주세요"
                      placeholderTextColor={colors.textDisabled}
                      value={formData.confirmPassword}
                      onChangeText={(value) => handleInputChange('confirmPassword', value)}
                      secureTextEntry
                      autoCapitalize="none"
                    />
                    {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
                  </View>

                  {/* 닉네임 입력 */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>닉네임 *</Text>
                    <TextInput
                      style={[styles.textInput, errors.nickname && styles.inputError]}
                      placeholder="사용할 닉네임을 입력해주세요"
                      placeholderTextColor={colors.textDisabled}
                      value={formData.nickname}
                      onChangeText={(value) => handleInputChange('nickname', value)}
                      autoCapitalize="none"
                    />
                    {errors.nickname && <Text style={styles.errorText}>{errors.nickname}</Text>}
                  </View>
                </View>

                {/* 회원가입 버튼 */}
                <TouchableOpacity
                  style={[styles.signUpButton, isLoading && styles.disabledButton]}
                  onPress={handleSignUp}
                  disabled={isLoading}
                >
                  <Text style={styles.signUpButtonText}>
                    {isLoading ? '처리 중...' : '회원가입'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
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
  headerTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: 'bold',
    color: colors.textPrimary,
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
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  selectionContainer: {
    marginBottom: spacing.xl,
    width: '100%',
    alignItems: 'center',
  },
  selectionButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: spacing.sm,
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.button,
  },
  emailButton: {
    backgroundColor: colors.primary,
  },
  googleButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emailButtonText: {
    color: colors.background,
    fontSize: typography.button.fontSize,
  },
  googleButtonText: {
    color: colors.textPrimary,
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
  signInSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInText: {
    color: colors.textSecondary,
    fontSize: typography.body1.fontSize,
  },
  signInLink: {
    color: colors.primary,
    fontSize: typography.body1.fontSize,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalKeyboardAvoidingView: {
    flex: 1,
  },
  modalScrollView: {
    flex: 1,
  },
  modalScrollContent: {
    flexGrow: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeButton: {
    padding: spacing.sm,
  },
  closeButtonText: {
    fontSize: 20,
    color: colors.textPrimary,
  },
  modalHeaderTitle: {
    fontSize: typography.h3.fontSize,
    color: colors.textPrimary,
  },
  modalHeaderRight: {
    width: 40,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  formContainer: {
    marginBottom: spacing.xl,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: typography.body1.fontSize,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
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
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.caption.fontSize,
    marginTop: spacing.xs,
  },
  signUpButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: spacing.sm,
    alignItems: 'center',
    ...shadows.button,
  },
  signUpButtonText: {
    color: colors.background,
    fontSize: typography.button.fontSize,
  },
});