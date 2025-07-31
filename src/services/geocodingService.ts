// 주소-좌표 변환 서비스
import { Coordinates } from './addressService';
import { SEOUL_DISTRICT_COORDS, SEOUL_CENTER_COORDS } from '../config/env';

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
    if (!address) return SEOUL_CENTER_COORDS;
    
    // 주소에서 구 이름 찾기
    for (const [district, coords] of Object.entries(SEOUL_DISTRICT_COORDS)) {
      if (address.includes(district)) {
        return coords;
      }
    }
    
    return SEOUL_CENTER_COORDS;
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