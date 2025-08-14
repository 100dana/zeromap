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
  Home: undefined;
  Campaign: undefined;
  CampaignDetail: { articleId: string; title?: string };
};

type CampaignNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Campaign'>;

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
          <Text style={styles.listItemTitle}>{campaign.title}</Text>
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
      {/* 제목 */}
      <View style={styles.titleContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>서울시 환경 뉴스</Text>
        <View style={styles.titleRight} />
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
  titleContainer: {
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingTop: 12,
    paddingBottom: spacing.paddingMedium,
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
    padding: spacing.paddingMedium,
    alignItems: 'center',
    ...shadows.card,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginTop: spacing.paddingMedium,
    marginHorizontal: spacing.paddingLarge,
  },
  listItemThumbnail: {
    width: 80,
    height: 80,
    borderRadius: spacing.borderRadiusMedium,
    marginRight: spacing.paddingMedium,
    backgroundColor: colors.divider,
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    ...typography.body1,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.xs,
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