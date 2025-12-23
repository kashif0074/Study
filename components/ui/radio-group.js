// components/ui/radio-group.js
import React, { useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";

export function RadioGroup({ children, value, onValueChange, disabled }) {
  return (
    <View>
      {React.Children.map(children, (child) =>
        React.cloneElement(child, { groupValue: value, onValueChange, disabled })
      )}
    </View>
  );
}

export function RadioGroupItem({ value, id, groupValue, onValueChange, disabled }) {
  const selected = groupValue === value;
  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={() => onValueChange?.(value)}
      style={styles.row}
    >
      <View style={[styles.circle, selected && styles.selected]}>
        {selected && <View style={styles.dot} />}
      </View>
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", marginVertical: 4 },
  circle: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: "#6B21A8", justifyContent: "center", alignItems: "center" },
  selected: { borderColor: "#6B21A8", backgroundColor: "#E9D5FF" },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#6B21A8" },
});