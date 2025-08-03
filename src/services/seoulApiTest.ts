// 서울시 API 테스트 파일
import { SeoulApiService } from './seoulApi';

export class SeoulApiTest {
  
  // API 키 및 테마 ID 확인
  static async testApiConfiguration() {
    // API 키 및 테마 ID 확인 로직
  }

  // 제로웨이스트 상점 데이터 테스트
  static async testZeroWasteShops() {
    try {
      const shops = await SeoulApiService.getZeroWasteShops();
      return shops;
    } catch (error) {
      return [];
    }
  }

  // 개인 컵 할인 카페 데이터 테스트
  static async testCupDiscountCafes() {
    try {
      const cafes = await SeoulApiService.getCupDiscountCafes();
      return cafes;
    } catch (error) {
      return [];
    }
  }

  // 위치 기반 검색 테스트
  static async testLocationBasedSearch() {
    try {
      // 서울시청 좌표로 테스트
      const places = await SeoulApiService.searchContentsByLocation(
        37.5665,  // 서울시청 위도
        126.9780, // 서울시청 경도
        2000      // 2km 반경
      );
      
      return places;
    } catch (error) {
      return [];
    }
  }

  // 이름 기반 검색 테스트
  static async testNameBasedSearch() {
    try {
      const places = await SeoulApiService.searchContentsByName('카페');
      return places;
    } catch (error) {
      return [];
    }
  }

  // 전체 API 테스트 실행
  static async runAllTests() {
    await this.testApiConfiguration();
    await this.testZeroWasteShops();
    await this.testCupDiscountCafes();
    await this.testLocationBasedSearch();
    await this.testNameBasedSearch();
  }
}

// 테스트 실행 (개발 환경에서만)
if (__DEV__) {
  // SeoulApiTest.runAllTests();
} 