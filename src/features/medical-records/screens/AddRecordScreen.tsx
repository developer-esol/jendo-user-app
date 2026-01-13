import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../common/components/layout';
import { COLORS } from '../../../config/theme.config';
import { medicalRecordsStyles as styles } from '../components';

export const AddRecordScreen: React.FC = () => {
  const router = useRouter();
  const { testId } = useLocalSearchParams();
  const [value, setValue] = useState('');

  const getTestName = () => {
    switch (testId) {
      case 'hba1c':
        return 'HbA1c';
      case 'fasting-plasma-glucose':
        return 'Fasting Plasma Glucose';
      case 'serum-creatinine':
        return 'Serum Creatinine';
      default:
        return 'Test';
    }
  };

  const handleSave = () => {
    router.back();
  };

  const handleCancel = () => {
    router.back();
  };

  const handleChooseFiles = () => {
  };

  return (
    <ScreenWrapper safeArea backgroundColor={COLORS.background}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Record</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContentForm}
      >
        <View style={styles.formSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="pencil" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>{getTestName()}</Text>
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{getTestName()}</Text>
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={setValue}
              placeholder="Enter value"
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>
        </View>

        <View style={styles.formSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="attach" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Attachments</Text>
          </View>
          
          <View style={styles.uploadContainer}>
            <View style={styles.uploadArea}>
              <View style={styles.uploadIconContainer}>
                <Ionicons name="cloud-upload-outline" size={40} color={COLORS.textSecondary} />
              </View>
              <Text style={styles.uploadTitle}>Drag & drop files here</Text>
              <Text style={styles.uploadSubtitle}>or click to browse</Text>
              
              <TouchableOpacity 
                style={styles.chooseFilesButton}
                onPress={handleChooseFiles}
                activeOpacity={0.8}
              >
                <Text style={styles.chooseFilesText}>Choose Files</Text>
              </TouchableOpacity>
              
              <Text style={styles.supportedFormats}>Supports images and PDFs</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.buttonContainerRow}>
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>Save Report</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={handleCancel}
          activeOpacity={0.8}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
};
