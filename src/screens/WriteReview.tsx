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
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';
import { shadows } from '../styles/shadows';
import FirestoreService from '../services/firestoreService';
import { ReviewInput } from '../types/review';
import AuthService from '../services/authService';

type RootStackParamList = {
  Home: undefined;
  Map: undefined;
  MapDetail: undefined;
  WriteReview: { 
    placeName?: string;
    placeId?: string;
  };
};

// 가데이터
const userData = {
  name: "사용자 이름",
  level: 3,
  points: 1200,
  avatar: "https://via.placeholder.com/80x80/4CAF50/FFFFFF?text=User"
};

export default function WriteReview({ route }: { route: { params?: { placeName?: string; placeId?: string } } }) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'WriteReview'>>();
  
  const placeName = route.params?.placeName || "제로웨이스트 스토어";
  const placeId = route.params?.placeId || "default-place-id";
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRatingPress = (selectedRating: number) => {
    setRating(selectedRating);
  };

  const handleImageUpload = () => {
    // TODO: 실제 이미지 업로드 기능
    Alert.alert('알림', '이미지 업로드 기능이 곧 추가됩니다!');
  };

  const handleSubmitReview = async () => {
    if (rating === 0) {
      Alert.alert('알림', '별점을 선택해주세요.');
      return;
    }
    
    if (!reviewText.trim()) {
      Alert.alert('알림', '리뷰 내용을 입력해주세요.');
      return;
    }

    // 리뷰 텍스트 길이 검증
    if (reviewText.trim().length < 10) {
      Alert.alert('알림', '리뷰는 최소 10자 이상 작성해주세요.');
      return;
    }

    if (reviewText.trim().length > 1000) {
      Alert.alert('알림', '리뷰는 최대 1000자까지 작성 가능합니다.');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('리뷰 제출 시작 - 사용자 인증 확인 중...');
      
      // 현재 인증된 사용자 정보 가져오기
      const currentUser = AuthService.getCurrentUser();
      console.log('현재 인증된 사용자:', currentUser);
      
      if (!currentUser) {
        console.error('사용자가 로그인되지 않음');
        Alert.alert('오류', '로그인이 필요합니다.');
        return;
      }

      // Firestore에서 사용자 상세 정보 가져오기
      console.log('Firestore에서 사용자 상세 정보 조회 중...');
      const userDetails = await AuthService.getUserFromFirestore(currentUser.uid);
      console.log('사용자 상세 정보:', userDetails);
      
      if (!userDetails) {
        console.error('사용자 상세 정보를 찾을 수 없음');
        Alert.alert('오류', '사용자 정보를 찾을 수 없습니다.');
        return;
      }

      // 리뷰 데이터 준비
      const reviewData: ReviewInput = {
        placeId: placeId,
        placeName: placeName,
        userId: currentUser.uid,
        userName: userDetails.name,
        rating: rating,
        reviewText: reviewText.trim(),
        imageUrl: selectedImages.length > 0 ? selectedImages[0] : undefined
      };

      console.log('Firebase 인증 상태 확인:');
      console.log('- 현재 사용자 UID:', currentUser.uid);
      console.log('- 사용자 이메일:', currentUser.email);
      console.log('- 사용자 표시명:', currentUser.displayName);
      
      // Firebase 인증 상태 추가 확인
      console.log('- 인증된 사용자 객체:', JSON.stringify(currentUser, null, 2));
      
      // Firebase Auth 직접 확인
      try {
        const auth = require('@react-native-firebase/auth').default();
        const currentAuthUser = auth.currentUser;
        console.log('- Firebase Auth 현재 사용자:', currentAuthUser);
        console.log('- Firebase Auth UID:', currentAuthUser?.uid);
        console.log('- Firebase Auth 이메일:', currentAuthUser?.email);
      } catch (authError) {
        console.error('- Firebase Auth 확인 실패:', authError);
      }
      
      console.log('- 리뷰 데이터:', reviewData);

            // Firestore에 리뷰 저장
      const reviewId = await FirestoreService.saveReviewWithImage(
        reviewData, 
        selectedImages.length > 0 ? selectedImages[0] : undefined
      );

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
    } catch (error: any) {
      console.error('리뷰 저장 실패:', error);
      console.error('에러 코드:', error.code);
      console.error('에러 메시지:', error.message);
      console.error('에러 스택:', error.stack);
      
      let errorMessage = '리뷰 저장에 실패했습니다. 다시 시도해주세요.';
      
      if (error.code === 'permission-denied') {
        errorMessage = '권한이 없습니다. 로그인 상태를 확인해주세요.';
      } else if (error.code === 'unavailable') {
        errorMessage = '네트워크 연결을 확인해주세요.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('오류', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
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

  const isFormValid = rating > 0 && reviewText.trim().length > 0;

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
        <Text style={styles.headerTitle}>리뷰 작성하기</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 가게 이름 섹션 */}
        <View style={styles.placeSection}>
          <Text style={styles.placeName}>{placeName}</Text>
        </View>

        {/* 별점 섹션 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>별점</Text>
            <Text style={styles.requiredBadge}>필수</Text>
          </View>
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
                  ★
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 리뷰 텍스트 작성 섹션 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>리뷰 작성</Text>
            <Text style={styles.requiredBadge}>필수</Text>
          </View>
          <TextInput
            style={styles.reviewTextInput}
            value={reviewText}
            onChangeText={setReviewText}
            placeholder="이 가게에 대한 솔직한 리뷰를 작성해주세요..."
            placeholderTextColor={colors.textDisabled}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            maxLength={500}
          />
          <Text style={styles.characterCount}>
            {reviewText.length}/500
          </Text>
        </View>

        {/* 이미지 선택 섹션 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>이미지 추가</Text>
            <Text style={styles.optionalBadge}>선택</Text>
          </View>
          <TouchableOpacity
            style={styles.imageUploadArea}
            onPress={handleImageUpload}
          >
            <View style={styles.imageUploadContent}>
              <Text style={styles.imageUploadIcon}>📷</Text>
              <Text style={styles.imageUploadText}>사진을 추가해주세요</Text>
              <Text style={styles.imageUploadSubtext}>최대 5장까지 업로드 가능</Text>
            </View>
          </TouchableOpacity>
          
          {/* 이미지 미리보기 */}
          {selectedImages.length > 0 && (
            <View style={styles.imagePreviewContainer}>
              <Text style={styles.imagePreviewText}>이미지가 선택되었습니다</Text>
            </View>
          )}
        </View>

        {/* 하단 액션 버튼 */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
          >
            <Text style={styles.cancelButtonText}>취소</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!isFormValid || isSubmitting) && styles.submitButtonDisabled
            ]}
            onPress={handleSubmitReview}
            disabled={!isFormValid || isSubmitting}
          >
            <Text style={[
              styles.submitButtonText,
              (!isFormValid || isSubmitting) && styles.submitButtonTextDisabled
            ]}>
              {isSubmitting ? '저장 중...' : '리뷰 작성하기'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
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
    color: colors.textPrimary,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: spacing.screenPaddingHorizontal,
  },
  placeSection: {
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  placeName: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.textPrimary,
    textAlign: 'center',
  },
  section: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    marginRight: 8,
  },
  requiredBadge: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.error,
    backgroundColor: colors.error + '10',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  optionalBadge: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.textSecondary,
    backgroundColor: colors.textSecondary + '10',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: 'center',
    marginBottom: 12,
  },
  starButton: {
    marginHorizontal: 8,
    padding: 4,
  },
  star: {
    fontSize: 36,
  },
  filledStar: {
    color: colors.secondary,
  },
  emptyStar: {
    color: colors.divider,
  },

  reviewTextInput: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
    minHeight: 120,
    textAlignVertical: "top",
  },
  characterCount: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: 8,
  },
  imageUploadArea: {
    borderColor: colors.border,
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 12,
    paddingVertical: 32,
    alignItems: "center",
    backgroundColor: colors.surface,
  },
  imageUploadContent: {
    alignItems: 'center',
  },
  imageUploadIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  imageUploadText: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: "500",
    marginBottom: 4,
  },
  imageUploadSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  imagePreviewContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  imagePreviewText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  imagePreviewItem: {
    marginRight: 12,
    position: 'relative',
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: "row",
    paddingVertical: 24,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    backgroundColor: colors.background,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  submitButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    ...shadows.button,
  },
  submitButtonDisabled: {
    backgroundColor: colors.divider,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.background,
  },
  submitButtonTextDisabled: {
    color: colors.textDisabled,
  },
}); 