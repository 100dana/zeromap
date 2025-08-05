/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from "react";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from "./src/screens/HomeScreen";
import MapScreen from "./src/screens/MapScreen";
import ReportPlace from "./src/screens/ReportPlace";
import WriteReview from "./src/screens/WriteReview";
import MyPage from "./src/screens/MyPage";
import Settings from "./src/screens/Settings";
import Campaign from "./src/screens/Campaign";
import CampaignDetail from "./src/screens/CampaignDetail";
import PolicyInfo from "./src/screens/PolicyInfo";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
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
  );
}