// 주소 → 좌표 변환 서비스 (Node.js 서버 중계)
import { SEOUL_DISTRICT_COORDS, SEOUL_CENTER_COORDS } from '../config/env';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface AddressResponse {
  success: boolean;
  coordinates: Coordinates;
  address: string;
  note?: string;
}

export class AddressService {
  // 서버 URL 설정
  private static SERVER_URL = 'http://localhost:3000'; // 개발 환경
  // private static SERVER_URL = 'https://your-production-server.com'; // 프로덕션 환경

  // 주소를 좌표로 변환
  static async addressToCoordinates(address: string): Promise<Coordinates | null> {
    try {
      console.log(`📍 주소 변환 요청: ${address}`);

      const response = await fetch(`${this.SERVER_URL}/api/coord`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
      });

      if (!response.ok) {
        throw new Error(`주소 변환 실패: ${response.status}`);
      }

      const data: AddressResponse = await response.json();

      if (data.success) {
        console.log(`✅ 주소 변환 성공: ${address} → ${data.coordinates.latitude}, ${data.coordinates.longitude}`);
        if (data.note) {
          console.log(`📝 참고: ${data.note}`);
        }
        return data.coordinates;
      } else {
        console.error('❌ 주소 변환 실패:', data);
        return null;
      }

    } catch (error) {
      console.error('주소 변환 오류:', error);
      
      // 오류 시 간단한 매칭 사용
      const fallbackCoords = this.simpleAddressToCoordinates(address);
      console.log(`🔄 간단한 매칭 사용: ${address} → ${fallbackCoords.latitude}, ${fallbackCoords.longitude}`);
      
      return fallbackCoords;
    }
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
          // 실패 시 간단한 매칭 사용
          coordinates.push(this.simpleAddressToCoordinates(address));
        }
      } catch (error) {
        console.error(`주소 변환 실패: ${address}`, error);
        coordinates.push(this.simpleAddressToCoordinates(address));
      }
    }

    return coordinates;
  }

  // 간단한 주소 매칭 (서버 실패 시 사용)
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

  // 서버 URL 설정 (환경별)
  static setServerUrl(url: string) {
    this.SERVER_URL = url;
  }

  // 서버 연결 테스트
  static async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.SERVER_URL}/api/policies/stats`);
      return response.ok;
    } catch (error) {
      console.error('서버 연결 테스트 실패:', error);
      return false;
    }
  }
} 