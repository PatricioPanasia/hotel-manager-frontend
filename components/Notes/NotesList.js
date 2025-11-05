import React from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { COLORS, SPACING, BORDERS, FONT_SIZES } from '../../styles/theme';

export default function NotesList({notes=[], onDelete}){
  return (
    <FlatList data={notes} keyExtractor={i=>String(i.id)} renderItem={({item})=>(
      <View style={styles.note}>
        <Text style={styles.text}>{item.text}</Text>
        <TouchableOpacity onPress={()=>onDelete?.(item.id)} style={styles.del}><Text style={styles.delText}>Del</Text></TouchableOpacity>
      </View>
    )} />
  );
}
const styles = StyleSheet.create({
  note:{padding:SPACING.md,backgroundColor:COLORS.card,borderRadius:BORDERS.radius,marginBottom:SPACING.md,flexDirection:"row",justifyContent:"space-between",alignItems:"center"},
  text:{color:COLORS.textPrimary,fontSize:FONT_SIZES.body}, del:{padding:6}, delText:{color:COLORS.primary}
});
