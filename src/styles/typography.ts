import { colors } from './colors';

export const typography = {
  // 제목 스타일
  h1: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: colors.textPrimary,
    lineHeight: 32,
  },
  h2: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: colors.textPrimary,
    lineHeight: 28,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.textPrimary,
    lineHeight: 24,
  },
  h4: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  
  // 본문 스타일
  body1: {
    fontSize: 16,
    fontWeight: 'normal' as const,
    color: colors.textPrimary,
    lineHeight: 24,
  },
  body2: {
    fontSize: 14,
    fontWeight: 'normal' as const,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: 'normal' as const,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  
  // 버튼 텍스트
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.background,
    lineHeight: 24,
  },
  buttonSmall: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.background,
    lineHeight: 20,
  },
  
  // 입력 필드
  input: {
    fontSize: 16,
    fontWeight: 'normal' as const,
    color: colors.textPrimary,
    lineHeight: 24,
  },
  
  // 링크
  link: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.primary,
    lineHeight: 24,
  },
} as const; 