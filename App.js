// App.js (CORRECTED WITH ADMIN REDIRECT)
import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { View, Text, Dimensions, Platform, ActivityIndicator } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import './firebase/config';

// Screens
import SplashScreen from "./screens/SplashScreen";
import AuthScreen from "./screens/AuthScreen";
import HomeScreen from "./screens/HomeScreen";
import NoteDetailScreen from "./screens/NoteDetailScreen";
import NotesScreen from "./screens/NotesScreen";
import AITools from "./screens/AiTools";
import StudyPlanner from "./screens/StudyPlanner";
import StudyPlanDetailScreen from "./screens/StudyPlanDetailScreen";
import Communities from "./screens/Communities";
import ProfileScreen from "./screens/ProfileScreen";
import AdminDashboard from "./screens/AdminDashboard";

// Auth Context
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
  const { colors } = useAuth();

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
  const { colors } = useAuth();

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

// Create Stack for Planner Tab
function PlannerStackScreen() {
  const { colors } = useAuth();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: colors.background }
      }}
    >
      <Stack.Screen name="PlannerMain" component={StudyPlanner} />
      <Stack.Screen name="StudyPlanDetail" component={StudyPlanDetailScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" translucent={true} />
      <AuthProvider>
        {showSplash ? (
          <SplashScreen onFinish={() => setShowSplash(false)} />
        ) : (
          <AppContent />
        )}
      </AuthProvider>
    </SafeAreaProvider>
  );
}

// Main App Content - Handles Admin Redirect
function AppContent() {
  const { user, loading, isAdmin, colors, showAuth, closeAuth } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors?.background || '#FFFFFF' }}>
        <ActivityIndicator size="large" color={colors?.primary || '#6B21A8'} />
      </View>
    );
  }
  // 🔥 IMPORTANT: Agar admin logged in hai to directly Admin Dashboard dikhao
  if (user?.isAdmin) {
    return (
      <SafeAreaProvider>
        <AdminDashboard />
        <Toast />
      </SafeAreaProvider>
    );
  }

  // Normal / Guest flow
  return (
    <NavigationContainer>
      {!user ? (
        // 🏠 GUEST MODE: Only Home screen is visible, no bottom tabs
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Home" component={HomeStackScreen} />
        </Stack.Navigator>
      ) : (
        // 📱 AUTHENTICATED: Full access with Bottom Tabs
        <MainTabs />
      )}

      {showAuth && (
        <AuthScreen
          visible={true}
          onClose={closeAuth}
          isGuestMode={false} // Allow closing to return to Guest Dashboard
        />
      )}
      <Toast />
    </NavigationContainer>
  );
}

// Main Bottom Tabs (Responsive styles maintained)
function MainTabs() {
  const totalNotes = 42;
  const totalPosts = 18;
  const { colors } = useAuth();

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          height: verticalScale(70),
          paddingBottom: verticalScale(10),
          paddingTop: verticalScale(10),
          backgroundColor: colors.card,
          borderTopWidth: moderateScale(1),
          borderTopColor: colors.border,
          shadowColor: colors.primary,
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
              color={focused ? colors.primary : colors.subText}
            />
          );
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.subText,
      })}
    >
      <Tab.Screen name="Home" component={HomeStackScreen} />
      <Tab.Screen name="Notes" component={NotesStackScreen} />
      <Tab.Screen name="AiTools" component={AITools} />
      <Tab.Screen name="Planner" component={PlannerStackScreen} />
      <Tab.Screen name="Communities" component={Communities} />
      <Tab.Screen name="Profile">
        {() => <ProfileScreen totalNotes={totalNotes} totalPosts={totalPosts} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}