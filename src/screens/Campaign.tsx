import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';
import { shadows } from '../styles/shadows';

type RootStackParamList = {
  Home: undefined;
  Campaign: undefined;
  CampaignDetail: undefined;
};

type CampaignNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Campaign'>;

// 더미 캠페인 데이터
const campaignData = [
  {
    id: 1,
    region: '지역 A',
    title: '환경 보호 캠페인',
    date: '2023년 10월 1일...',
    thumbnail: 'https://via.placeholder.com/150x100/4CAF50/FFFFFF?text=Campaign+1',
  },
  {
    id: 2,
    region: '지역 B',
    title: '지역 복원 캠페인',
    date: '2023년 9월 15일...',
    thumbnail: 'https://via.placeholder.com/150x100/81C784/FFFFFF?text=Campaign+2',
  },
  {
    id: 3,
    region: '지역 C',
    title: '건강 증진 캠페인',
    date: '2023년 7월 10일...',
    thumbnail: 'https://via.placeholder.com/150x100/A5D6A7/FFFFFF?text=Campaign+3',
  },
  {
    id: 4,
    region: '지역 D',
    title: '문화 행사 캠페인',
    date: '2023년 9월 1일~...',
    thumbnail: 'https://via.placeholder.com/150x100/C8E6C9/FFFFFF?text=Campaign+4',
  },
  {
    id: 5,
    region: '지역 E',
    title: '교육 지원 캠페인',
    date: '2023년 8월 20일...',
    thumbnail: 'https://via.placeholder.com/150x100/4CAF50/FFFFFF?text=Campaign+5',
  },
  {
    id: 6,
    region: '지역 F',
    title: '기술 혁신 캠페인',
    date: '2023년 11월 1일...',
    thumbnail: 'https://via.placeholder.com/150x100/81C784/FFFFFF?text=Campaign+6',
  },
];

function CampaignCard({ campaign }: { campaign: typeof campaignData[0] }) {
  const navigation = useNavigation<CampaignNavigationProp>();

  return (
    <View style={styles.campaignCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.regionLabel}>{campaign.region}</Text>
      </View>
      <Image
        source={{ uri: campaign.thumbnail }}
        style={styles.campaignThumbnail}
        resizeMode="cover"
      />
      <View style={styles.cardContent}>
        <Text style={styles.campaignTitle}>{campaign.title}</Text>
        <Text style={styles.campaignDate}>{campaign.date}</Text>
      </View>
      <TouchableOpacity
        style={styles.participateButton}
        onPress={() => navigation.navigate('CampaignDetail')}
      >
        <Text style={styles.participateButtonText}>참여하기</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function Campaign() {
  const navigation = useNavigation<CampaignNavigationProp>();

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 제목 */}
      <View style={styles.titleContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>진행중인 캠페인</Text>
        <View style={styles.titleRight} />
      </View>

      {/* 캠페인 그리드 */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.campaignGrid}>
          {campaignData.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </View>
      </ScrollView>

      {/* 하단 버튼들 */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterButtonText}>필터</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addCampaignButton}>
          <Text style={styles.addCampaignButtonText}>캠페인 추가하기</Text>
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
  titleContainer: {
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingVertical: spacing.paddingMedium,
    backgroundColor: colors.card,
    borderBottomWidth: 2,
    borderBottomColor: colors.divider,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: spacing.paddingSmall,
  },
  backButtonText: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  titleRight: {
    width: spacing.paddingSmall,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  campaignGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingVertical: spacing.paddingMedium,
  },
  campaignCard: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: spacing.borderRadiusLarge,
    marginBottom: spacing.paddingMedium,
    marginHorizontal: '1%',
    padding: spacing.paddingMedium,
    ...shadows.card,
  },
  cardHeader: {
    marginBottom: spacing.paddingSmall,
  },
  regionLabel: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  campaignThumbnail: {
    width: '100%',
    height: 100,
    borderRadius: spacing.borderRadiusMedium,
    marginBottom: spacing.paddingSmall,
  },
  cardContent: {
    marginBottom: spacing.paddingSmall,
  },
  campaignTitle: {
    ...typography.body1,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  campaignDate: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  participateButton: {
    backgroundColor: colors.primary,
    borderRadius: spacing.borderRadiusMedium,
    paddingVertical: spacing.paddingSmall,
    alignItems: 'center',
  },
  participateButtonText: {
    ...typography.caption,
    color: colors.background,
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
  filterButton: {
    flex: 1,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.borderRadiusMedium,
    paddingVertical: spacing.paddingMedium,
    alignItems: 'center',
    marginRight: spacing.paddingSmall,
  },
  filterButtonText: {
    ...typography.body1,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  addCampaignButton: {
    flex: 1,
    backgroundColor: colors.textPrimary,
    borderRadius: spacing.borderRadiusMedium,
    paddingVertical: spacing.paddingMedium,
    alignItems: 'center',
    marginLeft: spacing.paddingSmall,
  },
  addCampaignButtonText: {
    ...typography.body1,
    color: colors.background,
    fontWeight: '600',
  },
}); 