import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';
import { shadows } from '../styles/shadows';

type RootStackParamList = {
  Home: undefined;
  Map: undefined;
  MyPage: undefined;
  Settings: undefined;
};

type TabItem = {
  key: string;
  title: string;
  icon: string;
  route: keyof RootStackParamList;
};

const tabItems: TabItem[] = [
  {
    key: 'home',
    title: '홈',
    icon: '🏠',
    route: 'Home'
  },
  {
    key: 'mypage',
    title: '마이페이지',
    icon: '👤',
    route: 'MyPage'
  },
  {
    key: 'settings',
    title: '설정',
    icon: '⚙️',
    route: 'Settings'
  }
];

type BottomTabBarProps = {
  currentRoute: string;
};

export default function BottomTabBar({ currentRoute }: BottomTabBarProps) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleTabPress = (route: keyof RootStackParamList) => {
    if (route !== currentRoute) {
      navigation.navigate(route);
    }
  };

  return (
    <View style={styles.container}>
      {tabItems.map((item) => (
        <TouchableOpacity
          key={item.key}
          style={[
            styles.tabItem,
            currentRoute === item.route && styles.activeTabItem
          ]}
          onPress={() => handleTabPress(item.route)}
        >
          <Text style={[
            styles.tabIcon,
            currentRoute === item.route && styles.activeTabIcon
          ]}>
            {item.icon}
          </Text>
          <Text style={[
            styles.tabTitle,
            currentRoute === item.route && styles.activeTabTitle
          ]}>
            {item.title}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingBottom: 20, // iPhone의 홈 인디케이터 영역 고려
    paddingTop: spacing.paddingSmall,
    ...shadows.header,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.paddingSmall,
  },
  activeTabItem: {
    // 활성 탭 스타일링
  },
  tabIcon: {
    fontSize: spacing.iconSizeLarge,
    marginBottom: spacing.xs,
    color: colors.textSecondary,
  },
  activeTabIcon: {
    color: colors.primary,
  },
  tabTitle: {
    ...typography.caption,
    fontWeight: "500",
  },
  activeTabTitle: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: "bold",
  },
}); 