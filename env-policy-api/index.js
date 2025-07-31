require('dotenv').config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// JSON 파싱을 위한 미들웨어 추가
app.use(express.json());

try {
  console.log("🚀 서버 시작 중...");
  
  // 미리 저장된 JSON 파일 로딩
  console.log("📁 policies.json 파일 로딩 중...");
  const rawData = fs.readFileSync("policies.json", "utf-8");
  const policies = JSON.parse(rawData);
  console.log(`✅ ${policies.length}개의 정책 데이터 로딩 완료`);

  app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:8081',
    credentials: true
  }));

  // 🔎 정책 목록 조회 + 필터
  app.get("/api/policies", (req, res) => {
    const { region, keyword } = req.query;

    let results = [...policies];

    if (region) {
      results = results.filter((item) => item.region === region);
    }

    if (keyword) {
      results = results.filter(
        (item) =>
          item.title.includes(keyword) ||
          item.content.includes(keyword) ||
          item.summary.includes(keyword)
      );
    }

    res.json(results);
  });

  // 🗺️ 지도용 정책 데이터 (지역별 그룹화)
  app.get("/api/policies/map", (req, res) => {
    const { keyword } = req.query;
    
    let results = [...policies];
    
    if (keyword) {
      results = results.filter(
        (item) =>
          item.title.includes(keyword) ||
          item.content.includes(keyword) ||
          item.summary.includes(keyword)
      );
    }

    // 지역별로 그룹화 (현재는 서울시 전체로 처리)
    const mapData = {
      "서울특별시": {
        region: "서울특별시",
        coordinates: [37.5665, 126.9780], // 서울시청 좌표
        policies: results,
        count: results.length
      }
    };

    res.json(mapData);
  });

  // 📍 지역별 정책 통계
  app.get("/api/policies/stats", (req, res) => {
    const stats = {
      total: policies.length,
      byRegion: {
        "서울특별시": policies.length
      },
      byCategory: {},
      recentPolicies: policies.slice(0, 5) // 최근 5개
    };

    // 태그별 카테고리 통계
    policies.forEach(policy => {
      if (policy.tags) {
        policy.tags.forEach(tag => {
          stats.byCategory[tag] = (stats.byCategory[tag] || 0) + 1;
        });
      }
    });

    res.json(stats);
  });

  // 📍 주소 → 좌표 변환 API (스마트서울맵 OpenAPI 중계)
  app.post("/api/coord", async (req, res) => {
    try {
      const { address } = req.body;
      
      if (!address) {
        return res.status(400).json({ error: "주소가 필요합니다." });
      }
      
      console.log(`📍 주소 변환 요청: ${address}`);
      
      // 스마트서울맵 OpenAPI 호출
      const SMART_SEOUL_API_KEY = process.env.SMART_SEOUL_API_KEY || 'KEY218_ae66cb26032d46a3a91d570c6e5cf87c';
      const response = await fetch(
        `https://map.seoul.go.kr/smgis2/smap/geocoding?apiKey=${SMART_SEOUL_API_KEY}&format=json&address=${encodeURIComponent(address)}`
      );
      
      if (!response.ok) {
        throw new Error(`스마트서울맵 API 호출 실패: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.coordinates && data.coordinates.length > 0) {
        const coord = data.coordinates[0];
        res.json({
          success: true,
          coordinates: {
            latitude: parseFloat(coord.latitude),
            longitude: parseFloat(coord.longitude)
          },
          address: coord.address
        });
      } else {
        // API 실패 시 간단한 주소 매칭 사용
        const fallbackCoords = getFallbackCoordinates(address);
        res.json({
          success: true,
          coordinates: fallbackCoords,
          address: address,
          note: "간단한 주소 매칭 사용"
        });
      }
      
    } catch (error) {
      console.error('주소 변환 오류:', error);
      
      // 오류 시에도 간단한 매칭으로 응답
      const fallbackCoords = getFallbackCoordinates(req.body.address || '');
      res.json({
        success: true,
        coordinates: fallbackCoords,
        address: req.body.address || '',
        note: "API 오류로 인한 간단한 매칭 사용"
      });
    }
  });

  // 🗺️ 스마트서울맵 데이터 API (지도용)
  app.get("/api/smart-seoul/places", async (req, res) => {
    try {
      const { category = '제로웨이스트' } = req.query;
      
      console.log(`🗺️ 스마트서울맵 데이터 요청: ${category}`);
      
      // 스마트서울맵 OpenAPI 호출
      const SMART_SEOUL_API_KEY = process.env.SMART_SEOUL_API_KEY || 'KEY219_5fef8bdf0db54014960b99eb89c4be07';
      const response = await fetch(
        `https://map.seoul.go.kr/smgis2/smap/contentList?apiKey=${SMART_SEOUL_API_KEY}&format=json&category=${encodeURIComponent(category)}`
      );
      
      if (!response.ok) {
        throw new Error(`스마트서울맵 API 호출 실패: ${response.status}`);
      }
      
      const data = await response.json();
      
      // 데이터 파싱 및 변환
      const places = parseSmartSeoulData(data);
      
      res.json(places);
      
    } catch (error) {
      console.error('스마트서울맵 데이터 로드 오류:', error);
      res.json([]); // 오류 시 빈 배열 반환
    }
  });

  // 📄 정적 파일 제공 (map.html)
  app.use('/map', express.static(path.join(__dirname, 'map.html')));
  app.get('/map', (req, res) => {
    res.sendFile(path.join(__dirname, 'map.html'));
  });

  // 🚀 서버 실행
  app.listen(PORT, () => {
    console.log(`✅ API 서버 실행 중: http://localhost:${PORT}`);
    console.log(`🗺️ 지도 API: http://localhost:${PORT}/api/policies/map`);
    console.log(`📊 통계 API: http://localhost:${PORT}/api/policies/stats`);
    console.log(`📍 주소 변환 API: http://localhost:${PORT}/api/coord`);
    console.log(`🗺️ 스마트서울맵 API: http://localhost:${PORT}/api/smart-seoul/places`);
    console.log(`🌐 지도 페이지: http://localhost:${PORT}/map`);
  });

  // 📍 간단한 주소 매칭 함수 (API 실패 시 사용)
  function getFallbackCoordinates(address) {
    const defaultCoords = { latitude: 37.5665, longitude: 126.9780 }; // 서울시청
    
    if (!address) return defaultCoords;
    
    // 서울시 구별 대표 좌표
    const districtCoords = {
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
    };
    
    // 주소에서 구 이름 찾기
    for (const [district, coords] of Object.entries(districtCoords)) {
      if (address.includes(district)) {
        return coords;
      }
    }
    
    return defaultCoords;
  }

  // 📊 스마트서울맵 데이터 파싱 함수
  function parseSmartSeoulData(apiResponse) {
    try {
      const contents = apiResponse.contents || apiResponse.data || [];
      
      return contents.map((content) => ({
        id: content.contentId || content.id || String(Math.random()),
        name: content.title || content.name || '이름 없음',
        category: content.category || '제로웨이스트',
        address: content.address || content.addr || '주소 없음',
        latitude: parseFloat(content.latitude || content.lat || '0'),
        longitude: parseFloat(content.longitude || content.lng || '0'),
        description: content.description || content.desc || ''
      }));
    } catch (error) {
      console.error('스마트서울맵 데이터 파싱 오류:', error);
      return [];
    }
  }

} catch (error) {
  console.error("❌ 서버 시작 실패:", error.message);
  console.error("상세 오류:", error);
}
