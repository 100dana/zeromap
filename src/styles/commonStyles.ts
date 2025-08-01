import { StyleSheet } from 'react-native';
import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { shadows } from './shadows';

// 공통 스타일 정의
export const commonStyles = StyleSheet.create({
  // 레이아웃
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
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingTop: spacing.sectionSpacing,
  },

  // 헤더
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingVertical: spacing.paddingMedium,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    ...shadows.header,
  },
  headerTitle: {
    ...typography.h3,
    textAlign: 'center',
  },
  headerRight: {
    width: spacing.iconSizeLarge,
  },
  backButton: {
    padding: spacing.paddingSmall,
  },
  backButtonText: {
    fontSize: spacing.iconSizeLarge,
    color: colors.textPrimary,
  },
  closeButton: {
    padding: spacing.paddingSmall,
  },
  closeButtonText: {
    fontSize: spacing.iconSizeLarge,
    color: colors.textPrimary,
  },

  // 섹션
  section: {
    marginBottom: spacing.sectionSpacing,
  },
  sectionLarge: {
    marginBottom: spacing.sectionSpacingLarge,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: spacing.sectionSpacingLarge,
  },
  welcomeTitle: {
    ...typography.h2,
    textAlign: 'center',
    marginBottom: spacing.elementSpacingSmall,
  },
  welcomeSubtitle: {
    ...typography.body2,
    textAlign: 'center',
    color: colors.textSecondary,
  },

  // 폼
  formContainer: {
    marginBottom: spacing.sectionSpacingLarge,
  },
  inputGroup: {
    marginBottom: spacing.elementSpacingLarge,
  },
  inputLabel: {
    ...typography.body2,
    fontWeight: '600',
    marginBottom: spacing.elementSpacingSmall,
    color: colors.textPrimary,
  },
  textInput: {
    ...typography.input,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.borderRadiusMedium,
    paddingHorizontal: spacing.paddingMedium,
    paddingVertical: spacing.paddingMedium,
    backgroundColor: colors.surface,
    ...shadows.input,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.elementSpacingSmall,
  },

  // 버튼
  button: {
    borderRadius: spacing.borderRadiusMedium,
    paddingVertical: spacing.paddingLarge,
    alignItems: 'center',
    marginBottom: spacing.elementSpacingLarge,
    ...shadows.button,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  disabledButton: {
    backgroundColor: colors.textDisabled,
  },
  buttonText: {
    ...typography.button,
    color: colors.background,
  },
  secondaryButtonText: {
    ...typography.button,
    color: colors.textPrimary,
  },

  // 구분선
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.elementSpacingLarge,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.divider,
  },
  dividerText: {
    ...typography.caption,
    marginHorizontal: spacing.paddingMedium,
    color: colors.textSecondary,
  },

  // 링크 섹션
  linkSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sectionSpacing,
  },
  linkText: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  link: {
    ...typography.link,
  },

  // 약관
  termsSection: {
    paddingHorizontal: spacing.paddingMedium,
  },
  termsText: {
    ...typography.caption,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },

  // 모달
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
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingVertical: spacing.paddingMedium,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    ...shadows.header,
  },
  modalHeaderTitle: {
    ...typography.h3,
    textAlign: 'center',
  },
  modalHeaderRight: {
    width: spacing.iconSizeLarge,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingTop: spacing.sectionSpacing,
  },

  // 선택 버튼
  selectionContainer: {
    marginBottom: spacing.sectionSpacingLarge,
  },
  selectionButton: {
    borderRadius: spacing.borderRadiusMedium,
    paddingVertical: spacing.paddingLarge,
    alignItems: 'center',
    marginBottom: spacing.elementSpacingLarge,
    ...shadows.button,
  },
  emailButton: {
    backgroundColor: colors.primary,
  },
  emailButtonText: {
    ...typography.button,
    color: colors.background,
  },
  googleButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  googleButtonText: {
    ...typography.button,
    color: colors.textPrimary,
  },
}); 