import React from "react";
import { SafeAreaView, View, ScrollView, Image, Text, TouchableOpacity, ImageBackground, StyleSheet } from "react-native";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import KakaoMap from '../components/KakaoMap';

const categories = [
  {
    icon: "🛒",
    label: "제로웨이스트샵",
    iconBgMargin: 38,
    textMargin: 4,
  },
  {
    icon: "🥗",
    label: "비건식당",
    iconBgMargin: 38,
    textMargin: 3,
  },
  {
    icon: "🔄",
    label: "리필스테이션",
    iconBgMargin: 38,
    textMargin: 3,
  },
];

type CategoryCardProps = {
  icon: string;
  label: string;
  iconBgMargin: number;
  textMargin: number;
  style?: any;
};

function CategoryCard({ icon, label, iconBgMargin, textMargin, style }: CategoryCardProps) {
  return (
    <View style={[styles.categoryCard, style]}>
      <View style={[styles.categoryIconWrap, { marginHorizontal: iconBgMargin }]}> 
        <View style={styles.categoryIconBg}>
          <Text style={styles.categoryIcon}>{icon}</Text>
        </View>
      </View>
      <Text style={[styles.categoryLabel, { marginHorizontal: textMargin }]}>{label}</Text>
    </View>
  );
}

type RootStackParamList = {
  Home: undefined;
  Map: undefined;
  MapDetail: undefined;
};

export default function MapScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Map'>>();
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Image
            source={{ uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/AI1KD1CsF9/wsr47kf8_expires_30_days.png" }}
            resizeMode="stretch"
            style={styles.headerImage}
          />
          <Text style={styles.headerTitle}>{"Zero Map : 제로 맵"}</Text>
        </View>
        <TouchableOpacity
          style={styles.locationSearchBtn}
          onPress={() => {}}
          accessibilityLabel="위치 기반 검색 버튼"
        >
          <Text style={styles.locationSearchText}>{"위치 기반 검색"}</Text>
          <Image
            source={{ uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/AI1KD1CsF9/986qyqnx_expires_30_days.png" }}
            resizeMode="stretch"
            style={styles.locationSearchIcon}
          />
        </TouchableOpacity>
        <View style={styles.categoryRow}>
          {categories.map((cat, idx) => (
            <CategoryCard
              key={idx}
              {...cat}
              style={idx === categories.length - 1 ? styles.noMarginRight : undefined}
            />
          ))}
        </View>
        {/* 지도 영역을 KakaoMap으로 대체 */}
        <View style={{ flex: 1, height: 400, marginHorizontal: 16, marginBottom: 20, borderRadius: 6, overflow: 'hidden' }}>
          <KakaoMap />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  headerContainer: {
    backgroundColor: "#FFFFFF",
    marginBottom: 10,
    marginHorizontal: 26,
    shadowColor: "#0000001C",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 6,
    elevation: 6,
  },
  headerImage: {
    height: 24,
  },
  headerTitle: {
    color: "#000000",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 12,
    marginHorizontal: 16,
  },
  locationSearchBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#0000001A",
    borderRadius: 6,
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 11,
    marginBottom: 10,
    marginHorizontal: 36,
  },
  locationSearchText: {
    color: "#000000",
    fontSize: 14,
    flex: 1,
  },
  locationSearchIcon: {
    borderRadius: 6,
    width: 36,
    height: 28,
  },
  categoryRow: {
    flexDirection: "row",
    marginBottom: 10,
    marginHorizontal: 35,
  },
  categoryCard: {
    flex: 1,
    borderColor: "#0000001A",
    borderRadius: 6,
    borderWidth: 1,
    paddingVertical: 4,
    marginRight: 9,
    backgroundColor: "#fff",
    minWidth: 0,
  },
  categoryIconWrap: {
    marginBottom: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryIconBg: {
    height: 50,
    width: 50,
    backgroundColor: "#0000000D",
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryIcon: {
    fontSize: 30,
    textAlign: "center",
    textAlignVertical: "center",
    lineHeight: 50,
  },
  categoryLabel: {
    color: "#000000",
    fontSize: 12,
    textAlign: "center",
  },
  mapImageBg: {
    borderRadius: 6,
  },
  mapImageBgWrap: {
    alignItems: "center",
    paddingVertical: 137,
    paddingHorizontal: 16,
    marginBottom: 25,
    marginHorizontal: 38,
  },
  mapIcon: {
    borderRadius: 6,
    width: 24,
    height: 24,
    marginBottom: 8,
  },
  mapText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  noMarginRight: {
    marginRight: 0,
  },
});