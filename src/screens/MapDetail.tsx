import React, { useState } from "react";
import { SafeAreaView, View, ScrollView, Image, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import KakaoMap from '../components/KakaoMap';

type RootStackParamList = {
  Home: undefined;
  Map: undefined;
  MapDetail: undefined;
  WriteReview: undefined;
};

// 가데이터
const placeData = {
  name: "제로웨이스트 마켓",
  isApproved: true,
  description: "친환경 제품을 판매하는 제로웨이스트 마켓입니다. 플라스틱 없는 생활을 위한 다양한 제품을 만나보세요.",
  address: "서울시 종로구 홍파동 123-45",
  images: [
    "https://via.placeholder.com/400x300/4CAF50/FFFFFF?text=제로웨이스트+마켓+1",
    "https://via.placeholder.com/400x300/81C784/FFFFFF?text=제로웨이스트+마켓+2",
    "https://via.placeholder.com/400x300/A5D6A7/FFFFFF?text=제로웨이스트+마켓+3",
  ],
  categories: ["제로웨이스트샵", "비건 식당"],
  reviews: [
    { user: "사용자1", text: "이 장소는 훌륭했습니다! 친환경 제품들이 정말 다양하고 품질도 좋아요.", rating: 5 },
    { user: "사용자2", text: "서비스가 아주 마음에 들어요. 직원들이 친절하고 설명도 잘해주세요.", rating: 4 },
    { user: "사용자3", text: "가격대비 만족도가 높습니다. 자주 방문하게 될 것 같아요.", rating: 5 },
  ]
};

function ImageSlider({ images }: { images: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <View style={styles.imageSliderContainer}>
      <Image 
        source={{ uri: images[currentIndex] }}
        style={styles.mainImage}
        resizeMode="cover"
      />
      <View style={styles.imageDots}>
        {images.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === currentIndex ? styles.activeDot : styles.inactiveDot
            ]}
          />
        ))}
      </View>
    </View>
  );
}

function CategoryTag({ label }: { label: string }) {
  return (
    <View style={styles.categoryTag}>
      <Text style={styles.categoryTagText}>{label}</Text>
    </View>
  );
}

function ReviewCard({ user, text, rating }: { user: string; text: string; rating: number }) {
  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.userAvatar} />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user}</Text>
          <View style={styles.ratingContainer}>
            {[...Array(5)].map((_, index) => (
              <Text key={index} style={styles.star}>
                {index < rating ? "⭐" : "☆"}
              </Text>
            ))}
          </View>
        </View>
      </View>
      <Text style={styles.reviewText}>{text}</Text>
    </View>
  );
}

export default function MapDetail() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'MapDetail'>>();

  const handleReviewWrite = () => {
    navigation.navigate('WriteReview');
  };

  const handleSave = () => {
    // TODO: 저장 기능
    console.log('저장하기');
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
        <Text style={styles.headerTitle}>장소 상세보기</Text>
        <View style={styles.headerRight}>
          <Text style={styles.timeText}>12:30</Text>
          <View style={styles.statusIcons}>
            <Text style={styles.statusIcon}>📶</Text>
            <Text style={styles.statusIcon}>🔋</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* 이미지 슬라이더 */}
        <ImageSlider images={placeData.images} />

        {/* 장소 정보 */}
        <View style={styles.placeInfo}>
          <View style={styles.placeHeader}>
            <View style={styles.placeIcon} />
            <View style={styles.placeDetails}>
              <Text style={styles.placeName}>{placeData.name}</Text>
              {placeData.isApproved && (
                <View style={styles.approvedBadge}>
                  <Text style={styles.approvedText}>승인됨 🔖</Text>
                </View>
              )}
            </View>
          </View>

          {/* 카테고리 태그 */}
          <View style={styles.categoryContainer}>
            {placeData.categories.map((category, index) => (
              <CategoryTag key={index} label={category} />
            ))}
          </View>
        </View>

        {/* 장소 설명 */}
        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>장소 설명</Text>
          <Text style={styles.descriptionText}>{placeData.description}</Text>
        </View>

        {/* 장소 위치 */}
        <View style={styles.locationSection}>
          <Text style={styles.sectionTitle}>장소 위치</Text>
          <View style={styles.mapContainer}>
            <KakaoMap />
          </View>
          <Text style={styles.addressText}>{placeData.address}</Text>
        </View>

        {/* 액션 버튼 */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.reviewButton} onPress={handleReviewWrite}>
            <Text style={styles.reviewButtonText}>리뷰 작성하기</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>저장하기</Text>
          </TouchableOpacity>
        </View>

        {/* 리뷰 섹션 */}
        <View style={styles.reviewsSection}>
          <Text style={styles.sectionTitle}>리뷰</Text>
          {placeData.reviews.map((review, index) => (
            <ReviewCard key={index} {...review} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
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
  timeText: {
    fontSize: 14,
    color: "#000000",
    marginRight: 8,
  },
  statusIcons: {
    flexDirection: "row",
  },
  statusIcon: {
    fontSize: 16,
    marginLeft: 4,
  },
  scrollView: {
    flex: 1,
  },
  imageSliderContainer: {
    position: "relative",
    height: 250,
  },
  mainImage: {
    width: "100%",
    height: "100%",
  },
  imageDots: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#FFFFFF",
  },
  inactiveDot: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  placeInfo: {
    padding: 16,
  },
  placeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  placeIcon: {
    width: 40,
    height: 40,
    backgroundColor: "#4CAF50",
    borderRadius: 20,
    marginRight: 12,
  },
  placeDetails: {
    flex: 1,
  },
  placeName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 4,
  },
  approvedBadge: {
    alignSelf: "flex-start",
  },
  approvedText: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "500",
  },
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  categoryTag: {
    backgroundColor: "#E8F5E8",
    borderColor: "#4CAF50",
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryTagText: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "500",
  },
  descriptionSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
  },
  locationSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  mapContainer: {
    height: 150,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
  },
  actionButtons: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  reviewButton: {
    flex: 1,
    borderColor: "#000000",
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  reviewButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000000",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#000000",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  reviewsSection: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  reviewCard: {
    backgroundColor: "#F8F8F8",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  userAvatar: {
    width: 32,
    height: 32,
    backgroundColor: "#E0E0E0",
    borderRadius: 16,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 2,
  },
  ratingContainer: {
    flexDirection: "row",
  },
  star: {
    fontSize: 12,
    marginRight: 2,
  },
  reviewText: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 18,
  },
});