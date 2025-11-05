import React, {useState} from "react";
import { TextInput, TouchableOpacity, Text, StyleSheet, Platform, View } from "react-native";
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';
import { COLORS, SPACING, BORDERS, FONT_SIZES } from '../../styles/theme';

export default function NoteForm({onAdd}){
  const [text,setText]=useState("");
  const submit=()=>{ if(!text.trim())return; onAdd?.(text); setText(""); }
  return (
    <Animated.View 
      style={styles.container}
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      layout={Platform.OS !== 'web' ? Layout.springify() : undefined}
    >
      <Text style={{fontSize: FONT_SIZES.h2, color: COLORS.textPrimary, marginBottom: SPACING.lg, fontWeight: 'bold'}}>
        New Note
      </Text>
      <TextInput 
        style={styles.input} 
        placeholder="Write your note here..." 
        placeholderTextColor={COLORS.placeholder} 
        value={text} 
        onChangeText={setText}
        multiline={true}
        numberOfLines={4}
      />
      <TouchableOpacity style={styles.btn} onPress={submit}>
        <Text style={styles.btnText}>Add Note</Text>
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
    minHeight: 100,
    textAlignVertical: 'top',
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
