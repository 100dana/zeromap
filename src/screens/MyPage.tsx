import React from "react";
import { 
  SafeAreaView, 
  View, 
  ScrollView, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Image 
} from "react-native";
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import BottomTabBar from '../components/BottomTabBar';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';
import { shadows } from '../styles/shadows';

type RootStackParamList = {
  Home: undefined;
  Map: undefined;
  MyPage: undefined;
  Campaign: undefined;
  PolicyInfo: undefined;
};

// 가데이터
const userData = {
  name: "사용자 이름",
  level: 3,
  points: 1200,
  avatar: "https://via.placeholder.com/80x80/4CAF50/FFFFFF?text=User"
};

const savedPlaces = [
  {
    id: 1,
    name: "장소이름",
    category: "제로웨이스트샵",
    address: "서울시 종로구 송월길",
    image: "https://via.placeholder.com/120x80/4CAF50/FFFFFF?text=Image",
    icon: "🛒"
  },
  {
    id: 2,
    name: "장소이름",
    category: "리필스테이션",
    address: "서울시 종로구 송월길",
    image: "https://via.placeholder.com/120x80/4CAF50/FFFFFF?text=Image"
  }
];

const reviewedPlaces = [
  {
    id: 1,
    name: "장소 이름",
    review: "왜 좋았는지... 어쩌구 저쩌구",
    rating: 4
  },
  {
    id: 2,
    name: "장소 이름",
    review: "왜 좋았는지... 어쩌구 저쩌구",
    rating: 4
  }
];

const campaigns = [
  {
    id: 1,
    name: "캠페인 이름"
  },
  {
    id: 2,
    name: "캠페인 이름"
  }
];

function SavedPlaceCard({ place }: { place: typeof savedPlaces[0] }) {
  return (
    <View style={styles.savedPlaceCard}>
      <Image 
        source={{ uri: place.image }}
        style={styles.placeImage}
        resizeMode="cover"
      />
      {place.icon && (
        <View style={styles.categoryIcon}>
          <Text style={styles.categoryIconText}>{place.icon}</Text>
        </View>
      )}
      <View style={styles.placeInfo}>
        <Text style={styles.placeName}>{place.name}</Text>
        <Text style={styles.placeAddress}>{place.address}</Text>
      </View>
    </View>
  );
}

function ReviewedPlaceItem({ place }: { place: typeof reviewedPlaces[0] }) {
  return (
    <View style={styles.reviewedPlaceItem}>
      <View style={styles.placeIcon}>
        <Text style={styles.placeIconText}>🏠</Text>
      </View>
      <View style={styles.reviewedPlaceInfo}>
        <Text style={styles.reviewedPlaceName}>{place.name}</Text>
        <Text style={styles.reviewText}>{place.review}</Text>
        <View style={styles.ratingContainer}>
          <Text style={styles.star}>⭐</Text>
          <Text style={styles.ratingText}>{place.rating} stars</Text>
        </View>
      </View>
    </View>
  );
}

function CampaignItem({ campaign }: { campaign: typeof campaigns[0] }) {
  return (
    <View style={styles.campaignItem}>
      <Text style={styles.campaignIcon}>⭐</Text>
      <Text style={styles.campaignName}>{campaign.name}</Text>
    </View>
  );
}

export default function MyPage() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'MyPage'>>();

  const handleLogout = () => {
    // TODO: 로그아웃 기능
    console.log('로그아웃');
  };

  const handleSettings = () => {
    // TODO: 설정 화면으로 이동
    console.log('설정');
  };

  const handleNotifications = () => {
    // TODO: 알림 설정
    console.log('알림');
  };

  const handleViewSavedPlaces = () => {
    // TODO: 저장된 장소 목록 화면으로 이동
    console.log('저장된 장소 보기');
  };

  const handleViewReviews = () => {
    // TODO: 리뷰 목록 화면으로 이동
    console.log('리뷰 보기');
  };

  const handleViewCampaigns = () => {
    navigation.navigate('Campaign');
  };

  const handleViewPolicyInfo = () => {
    navigation.navigate('PolicyInfo');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 상단 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>마이페이지</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.notificationButton}>
            <Text style={styles.notificationIcon}>🔔</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingsButton}>
            <Text style={styles.settingsIcon}>⚙</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* 사용자 정보 섹션 */}
        <View style={styles.userSection}>
          <Image 
            source={{ uri: userData.avatar }}
            style={styles.userAvatar}
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{userData.name}</Text>
            <Text style={styles.userLevel}>
              Level {userData.level} - {userData.points} Points
            </Text>
          </View>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutButtonText}>로그아웃</Text>
          </TouchableOpacity>
        </View>

        {/* 내가 찜/저장한 장소 섹션 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>내가 찜/저장한 장소</Text>
              <Text style={styles.sectionSubtitle}>최애 장소 탐방하기</Text>
            </View>
            <TouchableOpacity
              style={styles.viewMoreButton}
              onPress={handleViewSavedPlaces}
            >
              <Text style={styles.viewMoreText}>톺아보기 {'>'}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.savedPlacesContainer}>
            {savedPlaces.map((place) => (
              <SavedPlaceCard key={place.id} place={place} />
            ))}
          </View>
        </View>

        {/* 리뷰한 장소 목록 섹션 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>리뷰한 장소 목록</Text>
              <Text style={styles.sectionSubtitle}>Active Campaigns</Text>
            </View>
            <TouchableOpacity
              style={styles.viewMoreButton}
              onPress={handleViewReviews}
            >
              <Text style={styles.viewMoreText}>View Reviews {'>'}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.reviewedPlacesContainer}>
            {reviewedPlaces.map((place) => (
              <ReviewedPlaceItem key={place.id} place={place} />
            ))}
          </View>
        </View>

        {/* 참여한 캠페인 목록 섹션 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>참여한 캠페인 목록</Text>
              <Text style={styles.sectionSubtitle}>Active Campaigns</Text>
            </View>
            <TouchableOpacity
              style={styles.viewMoreButton}
              onPress={handleViewCampaigns}
            >
              <Text style={styles.viewMoreText}>View Campaigns {'>'}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.campaignsContainer}>
            {campaigns.map((campaign) => (
              <CampaignItem key={campaign.id} campaign={campaign} />
            ))}
          </View>
        </View>

        {/* 지역 정책 정보 섹션 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>지역 정책 정보</Text>
              <Text style={styles.sectionSubtitle}>Local Policy Information</Text>
            </View>
            <TouchableOpacity
              style={styles.viewMoreButton}
              onPress={handleViewPolicyInfo}
            >
              <Text style={styles.viewMoreText}>View Policy {'>'}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.policyInfoContainer}>
            <View style={styles.policyInfoItem}>
              <Text style={styles.policyIcon}>📋</Text>
              <Text style={styles.policyText}>서울시 강남구 제로 웨이스트 정책</Text>
            </View>
          </View>
        </View>
      </ScrollView>
      <BottomTabBar currentRoute="MyPage" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingVertical: spacing.paddingMedium,
    backgroundColor: colors.card,
    borderBottomWidth: 2,
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
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIcon: {
    padding: 8,
    marginLeft: 4,
  },
  headerIconText: {
    fontSize: 20,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  userSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 4,
  },
  userLevel: {
    fontSize: 14,
    color: "#666666",
  },
  logoutButton: {
    backgroundColor: "#F44336",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  logoutButtonText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  section: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: "#666666",
  },
  viewMoreButton: {
    padding: 8,
  },
  viewMoreText: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "500",
  },
  savedPlacesContainer: {
    flexDirection: "row",
    gap: 12,
  },
  savedPlaceCard: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  placeImage: {
    width: "100%",
    height: 80,
  },
  categoryIcon: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryIconText: {
    fontSize: 12,
  },
  placeInfo: {
    padding: 8,
  },
  placeName: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 2,
  },
  placeAddress: {
    fontSize: 10,
    color: "#666666",
  },
  reviewedPlacesContainer: {
    gap: 12,
  },
  reviewedPlaceItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  placeIcon: {
    width: 32,
    height: 32,
    backgroundColor: "#E0E0E0",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  placeIconText: {
    fontSize: 16,
  },
  reviewedPlaceInfo: {
    flex: 1,
  },
  reviewedPlaceName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 2,
  },
  reviewText: {
    fontSize: 12,
    color: "#666666",
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  star: {
    fontSize: 12,
    marginRight: 4,
  },
  ratingText: {
    fontSize: 12,
    color: "#666666",
  },
  campaignsContainer: {
    gap: 12,
  },
  campaignItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  campaignIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  campaignName: {
    fontSize: 14,
    color: "#000000",
  },
  policyInfoContainer: {
    gap: 12,
  },
  policyInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  policyIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  policyText: {
    fontSize: 14,
    color: "#000000",
  },
  notificationButton: {
    padding: 8,
    marginLeft: 4,
  },
  notificationIcon: {
    fontSize: 20,
  },
  settingsButton: {
    padding: 8,
    marginLeft: 4,
  },
  settingsIcon: {
    fontSize: 20,
  },
}); 