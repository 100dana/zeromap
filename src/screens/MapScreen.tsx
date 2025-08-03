import React, { useState, useEffect } from "react";
import { SafeAreaView, View, ScrollView, Image, Text, TouchableOpacity, ImageBackground, StyleSheet, Alert, TextInput, FlatList, Modal } from "react-native";
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
  {
    icon: "🛒",
    label: "제로웨이스트상점",
    iconBgMargin: 38,
    textMargin: 4,
    type: 'zeroWaste',
    color: '#4CAF50',
    description: '친환경 제품을 판매하는 상점 (285곳)'
  },
  {
    icon: "☕",
    label: "개인컵할인카페",
    iconBgMargin: 38,
    textMargin: 3,
    type: 'cupDiscountCafe',
    color: '#FF9800',
    description: '개인 컵 할인을 제공하는 카페 (159곳)'
  },
  {
    icon: "🍽️",
    label: "제로식당",
    iconBgMargin: 38,
    textMargin: 3,
    type: 'zeroRestaurant',
    color: '#2196F3',
    description: '친환경 식당 및 카페'
  },
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
  
  // 상태 관리
  const [selectedCategory, setSelectedCategory] = useState('zeroWaste');
  const [places, setPlaces] = useState<PlaceData[]>([]);
  const [localPlaces, setLocalPlaces] = useState<LocalPlaceData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  // 커스텀 모달 상태
  const [showPlaceModal, setShowPlaceModal] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<PlaceData | LocalPlaceData | null>(null);
  
  // 지도/리스트 뷰 상태
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  
  // 현재 위치 (서울시청)
  const CURRENT_LOCATION = {
    latitude: 37.5665,
    longitude: 126.9780
  };
  
  // 두 지점 간의 거리 계산 (Haversine 공식)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // 지구의 반지름 (km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // km 단위
  };
  
  // 거리순으로 정렬된 장소 목록
  const getSortedPlaces = (): (PlaceData | LocalPlaceData)[] => {
    const allPlaces = [...places, ...localPlaces];
    
    return allPlaces.sort((a, b) => {
      const distanceA = calculateDistance(
        CURRENT_LOCATION.latitude, 
        CURRENT_LOCATION.longitude, 
        a.latitude, 
        a.longitude
      );
      const distanceB = calculateDistance(
        CURRENT_LOCATION.latitude, 
        CURRENT_LOCATION.longitude, 
        b.latitude, 
        b.longitude
      );
      return distanceA - distanceB; // 가까운 순으로 정렬
    });
  };

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
        case 'cupDiscountCafe':
          apiData = await SeoulApiService.getCupDiscountCafes();
          break;
        case 'zeroRestaurant':
          // CSV 데이터와 API 데이터를 함께 가져오기
          const [csvData, apiRestaurantData] = await Promise.all([
            LocalDataService.getZeroRestaurants(),
            SeoulApiService.getZeroWasteShops() // 제로식당 관련 API 데이터도 함께 가져오기
          ]);
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
      Alert.alert(
        '오류', 
        '데이터를 불러오는데 실패했습니다.\n\nAPI 키와 엔드포인트를 확인해주세요.',
        [
          { text: '확인', style: 'default' },
          { 
            text: 'API 설정 확인', 
            onPress: () => {
              // API 설정 확인 로직
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
    setSelectedPlace(place);
    setShowPlaceModal(true);
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

  // 커스텀 모달 컴포넌트
  const PlaceDetailModal = () => {
    if (!selectedPlace) return null;
    
    const isLocalData = 'additionalInfo' in selectedPlace;
    const source = isLocalData ? '로컬 데이터' : '서울시 API';
    
    // 카테고리별 설명 추가
    let categoryDescription = '';
    switch (selectedCategory) {
      case 'zeroWaste':
        categoryDescription = '제로웨이스트 상점';
        break;
      case 'cupDiscountCafe':
        categoryDescription = '개인 컵 할인 카페';
        break;
      case 'zeroRestaurant':
        categoryDescription = '제로식당';
        break;
      default:
        categoryDescription = '친환경 시설';
    }
    
    return (
      <Modal
        visible={showPlaceModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPlaceModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* 헤더 */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🏪 {selectedPlace.name}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowPlaceModal(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            {/* 내용 */}
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* 카테고리 배지 */}
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{categoryDescription}</Text>
              </View>
              
              {/* 주소 */}
              <View style={styles.infoSection}>
                <Text style={styles.infoLabel}>📍 주소</Text>
                <Text style={styles.infoValue}>{selectedPlace.address}</Text>
              </View>
              
              {/* 설명 */}
              {selectedPlace.description && (
                <View style={styles.infoSection}>
                  <Text style={styles.infoLabel}>📝 설명</Text>
                  <Text style={styles.infoValue}>{selectedPlace.description}</Text>
                </View>
              )}
              
              {/* 좌표 (개인 컵 할인 카페가 아닐 때만 표시) */}
              {selectedCategory !== 'cupDiscountCafe' && (
                <View style={styles.infoSection}>
                  <Text style={styles.infoLabel}>📍 좌표</Text>
                  <Text style={styles.infoValue}>
                    {selectedPlace.latitude.toFixed(6)}, {selectedPlace.longitude.toFixed(6)}
                  </Text>
                </View>
              )}
              
              {/* 데이터 출처 (개인 컵 할인 카페가 아닐 때만 표시) */}
              {selectedCategory !== 'cupDiscountCafe' && (
                <View style={styles.infoSection}>
                  <Text style={styles.infoLabel}>📊 데이터 출처</Text>
                  <Text style={styles.infoValue}>{source}</Text>
                </View>
              )}
            </ScrollView>
            
            {/* 액션 버튼 (개인 컵 할인 카페가 아닐 때만 표시) */}
            {selectedCategory !== 'cupDiscountCafe' && (
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => setShowPlaceModal(false)}
                >
                  <Text style={styles.modalButtonText}>닫기</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.primaryButton]}
                  onPress={() => {
                    setShowPlaceModal(false);
                    navigation.navigate('MapDetail');
                  }}
                >
                  <Text style={[styles.modalButtonText, styles.primaryButtonText]}>상세보기</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    );
  };

  // 리스트 아이템 컴포넌트
  const PlaceListItem = ({ place, index }: { place: PlaceData | LocalPlaceData; index: number }) => {
    const isLocalData = 'additionalInfo' in place;
    const source = isLocalData ? '로컬 데이터' : '서울시 API';
    
    // 거리 계산
    const distance = calculateDistance(
      CURRENT_LOCATION.latitude,
      CURRENT_LOCATION.longitude,
      place.latitude,
      place.longitude
    );
    
    // 카테고리별 설명 추가
    let categoryDescription = '';
    switch (selectedCategory) {
      case 'zeroWaste':
        categoryDescription = '제로웨이스트 상점';
        break;
      case 'cupDiscountCafe':
        categoryDescription = '개인 컵 할인 카페';
        break;
      case 'zeroRestaurant':
        categoryDescription = '제로식당';
        break;
      default:
        categoryDescription = '친환경 시설';
    }
    
    return (
      <TouchableOpacity
        style={styles.placeListItem}
        onPress={() => {
          setSelectedPlace(place);
          setShowPlaceModal(true);
        }}
      >
        <View style={styles.placeListItemHeader}>
          <View style={styles.placeListItemIcon}>
            <Text style={styles.placeListItemIconText}>📍</Text>
          </View>
          <View style={styles.placeListItemContent}>
            <Text style={styles.placeListItemName}>{place.name}</Text>
            <Text style={styles.placeListItemCategory}>{categoryDescription}</Text>
          </View>
          <View style={styles.placeListItemMeta}>
            <Text style={styles.placeListItemDistance}>
              {distance < 1 ? `${(distance * 1000).toFixed(0)}m` : `${distance.toFixed(1)}km`}
            </Text>
            <Text style={styles.placeListItemSource}>{source}</Text>
          </View>
        </View>
        
        <Text style={styles.placeListItemAddress}>{place.address}</Text>
        
        {place.description && (
          <Text style={styles.placeListItemDescription} numberOfLines={2}>
            {place.description}
          </Text>
        )}
        
        <View style={styles.placeListItemFooter}>
          <Text style={styles.placeListItemDetail}>상세보기 ›</Text>
        </View>
      </TouchableOpacity>
    );
  };

  // 화면 로드 시 기본 데이터 로드
  useEffect(() => {
    loadPlaces(selectedCategory);
  }, []); // 컴포넌트 마운트 시 한 번만 실행

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
                placeholder="장소 검색..."
                value={searchQuery}
                onChangeText={handleSearch}
                placeholderTextColor={colors.textSecondary}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={handleSearchCancel}
                >
                  <Text style={styles.clearButtonText}>✕</Text>
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

          {/* 지도/리스트 전환 버튼 */}
          <View style={styles.viewToggleContainer}>
            <TouchableOpacity
              style={[
                styles.viewToggleButton,
                viewMode === 'map' && styles.viewToggleButtonActive
              ]}
              onPress={() => setViewMode('map')}
            >
              <Text style={[
                styles.viewToggleText,
                viewMode === 'map' && styles.viewToggleTextActive
              ]}>🗺️ 지도</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.viewToggleButton,
                viewMode === 'list' && styles.viewToggleButtonActive
              ]}
              onPress={() => setViewMode('list')}
            >
              <Text style={[
                styles.viewToggleText,
                viewMode === 'list' && styles.viewToggleTextActive
              ]}>📋 리스트</Text>
            </TouchableOpacity>
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
          
          {/* 메인 컨텐츠 */}
          <View style={styles.mainContent}>
            {viewMode === 'map' ? (
              // 지도 뷰
              <KakaoMap
                places={places}
                onMarkerClick={handleMarkerClick}
              />
            ) : (
              // 리스트 뷰
              <ScrollView 
                style={styles.listContainer}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContentContainer}
              >
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>데이터를 불러오는 중...</Text>
                  </View>
                ) : allPlaces.length > 0 ? (
                  <>
                    <View style={styles.listHeader}>
                      <Text style={styles.listHeaderTitle}>
                        {showSearchResults ? '검색 결과' : categories.find(cat => cat.type === selectedCategory)?.label} 
                        ({showSearchResults ? searchResults.length : allPlaces.length}곳)
                      </Text>
                    </View>
                    {(showSearchResults ? searchResults.map(result => result.place) : getSortedPlaces()).map((place, index) => (
                      <PlaceListItem key={`${place.id}-${index}`} place={place} index={index} />
                    ))}
                  </>
                ) : (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                      {showSearchResults ? '검색 결과가 없습니다.' : '해당 카테고리의 데이터가 없습니다.'}
                    </Text>
                  </View>
                )}
              </ScrollView>
            )}
          </View>
          
          {/* 액션 버튼 */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.reportButton}
              onPress={() => navigation.navigate('ReportPlace')}
            >
              <Text style={styles.reportButtonText}>장소 제보하기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <PlaceDetailModal />
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    ...typography.body1,
    color: colors.textSecondary,
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    ...shadows.card,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  modalTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    fontWeight: 'bold',
    flex: 1,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
  closeButtonText: {
    fontSize: 20,
    color: colors.textSecondary,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 20,
  },
  categoryBadge: {
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  categoryBadgeText: {
    ...typography.body2,
    color: colors.primaryDark,
    fontWeight: '600',
  },
  infoSection: {
    marginBottom: 16,
  },
  infoLabel: {
    ...typography.body2,
    color: colors.textSecondary,
    marginBottom: 6,
    fontWeight: '600',
  },
  infoValue: {
    ...typography.body1,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  modalButtonText: {
    ...typography.button,
    color: colors.primary,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  primaryButtonText: {
    color: colors.background,
  },
  viewToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 16,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderColor: colors.divider,
    borderWidth: 1,
    padding: 4,
  },
  viewToggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
    marginHorizontal: 2,
  },
  viewToggleButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  viewToggleText: {
    ...typography.body2,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  viewToggleTextActive: {
    color: colors.background,
    fontWeight: '600',
  },
  clearButton: {
    padding: 5,
  },
  clearButtonText: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  placeListItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    ...shadows.card,
  },
  placeListItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  placeListItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  placeListItemIconText: {
    fontSize: 24,
    color: '#666',
  },
  placeListItemContent: {
    flex: 1,
    marginRight: 10,
  },
  placeListItemName: {
    ...typography.body1,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  placeListItemCategory: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  placeListItemMeta: {
    alignItems: 'flex-end',
  },
  placeListItemDistance: {
    ...typography.body2,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  placeListItemSource: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  placeListItemAddress: {
    ...typography.body1,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  placeListItemDescription: {
    ...typography.body2,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  placeListItemFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  placeListItemDetail: {
    ...typography.body2,
    color: colors.primary,
    fontWeight: '600',
  },
  mainContent: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 6,
    overflow: 'hidden',
  },
  listContainer: {
    flex: 1,
  },
  listContentContainer: {
    paddingBottom: spacing.paddingMedium,
  },
  listHeader: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  listHeaderTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  listHeaderSubtitle: {
    ...typography.body2,
    color: colors.textSecondary,
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    ...typography.body1,
    color: colors.textSecondary,
  },
  actionButtons: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
});