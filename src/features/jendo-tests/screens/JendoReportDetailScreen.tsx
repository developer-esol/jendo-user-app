import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Linking, Platform, Alert, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../common/components/layout';
import { COLORS } from '../../../config/theme.config';
import { jendoReportApi, JendoReport } from '../services/jendoReportApi';
import Pdf from 'react-native-pdf';
import { WebView } from 'react-native-webview';
import { authService } from '../../../services/authService';

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    timeZone: 'Asia/Colombo',
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
};

export const JendoReportDetailScreen: React.FC = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [report, setReport] = useState<JendoReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [outerScrollEnabled, setOuterScrollEnabled] = useState(true);

  useEffect(() => {
    loadReportDetails();
  }, [id]);

  const loadReportDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch auth token for PDF viewer
      const token = await authService.getStoredToken();
      setAuthToken(token);
      
      const reportData = await jendoReportApi.getReportById(id as string);
      if (reportData) {
        setReport(reportData);
      } else {
        Alert.alert('Error', 'Report not found');
        router.back();
      }
    } catch (error: any) {
      console.error('Error loading report details:', error);
      Alert.alert('Error', 'Failed to load report details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!report) return;
    
    setDownloading(true);
    try {
      const downloadUrl = jendoReportApi.getDownloadUrl(report.id);
      
      if (Platform.OS === 'web') {
        // Create a temporary anchor element to trigger download
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = report.originalFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        Alert.alert('Success', 'Report download started.');
      } else {
        // On mobile, open URL which will prompt download/save
        await Linking.openURL(downloadUrl);
        Alert.alert('Success', 'Report download started. Check your downloads folder.');
      }
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'Failed to download report. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <ScreenWrapper safeArea backgroundColor="#FFFFFF">
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={{ flex: 1, fontSize: 20, fontWeight: '700', color: '#1F2937', textAlign: 'center' }}>
            Loading...
          </Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ marginTop: 12, color: '#6B7280' }}>Loading report details...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (!report) {
    return null;
  }

  const pdfSourceUri = jendoReportApi.getDownloadUrl(report.id);

  const renderPdfViewer = () => {
    if (pdfError) {
      return (
        <View style={styles.pdfErrorContainer}>
          <Ionicons name="warning" size={20} color="#B91C1C" />
          <Text style={styles.pdfErrorTitle}>Unable to load preview</Text>
          <Text style={styles.pdfErrorText}>{pdfError}</Text>
        </View>
      );
    }

    if (Platform.OS === 'web') {
      return (
        <WebView
          originWhitelist={["*"]}
          source={{ 
            uri: pdfSourceUri,
            headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : undefined
          }}
          startInLoadingState
          renderLoading={() => (
            <ActivityIndicator style={styles.pdfLoader} color={COLORS.primary} />
          )}
          onError={(syntheticEvent) => {
            console.error('Web PDF render error:', syntheticEvent.nativeEvent);
            setPdfError('Preview is unavailable. Use the download button below.');
          }}
          style={styles.pdf}
        />
      );
    }

    return (
      <View
        style={styles.pdfWrapper}
        onStartShouldSetResponderCapture={() => { setOuterScrollEnabled(false); return false; }}
        onResponderRelease={() => setOuterScrollEnabled(true)}
        onResponderTerminate={() => setOuterScrollEnabled(true)}
      >
        <Pdf
          trustAllCerts={false}
          source={{ 
            uri: pdfSourceUri, 
            cache: true,
            headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : undefined
          }}
          renderActivityIndicator={() => (
            <ActivityIndicator style={styles.pdfLoader} color={COLORS.primary} />
          )}
          onLoadComplete={(numberOfPages: number) => {
            setTotalPages(numberOfPages);
            console.log(`PDF loaded with ${numberOfPages} pages`);
          }}
          onPageChanged={(page: number) => {
            setCurrentPage(page);
          }}
          onError={(error) => {
            console.error('PDF render error:', error);
            setPdfError('Preview is unavailable. Use the download button below.');
          }}
          enablePaging={false}
          horizontal={false}
          spacing={8}
          style={styles.pdf}
        />
      </View>
    );
  };

  return (
    <ScreenWrapper safeArea backgroundColor="#FFFFFF">
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Report Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        scrollEnabled={outerScrollEnabled}
      >
        <View style={styles.pdfContainer}>
          {renderPdfViewer()}
        </View>
        {totalPages > 0 && (
          <View style={styles.pageIndicator}>
            <Text style={styles.pageText}>Page {currentPage} of {totalPages}</Text>
            {totalPages > 1 && (
              <Text style={styles.pageHint}>Swipe to navigate pages</Text>
            )}
          </View>
        )}
        <Text style={styles.pdfTitle}>Jendo Vascular Health Report</Text>
        <Text style={styles.pdfMeta}>{formatFileSize(report.fileSize)}</Text>

        {/* Report Information */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>
            Report Information
          </Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Report ID:</Text>
            <Text style={styles.infoValue}>#{report.id}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Uploaded On:</Text>
            <Text style={styles.infoValue}>
              {formatDate(report.uploadedAt)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>File Name:</Text>
            <Text style={styles.infoValue}>
              {report.fileName}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>File Type:</Text>
            <Text style={styles.infoValue}>
              {report.contentType}
            </Text>
          </View>

          {report.description && (
            <View>
              <Text style={styles.infoLabel}>Description:</Text>
              <Text style={styles.infoValue}>
                {report.description}
              </Text>
            </View>
          )}
        </View>

        {/* Important Notice */}
        <View style={styles.noticeCard}>
          <View style={styles.noticeHeader}>
            <Ionicons name="information-circle" size={20} color="#1E40AF" />
            <Text style={styles.noticeTitle}>
              Important Information
            </Text>
          </View>
          <Text style={styles.noticeText}>
            This is an official Jendo health report. Please consult with a qualified healthcare professional 
            for proper interpretation and medical advice regarding the contents of this report.
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleDownload}
          disabled={downloading}
          style={styles.downloadButton}
        >
          {downloading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <MaterialCommunityIcons name="download" size={20} color="#FFFFFF" />
              <Text style={styles.downloadText}>
                Download Report
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  pdfContainer: {
    height: 550,
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F3F4F6',
    marginBottom: 8,
  },
  pdfWrapper: {
    flex: 1,
    height: '100%',
  },
  pageIndicator: {
    alignItems: 'center',
    marginBottom: 8,
  },
  pageText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  pageHint: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  pdf: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
  },
  pdfLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pdfErrorContainer: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  pdfErrorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  pdfErrorText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  pdfTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 8,
    textAlign: 'center',
  },
  pdfMeta: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 16,
    textAlign: 'center',
  },
  infoCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  infoRow: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    lineHeight: 20,
  },
  noticeCard: {
    backgroundColor: '#DBEAFE',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  noticeTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E40AF',
    marginLeft: 8,
  },
  noticeText: {
    fontSize: 11,
    color: '#1E40AF',
    lineHeight: 16,
  },
  downloadButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  downloadText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
