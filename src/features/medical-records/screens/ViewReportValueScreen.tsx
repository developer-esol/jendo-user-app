import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Platform, Linking, Modal, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../common/components/layout';
import { COLORS } from '../../../config/theme.config';
import { reportApi, ReportItemValue, ReportAttachment } from '../services/reportApi';
import { useToast } from '../../../providers/ToastProvider';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { authService } from '../../../services/authService';

export const ViewReportValueScreen: React.FC = () => {
  const router = useRouter();
  const { showToast } = useToast();
  const { categoryId, sectionId, itemId, valueId, itemName, sectionName } = useLocalSearchParams<{ 
    categoryId: string;
    sectionId: string;
    itemId: string;
    valueId: string;
    itemName: string;
    sectionName: string;
  }>();
  
  const [value, setValue] = useState<ReportItemValue | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    loadValue();
  }, [valueId]);

  const loadValue = async () => {
    try {
      setLoading(true);
      const values = await reportApi.getValuesByItem(Number(itemId));
      const foundValue = values.find(v => v.id === Number(valueId));
      setValue(foundValue || null);
    } catch (err: any) {
      console.error('Error loading value:', err);
      showToast('Failed to load record', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    router.push({
      pathname: '/my-reports/[categoryId]/[sectionId]/[itemId]/edit/[valueId]',
      params: { 
        categoryId: categoryId || '',
        sectionId: sectionId || '',
        itemId: itemId || '',
        valueId: valueId || '',
        itemName: itemName || '',
        sectionName: sectionName || ''
      }
    } as any);
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

  const handleDownloadAttachment = async (attachment: ReportAttachment) => {
    try {
      if (Platform.OS === 'web') {
        // Use authenticated download for web
        const fileName = attachment.fileUrl.split('/').pop() || `attachment-${attachment.id}`;
        await reportApi.downloadAttachment(attachment.id, fileName);
        showToast('Attachment downloaded successfully', 'success');
      } else {
        // For mobile, use react-native-blob-util with authentication
        const token = await authService.getStoredToken();
        const downloadUrl = reportApi.getAttachmentDownloadUrl(attachment.id);
        
        const { config, fs } = ReactNativeBlobUtil;
        const documentsDir = Platform.OS === 'ios' 
          ? fs.dirs.DocumentDir 
          : fs.dirs.DownloadDir;
        
        const fileName = attachment.fileUrl.split('/').pop() || `attachment-${attachment.id}`;
        const filePath = `${documentsDir}/${fileName}`;
        
        const configOptions = Platform.select({
          ios: {
            fileCache: true,
            path: filePath,
            appendExt: attachment.fileType?.includes('pdf') ? 'pdf' : 'jpg',
          },
          android: {
            addAndroidDownloads: {
              useDownloadManager: true,
              notification: true,
              path: filePath,
              description: 'Downloading report attachment',
              title: fileName,
              mime: attachment.fileType || 'application/octet-stream',
            },
          },
        });

        ReactNativeBlobUtil.config(configOptions || {})
          .fetch('GET', downloadUrl, {
            Authorization: `Bearer ${token}`,
          })
          .then((res) => {
            if (Platform.OS === 'ios') {
              ReactNativeBlobUtil.ios.openDocument(res.path());
            }
            showToast('Attachment downloaded successfully', 'success');
          })
          .catch((error) => {
            console.error('Download error:', error);
            showToast('Failed to download attachment', 'error');
          });
      }
    } catch (error: any) {
      console.error('Download error:', error);
      showToast(error.message || 'Failed to download attachment', 'error');
    }
  };

  const handleViewAttachment = async (attachment: ReportAttachment) => {
    try {
      if (Platform.OS === 'web') {
        // Use authenticated view for web - opens in new tab
        await reportApi.viewAttachment(attachment.id);
      } else {
        // For mobile, download to temp location and open immediately
        const token = await authService.getStoredToken();
        const downloadUrl = reportApi.getAttachmentDownloadUrl(attachment.id);
        
        const { config, fs } = ReactNativeBlobUtil;
        const fileName = attachment.fileUrl.split('/').pop() || `attachment-${attachment.id}`;
        const fileExt = attachment.fileType?.includes('pdf') ? 'pdf' : 'jpg';
        
        // Use cache directory for viewing
        const cacheDir = Platform.OS === 'ios' ? fs.dirs.CacheDir : fs.dirs.CacheDir;
        const filePath = `${cacheDir}/${fileName}`;
        
        showToast('Opening attachment...', 'info');
        
        ReactNativeBlobUtil.config({
          fileCache: true,
          path: filePath,
          appendExt: fileExt,
        })
          .fetch('GET', downloadUrl, {
            Authorization: `Bearer ${token}`,
          })
          .then((res) => {
            // Open the file immediately after download
            if (Platform.OS === 'ios') {
              ReactNativeBlobUtil.ios.openDocument(res.path());
            } else {
              // For Android, use file opener
              ReactNativeBlobUtil.android.actionViewIntent(
                res.path(),
                attachment.fileType || 'application/octet-stream'
              );
            }
          })
          .catch((error) => {
            console.error('View error:', error);
            showToast('Failed to open attachment', 'error');
          });
      }
    } catch (error: any) {
      console.error('View error:', error);
      showToast(error.message || 'Failed to view attachment', 'error');
    }
  };

  const formatDateSriLanka = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      timeZone: 'Asia/Colombo',
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTimeSriLanka = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-GB', {
      timeZone: 'Asia/Colombo',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
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

  if (!value) {
    return (
      <ScreenWrapper safeArea backgroundColor={COLORS.background}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Ionicons name="document-text-outline" size={64} color={COLORS.textSecondary} />
          <Text style={{ marginTop: 16, fontSize: 18, fontWeight: '600', color: COLORS.text }}>
            Record not found
          </Text>
          <TouchableOpacity 
            style={{ marginTop: 16, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: COLORS.primary, borderRadius: 8 }}
            onPress={() => router.back()}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>Go Back</Text>
          </TouchableOpacity>
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
            Record Details
          </Text>
          <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>
            {itemName}
          </Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16 }}
      >
        <View style={{
          backgroundColor: '#fff',
          borderRadius: 12,
          padding: 20,
          marginBottom: 16,
        }}>
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 4 }}>
              DATE RECORDED
            </Text>
            <Text style={{ fontSize: 16, fontWeight: '600', color: COLORS.text }}>
              {formatDateSriLanka(value.createdAt)}
            </Text>
            <Text style={{ fontSize: 14, color: COLORS.textSecondary }}>
              at {formatTimeSriLanka(value.createdAt)}
            </Text>
          </View>

          {(value.valueNumber !== null && value.valueNumber !== undefined) && (
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 4 }}>
                VALUE
              </Text>
              <Text style={{ fontSize: 32, fontWeight: '700', color: COLORS.primary }}>
                {value.valueNumber}
              </Text>
            </View>
          )}

          {value.valueText && (
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 4 }}>
                NOTES
              </Text>
              <Text style={{ fontSize: 16, color: COLORS.text, lineHeight: 24 }}>
                {value.valueText}
              </Text>
            </View>
          )}
        </View>

        {value.attachments && value.attachments.length > 0 && (
          <View style={{
            backgroundColor: '#fff',
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
          }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: COLORS.text, marginBottom: 12 }}>
              Attachments ({value.attachments.length})
            </Text>
            {value.attachments.map((attachment) => (
              <View
                key={attachment.id}
                style={{
                  backgroundColor: '#f5f5f5',
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 8,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Ionicons 
                    name={attachment.fileType?.includes('pdf') ? 'document-text' : 'image'} 
                    size={28} 
                    color={COLORS.primary} 
                  />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={{ fontSize: 14, fontWeight: '500', color: COLORS.text }} numberOfLines={1}>
                      {attachment.fileUrl.split('/').pop()}
                    </Text>
                    <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>
                      {attachment.fileType || 'Unknown type'}
                    </Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: COLORS.primary,
                      borderRadius: 6,
                      paddingVertical: 10,
                      paddingHorizontal: 12,
                    }}
                    onPress={() => handleViewAttachment(attachment)}
                  >
                    <Ionicons name="eye-outline" size={18} color="#fff" />
                    <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14, marginLeft: 6 }}>
                      View
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#10B981',
                      borderRadius: 6,
                      paddingVertical: 10,
                      paddingHorizontal: 12,
                    }}
                    onPress={() => handleDownloadAttachment(attachment)}
                  >
                    <Ionicons name="download-outline" size={18} color="#fff" />
                    <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14, marginLeft: 6 }}>
                      Download
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {value.updatedAt !== value.createdAt && (
          <View style={{
            backgroundColor: '#f5f5f5',
            borderRadius: 8,
            padding: 12,
            marginBottom: 16,
          }}>
            <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>
              Last updated: {formatDateSriLanka(value.updatedAt)} at {formatTimeSriLanka(value.updatedAt)}
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={{
        padding: 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        flexDirection: 'row',
        gap: 12,
      }}>
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: COLORS.primary,
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
          }}
          onPress={handleEdit}
        >
          <Ionicons name="pencil" size={20} color="#fff" />
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16, marginLeft: 8 }}>
            Edit
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: '#ffebee',
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
          }}
          onPress={() => setShowDeleteModal(true)}
          disabled={deleting}
        >
          {deleting ? (
            <ActivityIndicator color={COLORS.error} size="small" />
          ) : (
            <>
              <Ionicons name="trash-outline" size={20} color={COLORS.error} />
              <Text style={{ color: COLORS.error, fontWeight: '700', fontSize: 16, marginLeft: 8 }}>
                Delete
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
    </ScreenWrapper>
  );
};
