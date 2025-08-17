import React, { useEffect, useState } from "react";
import { 
  View, 
  ScrollView, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Image,
  StatusBar
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import BottomTabBar from '../components/BottomTabBar';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';
import { shadows } from '../styles/shadows';
import displayUserName from "../components/UserDisplay";
import { AuthService } from "../services/authService";
import firestore from '@react-native-firebase/firestore';
import firestoreService from '../services/firestoreService';

type RootStackParamList = {
  Home: undefined;
  Map: undefined;
  MyPage: undefined;
  Campaign: undefined;
  PolicyInfo: undefined;
  SignIn: undefined;
  MyReview: undefined;
  FavoritePlaces: undefined;
};

// 찜한 장소 데이터 타입 정의
interface FavoritePlaceData {
  id: string;
  name: string;
  address: string;
  category: string;
  description?: string;
  image?: string;
  favoriteId: string;
}

// 리뷰 데이터 타입 정의
interface ReviewData {
  id: string;
  placeName: string;
  content: string;
  rating: number;
  createdAt: any;
}

const defaultUserData = {
  avatar: "https://via.placeholder.com/60x60/4CAF50/FFFFFF?text=User"
};

function SavedPlaceCard({ place }: { place: FavoritePlaceData }) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case '제로식당':
        return '🍽️';
      case '제로웨이스트샵':
        return '🛒';
      case '리필스테이션':
        return '🚰';
      default:
        return '🏠';
    }
  };

  return (
    <View style={styles.savedPlaceCard}>
      <Image 
        source={{ uri: place.image || "https://via.placeholder.com/120x80/4CAF50/FFFFFF?text=Image" }}
        style={styles.placeImage}
        resizeMode="cover"
      />
      <View style={styles.categoryIcon}>
        <Text style={styles.categoryIconText}>{getCategoryIcon(place.category)}</Text>
      </View>
      <View style={styles.placeInfo}>
        <Text style={styles.placeName}>{place.name}</Text>
        <Text style={styles.placeAddress}>{place.address}</Text>
      </View>
    </View>
  );
}

function ReviewedPlaceItem({ place, onPress }: { place: ReviewData; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.reviewedPlaceItem} onPress={onPress}>
      <View style={styles.placeIcon}>
        <Text style={styles.placeIconText}>🏠</Text>
      </View>
      <View style={styles.reviewedPlaceInfo}>
        <Text style={styles.reviewedPlaceName}>{place.placeName}</Text>
        <View style={styles.ratingContainer}>
          <Text style={styles.star}>⭐</Text>
          <Text style={styles.ratingText}>{place.rating} stars</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function MyPage() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'MyPage'>>();
  const [userName, setUserName] = useState("사용자");
  const [userReviews, setUserReviews] = useState<ReviewData[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [favoritePlaces, setFavoritePlaces] = useState<FavoritePlaceData[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const currentUser = AuthService.getCurrentUser();
        if (currentUser) {
          const name = await displayUserName(currentUser.uid);
          setUserName(name);
          
          // 서브컬렉션에서 사용자 리뷰 데이터 로드
          const reviewsSnapshot = await firestore()
            .collection('users')
            .doc(currentUser.uid)
            .collection('reviews')
            .orderBy('createdAt', 'desc')
            .get();
          
          const reviews = reviewsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as ReviewData[];
          
          setUserReviews(reviews);

          try {
            const favorites = await firestoreService.getFavoritePlaces(5);
            setFavoritePlaces(favorites);
          } catch (error) {
            console.error('찜한 장소 로드 오류:', error);
            setFavoritePlaces([]);
          }
        }
      } catch (error) {
        console.error('사용자 데이터 로드 오류:', error);
      } finally {
        setLoadingReviews(false);
        setLoadingFavorites(false);
      }
    };
    loadUserData();
  }, []);

  const handleLogout = () => {
    try {
      AuthService.signOut();
      navigation.navigate('SignIn');
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  };

  const handleSavedPlaces = () => {
    navigation.navigate('FavoritePlaces');
  };

  const handleReviews = () => {
    navigation.navigate('MyReview');
  };

  const handleViewPolicyInfo = () => {
    navigation.navigate('PolicyInfo');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      {/* 상단 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>마이페이지</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* 사용자 정보 섹션 */}
        <View style={styles.userSection}>
          <Image 
            source={{ uri: defaultUserData.avatar }}
            style={styles.userAvatar}
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{userName}</Text>
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
              onPress={handleSavedPlaces}
            >
              <Text style={styles.viewMoreText}>자세히 보기 {'>'}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.savedPlacesContainer}>
            {loadingFavorites ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>찜한 장소를 불러오는 중...</Text>
              </View>
            ) : favoritePlaces.length > 0 ? (
              favoritePlaces.map((place) => (
                <SavedPlaceCard key={place.id} place={place} />
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>찜한 장소가 없습니다.</Text>
              </View>
            )}
          </View>
        </View>

        {/* 리뷰한 장소 목록 섹션 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>리뷰한 장소 목록</Text>
            </View>
            <TouchableOpacity
              style={styles.viewMoreButton}
              onPress={handleReviews}
            >
              <Text style={styles.viewMoreText}>자세히 보기 {'>'}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.reviewedPlacesContainer}>
            {loadingReviews ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>리뷰를 불러오는 중...</Text>
              </View>
            ) : userReviews.length > 0 ? (
              userReviews.map((review) => (
                <ReviewedPlaceItem 
                  key={review.id} 
                  place={review} 
                  onPress={handleReviews}
                />
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>작성한 리뷰가 없습니다.</Text>
              </View>
            )}
          </View>
        </View>

        {/* 지역 정책 정보 섹션 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>지역 정책 정보</Text>
              <Text style={styles.sectionSubtitle}>우리 구의 정책 알아보기</Text>
            </View>
            <TouchableOpacity
              style={styles.viewMoreButton}
              onPress={handleViewPolicyInfo}
            >
              <Text style={styles.viewMoreText}>자세히 보기 {'>'}</Text>
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
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingTop: 12,
    paddingBottom: spacing.paddingMedium,
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
    textAlign: 'center',
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
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
    marginHorizontal: 16,
    backgroundColor: "#00000016",
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
    backgroundColor: "#F8F8F8",
    paddingHorizontal: 18,
    paddingVertical: 6,
    marginRight: 6,
    borderRadius: 6,
  },
  logoutButtonText: {
    fontSize: 14,
    color: "#666666",
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
    paddingHorizontal: 8,
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
    marginHorizontal: 8,
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
    paddingHorizontal: 20,
  },
  placeIcon: {
    width: 32,
    height: 32,
    backgroundColor: "#E0E0E0",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
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
    marginBottom: 4,
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
  policyInfoContainer: {
    gap: 12,
  },
  policyInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 20,
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
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#666666',
  },
  emptyContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#666666',
  },
}); 