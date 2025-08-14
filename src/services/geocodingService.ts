// 주소-좌표 변환 서비스
export interface Coordinates {
  latitude: number;
  longitude: number;
}

export class GeocodingService {
  // 카카오 REST API 키 (좌표 변환용)
  private static readonly KAKAO_REST_API_KEY = '7cebd6bb4502a8537b8030c7c134e311';
  
  // 주소-좌표 변환 (카카오 지도 API 사용)
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