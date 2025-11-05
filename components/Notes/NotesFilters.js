import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, SPACING, FONT_SIZES } from '../../styles/theme';

export default function NotesFilters(){ 
  return (<View style={styles.container}><Text style={styles.text}>Filters placeholder</Text></View>);
}
const styles = StyleSheet.create({container:{marginBottom:SPACING.md},text:{color:COLORS.placeholder,fontSize:FONT_SIZES.body}});
