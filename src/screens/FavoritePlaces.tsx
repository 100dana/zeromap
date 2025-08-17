import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';
import { shadows } from '../styles/shadows';
import firestoreService from '../services/firestoreService';

type RootStackParamList = {
  MyPage: undefined;
  FavoritePlaces: undefined;
};

type FavoritePlacesNavigationProp = NativeStackNavigationProp<RootStackParamList, 'FavoritePlaces'>;

interface FavoritePlaceData {
  id: string;
  name: string;
  address: string;
  category: string;
  description?: string;
  image?: string;
  favoriteId: string;
}

function FavoritePlaceCard({ place }: { place: FavoritePlaceData }) {
  const getCategoryIcon = (category: string): string => {
    switch (category) {
      case '제로식당':
        return '🍽️';
      case '제로웨이스트샵':
        return '🛒';
      case '리필스테이션':
        return '🚰';
      default:
        return '🏠';
    }
  };

  return (
    <View style={styles.placeCard}>
      <Image 
        source={{ uri: place.image || "https://via.placeholder.com/120x80/4CAF50/FFFFFF?text=Image" }}
        style={styles.placeImage}
        resizeMode="cover"
      />
      <View style={styles.categoryIcon}>
        <Text style={styles.categoryIconText}>{getCategoryIcon(place.category)}</Text>
      </View>
      <View style={styles.placeInfo}>
        <Text style={styles.placeName}>{place.name}</Text>
        <Text style={styles.placeAddress}>{place.address}</Text>
        {place.description && (
          <Text style={styles.placeDescription} numberOfLines={2}>
            {place.description}
          </Text>
        )}
      </View>
    </View>
  );
}

export default function FavoritePlaces() {
  const navigation = useNavigation<FavoritePlacesNavigationProp>();
  const [favoritePlaces, setFavoritePlaces] = useState<FavoritePlaceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFavoritePlaces = async () => {
      try {
        setLoading(true);
        const favorites = await firestoreService.getFavoritePlaces();
        setFavoritePlaces(favorites);
      } catch (err) {
        console.error('찜한 장소 로드 오류:', err);
        setError('찜한 장소를 불러오지 못했습니다');
      } finally {
        setLoading(false);
      }
    };

    loadFavoritePlaces();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>내가 찜한 장소</Text>
        <View style={styles.backButton} />
      </View>

      {/* 찜한 장소 목록 */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {loading && (
          <View style={styles.centered}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.loadingText}>찜한 장소를 불러오는 중...</Text>
          </View>
        )}
        
        {error && !loading && (
          <View style={styles.centered}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        
        {!loading && !error && favoritePlaces.length === 0 && (
          <View style={styles.centered}>
            <Text style={styles.emptyText}>찜한 장소가 없습니다</Text>
            <Text style={styles.emptySubText}>지도에서 마음에 드는 장소를 찜해보세요!</Text>
          </View>
        )}
        
        {!loading && !error && favoritePlaces.length > 0 && (
          <View style={styles.placesContainer}>
            {favoritePlaces.map((place) => (
              <FavoritePlaceCard key={place.id} place={place} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingTop: 12,
    paddingBottom: spacing.paddingMedium,
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
    color: colors.textPrimary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: spacing.screenPaddingHorizontal,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.paddingLarge,
  },
  loadingText: {
    ...typography.body1,
    color: colors.textSecondary,
    marginTop: spacing.paddingMedium,
  },
  errorText: {
    ...typography.body1,
    color: 'red',
  },
  emptyText: {
    ...typography.h3,
    color: colors.textSecondary,
    marginBottom: spacing.paddingSmall,
  },
  emptySubText: {
    ...typography.body2,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  placesContainer: {
    paddingVertical: spacing.paddingMedium,
    gap: spacing.paddingMedium,
  },
  placeCard: {
    backgroundColor: colors.card,
    borderRadius: spacing.borderRadiusLarge,
    overflow: 'hidden',
    position: 'relative',
    ...shadows.card,
  },
  placeImage: {
    width: '100%',
    height: 120,
  },
  categoryIcon: {
    position: 'absolute',
    top: spacing.paddingSmall,
    left: spacing.paddingSmall,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryIconText: {
    fontSize: 12,
  },
  placeInfo: {
    padding: spacing.paddingMedium,
  },
  placeName: {
    ...typography.h4,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  placeAddress: {
    ...typography.body2,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  placeDescription: {
    ...typography.body2,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
});
