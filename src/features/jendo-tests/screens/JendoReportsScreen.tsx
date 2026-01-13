import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Image, ActivityIndicator, Modal, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../common/components/layout';
import { EmptyState } from '../../../common/components/ui';
import { COLORS } from '../../../config/theme.config';
import { jendoReportApi, JendoReport } from '../services/jendoReportApi';
import { jendoStyles as styles } from '../components';
import { useAuth } from '../../../providers/AuthProvider';

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    timeZone: 'Asia/Colombo',
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
};

export const JendoReportsScreen: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [reports, setReports] = useState<JendoReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReports();
  }, [user]);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);

      if (user?.id) {
        console.log('Fetching Jendo reports for user:', user.id);
        const response = await jendoReportApi.getReportsByUserId(Number(user.id));
        console.log('Received reports:', response);
        setReports(response);
      } else {
        setReports([]);
      }
    } catch (err: any) {
      console.error('Error loading Jendo reports:', err);
      setError(err.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter(report => {
    if (searchQuery) {
      const dateStr = formatDate(report.uploadedAt);
      const fileName = report.originalFileName.toLowerCase();
      const description = report.description?.toLowerCase() || '';
      const query = searchQuery.toLowerCase();
      
      return dateStr.toLowerCase().includes(query) || 
             fileName.includes(query) ||
             description.includes(query);
    }
    return true;
  });

  const renderReportItem = ({ item }: { item: JendoReport }) => (
    <TouchableOpacity
      onPress={() => router.push(`/jendo-reports/${item.id}`)}
      activeOpacity={0.7}
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 4 }}>
            {formatDate(item.uploadedAt)}
          </Text>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 4 }}>
            Jendo Vascular Health Report
          </Text>
          {item.description && (
            <Text style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }} numberOfLines={2}>
              {item.description}
            </Text>
          )}
        </View>
        <View style={{ marginLeft: 12, alignItems: 'flex-end' }}>
          <MaterialCommunityIcons name="file-pdf-box" size={32} color="#EF4444" />
          <Text style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>
            {formatFileSize(item.fileSize)}
          </Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 8 }}>
        <Text style={{ fontSize: 12, color: COLORS.primary, fontWeight: '500', marginRight: 4 }}>
          View Report
        </Text>
        <Ionicons name="chevron-forward" size={18} color={COLORS.primary} />
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper safeArea backgroundColor="#FFFFFF">
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
      }}>
        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#F3E8FF', alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="finger-print" size={24} color={COLORS.primary} />
        </View>
        <Text style={{ fontSize: 20, fontWeight: '700', color: COLORS.primary }}>Jendo Reports</Text>
        <TouchableOpacity 
          onPress={() => router.push('/notifications')}
          style={{ position: 'relative' }}
        >
          <Ionicons name="notifications" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
      
      <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#F3F4F6',
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: 10,
        }}>
          <Ionicons name="search-outline" size={20} color="#9CA3AF" />
          <TextInput
            style={{ flex: 1, marginLeft: 8, fontSize: 16, color: '#1F2937' }}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search reports..."
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ marginTop: 12, color: '#6B7280' }}>Loading your Jendo reports...</Text>
        </View>
      ) : error ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#1F2937', marginTop: 16 }}>Error Loading Reports</Text>
          <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 8, textAlign: 'center' }}>{error}</Text>
          <TouchableOpacity 
            style={{ backgroundColor: COLORS.primary, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12, marginTop: 16 }}
            onPress={loadReports}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredReports}
          renderItem={renderReportItem}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon="document-text-outline"
              title="No Reports Found"
              description={reports.length === 0 ? "No Jendo reports have been uploaded yet." : "No reports match your search criteria."}
            />
          }
        />
      )}
    </ScreenWrapper>
  );
};
