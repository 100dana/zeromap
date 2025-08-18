import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import firestoreService from '../services/firestoreService';
import { Review } from '../types/review';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';


type ReviewListScreenRouteProp = RouteProp<{
  params: {
    placeId: string;
    placeName: string;
  }
}, 'params'>;

export default function ReviewListScreen() {
  const navigation = useNavigation();
  const route = useRoute<ReviewListScreenRouteProp>();
  const { placeId, placeName } = route.params || {};
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!placeId) return;
    setLoading(true);
    firestoreService.getReviewsByPlaceId(placeId)
      .then(setReviews)
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, [placeId]);

  const avgRating = reviews.length ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1) : '-';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
          <Text style={styles.closeButtonText}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.placeName}>{placeName}</Text>
          <Text style={styles.ratingText}>★ {avgRating} ({reviews.length})</Text>
        </View>
      </View>
      <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.title}>전체 리뷰</Text>
        {loading ? (
          <Text style={styles.loadingText}>리뷰 불러오는 중...</Text>
        ) : reviews.length === 0 ? (
          <Text style={styles.emptyText}>아직 리뷰가 없습니다.</Text>
        ) : (
          reviews.map(r => (
            <View style={styles.reviewItem} key={r.id}>
              <Text style={styles.reviewUser}>{r.userName} <Text style={styles.reviewStar}>{'★'.repeat(r.rating)}</Text></Text>
              <Text style={styles.reviewText}>{r.reviewText}</Text>
              <Text style={styles.reviewDate}>{new Date(r.createdAt).toISOString().slice(0, 10)}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.divider, backgroundColor: '#fff' },
  closeButton: { padding: 8, borderRadius: 20, backgroundColor: colors.surface, marginRight: 8 },
  closeButtonText: { fontSize: 24, color: colors.textPrimary, fontWeight: 'bold' },
  headerTitleWrap: { flex: 1, alignItems: 'center' },
  placeName: { ...typography.h4, color: colors.textPrimary, fontWeight: 'bold' },
  ratingText: { color: '#f5b50a', marginTop: 2, fontWeight: '600' },
  body: { flex: 1, padding: 20 },
  title: { ...typography.h4, color: colors.textPrimary, fontWeight: 'bold', marginBottom: 16 },
  loadingText: { color: colors.textSecondary, textAlign: 'center', marginTop: 20 },
  emptyText: { color: colors.textSecondary, textAlign: 'center', marginTop: 20 },
  reviewItem: { marginBottom: 18, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 8 },
  reviewUser: { fontWeight: 'bold', marginBottom: 2 },
  reviewStar: { color: '#f5b50a' },
  reviewText: { marginVertical: 2, color: colors.textPrimary },
  reviewDate: { fontSize: 12, color: colors.textSecondary },
});
