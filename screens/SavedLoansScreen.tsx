// SavedLoansScreen.tsx (Updated with Icons)
import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Trash2, BarChart3, FileText } from 'lucide-react-native';
import { ThemeContext } from '../ThemeContext';
import { formatCurrency } from '../utils';
import { Loan } from '../types';
import { styles } from '../styles';

export const SavedLoansScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, currency } = useContext(ThemeContext);
  const [loans, setLoans] = useState<Loan[]>([]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadLoans);
    return unsubscribe;
  }, [navigation]);

  const loadLoans = async () => {
    try {
      const saved = await AsyncStorage.getItem('savedLoans');
      if (saved) {
        setLoans(JSON.parse(saved));
      }
    } catch (error) {
      console.log('Error loading loans:', error);
    }
  };

  const deleteLoan = async (id: string) => {
    Alert.alert(
      'Delete Loan',
      'Are you sure you want to delete this loan?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedLoans = loans.filter(loan => loan.id !== id);
            setLoans(updatedLoans);
            await AsyncStorage.setItem('savedLoans', JSON.stringify(updatedLoans));
          }
        }
      ]
    );
  };

  const viewAmortization = (loan: Loan) => {
    // Navigate to amortization tab and pass the loan ID
    navigation.navigate('AmortizationTab', {
      screen: 'AmortizationMain',
      params: { selectedLoanId: loan.id }
    });
  };

  const renderLoan = ({ item }: { item: Loan }) => (
    <View style={[styles.loanCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.loanHeader}>
        <Text style={[styles.loanName, { color: colors.text }]}>{item.name}</Text>
        <TouchableOpacity 
          onPress={() => deleteLoan(item.id)} 
          style={styles.deleteButton} 
          activeOpacity={0.7}
        >
          <Trash2 size={20} color={colors.error} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.loanDetails}>
        <Text style={[styles.loanDetail, { color: colors.textSecondary }]}>
          Amount: {formatCurrency(item.amount, currency)}
        </Text>
        <Text style={[styles.loanDetail, { color: colors.textSecondary }]}>
          Rate: {item.rate}% • Term: {item.term} years
        </Text>
        <Text style={[styles.loanDetail, { color: colors.primary }]}>
          Monthly: {formatCurrency(item.monthlyPayment, currency)}
        </Text>
      </View>
      
      <View style={styles.loanActions}>
        <TouchableOpacity
          style={[styles.viewButton, { backgroundColor: colors.primary }]}
          onPress={() => viewAmortization(item)}
          activeOpacity={0.8}
        >
          <BarChart3 size={16} color="#ffffff" style={{ marginRight: 8 }} />
          <Text style={styles.viewButtonText}>View Amortization</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.viewButton, { backgroundColor: colors.secondary }]}
          onPress={() => navigation.navigate('PrepaymentHistory', { loan: item })}
          activeOpacity={0.8}
        >
          <FileText size={16} color="#ffffff" style={{ marginRight: 8 }} />
          <Text style={styles.viewButtonText}>History</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {loans.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
            No saved loans yet.{'\n'}Calculate and save a loan to see it here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={loans}
          renderItem={renderLoan}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.loansList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};