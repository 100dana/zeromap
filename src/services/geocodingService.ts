// 주소-좌표 변환 서비스
export interface Coordinates {
  latitude: number;
  longitude: number;
}

export class GeocodingService {
  // 카카오 지도 API를 사용한 주소-좌표 변환
  static async addressToCoordinates(address: string): Promise<Coordinates | null> {
    try {
      const KAKAO_API_KEY = '504f485ba32aedc877afaa80a956af83';
      const response = await fetch(
        `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`,
        {
          headers: {
            'Authorization': `KakaoAK ${KAKAO_API_KEY}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`주소 변환 실패: ${response.status}`);
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
    const defaultCoords = { latitude: 37.5665, longitude: 126.9780 };
    
    if (!address) return defaultCoords;
    
    // 서울시 구별 대표 좌표
    const districtCoords: { [key: string]: Coordinates } = {
      '강남': { latitude: 37.5172, longitude: 127.0473 },
      '강동': { latitude: 37.5301, longitude: 127.1238 },
      '강북': { latitude: 37.6396, longitude: 127.0257 },
      '강서': { latitude: 37.5509, longitude: 126.8495 },
      '관악': { latitude: 37.4784, longitude: 126.9516 },
      '광진': { latitude: 37.5384, longitude: 127.0822 },
      '구로': { latitude: 37.4954, longitude: 126.8874 },
      '금천': { latitude: 37.4569, longitude: 126.8956 },
      '노원': { latitude: 37.6542, longitude: 127.0568 },
      '도봉': { latitude: 37.6688, longitude: 127.0471 },
      '동대문': { latitude: 37.5744, longitude: 127.0395 },
      '동작': { latitude: 37.5124, longitude: 126.9393 },
      '마포': { latitude: 37.5636, longitude: 126.9084 },
      '서대문': { latitude: 37.5791, longitude: 126.9368 },
      '서초': { latitude: 37.4837, longitude: 127.0324 },
      '성동': { latitude: 37.5634, longitude: 127.0369 },
      '성북': { latitude: 37.5894, longitude: 127.0167 },
      '송파': { latitude: 37.5145, longitude: 127.1059 },
      '양천': { latitude: 37.5270, longitude: 126.8566 },
      '영등포': { latitude: 37.5264, longitude: 126.8892 },
      '용산': { latitude: 37.5384, longitude: 126.9654 },
      '은평': { latitude: 37.6027, longitude: 126.9291 },
      '종로': { latitude: 37.5735, longitude: 126.9789 },
      '중구': { latitude: 37.5640, longitude: 126.9979 },
      '중랑': { latitude: 37.6064, longitude: 127.0926 }
    };
    
    // 주소에서 구 이름 찾기
    for (const [district, coords] of Object.entries(districtCoords)) {
      if (address.includes(district)) {
        return coords;
      }
    }
    
    return defaultCoords;
  }
  
  // 여러 주소를 일괄 변환
  static async batchAddressToCoordinates(addresses: string[]): Promise<Coordinates[]> {
    const coordinates: Coordinates[] = [];
    
    for (const address of addresses) {
      try {
        const coords = await this.addressToCoordinates(address);
        if (coords) {
          coordinates.push(coords);
        } else {
          // API 실패 시 간단한 매칭 사용
          coordinates.push(this.simpleAddressToCoordinates(address));
        }
      } catch (error) {
        console.error(`주소 변환 실패: ${address}`, error);
        coordinates.push(this.simpleAddressToCoordinates(address));
      }
    }
    
    return coordinates;
  }
} 