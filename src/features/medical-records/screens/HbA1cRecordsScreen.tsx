import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../common/components/layout';
import { COLORS } from '../../../config/theme.config';
import { medicalRecordsStyles as styles } from '../components';

const INITIAL_RECORDS = [
  { id: '1', date: '15 Jan 2024', value: '7.2%', notes: 'Good control' },
  { id: '2', date: '10 Oct 2023', value: '7.8%', notes: 'Slightly high' },
  { id: '3', date: '22 Jul 2023', value: '6.8%', notes: 'Excellent' },
  { id: '4', date: '05 May 2023', value: '7.5%', notes: '-' },
  { id: '5', date: '12 Feb 2023', value: '8.1%', notes: 'Need improvement' },
];

export const HbA1cRecordsScreen: React.FC = () => {
  const router = useRouter();
  const { id, subcategoryId, testId } = useLocalSearchParams();
  const [records, setRecords] = useState(INITIAL_RECORDS);

  const handleEditRecord = (record: typeof INITIAL_RECORDS[0]) => {
    router.push({
      pathname: `/my-reports/${id}/${subcategoryId}/${testId}/edit/${record.id}`,
      params: {
        recordData: JSON.stringify(record)
      }
    } as any);
  };

  const handleDeleteRecord = (recordId: string) => {
    Alert.alert(
      'Delete Record',
      'Are you sure you want to delete this record?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            setRecords(prev => prev.filter(r => r.id !== recordId));
          }
        },
      ]
    );
  };

  const getTestTitle = () => {
    switch (testId) {
      case 'hba1c':
        return 'HbA1c Records';
      case 'fasting-plasma-glucose':
        return 'Fasting Plasma Glucose Records';
      case 'serum-creatinine':
        return 'Serum Creatinine Records';
      default:
        return 'Records';
    }
  };

  const handleAddRecord = () => {
    router.push(`/my-reports/${id}/${subcategoryId}/${testId}/add` as any);
  };

  return (
    <ScreenWrapper safeArea backgroundColor={COLORS.background}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{getTestTitle()}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.dividerLarge} />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContentWithButton}
      >
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.dateColumn]}>Date</Text>
            <Text style={[styles.tableHeaderText, styles.valueColumn]}>Value</Text>
            <Text style={[styles.tableHeaderText, styles.notesColumn]}>Notes</Text>
            <Text style={[styles.tableHeaderText, styles.actionsColumn]}>Actions</Text>
          </View>

          {records.map((record, index) => (
            <View 
              key={record.id} 
              style={[
                styles.tableRow,
                index % 2 === 0 && styles.tableRowEven
              ]}
            >
              <Text style={[styles.tableCell, styles.dateColumn, styles.dateText]}>{record.date}</Text>
              <Text style={[styles.tableCell, styles.valueColumn, styles.valueText]}>{record.value}</Text>
              <Text style={[styles.tableCell, styles.notesColumn, styles.notesText]}>{record.notes}</Text>
              <View style={[styles.actionsColumn, styles.actionsContainer]}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleEditRecord(record)}
                >
                  <Ionicons name="pencil" size={18} color={COLORS.primary} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleDeleteRecord(record.id)}
                >
                  <Ionicons name="trash-outline" size={18} color="#E53935" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddRecord}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={24} color={COLORS.white} />
          <Text style={styles.addButtonText}>Add New HbA1c Record</Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
};
