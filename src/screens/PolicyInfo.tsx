// 지역 정책 관련 페이지
// 추후 데이터 확보시 업데이트 예정
// 현재는 더미데이터로 하드 코딩 되어있음

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';
import { shadows } from '../styles/shadows';

type RootStackParamList = {
  PolicyInfo: undefined;
};

type PolicyInfoNavigationProp = NativeStackNavigationProp<RootStackParamList, 'PolicyInfo'>;

// 더미 정책 데이터
const policyData = [
  {
    id: 1,
    title: '다회용기 보증금제',
    description: '다회용기 사용을 장려하고 보증금을 통해 사용 촉진',
    icon: '📄',
    link: '링크',
  },
  {
    id: 2,
    title: '소각장 감축 정책',
    description: '소각장을 줄이고 재활용을 증진',
    icon: '♻️',
    link: '링크',
  },
  {
    id: 3,
    title: '재활용 분리수거 정책',
    description: '재활용 분리수거를 통한 자원 재활용 촉진',
    icon: '🗂️',
    link: '링크',
  },
  {
    id: 4,
    title: '친환경 포장재 사용 정책',
    description: '친환경 포장재 사용을 통한 환경 보호',
    icon: '🌱',
    link: '링크',
  },
];

function PolicyItem({ policy }: { policy: typeof policyData[0] }) {
  return (
    <View style={styles.policyItem}>
      <View style={styles.policyIconContainer}>
        <Text style={styles.policyIcon}>{policy.icon}</Text>
      </View>
      <View style={styles.policyContent}>
        <Text style={styles.policyTitle}>{policy.title}</Text>
        <Text style={styles.policyDescription}>{policy.description}</Text>
      </View>
      <TouchableOpacity style={styles.policyLink}>
        <Text style={styles.policyLinkText}>{policy.link}</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function PolicyInfo() {
  const navigation = useNavigation<PolicyInfoNavigationProp>();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* 상단 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>지역 정책 정보</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 지역/정책 요약 */}
        <View style={styles.summarySection}>
          <View style={styles.summaryContent}>
            <View style={styles.locationIconContainer}>
              <Text style={styles.locationIcon}>📍</Text>
            </View>
            <View style={styles.summaryText}>
              <Text style={styles.locationText}>서울시 강남구</Text>
              <Text style={styles.policyTypeText}>제로 웨이스트 정책</Text>
            </View>
          </View>
        </View>

        {/* 정책 목록 */}
        <View style={styles.policySection}>
          <Text style={styles.sectionTitle}>정책 목록</Text>
          <View style={styles.policyList}>
            {policyData.map((policy) => (
              <PolicyItem key={policy.id} policy={policy} />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* 하단 버튼들 */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.locationPolicyButton}>
          <Text style={styles.locationPolicyButtonText}>위치 기반 정책 보기</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.detailInfoButton}>
          <Text style={styles.detailInfoButtonText}>자세한 정보</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
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
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: "#000000",
  },
  headerTitle: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginRight: spacing.paddingSmall,
  },
  refreshButton: {
    padding: spacing.paddingSmall,
  },
  refreshIcon: {
    fontSize: spacing.iconSizeMedium,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  summarySection: {
    backgroundColor: colors.card,
    marginHorizontal: spacing.screenPaddingHorizontal,
    marginVertical: spacing.paddingMedium,
    padding: spacing.paddingLarge,
    borderRadius: spacing.borderRadiusLarge,
    ...shadows.card,
  },
  summaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.paddingMedium,
  },
  locationIcon: {
    fontSize: spacing.iconSizeLarge,
  },
  summaryText: {
    flex: 1,
  },
  locationText: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  policyTypeText: {
    ...typography.body1,
    color: colors.textSecondary,
  },
  policySection: {
    marginHorizontal: spacing.screenPaddingHorizontal,
    marginBottom: spacing.paddingMedium,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.paddingMedium,
  },
  policyList: {
    gap: spacing.paddingMedium,
  },
  policyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: spacing.paddingLarge,
    borderRadius: spacing.borderRadiusLarge,
    ...shadows.card,
  },
  policyIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.paddingMedium,
  },
  policyIcon: {
    fontSize: spacing.iconSizeMedium,
  },
  policyContent: {
    flex: 1,
  },
  policyTitle: {
    ...typography.body1,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  policyDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  policyLink: {
    paddingHorizontal: spacing.paddingMedium,
    paddingVertical: spacing.paddingSmall,
  },
  policyLinkText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  bottomButtons: {
    flexDirection: 'row',
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingVertical: spacing.paddingMedium,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  locationPolicyButton: {
    flex: 1,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.borderRadiusMedium,
    paddingVertical: spacing.paddingMedium,
    alignItems: 'center',
    marginRight: spacing.paddingSmall,
  },
  locationPolicyButtonText: {
    ...typography.body1,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  detailInfoButton: {
    flex: 1,
    backgroundColor: colors.textPrimary,
    borderRadius: spacing.borderRadiusMedium,
    paddingVertical: spacing.paddingMedium,
    alignItems: 'center',
    marginLeft: spacing.paddingSmall,
  },
  detailInfoButtonText: {
    ...typography.body1,
    color: colors.background,
    fontWeight: '600',
  },
}); 