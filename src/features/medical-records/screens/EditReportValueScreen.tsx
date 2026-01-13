import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Platform, Linking, Modal } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../common/components/layout';
import { COLORS } from '../../../config/theme.config';
import { reportApi, ReportItemValue, ReportAttachment } from '../services/reportApi';
import { useToast } from '../../../providers/ToastProvider';

export const EditReportValueScreen: React.FC = () => {
  const router = useRouter();
  const { showToast } = useToast();
  const { valueId, itemId, itemName } = useLocalSearchParams<{ 
    valueId: string;
    itemId: string;
    itemName: string;
  }>();
  
  const [valueNumber, setValueNumber] = useState('');
  const [valueText, setValueText] = useState('');
  const [existingAttachments, setExistingAttachments] = useState<ReportAttachment[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteAttachmentModal, setShowDeleteAttachmentModal] = useState(false);
  const [attachmentToDelete, setAttachmentToDelete] = useState<number | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadValue();
  }, [valueId]);

  const loadValue = async () => {
    try {
      setLoading(true);
      const values = await reportApi.getValuesByItem(Number(itemId));
      const value = values.find(v => v.id === Number(valueId));
      
      if (value) {
        if (value.valueNumber !== null && value.valueNumber !== undefined) {
          setValueNumber(value.valueNumber.toString());
        }
        if (value.valueText) {
          setValueText(value.valueText);
        }
        setExistingAttachments(value.attachments || []);
      }
    } catch (err: any) {
      console.error('Error loading value:', err);
      showToast('Failed to load record', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const data: any = {
        reportItemId: Number(itemId),
      };
      
      if (valueNumber.trim()) {
        const numValue = parseFloat(valueNumber);
        if (!isNaN(numValue)) {
          data.valueNumber = numValue;
        }
      } else {
        data.valueNumber = null;
      }
      
      data.valueText = valueText.trim() || null;
      
      await reportApi.updateValue(Number(valueId), data);
      
      for (const file of selectedFiles) {
        await reportApi.uploadAttachment(Number(valueId), file);
      }
      
      showToast('Record updated successfully', 'success');
      router.back();
    } catch (err: any) {
      console.error('Error updating record:', err);
      showToast(err.message || 'Failed to update record', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setShowDeleteModal(false);
    try {
      setDeleting(true);
      await reportApi.deleteValue(Number(valueId));
      showToast('Record deleted successfully', 'success');
      router.back();
    } catch (err: any) {
      console.error('Error deleting record:', err);
      showToast(err.message || 'Failed to delete record', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const confirmDeleteAttachment = (attachmentId: number) => {
    setAttachmentToDelete(attachmentId);
    setShowDeleteAttachmentModal(true);
  };

  const handleDeleteAttachmentConfirm = async () => {
    if (!attachmentToDelete) return;
    
    setShowDeleteAttachmentModal(false);
    try {
      await reportApi.deleteAttachment(attachmentToDelete);
      setExistingAttachments(prev => prev.filter(a => a.id !== attachmentToDelete));
      showToast('Attachment deleted', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete attachment', 'error');
    }
    setAttachmentToDelete(null);
  };

  const handleDownloadAttachment = async (attachmentId: number) => {
    const url = reportApi.getAttachmentDownloadUrl(attachmentId);
    if (Platform.OS === 'web') {
      window.open(url, '_blank');
    } else {
      await Linking.openURL(url);
    }
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

  if (loading) {
    return (
      <ScreenWrapper safeArea backgroundColor={COLORS.background}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ marginTop: 16, color: COLORS.textSecondary }}>Loading...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper safeArea backgroundColor={COLORS.background}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
      }}>
        <TouchableOpacity 
          style={{ padding: 8, marginRight: 8 }} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.text }}>
            Edit Record
          </Text>
          <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>
            {itemName}
          </Text>
        </View>
        <TouchableOpacity 
          style={{ padding: 8 }}
          onPress={() => router.push('/notifications' as any)}
        >
          <Ionicons name="notifications" size={24} color={COLORS.primary} />
          <View style={{
            position: 'absolute',
            top: 4,
            right: 4,
            backgroundColor: COLORS.error,
            width: 16,
            height: 16,
            borderRadius: 8,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <Text style={{ color: '#fff', fontSize: 10, fontWeight: '600' }}>3</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16 }}
      >
        <View style={{
          backgroundColor: '#fff',
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
        }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: COLORS.text, marginBottom: 12 }}>
            Value
          </Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#ddd',
              borderRadius: 8,
              padding: 14,
              fontSize: 18,
              color: COLORS.text,
            }}
            value={valueNumber}
            onChangeText={setValueNumber}
            placeholder="Enter numeric value (e.g., 95.5)"
            placeholderTextColor={COLORS.placeholder}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={{
          backgroundColor: '#fff',
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
        }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: COLORS.text, marginBottom: 12 }}>
            Notes
          </Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#ddd',
              borderRadius: 8,
              padding: 14,
              fontSize: 16,
              color: COLORS.text,
              minHeight: 100,
              textAlignVertical: 'top',
            }}
            value={valueText}
            onChangeText={setValueText}
            placeholder="Enter any notes or additional information"
            placeholderTextColor={COLORS.placeholder}
            multiline
          />
        </View>

        {existingAttachments.length > 0 && (
          <View style={{
            backgroundColor: '#fff',
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
          }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: COLORS.text, marginBottom: 12 }}>
              Attachments
            </Text>
            {existingAttachments.map((attachment) => (
              <View
                key={attachment.id}
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
                  name={attachment.fileType?.includes('pdf') ? 'document-text' : 'image'} 
                  size={24} 
                  color={COLORS.primary} 
                />
                <Text style={{ flex: 1, marginLeft: 12, fontSize: 14, color: COLORS.text }} numberOfLines={1}>
                  {attachment.fileUrl.split('/').pop()}
                </Text>
                <TouchableOpacity 
                  style={{ padding: 4, marginRight: 8 }}
                  onPress={() => handleDownloadAttachment(attachment.id)}
                >
                  <Ionicons name="download-outline" size={20} color={COLORS.primary} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={{ padding: 4 }}
                  onPress={() => confirmDeleteAttachment(attachment.id)}
                >
                  <Ionicons name="trash-outline" size={20} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <View style={{
          backgroundColor: '#fff',
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
        }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: COLORS.text, marginBottom: 12 }}>
            Add Attachment
          </Text>
          
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
            <View style={{ marginBottom: 12 }}>
              {selectedFiles.map((file, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#e8f5e9',
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
          
          <TouchableOpacity
            style={{
              borderWidth: 2,
              borderColor: '#ddd',
              borderStyle: 'dashed',
              borderRadius: 8,
              padding: 24,
              alignItems: 'center',
            }}
            onPress={handleFileSelect}
          >
            <Ionicons name="cloud-upload-outline" size={40} color={COLORS.textSecondary} />
            <Text style={{ marginTop: 8, fontSize: 14, color: COLORS.textSecondary }}>
              Tap to upload PDF or Image
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={{
            backgroundColor: '#ffebee',
            paddingVertical: 16,
            borderRadius: 12,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            marginBottom: 16,
          }}
          onPress={() => setShowDeleteModal(true)}
          disabled={deleting}
        >
          {deleting ? (
            <ActivityIndicator color={COLORS.error} size="small" />
          ) : (
            <>
              <Ionicons name="trash-outline" size={22} color={COLORS.error} />
              <Text style={{ color: COLORS.error, fontWeight: '700', fontSize: 16, marginLeft: 8 }}>
                Delete Record
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      <View style={{
        padding: 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
      }}>
        <TouchableOpacity
          style={{
            backgroundColor: saving ? COLORS.textSecondary : COLORS.primary,
            paddingVertical: 16,
            borderRadius: 12,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
          }}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16, marginLeft: 8 }}>
                Saving...
              </Text>
            </>
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={22} color="#fff" />
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16, marginLeft: 8 }}>
                Save Changes
              </Text>
            </>
          )}
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
                onPress={() => setShowDeleteModal(false)}
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

      <Modal
        visible={showDeleteAttachmentModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteAttachmentModal(false)}
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
                <Ionicons name="document-text" size={28} color={COLORS.error} />
              </View>
              <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.text, textAlign: 'center' }}>
                Delete Attachment?
              </Text>
            </View>
            <Text style={{ fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 24, lineHeight: 20 }}>
              Are you sure you want to delete this attachment?
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
                  setShowDeleteAttachmentModal(false);
                  setAttachmentToDelete(null);
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
                onPress={handleDeleteAttachmentConfirm}
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
