// components/ui/button.js
import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

export function Button({ children, onPress, disabled, style }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[styles.btn, disabled && styles.disabled, style]}
    >
      <Text style={styles.text}>{children}</Text>
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  btn: { backgroundColor: "#6B21A8", padding: 14, borderRadius: 12, alignItems: "center" },
  disabled: { opacity: 0.6 },
  text: { color: "#fff", fontWeight: "600" },
});