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
  Campaign: undefined;
  CampaignDetail: undefined;
};

type CampaignDetailNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CampaignDetail'>;

// 더미 캠페인 상세 데이터
const campaignDetailData = {
  title: '캠페인 2023',
  subtitle: '지속 가능한 도시 만들기',
  images: [
    'https://via.placeholder.com/400x200/4CAF50/FFFFFF?text=Campaign+Image+1',
    'https://via.placeholder.com/400x200/81C784/FFFFFF?text=Campaign+Image+2',
    'https://via.placeholder.com/400x200/A5D6A7/FFFFFF?text=Campaign+Image+3',
  ],
  period: {
    start: '2023년 10월 1일',
    end: '2023년 11월 30일',
  },
  goal: '도시 환경 개선',
  description: '본 캠페인은 지역 주민들을 대상으로 지속 가능한 생활 방식을 장려합니다.',
  participationMethod: '온라인 설문조사에 참여하고 우리 지역 환경을 개선하고 보상이 가능합니다.',
  reward: '스타벅스 기프트 키',
  participants: 150,
};

function ImageCarousel({ images }: { images: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <View style={styles.imageCarouselContainer}>
      <Image
        source={{ uri: images[currentIndex] }}
        style={styles.campaignImage}
        resizeMode="cover"
      />
      <View style={styles.imageDots}>
        {images.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === currentIndex ? styles.activeDot : styles.inactiveDot,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

function InfoRow({ icon, title, content }: { icon: string; title: string; content: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoIcon}>{icon}</Text>
      <View style={styles.infoContent}>
        <Text style={styles.infoTitle}>{title}</Text>
        <Text style={styles.infoText}>{content}</Text>
      </View>
    </View>
  );
}

export default function CampaignDetail() {
  const navigation = useNavigation<CampaignDetailNavigationProp>();

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 상단 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>캠페인 상세페이지</Text>
        <View style={styles.headerRight}>
          <Text style={styles.timeText}>12:30</Text>
        </View>
      </View>

      {/* 네비게이션 바 */}
      <View style={styles.navigationBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.navigationTitle}>캠페인 상세</Text>
        <TouchableOpacity style={styles.backTextButton}>
          <Text style={styles.backText}>BACK</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 캠페인 개요 */}
        <View style={styles.overviewSection}>
          <View style={styles.overviewContent}>
            <Image
              source={{ uri: 'https://via.placeholder.com/60x60/4CAF50/FFFFFF?text=Logo' }}
              style={styles.campaignLogo}
            />
            <View style={styles.overviewText}>
              <Text style={styles.campaignTitle}>{campaignDetailData.title}</Text>
              <Text style={styles.campaignSubtitle}>{campaignDetailData.subtitle}</Text>
            </View>
          </View>
        </View>

        {/* 캠페인 이미지 */}
        <View style={styles.imageSection}>
          <ImageCarousel images={campaignDetailData.images} />
        </View>

        {/* 캠페인 설명 */}
        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>캠페인 설명</Text>
          <Text style={styles.sectionSubtitle}>자세한 설명을 확인하세요</Text>

          <View style={styles.descriptionContent}>
            <InfoRow
              icon="📅"
              title="기간"
              content={`${campaignDetailData.period.start} ~ ${campaignDetailData.period.end}`}
            />
            <InfoRow
              icon="🎯"
              title="캠페인 목표"
              content={campaignDetailData.goal}
            />
            <Text style={styles.descriptionText}>{campaignDetailData.description}</Text>
            <InfoRow
              icon="👤"
              title="참여 방법"
              content={campaignDetailData.participationMethod}
            />
          </View>
        </View>

        {/* 보상 정보 */}
        <View style={styles.rewardSection}>
          <Text style={styles.sectionTitle}>보상 정보</Text>
          <View style={styles.rewardContent}>
            <InfoRow
              icon="🎁"
              title="보상"
              content={campaignDetailData.reward}
            />
            <InfoRow
              icon="👥"
              title="참여자 수"
              content={`${campaignDetailData.participants}명`}
            />
          </View>
        </View>
      </ScrollView>

      {/* 하단 버튼들 */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.viewDetailsButton}>
          <Text style={styles.viewDetailsButtonText}>자세히 보기</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.participateButton}>
          <Text style={styles.participateButtonText}>참여하기</Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingVertical: spacing.paddingMedium,
    backgroundColor: colors.card,
    ...shadows.header,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    ...typography.body1,
    color: colors.textSecondary,
  },
  navigationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingVertical: spacing.paddingMedium,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  backButton: {
    padding: spacing.paddingSmall,
  },
  backButtonText: {
    fontSize: spacing.iconSizeLarge,
    color: colors.textPrimary,
  },
  navigationTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  backTextButton: {
    padding: spacing.paddingSmall,
  },
  backText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  overviewSection: {
    backgroundColor: colors.card,
    marginHorizontal: spacing.screenPaddingHorizontal,
    marginVertical: spacing.paddingMedium,
    padding: spacing.paddingLarge,
    borderRadius: spacing.borderRadiusLarge,
    ...shadows.card,
  },
  overviewContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  campaignLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: spacing.paddingMedium,
  },
  overviewText: {
    flex: 1,
  },
  campaignTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  campaignSubtitle: {
    ...typography.body1,
    color: colors.textSecondary,
  },
  imageSection: {
    marginHorizontal: spacing.screenPaddingHorizontal,
    marginBottom: spacing.paddingMedium,
  },
  imageCarouselContainer: {
    position: 'relative',
  },
  campaignImage: {
    width: '100%',
    height: 200,
    borderRadius: spacing.borderRadiusLarge,
  },
  imageDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: spacing.paddingMedium,
    left: 0,
    right: 0,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: spacing.xs,
  },
  activeDot: {
    backgroundColor: colors.primary,
  },
  inactiveDot: {
    backgroundColor: colors.divider,
  },
  descriptionSection: {
    backgroundColor: colors.card,
    marginHorizontal: spacing.screenPaddingHorizontal,
    marginBottom: spacing.paddingMedium,
    padding: spacing.paddingLarge,
    borderRadius: spacing.borderRadiusLarge,
    ...shadows.card,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.paddingMedium,
  },
  descriptionContent: {
    gap: spacing.paddingMedium,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoIcon: {
    fontSize: spacing.iconSizeLarge,
    marginRight: spacing.paddingSmall,
    marginTop: spacing.xs,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    ...typography.body1,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  infoText: {
    ...typography.body1,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  descriptionText: {
    ...typography.body1,
    color: colors.textSecondary,
    lineHeight: 20,
    marginTop: spacing.paddingSmall,
  },
  rewardSection: {
    backgroundColor: colors.card,
    marginHorizontal: spacing.screenPaddingHorizontal,
    marginBottom: spacing.paddingMedium,
    padding: spacing.paddingLarge,
    borderRadius: spacing.borderRadiusLarge,
    ...shadows.card,
  },
  rewardContent: {
    gap: spacing.paddingMedium,
  },
  bottomButtons: {
    flexDirection: 'row',
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingVertical: spacing.paddingMedium,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  viewDetailsButton: {
    flex: 1,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.borderRadiusMedium,
    paddingVertical: spacing.paddingMedium,
    alignItems: 'center',
    marginRight: spacing.paddingSmall,
  },
  viewDetailsButtonText: {
    ...typography.body1,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  participateButton: {
    flex: 1,
    backgroundColor: colors.textPrimary,
    borderRadius: spacing.borderRadiusMedium,
    paddingVertical: spacing.paddingMedium,
    alignItems: 'center',
    marginLeft: spacing.paddingSmall,
  },
  participateButtonText: {
    ...typography.body1,
    color: colors.background,
    fontWeight: '600',
  },
}); 