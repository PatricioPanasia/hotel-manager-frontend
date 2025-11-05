import React from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { COLORS, SPACING, BORDERS, FONT_SIZES } from '../../styles/theme';

export default function TasksList({tasks=[], onToggle, onDelete}){
  return (
    <FlatList data={tasks} keyExtractor={i=>String(i.id)} renderItem={({item})=>(
      <View style={styles.row}>
        <Text style={[styles.text, item.done && styles.done]}>{item.title}</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity onPress={()=>onToggle?.(item.id)} style={styles.action}><Text style={styles.actionText}>Toggle</Text></TouchableOpacity>
          <TouchableOpacity onPress={()=>onDelete?.(item.id)} style={styles.action}><Text style={styles.actionText}>Del</Text></TouchableOpacity>
        </View>
      </View>
    )} />
  );
}
const styles = StyleSheet.create({
  row:{padding:SPACING.md,backgroundColor:COLORS.card,borderRadius:BORDERS.radius,marginBottom:SPACING.md,flexDirection:"row",justifyContent:"space-between",alignItems:"center"},
  text:{color:COLORS.textPrimary,fontSize:FONT_SIZES.body},
  done:{textDecorationLine:"line-through",color:COLORS.placeholder},
  action:{padding:6},
  actionsRow:{flexDirection:'row'},
  actionText:{color:COLORS.primary}
});
