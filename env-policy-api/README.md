# 🗺️ 서울시 환경정책 API & 지도 클라이언트

서울시 환경정책 데이터를 제공하는 REST API와 지도 연동 클라이언트입니다.

## 🚀 시작하기

### 1. 서버 실행
```bash
# 의존성 설치
npm install

# 서버 실행
node index.js
```

서버가 실행되면 다음 메시지가 표시됩니다:
```
🚀 서버 시작 중...
📁 policies.json 파일 로딩 중...
✅ 30개의 정책 데이터 로딩 완료
✅ API 서버 실행 중: http://localhost:3000
🗺️ 지도 API: http://localhost:3000/api/policies/map
📊 통계 API: http://localhost:3000/api/policies/stats
```

### 2. 클라이언트 접속
브라우저에서 다음 파일을 열어주세요:
- **간단 버전**: `simple-map.html` (추천)
- **네이버 지도 버전**: `map-client.html` (네이버 지도 API 키 필요)

## 📡 API 엔드포인트

### 기본 정책 조회
```
GET /api/policies
```

### 키워드 검색
```
GET /api/policies?keyword=탄소중립
```

### 지도용 데이터
```
GET /api/policies/map
```

### 통계 데이터
```
GET /api/policies/stats
```

## 🗺️ 지도 클라이언트 기능

### 주요 기능
- ✅ **실시간 정책 검색**: 키워드로 정책 검색
- ✅ **통계 대시보드**: 전체 정책 수, 지역별 통계
- ✅ **정책 목록**: 클릭 가능한 정책 목록
- ✅ **상세 정보**: 정책 클릭 시 상세 정보 표시
- ✅ **반응형 디자인**: 모바일/데스크톱 지원

### 사용법
1. 검색창에 키워드 입력 (예: 탄소중립, 전기차, 분리배출)
2. 🔍 검색 버튼 클릭 또는 Enter 키
3. 정책 목록에서 원하는 정책 클릭
4. 상세 정보 확인

## 🛠️ 기술 스택

### Backend
- **Node.js** + **Express.js**
- **CORS** 지원
- **JSON** 데이터 제공

### Frontend
- **Vanilla JavaScript** (ES6+)
- **CSS3** (Flexbox, Grid)
- **네이버 지도 API** (선택사항)

## 📁 파일 구조

```
env-policy-api/
├── index.js              # Express 서버
├── policies.json         # 정책 데이터
├── map-client.html       # 네이버 지도 클라이언트
├── simple-map.html       # 간단 버전 클라이언트
├── package.json          # 프로젝트 설정
└── README.md            # 이 파일
```

## 🔧 커스터마이징

### 네이버 지도 API 사용하기
1. [네이버 클라우드 플랫폼](https://www.ncloud.com/)에서 애플리케이션 등록
2. `map-client.html`의 `YOUR_CLIENT_ID`를 실제 클라이언트 ID로 교체

### 새로운 정책 추가
`policies.json` 파일에 새로운 정책을 추가하세요:
```json
{
  "title": "정책 제목",
  "url": "정책 URL",
  "publishedAt": "2025-01-01 00:00:00",
  "summary": "정책 요약",
  "tags": ["태그1", "태그2"],
  "content": "정책 내용",
  "region": "서울특별시"
}
```

## 🐛 문제 해결

### 서버가 실행되지 않는 경우
1. Node.js가 설치되어 있는지 확인
2. `npm install` 실행
3. 포트 3000이 사용 중인지 확인

### 클라이언트에서 데이터가 로드되지 않는 경우
1. 서버가 실행 중인지 확인 (`http://localhost:3000/api/policies`)
2. 브라우저 개발자 도구에서 네트워크 탭 확인
3. CORS 오류가 있는지 확인

## 📊 데이터 구조

### 정책 객체
```json
{
  "title": "정책 제목",
  "url": "https://news.seoul.go.kr/env/archives/...",
  "publishedAt": "2025-07-29 09:21:25",
  "summary": "정책 요약",
  "tags": ["태그1", "태그2"],
  "content": "정책 내용",
  "region": "서울특별시"
}
```

## 🎯 향후 개선 계획

- [ ] 지역별 상세 좌표 추가
- [ ] 정책 카테고리별 필터링
- [ ] 실시간 데이터 업데이트
- [ ] 모바일 앱 연동
- [ ] 다국어 지원

## 📞 문의

문제가 있거나 개선 제안이 있으시면 이슈를 등록해주세요!

---

**Made with ❤️ for Seoul Environment Policies** 