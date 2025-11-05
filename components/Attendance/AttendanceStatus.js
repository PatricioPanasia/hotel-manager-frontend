import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, SPACING, BORDERS } from '../../styles/theme';

export default function AttendanceStatus({status="out"}){
  return (
    <View style={[styles.container, status==="in" && styles.in]}>
      <Text style={styles.text}>{status==="in" ? "Checked in" : "Checked out"}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container:{padding:SPACING.xs,borderRadius:BORDERS.radius,backgroundColor:COLORS.secondary,alignSelf:"flex-start"},
  in:{backgroundColor:COLORS.success},
  text:{color:COLORS.white}
});
