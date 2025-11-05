import React, {useState} from "react";
import { TextInput, TouchableOpacity, Text, StyleSheet, Platform, View } from "react-native";
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';
import { COLORS, SPACING, BORDERS, FONT_SIZES } from '../../styles/theme';

export default function CheckInOutForm({onSubmit}){
  const [name, setName] = useState("");
  return (
    <Animated.View 
      style={styles.container}
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      layout={Platform.OS !== 'web' ? Layout.springify() : undefined}
    >
      <Text style={{fontSize: FONT_SIZES.h2, color: COLORS.textPrimary, marginBottom: SPACING.lg, fontWeight: 'bold'}}>
        Check In/Out
      </Text>
      <TextInput 
        style={styles.input} 
        placeholder="Enter your name" 
        placeholderTextColor={COLORS.placeholder} 
        value={name} 
        onChangeText={setName}
      />
      <TouchableOpacity 
        style={styles.btn} 
        onPress={()=>{ if(onSubmit) onSubmit({name}); setName(""); }}
      >
        <Text style={styles.btnText}>Check Attendance</Text>
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
    backgroundColor: '#f5f5f5',
    padding: SPACING.md,
    borderRadius: BORDERS.radius,
    marginBottom: SPACING.md,
    color: COLORS.textPrimary,
    height: 48,
    justifyContent: 'center',
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
