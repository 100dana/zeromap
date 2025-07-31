import React, { useState, useEffect } from "react";
import { SafeAreaView, View, ScrollView, Text, TouchableOpacity, StyleSheet, Alert, TextInput } from "react-native";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import KakaoMap from '../components/KakaoMap';
import { SeoulApiService, PlaceData } from '../services/seoulApi';
import { LocalDataService, LocalPlaceData } from '../services/localDataService';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';
import { shadows } from '../styles/shadows';

const categories = [
  {
    icon: "🛒",
    label: "제로웨이스트샵",
    type: 'zeroWaste',
    color: '#4CAF50',
    description: '[착한소비] 제로웨이스트상점'
  },
  {
    icon: "☕",
    label: "개인컵할인카페",
    type: 'cafe',
    color: '#607D8B',
    description: '[착한소비] 개인 컵 할인 카페'
  },
  {
    icon: "🌱",
    label: "착한소비",
    type: 'goodConsumption',
    color: '#8BC34A',
    description: '모든 착한소비 관련 장소'
  },
  {
    icon: "🍽️",
    label: "제로식당",
    type: 'zeroRestaurant',
    color: '#FF9800',
    description: '친환경 식당 및 카페'
  },
  {
    icon: "🔄",
    label: "리필스테이션",
    type: 'refillStation',
    color: '#2196F3',
    description: '리필 서비스를 제공하는 곳'
  }
];

type CategoryCardProps = {
  icon: string;
  label: string;
  type: string;
  color: string;
  description: string;
  isSelected?: boolean;
  onPress?: () => void;
};

function CategoryCard({ icon, label, type, color, description, isSelected, onPress }: CategoryCardProps) {
  return (
    <TouchableOpacity 
      style={[
        styles.categoryCard, 
        isSelected && styles.selectedCategoryCard
      ]} 
      onPress={onPress}
    >
      <View style={[styles.categoryIconBg, isSelected && styles.selectedCategoryIconBg]}>
        <Text style={styles.categoryIcon}>{icon}</Text>
      </View>
      <Text style={[styles.categoryLabel, isSelected && { color: color }]}>
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
  const [selectedCategory, setSelectedCategory] = useState<string>('goodConsumption');
  const [loading, setLoading] = useState(false);

  // 컴포넌트 마운트 시 기본 데이터 로드
  useEffect(() => {
    loadPlaces(selectedCategory);
  }, []);

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
          const [csvData, apiRestaurantData] = await Promise.all([
            LocalDataService.getZeroRestaurants(),
            SeoulApiService.getZeroWasteShops()
          ]);
          localData = csvData;
          apiData = apiRestaurantData;
          break;
        case 'refillStation':
          localData = await LocalDataService.getRefillStations();
          break;
        case 'cafe':
          apiData = await SeoulApiService.getCupDiscountCafes();
          break;
        case 'goodConsumption':
          apiData = await SeoulApiService.getGoodConsumptionPlaces();
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
      Alert.alert('오류', '데이터를 불러오는데 실패했습니다.');
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
          <View style={styles.mapContainer}>
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
  mapContainer: {
    flex: 1,
    height: 400,
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 6,
    overflow: 'hidden',
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
});