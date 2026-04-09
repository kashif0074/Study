// components/ui/radio-group.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useAuth } from "../../context/AuthContext";

export const RadioGroup = ({ children, value, onValueChange, style }) => {
  return (
    <View style={[styles.group, style]}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            selected: child.props.value === value,
            onSelect: onValueChange,
          });
        }
        return child;
      })}
    </View>
  );
};

export const RadioGroupItem = ({ value, label, selected, onSelect }) => {
  const { colors } = useAuth();
  return (
    <TouchableOpacity
      style={styles.item}
      onPress={() => onSelect(value)}
      activeOpacity={0.7}
    >
      <View style={[styles.radio, { borderColor: colors.border, backgroundColor: colors.card }]}>
        {selected && <View style={[styles.inner, { backgroundColor: colors.primary }]} />}
      </View>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  group: { gap: 12 },
  item: { flexDirection: "row", alignItems: "center", gap: 12 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  inner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  label: { fontSize: 15, fontWeight: "500" },
});