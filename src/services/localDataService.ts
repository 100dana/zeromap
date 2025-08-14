import { PlaceData } from './seoulApi';
import { GeocodingService } from './geocodingService';

// JSON 데이터를 직접 import
import zeroRestaurantData from '../data/서울시 제로식당 목록.json';

export interface LocalPlaceData extends PlaceData {
  category: string;
  address: string;
  latitude: number;
  longitude: number;
  description?: string;
  additionalInfo?: any;
}

export class LocalDataService {
  
  // 제로식당 데이터 가져오기 (JSON 파일 사용)
  static async getZeroRestaurants(): Promise<LocalPlaceData[]> {
    try {
      const zeroRestaurantData = require('../data/서울시 제로식당 목록.json');
      
      return await this.parseZeroRestaurantData(zeroRestaurantData);
    } catch (error) {
      console.error('제로식당 JSON 데이터 읽기 실패:', error);
      return [];
    }
  }
  
  // 리필스테이션 데이터 가져오기 (데이터 없음)
  static async getRefillStations(): Promise<LocalPlaceData[]> {
    try {
      // 현재 리필스테이션 데이터가 없으므로 빈 배열 반환
      console.log('리필스테이션 데이터: 데이터가 없습니다.');
      return [];
    } catch (error) {
      console.error('리필스테이션 데이터 읽기 실패:', error);
      return [];
    }
  }
  
  // 제로식당 데이터 파싱
  private static async parseZeroRestaurantData(jsonData: any[]): Promise<LocalPlaceData[]> {
    const placesWithCoordsPromises = jsonData.map(async (item: any, index: number) => {
      // 상호명과 지번 주소만 사용
      const name = item.상호명 || item.name || item.매장명 || '제로식당';
      const address = item.지번주소 || item.주소 || item.address || '';
      
      // 카카오 API를 사용한 주소 변환
      const coordinates = await GeocodingService.addressToCoordinates(address);
      
      return {
        id: String(index + 1),
        name: name,
        category: '제로식당',
        address: address,
        latitude: coordinates?.latitude || 0,
        longitude: coordinates?.longitude || 0,
        description: '제로웨이스트 식당',
        additionalInfo: {
          type: 'zero_restaurant',
          source: 'json_data',
          originalData: item
        }
      };
    });
    
    return await Promise.all(placesWithCoordsPromises);
  }
  
  // 모든 로컬 데이터 가져오기
  static async getAllLocalData(): Promise<LocalPlaceData[]> {
    try {
      const [restaurants, refillStations] = await Promise.all([
        this.getZeroRestaurants(),
        this.getRefillStations()
      ]);
      
      return [...restaurants, ...refillStations];
    } catch (error) {
      console.error('로컬 데이터 가져오기 실패:', error);
      return [];
    }
  }
  
  // 카테고리별 데이터 가져오기
  static async getDataByCategory(category: string): Promise<LocalPlaceData[]> {
    try {
      switch (category) {
        case 'zeroRestaurant':
          return await this.getZeroRestaurants();
        case 'refillStation':
          return await this.getRefillStations();
        default:
          return [];
      }
    } catch (error) {
      console.error(`카테고리 "${category}" 데이터 가져오기 실패:`, error);
      return [];
    }
  }
} 