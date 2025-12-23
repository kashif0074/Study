// App.js (CORRECTED VERSION)
import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { View, Text, Dimensions, Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Screens
import SplashScreen from "./screens/SplashScreen";
import AuthScreen from "./screens/AuthScreen";
import HomeScreen from "./screens/HomeScreen";
import NoteDetailScreen from "./screens/NoteDetailScreen";
import NotesScreen from "./screens/NotesScreen";
import AITools from "./screens/AiTools";
import StudyPlanner from "./screens/StudyPlanner";
import Communities from "./screens/Communities";
import ProfileScreen from "./screens/ProfileScreen";

// Auth Context - SIRF EK BAAR IMPORT
import { AuthProvider, useAuth } from "./context/AuthContext";

const { width, height } = Dimensions.get("window");

// --- RESPONSIVENESS UTILITY FUNCTIONS ---
const BASE_WIDTH = 375;
const MAX_CONTENT_WIDTH = 600;
const scaleDimension = Math.min(width, MAX_CONTENT_WIDTH); 
const scaleFactor = scaleDimension / BASE_WIDTH;
const verticalScaleFactor = height / 667;

const scale = (size) => size * scaleFactor;
const verticalScale = (size) => size * verticalScaleFactor;
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;
// -------------------------------------------------------------------------

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Create Stack for Home Tab (includes NoteDetail)
function HomeStackScreen() {
  const { colors } = useAuth(); // Get colors here
  
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        cardStyle: { backgroundColor: colors.background }
      }}
    >
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="NoteDetail" component={NoteDetailScreen} />
    </Stack.Navigator>
  );
}

// Create Stack for Notes Tab (includes NoteDetail)
function NotesStackScreen() {
  const { colors } = useAuth(); // Get colors here
  
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        cardStyle: { backgroundColor: colors.background }
      }}
    >
      <Stack.Screen name="NotesMain" component={NotesScreen} />
      <Stack.Screen name="NoteDetail" component={NoteDetailScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />; 
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <MainTabs />
          <AuthOverlay /> 
          <Toast />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

// Main Bottom Tabs (Responsive styles maintained)
function MainTabs() {
  const totalNotes = 42;
  const totalPosts = 18;
  const { colors } = useAuth(); // Get colors here

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          height: verticalScale(70),
          paddingBottom: verticalScale(10),
          paddingTop: verticalScale(10),
          backgroundColor: colors.card, // Use theme color
          borderTopWidth: moderateScale(1),
          borderTopColor: colors.border, // Use theme color
          shadowColor: "#A78BFA",
          shadowOffset: { width: 0, height: verticalScale(-2) },
          shadowOpacity: 0.08,
          shadowRadius: moderateScale(8),
          elevation: 6,
        },
        tabBarLabelStyle: {
          fontSize: moderateScale(10),
          fontWeight: "600",
          marginTop: verticalScale(2),
        },
        tabBarIcon: ({ focused }) => {
          let iconName;

          if (route.name === "Home") iconName = focused ? "home" : "home-outline";
          else if (route.name === "Notes") iconName = focused ? "document-text" : "document-text-outline";
          else if (route.name === "AiTools") iconName = focused ? "sparkles" : "sparkles-outline";
          else if (route.name === "Planner") iconName = focused ? "calendar" : "calendar-outline";
          else if (route.name === "Communities") iconName = focused ? "people" : "people-outline";
          else if (route.name === "Profile") iconName = focused ? "person" : "person-outline";

          return (
            <Ionicons
              name={iconName}
              size={moderateScale(22)}
              color={focused ? colors.primary : colors.subText} // Use theme colors
            />
          );
        },
        tabBarActiveTintColor: colors.primary, // Use theme color
        tabBarInactiveTintColor: colors.subText, // Use theme color
      })}
    >
      <Tab.Screen name="Home" component={HomeStackScreen} />
      <Tab.Screen name="Notes" component={NotesStackScreen} />
      <Tab.Screen name="AiTools" component={AITools} />
      <Tab.Screen name="Planner" component={StudyPlanner} />
      <Tab.Screen name="Communities" component={Communities} />
      <Tab.Screen name="Profile">
        {() => <ProfileScreen totalNotes={totalNotes} totalPosts={totalPosts} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

// Auth Modal Overlay
function AuthOverlay() {
  const { showAuth, login, closeAuth } = useAuth(); 

  if (!showAuth) return null;

  const handleAuthSuccess = (userData) => { 
    login(userData || { name: "Authenticated User", email: "user@studyspark.com" });
  };

  return (
    <AuthScreen
      visible={true}
      onAuthSuccess={handleAuthSuccess}
      onClose={closeAuth} 
    />
  );
}