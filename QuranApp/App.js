import "./gesture-handler.native";

// Before rendering any navigation stack
import { enableScreens } from "react-native-screens";
enableScreens();

import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  ScrollView,
  Text,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import * as MediaLibrary from "expo-media-library";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

import { useFonts } from "expo-font";

import Chat from "./screens/chat/Chat";
import Prayer from "./screens/menu/Prayer";

import MainMenu from "./screens/menu/MainMenu";

import { NavigationContainer } from "@react-navigation/native";
import Login from "./screens/login/Login";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Signup from "./save/Signup";
import initializeDatabase from "./screens/database";
import DrawerTest from "./screens/chat/DrawerTest";
import Toast from "react-native-toast-message";
import Icon from "react-native-vector-icons/FontAwesome";
import { PrayerProvider } from "./screens/menu/PrayerContext";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { InitialQuestionProvider } from "./screens/chat/InitialQuestionContext";
import Surah from "./screens/quran/Surah";
import Verses from "./screens/quran/Verses";
import { SQLiteProvider } from "expo-sqlite";
import SearchTabs from "./screens/quran/SearchTabs";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import PaywallScreen from "./screens/paywall/PaywallScreen";
import { SubscriptionProvider } from "./screens/paywall/SubscriptionContext";
import ChatStreamed from "./screens/chat/ChatStreamed";
import { BottomSheetReferenceProvider } from "./screens/chat/BottomSheetReference";
import { LogBox } from "react-native";
import HadithBooks from "./screens/hadith/HadithBooks";
import HadithBook from "./screens/hadith/HadithBook";
import Hadith from "./screens/hadith/Hadith";
import HadithCollections from "./screens/hadith/HadithCollections";
import Qibla from "./screens/tools/Qibla";
import HomeIcon from "./assets/bottom-bar/home.svg";
import QuranIcon from "./assets/bottom-bar/quran.svg";
import ILMIcon from "./assets/bottom-bar/ilm.ai.svg";
import HadithIcon from "./assets/bottom-bar/hadith.svg";
import SettingsIcon from "./assets/bottom-bar/settings.svg";
import Meditate from "./screens/daily/Meditate";
``;
import { BlurView } from "expo-blur";

//LogBox.ignoreAllLogs(true);

GoogleSignin.configure({
  iosClientId:
    "985762750874-f9uq014laj5ji965df90acj0053skoq6.apps.googleusercontent.com",

  profileImageSize: 120,
  offlineAccess: true,
  webClientId:
    "985762750874-1c16oj3p42h1nvrvcbf0bdsilr40mscc.apps.googleusercontent.com",
});
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

initializeDatabase();

const App = () => {
  const toastConfig = {
    success: ({ props }) => (
      <View style={styles1.customToastContainer}>
        <Icon name="check" size={30} color="#007AFF" style={styles1.icon} />
        <View>
          <Text style={styles1.title}>{props.title}</Text>
          <Text style={styles1.message}>{props.message}</Text>
        </View>
      </View>
    ),
    error: ({ props }) => (
      <View style={styles1.customToastContainer}>
        <Icon name="close" size={30} color="#FF3B30" style={styles1.icon} />
        <View>
          <Text style={styles1.title}>{props.title}</Text>
          <Text style={styles1.message}>{props.message}</Text>
        </View>
      </View>
    ),
    warning: ({ props }) => (
      <View style={styles1.customToastContainer}>
        <Icon
          name="circle-exclamation"
          size={30}
          color="#FF9500"
          style={styles1.icon}
        />
        <View>
          <Text style={styles1.title}>{props.title}</Text>
          <Text style={styles1.message}>{props.message}</Text>
        </View>
      </View>
    ),
  };

  const styles1 = StyleSheet.create({
    customToastContainer: {
      width: "90%",
      flexDirection: "row",
      alignItems: "center",
      padding: 15,
      backgroundColor: "rgba(255, 255, 255, 1)",
      borderRadius: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,

      elevation: 5,
    },
    icon: {
      marginRight: 15,
    },
    title: {
      color: "#1C1C1E",
      fontWeight: "bold",
      fontSize: 17,
    },
    message: {
      color: "#6E6E73",
      fontSize: 15,
    },
  });

  const [loaded, error] = useFonts({
    "SF-Arabic": require("./assets/fonts/SF-Arabic.ttf"),
  });

  const [status, requestPermission] = MediaLibrary.usePermissions();

  if (status === null) {
    requestPermission();
  }

  const HomeStack = () => (
    <Stack.Navigator
      initialRouteName="MainMenu"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="MainMenu" component={MainMenu} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Sourate" component={SearchTabs} />
      <Stack.Screen name="Verses" component={Verses} />
      <Stack.Screen
        name="Prayer"
        component={Prayer}
        options={{
          presentation: "modal",
        }}
      />
      <Stack.Screen name="Qibla" component={Qibla} />
      <Stack.Screen name="HadithCollections" component={HadithCollections} />
      <Stack.Screen name="HadithBooks" component={HadithBooks} />
      <Stack.Screen name="HadithBook" component={HadithBook} />
      <Stack.Screen name="Hadith" component={Hadith} />
      <Stack.Screen
        name="Meditate"
        component={Meditate}
        options={{
          presentation: "modal",
        }}
      />
    </Stack.Navigator>
  );

  const QuranStack = () => (
    <Stack.Navigator
      initialRouteName="SearchTabs"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Sourate" component={SearchTabs} />
      <Stack.Screen
        name="Verses"
        component={Verses}
        options={{
          presentation: "modal",
        }}
      />
    </Stack.Navigator>
  );

  const ChatStack = () => (
    <Stack.Navigator
      initialRouteName="Drawer"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Drawer" component={DrawerTest} />
    </Stack.Navigator>
  );

  const HadithStack = () => (
    <Stack.Navigator
      initialRouteName="HadithCollections"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="HadithCollections" component={HadithCollections} />
      <Stack.Screen name="HadithBooks" component={HadithBooks} />
      <Stack.Screen name="HadithBook" component={HadithBook} />
      <Stack.Screen name="Hadith" component={Hadith} />
    </Stack.Navigator>
  );

  const SettingsStack = () => (
    <Stack.Navigator
      initialRouteName="Settings"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="Settings"
        component={() => <Text>Hello, welcome settings</Text>}
      />
    </Stack.Navigator>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SubscriptionProvider>
        <InitialQuestionProvider>
          <PrayerProvider>
            <SQLiteProvider
              databaseName="coran.db"
              assetSource={{ assetId: require("./assets/coran.db") }}
            >
              <BottomSheetModalProvider>
                <BottomSheetReferenceProvider>
                  <GestureHandlerRootView>
                    <NavigationContainer>
                      <Tab.Navigator
                        screenOptions={({ route }) => {
                          const customLabels = {
                            Home: "Accueil",
                            Quran: "Coran",
                            Chat: "ILM.ai",
                            HadithScreen: "Hadiths",
                            SettingsScreen: "Réglages",
                          };

                          return {
                            tabBarIcon: ({ focused }) => {
                              const color = focused ? "#FF2D55" : "#808080";
                              const size = 24;

                              const icons = {
                                Home: (
                                  <HomeIcon
                                    width={size}
                                    height={size}
                                    fill={color}
                                  />
                                ),
                                Quran: (
                                  <QuranIcon
                                    width={size}
                                    height={size}
                                    fill={color}
                                  />
                                ),
                                Chat: (
                                  <ILMIcon
                                    width={size * 1.3}
                                    height={size * 1.3}
                                    fill={color}
                                  />
                                ),
                                HadithScreen: (
                                  <HadithIcon
                                    width={size}
                                    height={size}
                                    fill={color}
                                  />
                                ),
                                SettingsScreen: (
                                  <SettingsIcon
                                    width={size}
                                    height={size}
                                    fill={color}
                                  />
                                ),
                              };

                              return icons[route.name];
                            },
                            tabBarLabel: ({ focused }) => (
                              <Text
                                style={{
                                  color: focused ? "#FF2D55" : "#808080",
                                  fontSize: 12,
                                  fontWeight: "600",
                                }}
                              >
                                {customLabels[route.name]}{" "}
                              </Text>
                            ),
                            tabBarStyle: {
                              position: "absolute",
                              borderTopWidth: 0,
                              backgroundColor: "rgba(256,256,256,0.5)",
                            },
                            tabBarBackground: () => (
                              <BlurView
                                intensity={80}
                                style={StyleSheet.absoluteFill}
                                tint="light"
                              />
                            ),
                            headerShown: false,
                          };
                        }}
                      >
                        <Tab.Screen name="Home" component={HomeStack} />
                        <Tab.Screen name="Quran" component={QuranStack} />
                        <Tab.Screen
                          name="Chat"
                          component={ChatStack}
                          options={{
                            tabBarStyle: { display: "none" },
                            unmountOnBlur: true,
                          }}
                        />
                        <Tab.Screen
                          name="HadithScreen"
                          component={HadithStack}
                        />
                        <Tab.Screen
                          name="SettingsScreen"
                          component={SettingsStack}
                        />
                      </Tab.Navigator>
                    </NavigationContainer>
                    <Toast topOffset={100} config={toastConfig} />
                  </GestureHandlerRootView>
                </BottomSheetReferenceProvider>
              </BottomSheetModalProvider>
            </SQLiteProvider>
          </PrayerProvider>
        </InitialQuestionProvider>
      </SubscriptionProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({});

export default App;
