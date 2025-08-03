import React, { useState } from "react";
import { 
  SafeAreaView, 
  View, 
  ScrollView, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  Image
} from "react-native";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import KakaoMap from '../components/KakaoMap';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';
import { shadows } from '../styles/shadows';

type RootStackParamList = {
  Home: undefined;
  Map: undefined;
  ReportPlace: undefined;
};

const categories = [
  {
    id: 'zeroWaste',
    label: "제로웨이스트샵",
    icon: "🛒"
  },
  {
    id: 'zeroRestaurant',
    label: "비건식당",
    icon: "🍽️"
  },
  {
    id: 'refillStation',
    label: "리필스테이션",
    icon: "🔄"
  }
];

type CategoryCardProps = {
  id: string;
  label: string;
  icon: string;
  isSelected: boolean;
  onPress: () => void;
};

function CategoryCard({ id, label, icon, isSelected, onPress }: CategoryCardProps) {
  return (
    <TouchableOpacity 
      style={[
        styles.categoryCard, 
        isSelected && styles.selectedCategoryCard
      ]} 
      onPress={onPress}
    >
      <Text style={styles.categoryIcon}>{icon}</Text>
      <Text style={[
        styles.categoryLabel,
        isSelected && styles.selectedCategoryLabel
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function ReportPlace() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'ReportPlace'>>();
  
  const [placeName, setPlaceName] = useState('');
  const [address, setAddress] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [description, setDescription] = useState('');
  const [selectedLocation, setSelectedLocation] = useState({ lat: 37.5665, lng: 126.9780 }); // 서울시청 기본 위치

  const handleSave = () => {
    if (!placeName.trim()) {
      Alert.alert('알림', '장소 이름을 입력해주세요.');
      return;
    }
    if (!address.trim()) {
      Alert.alert('알림', '주소를 입력해주세요.');
      return;
    }
    if (!selectedCategory) {
      Alert.alert('알림', '카테고리를 선택해주세요.');
      return;
    }

    Alert.alert(
      '제보 완료',
      '장소 제보가 완료되었습니다!\n\n검토 후 반영됩니다.',
      [
        {
          text: '확인',
          onPress: () => navigation.goBack()
        }
      ]
    );
  };

  const handleCancel = () => {
    Alert.alert(
      '취소',
      '작성 중인 내용이 사라집니다.\n정말 취소하시겠습니까?',
      [
        { text: '계속 작성', style: 'cancel' },
        { text: '취소', onPress: () => navigation.goBack() }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 상단 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>장소 제보하기</Text>
        <View style={styles.headerRight} />
      </View>

      {/* 주소 검색 섹션 */}
      <View style={styles.searchSection}>
        <Text style={styles.sectionTitle}>주소 검색</Text>
        <View style={styles.searchInputContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="주소를 입력하세요..."
            placeholderTextColor={colors.textSecondary}
          />
          <TouchableOpacity style={styles.searchButton}>
            <Text style={styles.searchAddressButtonText}>🔍</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>

        {/* 장소 이름 입력 */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>장소 이름</Text>
          <TextInput
            style={styles.textInput}
            value={placeName}
            onChangeText={setPlaceName}
            placeholder="장소 이름을 입력하세요"
            placeholderTextColor="#999"
          />
        </View>

        {/* 주소 입력 */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>주소</Text>
          <TextInput
            style={styles.textInput}
            value={address}
            onChangeText={setAddress}
            placeholder="주소를 입력하세요"
            placeholderTextColor="#999"
          />
        </View>

        {/* 지도에서 위치 선택 */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>지도에서 위치 선택</Text>
          <View style={styles.mapContainer}>
            <KakaoMap />
          </View>
        </View>

        {/* 카테고리 선택 */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>카테고리 선택</Text>
          <View style={styles.categoryContainer}>
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                {...category}
                isSelected={selectedCategory === category.id}
                onPress={() => setSelectedCategory(category.id)}
              />
            ))}
            <CategoryCard
              id="other"
              label="기타"
              icon="📌"
              isSelected={selectedCategory === 'other'}
              onPress={() => setSelectedCategory('other')}
            />
          </View>
        </View>

        {/* 설명 입력 */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>설명</Text>
          <TextInput
            style={[styles.textInput, styles.descriptionInput]}
            value={description}
            onChangeText={setDescription}
            placeholder="장소에 대한 설명을 입력하세요"
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* 이미지 업로드 */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>이미지 업로드 섹션</Text>
          <View style={styles.imageUploadSection}>
            <TouchableOpacity
              style={styles.imageUploadButton}
              onPress={() => Alert.alert('알림', '이미지 업로드 기능이 곧 추가됩니다!')}
            >
              <Text style={styles.imageUploadButtonText}>+ 이미지 추가</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 버튼 영역 */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
          >
            <Text style={styles.cancelButtonText}>취소</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>제출하기</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingVertical: spacing.paddingMedium,
    backgroundColor: colors.card,
    borderBottomWidth: 2,
    borderBottomColor: colors.divider,
    ...shadows.header,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: "#000000",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeText: {
    fontSize: 14,
    color: "#000000",
    marginRight: 8,
  },
  statusIcons: {
    flexDirection: "row",
  },
  statusIcon: {
    fontSize: 16,
    marginLeft: 4,
  },
  inputSection: {
    marginBottom: 20,
    marginHorizontal: 16,
  },
  inputLabel: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  textInput: {
    borderColor: "#0000001A",
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: "#000000",
    backgroundColor: "#FFFFFF",
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  addressInput: {
    flex: 1,
    marginRight: 8,
  },
  searchAddressButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 6,
  },
  searchAddressButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  mapContainer: {
    height: 200,
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: "#0000001A",
  },
  categoryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  categoryCard: {
    flex: 1,
    borderColor: "#0000001A",
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  selectedCategoryCard: {
    borderColor: "#4CAF50",
    backgroundColor: "#E8F5E8",
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  categoryLabel: {
    color: "#000000",
    fontSize: 12,
    textAlign: "center",
    fontWeight: "500",
  },
  selectedCategoryLabel: {
    color: "#4CAF50",
    fontWeight: "bold",
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: "top",
  },
  imageUploadSection: {
    borderColor: "#0000001A",
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 20,
    alignItems: "center",
    backgroundColor: "#F8F8F8",
  },
  imageUploadButton: {
    borderColor: "#0000001A",
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#F8F8F8",
  },
  imageUploadButtonText: {
    color: "#666666",
    fontSize: 14,
    fontWeight: "500",
  },
  buttonContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderColor: "#0000001A",
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  cancelButtonText: {
    color: "#666666",
    fontSize: 16,
    fontWeight: "500",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#4CAF50",
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  searchSection: {
    marginHorizontal: 16,
    marginBottom: 20,
    paddingVertical: 16,
    backgroundColor: "#F8F8F8",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  sectionTitle: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    borderColor: "#0000001A",
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: "#000000",
    backgroundColor: "#FFFFFF",
  },
  searchButton: {
    padding: 12,
  },
}); 