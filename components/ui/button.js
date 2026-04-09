// components/ui/button.js
import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useAuth } from "../../context/AuthContext";

export const Button = ({ children, variant = "primary", style, textStyle, ...props }) => {
  const { colors } = useAuth();

  const variants = {
    primary: {
      backgroundColor: colors.primary,
      color: colors.white,
    },
    secondary: {
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderWidth: 1,
      color: colors.text,
    },
    outline: {
      backgroundColor: "transparent",
      borderColor: colors.primary,
      borderWidth: 1,
      color: colors.primary,
    },
    danger: {
      backgroundColor: colors.danger,
      color: colors.white,
    }
  };

  const buttonStyle = variants[variant] || variants.primary;

  return (
    <TouchableOpacity
      style={[
        styles.btn,
        {
          backgroundColor: buttonStyle.backgroundColor,
          borderColor: buttonStyle.borderColor,
          borderWidth: buttonStyle.borderWidth
        },
        props.disabled && styles.disabled,
        style,
      ]}
      {...props}
    >
      <Text style={[styles.text, { color: buttonStyle.color }, textStyle]}>{children}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    fontWeight: "600",
  },
});