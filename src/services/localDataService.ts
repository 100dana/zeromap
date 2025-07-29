import * as XLSX from 'xlsx';
import { PlaceData } from './seoulApi';
import { GeocodingService } from './geocodingService';

export interface LocalPlaceData extends PlaceData {
  category: string;
  address: string;
  latitude: number;
  longitude: number;
  description?: string;
  additionalInfo?: any;
}

export class LocalDataService {
  
  // 제로식당 데이터 가져오기
  static async getZeroRestaurants(): Promise<LocalPlaceData[]> {
    try {
      // CSV 파일 읽기
      const workbook = XLSX.readFile('./src/data/서울시 제로식당 목록.csv');
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // JSON으로 변환
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      console.log('제로식당 데이터:', jsonData);
      
      return await this.parseZeroRestaurantData(jsonData);
    } catch (error) {
      console.error('제로식당 데이터 읽기 실패:', error);
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
    const placesWithCoords = await Promise.all(
      jsonData.map(async (item: any, index: number) => {
        // 상호명과 지번 주소만 사용
        const name = item.상호명 || item.name || item.매장명 || '제로식당';
        const address = item.지번주소 || item.주소 || item.address || '';
        
        // 주소를 좌표로 변환
        const coords = await GeocodingService.addressToCoordinates(address);
        const coordinates = coords || GeocodingService.simpleAddressToCoordinates(address);
        
        return {
          id: String(index + 1),
          name: name,
          category: '제로식당',
          address: address,
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          description: '제로웨이스트 식당',
          additionalInfo: {
            type: 'zero_restaurant',
            source: 'excel_data',
            originalData: item
          }
        };
      })
    );
    
    return placesWithCoords;
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
        case 'all':
          return await this.getAllLocalData();
        default:
          return [];
      }
    } catch (error) {
      console.error(`${category} 데이터 가져오기 실패:`, error);
      return [];
    }
  }
} 