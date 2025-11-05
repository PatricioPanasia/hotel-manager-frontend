import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import DashboardLayout from "../components/Layout/DashboardLayout";
import { COLORS, FONT_SIZES, SPACING } from '../styles/theme';

export default function TasksPageScreen(){ 
  return (
    <DashboardLayout>
      <Text style={{fontSize:FONT_SIZES.h2,color:COLORS.textPrimary,marginBottom:SPACING.sm}}>TasksPage</Text>
      <ScrollView contentContainerStyle={{paddingVertical:SPACING.sm}}>
        <Text style={{color:COLORS.placeholder}}>Pantalla convertida: TasksPage</Text>
      </ScrollView>
    </DashboardLayout>
  );
}
