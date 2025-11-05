import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import DashboardLayout from "../components/Layout/DashboardLayout";
import { COLORS, FONT_SIZES, SPACING } from '../styles/theme';

export default function NotesPageScreen(){ 
  return (
    <DashboardLayout>
      <Text style={{fontSize:FONT_SIZES.h2,color:COLORS.textPrimary,marginBottom:SPACING.sm}}>NotesPage</Text>
      <ScrollView contentContainerStyle={{paddingVertical:SPACING.sm}}>
        <Text style={{color:COLORS.placeholder}}>Pantalla convertida: NotesPage</Text>
      </ScrollView>
    </DashboardLayout>
  );
}
