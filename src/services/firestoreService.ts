import { firestore, storage } from './firebaseConfig';
import { Review, ReviewInput } from '../types/review';
import auth from '@react-native-firebase/auth';

// Firestore 데이터베이스 서비스 클래스
class FirestoreService {
  private placesCollection = firestore().collection('places');
  private reviewsCollection = firestore().collection('reviews');
  private favoritesCollection = firestore().collection('favorites');

  /**
   * XSS 방지를 위한 텍스트 정제
   */
  private sanitizeText(text: string): string {
    return text
      .replace(/[<>]/g, '') // HTML 태그 제거
      .replace(/javascript:/gi, '') // JavaScript 프로토콜 제거
      .replace(/on\w+=/gi, '') // 이벤트 핸들러 제거
      .trim();
  }

  // 현재 로그인한 사용자 ID 반환
  private getCurrentUserId(): string {
    const currentUser = auth().currentUser;

    
    if (!currentUser) {
      console.warn('로그인된 사용자가 없습니다!');
      return 'anonymous-user';
    }
    return currentUser.uid;
  }

  // 장소 제보 관련 함수들은 임시로 주석 처리
  // TODO: place.ts 타입 파일 생성 후 활성화

  // 리뷰를 Firestore에 저장
  async addReview(reviewData: ReviewInput): Promise<string> {
    const currentUser = auth().currentUser;
    if (!currentUser){
      throw new Error('로그인 후 리뷰 작성 가능')
    }

    try {
      
      // 필수 필드 검증
      if (!reviewData.placeId || !reviewData.userId || !reviewData.rating || !reviewData.reviewText) {
        throw new Error('필수 필드가 누락되었습니다.');
      }

      // 데이터 검증 및 정제
      if (reviewData.rating < 1 || reviewData.rating > 5) {
        throw new Error('별점은 1점에서 5점 사이여야 합니다.');
      }

      if (reviewData.reviewText.length < 10) {
        throw new Error('리뷰는 최소 10자 이상 작성해주세요.');
      }

      if (reviewData.reviewText.length > 1000) {
        throw new Error('리뷰는 최대 1000자까지 작성 가능합니다.');
      }

      // XSS 방지를 위한 텍스트 정제
      const sanitizedText = this.sanitizeText(reviewData.reviewText);
      const sanitizedName = this.sanitizeText(reviewData.userName);

      const review: Omit<Review, 'id'> = {
        placeId: reviewData.placeId,
        placeName: reviewData.placeName,
        userId: currentUser.uid,
        userName: sanitizedName,
        rating: reviewData.rating,
        reviewText: sanitizedText,
        ...(reviewData.imageUrl && { imageUrl: reviewData.imageUrl }),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // 1) reviews 컬렉션에 저장
      const docRef = await this.reviewsCollection.add(review);
      // 2) users/{uid}/reviews 서브컬렉션에도 저장(mypage용)
      await firestore()
      .collection('users')
      .doc(currentUser.uid)
      .collection('reviews')
      .doc(docRef.id)
      .set(review);

      return docRef.id;
    } catch (error: any) {
      if (error.code === 'permission-denied') {
        throw new Error('권한이 없습니다. 로그인 후 다시 시도해주세요.');
      } else if (error.code === 'unavailable') {
        throw new Error('네트워크 연결을 확인해주세요.');
      } else {
        throw new Error(`리뷰 저장에 실패했습니다: ${error.message}`);
      }
    }
  }


  // 특정 장소의 모든 리뷰 조회
  async getReviewsByPlaceId(placeId: string): Promise<Review[]> {
    try {
      
      const snapshot = await this.reviewsCollection
        .where('placeId', '==', placeId)
        .get();

      const reviews: Review[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        reviews.push({
          id: doc.id, // 각 리뷰의 고유 인덱스
          placeId: data.placeId,
          placeName: data.placeName,
          userId: data.userId,
          userName: data.userName,
          rating: data.rating,
          reviewText: data.reviewText,
          imageUrl: data.imageUrl,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        });
      });

      // 클라이언트에서 정렬 (최신순)
      reviews.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      return reviews;
    } catch (error) {
      throw new Error('리뷰 조회에 실패했습니다.');
    }
  }

  /**
   * 특정 사용자가 특정 장소에 작성한 모든 리뷰 조회
   */
  async getReviewsByUserAndPlace(userId: string, placeId: string): Promise<Review[]> {
    try {
      
      const snapshot = await this.reviewsCollection
        .where('userId', '==', userId)
        .where('placeId', '==', placeId)
        .get();

      const reviews: Review[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        reviews.push({
          id: doc.id, // 각 리뷰의 고유 인덱스
          placeId: data.placeId,
          placeName: data.placeName,
          userId: data.userId,
          userName: data.userName,
          rating: data.rating,
          reviewText: data.reviewText,
          imageUrl: data.imageUrl,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        });
      });

      // 클라이언트에서 정렬 (최신순)
      reviews.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      return reviews;
    } catch (error) {
      throw new Error('사용자별 장소 리뷰 조회에 실패했습니다.');
    }
  }

  /**
   * 특정 사용자가 작성한 모든 리뷰 조회
   */
  async getReviewsByUserId(userId: string): Promise<Review[]> {
    try {
      
      const snapshot = await this.reviewsCollection
        .where('userId', '==', userId)
        .get();

      const reviews: Review[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        reviews.push({
          id: doc.id, // 각 리뷰의 고유 인덱스
          placeId: data.placeId,
          placeName: data.placeName,
          userId: data.userId,
          userName: data.userName,
          rating: data.rating,
          reviewText: data.reviewText,
          imageUrl: data.imageUrl,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        });
      });

      // 클라이언트에서 정렬 (최신순)
      reviews.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      return reviews;
    } catch (error) {
      throw new Error('사용자 리뷰 조회에 실패했습니다.');
    }
  }

  /**
   * 리뷰 이미지를 Firebase Storage에 업로드하고 URL 반환
   */
  async uploadReviewImage(imageUri: string, reviewId: string): Promise<string> {
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      // 파일 크기 검증 (5MB 제한)
      if (blob.size > 5 * 1024 * 1024) {
        throw new Error('이미지 파일 크기는 5MB 이하여야 합니다.');
      }
      
      // 파일 타입 검증
      if (!blob.type.startsWith('image/')) {
        throw new Error('이미지 파일만 업로드 가능합니다.');
      }
      
      // 파일명에 타임스탬프 추가하여 중복 방지
      const timestamp = Date.now();
      const fileName = `review_${timestamp}.jpg`;
      
      const storageRef = storage().ref(`reviews/${reviewId}/${fileName}`);
      await storageRef.put(blob);
      
      const downloadURL = await storageRef.getDownloadURL();
      return downloadURL;
    } catch (error) {
      throw new Error('이미지 업로드에 실패했습니다.');
    }
  }

  async saveReviewWithImage(reviewData: ReviewInput, imageUri?: string): Promise<string> {
    try {
      // 먼저 리뷰 데이터 저장
      const reviewId = await this.addReview(reviewData);
      
      // 이미지가 있으면 업로드하고 URL 업데이트
      if (imageUri) {
        const imageUrl = await this.uploadReviewImage(imageUri, reviewId);
        await this.reviewsCollection.doc(reviewId).update({
          imageUrl: imageUrl
        });
      }
      
      return reviewId;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 특정 리뷰 삭제 (고유 인덱스로 식별)
   */
  async deleteReview(reviewId: string): Promise<void> {
    try {
      
      await this.reviewsCollection.doc(reviewId).delete();
      
    } catch (error) {
      throw new Error('리뷰 삭제에 실패했습니다.');
    }
  }

  /**
   * 특정 리뷰 수정 (고유 인덱스로 식별)
   */
  async updateReview(reviewId: string, updateData: Partial<ReviewInput>): Promise<void> {
    try {
      
      const sanitizedData: any = {};
      
      if (updateData.rating !== undefined) {
        if (updateData.rating < 1 || updateData.rating > 5) {
          throw new Error('별점은 1점에서 5점 사이여야 합니다.');
        }
        sanitizedData.rating = updateData.rating;
      }
      
      if (updateData.reviewText !== undefined) {
        if (updateData.reviewText.length < 10) {
          throw new Error('리뷰는 최소 10자 이상 작성해주세요.');
        }
        if (updateData.reviewText.length > 1000) {
          throw new Error('리뷰는 최대 1000자까지 작성 가능합니다.');
        }
        sanitizedData.reviewText = this.sanitizeText(updateData.reviewText);
      }
      
      if (updateData.imageUrl !== undefined) {
        sanitizedData.imageUrl = updateData.imageUrl;
      }
      
      sanitizedData.updatedAt = new Date();
      
      await this.reviewsCollection.doc(reviewId).update(sanitizedData);
      
    } catch (error) {
      throw new Error('리뷰 수정에 실패했습니다.');
    }
  }

  // 평점 통계 업데이트 함수 제거 - 각 리뷰를 독립적으로 처리

  // 즐겨찾기 추가
  async addFavorite(placeId: string, placeData?: any): Promise<void> {
    try {
      const userId = this.getCurrentUserId();
      
      const favoriteData = {
        userId: userId,
        placeId: placeId,
        placeName: placeData?.name || '',
        address: placeData?.address || '',
        category: placeData?.category || '',
        description: placeData?.description || '',
        image: placeData?.image || '',
        createdAt: new Date()
      };

          await this.favoritesCollection.add(favoriteData);
    } catch (error: any) {
      console.error('즐겨찾기 추가 에러:', error);
      if (error.code === 'permission-denied') {
        throw new Error('권한이 없습니다. Firestore 규칙을 확인해주세요.');
      } else if (error.code === 'unavailable') {
        throw new Error('네트워크 연결을 확인해주세요.');
      } else {
        throw new Error(`즐겨찾기 추가에 실패했습니다: ${error.message || error.code}`);
      }
    }
  }

  // 즐겨찾기 제거
  async removeFavorite(placeId: string): Promise<void> {
    try {
      const userId = this.getCurrentUserId();
      
  
      const snapshot = await this.favoritesCollection
        .where('userId', '==', userId)
        .where('placeId', '==', placeId)
        .get();

      const batch = firestore().batch();
      snapshot.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
  
    } catch (error: any) {
      console.error('즐겨찾기 제거 에러:', error);
      if (error.code === 'permission-denied') {
        throw new Error('권한이 없습니다. Firestore 규칙을 확인해주세요.');
      } else if (error.code === 'unavailable') {
        throw new Error('네트워크 연결을 확인해주세요.');
      } else {
        throw new Error(`즐겨찾기 제거에 실패했습니다: ${error.message || error.code}`);
      }
    }
  }

  // 사용자의 즐겨찾기 목록 조회
  async getFavorites(): Promise<string[]> {
    try {
      const userId = this.getCurrentUserId();
      
  
      const snapshot = await this.favoritesCollection
        .where('userId', '==', userId)
        .get();

      const favorites: string[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        favorites.push(data.placeId);
      });

  
      return favorites;
    } catch (error: any) {
      console.error('즐겨찾기 목록 조회 에러:', error);
      if (error.code === 'permission-denied') {
        console.warn('권한 없음 - 빈 배열 반환');
        return []; // 권한 없으면 빈 배열 반환
      } else {
        throw new Error(`즐겨찾기 목록 조회에 실패했습니다: ${error.message || error.code}`);
      }
    }
  }

  /**
   * 특정 장소가 즐겨찾기에 있는지 확인
   */
  async isFavorite(placeId: string): Promise<boolean> {
    try {
      const userId = this.getCurrentUserId();
      
      const snapshot = await this.favoritesCollection
        .where('userId', '==', userId)
        .where('placeId', '==', placeId)
        .get();

      return !snapshot.empty;
    } catch (error) {
      return false;
    }
  }

  /**
   * 사용자의 즐겨찾기 장소 상세 정보 조회
   */
  async getFavoritePlaces(limit?: number): Promise<any[]> {
    try {
      const userId = this.getCurrentUserId();
      
  
      const snapshot = await this.favoritesCollection
        .where('userId', '==', userId)
        .get();

  
      
      // 클라이언트에서 정렬 (최신순)
      const sortedDocs = snapshot.docs.sort((a, b) => {
        const aTime = a.data().createdAt?.toDate?.() || new Date(0);
        const bTime = b.data().createdAt?.toDate?.() || new Date(0);
        return bTime.getTime() - aTime.getTime();
      });

      // limit이 지정된 경우에만 제한
      const limitedDocs = limit ? sortedDocs.slice(0, limit) : sortedDocs;

      const favoritePlaces: any[] = [];
      
      for (const doc of limitedDocs) {
        const data = doc.data();
    
        
        // favorites 컬렉션에서 직접 장소 정보 가져오기
        const placeData = {
          id: data.placeId,
          name: data.placeName || '알 수 없는 장소',
          address: data.address || '',
          category: data.category || '기타',
          description: data.description || '',
          image: data.image || '',
          favoriteId: doc.id
        };
        
        favoritePlaces.push(placeData);
      }

  
      return favoritePlaces;
    } catch (error: any) {
      console.error('즐겨찾기 장소 상세 정보 조회 에러:', error);
      if (error.code === 'permission-denied') {
        console.warn('권한 없음 - 빈 배열 반환');
        return [];
      } else {
        throw new Error(`즐겨찾기 장소 상세 정보 조회에 실패했습니다: ${error.message || error.code}`);
      }
    }
  }
}

export default new FirestoreService();
