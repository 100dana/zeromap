import firestore from '@react-native-firebase/firestore';
import zeroRestaurantData from '../data/서울시 제로식당 목록.json';
import { GeocodingService } from './geocodingService';

export interface CachedRestaurantData {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  category: string;
  isZeroRestaurant: boolean;
  description: string;
  zeroPay: string;
  seoulCertified: string;
  cachedAt: Date;
}

export class CacheInitializer {
  private static readonly COLLECTION_NAME = 'zero_restaurants_cache';
  private static readonly BATCH_SIZE = 50; // 한 번에 처리할 데이터 개수

  // 제로식당 좌표 정보를 Firebase에 캐시로 저장
  static async initializeCache(): Promise<void> {
    try {
      // 임시로 캐시 기능 비활성화 (권한 오류 방지)
      console.log('캐시 기능이 임시로 비활성화되었습니다. 로컬 데이터를 사용합니다.');
      return;
      
      // 기존 캐시 삭제
      await this.clearExistingCache();
      
      // 배치 단위로 데이터 처리
      const batches = this.chunkArray(zeroRestaurantData, this.BATCH_SIZE);
      
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        
        await this.processBatch(batch, i * this.BATCH_SIZE);
        
        // 배치 간 딜레이 (API 제한 방지)
        if (i < batches.length - 1) {
          await this.delay(1000); // 1초 대기
        }
      }
      
    } catch (error) {
      console.error('캐시 초기화 오류:', error);
      throw error;
    }
  }

  // 배치 단위로 데이터 처리
  private static async processBatch(batch: any[], startIndex: number): Promise<void> {
    const batchWrite = firestore().batch();
    
    for (let i = 0; i < batch.length; i++) {
      const restaurant = batch[i];
      const globalIndex = startIndex + i;
      
      try {
        // 좌표 변환 및 검증 (카카오 API 사용)
        const coords = await GeocodingService.addressToCoordinates(restaurant.지번주소);
        
        // 좌표 유효성 검증
        if (!coords || !this.isValidCoordinates(coords)) {
          console.warn(`  → 유효하지 않은 좌표: ${restaurant.상호명} (${coords?.latitude}, ${coords?.longitude})`);
          continue; // 이 항목 건너뛰기
        }
        
        // 데이터 검증
        if (!this.isValidRestaurantData(restaurant)) {
          console.warn(`  → 유효하지 않은 데이터: ${restaurant.상호명}`);
          continue;
        }
        
        const cachedData: CachedRestaurantData = {
          id: `zero_restaurant_${globalIndex}`,
          name: restaurant.상호명?.trim() || '알 수 없는 상호명',
          address: restaurant.지번주소?.trim() || '',
          latitude: coords.latitude,
          longitude: coords.longitude,
          category: '제로식당',
          isZeroRestaurant: true,
          description: '서울시 제로식당 인증 업체',
          zeroPay: '가능',
          seoulCertified: '서울시제로식당',
          cachedAt: new Date()
        };

        // Firestore에 저장
        const docRef = firestore()
          .collection(this.COLLECTION_NAME)
          .doc(cachedData.id);
        
        batchWrite.set(docRef, cachedData);
        
      } catch (error) {
        console.error(`  → 오류 발생: ${restaurant.상호명}`, error);
      }
    }

    // 배치 커밋
    await batchWrite.commit();
  }

  // 기존 캐시 삭제
  private static async clearExistingCache(): Promise<void> {
    try {
      const snapshot = await firestore()
        .collection(this.COLLECTION_NAME)
        .get();
      
      if (!snapshot.empty) {
        const batch = firestore().batch();
        snapshot.docs.forEach((doc: any) => {
          batch.delete(doc.ref);
        });
        await batch.commit();
      }
    } catch (error) {
      console.error('기존 캐시 삭제 오류:', error);
      // 권한 오류가 발생해도 계속 진행
    }
  }

  // 배열을 청크로 분할
  private static chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  // 지연 함수
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 좌표 유효성 검증
  private static isValidCoordinates(coords: { latitude: number; longitude: number }): boolean {
    return (
      typeof coords.latitude === 'number' &&
      typeof coords.longitude === 'number' &&
      coords.latitude >= 33.0 && coords.latitude <= 38.5 && // 한국 위도 범위
      coords.longitude >= 124.0 && coords.longitude <= 132.0 && // 한국 경도 범위
      coords.latitude !== 0 && coords.longitude !== 0
    );
  }

  // 제로식당 데이터 유효성 검증
  private static isValidRestaurantData(restaurant: any): boolean {
    return (
      restaurant &&
      typeof restaurant.상호명 === 'string' &&
      restaurant.상호명.trim().length > 0 &&
      typeof restaurant.지번주소 === 'string' &&
      restaurant.지번주소.trim().length > 0
    );
  }

  // 캐시 상태 확인
  static async getCacheStatus(): Promise<{ total: number; cached: number }> {
    try {
      // 임시로 캐시 기능 비활성화
      return { total: zeroRestaurantData.length, cached: 0 };
      
      const snapshot = await firestore()
        .collection(this.COLLECTION_NAME)
        .get();
      
      return {
        total: zeroRestaurantData.length,
        cached: snapshot.size
      };
    } catch (error) {
      console.error('캐시 상태 확인 오류:', error);
      return { total: 0, cached: 0 };
    }
  }

  // 캐시된 데이터 가져오기
  static async getCachedRestaurants(): Promise<CachedRestaurantData[]> {
    try {
      // 임시로 캐시 기능 비활성화
      return [];
      
      const snapshot = await firestore()
        .collection(this.COLLECTION_NAME)
        .get();
      
      const restaurants = snapshot.docs.map((doc: any) => doc.data() as CachedRestaurantData);
      
      return restaurants;
    } catch (error) {
      console.error('캐시된 데이터 가져오기 오류:', error);
      return [];
    }
  }

  // 특정 거리 내의 캐시된 데이터 가져오기
  static async getCachedRestaurantsByDistance(maxDistanceKm: number = 5): Promise<CachedRestaurantData[]> {
    try {
      const allRestaurants = await this.getCachedRestaurants();
      const seoulCityHall = { latitude: 37.5665, longitude: 126.9780 };
      
      const nearbyRestaurants = allRestaurants.filter(restaurant => {
        const distance = GeocodingService.calculateDistance(
          seoulCityHall.latitude,
          seoulCityHall.longitude,
          restaurant.latitude,
          restaurant.longitude
        );
        return distance <= maxDistanceKm;
      });
      
      return nearbyRestaurants;
    } catch (error) {
      console.error('거리별 캐시 데이터 가져오기 오류:', error);
      return [];
    }
  }
}
