import storeData from '../data/store.geojson';

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
}

export interface StoreFilter {
  zeroPay?: boolean;
  seoulCertified?: boolean;
  hasRefillStation?: boolean;
  category?: string;
}

class StoreDataService {
  private stores: StoreData[] = [];

  constructor() {
    this.parseStoreData();
  }

  private parseStoreData() {
    try {
      const features = storeData.features;
      
      this.stores = features.map((feature: any) => {
        const properties = feature.properties;
        const geometry = feature.geometry;
        
        // 좌표 추출 (첫 번째 Point geometry에서)
        const coordinates = geometry.geometries?.[0]?.coordinates || [0, 0];
        
        // NAME_XX와 VALUE_XX를 객체로 변환
        const nameValuePairs: { [key: string]: string } = {};
        for (let i = 1; i <= 20; i++) {
          const nameKey = `NAME_${i.toString().padStart(2, '0')}`;
          const valueKey = `VALUE_${i.toString().padStart(2, '0')}`;
          
          if (properties[nameKey] && properties[valueKey]) {
            nameValuePairs[properties[nameKey]] = properties[valueKey];
          }
        }

        // 카테고리 분류
        let category = '기타';
        const activities = nameValuePairs['제로웨이스트 활동내용'] || nameValuePairs['제로웨이스트 실천 내용'] || '';
        const products = nameValuePairs['취급품목(메뉴)'] || '';
        
        if (activities.includes('리필스테이션') || products.includes('리필')) {
          category = '리필샵';
        } else if (activities.includes('커피') || products.includes('커피') || activities.includes('음료')) {
          category = '카페';
        } else if (products.includes('세제') || products.includes('생필품') || activities.includes('세제')) {
          category = '친환경생필품점';
        } else if (activities.includes('식당') || products.includes('음식')) {
          category = '식당';
        }

        return {
          id: feature.id || Math.random().toString(),
          name: properties.CONTENTS_NAME || '이름 없음',
          address: properties.ADDR_NEW || properties.ADDR_OLD || '주소 없음',
          latitude: coordinates[1],
          longitude: coordinates[0],
          phone: properties.TEL_NO || undefined,
          description: properties.CONTENTS_DETAIL || undefined,
          website: properties.EXTRA_DATA_02 || undefined,
          instagram: nameValuePairs['인스타그램'] || undefined,
          zeroPay: nameValuePairs['제로페이'] || undefined,
          seoulCertified: nameValuePairs['서울시 인증 여부'] || undefined,
          activities: activities,
          operatingHours: nameValuePairs['운영시간'] || undefined,
          products: products,
          category: category
        };
      }).filter(store => 
        store.latitude !== 0 && 
        store.longitude !== 0 && 
        store.name !== '이름 없음'
      );
    } catch (error) {
      console.error('Store data parsing error:', error);
      this.stores = [];
    }
  }

  // 모든 매장 데이터 가져오기
  getAllStores(): StoreData[] {
    return this.stores;
  }

  // 필터링된 매장 데이터 가져오기
  getFilteredStores(filters: StoreFilter): StoreData[] {
    return this.stores.filter(store => {
      // 제로페이 필터
      if (filters.zeroPay !== undefined) {
        const hasZeroPay = store.zeroPay === '가능';
        if (filters.zeroPay !== hasZeroPay) return false;
      }

      // 서울시 인증 필터
      if (filters.seoulCertified !== undefined) {
        const isCertified = store.seoulCertified && 
          (store.seoulCertified.includes('서울시제로마켓') || 
           store.seoulCertified.includes('서울형다회용컵'));
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