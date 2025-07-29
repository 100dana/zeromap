import React, { useState } from "react";
import { 
  SafeAreaView, 
  View, 
  ScrollView, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  Image
} from "react-native";
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Home: undefined;
  Map: undefined;
  MapDetail: undefined;
  WriteReview: undefined;
};

// 가데이터
const userData = {
  name: "사용자 이름",
  level: 3,
  points: 1200,
  avatar: "https://via.placeholder.com/80x80/4CAF50/FFFFFF?text=User"
};

export default function WriteReview() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'WriteReview'>>();
  
  const [rating, setRating] = useState(1);
  const [reviewText, setReviewText] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const handleRatingPress = (selectedRating: number) => {
    setRating(selectedRating);
  };

  const handleImageUpload = () => {
    // TODO: 실제 이미지 업로드 기능
    Alert.alert('알림', '이미지 업로드 기능이 곧 추가됩니다!');
  };

  const handleSubmitReview = () => {
    if (!reviewText.trim()) {
      Alert.alert('알림', '리뷰 내용을 입력해주세요.');
      return;
    }

    Alert.alert(
      '리뷰 작성 완료',
      '리뷰가 성공적으로 작성되었습니다!',
      [
        {
          text: '확인',
          onPress: () => navigation.goBack()
        }
      ]
    );
  };

  const handleCancel = () => {
    Alert.alert(
      '취소',
      '작성 중인 리뷰가 사라집니다.\n정말 취소하시겠습니까?',
      [
        { text: '계속 작성', style: 'cancel' },
        { text: '취소', onPress: () => navigation.goBack() }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 상단 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>리뷰 작성하기</Text>
        <TouchableOpacity 
          style={styles.backTextButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>BACK</Text>
        </TouchableOpacity>
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
        </View>

        {/* 별점 섹션 */}
        <View style={styles.ratingSection}>
          <Text style={styles.sectionTitle}>Rating</Text>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                style={styles.starButton}
                onPress={() => handleRatingPress(star)}
              >
                <Text style={[
                  styles.star,
                  star <= rating ? styles.filledStar : styles.emptyStar
                ]}>
                  {star <= rating ? "⭐" : "☆"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.ratingHint}>원하는 별 개수 누르기</Text>
        </View>

        {/* 리뷰 텍스트 작성 섹션 */}
        <View style={styles.reviewTextSection}>
          <Text style={styles.sectionTitle}>리뷰 작성 (텍스트)</Text>
          <TextInput
            style={styles.reviewTextInput}
            value={reviewText}
            onChangeText={setReviewText}
            placeholder="리뷰를 작성하세요..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        {/* 이미지 선택 섹션 */}
        <View style={styles.imageSection}>
          <Text style={styles.sectionTitle}>리뷰 작성을 위한 이미지 선택하기</Text>
          <TouchableOpacity
            style={styles.imageUploadArea}
            onPress={handleImageUpload}
          >
            <Text style={styles.imageUploadText}>+ 이미지 추가</Text>
          </TouchableOpacity>
          
          {/* 이미지 미리보기 점들 */}
          {selectedImages.length > 0 && (
            <View style={styles.imageDots}>
              {selectedImages.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    index === 0 ? styles.activeDot : styles.inactiveDot
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* 하단 액션 버튼 */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
          >
            <Text style={styles.cancelButtonText}>취소하기</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmitReview}
          >
            <Text style={styles.submitButtonText}>리뷰 작성하기</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

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
  backTextButton: {
    padding: 8,
  },
  backText: {
    fontSize: 14,
    color: "#000000",
    fontWeight: "500",
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
  ratingSection: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: "row",
    marginBottom: 8,
  },
  starButton: {
    marginRight: 8,
  },
  star: {
    fontSize: 32,
  },
  filledStar: {
    color: "#FFD700",
  },
  emptyStar: {
    color: "#E0E0E0",
  },
  ratingHint: {
    fontSize: 12,
    color: "#999999",
  },
  reviewTextSection: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  reviewTextInput: {
    borderColor: "#E0E0E0",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: "#000000",
    backgroundColor: "#FFFFFF",
    minHeight: 120,
  },
  imageSection: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  imageUploadArea: {
    borderColor: "#E0E0E0",
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 8,
    paddingVertical: 40,
    alignItems: "center",
    backgroundColor: "#F8F8F8",
    marginBottom: 12,
  },
  imageUploadText: {
    fontSize: 16,
    color: "#666666",
    fontWeight: "500",
  },
  imageDots: {
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
    backgroundColor: "#4CAF50",
  },
  inactiveDot: {
    backgroundColor: "#E0E0E0",
  },
  actionButtons: {
    flexDirection: "row",
    paddingVertical: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderColor: "#000000",
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000000",
  },
  submitButton: {
    flex: 1,
    backgroundColor: "#000000",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
}); 