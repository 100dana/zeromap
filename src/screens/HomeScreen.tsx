import React from "react";
import { SafeAreaView, View, ScrollView, Image, Text, ImageBackground, TouchableOpacity, StyleSheet } from "react-native";

const shopData = [
  {
    tag: "인기",
    name: "Zero Waste Store",
    address: "서울시 종로구 홍파동",
    type: "비건 레스토랑",
    tagColor: "#0000000D",
    tagMargin: 48,
    paddingBottom: 72,
  },
  {
    tag: "신규",
    name: "Eco-friendly Cafe",
    address: "서울시 용산구 숙명동",
    type: "리필 스테이션",
    tagColor: "#0000000D",
    tagMargin: 48,
    paddingBottom: 75,
  },
];

type ShopCardProps = {
  tag: string;
  name: string;
  address: string;
  type: string;
  tagColor: string;
  tagMargin: number;
  paddingBottom: number;
};

function ShopCard({ tag, name, address, type, tagColor, tagMargin, paddingBottom }: ShopCardProps) {
  return (
    <View style={styles.shopCard}>
      <View style={[styles.shopCardHeader, { backgroundColor: tagColor, paddingBottom }]}> 
        <TouchableOpacity
          style={[styles.shopTag, { backgroundColor: tagColor, marginBottom: tagMargin }]}
          onPress={() => {}}
          accessibilityLabel={`${tag} 태그 버튼`}
        >
          <Text style={styles.shopTagText}>{tag}</Text>
        </TouchableOpacity>
        <Text style={styles.shopName}>{name}</Text>
      </View>
      <View style={styles.shopCardFooter}>
        <Text style={styles.shopAddress}>{address}</Text>
        <Text style={styles.shopType}>{type}</Text>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.headerContainer}>
          <Image
            source={{ uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/AI1KD1CsF9/nvvkf6co_expires_30_days.png" }}
            resizeMode="stretch"
            style={styles.headerImage}
          />
          <Text style={styles.headerTitle}>{"Zero Map : 제로 맵"}</Text>
        </View>
        <View style={styles.locationContainer}>
          <ImageBackground
            source={{ uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/AI1KD1CsF9/v2k8u0i0_expires_30_days.png" }}
            resizeMode="stretch"
            imageStyle={styles.locationImageBg}
            style={styles.locationImageBgWrap}
          >
            <Image
              source={{ uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/AI1KD1CsF9/0sww8m3n_expires_30_days.png" }}
              resizeMode="stretch"
              style={styles.locationIcon}
            />
            <Text style={styles.locationText}>{"사용자의 대략적인 위치 (검색 기능 포함)"}</Text>
          </ImageBackground>
        </View>
        <Text style={styles.recommendTitle}>{"추천 : 신규 등록 제로웨이스트 샵"}</Text>
        <View style={styles.shopRow}>
          {shopData.map((shop, idx) => (
            <ShopCard key={idx} {...shop} />
          ))}
        </View>
        <View style={styles.bottomNav}>
          <View style={styles.bottomNavItem}>
            <Text style={styles.bottomNavIcon}>{"🏠"}</Text>
            <Text style={styles.bottomNavLabel}>{"홈"}</Text>
          </View>
          <View style={styles.bottomNavItem}>
            <Text style={styles.bottomNavIcon}>{"📝"}</Text>
            <Text style={styles.bottomNavLabel}>{"마이페이지"}</Text>
          </View>
          <View style={styles.bottomNavItem}>
            <Text style={styles.bottomNavIcon}>{"⚙️"}</Text>
            <Text style={styles.bottomNavLabel}>{"설정"}</Text>
          </View>
        </View>
      </ScrollView>
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
  locationContainer: {
    backgroundColor: "#0000000D",
    borderRadius: 6,
    paddingVertical: 14,
    marginBottom: 10,
    marginHorizontal: 38,
  },
  locationImageBg: {
    borderRadius: 6,
  },
  locationImageBgWrap: {
    alignItems: "center",
    paddingVertical: 144,
    paddingHorizontal: 16,
  },
  locationIcon: {
    borderRadius: 6,
    width: 24,
    height: 24,
    marginBottom: 8,
  },
  locationText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  recommendTitle: {
    color: "#000000",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 11,
    marginHorizontal: 38,
  },
  shopRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    marginBottom: 10,
    marginHorizontal: 26,
  },
  shopCard: {
    flex: 1,
    borderColor: "#0000001A",
    borderRadius: 6,
    borderWidth: 1,
    marginRight: 8,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  shopCardHeader: {
    backgroundColor: "#0000000D",
    // paddingBottom: 72, // dynamic
  },
  shopTag: {
    borderTopLeftRadius: 6,
    borderBottomRightRadius: 6,
    padding: 4,
    // marginBottom: 48, // dynamic
    alignSelf: "flex-start",
  },
  shopTagText: {
    color: "#000000",
    fontSize: 12,
    fontWeight: "bold",
  },
  shopName: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "bold",
    marginHorizontal: 16,
  },
  shopCardFooter: {
    paddingVertical: 12,
  },
  shopAddress: {
    color: "#000000",
    fontSize: 12,
    marginBottom: 4,
    marginLeft: 12,
  },
  shopType: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 12,
  },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 26,
    shadowColor: "#0000001C",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 6,
    elevation: 6,
  },
  bottomNavItem: {
    flex: 1,
    alignItems: "center",
    padding: 4,
  },
  bottomNavIcon: {
    color: "#000000",
    fontSize: 20,
  },
  bottomNavLabel: {
    color: "#000000",
    fontSize: 10,
    textAlign: "center",
  },
});