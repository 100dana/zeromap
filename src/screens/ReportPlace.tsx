import React, { useState, useRef } from "react";
import { 
  SafeAreaView, 
  View, 
  ScrollView, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  Image,
  ActivityIndicator,
  FlatList,
  Platform,
  PermissionsAndroid
} from "react-native";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import KakaoMap from '../components/KakaoMap';
import AddressSearchModal from '../components/AddressSearchModal';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';
import { shadows } from '../styles/shadows';
import { GeocodingService } from '../services/geocodingService';

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
    id: 'cupDiscountCafe',
    label: "개인컵할인카페",
    icon: "☕"
  },
  {
    id: 'zeroRestaurant',
    label: "제로식당",
    icon: "🍽️"
  },
  {
    id: 'refillStation',
    label: "리필스테이션",
    icon: "🔄"
  },
  {
    id: 'refillShop',
    label: "리필샵",
    icon: "💧"
  },
  {
    id: 'ecoSupplies',
    label: "친환경생필품점",
    icon: "🧴"
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
  const mapRef = useRef<any>(null);
  
  const [placeName, setPlaceName] = useState('');
  const [address, setAddress] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [description, setDescription] = useState('');
  const [selectedLocation, setSelectedLocation] = useState({ lat: 37.5665, lng: 126.9780 }); // 서울시청 기본 위치
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);


  // 지도 클릭 처리
  const handleMapClick = async (coordinates: { latitude: number; longitude: number }) => {
    setSelectedLocation({ lat: coordinates.latitude, lng: coordinates.longitude });
    
    try {
      // 좌표를 주소로 변환
      const addressResult = await GeocodingService.coordinatesToAddress(
        coordinates.latitude, 
        coordinates.longitude
      );
      
      if (addressResult) {
        setAddress(addressResult);
      } else {
        // API 실패 시 오류 메시지 표시
        setAddress('주소 변환에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('주소 변환 실패:', error);
      setAddress('주소 변환 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  // 주소 검색 모달에서 주소 선택 처리
  const handleAddressSelect = (selectedAddress: string, coordinates: { latitude: number; longitude: number }) => {
    setAddress(selectedAddress);
    setSelectedLocation({ lat: coordinates.latitude, lng: coordinates.longitude });
    
    // 지도를 해당 위치로 이동
    if (mapRef.current) {
      mapRef.current.moveToLocation(coordinates.latitude, coordinates.longitude, 3);
    }
  };

  // 주소 검색 모달 열기
  const handleOpenAddressSearch = () => {
    setIsAddressModalVisible(true);
  };

  // 권한 상태 확인 (디버그용)
  const checkPermissionStatus = async () => {
    if (Platform.OS === 'android') {
      try {
        const status = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
        );
        return status;
      } catch (err) {
        console.warn('권한 상태 확인 실패:', err);
        return false;
      }
    }
    return true; // iOS는 기본적으로 허용
  };

  // 이미지 선택 처리
  const handleImageSelect = async () => {
    // 권한 상태 먼저 확인
    const hasPermission = await checkPermissionStatus();
    
    Alert.alert(
      '이미지 선택',
      '이미지를 선택하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { text: '갤러리에서 선택', onPress: () => selectImageFromGallery() }
      ]
    );
  };

  // Android 권한 요청
  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: "갤러리 접근 권한",
            message: "장소 사진을 첨부하기 위해 갤러리 접근 권한이 필요합니다.",
            buttonNeutral: "나중에",
            buttonNegative: "취소",
            buttonPositive: "허용"
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          return true;
        } else {
          Alert.alert(
            '권한 필요', 
            '이미지를 선택하려면 갤러리 접근 권한이 필요합니다.\n\n설정에서 권한을 허용해주세요.',
            [
              { text: '취소', style: 'cancel' },
              { text: '설정으로 이동', onPress: () => {
                // 설정 앱으로 이동하는 로직 (선택사항)
              }}
            ]
          );
          return false;
        }
      } catch (err) {
        Alert.alert('오류', '권한 요청 중 오류가 발생했습니다.');
        return false;
      }
    }
    return true;
  };

  // 갤러리에서 이미지 선택
  const selectImageFromGallery = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      return;
    }

    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.8,
        includeBase64: false,
        selectionLimit: 1,
      });

      if (result.didCancel) {
        return;
      }

      if (result.errorMessage) {
        Alert.alert('오류', '이미지 선택 중 오류가 발생했습니다.');
        return;
      }

      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        
        // 파일 크기 검증 (5MB 제한)
        if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
          Alert.alert('오류', '파일 크기는 5MB 이하여야 합니다.');
          return;
        }

        setSelectedImage(asset.uri || '');
      }
    } catch (error) {
      Alert.alert('오류', '이미지 선택 중 오류가 발생했습니다.');
    }
  };

  // 이미지 제거
  const handleRemoveImage = () => {
    Alert.alert(
      '이미지 제거',
      '선택된 이미지를 제거하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { text: '제거', style: 'destructive', onPress: () => setSelectedImage(null) }
      ]
    );
  };

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
    if (!description.trim()) {
      Alert.alert('알림', '설명을 입력해주세요.');
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



      <ScrollView style={styles.scrollView}>

        {/* 장소 이름 입력 */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>장소 이름 <Text style={styles.requiredText}>*</Text></Text>
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
          <Text style={styles.inputLabel}>주소 <Text style={styles.requiredText}>*</Text></Text>
          <View style={styles.addressContainer}>
            <TextInput
              style={[styles.textInput, styles.addressInput]}
              value={address}
              onChangeText={setAddress}
              placeholder="주소를 검색하거나 지도에서 선택하세요"
              placeholderTextColor="#999"
              editable={false}
            />
            <TouchableOpacity
              style={styles.searchAddressButton}
              onPress={handleOpenAddressSearch}
            >
              <Text style={styles.searchAddressButtonText}>검색</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 지도에서 위치 선택 */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>지도에서 위치 선택 <Text style={styles.requiredText}>*</Text></Text>
          <View style={styles.mapContainer}>
            <KakaoMap 
              ref={mapRef}
              onMapClick={handleMapClick}
              selectedLocation={selectedLocation}
              places={[]}
            />
            <View style={styles.mapOverlay}>
              <Text style={styles.mapOverlayText}>
                {address && !address.includes('실패') && !address.includes('오류') 
                  ? '지도를 클릭하여 위치를 변경하세요' 
                  : '지도를 클릭하여 정확한 위치를 선택하세요'}
              </Text>
            </View>
          </View>
        </View>

        {/* 카테고리 선택 */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>카테고리 선택 <Text style={styles.requiredText}>*</Text></Text>
          <FlatList
            data={categories}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <CategoryCard
                {...item}
                isSelected={selectedCategory === item.id}
                onPress={() => setSelectedCategory(item.id)}
              />
            )}
            contentContainerStyle={styles.categoryListContainer}
          />
        </View>

        {/* 설명 입력 */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>설명 <Text style={styles.requiredText}>*</Text></Text>
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
          <Text style={styles.inputLabel}>이미지 첨부 <Text style={styles.optionalText}>(선택)</Text></Text>
          <View style={styles.imageUploadContainer}>
            {selectedImage ? (
              <View style={styles.selectedImageWrapper}>
                <Image 
                  source={{ uri: selectedImage }} 
                  style={styles.selectedImage}
                  resizeMode="cover"
                />
                <View style={styles.imageOverlay}>
                  <TouchableOpacity
                    style={styles.imageActionButton}
                    onPress={handleImageSelect}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.imageActionButtonText}>변경</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.imageActionButton, styles.removeButton]}
                    onPress={handleRemoveImage}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.imageActionButtonText}>삭제</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.imageInfo}>
                  <Text style={styles.imageInfoText}>📷 선택된 이미지</Text>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.imageUploadArea}
                onPress={handleImageSelect}
                activeOpacity={0.7}
              >
                <View style={styles.uploadIconContainer}>
                  <Text style={styles.uploadIcon}>📷</Text>
                  <Text style={styles.uploadPlusIcon}>+</Text>
                </View>
                <Text style={styles.uploadTitle}>이미지 추가</Text>
                <Text style={styles.uploadSubtitle}>장소 사진을 첨부해주세요</Text>
                <Text style={styles.uploadHint}>JPG, PNG 파일만 가능 • 최대 5MB</Text>
              </TouchableOpacity>
            )}
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
            <Text style={styles.saveButtonText}>장소 제보하기</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 주소 검색 모달 */}
      <AddressSearchModal
        visible={isAddressModalVisible}
        onClose={() => setIsAddressModalVisible(false)}
        onAddressSelect={handleAddressSelect}
      />
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
    gap: 8,
  },
  addressInput: {
    flex: 1,
  },
  searchAddressButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 6,
    minWidth: 60,
    alignItems: "center",
  },
  searchAddressButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  mapContainer: {
    height: 200,
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: "#0000001A",
  },
  categoryListContainer: {
    paddingHorizontal: 4,
  },
  categoryCard: {
    width: 120,
    borderColor: "#0000001A",
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 4,
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

  requiredText: {
    color: '#FF4444',
    fontWeight: 'bold',
  },
  optionalText: {
    color: '#999999',
    fontSize: 14,
  },
  mapOverlay: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8,
    borderRadius: 4,
  },
  mapOverlayText: {
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'center',
  },
  
  imageUploadContainer: {
    borderColor: "#E0E0E0",
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 24,
    alignItems: "center",
    backgroundColor: "#FAFAFA",
    minHeight: 160,
  },
  imageUploadArea: {
    borderColor: "#E0E0E0",
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 32,
    alignItems: "center",
    backgroundColor: "#FAFAFA",
    width: '100%',
    minHeight: 160,
  },
  uploadIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  uploadIcon: {
    fontSize: 36,
    marginRight: 8,
  },
  uploadPlusIcon: {
    fontSize: 24,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  uploadTitle: {
    color: '#333333',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  uploadSubtitle: {
    color: '#666666',
    fontSize: 14,
    marginBottom: 8,
  },
  uploadHint: {
    color: '#999999',
    fontSize: 12,
    textAlign: 'center',
  },
  selectedImageWrapper: {
    position: 'relative',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  selectedImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 8,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 20,
  },
  imageActionButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 80,
    ...shadows.button,
  },
  imageActionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  removeButton: {
    backgroundColor: '#FF4444',
  },
  imageInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  imageInfoText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },

}); 