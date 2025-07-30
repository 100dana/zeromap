import React, { useState, useEffect } from "react";
import { SafeAreaView, View, ScrollView, Image, Text, TouchableOpacity, ImageBackground, StyleSheet, Alert, TextInput, FlatList } from "react-native";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import KakaoMap from '../components/KakaoMap';
import { SeoulApiService, PlaceData } from '../services/seoulApi';
import { LocalDataService, LocalPlaceData } from '../services/localDataService';
import { SearchService, SearchResult } from '../services/searchService';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';
import { shadows } from '../styles/shadows';

const categories = [
  // {
  //   icon: "🛒",
  //   label: "제로웨이스트샵",
  //   iconBgMargin: 38,
  //   textMargin: 4,
  //   type: 'zeroWaste',
  //   color: '#4CAF50',
  //   description: '친환경 제품을 판매하는 상점'
  // },
  // {
  //   icon: "🍽️",
  //   label: "제로식당",
  //   iconBgMargin: 38,
  //   textMargin: 3,
  //   type: 'zeroRestaurant',
  //   color: '#FF9800',
  //   description: '친환경 식당 및 카페'
  // },
  // {
  //   icon: "🔄",
  //   label: "리필스테이션",
  //   iconBgMargin: 38,
  //   textMargin: 3,
  //   type: 'refillStation',
  //   color: '#2196F3',
  //   description: '리필 서비스를 제공하는 곳'
  // },
  {
    icon: "💧",
    label: "리필샵",
    iconBgMargin: 38,
    textMargin: 3,
    type: 'refillShop',
    color: '#9C27B0',
    description: '리필 제품을 판매하는 상점'
  },
  {
    icon: "🍽",
    label: "식당",
    iconBgMargin: 38,
    textMargin: 3,
    type: 'restaurant',
    color: '#F44336',
    description: '친환경 식당'
  },
  {
    icon: "🧴",
    label: "친환경생필품점",
    iconBgMargin: 38,
    textMargin: 3,
    type: 'ecoSupplies',
    color: '#795548',
    description: '친환경 생필품을 판매하는 곳'
  },
  {
    icon: "☕",
    label: "카페",
    iconBgMargin: 38,
    textMargin: 3,
    type: 'cafe',
    color: '#607D8B',
    description: '친환경 카페'
  },
  {
    icon: "⋯",
    label: "기타",
    iconBgMargin: 38,
    textMargin: 3,
    type: 'others',
    color: '#9E9E9E',
    description: '기타 친환경 시설'
  },
];

type CategoryCardProps = {
  icon: string;
  label: string;
  iconBgMargin: number;
  textMargin: number;
  type: string;
  color: string;
  description: string;
  style?: any;
  isSelected?: boolean;
  onPress?: () => void;
};

function CategoryCard({ icon, label, iconBgMargin, textMargin, type, color, description, style, isSelected, onPress }: CategoryCardProps) {
  return (
    <TouchableOpacity 
      style={[
        styles.categoryCard, 
        style, 
        isSelected && styles.selectedCategoryCard
      ]} 
      onPress={onPress}
      accessibilityLabel={`${label} 카테고리 선택`}
      accessibilityHint={description}
    >
      <View style={[styles.categoryIconWrap, { marginHorizontal: iconBgMargin }]}> 
        <View style={[
          styles.categoryIconBg, 
          isSelected && styles.selectedCategoryIconBg,
          { backgroundColor: isSelected ? color : colors.surface }
        ]}>
          <Text style={styles.categoryIcon}>{icon}</Text>
        </View>
      </View>
      <Text style={[
        styles.categoryLabel, 
        { marginHorizontal: textMargin },
        isSelected && { color: color }
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

type RootStackParamList = {
  Home: undefined;
  Map: undefined;
  MapDetail: undefined;
  ReportPlace: undefined;
};

export default function MapScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Map'>>();
  const [places, setPlaces] = useState<PlaceData[]>([]);
  const [localPlaces, setLocalPlaces] = useState<LocalPlaceData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('refillShop');
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<'api' | 'local' | 'both'>('both');
  
  // 검색 관련 상태
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // 데이터 로드 함수
  const loadPlaces = async (category: string) => {
    setLoading(true);
    try {
      let apiData: PlaceData[] = [];
      let localData: LocalPlaceData[] = [];
      
      switch (category) {
        case 'zeroWaste':
          apiData = await SeoulApiService.getZeroWasteShops();
          break;
        case 'zeroRestaurant':
          // CSV 데이터와 API 데이터를 함께 가져오기
          const [csvData, apiRestaurantData] = await Promise.all([
            LocalDataService.getZeroRestaurants(),
            SeoulApiService.getZeroWasteShops() // 제로식당 관련 API 데이터도 함께 가져오기
          ]);
          console.log('CSV 제로식당 데이터:', csvData);
          console.log('API 제로식당 데이터:', apiRestaurantData);
          localData = csvData;
          apiData = apiRestaurantData;
          break;
        case 'refillStation':
          localData = await LocalDataService.getRefillStations();
          break;
        case 'refillShop':
          // 리필샵 데이터 로드 (현재는 빈 배열, 추후 데이터 추가 예정)
          localData = [];
          break;
        case 'restaurant':
          // 식당 데이터 로드 (현재는 빈 배열, 추후 데이터 추가 예정)
          localData = [];
          break;
        case 'ecoSupplies':
          // 친환경생필품점 데이터 로드 (현재는 빈 배열, 추후 데이터 추가 예정)
          localData = [];
          break;
        case 'cafe':
          // 카페 데이터 로드 (현재는 빈 배열, 추후 데이터 추가 예정)
          localData = [];
          break;
        case 'others':
          // 기타 데이터 로드 (현재는 빈 배열, 추후 데이터 추가 예정)
          localData = [];
          break;
        default:
          apiData = [];
          localData = [];
      }
      
      setPlaces(apiData);
      setLocalPlaces(localData);
      
      const totalData = [...apiData, ...localData];
      if (totalData.length === 0) {
        Alert.alert('알림', '해당 카테고리의 데이터가 없습니다.');
      }
    } catch (error) {
      console.error('데이터 로드 실패:', error);
      Alert.alert(
        '오류', 
        '데이터를 불러오는데 실패했습니다.\n\nAPI 키와 엔드포인트를 확인해주세요.',
        [
          { text: '확인', style: 'default' },
          { 
            text: 'API 설정 확인', 
            onPress: () => {
              console.log('현재 API 키:', SeoulApiService.getApiKey());
            }
          }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  // 카테고리 선택 시 데이터 로드
  const handleCategoryPress = (category: string) => {
    setSelectedCategory(category);
    loadPlaces(category);
  };

  // 마커 클릭 시 처리
  const handleMarkerClick = (place: PlaceData | LocalPlaceData) => {
    const isLocalData = 'additionalInfo' in place;
    const source = isLocalData ? '로컬 데이터' : '서울시 API';
    
    Alert.alert(
      place.name,
      `${place.address}\n\n${place.description || ''}\n\n데이터 출처: ${source}`,
      [
        { text: '닫기', style: 'cancel' },
        { text: '상세보기', onPress: () => {
          navigation.navigate('MapDetail');
        }}
      ]
    );
  };

  // 검색 처리
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      setSearchSuggestions([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    
    // 모든 장소 데이터에서 검색
    const allPlaces = [...places, ...localPlaces];
    const results = SearchService.searchPlaces(query, allPlaces);
    const suggestions = SearchService.getSearchSuggestions(query, allPlaces);
    
    setSearchResults(results);
    setSearchSuggestions(suggestions);
    setShowSearchResults(true);
    setIsSearching(false);
  };

  // 검색 결과 선택
  const handleSearchResultSelect = (result: SearchResult) => {
    setShowSearchResults(false);
    setSearchQuery(result.place.name);
    
    // 선택된 장소로 지도 이동 (KakaoMap 컴포넌트에서 처리)
    handleMarkerClick(result.place);
  };

  // 검색 제안 선택
  const handleSuggestionSelect = (suggestion: string) => {
    setSearchQuery(suggestion);
    handleSearch(suggestion);
  };

  // 검색 취소
  const handleSearchCancel = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSearchSuggestions([]);
    setShowSearchResults(false);
  };

  // 검색 결과 아이템 컴포넌트
  const SearchResultItem = ({ result }: { result: SearchResult }) => (
    <TouchableOpacity
      style={styles.searchResultItem}
      onPress={() => handleSearchResultSelect(result)}
    >
      <View style={styles.searchResultContent}>
        <Text style={styles.searchResultName}>{result.place.name}</Text>
        <Text style={styles.searchResultAddress}>{result.place.address}</Text>
        <View style={styles.searchResultMeta}>
          <Text style={styles.searchResultMatchType}>
            {result.matchType === 'exact' ? '정확한 매치' : 
             result.matchType === 'partial' ? '부분 매치' : '유사한 매치'}
          </Text>
          <Text style={styles.searchResultRelevance}>
            {Math.round(result.relevance * 100)}% 일치
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // 검색 제안 아이템 컴포넌트
  const SearchSuggestionItem = ({ suggestion }: { suggestion: string }) => (
    <TouchableOpacity
      style={styles.searchSuggestionItem}
      onPress={() => handleSuggestionSelect(suggestion)}
    >
      <Text style={styles.searchSuggestionText}>💡 {suggestion}</Text>
    </TouchableOpacity>
  );

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    loadPlaces(selectedCategory);
  }, []);

  // 모든 장소 데이터 (API + 로컬)
  const allPlaces = [...places, ...localPlaces];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
          {/* 상단 헤더 */}
          <View style={styles.headerContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.backButtonText}>‹</Text>
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerIcon}>🌱</Text>
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle}>ZeroMap</Text>
                <Text style={styles.headerSubtitle}>제로웨이스트 맵</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.headerActionButton}>
              <Text style={styles.headerActionIcon}>🔍</Text>
            </TouchableOpacity>
          </View>

          {/* 검색바 */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="가게 이름으로 검색..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={handleSearch}
                onFocus={() => setShowSearchResults(true)}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  style={styles.searchClearButton}
                  onPress={handleSearchCancel}
                >
                  <Text style={styles.searchClearText}>×</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {/* 검색 결과 및 제안 */}
            {showSearchResults && (
              <View style={styles.searchResultsContainer}>
                {isSearching ? (
                  <View style={styles.searchLoading}>
                    <Text style={styles.searchLoadingText}>검색 중...</Text>
                  </View>
                ) : (
                  <>
                    {/* 검색 제안 */}
                    {searchSuggestions.length > 0 && searchQuery.length > 0 && (
                      <View style={styles.searchSuggestionsContainer}>
                        <Text style={styles.searchSuggestionsTitle}>검색 제안</Text>
                        {searchSuggestions.map((suggestion, index) => (
                          <SearchSuggestionItem key={index} suggestion={suggestion} />
                        ))}
                      </View>
                    )}
                    
                    {/* 검색 결과 */}
                    {searchResults.length > 0 && (
                      <View style={styles.searchResultsList}>
                        <Text style={styles.searchResultsTitle}>
                          검색 결과 ({searchResults.length}개)
                        </Text>
                        {searchResults.map((result, index) => (
                          <SearchResultItem key={index} result={result} />
                        ))}
                      </View>
                    )}
                    
                    {/* 검색 결과가 없을 때 */}
                    {searchQuery.length > 0 && searchResults.length === 0 && searchSuggestions.length === 0 && (
                      <View style={styles.noSearchResults}>
                        <Text style={styles.noSearchResultsText}>
                          "{searchQuery}"에 대한 검색 결과가 없습니다.
                        </Text>
                      </View>
                    )}
                  </>
                )}
              </View>
            )}
          </View>

          {/* 카테고리 스크롤 영역 */}
          <View style={styles.categoryContainer}>
            <Text style={styles.categoryTitle}>카테고리 선택</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryScrollContainer}
            >
              {categories.map((cat, idx) => (
                <CategoryCard
                  key={idx}
                  {...cat}
                  style={idx === categories.length - 1 ? styles.noMarginRight : undefined}
                  isSelected={selectedCategory === cat.type}
                  onPress={() => handleCategoryPress(cat.type)}
                />
              ))}
            </ScrollView>
          </View>
          
          {/* 로딩 상태 표시 */}
          {loading && (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>데이터를 불러오는 중...</Text>
            </View>
          )}
          
          {/* 지도 영역 */}
          <View style={{ flex: 1, height: 400, marginHorizontal: 16, marginBottom: 20, borderRadius: 6, overflow: 'hidden' }}>
            <KakaoMap 
              places={allPlaces}
              onMarkerClick={handleMarkerClick}
            />
          </View>
          
          {/* 결과 개수 표시 */}
          {allPlaces.length > 0 && (
            <View style={styles.resultInfo}>
              <Text style={styles.resultText}>
                총 {allPlaces.length}개의 장소를 찾았습니다.
                {places.length > 0 && ` (API: ${places.length}개)`}
                {localPlaces.length > 0 && ` (로컬: ${localPlaces.length}개)`}
              </Text>
            </View>
          )}
          
          {/* 장소 제보 버튼 */}
          <TouchableOpacity
            style={styles.reportButton}
            onPress={() => {
              navigation.navigate('ReportPlace');
            }}
            accessibilityLabel="장소 제보 버튼"
          >
            <Text style={styles.reportButtonText}>+ 장소 제보</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingVertical: spacing.paddingLarge,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 2,
    borderBottomColor: '#F0F0F0',
    ...shadows.header,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    alignItems: "center",
    justifyContent: "center",
    ...shadows.button,
  },
  backButtonText: {
    fontSize: 18,
    color: colors.textPrimary,
    fontWeight: "600",
  },
  headerRight: {
    width: 40,
  },
  headerImage: {
    height: 24,
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  headerIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  headerTextContainer: {
    flexDirection: "column",
    alignItems: "center",
  },
  headerTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    ...typography.body2,
    color: colors.textSecondary,
    marginTop: 2,
    fontWeight: "500",
  },
  headerActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    alignItems: "center",
    justifyContent: "center",
    ...shadows.button,
  },
  headerActionIcon: {
    fontSize: 20,
    color: colors.textPrimary,
  },
  searchContainer: {
    marginHorizontal: spacing.screenPaddingHorizontal,
    marginBottom: spacing.paddingMedium,
    paddingHorizontal: spacing.paddingMedium,
    paddingVertical: spacing.paddingSmall,
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadiusLarge,
    borderColor: "#0000001A",
    borderWidth: 1,
    borderBottomWidth: 2,
    borderBottomColor: '#E0E0E0',
    ...shadows.card,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  searchInput: {
    ...typography.body1,
    flex: 1,
    color: colors.textPrimary,
    paddingVertical: 0,
  },
  searchClearButton: {
    padding: 5,
  },
  searchClearText: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  searchResultsContainer: {
    marginTop: spacing.paddingSmall,
    paddingHorizontal: spacing.paddingSmall,
  },
  searchResultsList: {
    marginTop: spacing.paddingSmall,
  },
  searchResultsTitle: {
    ...typography.body1,
    color: colors.textPrimary,
    marginBottom: spacing.paddingSmall,
    fontWeight: "600",
  },
  searchSuggestionsContainer: {
    marginBottom: spacing.paddingSmall,
  },
  searchSuggestionsTitle: {
    ...typography.body1,
    color: colors.textSecondary,
    marginBottom: spacing.paddingSmall,
    fontWeight: "600",
  },
  searchLoading: {
    paddingVertical: spacing.paddingSmall,
    alignItems: 'center',
  },
  searchLoadingText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  noSearchResults: {
    paddingVertical: spacing.paddingSmall,
    alignItems: 'center',
  },
  noSearchResultsText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  categoryRow: {
    flexDirection: "row",
    marginBottom: 10,
    marginHorizontal: 35,
  },
  categoryContainer: {
    marginBottom: spacing.paddingMedium,
    marginHorizontal: spacing.screenPaddingHorizontal,
  },
  categoryTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.paddingSmall,
    fontWeight: '600',
  },
  categoryScrollContainer: {
    paddingRight: spacing.paddingMedium,
  },
  categoryCard: {
    borderColor: "#0000001A",
    borderRadius: 6,
    borderWidth: 1,
    paddingVertical: 4,
    marginRight: 9,
    backgroundColor: "#fff",
    minWidth: 0,
    width: 80,
    alignItems: 'center',
  },
  selectedCategoryCard: {
    borderColor: "#4CAF50",
    backgroundColor: "#E8F5E8",
  },
  categoryIconWrap: {
    marginBottom: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryIconBg: {
    height: 50,
    width: 50,
    backgroundColor: "#0000000D",
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedCategoryIconBg: {
    backgroundColor: "#4CAF50",
  },
  categoryIcon: {
    fontSize: 30,
    textAlign: "center",
    textAlignVertical: "center",
    lineHeight: 50,
  },
  categoryLabel: {
    color: "#000000",
    fontSize: 12,
    textAlign: "center",
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  resultInfo: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  resultText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  mapImageBg: {
    borderRadius: 6,
  },
  mapImageBgWrap: {
    alignItems: "center",
    paddingVertical: 137,
    paddingHorizontal: 16,
    marginBottom: 25,
    marginHorizontal: 38,
  },
  mapIcon: {
    borderRadius: 6,
    width: 24,
    height: 24,
    marginBottom: 8,
  },
  mapText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  noMarginRight: {
    marginRight: 0,
  },
  reportButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginHorizontal: 16,
    marginBottom: 20,
    alignItems: "center",
    shadowColor: "#0000001C",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  },
  reportButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  searchResultItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  searchResultContent: {
    flexDirection: "column",
  },
  searchResultName: {
    ...typography.body1,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  searchResultAddress: {
    ...typography.body2,
    color: colors.textSecondary,
    marginTop: 2,
  },
  searchResultMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  searchResultMatchType: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  searchResultRelevance: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  searchSuggestionItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  searchSuggestionText: {
    ...typography.body2,
    color: colors.textSecondary,
  },
});