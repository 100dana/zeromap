/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import auth from '@react-native-firebase/auth';
import MapScreen from "./src/screens/MapScreen";
import ReportPlace from "./src/screens/ReportPlace";
import WriteReview from "./src/screens/WriteReview";
import MyPage from "./src/screens/MyPage";
import Settings from "./src/screens/Settings";
import Campaign from "./src/screens/News";
import CampaignDetail from "./src/screens/NewsDetail";
import PolicyInfo from "./src/screens/PolicyInfo";
import SignUp from "./src/screens/SignUp";
import SignIn from "./src/screens/SignIn";
import ReviewListScreen from './src/screens/ReviewListScreen';
import MyReview from './src/screens/MyReview';
import FavoritePlaces from './src/screens/FavoritePlaces';


type RootStackParamList = {
  SignUp: undefined;
  SignIn: undefined;
  Map: undefined;
  ReportPlace: undefined;
  WriteReview: { 
    placeName?: string;
    placeId?: string;
  };
  MyPage: undefined;
  Settings: undefined;
  Campaign: undefined;
  CampaignDetail: undefined;
  PolicyInfo: undefined;
  ReviewList: undefined;
  MyReview: undefined;
  FavoritePlaces: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((user) => {
      console.log('Auth state changed:', user ? 'User logged in' : 'No user');
      setUser(user);
      if (initializing) setInitializing(false);
    });

    return unsubscribe;
  }, [initializing]);

  if (initializing) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
          <Text style={{ fontSize: 18, color: '#666666' }}>로딩 중...</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      {/* @ts-ignore */}
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="SignIn"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="SignUp" component={SignUp} />
          <Stack.Screen name="SignIn" component={SignIn} />
          <Stack.Screen name="Map" component={MapScreen} />
          <Stack.Screen name="ReportPlace" component={ReportPlace} />
          <Stack.Screen name="WriteReview" component={WriteReview} />
          <Stack.Screen name="MyPage" component={MyPage} />
          <Stack.Screen name="Settings" component={Settings} />
          <Stack.Screen name="Campaign" component={Campaign} />
          <Stack.Screen name="CampaignDetail" component={CampaignDetail} />
          <Stack.Screen name="PolicyInfo" component={PolicyInfo} />
          <Stack.Screen name="ReviewList" component={ReviewListScreen} options={{ title: '전체 리뷰' }} />
          <Stack.Screen name="MyReview" component={MyReview} options={{ title: '내 리뷰' }} />
          <Stack.Screen name="FavoritePlaces" component={FavoritePlaces} options={{ title: '내가 찜한 장소' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}