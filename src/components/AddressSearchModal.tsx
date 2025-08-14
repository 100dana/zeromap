import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native';
import { GeocodingService } from '../services/geocodingService';

interface AddressSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onAddressSelect: (address: string, coordinates: { latitude: number; longitude: number }) => void;
}

interface SearchResult {
  address: string;
  coordinates: { latitude: number; longitude: number };
  type: '지번주소' | '도로명주소';
}

export default function AddressSearchModal({ visible, onClose, onAddressSelect }: AddressSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // 주소 검색 실행
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const coordinates = await GeocodingService.addressToCoordinates(searchQuery);
      
      if (coordinates) {
        const searchResult: SearchResult = {
          address: searchQuery,
          coordinates: coordinates,
          type: '지번주소'
        };
        setSearchResults([searchResult]);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // 검색 결과 선택
  const handleResultSelect = (result: SearchResult) => {
    onAddressSelect(result.address, result.coordinates);
    onClose();
    setSearchQuery('');
    setSearchResults([]);
  };

  // 모달 닫기 시 초기화
  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    onClose();
  };

  // 검색 결과 렌더링
  const renderSearchResult = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => handleResultSelect(item)}
    >
      <View style={styles.resultContent}>
        <Text style={styles.resultAddress}>{item.address}</Text>
        <View style={styles.resultTypeContainer}>
          <Text style={styles.resultType}>{item.type}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>취소</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>주소 검색</Text>
          <View style={styles.headerRight} />
        </View>

        {/* 검색 입력 */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="지번주소 또는 도로명주소를 입력하세요"
              placeholderTextColor="#999"
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            <TouchableOpacity
              style={styles.searchButton}
              onPress={handleSearch}
              disabled={isSearching}
            >
              {isSearching ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.searchButtonText}>검색</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* 검색 결과 */}
        <View style={styles.resultsContainer}>
          {isSearching ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4CAF50" />
              <Text style={styles.loadingText}>주소를 검색하고 있습니다...</Text>
            </View>
          ) : searchResults.length > 0 ? (
            <FlatList
              data={searchResults}
              renderItem={renderSearchResult}
              keyExtractor={(item, index) => `${item.address}-${item.type}-${index}`}
              showsVerticalScrollIndicator={false}
            />
          ) : searchQuery ? (
            <View style={styles.noResultsContainer}>
              <Text style={styles.noResultsText}>검색 결과가 없습니다.</Text>
              <Text style={styles.noResultsSubText}>다른 키워드로 검색해보세요.</Text>
            </View>
          ) : (
            <View style={styles.initialContainer}>
              <Text style={styles.initialText}>지번주소 또는 도로명주소를 검색하세요</Text>
              <Text style={styles.initialSubText}>예: 강남대로 123, 강남구 역삼동 123-45</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666666',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  headerRight: {
    width: 50,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#F8F8F8',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  searchButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  resultItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  resultContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultAddress: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
    marginRight: 12,
  },
  resultTypeContainer: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  resultType: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 8,
  },
  noResultsSubText: {
    fontSize: 14,
    color: '#999999',
  },
  initialContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialText: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 8,
  },
  initialSubText: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
});
