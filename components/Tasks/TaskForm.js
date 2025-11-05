import React, {useState} from "react";
import { TextInput, TouchableOpacity, Text, StyleSheet, Platform, View } from "react-native";
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';
import { COLORS, SPACING, BORDERS, FONT_SIZES } from '../../styles/theme';

export default function TaskForm({onAdd}){
  const [title,setTitle]=useState("");
  const submit=()=>{ if(!title.trim()) return; onAdd?.({title}); setTitle(""); }
  return (
    <Animated.View 
      style={styles.container}
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      layout={Platform.OS !== 'web' ? Layout.springify() : undefined}
    >
      <Text style={{fontSize: FONT_SIZES.h2, color: COLORS.textPrimary, marginBottom: SPACING.lg, fontWeight: 'bold'}}>
        New Task
      </Text>
      <TextInput 
        style={styles.input} 
        placeholder="Task title" 
        placeholderTextColor={COLORS.placeholder} 
        value={title} 
        onChangeText={setTitle}
      />
      <TouchableOpacity style={styles.btn} onPress={submit}>
        <Text style={styles.btnText}>Add Task</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}
const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: BORDERS.radius,
    width: '90%',
    maxWidth: 600,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  input: {
    backgroundColor: COLORS.background,
    padding: SPACING.sm,
    borderRadius: BORDERS.radius,
    marginBottom: SPACING.sm,
    color: COLORS.textPrimary,
    borderWidth: BORDERS.borderWidth,
    borderColor: COLORS.border,
  },
  btn: {
    padding: SPACING.sm,
    backgroundColor: COLORS.accent,
    borderRadius: BORDERS.radius,
    justifyContent: "center",
    alignItems: "center",
  },
  btnText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.button
  }
});
