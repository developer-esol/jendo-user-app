import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../common/components/layout';
import { COLORS } from '../../../config/theme.config';
import { medicalRecordsStyles as styles } from '../components';
import { reportApi, ReportItemValue } from '../services/reportApi';
import { useToast } from '../../../providers/ToastProvider';

export const ItemDetailScreen: React.FC = () => {
  const router = useRouter();
  const { showToast } = useToast();
  const { categoryId, sectionId, itemId, itemName, sectionName } = useLocalSearchParams<{ 
    categoryId: string; 
    sectionId: string; 
    itemId: string;
    itemName: string;
    sectionName: string;
  }>();
  
  const [values, setValues] = useState<ReportItemValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [valueToDelete, setValueToDelete] = useState<ReportItemValue | null>(null);

  const loadValues = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportApi.getValuesByItem(Number(itemId));
      setValues(data.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } catch (err: any) {
      console.error('Error loading values:', err);
      setError(err.message || 'Failed to load records');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (itemId) {
        loadValues();
      }
    }, [itemId])
  );

  const handleAddRecord = () => {
    router.push({
      pathname: '/my-reports/[categoryId]/[sectionId]/[itemId]/add',
      params: { 
        categoryId: categoryId || '',
        sectionId: sectionId || '',
        itemId: itemId || '',
        itemName: itemName || '',
        sectionName: sectionName || ''
      }
    } as any);
  };

  const handleViewRecord = (value: ReportItemValue) => {
    router.push({
      pathname: '/my-reports/[categoryId]/[sectionId]/[itemId]/view/[valueId]',
      params: { 
        categoryId: categoryId || '',
        sectionId: sectionId || '',
        itemId: itemId || '',
        valueId: value.id.toString(),
        itemName: itemName || '',
        sectionName: sectionName || ''
      }
    } as any);
  };

  const confirmDelete = (value: ReportItemValue) => {
    setValueToDelete(value);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!valueToDelete) return;
    
    setShowDeleteModal(false);
    try {
      await reportApi.deleteValue(valueToDelete.id);
      setValues(prev => prev.filter(v => v.id !== valueToDelete.id));
      showToast('Record deleted successfully', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete record', 'error');
    }
    setValueToDelete(null);
  };

  const formatValue = (value: ReportItemValue) => {
    if (value.valueNumber !== null && value.valueNumber !== undefined) {
      return value.valueNumber.toString();
    }
    if (value.valueText) {
      return value.valueText;
    }
    if (value.valueDate) {
      return new Date(value.valueDate).toLocaleDateString('en-GB', {
        timeZone: 'Asia/Colombo',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    }
    return '-';
  };

  const formatDateSriLanka = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      timeZone: 'Asia/Colombo',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getNotes = (value: ReportItemValue) => {
    if (value.valueText) {
      return value.valueText;
    }
    return '-';
  };

  return (
    <ScreenWrapper safeArea backgroundColor={COLORS.background}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{itemName || 'Test'} Records</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ marginTop: 16, color: COLORS.textSecondary }}>Loading records...</Text>
        </View>
      ) : error ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Ionicons name="alert-circle-outline" size={64} color={COLORS.error} />
          <Text style={{ marginTop: 16, color: COLORS.error, textAlign: 'center' }}>{error}</Text>
          <TouchableOpacity 
            style={{ marginTop: 16, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: COLORS.primary, borderRadius: 8 }}
            onPress={loadValues}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : values.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
          <Ionicons name="document-text-outline" size={64} color={COLORS.textSecondary} />
          <Text style={{ marginTop: 16, fontSize: 18, fontWeight: '600', color: COLORS.text }}>
            No records yet
          </Text>
          <Text style={{ marginTop: 8, color: COLORS.textSecondary, textAlign: 'center' }}>
            Tap the button below to add your first record
          </Text>
        </View>
      ) : (
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContentWithButton}
        >
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.dateColumn]}>Date</Text>
              <Text style={[styles.tableHeaderText, styles.valueColumn]}>Value</Text>
              <Text style={[styles.tableHeaderText, styles.notesColumn]}>Notes</Text>
              <Text style={[styles.tableHeaderText, { width: 50, textAlign: 'center' }]}>View</Text>
            </View>
            
            {values.map((value, index) => (
              <View
                key={value.id}
                style={[
                  styles.tableRow,
                  index % 2 === 0 && styles.tableRowEven,
                  { flexDirection: 'row', alignItems: 'center' }
                ]}
              >
                <Text style={[styles.tableCell, styles.dateColumn, styles.dateText]}>
                  {formatDateSriLanka(value.createdAt)}
                </Text>
                <Text style={[styles.tableCell, styles.valueColumn, styles.valueText]}>
                  {formatValue(value)}
                </Text>
                <Text style={[styles.tableCell, styles.notesColumn, styles.notesText]} numberOfLines={1}>
                  {getNotes(value)}
                </Text>
                <TouchableOpacity
                  style={{ width: 50, alignItems: 'center', justifyContent: 'center', paddingVertical: 8 }}
                  onPress={() => handleViewRecord(value)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="eye-outline" size={20} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddRecord}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={22} color="#fff" />
          <Text style={styles.addButtonText}>Add New {itemName || ''} Record</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}>
          <View style={{
            backgroundColor: '#fff',
            borderRadius: 16,
            padding: 24,
            width: '100%',
            maxWidth: 340,
          }}>
            <View style={{ alignItems: 'center', marginBottom: 16 }}>
              <View style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: '#ffebee',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 12,
              }}>
                <Ionicons name="trash-outline" size={28} color={COLORS.error} />
              </View>
              <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.text, textAlign: 'center' }}>
                Delete Record?
              </Text>
            </View>
            <Text style={{ fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 24, lineHeight: 20 }}>
              Are you sure you want to delete this record? This action cannot be undone.
            </Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 10,
                  backgroundColor: '#f5f5f5',
                  alignItems: 'center',
                }}
                onPress={() => {
                  setShowDeleteModal(false);
                  setValueToDelete(null);
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: '600', color: COLORS.text }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 10,
                  backgroundColor: COLORS.error,
                  alignItems: 'center',
                }}
                onPress={handleDeleteConfirm}
              >
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
};
