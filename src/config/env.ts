// 환경변수 및 API 설정
export const Config = {
  // 서울시 스마트서울맵 OpenAPI 키
  SEOUL_API_KEY: 'KEY218_ae66cb26032d46a3a91d570c6e5cf87c',
  
  // API 기본 URL
  SEOUL_API_BASE_URL: 'https://map.seoul.go.kr/openapi/v5',
  
  // 개발 환경 설정
  NODE_ENV: 'development',
  
  // React Native 개발 서버
  REACT_NATIVE_PACKAGER_HOSTNAME: 'localhost'
} as const;

// API 키 반환 함수 (단일 키만 사용)
export const getApiKey = () => {
  return Config.SEOUL_API_KEY;
};

// 서울시 구별 대표 좌표
export const SEOUL_DISTRICT_COORDS = {
  '강남': { latitude: 37.5172, longitude: 127.0473 },
  '강동': { latitude: 37.5301, longitude: 127.1238 },
  '강북': { latitude: 37.6396, longitude: 127.0257 },
  '강서': { latitude: 37.5509, longitude: 126.8495 },
  '관악': { latitude: 37.4784, longitude: 126.9516 },
  '광진': { latitude: 37.5384, longitude: 127.0822 },
  '구로': { latitude: 37.4954, longitude: 126.8874 },
  '금천': { latitude: 37.4569, longitude: 126.8956 },
  '노원': { latitude: 37.6542, longitude: 127.0568 },
  '도봉': { latitude: 37.6688, longitude: 127.0471 },
  '동대문': { latitude: 37.5744, longitude: 127.0395 },
  '동작': { latitude: 37.5124, longitude: 126.9393 },
  '마포': { latitude: 37.5636, longitude: 126.9084 },
  '서대문': { latitude: 37.5791, longitude: 126.9368 },
  '서초': { latitude: 37.4837, longitude: 127.0324 },
  '성동': { latitude: 37.5634, longitude: 127.0369 },
  '성북': { latitude: 37.5894, longitude: 127.0167 },
  '송파': { latitude: 37.5145, longitude: 127.1059 },
  '양천': { latitude: 37.5270, longitude: 126.8566 },
  '영등포': { latitude: 37.5264, longitude: 126.8892 },
  '용산': { latitude: 37.5384, longitude: 126.9654 },
  '은평': { latitude: 37.6027, longitude: 126.9291 },
  '종로': { latitude: 37.5735, longitude: 126.9789 },
  '중구': { latitude: 37.5640, longitude: 126.9979 },
  '중랑': { latitude: 37.6064, longitude: 127.0926 }
} as const;

// 서울시청 기본 좌표
export const SEOUL_CENTER_COORDS = { latitude: 37.5665, longitude: 126.9780 }; 