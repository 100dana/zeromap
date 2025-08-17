import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { colors } from '../styles/colors';
import { shadows } from '../styles/shadows';
import { spacing } from '../styles/spacing';

type RootStackParamList = {
  MyPage: undefined;
  MyReview: undefined;
};

const MyReview = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'MyReview'>>();
    const [reviews, setReviews] = useState<any []>([]);
    const userId = auth().currentUser?.uid;

    useEffect(() => {
        if (!userId) return;

        const myReview = firestore()
        .collection('users')
        .doc(userId)
        .collection('reviews')
        .orderBy('createdAt', 'desc')
        .onSnapshot(snapshot => {
            const fetchedReviews = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setReviews(fetchedReviews);
        });
        return () => myReview();
    }, [userId]);

    const formatDate = (timestamp: any) => {
        if (!timestamp) return '';
        
        try {
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            const now = new Date();
            const diffTime = Math.abs(now.getTime() - date.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
                return '어제';
            } else if (diffDays < 7) {
                return `${diffDays}일 전`;
            } else if (diffDays < 30) {
                const weeks = Math.floor(diffDays / 7);
                return `${weeks}주 전`;
            } else if (diffDays < 365) {
                const months = Math.floor(diffDays / 30);
                return `${months}개월 전`;
            } else {
                const years = Math.floor(diffDays / 365);
                return `${years}년 전`;
            }
        } catch (error) {
            return '';
        }
    };

    const renderReviewItem = ({ item }: { item: any }) => (
        <View style={styles.reviewedPlaceItem}>
            <View style={styles.placeIcon}>
                <Text style={styles.placeIconText}>🏠</Text>
            </View>
            <View style={styles.reviewedPlaceInfo}>
                <View style={styles.reviewHeader}>
                    <Text style={styles.reviewedPlaceName}>{item.placeName || '장소명'}</Text>
                    <Text style={styles.reviewDate}>{formatDate(item.createdAt)}</Text>
                </View>
                <Text style={styles.reviewText}>{item.reviewText || item.content || '리뷰 내용'}</Text>
                <View style={styles.ratingContainer}>
                    <Text style={styles.star}>⭐</Text>
                    <Text style={styles.ratingText}>{item.rating || 0} stars</Text>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            {/* 상단 헤더 */}
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backButtonText}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>내가 쓴 리뷰</Text>
                <View style={styles.backButton} />
            </View>
            
            <FlatList
                data={reviews}
                keyExtractor={(item) => item.id}
                renderItem={renderReviewItem}
                ListEmptyComponent={<Text style={styles.emptyText}>작성한 리뷰가 없습니다.</Text>}
                contentContainerStyle={styles.listContainer}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#FFFFFF'
    },
    header: {
        flexDirection: 'row',
            textAlign: 'center',
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
        color: "#000000",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#000000",
    },
    listContainer: {
        padding: 20,
    },
    reviewedPlaceItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
        paddingHorizontal: 20,
        backgroundColor: '#F8F8F8',
        borderRadius: 8,
        marginBottom: 8,
    },
    placeIcon: {
        width: 32,
        height: 32,
        backgroundColor: "#E0E0E0",
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    placeIconText: {
        fontSize: 16,
    },
    reviewedPlaceInfo: {
        flex: 1,
    },
    reviewedPlaceName: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#000000",
        marginBottom: 4,
        flex: 1,
    },
    reviewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    reviewDate: {
        fontSize: 12,
        color: "#999999",
    },
    reviewText: {
        fontSize: 14,
        color: "#666666",
        marginBottom: 4,
        marginLeft: 6,
    },
    ratingContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    star: {
        fontSize: 12,
        marginRight: 4,
        marginLeft: 4,
    },
    ratingText: {
        fontSize: 12,
        color: "#666666",
    },
    emptyText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#666666',
        marginTop: 50,
    },
});

export default MyReview;