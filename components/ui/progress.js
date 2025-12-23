// components/ui/progress.js
import React from "react";
import { View, StyleSheet } from "react-native";

export function Progress({ value, style }) {
  return (
    <View style={[styles.bar, style]}>
      <View style={[styles.fill, { width: `${value}%` }]} />
    </View>
  );
}
const styles = StyleSheet.create({
  bar: { height: 8, backgroundColor: "#E5E7EB", borderRadius: 4, overflow: "hidden" },
  fill: { height: "100%", backgroundColor: "#6B21A8", borderRadius: 4 },
});