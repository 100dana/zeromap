// 서울시 스마트서울맵 OpenAPI 서비스
export interface PlaceData {
  id: string;
  name: string;
  category: string;
  address: string;
  latitude: number;
  longitude: number;
  description?: string;
}

export interface ThemeData {
  themeId: string;
  themeName: string;
  description?: string;
}

export interface ContentsListParams {
  coord_x?: number;
  coord_y?: number;
  distance?: number;
  search_type?: number;
  search_name?: string;
  theme_id?: string;
  content_id?: string;
  subcate_id?: string;
  page_size?: number;
  page_no?: number;
}

export class SeoulApiService {
  // 수정할 부분
  private static API_KEY = 'YOUR_ACTUAL_API_KEY';
  
  // 서울시 스마트서울맵 OpenAPI 기본 URL (새로운 형식)
  private static BASE_URL = 'https://map.seoul.go.kr/openapi/v5';
  
  // getContentsList API 호출
  static async getContentsList(params: ContentsListParams = {}): Promise<PlaceData[]> {
    try {
      const {
        coord_x = 126.974695,
        coord_y = 37.564150,
        distance = 2000,
        search_type = 1,
        search_name = '',
        theme_id = '11103395',
        content_id = '',
        subcate_id = '',
        page_size = 20,
        page_no = 1
      } = params;

      const url = `${this.BASE_URL}/${this.API_KEY}/public/themes/contents/ko?` +
        `page_size=${page_size}&` +
        `page_no=${page_no}&` +
        `coord_x=${coord_x}&` +
        `coord_y=${coord_y}&` +
        `distance=${distance}&` +
        `search_type=${search_type}&` +
        `search_name=${encodeURIComponent(search_name)}&` +
        `theme_id=${theme_id}&` +
        `content_id=${content_id}&` +
        `subcate_id=${subcate_id}`;

      console.log('getContentsList API 호출:', url);

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API 호출 실패: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('getContentsList API 응답:', data);
      
      return this.parseContentsListData(data);
    } catch (error) {
      console.error('getContentsList API 호출 실패:', error);
      return [];
    }
  }

  // 제로웨이스트 관련 콘텐츠 가져오기
  static async getZeroWasteShops(): Promise<PlaceData[]> {
    try {
      // 제로웨이스트 관련 테마 ID들 (실제 테마 ID로 수정 필요)
      const zeroWasteThemeIds = ['11103395']; // 예시 테마 ID
      
      let allPlaces: PlaceData[] = [];
      
      for (const themeId of zeroWasteThemeIds) {
        const places = await this.getContentsList({
          theme_id: themeId,
          distance: 5000, // 5km 반경
          page_size: 50
        });
        allPlaces = [...allPlaces, ...places];
      }
      
      return allPlaces;
    } catch (error) {
      console.error('제로웨이스트 상점 데이터 가져오기 실패:', error);
      return [];
    }
  }

  // 개인 컵 할인 카페 데이터 가져오기
  static async getCupDiscountCafes(): Promise<PlaceData[]> {
    try {
      // 개인 컵 할인 카페 전용 테마 ID
      const cupDiscountThemeId = '1693986134109'; // [착한소비] 개인 컵 할인 카페
      
      return await this.getContentsList({
        theme_id: cupDiscountThemeId,
        distance: 5000, // 5km 반경
        page_size: 50
      });
    } catch (error) {
      console.error('개인 컵 할인 카페 데이터 가져오기 실패:', error);
      return [];
    }
  }

  // 비건식당 데이터 가져오기
  static async getVeganRestaurants(): Promise<PlaceData[]> {
    try {
      const allPlaces = await this.getZeroWasteShops();
      
      // 비건 관련 콘텐츠만 필터링
      return allPlaces.filter(place => 
        place.name.includes('비건') || 
        place.name.includes('채식') || 
        place.description?.includes('비건') ||
        place.category.includes('식당')
      );
    } catch (error) {
      console.error('비건식당 데이터 가져오기 실패:', error);
      return [];
    }
  }

  // 특정 위치 기준으로 콘텐츠 검색
  static async searchContentsByLocation(
    latitude: number, 
    longitude: number, 
    distance: number = 2000,
    themeId?: string
  ): Promise<PlaceData[]> {
    try {
      return await this.getContentsList({
        coord_x: longitude,
        coord_y: latitude,
        distance: distance,
        theme_id: themeId
      });
    } catch (error) {
      console.error('위치 기반 콘텐츠 검색 실패:', error);
      return [];
    }
  }

  // 이름으로 콘텐츠 검색
  static async searchContentsByName(
    searchName: string,
    themeId?: string
  ): Promise<PlaceData[]> {
    try {
      return await this.getContentsList({
        search_name: searchName,
        search_type: 1, // 이름 검색
        theme_id: themeId
      });
    } catch (error) {
      console.error('이름 기반 콘텐츠 검색 실패:', error);
      return [];
    }
  }

  // 콘텐츠 상세 정보 가져오기 (새로운 API)
  static async getNewContentsDetail(
    themeId: string,
    contentId: string
  ): Promise<PlaceData | null> {
    try {
      const url = `${this.BASE_URL}/${this.API_KEY}/public/themes/contents/detail?` +
        `theme_id=${themeId}&` +
        `conts_id=${contentId}`;

      console.log('getNewContentsDetail API 호출:', url);

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API 호출 실패: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('getNewContentsDetail API 응답:', data);
      
      return this.parseContentsDetailData(data);
    } catch (error) {
      console.error('getNewContentsDetail API 호출 실패:', error);
      return null;
    }
  }

  // 콘텐츠 목록 데이터 파싱 (새로운 API 형식)
  private static parseContentsListData(apiResponse: any): PlaceData[] {
    try {
      const contents = apiResponse.contents || apiResponse.data || [];
      
      return contents.map((content: any) => ({
        id: content.content_id || content.id || String(Math.random()),
        name: content.title || content.name || '이름 없음',
        category: content.category_name || content.category || '제로웨이스트',
        address: content.address || content.addr || '주소 없음',
        latitude: parseFloat(content.coord_y || content.latitude || content.lat || '0'),
        longitude: parseFloat(content.coord_x || content.longitude || content.lng || '0'),
        description: content.description || content.desc || ''
      }));
    } catch (error) {
      console.error('콘텐츠 목록 데이터 파싱 오류:', error);
      return [];
    }
  }

  // 콘텐츠 상세 데이터 파싱 (새로운 API 형식)
  private static parseContentsDetailData(apiResponse: any): PlaceData | null {
    try {
      const content = apiResponse.content || apiResponse.data;
      
      if (!content) return null;
      
      return {
        id: content.content_id || content.conts_id || content.id || String(Math.random()),
        name: content.title || content.name || '이름 없음',
        category: content.category_name || content.category || '제로웨이스트',
        address: content.address || content.addr || '주소 없음',
        latitude: parseFloat(content.coord_y || content.latitude || content.lat || '0'),
        longitude: parseFloat(content.coord_x || content.longitude || content.lng || '0'),
        description: content.description || content.desc || ''
      };
    } catch (error) {
      console.error('콘텐츠 상세 데이터 파싱 오류:', error);
      return null;
    }
  }

  // API 키 설정 메서드
  static setApiKey(apiKey: string) {
    this.API_KEY = apiKey;
  }
  
  // API 키 확인 메서드
  static getApiKey(): string {
    return this.API_KEY;
  }
} 