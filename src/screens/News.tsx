import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';
import { shadows } from '../styles/shadows';
import { CampaignData, getCampaignList } from '../services/newsService';

type RootStackParamList = {
  Campaign: undefined;
  CampaignDetail: { articleId: string; title?: string };
};

type CampaignNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Campaign'>;

// 제목에 줄바꿈을 추가하는 함수
function addLineBreaksToTitle(title: string): string {
  // 문장 끝에 마침표, 느낌표, 물음표가 있으면 줄바꿈 추가
  return title.replace(/([.!?])\s+/g, '$1\n');
}

function CampaignListItem({ campaign }: { campaign: CampaignData }) {
  const navigation = useNavigation<CampaignNavigationProp>();

  return (
    <View style={styles.listItemContainer}>
      <TouchableOpacity
        style={styles.listItem}
        onPress={() => navigation.navigate('CampaignDetail', { articleId: campaign.id, title: campaign.title })}
      >
        <Image source={{ uri: campaign.thumbnail }} style={styles.listItemThumbnail} resizeMode="cover" />
        <View style={styles.listItemContent}>
          <Text style={styles.listItemTitle}>{addLineBreaksToTitle(campaign.title)}</Text>
        </View>
      </TouchableOpacity>
      <View style={styles.divider} />
    </View>
  );
}

export default function Campaign() {
  const navigation = useNavigation<CampaignNavigationProp>();
  const [campaigns, setCampaigns] = useState<CampaignData[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getCampaignList();
        if (mounted) setCampaigns(data);
      } catch (e) {
        if (mounted) setError('캠페인 데이터를 불러오지 못했습니다');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      {/* 상단 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>서울시 환경 뉴스</Text>
        <View style={styles.backButton} />
      </View>

      {/* 캠페인 리스트 */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {loading && (
          <View style={styles.centered}>
            <ActivityIndicator color={colors.primary} />
          </View>
        )}
        {error && !loading && (
          <View style={styles.centered}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        {!loading && !error && campaigns && campaigns.length === 0 && (
          <View style={styles.centered}>
            <Text style={styles.emptyText}>표시할 캠페인이 없습니다</Text>
          </View>
        )}
        {!loading && !error && campaigns && campaigns.length > 0 && (
          <View style={styles.listContainer}>
            {campaigns.map((campaign) => (
              <CampaignListItem key={campaign.id} campaign={campaign} />
            ))}
          </View>
        )}
      </ScrollView>
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
  scrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContainer: {
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingVertical: spacing.paddingMedium,
    gap: spacing.paddingSmall,
  },
  listItemContainer: {
    marginBottom: spacing.xs,
  },
  listItem: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: spacing.borderRadiusLarge,
    padding: spacing.paddingSmall,
    alignItems: 'center',
    ...shadows.card,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginTop: spacing.paddingSmall,
    marginHorizontal: spacing.paddingLarge,
  },
  listItemThumbnail: {
    width: 90,
    height: 90,
    borderRadius: spacing.borderRadiusMedium,
    marginRight: spacing.paddingLarge,
    backgroundColor: colors.divider,
    marginBottom: 4,
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '500',
    marginBottom: spacing.xs,
    marginLeft: 4,
  },
  centered: {
    padding: spacing.paddingLarge,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    ...typography.body1,
    color: 'red',
  },
  emptyText: {
    ...typography.body1,
    color: colors.textSecondary,
  },
}); 