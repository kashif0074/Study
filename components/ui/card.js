// components/ui/card.js
import React from "react";
import { View, StyleSheet } from "react-native";
import { useAuth } from "../../context/AuthContext";

export const Card = ({ children, style, ...props }) => {
  const { colors } = useAuth();
  const cardStyles = getCardStyles(colors);
  return (
    <View style={[cardStyles.card, { backgroundColor: colors.card, borderColor: colors.border }, style]} {...props}>
      {children}
    </View>
  );
};

export const CardHeader = ({ children, style }) => (
  <View style={[styles.header, style]}>{children}</View>
);

export const CardTitle = ({ children, style }) => (
  <View style={[styles.titleContainer, style]}>{children}</View>
);

export const CardContent = ({ children, style }) => (
  <View style={[styles.content, style]}>{children}</View>
);

const getCardStyles = (colors) => StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    shadowColor: colors.black,
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
});

const styles = StyleSheet.create({
  header: { marginBottom: 12 },
  titleContainer: { marginBottom: 4 },
  content: {},
});