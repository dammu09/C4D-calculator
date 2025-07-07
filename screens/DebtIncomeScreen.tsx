// DebtIncomeScreen.tsx (Fixed Layout)
import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { ThemeContext } from '../ThemeContext';
import { CustomInput, CustomButton, ResultCard } from '../Components';
import { formatCurrency } from '../utils';
import { styles } from '../styles';

interface Debt {
  id: string;
  name: string;
  amount: number;
}

export const DebtIncomeScreen: React.FC = () => {
  const { colors, currency } = useContext(ThemeContext);
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [debts, setDebts] = useState<Debt[]>([]);
  const [debtName, setDebtName] = useState('');
  const [debtAmount, setDebtAmount] = useState('');
  const [newLoanPayment, setNewLoanPayment] = useState('');
  const [results, setResults] = useState<any>(null);
  const scrollViewRef = React.useRef<ScrollView>(null);

  const addDebt = () => {
    if (!debtName.trim() || !debtAmount) {
      Alert.alert('Error', 'Please enter debt name and amount');
      return;
    }

    const newDebt: Debt = {
      id: Date.now().toString(),
      name: debtName.trim(),
      amount: parseFloat(debtAmount)
    };

    setDebts([...debts, newDebt]);
    setDebtName('');
    setDebtAmount('');
  };

  const removeDebt = (id: string) => {
    setDebts(debts.filter(debt => debt.id !== id));
  };

  const getTotalDebts = () => {
    return debts.reduce((sum, debt) => sum + debt.amount, 0);
  };

  const calculate = () => {
    const income = parseFloat(monthlyIncome);
    const totalCurrentDebts = getTotalDebts();
    const newPayment = parseFloat(newLoanPayment) || 0;

    if (!income) {
      Alert.alert('Error', 'Please enter your monthly income');
      return;
    }

    const currentRatio = (totalCurrentDebts / income) * 100;
    const newRatio = ((totalCurrentDebts + newPayment) / income) * 100;
    
    const getQualification = (ratio: number) => {
      if (ratio <= 20) return { status: 'Excellent', color: colors.success };
      if (ratio <= 36) return { status: 'Good', color: colors.primary };
      if (ratio <= 43) return { status: 'Fair', color: colors.warning };
      return { status: 'Poor', color: colors.error };
    };

    const maxLoanPayment = Math.max((income * 0.43) - totalCurrentDebts, 0);
    const recommendedPayment = Math.max((income * 0.36) - totalCurrentDebts, 0);

    setResults({
      currentRatio,
      newRatio,
      maxLoanPayment,
      recommendedPayment,
      qualification: getQualification(newRatio),
      currentQualification: getQualification(currentRatio),
      totalCurrentDebts
    });

    // Auto-scroll to results
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const clearForm = () => {
    setMonthlyIncome('');
    setDebts([]);
    setDebtName('');
    setDebtAmount('');
    setNewLoanPayment('');
    setResults(null);
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 140 : 0}
    >
      <ScrollView 
        ref={scrollViewRef}
        style={[styles.container, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentInsetAdjustmentBehavior="automatic"
      >
        {/* Income Section */}
        <View style={[styles.section, styles.premiumCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Monthly Income</Text>
          <CustomInput
            label="Gross Monthly Income"
            value={monthlyIncome}
            onChangeText={setMonthlyIncome}
            placeholder="Enter monthly income"
          />
        </View>

        {/* Debts Section - Redesigned */}
        <View style={[styles.section, styles.premiumCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Monthly Debt Payments</Text>
          
          {/* Compact Add Debt Form */}
          <View style={styles.compactDebtForm}>
            <View style={styles.compactDebtInputs}>
              <View style={styles.compactDebtInputWrapper}>
                <Text style={[styles.compactInputLabel, { color: colors.textSecondary }]}>Debt Name</Text>
                <View style={[styles.compactInputBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <TextInput
                    style={[styles.compactInput, { color: colors.text }]}
                    value={debtName}
                    onChangeText={setDebtName}
                    placeholder="Credit Card"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
              </View>
              
              <View style={styles.compactDebtInputWrapper}>
                <Text style={[styles.compactInputLabel, { color: colors.textSecondary }]}>Monthly Payment</Text>
                <View style={[styles.compactInputBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <TextInput
                    style={[styles.compactInput, { color: colors.text }]}
                    value={debtAmount}
                    onChangeText={setDebtAmount}
                    placeholder="250"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>
            
            <TouchableOpacity
              style={[styles.addDebtButtonCompact, { backgroundColor: colors.primary }]}
              onPress={addDebt}
              activeOpacity={0.8}
            >
              <Text style={styles.addDebtButtonText}>+ Add</Text>
            </TouchableOpacity>
          </View>

          {/* Current Debts List - Fixed Single Line Layout */}
          {debts.length > 0 && (
            <View style={styles.currentDebtsCompact}>
              <Text style={[styles.currentDebtsCompactTitle, { color: colors.text }]}>
                Current Debts ({debts.length})
              </Text>
              
              <View style={styles.debtsContainer}>
                {debts.map((debt) => (
                  <View key={debt.id} style={[styles.debtCardSingleLine, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    <Text style={[styles.debtNameSingleLine, { color: colors.text }]} numberOfLines={1}>
                      {debt.name}
                    </Text>
                    <Text style={[styles.debtAmountSingleLine, { color: colors.primary }]}>
                      {formatCurrency(debt.amount, currency)}
                    </Text>
                    <TouchableOpacity 
                      onPress={() => removeDebt(debt.id)}
                      style={[styles.removeButtonSingleLine, { backgroundColor: colors.error + '15' }]}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.removeButtonTextSingleLine, { color: colors.error }]}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
              
              <View style={[styles.totalDebtsRedesigned, { backgroundColor: colors.primary }]}>
                <View style={styles.totalDebtsContent}>
                  <Text style={[styles.totalDebtsLabelRedesigned, { color: '#ffffff' }]}>Total Monthly Debts</Text>
                  <Text style={[styles.totalDebtsAmountRedesigned, { color: '#ffffff' }]}>
                    {formatCurrency(getTotalDebts(), currency)}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* New Loan Section */}
        <View style={[styles.section, styles.premiumCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>New Loan (Optional)</Text>
          <CustomInput
            label="New Loan Payment"
            value={newLoanPayment}
            onChangeText={setNewLoanPayment}
            placeholder="Enter new loan payment"
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          <CustomButton title="Calculate DTI" onPress={calculate} />
          <CustomButton title="Clear All" onPress={clearForm} variant="outline" />
        </View>

        {/* Results Section */}
        {results && (
          <View style={[styles.section, styles.premiumCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Debt-to-Income Analysis</Text>
            
            <View style={styles.resultsContainer}>
              <View style={styles.resultRow}>
                <ResultCard
                  title="Current DTI Ratio"
                  value={`${results.currentRatio.toFixed(1)}%`}
                  color={results.currentQualification.color}
                  subtitle={`${formatCurrency(results.totalCurrentDebts, currency)} in debts`}
                />
                {newLoanPayment && (
                  <ResultCard
                    title="New DTI Ratio"
                    value={`${results.newRatio.toFixed(1)}%`}
                    color={results.qualification.color}
                    subtitle="With new loan"
                  />
                )}
              </View>
              
              <View style={styles.resultRow}>
                <ResultCard
                  title="Max Loan Payment"
                  value={formatCurrency(results.maxLoanPayment, currency)}
                  subtitle="To stay under 43%"
                  color={colors.warning}
                />
                <ResultCard
                  title="Recommended Payment"
                  value={formatCurrency(results.recommendedPayment, currency)}
                  subtitle="To stay under 36%"
                  color={colors.success}
                />
              </View>
              
              <View style={styles.resultRow}>
                <ResultCard
                  title="Qualification Status"
                  value={results.qualification.status}
                  color={results.qualification.color}
                  icon={results.qualification.status === 'Excellent' ? '🌟' : 
                        results.qualification.status === 'Good' ? '✅' :
                        results.qualification.status === 'Fair' ? '⚠️' : '❌'}
                />
              </View>
            </View>

            <View style={[styles.guidelinesCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.guidelinesTitle, { color: colors.text }]}>DTI Guidelines</Text>
              <Text style={[styles.guidelinesText, { color: colors.textSecondary }]}>
                • 0-20%: Excellent - Low debt risk{'\n'}
                • 21-36%: Good - Manageable debt level{'\n'}
                • 37-43%: Fair - Approaching limit{'\n'}
                • 44%+: Poor - High debt risk
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};