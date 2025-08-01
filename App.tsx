import React from "react";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from "./src/screens/HomeScreen";
import MapScreen from "./src/screens/MapScreen";
import MapDetail from "./src/screens/MapDetail";
import ReportPlace from "./src/screens/ReportPlace";
import WriteReview from "./src/screens/WriteReview";
import MyPage from "./src/screens/MyPage";
import Settings from "./src/screens/Settings";
import SignUp from "./src/screens/SignUp";
import SignIn from "./src/screens/SignIn";
import './src/services/firebase';
import { configureGoogleSignIn } from './src/services/googleSignIn';

const Stack = createNativeStackNavigator();

export default function App() {
  // Google Sign-In 초기화
  React.useEffect(() => {
    configureGoogleSignIn();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="SignUp" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Map" component={MapScreen} />
        <Stack.Screen name="MapDetail" component={MapDetail} />
                      <Stack.Screen name="ReportPlace" component={ReportPlace} />
              <Stack.Screen name="WriteReview" component={WriteReview} />
              <Stack.Screen name="MyPage" component={MyPage} />
              <Stack.Screen name="Settings" component={Settings} />
              <Stack.Screen name="SignUp" component={SignUp} />
              <Stack.Screen name="SignIn" component={SignIn} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}