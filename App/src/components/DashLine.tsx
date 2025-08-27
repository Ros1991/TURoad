import React from 'react';
import { View, StyleSheet } from 'react-native';

interface DashLineProps {
  dashLength?: number;
  dashGap?: number;
  dashThickness?: number;
  dashColor?: string;
  totalDashUnit?: number;
  style?: any;
}

const DashLine: React.FC<DashLineProps> = ({
  dashLength = 4,
  dashGap = 4,
  dashThickness = 1,
  dashColor = '#000',
  totalDashUnit = dashLength + dashGap,
  style,
}) => {
  const numberOfDashes = Math.ceil(100 / totalDashUnit);

  const dashes = Array.from({ length: numberOfDashes }, (_, index) => (
    <View
      key={index}
      style={[
        styles.dash,
        {
          width: dashLength,
          height: dashThickness,
          backgroundColor: dashColor,
          marginBottom: dashGap,
        },
      ]}
    />
  ));

  return (
    <View style={[styles.container, style]}>
      {dashes}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dash: {
    borderRadius: 0.5,
  },
});

export default DashLine;
