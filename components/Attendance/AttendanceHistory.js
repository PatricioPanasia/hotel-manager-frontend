import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { COLORS, SPACING, FONT_SIZES, BORDERS } from '../../styles/theme';

export default function AttendanceHistory({ records=[] }){
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Attendance history</Text>
      <FlatList data={records} keyExtractor={(i,idx)=>String(i.id||idx)} renderItem={({item})=>(
        <View style={styles.row}><Text style={styles.name}>{item.name || "Guest"}</Text><Text style={styles.status}>{item.status}</Text></View>
      )} />
    </View>
  );
}
const styles = StyleSheet.create({
  container:{marginBottom:SPACING.md},
  title:{color:COLORS.textPrimary,fontSize:FONT_SIZES.body,marginBottom:SPACING.sm},
  row:{flexDirection:"row",justifyContent:"space-between",padding:SPACING.sm,backgroundColor:COLORS.card,borderRadius:BORDERS.radius,marginBottom:SPACING.sm,borderWidth:BORDERS.borderWidth,borderColor:COLORS.border},
  name:{color:COLORS.textPrimary}, status:{color:COLORS.placeholder}
});
