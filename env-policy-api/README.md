# Zero Map API Server

제로맵 앱을 위한 Node.js API 서버입니다.

## 🏗️ 구조

```
[React Native 앱]
 ├─ WebView: 지도 표시 (map.html)
 ├─ 주소 입력 → POST /api/coord
        ↓
[중간 Node.js 서버]
 └─ OpenAPI (주소→좌표 변환 호출)
        ↓
[스마트서울맵 OpenAPI]
```

## 🚀 설치 및 실행

### 1. 의존성 설치
```bash
cd env-policy-api
npm install
```

### 2. 환경 변수 설정
```bash
cp env.example .env
# .env 파일에서 API 키 설정
```

### 3. 서버 실행
```bash
npm start
```

## 📡 API 엔드포인트

### 주소 → 좌표 변환
```
POST /api/coord
Content-Type: application/json

{
  "address": "서울시 강남구 테헤란로 123"
}
```

응답:
```json
{
  "success": true,
  "coordinates": {
    "latitude": 37.5172,
    "longitude": 127.0473
  },
  "address": "서울시 강남구 테헤란로 123"
}
```

### 스마트서울맵 데이터
```
GET /api/smart-seoul/places?category=제로웨이스트
```

### 정책 데이터
```
GET /api/policies
GET /api/policies/map
GET /api/policies/stats
```

### 지도 페이지
```
GET /map
```

## 🔧 주요 기능

### 1. 지도 시각화
- WebView로 `map.html` 페이지 로딩
- Leaflet.js를 사용한 지도 렌더링
- React Native ↔ WebView 간 메시지 통신

### 2. 주소 변환
- 스마트서울맵 OpenAPI 중계
- API 키 보호
- 실패 시 간단한 주소 매칭 사용

### 3. 데이터 제공
- 정책 데이터 API
- 스마트서울맵 데이터 API
- 통계 데이터 API

## 🛠️ 개발

### 서버 재시작
```bash
npm run dev
```

### 로그 확인
```bash
npm run logs
```

## 🔒 보안

- API 키는 서버에서만 관리
- CORS 설정으로 클라이언트 접근 제한
- 환경 변수로 민감한 정보 보호

## 📱 React Native 연동

### 주소 변환 사용 예시
```typescript
import { AddressService } from '../services/addressService';

const coordinates = await AddressService.addressToCoordinates('서울시 강남구');
```

### 지도 컴포넌트 사용 예시
```typescript
import SmartSeoulMap from '../components/SmartSeoulMap';

<SmartSeoulMap 
  onMarkerClick={(place) => console.log(place)}
  onMapClick={(coordinates) => console.log(coordinates)}
/>
```

## 🚨 주의사항

1. 실제 스마트서울맵 API 키가 필요합니다
2. 프로덕션 환경에서는 HTTPS 사용
3. API 호출 제한을 고려하여 캐싱 구현 권장 