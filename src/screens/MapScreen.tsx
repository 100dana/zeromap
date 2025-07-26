import React, { useState, useEffect } from "react";
import { SafeAreaView, View, ScrollView, Image, Text, TouchableOpacity, ImageBackground, StyleSheet, Alert } from "react-native";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import KakaoMap from '../components/KakaoMap';
import { SeoulApiService, PlaceData } from '../services/seoulApi';

const categories = [
  {
    icon: "🛒",
    label: "제로웨이스트샵",
    iconBgMargin: 38,
    textMargin: 4,
    type: 'zeroWaste'
  },
  {
    icon: "🥗",
    label: "비건식당",
    iconBgMargin: 38,
    textMargin: 3,
    type: 'vegan'
  },
  {
    icon: "🔄",
    label: "리필스테이션",
    iconBgMargin: 38,
    textMargin: 3,
    type: 'refill'
  },
];

type CategoryCardProps = {
  icon: string;
  label: string;
  iconBgMargin: number;
  textMargin: number;
  type: string;
  style?: any;
  isSelected?: boolean;
  onPress?: () => void;
};

function CategoryCard({ icon, label, iconBgMargin, textMargin, type, style, isSelected, onPress }: CategoryCardProps) {
  return (
    <TouchableOpacity 
      style={[
        styles.categoryCard, 
        style, 
        isSelected && styles.selectedCategoryCard
      ]} 
      onPress={onPress}
    >
      <View style={[styles.categoryIconWrap, { marginHorizontal: iconBgMargin }]}> 
        <View style={[styles.categoryIconBg, isSelected && styles.selectedCategoryIconBg]}>
          <Text style={styles.categoryIcon}>{icon}</Text>
        </View>
      </View>
      <Text style={[styles.categoryLabel, { marginHorizontal: textMargin }]}>{label}</Text>
    </TouchableOpacity>
  );
}

type RootStackParamList = {
  Home: undefined;
  Map: undefined;
  MapDetail: undefined;
};

export default function MapScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Map'>>();
  const [places, setPlaces] = useState<PlaceData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('zeroWaste');
  const [loading, setLoading] = useState(false);

  // 데이터 로드 함수
  const loadPlaces = async (category: string) => {
    setLoading(true);
    try {
      let data: PlaceData[] = [];
      
      switch (category) {
        case 'zeroWaste':
          data = await SeoulApiService.getZeroWasteShops();
          break;
        case 'vegan':
          data = await SeoulApiService.getVeganRestaurants();
          break;
        case 'refill':
          data = await SeoulApiService.getCupDiscountCafes();
          break;
        default:
          data = [];
      }
      
      if (data.length === 0) {
        Alert.alert('알림', '해당 카테고리의 데이터가 없습니다.');
      }
      
      setPlaces(data);
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
  const handleMarkerClick = (place: PlaceData) => {
    Alert.alert(
      place.name,
      `${place.address}\n\n${place.description || ''}`,
      [
        { text: '닫기', style: 'cancel' },
        { text: '상세보기', onPress: () => {
          // 상세 페이지로 이동
          navigation.navigate('MapDetail');
        }}
      ]
    );
  };

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    loadPlaces(selectedCategory);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>{"Zero Map : 제로 맵"}</Text>
        </View>
        <TouchableOpacity
          style={styles.locationSearchBtn}
          onPress={() => {}}
          accessibilityLabel="위치 기반 검색 버튼"
        >
          <Text style={styles.locationSearchText}>{"위치 기반 검색"}</Text>
          <Image
            source={{ uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/AI1KD1CsF9/986qyqnx_expires_30_days.png" }}
            resizeMode="stretch"
            style={styles.locationSearchIcon}
          />
        </TouchableOpacity>
        <View style={styles.categoryRow}>
          {categories.map((cat, idx) => (
            <CategoryCard
              key={idx}
              {...cat}
              style={idx === categories.length - 1 ? styles.noMarginRight : undefined}
              isSelected={selectedCategory === cat.type}
              onPress={() => handleCategoryPress(cat.type)}
            />
          ))}
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
            places={places}
            onMarkerClick={handleMarkerClick}
          />
        </View>
        
        {/* 결과 개수 표시 */}
        {places.length > 0 && (
          <View style={styles.resultInfo}>
            <Text style={styles.resultText}>
              총 {places.length}개의 장소를 찾았습니다.
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  headerContainer: {
    backgroundColor: "#FFFFFF",
    marginBottom: 10,
    marginHorizontal: 26,
    shadowColor: "#0000001C",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 6,
    elevation: 6,
  },
  headerImage: {
    height: 24,
  },
  headerTitle: {
    color: "#000000",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 12,
    marginHorizontal: 16,
  },
  locationSearchBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#0000001A",
    borderRadius: 6,
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 11,
    marginBottom: 10,
    marginHorizontal: 36,
  },
  locationSearchText: {
    color: "#000000",
    fontSize: 14,
    flex: 1,
  },
  locationSearchIcon: {
    borderRadius: 6,
    width: 36,
    height: 28,
  },
  categoryRow: {
    flexDirection: "row",
    marginBottom: 10,
    marginHorizontal: 35,
  },
  categoryCard: {
    flex: 1,
    borderColor: "#0000001A",
    borderRadius: 6,
    borderWidth: 1,
    paddingVertical: 4,
    marginRight: 9,
    backgroundColor: "#fff",
    minWidth: 0,
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
});