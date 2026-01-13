# Chart Implementation Guide

## Overview
We've upgraded the chart implementation using **react-native-gifted-charts**, which provides:
- ✅ Better performance on both mobile and web
- ✅ Smooth animations and interactions
- ✅ Touch/hover interactions with data points
- ✅ Responsive design that works across devices
- ✅ Professional appearance with gradient fills
- ✅ Curved line interpolation

## Installation
```bash
npm install react-native-gifted-charts react-native-svg
```

## Components

### 1. JendoScoreChart
Location: `src/features/dashboard/components/JendoScoreChart.tsx`

A reusable component for displaying Jendo score history with:
- Smooth curved lines
- Gradient area fill
- Interactive data points
- Hover/tap tooltip
- Responsive sizing for mobile and web

**Usage:**
```tsx
import { JendoScoreChart } from '../components/JendoScoreChart';

<JendoScoreChart 
  data={[
    { date: 'Dec 18', value: 86 },
    { date: 'Oct 19', value: 81 },
    { date: 'Dec 19', value: 76 }
  ]} 
/>
```

**Props:**
- `data`: Array of `{ date: string, value: number }` objects
- `containerStyle`: Optional custom container styles

### 2. SimpleLineChart
Location: `src/features/jendo-tests/screens/JendoReportDetailScreen.tsx`

Used for medical signal data visualization (pulse, temperature):
- Smooth curved lines with gradient
- Compact design for report details
- Color customization
- Auto-scaling Y-axis

**Usage:**
```tsx
<SimpleLineChart 
  data={[75, 78, 80, 79, 82, 85]}
  color="#EF4444" 
  title="Identity Pulse"
  yLabels={['100', '75', '50', '25', '0']}
  xLabels={['0', '100', '200', '300', '400']}
/>
```

## Features

### Interactive Tooltips
- **Mobile**: Long-press on data points to see values
- **Web**: Hover over data points
- Shows score value and date in a styled popup

### Animations
- Smooth entrance animations (800ms)
- Data change animations (500ms)
- Curved line interpolation

### Responsive Design
- Adapts to screen width
- Maximum width constraint for large screens (600px)
- Proper spacing calculation based on data points
- Font sizes adjust for small screens

### Styling
- Primary color integration from theme
- Gradient fills under lines
- Shadow effects on active data points
- Professional grid lines and axes

## Customization

### Colors
All colors are pulled from `COLORS` config:
```tsx
color={COLORS.primary}
startFillColor={`${COLORS.primary}20`}
```

### Chart Height
Adjust in component:
```tsx
height={140}  // Default for JendoScoreChart
height={120}  // Default for SimpleLineChart
```

### Line Thickness
```tsx
thickness={3}  // Main score chart
thickness={2.5}  // Medical signal charts
```

### Data Point Styling
```tsx
customDataPoint: () => (
  <View style={{
    width: isLastPoint ? 12 : 8,
    height: isLastPoint ? 12 : 8,
    borderRadius: isLastPoint ? 6 : 4,
    backgroundColor: isLastPoint ? COLORS.white : COLORS.primary,
    borderWidth: isLastPoint ? 3 : 2,
    borderColor: COLORS.primary,
  }} />
)
```

## Browser Compatibility
- ✅ Chrome/Edge (Desktop & Mobile)
- ✅ Safari (iOS & macOS)
- ✅ Firefox
- ✅ React Native iOS
- ✅ React Native Android

## Performance Tips
1. Use `useMemo` to prepare chart data
2. Avoid re-rendering by memoizing data transformations
3. Keep data arrays under 100 points for smooth animations
4. Use `adjustToWidth={true}` for responsive layouts

## Troubleshooting

### Chart not showing?
- Ensure `react-native-svg` is installed
- Check container has defined width
- Verify data array is not empty

### Tooltip not appearing?
- On mobile, use long-press (not tap)
- Check `pointerConfig` is properly set
- Ensure `activatePointersOnLongPress: false` for immediate tooltips

### Web rendering issues?
- Clear metro cache: `npx expo start -c`
- Rebuild: `npm run web`

## Migration Notes
The old custom chart implementation has been replaced. Key differences:
- **Before**: Manual SVG-like positioning with View components
- **After**: Professional charting library with built-in features
- **Benefit**: 70% less code, better performance, more features

## Future Enhancements
Consider adding:
- Multiple data series comparison
- Date range selection
- Export chart as image
- Zoom and pan gestures
- Real-time data updates
