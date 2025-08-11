import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';
import { shadows } from '../styles/shadows';
import { getCampaignFromFirebase } from '../services/newsService';
import { firestore } from '../services/firebaseConfig';

type RootStackParamList = {
  Campaign: undefined;
  CampaignDetail: { articleId: string; title?: string };
};

type CampaignDetailNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CampaignDetail'>;

const { width: screenWidth } = Dimensions.get('window');

function ImageGallery({ images }: { images: string[] }) {
  const [imageHeights, setImageHeights] = useState<{ [key: number]: number }>({});

  const onImageLoad = (index: number, event: any) => {
    const { width, height } = event.nativeEvent;
    const imageWidth = screenWidth - (spacing.screenPaddingHorizontal) - (spacing.paddingLarge);
    const imageHeight = (height / width) * imageWidth;
    setImageHeights(prev => ({
      ...prev,
      [index]: imageHeight
    }));
  };

  return (
    <View style={styles.imageGalleryContainer}>
      {images.map((imageUrl, index) => (
        <View key={index} style={styles.imageItem}>
          <Image
            source={{ uri: imageUrl }}
            style={[
              styles.galleryImage,
              { height: imageHeights[index] || 450 }
            ]}
            resizeMode="contain"
            onLoad={(event) => onImageLoad(index, event)}
          />
        </View>
      ))}
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
  const route = useRoute();
  const params = route.params as { articleId: string; title?: string } | undefined;
  const articleId = params?.articleId ?? '';
  const headerTitle = params?.title ?? '캠페인 상세페이지';
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actualTitle, setActualTitle] = useState<string>(headerTitle);

  useEffect(() => {
    let mounted = true;
    (async () => {
              try {
          if (!articleId) {
            setImages([]);
            return;
          }
          
          // Firestore에서 실제 제목 가져오기
          try {
            console.log(`[NewsDetail] Firestore 조회 시도: articleId = ${articleId}`);
            
            if (firestore && typeof firestore === 'function') {
              const firestoreInstance = firestore();
              if (firestoreInstance && firestoreInstance.collection) {
                const articleDoc = await firestoreInstance.collection('articles').doc(articleId).get();
                console.log(`[NewsDetail] Firestore 문서 존재 여부: ${articleDoc.exists}`);
                if (articleDoc.exists) {
                  const data = articleDoc.data();
                  console.log(`[NewsDetail] Firestore 문서 데이터:`, data);
                  const title = data?.title || headerTitle;
                  console.log(`[NewsDetail] 최종 제목: ${title}`);
                  if (mounted) setActualTitle(title);
                } else {
                  console.log(`[NewsDetail] Firestore 문서가 존재하지 않음: ${articleId}`);
                  if (mounted) setActualTitle(headerTitle);
                }
              } else {
                console.log(`[NewsDetail] Firestore 인스턴스가 올바르지 않음`);
                if (mounted) setActualTitle(headerTitle);
              }
            } else {
              console.log(`[NewsDetail] Firestore가 초기화되지 않음`);
              if (mounted) setActualTitle(headerTitle);
            }
          } catch (firestoreError) {
            console.log('[NewsDetail] Firestore에서 제목 가져오기 실패:', firestoreError);
            if (mounted) setActualTitle(headerTitle);
          }
          
          const urls = await getCampaignFromFirebase(articleId);
          if (mounted) setImages(urls);
        } catch (e) {
          if (mounted) setError('이미지를 불러오지 못했습니다');
        } finally {
          if (mounted) setLoading(false);
        }
    })();
    return () => {
      mounted = false;
    };
  }, [articleId]);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 상단 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{actualTitle}</Text>
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
        <Text style={styles.navigationTitle}>뉴스 상세</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.overviewSection}>
          <View style={styles.overviewContent}>
            <Image
              source={{ uri: 'https://via.placeholder.com/60x60/4CAF50/FFFFFF?text=News' }}
              style={styles.campaignLogo}
            />
            <View style={styles.overviewText}>
              <Text style={styles.campaignTitle}>{actualTitle}</Text>
              <Text style={styles.campaignSubtitle}>제목: {actualTitle}</Text>
            </View>
          </View>
        </View>

        {/* 뉴스 설명 */}
        <View style={styles.descriptionSection}>
          <View style={styles.descriptionContent}>
            <InfoRow
              icon="📅"
              title="게시일"
              content={`2024년 1월 15일`}
            />
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingSection}>
            <Text style={styles.loadingText}>이미지 로딩중…</Text>
          </View>
        ) : error ? (
          <View style={styles.errorSection}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : images.length > 0 ? (
          <ImageGallery images={images} />
        ) : (
          <View style={styles.noImageSection}>
            <Text style={styles.noImageText}>이미지가 없습니다</Text>
          </View>
        )}
        
        <View style={styles.additionalInfoSection}>
          <Text style={styles.sectionTitle}>추가 정보</Text>
          <View style={styles.additionalContent}>
            <InfoRow
              icon="🔗"
              title="원문 링크"
              content={'서울시 환경뉴스 홈페이지'}
            />
            <InfoRow
              icon="📞"
              title="문의처"
              content={'서울시 환경정책과 02-2133-0000'}
            />
          </View>
        </View>
      </ScrollView>

      {/* 하단 버튼들 */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.viewDetailsButton}>
          <Text style={styles.viewDetailsButtonText}>원문 보기</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.participateButton}>
          <Text style={styles.participateButtonText}>공유하기</Text>
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
  descriptionSection: {
    backgroundColor: colors.card,
    marginHorizontal: spacing.screenPaddingHorizontal,
    marginBottom: spacing.paddingMedium,
    padding: spacing.paddingLarge,
    borderRadius: spacing.borderRadiusLarge,
    ...shadows.card,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.paddingMedium,
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
  imageGalleryContainer: {
    backgroundColor: colors.card,
    marginHorizontal: spacing.screenPaddingHorizontal,
    marginBottom: spacing.paddingMedium,
    padding: spacing.paddingSmall, // 패딩을 줄여서 이미지를 더 크게 만듦
    borderRadius: spacing.borderRadiusLarge,
    ...shadows.card,
  },
  galleryTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  gallerySubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.paddingMedium,
  },
  imageItem: {
    marginBottom: spacing.paddingMedium,
  },
  galleryImage: {
    width: '100%',
    borderRadius: spacing.borderRadiusMedium,
    marginBottom: spacing.paddingSmall,
  },
  imageNumber: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  loadingSection: {
    backgroundColor: colors.card,
    marginHorizontal: spacing.screenPaddingHorizontal,
    marginBottom: spacing.paddingMedium,
    padding: spacing.paddingLarge,
    borderRadius: spacing.borderRadiusLarge,
    alignItems: 'center',
    ...shadows.card,
  },
  loadingText: {
    ...typography.body1,
    color: colors.textSecondary,
  },
  errorSection: {
    backgroundColor: colors.card,
    marginHorizontal: spacing.screenPaddingHorizontal,
    marginBottom: spacing.paddingMedium,
    padding: spacing.paddingLarge,
    borderRadius: spacing.borderRadiusLarge,
    alignItems: 'center',
    ...shadows.card,
  },
  errorText: {
    ...typography.body1,
    color: colors.error,
  },
  noImageSection: {
    backgroundColor: colors.card,
    marginHorizontal: spacing.screenPaddingHorizontal,
    marginBottom: spacing.paddingMedium,
    padding: spacing.paddingLarge,
    borderRadius: spacing.borderRadiusLarge,
    alignItems: 'center',
    ...shadows.card,
  },
  noImageText: {
    ...typography.body1,
    color: colors.textSecondary,
  },
  additionalInfoSection: {
    backgroundColor: colors.card,
    marginHorizontal: spacing.screenPaddingHorizontal,
    marginBottom: spacing.paddingMedium,
    padding: spacing.paddingLarge,
    borderRadius: spacing.borderRadiusLarge,
    ...shadows.card,
  },
  additionalContent: {
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