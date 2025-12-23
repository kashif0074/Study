// screens/SplashScreen.js
import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export default function SplashScreen({ onFinish }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const bookSlideAnim = useRef(new Animated.Value(-150)).current; // Book top se aayegi
  const bookOpenAnim = useRef(new Animated.Value(0)).current;     // Book open hone ka angle
  const shineOpacity = useRef(new Animated.Value(0)).current;     // Shine effect
  const textGlowAnim = useRef(new Animated.Value(0)).current;     // Text glow animation

  useEffect(() => {
    // Main logo fade + scale
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1800,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Book slide down
    Animated.timing(bookSlideAnim, {
      toValue: 0,
      duration: 900,
      delay: 400,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      // Book slide complete hone ke baad open + shine
      Animated.parallel([
        Animated.timing(bookOpenAnim, {
          toValue: 1,
          duration: 700,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(shineOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(shineOpacity, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    });

    // Text glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(textGlowAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(textGlowAnim, {
          toValue: 0.3,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Auto finish after 2.5 seconds
    const timer = setTimeout(() => {
      onFinish?.();
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient colors={["#6B21A8", "#5B21B6", "#1E1B4B"]} style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Glowing Icon Circle */}
        <Animated.View style={[styles.iconCircle, { transform: [{ scale: scaleAnim }] }]}>
          <Ionicons name="bulb-outline" size={30} color="#FFD700" />
        </Animated.View>

        {/* Sliding Book */}
        <Animated.View style={{ transform: [{ translateY: bookSlideAnim }] }}>
          <Animated.View
            style={{
              transform: [
                {
                  rotateX: bookOpenAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0deg", "30deg"],
                  }),
                },
              ],
            }}
          >
            <Ionicons name="book" size={80} color="#f5f5f586" />
          </Animated.View>
        </Animated.View>

        {/* StudySpark Text with Golden Border */}
        <Animated.View 
          style={[
            styles.shiningTextContainer, 
            { 
              opacity: shineOpacity,
              shadowOpacity: textGlowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 0.8]
              })
            }
          ]}
        >
          {/* Golden Border */}
          <View style={styles.goldenBorder} />
          
          {/* Text with Glow Effect */}
          <Animated.Text 
            style={[
              styles.shiningText,
              {
                textShadowRadius: textGlowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [10, 25]
                })
              }
            ]}
          >
            StudySpark
          </Animated.Text>
        </Animated.View>

      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    paddingHorizontal: 40,
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 20,
    borderWidth: 2,
    borderColor: "rgba(255, 215, 0, 0.4)",
  },
  shiningTextContainer: {
    position: "absolute",
    top: "65%",
    marginTop: -50,
    padding: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(107, 33, 168, 0.7)',
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
    elevation: 15,
  },
  goldenBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,

    borderColor: "#FFD700",
  },
  shiningText: {
    fontSize: 20,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 2,
    marginBottom: 12,
    textShadowColor: "rgba(255, 215, 0, 0.7)",
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
  },
});