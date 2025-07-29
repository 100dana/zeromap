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
    title: '알림 설정',
    subtitle: '푸시 알림을 관리합니다',
    type: 'toggle',
    icon: '🔔'
  },
  {
    id: 'privacy',
    title: '개인정보 보호',
    subtitle: '개인정보 처리방침',
    type: 'navigate',
    icon: '🔒'
  },
  {
    id: 'terms',
    title: '이용약관',
    subtitle: '서비스 이용약관',
    type: 'navigate',
    icon: '📋'
  },
  {
    id: 'about',
    title: '앱 정보',
    subtitle: '버전 1.0.0',
    type: 'navigate',
    icon: 'ℹ️'
  },
  {
    id: 'logout',
    title: '로그아웃',
    subtitle: '계정에서 로그아웃합니다',
    type: 'action',
    icon: '🚪'
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
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>설정</Text>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
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
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  settingsContainer: {
    paddingVertical: 8,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    backgroundColor: "#FFFFFF",
  },
  settingItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000000",
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: "#666666",
  },
  chevron: {
    fontSize: 18,
    color: "#CCCCCC",
    fontWeight: "bold",
  },
  appInfo: {
    padding: 20,
    alignItems: "center",
  },
  appInfoText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 4,
  },
  appInfoSubtext: {
    fontSize: 14,
    color: "#666666",
  },
}); 