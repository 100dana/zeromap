// PlaceData 타입 정의
export interface PlaceData {
  id: string;
  name: string;
  address: string;
  phone?: string;
  category: string;
  latitude: number;
  longitude: number;
  description?: string;
}

import { Config, getApiKey } from '../config/env';

export const SEOUL_API_THEMES = {
  CUP_DISCOUNT_CAFE: '1693986134109',  // [착한소비] 개인 컵 할인 카페
  ZERO_WASTE_SHOP: '11103395',         // [착한소비]제로웨이스트상점
  GOOD_CONSUMPTION: '1666576356838'    // 새로운 테마 ID
} as const;

export class SeoulApiService {
  private static API_KEY = getApiKey();
  private static BASE_URL = Config.SEOUL_API_BASE_URL;

  // API 요청 기본 메서드
  static async getContentsList(themeId: string, options: {
    coord_x?: number;
    coord_y?: number;
    distance?: number;
    page_size?: number;
    page_no?: number;
  } = {}) {
    const {
      coord_x = 126.974695,
      coord_y = 37.564150,
      distance = 2000,
      page_size = 20,
      page_no = 1
    } = options;

    const url = `${this.BASE_URL}/${this.API_KEY}/public/themes/contents/ko?` +
      `page_size=${page_size}&` +
      `page_no=${page_no}&` +
      `coord_x=${coord_x}&` +
      `coord_y=${coord_y}&` +
      `distance=${distance}&` +
      `search_type=0&` +
      `search_name=&` +
      `theme_id=${themeId}&` +
      `content_id=&` +
      `subcate_id=`;

    console.log('API 요청 URL:', url);

    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error('API 응답 오류:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('오류 응답 내용:', errorText);
        throw new Error(`API 요청 실패: ${response.status}`);
      }

      const text = await response.text();
      console.log('API 응답 텍스트:', text.substring(0, 500) + '...');

      try {
        const data = JSON.parse(text);
        console.log('파싱된 API 응답:', data);
        return data;
      } catch (parseError) {
        console.error('JSON 파싱 오류:', parseError);
        console.error('원본 응답:', text);
        throw new Error('API 응답이 JSON 형식이 아닙니다');
      }
    } catch (error) {
      console.error('API 요청 중 오류:', error);
      throw error;
    }
  }

  // 제로웨이스트샵 조회
  static async getZeroWasteShops() {
    try {
      const data = await this.getContentsList(SEOUL_API_THEMES.ZERO_WASTE_SHOP);
      console.log('제로웨이스트샵 데이터:', data);
      
      if (data && data.contents) {
        return data.contents.map((item: any) => ({
          id: item.content_id || item.id,
          name: item.title || item.name,
          address: item.address || item.new_address,
          phone: item.phone || item.contact,
          category: '제로웨이스트샵',
          latitude: parseFloat(item.latitude || item.y),
          longitude: parseFloat(item.longitude || item.x),
          description: item.description || ''
        }));
      }
      
      return [];
    } catch (error) {
      console.error('제로웨이스트샵 조회 실패:', error);
      return [];
    }
  }

  // 개인컵할인카페 조회
  static async getCupDiscountCafes() {
    try {
      const data = await this.getContentsList(SEOUL_API_THEMES.CUP_DISCOUNT_CAFE);
      console.log('개인컵할인카페 데이터:', data);
      
      if (data && data.contents) {
        return data.contents.map((item: any) => ({
          id: item.content_id || item.id,
          name: item.title || item.name,
          address: item.address || item.new_address,
          phone: item.phone || item.contact,
          category: '개인컵할인카페',
          latitude: parseFloat(item.latitude || item.y),
          longitude: parseFloat(item.longitude || item.x),
          description: item.description || ''
        }));
      }
      
      return [];
    } catch (error) {
      console.error('개인컵할인카페 조회 실패:', error);
      return [];
    }
  }

  // 착한소비 장소 조회 (새로운 테마 ID 사용)
  static async getGoodConsumptionPlaces() {
    try {
      const data = await this.getContentsList(SEOUL_API_THEMES.GOOD_CONSUMPTION);
      console.log('착한소비 장소 데이터:', data);
      
      if (data && data.contents) {
        return data.contents.map((item: any) => ({
          id: item.content_id || item.id,
          name: item.title || item.name,
          address: item.address || item.new_address,
          phone: item.phone || item.contact,
          category: '착한소비',
          latitude: parseFloat(item.latitude || item.y),
          longitude: parseFloat(item.longitude || item.x),
          description: item.description || ''
        }));
      }
      
      return [];
    } catch (error) {
      console.error('착한소비 장소 조회 실패:', error);
      return [];
    }
  }
} 