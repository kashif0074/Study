// components/ui/textarea.js
import React from "react";
import { TextInput, StyleSheet } from "react-native";

export function Textarea({ placeholder, value, onChangeText, rows = 4 }) {
  return (
    <TextInput
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      multiline
      numberOfLines={rows}
      style={styles.input}
      textAlignVertical="top"
    />
  );
}
const styles = StyleSheet.create({
  input: { borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, padding: 12, backgroundColor: "#fff" },
});