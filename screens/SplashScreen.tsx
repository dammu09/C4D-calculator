// SplashScreen.tsx
import React, { useEffect, useContext } from 'react';
import { View, Text } from 'react-native';
import { ThemeContext } from '../ThemeContext';
import { styles } from '../styles';

export const SplashScreen: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  const { colors } = useContext(ThemeContext);

  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 2500);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View style={[styles.splashContainer, { backgroundColor: colors.primary }]}>
      <View style={styles.logoContainer}>
        <View style={[styles.logoCircle, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
          <Text style={styles.logoIcon}>💰</Text>
        </View>
        <Text style={styles.splashTitle}>C4D Calculator</Text>
        <Text style={styles.splashSubtitle}>Smart Financial Decisions</Text>
      </View>
      
      <View style={styles.splashFooter}>
        <View style={styles.loadingDots}>
          <View style={[styles.dot, styles.dot1]} />
          <View style={[styles.dot, styles.dot2]} />
          <View style={[styles.dot, styles.dot3]} />
        </View>
      </View>
    </View>
  );
};