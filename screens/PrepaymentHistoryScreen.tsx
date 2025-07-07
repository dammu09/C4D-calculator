// PrepaymentHistoryScreen.tsx (Updated with Icons)
import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Trash2 } from 'lucide-react-native';
import { ThemeContext } from '../ThemeContext';
import { formatCurrency, generateAmortization } from '../utils';
import { PrepaymentScenario } from '../types';
import { styles } from '../styles';

export const PrepaymentHistoryScreen: React.FC<{ route: any, navigation: any }> = ({ route, navigation }) => {
  const { colors, currency } = useContext(ThemeContext);
  const { loan } = route.params;
  const [scenarios, setScenarios] = useState<PrepaymentScenario[]>([]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadScenarios);
    return unsubscribe;
  }, [navigation]);

  const loadScenarios = async () => {
    try {
      const saved = await AsyncStorage.getItem('prepaymentScenarios');
      if (saved) {
        const allScenarios = JSON.parse(saved);
        const loanScenarios = allScenarios.filter((s: PrepaymentScenario) => s.loanId === loan.id);
        loanScenarios.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setScenarios(loanScenarios);
      }
    } catch (error) {
      console.log('Error loading scenarios:', error);
    }
  };

  const calculateSavings = (scenario: PrepaymentScenario) => {
    const originalSchedule = generateAmortization(loan.amount, loan.rate, loan.term);
    const prepaymentSchedule = generateAmortization(
      loan.amount, 
      loan.rate, 
      loan.term, 
      scenario.extraMonthly, 
      scenario.prepayments
    );

    const originalCost = originalSchedule.reduce((sum, row) => sum + row.payment, 0);
    const prepaymentCost = prepaymentSchedule.reduce((sum, row) => sum + row.payment, 0);

    return {
      interestSaved: originalCost - prepaymentCost,
      timeSaved: originalSchedule.length - prepaymentSchedule.length
    };
  };

  const deleteScenario = async (scenarioId: string) => {
    Alert.alert(
      'Delete Scenario',
      'Are you sure you want to delete this prepayment scenario?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const saved = await AsyncStorage.getItem('prepaymentScenarios');
              const allScenarios = saved ? JSON.parse(saved) : [];
              const updatedScenarios = allScenarios.filter((s: PrepaymentScenario) => s.id !== scenarioId);
              await AsyncStorage.setItem('prepaymentScenarios', JSON.stringify(updatedScenarios));
              setScenarios(prev => prev.filter(s => s.id !== scenarioId));
            } catch (error) {
              Alert.alert('Error', 'Failed to delete scenario');
            }
          }
        }
      ]
    );
  };

  const renderScenario = ({ item }: { item: PrepaymentScenario }) => {
    const savings = calculateSavings(item);
    const createdDate = new Date(item.createdAt).toLocaleDateString();

    return (
      <View style={[styles.historyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.historyHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.historyScenarioName, { color: colors.text }]}>{item.name}</Text>
            <Text style={[styles.historyDate, { color: colors.textSecondary }]}>Created: {createdDate}</Text>
          </View>
          <TouchableOpacity 
            onPress={() => deleteScenario(item.id)}
            style={styles.historyDeleteButton}
            activeOpacity={0.7}
          >
            <Trash2 size={18} color={colors.error} />
          </TouchableOpacity>
        </View>

        <View style={styles.historyDetails}>
          <View style={styles.historyRow}>
            <Text style={[styles.historyLabel, { color: colors.textSecondary }]}>Extra Monthly:</Text>
            <Text style={[styles.historyValue, { color: colors.text }]}>
              {item.extraMonthly > 0 ? formatCurrency(item.extraMonthly, currency) : 'None'}
            </Text>
          </View>
          <View style={styles.historyRow}>
            <Text style={[styles.historyLabel, { color: colors.textSecondary }]}>Initial Prepayment:</Text>
            <Text style={[styles.historyValue, { color: colors.text }]}>
              {item.prepayments > 0 ? formatCurrency(item.prepayments, currency) : 'None'}
            </Text>
          </View>
          <View style={styles.historyRow}>
            <Text style={[styles.historyLabel, { color: colors.textSecondary }]}>Interest Saved:</Text>
            <Text style={[styles.historySavings, { color: colors.success }]}>
              {formatCurrency(savings.interestSaved, currency)}
            </Text>
          </View>
          <View style={styles.historyRow}>
            <Text style={[styles.historyLabel, { color: colors.textSecondary }]}>Time Saved:</Text>
            <Text style={[styles.historySavings, { color: colors.success }]}>
              {savings.timeSaved} months ({(savings.timeSaved / 12).toFixed(1)} years)
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.headerSection, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Prepayment History</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          {loan.name} - All scenarios and savings
        </Text>
      </View>

      {scenarios.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
            No prepayment scenarios yet for this loan.{'\n'}Create scenarios in the amortization view to see them here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={scenarios}
          renderItem={renderScenario}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.historyList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};