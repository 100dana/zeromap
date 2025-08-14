// 주소-좌표 변환 서비스
export interface Coordinates {
  latitude: number;
  longitude: number;
}

export class GeocodingService {
  // 카카오 REST API 키 (좌표 변환용)
  private static readonly KAKAO_REST_API_KEY = '7cebd6bb4502a8537b8030c7c134e311';
  
  // 카카오 지도 API를 사용한 주소-좌표 변환
  static async addressToCoordinates(address: string): Promise<Coordinates | null> {
    try {
      const response = await fetch(
        `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`,
        {
          headers: {
            'Authorization': `KakaoAK ${this.KAKAO_REST_API_KEY}`
          }
        }
      );
      
      if (!response.ok) {
        console.error(`주소 변환 API 응답 오류: ${response.status} ${response.statusText}`);
        return null;
      }
      
      const data = await response.json();
      
      if (data.documents && data.documents.length > 0) {
        const document = data.documents[0];
        return {
          latitude: parseFloat(document.y),
          longitude: parseFloat(document.x)
        };
      }
      
      return null;
    } catch (error) {
      console.error('주소-좌표 변환 실패:', error);
      return null;
    }
  }
  
  // 간단한 주소 매칭 (카카오 API 사용 불가능한 경우)
  static simpleAddressToCoordinates(address: string): Coordinates {
    console.log(`🔍 주소 변환 시작: "${address}"`);
    
    // 서울시청 좌표 (기준점)
    const seoulCityHall = { latitude: 37.5665, longitude: 126.9780 };
    
    if (!address) {
      console.log(`  → 주소가 없음, 서울시청 좌표 반환: ${seoulCityHall.latitude}, ${seoulCityHall.longitude}`);
      return seoulCityHall;
    }
    
    // 서울시청 근처 주요 지역 좌표 (반경 2km 이내 우선)
    const nearbyCoords: { [key: string]: Coordinates } = {
      // 서울시청 바로 근처 (0-1km)
      '종로': { latitude: 37.5735, longitude: 126.9789 },
      '중구': { latitude: 37.5640, longitude: 126.9979 },
      '서대문': { latitude: 37.5791, longitude: 126.9368 },
      '용산': { latitude: 37.5384, longitude: 126.9654 },
      '성동': { latitude: 37.5634, longitude: 127.0369 },
      
      // 서울시청에서 1-2km 거리
      '마포': { latitude: 37.5636, longitude: 126.9084 },
      '동대문': { latitude: 37.5744, longitude: 127.0395 },
      '성북': { latitude: 37.5894, longitude: 127.0167 },
      '광진': { latitude: 37.5384, longitude: 127.0822 },
      '서초': { latitude: 37.4837, longitude: 127.0324 },
      
      // 서울시청에서 2-3km 거리
      '강남': { latitude: 37.5172, longitude: 127.0473 },
      '동작': { latitude: 37.5124, longitude: 126.9393 },
      '관악': { latitude: 37.4784, longitude: 126.9516 },
      '은평': { latitude: 37.6027, longitude: 126.9291 },
      '중랑': { latitude: 37.6064, longitude: 127.0926 },
      
      // 서울시청에서 3km 이상 거리 (추후 확장)
      '강동': { latitude: 37.5301, longitude: 127.1238 },
      '강북': { latitude: 37.6396, longitude: 127.0257 },
      '강서': { latitude: 37.5509, longitude: 126.8495 },
      '구로': { latitude: 37.4954, longitude: 126.8874 },
      '금천': { latitude: 37.4569, longitude: 126.8956 },
      '노원': { latitude: 37.6542, longitude: 127.0568 },
      '도봉': { latitude: 37.6688, longitude: 127.0471 },
      '송파': { latitude: 37.5145, longitude: 127.1059 },
      '양천': { latitude: 37.5270, longitude: 126.8566 },
      '영등포': { latitude: 37.5264, longitude: 126.8892 }
    };
    
    // 주소에서 구 이름 찾기 (우선순위: 가까운 지역부터)
    for (const [district, coords] of Object.entries(nearbyCoords)) {
      if (address.includes(district)) {
        console.log(`  → "${district}" 구 매칭됨: ${coords.latitude}, ${coords.longitude}`);
        return coords;
      }
    }
    
    console.log(`  → 구 매칭 실패, 서울시청 좌표 반환: ${seoulCityHall.latitude}, ${seoulCityHall.longitude}`);
    return seoulCityHall;
  }
  
  // 두 지점 간의 거리 계산 (km 단위)
  static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // 지구의 반지름 (km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // 서울시청 기준 거리 필터링
  static filterByDistanceFromSeoulCityHall(coordinates: Coordinates[], maxDistanceKm: number = 2): Coordinates[] {
    const seoulCityHall = { latitude: 37.5665, longitude: 126.9780 };
    
    return coordinates.filter(coord => {
      const distance = this.calculateDistance(
        seoulCityHall.latitude, 
        seoulCityHall.longitude, 
        coord.latitude, 
        coord.longitude
      );
      return distance <= maxDistanceKm;
    });
  }

  // 여러 주소를 일괄 변환
  static async batchAddressToCoordinates(addresses: string[]): Promise<Coordinates[]> {
    const coordinates: Coordinates[] = [];
    
    for (const address of addresses) {
      try {
        const coords = await this.addressToCoordinates(address);
        if (coords) {
          coordinates.push(coords);
        }
      } catch (error) {
        console.error(`주소 변환 실패: ${address}`, error);
      }
    }
    
    return coordinates;
  }

  // 좌표-주소 변환 (카카오 지도 API 사용)
  static async coordinatesToAddress(latitude: number, longitude: number): Promise<string | null> {
    try {
      const response = await fetch(
        `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${longitude}&y=${latitude}`,
        {
          headers: {
            'Authorization': `KakaoAK ${this.KAKAO_REST_API_KEY}`
          }
        }
      );
      
      if (!response.ok) {
        console.error(`좌표 변환 API 응답 오류: ${response.status} ${response.statusText}`);
        return null;
      }
      
      const data = await response.json();
      
      if (data.documents && data.documents.length > 0) {
        const document = data.documents[0];
        const address = document.address;
        // 지번 주소 우선, 없으면 도로명 주소 사용
        return address.address_name || address.road_address?.address_name || null;
      }
      
      return null;
    } catch (error) {
      console.error('좌표-주소 변환 실패:', error);
      return null;
    }
  }
} 