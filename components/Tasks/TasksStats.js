import React from "react";
import { View, Text, StyleSheet } from "react-native";

import { COLORS } from '../../styles/theme';

export default function TasksStats({tasks=[]}){
  const total = tasks.length;
  const done = tasks.filter(t=>t.done).length;
  return (<View style={styles.container}><Text style={styles.text}>Done {done}/{total}</Text></View>);
}
const styles = StyleSheet.create({container:{marginBottom:12},text:{color:COLORS.placeholder}});
