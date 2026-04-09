// components/ui/textarea.js
import React from "react";
import { TextInput, StyleSheet } from "react-native";
import { useAuth } from "../../context/AuthContext";

export function Textarea({ placeholder, value, onChangeText, rows = 4, style }) {
  const { colors } = useAuth();
  return (
    <TextInput
      placeholder={placeholder}
      placeholderTextColor={colors.placeholder}
      value={value}
      onChangeText={onChangeText}
      multiline
      numberOfLines={rows}
      style={[
        styles.input,
        {
          borderColor: colors.border,
          backgroundColor: colors.card,
          color: colors.text
        },
        style
      ]}
      textAlignVertical="top"
    />
  );
}
const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
});