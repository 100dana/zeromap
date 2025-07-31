# 아이콘 가이드

이 폴더에는 Flaticon에서 다운로드한 상업적 이용 가능한 아이콘들이 저장됩니다.

## 필요한 아이콘 목록

### 네비게이션 아이콘
- `arrow-left.png` - 뒤로가기 버튼
- `magnifying-glass.png` - 검색 아이콘
- `house.png` - 홈 아이콘
- `gear.png` - 설정 아이콘
- `bell.png` - 알림 아이콘
- `refresh.png` - 새로고침 아이콘

### 카테고리 아이콘
- `water-drop.png` - 리필샵 (물방울)
- `restaurant.png` - 식당 (포크/나이프)
- `cosmetics.png` - 친환경생필품점 (화장품)
- `coffee-cup.png` - 카페 (커피잔)
- `dots.png` - 기타 (점 3개)

### 기능 아이콘
- `filter.png` - 필터 아이콘
- `add.png` - 추가 아이콘
- `close.png` - 닫기 아이콘
- `eco.png` - 친환경 아이콘
- `natural.png` - 자연 제품 아이콘

## Flaticon 검색 키워드

1. **arrow-left**: "arrow left", "back arrow"
2. **magnifying-glass**: "magnifying glass", "search"
3. **house**: "home", "house"
4. **gear**: "settings", "gear"
5. **bell**: "notification", "bell"
6. **water-drop**: "water drop", "liquid"
7. **restaurant**: "restaurant", "fork knife"
8. **cosmetics**: "cosmetics", "beauty"
9. **coffee-cup**: "coffee cup", "cafe"
10. **dots**: "more", "three dots"

## 사용법

```tsx
import Icon from '../components/Icon';

// 기본 사용
<Icon name="back" size={24} color="#000000" />

// 스타일 적용
<Icon name="search" size={20} color="#666666" style={{ marginRight: 8 }} />
``` 