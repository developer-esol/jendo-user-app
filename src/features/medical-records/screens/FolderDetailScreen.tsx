import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../common/components/layout';
import { Header, SearchBar, Card, EmptyState, Badge } from '../../../common/components/ui';
import { COLORS } from '../../../config/theme.config';
import { MedicalRecord } from '../../../types/models';
import { medicalRecordsStyles as styles } from '../components';

const DUMMY_RECORDS: MedicalRecord[] = [
  {
    id: 'record-001',
    userId: 'user-001',
    folderId: 'folder-002',
    category: 'cardiovascular',
    title: 'Annual Heart Checkup',
    description: 'Comprehensive cardiovascular examination',
    date: '2024-11-15',
    doctorName: 'Dr. Sarah Johnson',
    hospitalName: 'National Hospital, Colombo',
    diagnosis: 'Normal sinus rhythm. No abnormalities detected.',
    attachments: [],
    createdAt: '2024-11-15',
    updatedAt: '2024-11-15',
  },
  {
    id: 'record-002',
    userId: 'user-001',
    folderId: 'folder-002',
    category: 'cardiovascular',
    title: 'ECG Report',
    description: 'Routine ECG examination',
    date: '2024-10-20',
    doctorName: 'Dr. Michael Chen',
    hospitalName: 'Lanka Hospitals',
    diagnosis: 'Normal ECG pattern',
    attachments: [{ id: '1', type: 'pdf', name: 'ECG_Report.pdf', url: '', size: 100, uploadedAt: '' }],
    createdAt: '2024-10-20',
    updatedAt: '2024-10-20',
  },
];

export const FolderDetailScreen: React.FC = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const folderName = 'Cardiovascular';

  const filteredRecords = DUMMY_RECORDS.filter(record => {
    if (searchQuery) {
      return (
        record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.doctorName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return true;
  });

  const renderRecord = ({ item }: { item: MedicalRecord }) => (
    <TouchableOpacity
      onPress={() => router.push(`/my-reports/record/${item.id}`)}
      activeOpacity={0.7}
    >
      <Card style={styles.recordCard}>
        <View style={styles.recordHeader}>
          <View style={styles.recordIcon}>
            <Ionicons name="document-text-outline" size={24} color={COLORS.report} />
          </View>
          <View style={styles.recordInfo}>
            <Text style={styles.recordTitle}>{item.title}</Text>
            <Text style={styles.recordDate}>{item.date}</Text>
          </View>
          {item.attachments.length > 0 && (
            <Badge label={`${item.attachments.length}`} variant="primary" size="sm" />
          )}
        </View>
        <View style={styles.recordDetails}>
          {item.doctorName && (
            <View style={styles.detailRow}>
              <Ionicons name="person-outline" size={14} color={COLORS.textSecondary} />
              <Text style={styles.detailText}>{item.doctorName}</Text>
            </View>
          )}
          {item.hospitalName && (
            <View style={styles.detailRow}>
              <Ionicons name="business-outline" size={14} color={COLORS.textSecondary} />
              <Text style={styles.detailText}>{item.hospitalName}</Text>
            </View>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper safeArea padded={false}>
      <Header 
        title={folderName} 
        showBack
        rightIcon="add-circle-outline"
        onRightPress={() => router.push(`/my-reports/add?folderId=${id}`)}
      />

      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search records..."
      />

      <FlatList
        data={filteredRecords}
        renderItem={renderRecord}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="document-outline"
            title="No Records Found"
            description="Add your first health record to this folder."
            actionLabel="Add Record"
            onAction={() => router.push(`/my-reports/add?folderId=${id}`)}
          />
        }
      />
    </ScreenWrapper>
  );
};
