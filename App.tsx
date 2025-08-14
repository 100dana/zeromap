/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from "react";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

type RootStackParamList = {
  SignUp: undefined;
  SignIn: undefined;
  Home: undefined;
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
};

import { SafeAreaProvider } from 'react-native-safe-area-context';
import HomeScreen from "./src/screens/HomeScreen";
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

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      {/* @ts-ignore */}
      <NavigationContainer>
        <Stack.Navigator initialRouteName="SignUp" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="SignUp" component={SignUp} />
          <Stack.Screen name="SignIn" component={SignIn} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Map" component={MapScreen} />
          <Stack.Screen name="ReportPlace" component={ReportPlace} />
          <Stack.Screen name="WriteReview" component={WriteReview} />
          <Stack.Screen name="MyPage" component={MyPage} />
          <Stack.Screen name="Settings" component={Settings} />
          <Stack.Screen name="Campaign" component={Campaign} />
          <Stack.Screen name="CampaignDetail" component={CampaignDetail} />
          <Stack.Screen name="PolicyInfo" component={PolicyInfo} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}