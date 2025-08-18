// 앱 시작 시 실행되는 splash 화면

import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Splash: undefined;
  SignUp: undefined;
};

type SplashNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Splash'>;

export default function SplashScreen() {
  const navigation = useNavigation<SplashNavigationProp>();
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 5,   // 마찰(값이 작을수록 더 많이 튕김)
          tension: 80,   // 장력(높을수록 반동이 더 빠름)
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(1900),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start(() => {
      navigation.navigate('SignUp');
    });
  }, [navigation, opacity, scale]);

  return (
    <View style={styles.container}>
      <Animated.Text
        style={[
          styles.logoText,
          { opacity, transform: [{ scale }] },
        ]}
      >
        Zeromap
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
  },
  logoText: {
    fontSize: 52,
    fontFamily: 'NanumGothic-ExtraBold',
    color: '#fff',
  },
});