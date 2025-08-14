import { firestore, storage } from './firebaseConfig';
import { PlaceReport, PlaceReportInput } from '../types/place';

class FirestoreService {
  private placesCollection = firestore().collection('places');

  /**
   * 장소 제보 데이터를 Firestore에 저장
   */
  async addPlaceReport(placeData: PlaceReportInput): Promise<string> {
    try {
      // 필수 필드 검증
      if (!placeData.name || !placeData.address || !placeData.coordinates || !placeData.category || !placeData.description) {
        throw new Error('필수 정보가 누락되었습니다.');
      }

      // undefined 값을 제거하고 유효한 데이터만 필터링
      const cleanData = Object.fromEntries(
        Object.entries(placeData).filter(([_, value]) => value !== undefined)
      );

      const placeReport: Omit<PlaceReport, 'id'> = {
        name: placeData.name,
        address: placeData.address,
        coordinates: placeData.coordinates,
        category: placeData.category,
        description: placeData.description,
        ...(placeData.detailAddress && { detailAddress: placeData.detailAddress }),
        ...(placeData.imageUrl && { imageUrl: placeData.imageUrl }),
        reporterId: 'anonymous', // 임시로 anonymous 설정
        createdAt: new Date(),
        status: 'pending'
      };

      const docRef = await this.placesCollection.add(placeReport);
      console.log('장소 제보가 성공적으로 저장되었습니다. ID:', docRef.id);
      return docRef.id;
    } catch (error: any) {
      console.error('장소 제보 저장 실패:', error);
      
      if (error.code === 'permission-denied') {
        throw new Error('권한이 없습니다. 로그인 후 다시 시도해주세요.');
      } else if (error.code === 'unavailable') {
        throw new Error('네트워크 연결을 확인해주세요.');
      } else {
        throw new Error('장소 제보 저장에 실패했습니다. 다시 시도해주세요.');
      }
    }
  }

  /**
   * 이미지를 Firebase Storage에 업로드하고 URL 반환
   */
  async uploadImage(imageUri: string, placeId: string): Promise<string> {
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      const storageRef = storage().ref(`places/${placeId}/image.jpg`);
      await storageRef.put(blob);
      
      const downloadURL = await storageRef.getDownloadURL();
      console.log('이미지 업로드 성공:', downloadURL);
      return downloadURL;
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      throw new Error('이미지 업로드에 실패했습니다.');
    }
  }

  /**
   * 장소 제보 데이터를 이미지와 함께 저장
   */
  async savePlaceWithImage(placeData: PlaceReportInput, imageUri?: string): Promise<string> {
    try {
      // 먼저 장소 데이터 저장
      const placeId = await this.addPlaceReport(placeData);
      
      // 이미지가 있으면 업로드하고 URL 업데이트
      if (imageUri) {
        const imageUrl = await this.uploadImage(imageUri, placeId);
        await this.placesCollection.doc(placeId).update({
          imageUrl: imageUrl
        });
      }
      
      return placeId;
    } catch (error) {
      console.error('장소 및 이미지 저장 실패:', error);
      throw error;
    }
  }
}

export default new FirestoreService();
