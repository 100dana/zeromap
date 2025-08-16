import React, { useState, useEffect, useRef } from "react";
import { View, ScrollView, Image, Text, TouchableOpacity, ImageBackground, StyleSheet, Alert, TextInput, FlatList, Modal, StatusBar, Animated, PanResponder, Dimensions, ActivityIndicator } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import KakaoMap, { KakaoMapRef } from '../components/KakaoMap';
import BottomTabBar from '../components/BottomTabBar';
import { SeoulApiService, PlaceData } from '../services/seoulApi';
import { LocalDataService, LocalPlaceData } from '../services/localDataService';
import { SearchService, SearchResult } from '../services/searchService';
import StoreDataService, { StoreData } from '../services/storeDataService';
import { GeocodingService } from '../services/geocodingService';
import { mapScreenStyles } from '../styles/mapScreenStyles';
import { colors } from '../styles/colors';
import firestoreService from '../services/firestoreService';
import { Review } from '../types/review';
import auth from '@react-native-firebase/auth';

const CURRENT_LOCATION = { latitude: 37.5665, longitude: 126.9780 };

// calculateDistance를 함수 선언부 위로 이동
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// 검색 결과 아이템 컴포넌트
function SearchResultItem({ result, onPress }: { result: SearchResult; onPress: (result: SearchResult) => void }) {
  return (
    <TouchableOpacity
      style={mapScreenStyles.searchResultItem}
      onPress={() => onPress(result)}
    >
      <View style={mapScreenStyles.searchResultContent}>
        <Text style={mapScreenStyles.searchResultName}>{result.place.name}</Text>
        <Text style={mapScreenStyles.searchResultAddress}>{result.place.address}</Text>
      </View>
    </TouchableOpacity>
  );
}

// 검색 제안 아이템 컴포넌트
function SearchSuggestionItem({ suggestion, onPress }: { suggestion: string; onPress: (suggestion: string) => void }) {
  return (
    <TouchableOpacity
      style={mapScreenStyles.searchSuggestionItem}
      onPress={() => onPress(suggestion)}
    >
      <Text style={mapScreenStyles.searchSuggestionText}>💡 {suggestion}</Text>
    </TouchableOpacity>
  );
}

// 커스텀 모달 컴포넌트
const PlaceDetailModal = ({ 
  visible, 
  selectedPlace, 
  selectedCategory, 
  onClose, 
  onWriteReview,
  favorites,
  onToggleFavorite,
  loadingFavorite
}: { 
  visible: boolean;
  selectedPlace: PlaceData | LocalPlaceData | StoreData | null;
  selectedCategory: string;
  onClose: () => void;
  onWriteReview: (placeName?: string, placeId?: string) => void;
  favorites: string[];
  onToggleFavorite: (placeId: string) => void;
  loadingFavorite: boolean;
}) => {
  if (!selectedPlace) return null;
  
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
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={mapScreenStyles.modalOverlay}>
        <View style={mapScreenStyles.modalContent}>
          {/* 헤더 */}
          <View style={mapScreenStyles.modalHeader}>
            <View style={mapScreenStyles.modalTitleContainer}>
              <TouchableOpacity
                style={mapScreenStyles.favoriteButton}
                onPress={() => onToggleFavorite(selectedPlace.id || '')}
                disabled={loadingFavorite}
              >
                <Text style={[
                  mapScreenStyles.favoriteButtonText,
                  favorites.includes(selectedPlace.id || '') && mapScreenStyles.favoriteButtonTextActive
                ]}>
                  {favorites.includes(selectedPlace.id || '') ? '❤️' : '🤍'}
                </Text>
              </TouchableOpacity>
              <Text style={mapScreenStyles.modalTitle}>🏪 {selectedPlace.name}</Text>
            </View>
            <TouchableOpacity
              style={mapScreenStyles.closeButton}
              onPress={onClose}
            >
              <Text style={mapScreenStyles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          {/* 내용 */}
          <ScrollView style={mapScreenStyles.modalBody} showsVerticalScrollIndicator={false}>
            {/* 카테고리 배지 */}
            <View style={mapScreenStyles.categoryBadge}>
              <Text style={mapScreenStyles.categoryBadgeText}>{categoryDescription}</Text>
            </View>
            
            {/* 주소 */}
            <View style={mapScreenStyles.infoSection}>
              <Text style={mapScreenStyles.infoLabel}>📍 주소</Text>
              <Text style={mapScreenStyles.infoValue}>{selectedPlace.address}</Text>
            </View>
            
            {/* 설명 */}
            {selectedPlace.description && (
              <View style={mapScreenStyles.infoSection}>
                <Text style={mapScreenStyles.infoLabel}>📝 장소 설명</Text>
                <Text style={mapScreenStyles.infoValue}>{selectedPlace.description}</Text>
              </View>
            )}
          </ScrollView>
          
          {/* 액션 버튼 */}
          <View style={mapScreenStyles.modalActions}>
            <TouchableOpacity
              style={mapScreenStyles.modalButton}
              onPress={onClose}
            >
              <Text style={mapScreenStyles.modalButtonText}>닫기</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[mapScreenStyles.modalButton, mapScreenStyles.primaryButton]}
              onPress={() => {
                onClose();
                onWriteReview(selectedPlace?.name, selectedPlace?.id || 'unknown-place');
              }}
            >
              <Text style={[mapScreenStyles.modalButtonText, mapScreenStyles.primaryButtonText]}>리뷰쓰기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// 리스트 아이템 컴포넌트
function PlaceListItem({
  place,
  index,
  onPress,
  calculateDistance,
  currentLocation
}: {
  place: PlaceData | LocalPlaceData | StoreData;
  index: number;
  onPress: (place: PlaceData | LocalPlaceData | StoreData) => void;
  calculateDistance: (lat1: number, lon1: number, lat2: number, lon2: number) => number;
  currentLocation: { latitude: number; longitude: number };
}) {
  const distance = calculateDistance(
    currentLocation.latitude,
    currentLocation.longitude,
    place.latitude,
    place.longitude
  );
  return (
    <TouchableOpacity
      style={mapScreenStyles.placeListItem}
      onPress={() => onPress(place)}
    >
      <View style={mapScreenStyles.placeListItemHeader}>
        <View style={mapScreenStyles.placeListItemIcon}>
          <Text style={mapScreenStyles.placeListItemIconText}>📍</Text>
        </View>
        <View style={mapScreenStyles.placeListItemContent}>
          <Text style={mapScreenStyles.placeListItemName}>{place.name}</Text>
        </View>
        <View style={mapScreenStyles.placeListItemMeta}>
          <Text style={mapScreenStyles.placeListItemDistance}>
            {distance < 1 ? `${(distance * 1000).toFixed(0)}m` : `${distance.toFixed(1)}km`}
          </Text>
        </View>
      </View>
      <Text style={mapScreenStyles.placeListItemAddress}>{place.address}</Text>
      {place.description && (
        <Text style={mapScreenStyles.placeListItemDescription} numberOfLines={2}>
          {place.description}
        </Text>
      )}
      <View style={mapScreenStyles.placeListItemFooter}>
        <Text style={mapScreenStyles.placeListItemDetail}>상세보기 ›</Text>
      </View>
    </TouchableOpacity>
  );
}

const categories = [
  {
    icon: "🛒",
    label: "제로웨이스트",
    iconBgMargin: 38,
    textMargin: 4,
    type: 'zeroWaste',
    color: '#4CAF50',
    description: '친환경 제품을 판매하는 상점 (285곳)'
  },
  {
    icon: "☕",
    label: "개인컵 할인\n카페",
    iconBgMargin: 38,
    textMargin: 3,
    type: 'cupDiscountCafe',
    color: '#FF9800',
    description: '개인 컵 할인을 제공하는 카페 (159곳)'
  },
  {
    icon: "🍽️",
    label: "비건",
    iconBgMargin: 38,
    textMargin: 3,
    type: 'zeroRestaurant',
    color: '#2196F3',
    description: '친환경 식당 및 카페 (1,300곳)'
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
  disabled?: boolean;
};

function CategoryCard({ icon, label, iconBgMargin, textMargin, type, color, description, style, isSelected, onPress, disabled }: CategoryCardProps) {
  return (
    <TouchableOpacity 
      style={[
        mapScreenStyles.categoryCard, 
        style, 
        isSelected && mapScreenStyles.selectedCategoryCard,
        disabled && mapScreenStyles.categoryCardDisabled
      ]} 
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      accessibilityLabel={`${label} 카테고리 선택`}
      accessibilityHint={description}
    >
      <View style={[mapScreenStyles.categoryIconWrap, { marginHorizontal: iconBgMargin }]}> 
        <View style={[
          mapScreenStyles.categoryIconBg, 
          isSelected && mapScreenStyles.selectedCategoryIconBg,
          { backgroundColor: isSelected ? color : colors.surface }
        ]}>
          <Text style={mapScreenStyles.categoryIcon}>{icon}</Text>
        </View>
      </View>
      {/* label에 줄바꿈(\n)이 있으면 각 줄을 <Text>로 감싸서 렌더링 */}
      <View style={{alignItems:'center'}}>
        {label.split('\n').map((line, idx) => (
          <Text key={idx} style={[
            mapScreenStyles.categoryLabel, 
            { marginHorizontal: textMargin },
            isSelected && { color: color }
          ]}>{line}</Text>
        ))}
      </View>
    </TouchableOpacity>
  );
}

type RootStackParamList = {
  Map: undefined;
  ReportPlace: undefined;
  WriteReview: { 
    placeName?: string;
    placeId?: string;
  };
  ReviewList: {
    placeId: string;
    placeName: string;
  };
};

export default function MapScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Map'>>();
  const mapRef = useRef<KakaoMapRef>(null);
  
  // 상태 관리
  const [selectedCategory, setSelectedCategory] = useState('zeroWaste');
  const [places, setPlaces] = useState<PlaceData[]>([]);
  const [localPlaces, setLocalPlaces] = useState<LocalPlaceData[]>([]);
  const [storePlaces, setStorePlaces] = useState<StoreData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  // 모달 상태 추가
  const [showPlaceModal, setShowPlaceModal] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<PlaceData | LocalPlaceData | StoreData | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [showReviewListModal, setShowReviewListModal] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loadingFavorite, setLoadingFavorite] = useState(false);
  const screenHeight = Dimensions.get('window').height;
  const SNAP_TOP = 0;
  const SNAP_MID = screenHeight * 0.2;
  const SNAP_BOTTOM = screenHeight;
  const [barVisible, setBarVisible] = useState(false);
  const animatedY = useRef(new Animated.Value(SNAP_BOTTOM)).current;

  const showBar = () => {
    setBarVisible(true);
    Animated.timing(animatedY, { toValue: SNAP_MID, duration: 250, useNativeDriver: false }).start();
  };
  const hideBar = () => {
    Animated.timing(animatedY, { toValue: SNAP_BOTTOM, duration: 200, useNativeDriver: false }).start(() => setBarVisible(false));
  };
  const expandBar = () => {
    Animated.timing(animatedY, { toValue: SNAP_TOP, duration: 200, useNativeDriver: false }).start();
  };
  const collapseBar = () => {
    Animated.timing(animatedY, { toValue: SNAP_MID, duration: 200, useNativeDriver: false }).start();
  };

  // panResponder에서 animatedY.__getValue 타입 에러 무시
  const panResponder = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 10,
    onPanResponderMove: (_, gesture) => {
      // animatedY._value 대신 animatedY.extractOffset() 사용 불가하므로, gesture.dy만 사용
      // 실제로는 setValue를 gesture.dy로만 하지 않고, 별도 상태로 관리하는 게 안전하지만, 여기선 간단히 유지
      // animatedY.setValue(newY); // 기존 코드 주석처리
    },
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dy > 100) hideBar();
      else if (gesture.dy < -100) expandBar();
      // @ts-ignore
      else if (animatedY.__getValue && animatedY.__getValue() < screenHeight * 0.4) expandBar();
      else collapseBar();
    },
  })).current;

  const handleMarkerClick = (place: PlaceData | LocalPlaceData | StoreData) => {
    setSelectedPlace(place);
    showBar();
  };

  useEffect(() => {
    if (!selectedPlace) hideBar();
    if (!selectedPlace) return;
    setLoadingReviews(true);
    firestoreService.getReviewsByPlaceId(selectedPlace.id || '').then(setReviews).catch(() => setReviews([])).finally(() => setLoadingReviews(false));
  }, [selectedPlace]);

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
    const allPlaces = [...places, ...localPlaces, ...storePlaces];
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
    
    // 선택된 장소로 지도 이동 (지도뷰일 때만)
    if (viewMode === 'map' && mapRef.current) {
      // 지도 이동 후 마커 강조를 위한 지연
      mapRef.current.moveToLocation(result.place.latitude, result.place.longitude, 2);
      
      // 마커 강조를 위한 약간의 지연
      setTimeout(() => {
        mapRef.current?.highlightMarker(result.place.id);
      }, 500);
    }
    
    handleMarkerClick(result.place);
  };

  // 검색 제안 선택
  const handleSuggestionSelect = (suggestion: string) => {
    setSearchQuery(suggestion);
    handleSearch(suggestion);
  };

  // 즐겨찾기 토글 함수
  const toggleFavorite = async (placeId: string) => {
    if (loadingFavorite) return;
    
    setLoadingFavorite(true);
    try {
      const isFavorite = favorites.includes(placeId);
      
      if (isFavorite) {
        // 즐겨찾기에서 제거
        const updatedFavorites = favorites.filter(id => id !== placeId);
        setFavorites(updatedFavorites);
        
        // Firebase에서 제거
        await firestoreService.removeFavorite(placeId);
      } else {
        // 즐겨찾기에 추가
        const updatedFavorites = [...favorites, placeId];
        setFavorites(updatedFavorites);
        
        // Firebase에 추가
        await firestoreService.addFavorite(placeId);
      }
    } catch (error) {
      console.error('즐겨찾기 토글 실패:', error);
      Alert.alert('오류', '즐겨찾기 처리 중 오류가 발생했습니다.');
    } finally {
      setLoadingFavorite(false);
    }
  };

  // 검색 취소
  const handleSearchCancel = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSearchSuggestions([]);
    setShowSearchResults(false);
  };




  const ReviewBar = () => {
    if (!barVisible || !selectedPlace) return null;
    const avgRating = reviews.length ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1) : '-';
    return (
      <Animated.View style={{
        position:'absolute',left:0,right:0,
        top:animatedY,
        height:screenHeight,
        backgroundColor:'#fff',
        borderTopLeftRadius:16,borderTopRightRadius:16,
        shadowColor:'#000',shadowOpacity:0.1,shadowOffset:{width:0,height:-2},shadowRadius:8,elevation:8,
        zIndex:100,
      }} {...panResponder.panHandlers}>
        <View style={{alignItems:'center',padding:4}}>
          <View style={{width:40,height:5,borderRadius:3,backgroundColor:'#ccc',marginVertical:6}}/>
        </View>
        <View style={{backgroundColor:'#fff',borderRadius:18,marginHorizontal:18,marginTop:8,marginBottom:12,shadowColor:'#000',shadowOpacity:0.07,shadowOffset:{width:0,height:2},shadowRadius:8,elevation:3,paddingTop:18,paddingBottom:18,paddingHorizontal:18}}>
          <View style={{flexDirection:'row',alignItems:'center',justifyContent:'flex-start',marginBottom:6}}>
            <TouchableOpacity
              style={{padding:6, marginRight:8}}
              onPress={() => toggleFavorite(selectedPlace.id || '')}
              disabled={loadingFavorite}
            >
              <Text style={{fontSize:18, opacity: favorites.includes(selectedPlace.id || '') ? 1 : 0.7}}>
                {favorites.includes(selectedPlace.id || '') ? '❤️' : '🤍'}
              </Text>
            </TouchableOpacity>
            <Text style={{fontWeight:'bold',fontSize:20,marginRight:14}}>{selectedPlace.name}</Text>
            <Text style={{fontSize:14,marginTop:2}}>
              <Text style={{color:'#f5b50a'}}>★ </Text>
              <Text style={{color:'#222'}}>{avgRating} ({reviews.length})</Text>
            </Text>
            <View style={{flex:1}} />
            <TouchableOpacity onPress={()=>{setSelectedPlace(null);hideBar();}} style={{padding:8, marginLeft: 10, marginTop: 0}}>
              <Text style={{fontSize:22,color:'#888'}}>✕</Text>
              </TouchableOpacity>
            </View>
          <View style={{marginBottom:8}}>
            <Text style={{color:'#888',marginBottom:2,fontSize:13}}>📍 {selectedPlace.address}</Text>
            {selectedPlace.description ? <Text style={{color:'#444',marginBottom:2,fontSize:14}}>{selectedPlace.description}</Text> : null}
              </View>
              <TouchableOpacity
            style={{
              backgroundColor: '#4CAF50',
              borderRadius: 18,
              paddingVertical: 10,
              paddingHorizontal: 28,
              alignSelf: 'flex-end',
              marginTop: 8,
              marginRight: 2,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.10,
              shadowRadius: 4,
              elevation: 1,
            }}
                onPress={() => {
              setSelectedPlace(null); hideBar();
              navigation.navigate('WriteReview', {placeName: selectedPlace.name, placeId: selectedPlace.id || 'unknown-place'});
            }}
          >
            <Text style={{color:'#fff',fontWeight:'bold',fontSize:16,letterSpacing:0.2}}>리뷰쓰기</Text>
              </TouchableOpacity>
            </View>
        <ScrollView style={{flex:1,paddingHorizontal:24}} contentContainerStyle={{paddingBottom:80}}>
          <Text style={{fontWeight:'bold',fontSize:15,marginTop:8,marginBottom:6}}>리뷰</Text>
          {loadingReviews ? (
            <View style={mapScreenStyles.reviewLoadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={mapScreenStyles.reviewLoadingText}>리뷰 불러오는 중...</Text>
            </View>
          ) : reviews.length === 0 ? (
            <View style={{alignItems:'center',marginVertical:24}}>
              <Text style={{color:'#888',marginBottom:8}}>아직 리뷰가 없습니다.</Text>
          </View>
          ) : (
            <>
              {reviews.slice(0,3).map((r) => (
                // @ts-ignore
                <View style={{marginBottom:16,borderBottomWidth:1,borderBottomColor:'#eee',paddingBottom:8}} key={r.id}>
                  <Text style={{fontWeight:'bold'}}>
                    {r.userName} <Text style={{color:'#f5b50a'}}>{'★'.repeat(r.rating)}</Text>
                  </Text>
                  <Text style={{marginVertical:2}}>{r.reviewText}</Text>
                  <Text style={{fontSize:12,color:'#888'}}>{new Date(r.createdAt).toISOString().slice(0,10)}</Text>
        </View>
              ))}
              {reviews.length > 3 && (
                <TouchableOpacity style={{alignSelf:'flex-end',marginTop:4}} onPress={()=>navigation.navigate('ReviewList', { placeId: selectedPlace.id, placeName: selectedPlace.name })}>
                  <Text style={{color:'#4CAF50',fontWeight:'bold'}}>리뷰 전체보기 &gt;</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </ScrollView>
      </Animated.View>
    );
  };


  // 현재 표시할 장소 데이터 (검색 중일 때는 검색 결과만, 아니면 전체)
  const getDisplayPlaces = (): PlaceData[] => {
    if (showSearchResults && searchQuery.trim()) {
      return searchResults.map(result => result.place);
    }
    
    // 제로식당의 경우 storePlaces를 PlaceData 형식으로 변환
    if (selectedCategory === 'zeroRestaurant') {
      console.log(`🗺️ 제로식당 표시 데이터: ${storePlaces.length}개`);
      return storePlaces.map(store => ({
        id: store.id,
        name: store.name,
        address: store.address,
        latitude: store.latitude,
        longitude: store.longitude,
        category: store.category || '제로식당',
        description: store.description || ''
      }));
    }
    
    // 다른 카테고리의 경우 기존 로직 사용
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
      return distanceA - distanceB;
    });
  };

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
          try {
            const storeDataService = StoreDataService;
            const allZeroRestaurants = storeDataService.getAllStores();
            const validZeroRestaurants = allZeroRestaurants.filter(place =>
              place.latitude && place.longitude &&
              place.latitude !== 0 && place.longitude !== 0
            );
            setStorePlaces(validZeroRestaurants);
            const totalData = [
              ...(apiData || []),
              ...(localData || []),
              ...(validZeroRestaurants || [])
            ];
            if (totalData.length === 0) {
              Alert.alert('알림', '해당 카테고리의 데이터가 없습니다.');
              setLoading(false); // 데이터가 없으면 로딩 종료
            }
            // 데이터가 있으면 마커 렌더링 완료까지 기다림 (onMarkersLoaded에서 처리)
            return;
          } catch (error) {
            setStorePlaces([]);
            Alert.alert('알림', '제로식당 데이터를 불러오는데 실패했습니다.');
            setLoading(false);
            return;
          }
        case 'refillStation':
          localData = await LocalDataService.getRefillStations();
          break;
        case 'refillShop':
          localData = [];
          break;
        case 'ecoSupplies':
          localData = [];
          break;
        case 'cafe':
          localData = [];
          break;
        case 'others':
          localData = [];
          break;
        default:
          apiData = [];
          localData = [];
      }
      const validApiData = (apiData || []).filter(place =>
        place && place.latitude && place.longitude &&
        place.latitude !== 0 && place.longitude !== 0
      );
      const validLocalData = (localData || []).filter(place =>
        place && place.latitude && place.longitude &&
        place.latitude !== 0 && place.longitude !== 0
      );
      const validStoreData = (storePlaces || []).filter(place =>
        place && place.latitude && place.longitude &&
        place.latitude !== 0 && place.longitude !== 0
      );
      setPlaces(validApiData);
      setLocalPlaces(validLocalData);
      const totalData = [
        ...(validApiData || []),
        ...(validLocalData || []),
        ...(validStoreData || [])
      ];
      if (totalData.length === 0) {
        Alert.alert('알림', '해당 카테고리의 데이터가 없습니다.');
        setLoading(false); // 데이터가 없으면 로딩 종료
      }
      // 데이터가 있으면 마커 렌더링 완료까지 기다림 (onMarkersLoaded에서 처리)
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
      setLoading(false); // 에러 발생 시 로딩 종료
    }
    // finally 블록 제거: 마커 렌더링 완료 시에만 로딩 종료
  };

  // 마커 렌더링 완료 콜백
  const handleMarkersLoaded = () => {
    setLoading(false);
  };

  // 화면 로드 시 기본 데이터 로드
  useEffect(() => {
    loadPlaces(selectedCategory);
  }, []); // 컴포넌트 마운트 시 한 번만 실행

  // 익명 로그인 및 즐겨찾기 목록 로드
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // 현재 사용자가 없으면 익명 로그인
        const currentUser = auth().currentUser;
        if (!currentUser) {
          await auth().signInAnonymously();
          console.log('익명 로그인 성공');
        }
        
        // 즐겨찾기 목록 로드
        const favoritesList = await firestoreService.getFavorites();
        setFavorites(favoritesList);
      } catch (error) {
        console.error('인증 또는 즐겨찾기 로드 실패:', error);
      }
    };
    
    initializeAuth();
  }, []);

  // 검색 상태가 변경될 때마다 지도 마커 업데이트
  useEffect(() => {
    if (viewMode === 'map' && mapRef.current) {
      // 검색 결과가 있으면 해당 위치로 이동
      if (showSearchResults && searchResults.length > 0) {
        const firstResult = searchResults[0];
        mapRef.current.moveToLocation(firstResult.place.latitude, firstResult.place.longitude, 2);
        
        // 마커 강조를 위한 약간의 지연
        setTimeout(() => {
          mapRef.current?.highlightMarker(firstResult.place.id);
        }, 500);
      }
    }
  }, [searchResults, showSearchResults, viewMode]);

  // 모든 장소 데이터 (API + 로컬 + 스토어)
  const allPlaces = [...places, ...localPlaces, ...storePlaces];
  const displayPlaces = getDisplayPlaces();
  
  // 기존 ReviewListModal 관련 코드(컴포넌트, 상태 등) 삭제 또는 주석처리
  // const ReviewListModal = () => (
  //   <Modal
  //     visible={showReviewListModal}
  //     transparent={true}
  //     animationType="slide"
  //     onRequestClose={() => setShowReviewListModal(false)}
  //   >
  //     <View style={mapScreenStyles.modalOverlay}>
  //       <View style={[mapScreenStyles.modalContent, { maxHeight: '90%' }]}> 
  //         <View style={mapScreenStyles.modalHeader}>
  //           <Text style={mapScreenStyles.modalTitle}>전체 리뷰</Text>
  //           <TouchableOpacity style={mapScreenStyles.closeButton} onPress={() => setShowReviewListModal(false)}>
  //             <Text style={mapScreenStyles.closeButtonText}>✕</Text>
  //           </TouchableOpacity>
  //         </View>
  //         <ScrollView style={mapScreenStyles.modalBody} showsVerticalScrollIndicator={true}>
  //           {loadingReviews ? (
  //             <Text>리뷰 불러오는 중...</Text>
  //           ) : reviews.length === 0 ? (
  //             <Text>아직 리뷰가 없습니다.</Text>
  //           ) : (
  //             reviews.map(r => (
  //               <React.Fragment key={r.id}>
  //                 <View style={{ marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 8 }}>
  //                   <Text style={{ fontWeight: 'bold' }}>
  //                     {r.userName} <Text style={{ color: '#f5b50a' }}>{'★'.repeat(r.rating)}</Text>
  //                   </Text>
  //                   <Text style={{ marginVertical: 2 }}>{r.reviewText}</Text>
  //                   <Text style={{ fontSize: 12, color: '#888' }}>{new Date(r.createdAt).toISOString().slice(0, 10)}</Text>
  //                 </View>
  //               </React.Fragment>
  //             ))
  //           )}
  //         </ScrollView>
  //       </View>
  //     </View>
  //   </Modal>
  // );

  // handleCategoryPress 함수 추가
  const handleCategoryPress = (type: string) => {
    if (loading) return; // 로딩 중이면 카테고리 변경 불가
    setSelectedCategory(type);
    loadPlaces(type);
  };
  
  return (
    <View style={mapScreenStyles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={mapScreenStyles.safeAreaContent}>
        <View style={mapScreenStyles.container}>
          {/* 상단 헤더 */}
          <View style={mapScreenStyles.headerContainer}>
            <View style={mapScreenStyles.headerTitleContainer}>
              <View style={mapScreenStyles.headerTextContainer}>
                <Text style={mapScreenStyles.headerTitle}>ZeroMap</Text>
                <Text style={mapScreenStyles.headerSubtitle}>제로웨이스트 맵</Text>
              </View>
            </View>
          </View>

          {/* 검색바 */}
          <View style={mapScreenStyles.searchContainer}>
            <View style={mapScreenStyles.searchInputContainer}>
              <TextInput
                style={mapScreenStyles.searchInput}
                placeholder="장소 검색..."
                value={searchQuery}
                onChangeText={handleSearch}
                placeholderTextColor={colors.textSecondary}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  style={mapScreenStyles.clearButton}
                  onPress={handleSearchCancel}
                >
                  <Text style={mapScreenStyles.clearButtonText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
            {/* 검색 결과 및 제안 */}
            {showSearchResults && (
              <View style={mapScreenStyles.searchResultsContainer}>
                {isSearching ? (
                  <View style={mapScreenStyles.searchLoading}>
                    <Text style={mapScreenStyles.searchLoadingText}>검색 중...</Text>
                  </View>
                ) : (
                  <>
                    {/* 검색 제안 */}
                    {searchSuggestions.length > 0 && searchQuery.length > 0 && (
                      <View style={mapScreenStyles.searchSuggestionsContainer}>
                        <Text style={mapScreenStyles.searchSuggestionsTitle}>검색 제안</Text>
                        {searchSuggestions.map((suggestion, index) => (
                          <SearchSuggestionItem 
                            key={index} 
                            suggestion={suggestion} 
                            onPress={handleSuggestionSelect}
                          />
                        ))}
                      </View>
                    )}
                    {/* 검색 결과 */}
                    {searchResults.length > 0 && (
                      <View style={mapScreenStyles.searchResultsList}>
                        <Text style={mapScreenStyles.searchResultsTitle}>
                          검색 결과 ({searchResults.length}개)
                        </Text>
                        {searchResults.map((result, index) => (
                          <SearchResultItem 
                            key={index} 
                            result={result} 
                            onPress={handleSearchResultSelect}
                          />
                        ))}
                      </View>
                    )}
                    {/* 검색 결과가 없을 때 */}
                    {searchQuery.length > 0 && searchResults.length === 0 && searchSuggestions.length === 0 && (
                      <View style={mapScreenStyles.noSearchResults}>
                        <Text style={mapScreenStyles.noSearchResultsText}>
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
          <View style={mapScreenStyles.categoryContainer}>
            <Text style={mapScreenStyles.categoryTitle}>카테고리 선택</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={mapScreenStyles.categoryScrollContainer}
            >
              {categories.map((cat, idx) => (
                <CategoryCard
                  key={idx}
                  {...cat}
                  style={[
                    idx === categories.length - 1 ? mapScreenStyles.noMarginRight : undefined,
                    loading && mapScreenStyles.categoryCardDisabled
                  ]}
                  isSelected={selectedCategory === cat.type}
                  onPress={() => handleCategoryPress(cat.type)}
                  disabled={loading}
                />
              ))}
            </ScrollView>
          </View>

          {/* 지도/리스트 전환 버튼 */}
          <View style={mapScreenStyles.viewToggleContainer}>
            <TouchableOpacity
              style={[
                mapScreenStyles.viewToggleButton,
                viewMode === 'map' && mapScreenStyles.viewToggleButtonActive
              ]}
              onPress={() => setViewMode('map')}
            >
              <Text style={[
                mapScreenStyles.viewToggleText,
                viewMode === 'map' && mapScreenStyles.viewToggleTextActive
              ]}>🗺️ 지도</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                mapScreenStyles.viewToggleButton,
                viewMode === 'list' && mapScreenStyles.viewToggleButtonActive
              ]}
              onPress={() => setViewMode('list')}
            >
              <Text style={[
                mapScreenStyles.viewToggleText,
                viewMode === 'list' && mapScreenStyles.viewToggleTextActive
              ]}>📋 리스트</Text>
            </TouchableOpacity>
          </View>

          {/* 메인 컨텐츠 */}
          <View style={mapScreenStyles.mainMap}>
            {viewMode === 'map' ? (
              <>
                <KakaoMap
                  ref={mapRef}
                  places={displayPlaces}
                  onMarkerClick={handleMarkerClick}
                  onMarkersLoaded={handleMarkersLoaded}
                />
                {loading && (
                  <View style={mapScreenStyles.mapLoadingOverlay}>
                    <View style={mapScreenStyles.mapLoadingContainer}>
                      <ActivityIndicator size="large" color={colors.primary} />
                      <Text style={mapScreenStyles.mapLoadingText}>지도 마커 데이터 로딩 중...</Text>
                      <Text style={mapScreenStyles.mapLoadingSubText}>
                        {selectedCategory === 'zeroWaste' && '제로웨이스트 상점 위치 정보를 불러오는 중'}
                        {selectedCategory === 'cupDiscountCafe' && '개인컵 할인 카페 위치 정보를 불러오는 중'}
                        {selectedCategory === 'zeroRestaurant' && '제로식당 위치 정보를 불러오는 중'}
                        {!['zeroWaste', 'cupDiscountCafe', 'zeroRestaurant'].includes(selectedCategory) && '장소 위치 정보를 불러오는 중'}
                      </Text>
                    </View>
                  </View>
                )}
              </>
            ) : (
              <ScrollView 
                style={mapScreenStyles.listContainer}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={mapScreenStyles.listContentContainer}
              >
                {loading ? (
                  <View style={mapScreenStyles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={mapScreenStyles.loadingText}>데이터를 불러오는 중...</Text>
                    <Text style={mapScreenStyles.loadingSubText}>
                      {selectedCategory === 'zeroWaste' && '제로웨이스트 상점 정보를 가져오고 있습니다'}
                      {selectedCategory === 'cupDiscountCafe' && '개인컵 할인 카페 정보를 가져오고 있습니다'}
                      {selectedCategory === 'zeroRestaurant' && '제로식당 정보를 가져오고 있습니다'}
                      {!['zeroWaste', 'cupDiscountCafe', 'zeroRestaurant'].includes(selectedCategory) && '지역 데이터를 불러오고 있습니다'}
                    </Text>
                  </View>
                ) : displayPlaces.length > 0 ? (
                  <>
                    <View style={mapScreenStyles.listHeader}>
                      <Text style={mapScreenStyles.listHeaderTitle}>
                        {showSearchResults ? `검색 결과 (${displayPlaces.length}곳)` : `${categories.find(cat => cat.type === selectedCategory)?.label || ''} (${displayPlaces.length}곳)`}
                      </Text>
                    </View>
                    {displayPlaces.map((place, index) => (
                      <PlaceListItem 
                        key={`${place.id}-${index}`} 
                        place={place} 
                        index={index}
                        onPress={(selectedPlace) => {
                          setSelectedPlace(selectedPlace);
                          setShowPlaceModal(true);
                        }}
                        calculateDistance={calculateDistance}
                        currentLocation={CURRENT_LOCATION}
                      />
                    ))}
                  </>
                ) : (
                  <View style={mapScreenStyles.emptyContainer}>
                    <Text style={mapScreenStyles.emptyText}>
                      {showSearchResults ? '검색 결과가 없습니다.' : '해당 카테고리의 데이터가 없습니다.'}
                    </Text>
                  </View>
                )}
              </ScrollView>
            )}
          </View>

          {/* 액션 버튼 */}
          <View style={mapScreenStyles.actionButtons}>
            <TouchableOpacity
              style={mapScreenStyles.reportButton}
              onPress={() => navigation.navigate('ReportPlace')}
            >
              <Text style={mapScreenStyles.reportButtonText}>장소 제보하기</Text>
            </TouchableOpacity>
          </View>

        </View> {/* container 닫기 */}
        <ReviewBar />
        <PlaceDetailModal 
          visible={showPlaceModal}
          selectedPlace={selectedPlace}
          selectedCategory={selectedCategory}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          loadingFavorite={loadingFavorite}
          onClose={() => setShowPlaceModal(false)}
          onWriteReview={(placeName, placeId) => {
            setShowPlaceModal(false);
            navigation.navigate('WriteReview', { 
              placeName,
              placeId: placeId || 'unknown-place'
            });
          }}
        />
        <BottomTabBar currentRoute="Map" />
      </SafeAreaView>
    </View>
  );
}

