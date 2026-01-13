import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../common/components/layout';
import { COLORS } from '../../../config/theme.config';
import { medicalRecordsStyles as styles } from '../components';
import { reportApi } from '../services/reportApi';
import { useToast } from '../../../providers/ToastProvider';

export const AddReportValueScreen: React.FC = () => {
  const router = useRouter();
  const { showToast } = useToast();
  const { itemId, itemName } = useLocalSearchParams<{ 
    itemId: string;
    itemName: string;
  }>();
  
  const [valueNumber, setValueNumber] = useState('');
  const [valueText, setValueText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    if (!valueNumber.trim() && !valueText.trim() && selectedFiles.length === 0) {
      showToast('Please enter a value, notes, or attach a file', 'error');
      return;
    }

    try {
      setSaving(true);
      
      const data: any = {
        reportItemId: Number(itemId),
        valueDate: new Date().toISOString().split('T')[0],
      };
      
      if (valueNumber.trim()) {
        const numValue = parseFloat(valueNumber);
        if (!isNaN(numValue)) {
          data.valueNumber = numValue;
        }
      }
      
      if (valueText.trim()) {
        data.valueText = valueText.trim();
      }
      
      const createdValue = await reportApi.createValue(data);
      
      for (const file of selectedFiles) {
        if (createdValue) {
          await reportApi.uploadAttachment(createdValue.id, file);
        }
      }
      
      showToast('Record saved successfully', 'success');
      router.back();
    } catch (err: any) {
      console.error('Error saving record:', err);
      showToast(err.message || 'Failed to save record', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const handleFileSelect = async () => {
    if (Platform.OS === 'web' && fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      try {
        const result = await DocumentPicker.getDocumentAsync({
          type: ['image/*', 'application/pdf'],
          multiple: true,
          copyToCacheDirectory: true,
        });
        
        if (!result.canceled && result.assets) {
          const files = result.assets.map(asset => ({
            uri: asset.uri,
            name: asset.name,
            type: asset.mimeType || 'application/octet-stream',
            size: asset.size,
          }));
          setSelectedFiles(prev => [...prev, ...files as any]);
        }
      } catch (error) {
        console.error('Error picking document:', error);
        showToast('Failed to select file', 'error');
      }
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setSelectedFiles(prev => [...prev, ...Array.from(files)]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <ScreenWrapper safeArea backgroundColor={COLORS.background}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
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
            <Text style={styles.sectionTitle}>{itemName || 'Test'}</Text>
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{itemName || 'Value'}</Text>
            <TextInput
              style={styles.input}
              value={valueNumber}
              onChangeText={setValueNumber}
              placeholder="Enter value"
              placeholderTextColor={COLORS.placeholder || '#999'}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Notes</Text>
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
              value={valueText}
              onChangeText={setValueText}
              placeholder="Enter any notes or additional information"
              placeholderTextColor={COLORS.placeholder || '#999'}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        <View style={styles.formSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="attach" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Attachments</Text>
          </View>
          
          {Platform.OS === 'web' && (
            <input
              ref={fileInputRef as any}
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileChange as any}
              multiple
              style={{ display: 'none' }}
            />
          )}

          {selectedFiles.length > 0 && (
            <View style={{ marginBottom: 16 }}>
              {selectedFiles.map((file, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#f5f5f5',
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 8,
                  }}
                >
                  <Ionicons 
                    name={file.type?.includes('pdf') ? 'document-text' : 'image'} 
                    size={24} 
                    color={COLORS.primary} 
                  />
                  <Text style={{ flex: 1, marginLeft: 12, fontSize: 14, color: COLORS.text }} numberOfLines={1}>
                    {file.name}
                  </Text>
                  <TouchableOpacity onPress={() => removeFile(index)}>
                    <Ionicons name="close-circle" size={24} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
          
          <View style={styles.uploadContainer}>
            <TouchableOpacity style={styles.uploadArea} onPress={handleFileSelect}>
              <View style={styles.uploadIconContainer}>
                <Ionicons name="cloud-upload-outline" size={40} color={COLORS.textSecondary} />
              </View>
              <Text style={styles.uploadTitle}>Drag & drop files here</Text>
              <Text style={styles.uploadSubtitle}>or click to browse</Text>
              <View style={styles.chooseFilesButton}>
                <Text style={styles.chooseFilesText}>Choose Files</Text>
              </View>
              <Text style={styles.supportedFormats}>Supports images and PDFs</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View style={styles.buttonContainerRow}>
        <TouchableOpacity
          style={[styles.saveButton, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.saveButtonText}>Save Report</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancel}
          disabled={saving}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
};
