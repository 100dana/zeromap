import React, { useState } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import React from "react";
import { 
  View, 
  ScrollView, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Switch,
  Alert,
  StatusBar
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';
import { shadows } from '../styles/shadows';
import { CacheInitializer } from '../services/cacheInitializer';

export default function Settings() {
  const navigation = useNavigation();
  const [isInitializing, setIsInitializing] = useState(false);

  const handleCacheInitialization = async () => {
    Alert.alert(
      '캐시 초기화',
      '제로식당 좌표 정보를 Firebase에 캐시로 저장하시겠습니까?\n\n처리 시간이 오래 걸릴 수 있습니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '초기화',
          style: 'destructive',
          onPress: async () => {
            setIsInitializing(true);
            try {
              await CacheInitializer.initializeCache();
              Alert.alert('완료', '제로식당 캐시 초기화가 완료되었습니다.');
            } catch (error) {
              Alert.alert('오류', '캐시 초기화 중 오류가 발생했습니다.');
            } finally {
              setIsInitializing(false);
            }
          }
        }
      ]
    );
  };

  const handleCacheStatus = async () => {
    try {
      const status = await CacheInitializer.getCacheStatus();
      Alert.alert(
        '캐시 상태',
        `캐시된 제로식당: ${status.cached}개\n전체 제로식당: ${status.total}개\n\n완료율: ${((status.cached / status.total) * 100).toFixed(1)}%`
      );
    } catch (error) {
      Alert.alert('오류', '캐시 상태 확인 중 오류가 발생했습니다.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>설정</Text>
          <View style={styles.headerRight} />
        </View>

      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      {/* 상단 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>환경 설정</Text>
        <View style={styles.headerRight} />
      </View>


        {/* 개발자 도구 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>개발자 도구</Text>
          
          <TouchableOpacity
            style={[styles.button, styles.cacheButton]}
            onPress={handleCacheStatus}
            disabled={isInitializing}
          >
            <Text style={styles.buttonText}>캐시 상태 확인</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.cacheButton, isInitializing && styles.disabledButton]}
            onPress={handleCacheInitialization}
            disabled={isInitializing}
          >
            <Text style={styles.buttonText}>
              {isInitializing ? '캐시 초기화 중...' : '제로식당 캐시 초기화'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 설명 */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>캐시 시스템이란?</Text>
          <Text style={styles.infoText}>
            • 제로식당 주소를 좌표로 변환하는 과정이 오래 걸려서 Firebase에 미리 저장해두는 시스템입니다.
          </Text>
          <Text style={styles.infoText}>
            • 한 번 초기화하면 이후에는 빠르게 데이터를 불러올 수 있습니다.
          </Text>
          <Text style={styles.infoText}>
            • 초기화는 한 번만 하면 되며, 약 2-3분 정도 소요됩니다.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingVertical: spacing.paddingLarge,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    ...shadows.header,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.button,
  },
  backButtonText: {
    fontSize: 18,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  headerTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  headerRight: {
    width: 40,
  },
  section: {
    padding: spacing.paddingLarge,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.paddingMedium,
  },
  button: {
    paddingVertical: spacing.paddingMedium,
    paddingHorizontal: spacing.paddingLarge,
    borderRadius: 12,
    marginBottom: spacing.paddingMedium,
    alignItems: 'center',
    ...shadows.button,
  },
  cacheButton: {
    backgroundColor: colors.primary,
  },
  disabledButton: {
    backgroundColor: colors.disabled,
  },
  buttonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
  },
  infoSection: {
    padding: spacing.paddingLarge,
    backgroundColor: colors.background,
    margin: spacing.paddingLarge,
    borderRadius: 12,
    ...shadows.card,
  },
  infoTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.paddingMedium,
  },
  infoText: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.paddingSmall,
    lineHeight: 20,
  },
}); 