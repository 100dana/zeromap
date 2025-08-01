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
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { signInWithGoogleAccount } from '../services/googleSignIn';
import { signUpWithEmail } from '../services/authService';
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
    } else if (formData.password.length < 8) {
      newErrors.password = '비밀번호는 8자 이상이어야 합니다.';
    }

    // 비밀번호 확인 검증
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호를 다시 입력해주세요.';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }

    // 닉네임 검증
    if (!formData.nickname) {
      newErrors.nickname = '닉네임을 입력해주세요.';
    } else if (formData.nickname.length < 2) {
      newErrors.nickname = '닉네임은 2자 이상이어야 합니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 회원가입 제출 (임시로 주석처리)
  const handleSignUp = async () => {
    // TODO: Firebase Auth 회원가입 로직 구현 예정
    /*
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Firebase Auth를 사용한 회원가입
      const userData = await signUpWithEmail(
        formData.email,
        formData.password,
        formData.nickname
      );
      
      Alert.alert(
        '회원가입 성공',
        `${userData.nickname}님, 환영합니다!`,
        [
          {
            text: '확인',
            onPress: () => {
              setShowEmailModal(false);
              navigation.navigate('Home');
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('회원가입 오류:', error);
      Alert.alert('회원가입 실패', error.message);
    } finally {
      setIsLoading(false);
    }
    */
    
    // 임시: 바로 홈 화면으로 이동
    setShowEmailModal(false);
    navigation.navigate('Home');
  };

  // 로그인 페이지로 이동
  const handleSignIn = () => {
    navigation.navigate('SignIn');
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

  // 이메일 회원가입 선택
  const handleEmailSignUp = () => {
    setShowEmailModal(true);
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
          <View style={commonStyles.header}>
            <TouchableOpacity 
              style={commonStyles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={commonStyles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={commonStyles.headerTitle}>회원가입</Text>
            <View style={commonStyles.headerRight} />
          </View>

          <View style={commonStyles.content}>
            <View style={commonStyles.welcomeSection}>
              <Text style={commonStyles.welcomeTitle}>Zero Map에 오신 것을 환영합니다!</Text>
              <Text style={commonStyles.welcomeSubtitle}>
                친환경적인 라이프스타일을 함께 만들어가요
              </Text>
            </View>

            {/* 회원가입 방법 선택 */}
            <View style={commonStyles.selectionContainer}>
              
              <TouchableOpacity
                style={[commonStyles.selectionButton, commonStyles.emailButton, isLoading && commonStyles.disabledButton]}
                onPress={handleEmailSignUp}
                disabled={isLoading}
              >
                <Text style={commonStyles.emailButtonText}>📧 이메일로 계속하기</Text>
              </TouchableOpacity>

              <View style={commonStyles.dividerContainer}>
                <View style={commonStyles.divider} />
                <Text style={commonStyles.dividerText}>또는</Text>
                <View style={commonStyles.divider} />
              </View>

              <TouchableOpacity
                style={[commonStyles.selectionButton, commonStyles.googleButton, isLoading && commonStyles.disabledButton]}
                onPress={handleGoogleSignIn}
                disabled={isLoading}
              >
                <Text style={commonStyles.googleButtonText}>🔍 Google로 계속하기</Text>
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
        <SafeAreaView style={commonStyles.modalContainer}>
          <KeyboardAvoidingView 
            style={commonStyles.modalKeyboardAvoidingView}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <ScrollView 
              style={commonStyles.modalScrollView}
              contentContainerStyle={commonStyles.modalScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={commonStyles.modalHeader}>
                <TouchableOpacity 
                  style={commonStyles.closeButton}
                  onPress={handleCloseModal}
                >
                  <Text style={commonStyles.closeButtonText}>✕</Text>
                </TouchableOpacity>
                <Text style={commonStyles.modalHeaderTitle}>이메일 회원가입</Text>
                <View style={commonStyles.modalHeaderRight} />
              </View>

              <View style={commonStyles.modalContent}>
                <View style={commonStyles.formContainer}>
                  <View style={commonStyles.inputGroup}>
                    <Text style={commonStyles.inputLabel}>이메일 *</Text>
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
                    <Text style={commonStyles.inputLabel}>비밀번호 *</Text>
                    <TextInput
                      style={[commonStyles.textInput, errors.password && commonStyles.inputError]}
                      placeholder="8자 이상 입력해주세요"
                      placeholderTextColor={colors.textDisabled}
                      value={formData.password}
                      onChangeText={(value) => handleInputChange('password', value)}
                      secureTextEntry
                      autoCapitalize="none"
                    />
                    {errors.password && <Text style={commonStyles.errorText}>{errors.password}</Text>}
                  </View>

                  {/* 비밀번호 확인 */}
                  <View style={commonStyles.inputGroup}>
                    <Text style={commonStyles.inputLabel}>비밀번호 확인 *</Text>
                    <TextInput
                      style={[commonStyles.textInput, errors.confirmPassword && commonStyles.inputError]}
                      placeholder="비밀번호를 다시 입력해주세요"
                      placeholderTextColor={colors.textDisabled}
                      value={formData.confirmPassword}
                      onChangeText={(value) => handleInputChange('confirmPassword', value)}
                      secureTextEntry
                      autoCapitalize="none"
                    />
                    {errors.confirmPassword && <Text style={commonStyles.errorText}>{errors.confirmPassword}</Text>}
                  </View>

                  {/* 닉네임 입력 */}
                  <View style={commonStyles.inputGroup}>
                    <Text style={commonStyles.inputLabel}>닉네임 *</Text>
                    <TextInput
                      style={[commonStyles.textInput, errors.nickname && commonStyles.inputError]}
                      placeholder="사용할 닉네임을 입력해주세요"
                      placeholderTextColor={colors.textDisabled}
                      value={formData.nickname}
                      onChangeText={(value) => handleInputChange('nickname', value)}
                      autoCapitalize="none"
                    />
                    {errors.nickname && <Text style={commonStyles.errorText}>{errors.nickname}</Text>}
                  </View>
                </View>

                {/* 회원가입 버튼 */}
                <TouchableOpacity
                  style={[styles.signUpButton, isLoading && commonStyles.disabledButton]}
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
  signUpButton: {
    ...commonStyles.button,
    ...commonStyles.primaryButton,
  },
  signUpButtonText: {
    ...commonStyles.buttonText,
  },
  signInSection: {
    ...commonStyles.linkSection,
  },
  signInText: {
    ...commonStyles.linkText,
  },
  signInLink: {
    ...commonStyles.link,
  },
});
