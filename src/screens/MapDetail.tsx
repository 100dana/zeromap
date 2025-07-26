import React from "react";
import { SafeAreaView, View, ScrollView, Image, Text, ImageBackground, TouchableOpacity, StyleSheet } from "react-native";

// 더미 데이터 구조화
const tags = [
  { label: "제로웨이스트샵" },
  { label: "비건 식당" },
  { label: "리필스테이션" },
];

const reviews = [
  { user: "사용자1", text: "이 장소는 훌륭했습니다!" },
  { user: "사용자2", text: "서비스가 아주 마음에 들었습니다." },
];

function Tag({ label, style }: { label: string; style?: any }) {
  return (
    <View style={[styles.row5, style]}>
      <View style={styles.view}>
        <Text style={styles.text5}>🏷️</Text>
      </View>
      <Text style={styles.text6}>{label}</Text>
    </View>
  );
}

function Review({ user, text, style, userStyle, textStyle }: { user: string; text: string; style?: any; userStyle?: any; textStyle?: any }) {
  return (
    <View style={style}>
      <View style={styles.row7}>
        <View style={styles.box6} />
        <Text style={[styles.text11, userStyle]}>{user}</Text>
      </View>
      <Text style={[styles.text12, textStyle]}>{text}</Text>
    </View>
  );
}

export default function MapDetail() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.column}>
          <View style={styles.row}>
            <Text style={styles.text}>{"장소 상세보기"}</Text>
          </View>
        </View>
        <View style={styles.column2}>
          <Text style={styles.text2}>{"대상 장소 이미지 슬라이드"}</Text>
          <View style={styles.row2}>
            <View style={styles.box} />
            <View style={styles.box2} />
            <View style={styles.box2} />
            <View style={styles.box3} />
          </View>
        </View>
        <View style={styles.row3}>
          <View style={styles.box4} />
          <View style={styles.column3}>
            <Text style={styles.text3}>{"장소 이름"}</Text>
            <Text style={styles.text4}>{"승인됨 🔖"}</Text>
          </View>
        </View>
        <View style={styles.row4}>
          {tags.map((tag, idx) => (
			//@ts-ignore
            <Tag key={idx} label={tag.label} style={idx === tags.length - 1 ? styles.noMarginRight : undefined} />
          ))}
        </View>
        <View style={styles.column4}>
          <View style={styles.row6}>
            <View style={styles.box5} />
            <View style={styles.column5}>
              <Text style={styles.text3}>{"장소 설명"}</Text>
              <Text style={styles.text4}>{"여기에 장소에 대한 설명이 들어갑니다."}</Text>
            </View>
          </View>
          <Image
            source={{ uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/AI1KD1CsF9/vgx7ybfv_expires_30_days.png" }}
            resizeMode="stretch"
            style={styles.image3}
          />
        </View>
        <ImageBackground
          source={{ uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/AI1KD1CsF9/97v6l4m9_expires_30_days.png" }}
          resizeMode="stretch"
          imageStyle={styles.column7}
          style={styles.column6}
        >
          <Image
            source={{ uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/AI1KD1CsF9/5mea19wq_expires_30_days.png" }}
            resizeMode="stretch"
            style={styles.image4}
          />
          <Text style={styles.text8}>{"장소 위치"}</Text>
        </ImageBackground>
        <View style={styles.row3}>
          <TouchableOpacity style={styles.button} onPress={() => {}}>
            <Text style={styles.text3}>{"리뷰 작성하기"}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button2} onPress={() => {}}>
            <Text style={styles.text9}>{"저장하기"}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.text10}>{"리뷰"}</Text>
        <View style={styles.row4}>
          <Review user={reviews[0].user} text={reviews[0].text} style={styles.column8} />
          <Review user={reviews[1].user} text={reviews[1].text} style={styles.column9} userStyle={styles.text13} textStyle={styles.text14} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// 스타일은 기존 유지, noMarginRight 추가
const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#FFFFFF",
	},
	box: {
		width: 20,
		height: 4,
		backgroundColor: "#FFFFFF",
		borderRadius: 100,
		marginRight: 4,
	},
	box2: {
		width: 4,
		height: 4,
		backgroundColor: "#0000004D",
		borderRadius: 100,
		marginRight: 4,
	},
	box3: {
		width: 4,
		height: 4,
		backgroundColor: "#0000004D",
		borderRadius: 100,
	},
	box4: {
		width: 40,
		height: 40,
		backgroundColor: "#0000001A",
		borderRadius: 40,
		marginTop: 16,
		marginRight: 12,
	},
	box5: {
		width: 80,
		height: 80,
		backgroundColor: "#0000000D",
		marginRight: 12,
	},
	box6: {
		width: 24,
		height: 24,
		backgroundColor: "#0000001A",
		borderRadius: 24,
		marginRight: 8,
	},
	button: {
		flex: 1,
		alignItems: "center",
		backgroundColor: "#FFFFFF",
		borderColor: "#000000",
		borderRadius: 8,
		borderWidth: 1,
		paddingVertical: 10,
		marginRight: 8,
	},
	button2: {
		flex: 1,
		alignItems: "center",
		backgroundColor: "#000000",
		borderRadius: 8,
		paddingVertical: 10,
	},
	column: {
		backgroundColor: "#FFFFFF",
		marginBottom: 12,
		shadowColor: "#0000001C",
		shadowOpacity: 0.1,
		shadowOffset: {
		    width: 0,
		    height: 0
		},
		shadowRadius: 6,
		elevation: 6,
	},
	column2: {
		alignItems: "center",
		backgroundColor: "#0000000D",
		borderRadius: 6,
		paddingTop: 172,
		paddingBottom: 8,
		paddingHorizontal: 16,
		marginBottom: 12,
		marginHorizontal: 12,
	},
	column3: {
		flex: 1,
		marginTop: 16,
	},
	column4: {
		paddingVertical: 8,
		paddingHorizontal: 12,
		marginBottom: 12,
	},
	column5: {
		flex: 1,
	},
	column6: {
		alignItems: "center",
		paddingVertical: 36,
		paddingHorizontal: 16,
		marginBottom: 12,
		marginHorizontal: 12,
	},
	column7: {
		borderRadius: 6,
	},
	column8: {
		backgroundColor: "#0000000D",
		borderRadius: 6,
		paddingVertical: 12,
		marginRight: 8,
	},
	column9: {
		backgroundColor: "#0000000D",
		borderRadius: 6,
		paddingVertical: 12,
	},
	image: {
		height: 24,
	},
	image2: {
		width: 24,
		height: 24,
		marginRight: 8,
	},
	image3: {
		height: 1,
	},
	image4: {
		borderRadius: 6,
		width: 24,
		height: 24,
		marginBottom: 8,
	},
	row: {
		flexDirection: "row",
		paddingVertical: 12,
		paddingHorizontal: 8,
	},
	row2: {
		flexDirection: "row",
	},
	row3: {
		flexDirection: "row",
		paddingHorizontal: 12,
		marginBottom: 12,
	},
	row4: {
		flexDirection: "row",
		marginBottom: 12,
		marginLeft: 12,
	},
	row5: {
		flexDirection: "row",
		borderColor: "#0000001A",
		borderRadius: 6,
		borderWidth: 1,
		padding: 12,
		marginRight: 8,
	},
	row6: {
		flexDirection: "row",
		marginBottom: 8,
	},
	row7: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 8,
		marginHorizontal: 12,
	},
	row8: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 8,
		marginLeft: 12,
	},
	scrollView: {
		flex: 1,
		backgroundColor: "#FFFFFF",
	},
	text: {
		color: "#000000",
		fontSize: 20,
		fontWeight: "bold",
	},
	text2: {
		color: "#000000",
		fontSize: 16,
		fontWeight: "bold",
		textAlign: "center",
		marginBottom: 160,
	},
	text3: {
		color: "#000000",
		fontSize: 16,
		fontWeight: "bold",
	},
	text4: {
		color: "#000000",
		fontSize: 12,
	},
	text5: {
		color: "#000000",
		fontSize: 20,
	},
	text6: {
		color: "#000000",
		fontSize: 14,
		fontWeight: "bold",
		width: 89,
	},
	text7: {
		color: "#000000",
		fontSize: 14,
		fontWeight: "bold",
		width: 53,
	},
	text8: {
		color: "#000000",
		fontSize: 16,
		fontWeight: "bold",
		textAlign: "center",
	},
	text9: {
		color: "#FFFFFF",
		fontSize: 16,
		fontWeight: "bold",
	},
	text10: {
		color: "#000000",
		fontSize: 18,
		fontWeight: "bold",
		marginTop: 16,
		marginBottom: 9,
		marginHorizontal: 12,
	},
	text11: {
		color: "#000000",
		fontSize: 12,
		fontWeight: "bold",
		marginBottom: 1,
		marginRight: 127,
	},
	text12: {
		color: "#000000",
		fontSize: 14,
		marginLeft: 12,
		width: 137,
	},
	text13: {
		color: "#000000",
		fontSize: 12,
		fontWeight: "bold",
	},
	text14: {
		color: "#000000",
		fontSize: 14,
		marginLeft: 12,
		width: 107,
	},
	view: {
		backgroundColor: "#0000000D",
		borderRadius: 16,
		paddingBottom: 1,
		paddingRight: 12,
		marginRight: 8,
	},
	view2: {
		borderColor: "#0000001A",
		borderRadius: 6,
		borderWidth: 1,
		paddingVertical: 12,
		paddingLeft: 12,
		paddingRight: 106,
	},
	view3: {
		backgroundColor: "#0000000D",
		borderRadius: 16,
		paddingBottom: 1,
		paddingRight: 26,
	},
	noMarginRight: {
		marginRight: 0,
	},
});