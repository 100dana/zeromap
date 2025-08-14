import React from "react";
import { SafeAreaView, View, ScrollView, Image, Text, ImageBackground, TouchableOpacity, StyleSheet } from "react-native";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { WebView } from 'react-native-webview';
import KakaoMap from '../components/KakaoMap';
import BottomTabBar from '../components/BottomTabBar';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';
import { shadows } from '../styles/shadows';

type RootStackParamList = {
  Home: undefined;
  Map: undefined;
  Campaign: undefined;
};

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};


//더미 데이터로 하드코딩함
const shopData = [
  {
    tag: "인기",
    name: "Zero Waste Store",
    address: "서울시 종로구 홍파동",
    type: "비건 레스토랑",
    tagColor: "#0000000D",
    tagMargin: 48,
    paddingBottom: 72,
  },
  {
    tag: "신규",
    name: "Eco-friendly Cafe",
    address: "서울시 용산구 숙명동",
    type: "리필 스테이션",
    tagColor: "#0000000D",
    tagMargin: 48,
    paddingBottom: 75,
  },
];

type ShopCardProps = {
  tag: string;
  name: string;
  address: string;
  type: string;
  tagColor: string;
  tagMargin: number;
  paddingBottom: number;
};

function ShopCard({ tag, name, address, type, tagColor, tagMargin, paddingBottom, style }: ShopCardProps & { style?: any }) {
  return (
    <View style={[styles.shopCard, style]}>
      <View style={[styles.shopCardHeader, { backgroundColor: tagColor, paddingBottom }]}> 
        <TouchableOpacity
          style={[styles.shopTag, { backgroundColor: tagColor, marginBottom: tagMargin }]}
          onPress={() => {}}
          accessibilityLabel={`${tag} 태그 버튼`}
        >
          <Text style={styles.shopTagText}>{tag}</Text>
        </TouchableOpacity>
        <Text style={styles.shopName}>{name}</Text>
      </View>
      <View style={styles.shopCardFooter}>
        <Text style={styles.shopAddress}>{address}</Text>
        <Text style={styles.shopType}>{type}</Text>
      </View>
    </View>
  );
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const handleMarkerPress = (place: PlaceData) => {
    // 마커 클릭 처리
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>{"Zero Map : 제로 맵"}</Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.locationContainer}
          onPress={() => navigation.navigate('Map')}
          accessibilityLabel="지도 화면으로 이동"
        >
          <View style={styles.mapPreviewContainer}>
            <KakaoMap 
              places={[]} // 빈 배열로 설정 (홈 화면에서는 마커 없음)
              opacity={0.8} // 80% 투명도 적용
              onMarkerClick={(place) => {
                // 여기서 상세 페이지로 이동하거나 다른 액션 수행
              }}
            />
            {/* 자세히 보기 오버레이 */}
            <View style={styles.mapOverlay}>
              <Text style={styles.mapOverlayText}>자세히 보기</Text>
            </View>
          </View>
        </TouchableOpacity>
        <Text style={styles.recommendTitle}>{"추천 : 신규 등록 제로웨이스트 샵"}</Text>
        <View style={styles.shopRow}>
          {shopData.map((shop, idx) => (
            //@ts-ignore
            <ShopCard
              {...shop}
              style={idx === shopData.length - 1 ? styles.noMarginRight : undefined}
              key={idx}
              //런타임에 오류없는, 타입 체크 오류 무시
            />
          ))}
        </View>
        
        {/* 캠페인 섹션 */}
        <View style={styles.campaignSection}>
          <Text style={styles.campaignTitle}>{"진행 중인 캠페인"}</Text>
          <TouchableOpacity
            style={styles.campaignButton}
            onPress={() => navigation.navigate('Campaign')}
            accessibilityLabel="캠페인 화면으로 이동"
          >
            <Text style={styles.campaignButtonText}>캠페인 보기</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <BottomTabBar currentRoute="Home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    backgroundColor: colors.card,
    marginBottom: spacing.md,
    marginHorizontal: spacing.screenPaddingHorizontal,
    paddingVertical: spacing.paddingMedium,
    paddingHorizontal: spacing.paddingLarge,
    borderRadius: spacing.borderRadiusLarge,
    ...shadows.card,
  },
  headerImage: {
    height: 24,
  },
  headerTitle: {
    ...typography.h2,
    textAlign: "center",
  },
  locationContainer: {
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadiusLarge,
    paddingVertical: spacing.paddingMedium,
    marginBottom: spacing.elementSpacing,
    marginHorizontal: spacing.screenPaddingHorizontal,
    ...shadows.card,
  },
  mapPreviewContainer: {
    height: 200,
    borderRadius: spacing.borderRadiusLarge,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    position: 'relative', // 오버레이를 위한 상대 위치 설정
  },
  locationImageBg: {
    borderRadius: 6,
  },
  locationImageBgWrap: {
    alignItems: "center",
    paddingVertical: 144,
    paddingHorizontal: 16,
  },
  locationIcon: {
    borderRadius: 6,
    width: 24,
    height: 24,
    marginBottom: 8,
  },
  locationText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  recommendTitle: {
    ...typography.h3,
    textAlign: "center",
    marginTop: spacing.elementSpacingLarge,
    marginBottom: spacing.elementSpacing,
    marginHorizontal: spacing.screenPaddingHorizontal,
  },
  shopRow: {
    flexDirection: "row",
    marginBottom: spacing.elementSpacing,
    marginHorizontal: spacing.screenPaddingHorizontal,
    // gap: 8, // RN 0.71+ 지원시 사용
  },
  shopCard: {
    flex: 1,
    borderColor: colors.border,
    borderRadius: spacing.borderRadiusLarge,
    borderWidth: 1,
    marginRight: spacing.elementSpacingSmall,
    backgroundColor: colors.card,
    overflow: "hidden",
    minWidth: 0, // flexbox shrink 방지
    ...shadows.card,
  },
  shopCardHeader: {
    backgroundColor: colors.surface,
    // paddingBottom: 72, // dynamic
  },
  shopTag: {
    borderTopLeftRadius: spacing.borderRadiusLarge,
    borderBottomRightRadius: spacing.borderRadiusLarge,
    padding: spacing.paddingSmall,
    // marginBottom: 48, // dynamic
    alignSelf: "flex-start",
  },
  shopTagText: {
    ...typography.caption,
    fontWeight: "bold",
  },
  shopName: {
    ...typography.h4,
    marginHorizontal: spacing.paddingLarge,
  },
  shopCardFooter: {
    paddingVertical: spacing.paddingMedium,
  },
  shopAddress: {
    ...typography.caption,
    marginBottom: spacing.xs,
    marginLeft: spacing.paddingMedium,
  },
  shopType: {
    ...typography.h4,
    marginLeft: spacing.paddingMedium,
  },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 26,
    shadowColor: "#0000001C",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 6,
    elevation: 6,
  },
  bottomNavItem: {
    flex: 1,
    alignItems: "center",
    padding: 4,
  },
  bottomNavIcon: {
    color: "#000000",
    fontSize: 20,
  },
  bottomNavLabel: {
    color: "#000000",
    fontSize: 10,
    textAlign: "center",
  },
  noMarginRight: {
    marginRight: 0,
  },
  campaignSection: {
    backgroundColor: colors.card,
    marginHorizontal: spacing.screenPaddingHorizontal,
    marginBottom: spacing.elementSpacing,
    paddingVertical: spacing.paddingLarge,
    paddingHorizontal: spacing.paddingLarge,
    borderRadius: spacing.borderRadiusLarge,
    ...shadows.card,
  },
  campaignTitle: {
    ...typography.h3,
    textAlign: "center",
    marginBottom: spacing.paddingMedium,
  },
  campaignButton: {
    backgroundColor: colors.primary,
    borderRadius: spacing.borderRadiusMedium,
    paddingVertical: spacing.paddingMedium,
    alignItems: "center",
  },
  campaignButtonText: {
    ...typography.body1,
    color: colors.background,
    fontWeight: "600",
  },
  mapOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)', // 배경 오버레이 (매우 연한)
  },
  mapOverlayText: {
    ...typography.body1,
    color: colors.primary,
    fontWeight: 'bold',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: spacing.borderRadiusSmall,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});