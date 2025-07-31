import React from "react";
import { 
  SafeAreaView, 
  View, 
  ScrollView, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Switch,
  Alert
} from "react-native";
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from "react";
import BottomTabBar from '../components/BottomTabBar';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';
import { shadows } from '../styles/shadows';
import { typography } from '../styles/typography';

type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
};

type SettingItem = {
  id: string;
  title: string;
  subtitle?: string;
  type: 'toggle' | 'navigate' | 'action';
  icon: string;
};

const settingItems: SettingItem[] = [
  {
    id: 'notifications',
    title: '알람',
    subtitle: '알림 설정을 관리합니다',
    type: 'toggle',
    icon: '🔔'
  },
  {
    id: 'password',
    title: '비밀번호 변경',
    subtitle: '비밀번호를 변경합니다',
    type: 'navigate',
    icon: '🔐'
  },
  {
    id: 'logout',
    title: '로그아웃',
    subtitle: '계정에서 로그아웃합니다',
    type: 'action',
    icon: '🚪'
  },
  {
    id: 'delete',
    title: '계정 삭제하기',
    subtitle: '계정을 영구적으로 삭제합니다',
    type: 'action',
    icon: '❌'
  }
];

function SettingItemComponent({ item, onToggle, onPress }: { 
  item: SettingItem; 
  onToggle?: (value: boolean) => void;
  onPress?: () => void;
}) {
  const [isEnabled, setIsEnabled] = useState(false);

  const handleToggle = (value: boolean) => {
    setIsEnabled(value);
    onToggle?.(value);
  };

  const handlePress = () => {
    if (item.type === 'action') {
      Alert.alert(
        '로그아웃',
        '정말 로그아웃하시겠습니까?',
        [
          { text: '취소', style: 'cancel' },
          { text: '로그아웃', style: 'destructive', onPress: onPress }
        ]
      );
    } else {
      onPress?.();
    }
  };

  return (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={handlePress}
      disabled={item.type === 'toggle'}
    >
      <View style={styles.settingItemLeft}>
        <Text style={styles.settingIcon}>{item.icon}</Text>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{item.title}</Text>
          {item.subtitle && (
            <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
          )}
        </View>
      </View>
      {item.type === 'toggle' ? (
        <Switch
          value={isEnabled}
          onValueChange={handleToggle}
          trackColor={{ false: "#E0E0E0", true: "#4CAF50" }}
          thumbColor={isEnabled ? "#FFFFFF" : "#FFFFFF"}
        />
      ) : (
        <Text style={styles.chevron}>›</Text>
      )}
    </TouchableOpacity>
  );
}

export default function Settings() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Settings'>>();

  const handleToggle = (id: string, value: boolean) => {
    console.log(`${id} 설정 변경:`, value);
  };

  const handlePress = (id: string) => {
    switch (id) {
      case 'privacy':
        Alert.alert('개인정보 보호', '개인정보 처리방침 화면으로 이동합니다.');
        break;
      case 'terms':
        Alert.alert('이용약관', '서비스 이용약관 화면으로 이동합니다.');
        break;
      case 'about':
        Alert.alert('앱 정보', '앱 정보 화면으로 이동합니다.');
        break;
      case 'logout':
        Alert.alert('로그아웃 완료', '로그아웃되었습니다.');
        navigation.navigate('Home');
        break;
      default:
        break;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
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

      <ScrollView style={styles.scrollView}>
        {/* 설정 목록 */}
        <View style={styles.settingsContainer}>
          {settingItems.map((item) => (
            <SettingItemComponent
              key={item.id}
              item={item}
              onToggle={(value) => handleToggle(item.id, value)}
              onPress={() => handlePress(item.id)}
            />
          ))}
        </View>

        {/* 앱 정보 */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>Zero Map v1.0.0</Text>
          <Text style={styles.appInfoSubtext}>친환경 장소 탐색 앱</Text>
        </View>
      </ScrollView>

      {/* 하단 액션 버튼 */}
      <View style={styles.bottomActionContainer}>
        <TouchableOpacity 
          style={styles.resetButton}
          onPress={() => Alert.alert('초기화', '모든 설정을 기본값으로 초기화하시겠습니까?')}
        >
          <Text style={styles.resetButtonText}>설정 초기화</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={() => Alert.alert('저장 완료', '설정이 성공적으로 저장되었습니다.')}
        >
          <Text style={styles.saveButtonText}>현재 상태 저장</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2024 Zero Map. All rights reserved.</Text>
        <Text style={styles.footerSubtext}>친환경 생활을 위한 지도 서비스</Text>
      </View>
      
      <BottomTabBar currentRoute="Settings" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    width: 40, // 뒤로가기 버튼과 균형을 맞추기 위한 빈 공간
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.background,
    paddingBottom: 140, // 하단 버튼과 footer 공간 확보
  },
  settingsContainer: {
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingVertical: spacing.paddingMedium,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.paddingMedium,
    paddingHorizontal: spacing.paddingMedium,
    backgroundColor: colors.card,
    borderRadius: spacing.borderRadiusMedium,
    marginBottom: spacing.paddingSmall,
    ...shadows.card,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 20,
    marginRight: spacing.paddingMedium,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    ...typography.body1,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  settingSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  chevron: {
    fontSize: 18,
    color: "#CCCCCC",
    fontWeight: "bold",
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: spacing.paddingLarge,
    marginTop: spacing.paddingMedium,
  },
  appInfoText: {
    ...typography.body1,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  appInfoSubtext: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
  bottomActionContainer: {
    position: 'absolute',
    bottom: 60, // Footer 위에 위치
    left: 0,
    right: 0,
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingVertical: spacing.paddingMedium,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    ...shadows.header,
  },
  resetButton: {
    backgroundColor: colors.textPrimary,
    borderRadius: spacing.borderRadiusMedium,
    paddingVertical: spacing.paddingMedium,
    alignItems: 'center',
    ...shadows.button,
  },
  resetButtonText: {
    ...typography.body1,
    color: colors.background,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: spacing.borderRadiusMedium,
    paddingVertical: spacing.paddingMedium,
    alignItems: 'center',
    marginTop: spacing.paddingSmall,
    ...shadows.button,
  },
  saveButtonText: {
    ...typography.body1,
    color: colors.background,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingVertical: spacing.paddingMedium,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
  },
  footerText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  footerSubtext: {
    ...typography.caption,
    color: colors.textSecondary,
  },
}); 