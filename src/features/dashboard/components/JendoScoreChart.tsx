import React, { useMemo } from 'react';
import { View, Text, Dimensions, Platform } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { COLORS } from '../../../config/theme.config';

const { width } = Dimensions.get('window');

interface ScoreHistoryItem {
  date: string;
  value: number;
}

interface JendoScoreChartProps {
  data: ScoreHistoryItem[];
  containerStyle?: any;
}

export const JendoScoreChart: React.FC<JendoScoreChartProps> = ({ data, containerStyle }) => {
  const chartData = useMemo(() => {
    if (data.length === 0) return [];
    
    return data.map((item, index) => ({
      value: item.value,
      label: item.date,
      dataPointText: String(item.value),
      labelComponent: () => (
        <Text style={{ 
          fontSize: 10, 
          color: COLORS.textSecondary, 
          fontWeight: '500',
          width: 50,
          textAlign: 'center',
          marginLeft: -20
        }}>
          {item.date}
        </Text>
      ),
      customDataPoint: () => (
        <View style={{
          width: index === data.length - 1 ? 12 : 8,
          height: index === data.length - 1 ? 12 : 8,
          borderRadius: index === data.length - 1 ? 6 : 4,
          backgroundColor: index === data.length - 1 ? COLORS.white : COLORS.primary,
          borderWidth: index === data.length - 1 ? 3 : 2,
          borderColor: COLORS.primary,
          ...Platform.select({
            ios: {
              shadowColor: COLORS.primary,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 3,
            },
            android: {
              elevation: 3,
            },
          }),
        }} />
      ),
    }));
  }, [data]);

  const values = data.map(d => d.value);
  const maxValue = Math.max(...values) + 10;
  const minValue = Math.max(0, Math.min(...values) - 10);
  const chartWidth = Math.min(width - 80, 600); // Max width for web

  return (
    <View style={[{
      height: 180,
      backgroundColor: '#F8FAFC',
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'visible',
    }, containerStyle]}>
      <LineChart
        data={chartData}
        width={chartWidth}
        height={140}
        spacing={chartData.length > 1 ? Math.max(40, chartWidth / chartData.length) : chartWidth / 2}
        initialSpacing={20}
        endSpacing={20}
        adjustToWidth={true}
        thickness={3}
        color={COLORS.primary}
        startFillColor={`${COLORS.primary}20`}
        endFillColor={`${COLORS.primary}05`}
        startOpacity={0.3}
        endOpacity={0.1}
        areaChart
        curved
        hideDataPoints={false}
        dataPointsHeight={8}
        dataPointsWidth={8}
        dataPointsColor={COLORS.primary}
        textColor1={COLORS.textPrimary}
        textShiftY={-8}
        textShiftX={0}
        textFontSize={11}
        hideRules
        hideYAxisText={false}
        yAxisColor={COLORS.border}
        yAxisThickness={1}
        xAxisColor={COLORS.border}
        xAxisThickness={1}
        yAxisTextStyle={{
          color: COLORS.textSecondary,
          fontSize: 11,
          fontWeight: '500',
        }}
        xAxisLabelTextStyle={{
          color: COLORS.textSecondary,
          fontSize: 10,
          fontWeight: '500',
        }}
        rulesType="solid"
        rulesColor={`${COLORS.border}40`}
        showVerticalLines={false}
        verticalLinesColor={`${COLORS.border}20`}
        noOfSections={4}
        maxValue={maxValue}
        yAxisLabelWidth={36}
        yAxisOffset={minValue}
        animateOnDataChange
        animationDuration={800}
        onDataChangeAnimationDuration={500}
        pointerConfig={{
          pointerStripHeight: 120,
          pointerStripColor: COLORS.primary,
          pointerStripWidth: 2,
          pointerColor: COLORS.primary,
          radius: 6,
          pointerLabelWidth: 100,
          pointerLabelHeight: 90,
          activatePointersOnLongPress: false,
          autoAdjustPointerLabelPosition: true,
          pointerLabelComponent: (items: any) => {
            return (
              <View style={{
                height: 70,
                width: 90,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: COLORS.white,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: COLORS.primary,
                ...Platform.select({
                  ios: {
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.15,
                    shadowRadius: 4,
                  },
                  android: {
                    elevation: 5,
                  },
                  web: {
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
                  },
                }),
                paddingHorizontal: 12,
                paddingVertical: 8,
              }}>
                <Text style={{ 
                  color: COLORS.textMuted, 
                  fontSize: 10,
                  fontWeight: '500',
                  marginBottom: 4
                }}>
                  Score
                </Text>
                <Text style={{ 
                  fontWeight: 'bold', 
                  fontSize: 20,
                  color: COLORS.primary,
                  marginBottom: 2
                }}>
                  {items[0].value}
                </Text>
                <Text style={{ 
                  color: COLORS.textSecondary, 
                  fontSize: 9,
                  fontWeight: '500'
                }}>
                  {items[0].label}
                </Text>
              </View>
            );
          },
        }}
      />
    </View>
  );
};
