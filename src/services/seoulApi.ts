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

export class SeoulApiService {
  // 실제 발급받은 API 키로 교체하세요
  private static API_KEY = 'YOUR_ACTUAL_API_KEY';
  
  // 서울시 스마트서울맵 OpenAPI 기본 URL
  private static BASE_URL = 'https://map.seoul.go.kr/smgis2/smap';
  
  // 제로웨이스트 관련 테마 목록 가져오기
  static async getZeroWasteThemes(): Promise<ThemeData[]> {
    try {
      const response = await fetch(
        `${this.BASE_URL}/themeList?apiKey=${this.API_KEY}&format=json&category=착한소비`
      );
      
      if (!response.ok) {
        throw new Error(`API 호출 실패: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('테마 목록 API 응답:', data);
      
      return this.parseThemeData(data);
    } catch (error) {
      console.error('제로웨이스트 테마 목록 가져오기 실패:', error);
      return [];
    }
  }
  
  // 특정 테마의 콘텐츠 목록 가져오기
  static async getThemeContents(themeId: string): Promise<PlaceData[]> {
    try {
      const response = await fetch(
        `${this.BASE_URL}/contentList?apiKey=${this.API_KEY}&format=json&themeId=${themeId}`
      );
      
      if (!response.ok) {
        throw new Error(`API 호출 실패: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('콘텐츠 목록 API 응답:', data);
      
      return this.parseContentData(data);
    } catch (error) {
      console.error('테마 콘텐츠 가져오기 실패:', error);
      return [];
    }
  }
  
  // 콘텐츠 상세 정보 가져오기
  static async getContentDetail(contentId: string): Promise<PlaceData | null> {
    try {
      const response = await fetch(
        `${this.BASE_URL}/contentDetail?apiKey=${this.API_KEY}&format=json&contentId=${contentId}`
      );
      
      if (!response.ok) {
        throw new Error(`API 호출 실패: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('콘텐츠 상세 API 응답:', data);
      
      return this.parseContentDetail(data);
    } catch (error) {
      console.error('콘텐츠 상세 정보 가져오기 실패:', error);
      return null;
    }
  }
  
  // 제로웨이스트 상점 데이터 가져오기 (테마 기반)
  static async getZeroWasteShops(): Promise<PlaceData[]> {
    try {
      // 먼저 제로웨이스트 관련 테마들을 가져옴
      const themes = await this.getZeroWasteThemes();
      
      let allPlaces: PlaceData[] = [];
      
      // 각 테마의 콘텐츠를 가져옴
      for (const theme of themes) {
        const contents = await this.getThemeContents(theme.themeId);
        allPlaces = [...allPlaces, ...contents];
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
      // 개인 컵 할인 관련 테마들을 가져옴
      const themes = await this.getZeroWasteThemes();
      
      let allPlaces: PlaceData[] = [];
      
      // 각 테마의 콘텐츠를 가져옴
      for (const theme of themes) {
        const contents = await this.getThemeContents(theme.themeId);
        // 개인 컵 할인 관련 콘텐츠만 필터링
        const cupDiscountContents = contents.filter(content => 
          content.name.includes('컵') || 
          content.name.includes('할인') || 
          content.description?.includes('컵')
        );
        allPlaces = [...allPlaces, ...cupDiscountContents];
      }
      
      return allPlaces;
    } catch (error) {
      console.error('개인 컵 할인 카페 데이터 가져오기 실패:', error);
      return [];
    }
  }
  
  // 비건식당 데이터 가져오기
  static async getVeganRestaurants(): Promise<PlaceData[]> {
    try {
      // 비건 관련 테마들을 가져옴
      const themes = await this.getZeroWasteThemes();
      
      let allPlaces: PlaceData[] = [];
      
      // 각 테마의 콘텐츠를 가져옴
      for (const theme of themes) {
        const contents = await this.getThemeContents(theme.themeId);
        // 비건 관련 콘텐츠만 필터링
        const veganContents = contents.filter(content => 
          content.name.includes('비건') || 
          content.name.includes('채식') || 
          content.description?.includes('비건')
        );
        allPlaces = [...allPlaces, ...veganContents];
      }
      
      return allPlaces;
    } catch (error) {
      console.error('비건식당 데이터 가져오기 실패:', error);
      return [];
    }
  }
  
  // 테마 데이터 파싱
  private static parseThemeData(apiResponse: any): ThemeData[] {
    try {
      const themes = apiResponse.themes || apiResponse.data || [];
      
      return themes.map((theme: any) => ({
        themeId: theme.themeId || theme.id,
        themeName: theme.themeName || theme.name,
        description: theme.description || theme.desc
      }));
    } catch (error) {
      console.error('테마 데이터 파싱 오류:', error);
      return [];
    }
  }
  
  // 콘텐츠 데이터 파싱
  private static parseContentData(apiResponse: any): PlaceData[] {
    try {
      const contents = apiResponse.contents || apiResponse.data || [];
      
      return contents.map((content: any) => ({
        id: content.contentId || content.id || String(Math.random()),
        name: content.title || content.name || '이름 없음',
        category: content.category || '제로웨이스트',
        address: content.address || content.addr || '주소 없음',
        latitude: parseFloat(content.latitude || content.lat || '0'),
        longitude: parseFloat(content.longitude || content.lng || '0'),
        description: content.description || content.desc || ''
      }));
    } catch (error) {
      console.error('콘텐츠 데이터 파싱 오류:', error);
      return [];
    }
  }
  
  // 콘텐츠 상세 데이터 파싱
  private static parseContentDetail(apiResponse: any): PlaceData | null {
    try {
      const content = apiResponse.content || apiResponse.data;
      
      if (!content) return null;
      
      return {
        id: content.contentId || content.id || String(Math.random()),
        name: content.title || content.name || '이름 없음',
        category: content.category || '제로웨이스트',
        address: content.address || content.addr || '주소 없음',
        latitude: parseFloat(content.latitude || content.lat || '0'),
        longitude: parseFloat(content.longitude || content.lng || '0'),
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