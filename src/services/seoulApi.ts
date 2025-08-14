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
  // 환경변수에서 API 키 가져오기 (React Native에서는 직접 설정)
  private static API_KEY = 'KEY218_1a567f902d84441299f32476f2de867f';
  
  // 서울시 스마트서울맵 OpenAPI 기본 URL (새로운 형식)
  private static BASE_URL = 'https://map.seoul.go.kr/openapi/v5';
  
  // 테마 ID 상수 정의
  private static THEME_IDS = {
    ZERO_WASTE_SHOPS: '11103395',        // [착한소비]제로웨이스트상점
    CUP_DISCOUNT_CAFES: '1693986134109'  // [착한소비] 개인 컵 할인 카페
  };
  
  // 모든 페이지의 데이터를 가져오는 함수
  static async getAllContentsList(params: ContentsListParams = {}): Promise<PlaceData[]> {
    try {
      const {
        coord_x = 126.974695,
        coord_y = 37.564150,
        distance = 2000,
        search_type = 1,
        search_name = '',
        theme_id = this.THEME_IDS.ZERO_WASTE_SHOPS,
        content_id = '',
        subcate_id = '',
        page_size = 50,
        page_no = 1
      } = params;

      let allPlaces: PlaceData[] = [];
      let currentPage = 1;
      let totalPages = 1;
      let hasMoreData = true;

      while (hasMoreData) {
        const url = `${this.BASE_URL}/${this.API_KEY}/public/themes/contents/ko?` +
          `page_size=${page_size}&` +
          `page_no=${currentPage}&` +
          `coord_x=${coord_x}&` +
          `coord_y=${coord_y}&` +
          `distance=${distance}&` +
          `search_type=${search_type}&` +
          `search_name=${encodeURIComponent(search_name)}&` +
          `theme_id=${theme_id}&` +
          `content_id=${content_id}&` +
          `subcate_id=${subcate_id}`;

        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`API 호출 실패: ${response.status}`);
        }
        
        const data = await response.json();
        
        // 첫 페이지에서 전체 페이지 수 확인
        if (currentPage === 1) {
          totalPages = parseInt(data.head?.PAGE_COUNT || data.header?.PAGE_COUNT || '1');
        }
        
        const pageData = this.parseContentsListData(data);
        allPlaces = [...allPlaces, ...pageData];
        
        currentPage++;
        hasMoreData = currentPage <= totalPages;
      }
      
      return allPlaces;
    } catch (error) {
      return [];
    }
  }

  // getContentsList API 호출 (기존 함수 - 단일 페이지)
  static async getContentsList(params: ContentsListParams = {}): Promise<PlaceData[]> {
    try {
      const {
        coord_x = 126.974695,
        coord_y = 37.564150,
        distance = 2000,
        search_type = 1,
        search_name = '',
        theme_id = this.THEME_IDS.ZERO_WASTE_SHOPS,
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

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API 호출 실패: ${response.status}`);
      }
      
      const data = await response.json();
      
      const parsedData = this.parseContentsListData(data);
      
      return parsedData;
    } catch (error) {
      return [];
    }
  }

  // 제로웨이스트 관련 콘텐츠 가져오기 (모든 페이지)
  static async getZeroWasteShops(): Promise<PlaceData[]> {
    try {
      // 제로웨이스트 관련 테마 ID들
      const zeroWasteThemeIds = [this.THEME_IDS.ZERO_WASTE_SHOPS];
      
      let allPlaces: PlaceData[] = [];
      
      for (const themeId of zeroWasteThemeIds) {
        const places = await this.getAllContentsList({
          theme_id: themeId,
          distance: 5000, // 5km 반경
          page_size: 50
        });
        allPlaces = [...allPlaces, ...places];
      }
      
      return allPlaces;
    } catch (error) {
      return [];
    }
  }

  // 개인 컵 할인 카페 데이터 가져오기 (모든 페이지)
  static async getCupDiscountCafes(): Promise<PlaceData[]> {
    try {
      const places = await this.getAllContentsList({
        theme_id: this.THEME_IDS.CUP_DISCOUNT_CAFES,
        distance: 5000, // 5km 반경
        page_size: 50
      });
      
      return places;
    } catch (error) {
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

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API 호출 실패: ${response.status}`);
      }
      
      const data = await response.json();
      
      return this.parseContentsDetailData(data);
    } catch (error) {
      return null;
    }
  }

  // 콘텐츠 목록 데이터 파싱 (새로운 API 형식)
  private static parseContentsListData(apiResponse: any): PlaceData[] {
    try {
      // API 응답 구조에 맞게 수정: body 배열에서 데이터 가져오기
      const contents = apiResponse.body || apiResponse.contents || apiResponse.data || [];
      
      if (contents.length === 0) {
        return [];
      }
      
      const parsedData = contents.map((content: any, index: number) => {
        
        const parsed = {
          id: content.COT_CONTS_ID || content.content_id || content.id || String(Math.random()),
          name: content.COT_CONTS_NAME || content.title || content.name || '이름 없음',
          category: content.THM_THEME_NAME || content.category_name || content.category || '제로웨이스트',
          address: content.COT_ADDR_FULL_NEW || content.address || content.addr || '주소 없음',
          latitude: parseFloat(content.COT_COORD_Y || content.coord_y || content.latitude || content.lat || '0'),
          longitude: parseFloat(content.COT_COORD_X || content.coord_x || content.longitude || content.lng || '0'),
          description: content.COT_VALUE_03 || content.description || content.desc || ''
        };
        
        return parsed;
      });
      
      return parsedData;
    } catch (error) {
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

  // 테마 ID 가져오기
  static getThemeIds() {
    return this.THEME_IDS;
  }

  // 모든 테마의 데이터를 가져오기
  static async getAllThemesData(): Promise<PlaceData[]> {
    try {
      const allPlaces: PlaceData[] = [];
      
      // 제로웨이스트 상점
      const zeroWasteShops = await this.getZeroWasteShops();
      allPlaces.push(...zeroWasteShops);
      
      // 개인 컵 할인 카페
      const cupDiscountCafes = await this.getCupDiscountCafes();
      allPlaces.push(...cupDiscountCafes);
      
      return allPlaces;
    } catch (error) {
      return [];
    }
  }

  // 특정 테마의 모든 데이터 가져오기
  static async getThemeData(themeId: string): Promise<PlaceData[]> {
    try {
      const places = await this.getAllContentsList({
        theme_id: themeId,
        distance: 5000, // 5km 반경
        page_size: 50
      });
      
      return places;
    } catch (error) {
      return [];
    }
  }
} 