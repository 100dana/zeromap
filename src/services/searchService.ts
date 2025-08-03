import { PlaceData } from './seoulApi';
import { LocalPlaceData } from './localDataService';

export interface SearchResult {
  place: PlaceData | LocalPlaceData;
  relevance: number; // 검색 관련도 (0-1)
  matchType: 'exact' | 'partial' | 'fuzzy'; // 매치 타입
}

export class SearchService {
  // 모든 장소 데이터에서 검색
  static searchPlaces(
    query: string, 
    places: (PlaceData | LocalPlaceData)[]
  ): SearchResult[] {
    if (!query.trim()) {
      return [];
    }

    const normalizedQuery = query.toLowerCase().trim();
    const results: SearchResult[] = [];

    places.forEach(place => {
      const relevance = this.calculateRelevance(normalizedQuery, place);
      
      if (relevance > 0) {
        results.push({
          place,
          relevance,
          matchType: this.getMatchType(normalizedQuery, place)
        });
      }
    });

    // 관련도 순으로 정렬
    return results.sort((a, b) => b.relevance - a.relevance);
  }

  // 검색 관련도 계산
  private static calculateRelevance(query: string, place: PlaceData | LocalPlaceData): number {
    const name = place.name.toLowerCase();
    const address = place.address.toLowerCase();
    
    // 정확한 이름 매치
    if (name === query) {
      return 1.0;
    }
    
    // 이름에 검색어가 포함
    if (name.includes(query)) {
      return 0.8;
    }
    
    // 주소에 검색어가 포함
    if (address.includes(query)) {
      return 0.6;
    }
    
    // 부분 매치 (검색어의 일부가 이름에 포함)
    const queryWords = query.split(' ').filter(word => word.length > 1);
    let partialMatch = 0;
    
    queryWords.forEach(word => {
      if (name.includes(word)) {
        partialMatch += 0.3;
      }
      if (address.includes(word)) {
        partialMatch += 0.2;
      }
    });
    
    if (partialMatch > 0) {
      return Math.min(partialMatch, 0.7);
    }
    
    // 퍼지 매치 (유사한 문자열)
    const fuzzyScore = this.calculateFuzzyMatch(query, name);
    if (fuzzyScore > 0.7) {
      return fuzzyScore * 0.5;
    }
    
    return 0;
  }

  // 매치 타입 결정
  private static getMatchType(query: string, place: PlaceData | LocalPlaceData): 'exact' | 'partial' | 'fuzzy' {
    const name = place.name.toLowerCase();
    
    if (name === query) {
      return 'exact';
    }
    
    if (name.includes(query) || query.includes(name)) {
      return 'partial';
    }
    
    return 'fuzzy';
  }

  // 퍼지 매치 계산 (Levenshtein 거리 기반)
  private static calculateFuzzyMatch(query: string, target: string): number {
    const distance = this.levenshteinDistance(query, target);
    const maxLength = Math.max(query.length, target.length);
    return 1 - (distance / maxLength);
  }

  // Levenshtein 거리 계산
  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) {
      matrix[0][i] = i;
    }

    for (let j = 0; j <= str2.length; j++) {
      matrix[j][0] = j;
    }

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // 삭제
          matrix[j - 1][i] + 1, // 삽입
          matrix[j - 1][i - 1] + indicator // 치환
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  // 검색 결과 하이라이트
  static highlightSearchTerm(text: string, query: string): string {
    if (!query.trim()) {
      return text;
    }

    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '**$1**');
  }

  // 검색 제안 (자동완성)
  static getSearchSuggestions(
    query: string, 
    places: (PlaceData | LocalPlaceData)[]
  ): string[] {
    if (!query.trim()) {
      return [];
    }

    const normalizedQuery = query.toLowerCase().trim();
    const suggestions = new Set<string>();

    places.forEach(place => {
      const name = place.name.toLowerCase();
      const address = place.address.toLowerCase();

      // 이름에서 검색어로 시작하는 부분 찾기
      if (name.startsWith(normalizedQuery)) {
        suggestions.add(place.name);
      }

      // 주소에서 검색어로 시작하는 부분 찾기
      if (address.startsWith(normalizedQuery)) {
        suggestions.add(place.address);
      }
    });

    return Array.from(suggestions).slice(0, 5); // 최대 5개 제안
  }
} 