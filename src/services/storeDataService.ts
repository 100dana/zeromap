import { GeocodingService } from './geocodingService';
import { CacheInitializer, CachedRestaurantData } from './cacheInitializer';

export interface StoreData {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone?: string;
  description?: string;
  website?: string;
  instagram?: string;
  zeroPay?: string;
  seoulCertified?: string;
  activities?: string;
  operatingHours?: string;
  products?: string;
  category?: string;
  isZeroRestaurant?: boolean;
}

export interface StoreFilter {
  zeroPay?: boolean;
  seoulCertified?: boolean;
  hasRefillStation?: boolean;
  category?: string;
  showZeroRestaurants?: boolean;
}

class StoreDataService {
  private stores: StoreData[] = [];
  private static instance: StoreDataService;

  constructor() {
    console.log('🏗️ StoreDataService 생성자 시작');
    this.addZeroRestaurants();
    console.log('🏗️ StoreDataService 생성자 완료');
  }

  // 싱글톤 인스턴스 가져오기
  static getInstance(): StoreDataService {
    if (!StoreDataService.instance) {
      StoreDataService.instance = new StoreDataService();
    }
    return StoreDataService.instance;
  }

  private async addZeroRestaurants() {
    try {
      const zeroRestaurantData = require('../data/서울시 제로식당 목록.json');
      
      console.log(`📊 제로식당 데이터 로드 시작: ${zeroRestaurantData.length}개`);
      
      // 제로식당 데이터를 기존 스토어 데이터에 추가
      const zeroRestaurantsPromises = zeroRestaurantData.map(async (restaurant: any, index: number) => {
        try {
          // 지번주소를 좌표로 변환 (카카오 API 사용)
          let coords = await GeocodingService.addressToCoordinates(restaurant.지번주소);
          
          // API 호출 실패 시 간단한 주소 매칭 사용
          if (!coords) {
            coords = GeocodingService.simpleAddressToCoordinates(restaurant.지번주소);
          }
          
          const restaurantData = {
            id: `zero_restaurant_${index}`,
            name: restaurant.상호명,
            address: restaurant.지번주소,
            latitude: coords?.latitude || 0,
            longitude: coords?.longitude || 0,
            category: '제로식당',
            isZeroRestaurant: true,
            description: '서울시 제로식당 인증 업체',
            zeroPay: '가능',
            seoulCertified: '서울시제로식당'
          };
          
          return restaurantData;
        } catch (error) {
          console.warn(`⚠️ ${restaurant.상호명} 좌표 변환 실패:`, error);
          // 좌표 변환 실패 시 간단한 주소 매칭 사용
          const coords = GeocodingService.simpleAddressToCoordinates(restaurant.지번주소);
          return {
            id: `zero_restaurant_${index}`,
            name: restaurant.상호명,
            address: restaurant.지번주소,
            latitude: coords.latitude,
            longitude: coords.longitude,
            category: '제로식당',
            isZeroRestaurant: true,
            description: '서울시 제로식당 인증 업체',
            zeroPay: '가능',
            seoulCertified: '서울시제로식당'
          };
        }
      });

      // 모든 Promise가 완료될 때까지 대기
      const zeroRestaurants = await Promise.all(zeroRestaurantsPromises);

      // 제로식당 데이터만 저장
      this.stores = zeroRestaurants;
      
      // 좌표 유효성 검증
      const validRestaurants = zeroRestaurants.filter(restaurant => 
        restaurant.latitude && restaurant.longitude && 
        restaurant.latitude !== 0 && restaurant.longitude !== 0
      );
      
      console.log(`✅ 제로식당 데이터 로드 완료: ${validRestaurants.length}/${zeroRestaurants.length}개 유효한 좌표`);
      
      if (validRestaurants.length < zeroRestaurants.length) {
        console.warn(`⚠️ ${zeroRestaurants.length - validRestaurants.length}개의 제로식당에 유효하지 않은 좌표가 있습니다.`);
      }
      
    } catch (error) {
      console.error('제로식당 데이터 추가 오류:', error);
    }
  }

  // 모든 매장 데이터 가져오기
  getAllStores(): StoreData[] {
    console.log(`📋 getAllStores 호출됨 - 현재 저장된 매장 수: ${this.stores.length}개`);
    return this.stores;
  }

  // 필터링된 매장 데이터 가져오기
  getFilteredStores(filters: StoreFilter): StoreData[] {
    return this.stores.filter(store => {
      // 제로식당 필터 (모든 데이터가 제로식당이므로 항상 통과)
      if (filters.showZeroRestaurants !== undefined) {
        if (!filters.showZeroRestaurants) return false;
      }

      // 제로페이 필터
      if (filters.zeroPay !== undefined) {
        const hasZeroPay = store.zeroPay === '가능';
        if (filters.zeroPay !== hasZeroPay) return false;
      }

      // 서울시 인증 필터
      if (filters.seoulCertified !== undefined) {
        const isCertified = store.seoulCertified && 
          (store.seoulCertified.includes('서울시제로마켓') || 
           store.seoulCertified.includes('서울형다회용컵') ||
           store.seoulCertified.includes('서울시제로식당'));
        if (filters.seoulCertified !== isCertified) return false;
      }

      // 리필스테이션 필터
      if (filters.hasRefillStation !== undefined) {
        const hasRefill = store.activities?.includes('리필스테이션') || 
                         store.products?.includes('리필');
        if (filters.hasRefillStation !== hasRefill) return false;
      }

      // 카테고리 필터
      if (filters.category && filters.category !== 'all') {
        if (store.category !== filters.category) return false;
      }

      return true;
    });
  }

  // 제로식당만 가져오기 (캐시 기반)
  async getZeroRestaurants(maxDistanceKm: number = 5): Promise<StoreData[]> {
    try {
      // 캐시 기능이 임시로 비활성화되어 폴백 방식 사용
      return this.getZeroRestaurantsFallback(maxDistanceKm);
      
      // 캐시 상태 확인
      const cacheStatus = await CacheInitializer.getCacheStatus();
      
      // 캐시가 없거나 불완전한 경우 초기화
      if (cacheStatus.cached === 0 || cacheStatus.cached < cacheStatus.total * 0.9) {
        await CacheInitializer.initializeCache();
      }
      
      // 캐시된 데이터 가져오기
      const cachedRestaurants = await CacheInitializer.getCachedRestaurantsByDistance(maxDistanceKm);
      
      // StoreData 형식으로 변환
      const storeData = cachedRestaurants.map(restaurant => ({
        id: restaurant.id,
        name: restaurant.name,
        address: restaurant.address,
        latitude: restaurant.latitude,
        longitude: restaurant.longitude,
        category: restaurant.category,
        isZeroRestaurant: restaurant.isZeroRestaurant,
        description: restaurant.description,
        zeroPay: restaurant.zeroPay,
        seoulCertified: restaurant.seoulCertified
      }));
      
      return storeData;
      
    } catch (error) {
      // 캐시 실패 시 기존 방식으로 폴백
      return this.getZeroRestaurantsFallback(maxDistanceKm);
    }
  }

  // 폴백: 기존 방식으로 제로식당 가져오기
  private getZeroRestaurantsFallback(maxDistanceKm: number = 5): StoreData[] {
    const seoulCityHall = { latitude: 37.5665, longitude: 126.9780 };
    const nearbyStores = this.stores.filter(store => {
      const distance = GeocodingService.calculateDistance(
        seoulCityHall.latitude,
        seoulCityHall.longitude,
        store.latitude,
        store.longitude
      );
      return distance <= maxDistanceKm;
    });
    
    return nearbyStores;
  }

  // 검색 기능
  searchStores(query: string): StoreData[] {
    const searchTerm = query.toLowerCase();
    
    return this.stores.filter(store => 
      store.name.toLowerCase().includes(searchTerm) ||
      store.address.toLowerCase().includes(searchTerm) ||
      store.activities?.toLowerCase().includes(searchTerm) ||
      store.products?.toLowerCase().includes(searchTerm)
    );
  }

  // 카테고리별 매장 수 가져오기
  getStoreCountByCategory(): { [key: string]: number } {
    const counts: { [key: string]: number } = {};
    
    this.stores.forEach(store => {
      const category = store.category || '기타';
      counts[category] = (counts[category] || 0) + 1;
    });
    
    return counts;
  }

  // 특정 매장 정보 가져오기
  getStoreById(id: string): StoreData | undefined {
    return this.stores.find(store => store.id === id);
  }

  // 좌표 기반 근처 매장 찾기
  getNearbyStores(latitude: number, longitude: number, radiusKm: number = 5): StoreData[] {
    return this.stores.filter(store => {
      const distance = this.calculateDistance(
        latitude, longitude, 
        store.latitude, store.longitude
      );
      return distance <= radiusKm;
    });
  }

  // 두 지점 간 거리 계산 (km)
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // 지구 반지름 (km)
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }
}

export default new StoreDataService(); 