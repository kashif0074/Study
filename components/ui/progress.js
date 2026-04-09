// components/ui/progress.js
import React from "react";
import { View, StyleSheet } from "react-native";
import { useAuth } from "../../context/AuthContext";

export const Progress = ({ value = 0, style }) => {
  const { colors } = useAuth();
  return (
    <View style={[styles.container, { backgroundColor: colors.border }, style]}>
      <View style={[styles.bar, { width: `${value}%`, backgroundColor: colors.primary }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden"
  },
  bar: {
    height: "100%",
    borderRadius: 4
  },
});