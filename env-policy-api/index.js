const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
const PORT = 3000;

try {
  console.log("🚀 서버 시작 중...");
  
  // 미리 저장된 JSON 파일 로딩
  console.log("📁 policies.json 파일 로딩 중...");
  const rawData = fs.readFileSync("policies.json", "utf-8");
  const policies = JSON.parse(rawData);
  console.log(`✅ ${policies.length}개의 정책 데이터 로딩 완료`);

  app.use(cors());

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

  // 🚀 서버 실행
  app.listen(PORT, () => {
    console.log(`✅ API 서버 실행 중: http://localhost:${PORT}`);
    console.log(`🗺️ 지도 API: http://localhost:${PORT}/api/policies/map`);
    console.log(`📊 통계 API: http://localhost:${PORT}/api/policies/stats`);
  });

} catch (error) {
  console.error("❌ 서버 시작 실패:", error.message);
  console.error("상세 오류:", error);
}
