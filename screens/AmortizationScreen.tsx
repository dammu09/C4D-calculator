// AmortizationScreen.tsx (Fixed with Prepayment Auto-Update)
import React, { useState, useEffect, useContext } from 'react';
import { 
  View, Text, TouchableOpacity, FlatList, Alert, Share, Platform, Modal 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../ThemeContext';
import { CustomInput, CustomButton } from '../Components';
import { formatCurrency, generateAmortization } from '../utils';
import { Loan, AmortizationRow, PrepaymentScenario } from '../types';
import { styles } from '../styles';

export const AmortizationScreen: React.FC<{ navigation: any, route?: any }> = ({ navigation, route }) => {
  const { colors, currency } = useContext(ThemeContext);
  const [savedLoans, setSavedLoans] = useState<Loan[]>([]);
  const [selectedLoanId, setSelectedLoanId] = useState<string | 'combined'>('');
  const [currentSchedule, setCurrentSchedule] = useState<AmortizationRow[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentLoanName, setCurrentLoanName] = useState<string>('');
  const [showPrepaymentModal, setShowPrepaymentModal] = useState(false);
  const [extraMonthly, setExtraMonthly] = useState('');
  const [prepayments, setPrepayments] = useState('');
  const [scenarioName, setScenarioName] = useState('');
  const [allPrepaymentScenarios, setAllPrepaymentScenarios] = useState<PrepaymentScenario[]>([]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadSavedLoans();
      loadPrepaymentScenarios();
      // Check if we need to auto-select a loan from navigation
      if (route?.params?.selectedLoanId) {
        setSelectedLoanId(route.params.selectedLoanId);
      }
    });
    return unsubscribe;
  }, [navigation, route]);

  useEffect(() => {
    if (savedLoans.length > 0) {
      // Check if we have a pre-selected loan from navigation
      if (route?.params?.selectedLoanId) {
        const selectedLoan = savedLoans.find(loan => loan.id === route.params.selectedLoanId);
        if (selectedLoan) {
          setSelectedLoanId(selectedLoan.id);
          generateScheduleForLoan(selectedLoan);
          // Clear the param to avoid conflicts
          navigation.setParams({ selectedLoanId: undefined });
          return;
        }
      }
      
      // Otherwise show latest loan if no loan is selected
      if (!selectedLoanId) {
        const latestLoan = savedLoans[savedLoans.length - 1];
        setSelectedLoanId(latestLoan.id);
        generateScheduleForLoan(latestLoan);
      }
    }
  }, [savedLoans, route]);

  // Regenerate schedule when prepayment scenarios change
  useEffect(() => {
    if (selectedLoanId && selectedLoanId !== 'combined') {
      const selectedLoan = savedLoans.find(loan => loan.id === selectedLoanId);
      if (selectedLoan) {
        generateScheduleForLoan(selectedLoan);
      }
    } else if (selectedLoanId === 'combined') {
      generateCombinedSchedule();
    }
  }, [allPrepaymentScenarios, selectedLoanId]);

  const loadSavedLoans = async () => {
    try {
      const saved = await AsyncStorage.getItem('savedLoans');
      if (saved) {
        const loans = JSON.parse(saved);
        setSavedLoans(loans);
      }
    } catch (error) {
      console.log('Error loading loans:', error);
    }
  };

  const loadPrepaymentScenarios = async () => {
    try {
      const saved = await AsyncStorage.getItem('prepaymentScenarios');
      if (saved) {
        const scenarios = JSON.parse(saved);
        setAllPrepaymentScenarios(scenarios);
      }
    } catch (error) {
      console.log('Error loading prepayment scenarios:', error);
    }
  };

  const calculateTotalPrepayments = (loanId: string) => {
    const loanScenarios = allPrepaymentScenarios.filter(scenario => scenario.loanId === loanId);
    const totalExtraMonthly = loanScenarios.reduce((sum, scenario) => sum + (scenario.extraMonthly || 0), 0);
    const totalPrepayments = loanScenarios.reduce((sum, scenario) => sum + (scenario.prepayments || 0), 0);
    
    return { totalExtraMonthly, totalPrepayments };
  };

  const generateScheduleForLoan = (loan: Loan) => {
    // Calculate total prepayments from all scenarios for this loan
    const { totalExtraMonthly, totalPrepayments } = calculateTotalPrepayments(loan.id);
    
    // Add base loan prepayments to scenario prepayments
    const finalExtraMonthly = (loan.extraMonthly || 0) + totalExtraMonthly;
    const finalPrepayments = (loan.prepayments || 0) + totalPrepayments;
    
    const schedule = generateAmortization(
      loan.amount,
      loan.rate,
      loan.term,
      finalExtraMonthly,
      finalPrepayments
    );
    
    setCurrentSchedule(schedule);
    
    // Update loan name to show scenario names
    const loanScenarios = allPrepaymentScenarios.filter(s => s.loanId === loan.id);
    let nameWithScenarios = loan.name;
    
    if (loanScenarios.length === 1) {
      nameWithScenarios = `${loan.name} (${loanScenarios[0].name})`;
    } else if (loanScenarios.length > 1) {
      const scenarioNames = loanScenarios.map(s => s.name).join(', ');
      nameWithScenarios = `${loan.name} (${scenarioNames})`;
    }
    
    setCurrentLoanName(nameWithScenarios);
  };

  const generateCombinedSchedule = () => {
    if (savedLoans.length === 0) return;

    const allSchedules = savedLoans.map(loan => {
      const { totalExtraMonthly, totalPrepayments } = calculateTotalPrepayments(loan.id);
      const finalExtraMonthly = (loan.extraMonthly || 0) + totalExtraMonthly;
      const finalPrepayments = (loan.prepayments || 0) + totalPrepayments;
      
      return {
        loan,
        schedule: generateAmortization(loan.amount, loan.rate, loan.term, finalExtraMonthly, finalPrepayments)
      };
    });

    const maxPayments = Math.max(...allSchedules.map(s => s.schedule.length));
    const combined: AmortizationRow[] = [];
    
    for (let month = 1; month <= maxPayments; month++) {
      let totalPayment = 0;
      let totalInterest = 0;
      let totalPrincipal = 0;
      let totalBalance = 0;

      allSchedules.forEach(({ schedule }) => {
        const monthData = schedule.find(row => row.month === month);
        if (monthData) {
          totalPayment += monthData.payment;
          totalInterest += monthData.interest;
          totalPrincipal += monthData.principal;
          totalBalance += monthData.balance;
        }
      });

      if (totalPayment > 0 || totalBalance > 0) {
        combined.push({
          month,
          payment: totalPayment,
          interest: totalInterest,
          principal: totalPrincipal,
          balance: totalBalance
        });
      }
    }

    setCurrentSchedule(combined);
    
    // Show total scenarios count in combined view
    const totalScenarios = allPrepaymentScenarios.length;
    const nameWithScenarios = totalScenarios > 0
      ? `Combined (${savedLoans.length} loans, ${totalScenarios} scenarios)`
      : `Combined (${savedLoans.length} loans)`;
    
    setCurrentLoanName(nameWithScenarios);
  };

  const handleLoanSelection = (loanId: string | 'combined') => {
    setSelectedLoanId(loanId);
    setShowDropdown(false);

    if (loanId === 'combined') {
      generateCombinedSchedule();
    } else {
      const selectedLoan = savedLoans.find(loan => loan.id === loanId);
      if (selectedLoan) {
        generateScheduleForLoan(selectedLoan);
      }
    }
  };

  const saveScenario = async () => {
    if (!scenarioName.trim() || (!extraMonthly && !prepayments)) {
      Alert.alert('Error', 'Please enter scenario name and at least one prepayment amount');
      return;
    }

    if (selectedLoanId === 'combined') {
      Alert.alert('Error', 'Cannot add prepayment scenarios to combined view');
      return;
    }

    try {
      const scenario: PrepaymentScenario = {
        id: Date.now().toString(),
        loanId: selectedLoanId,
        name: scenarioName.trim(),
        extraMonthly: parseFloat(extraMonthly) || 0,
        prepayments: parseFloat(prepayments) || 0,
        createdAt: new Date().toISOString()
      };

      const newScenarios = [...allPrepaymentScenarios, scenario];
      await AsyncStorage.setItem('prepaymentScenarios', JSON.stringify(newScenarios));
      
      // Update local state to trigger recalculation
      setAllPrepaymentScenarios(newScenarios);
      
      setShowPrepaymentModal(false);
      setScenarioName('');
      setExtraMonthly('');
      setPrepayments('');
      Alert.alert('Success', 'Prepayment scenario saved! Schedule updated automatically.');
    } catch (error) {
      Alert.alert('Error', 'Failed to save scenario');
    }
  };

  const viewPrepaymentHistory = () => {
    if (selectedLoanId === 'combined') {
      Alert.alert('Info', 'Please select an individual loan to view prepayment history');
      return;
    }
    
    const selectedLoan = savedLoans.find(loan => loan.id === selectedLoanId);
    if (!selectedLoan) {
      Alert.alert('Error', 'Selected loan not found');
      return;
    }

    // Check if there are any prepayment scenarios for this loan
    const loanScenarios = allPrepaymentScenarios.filter(s => s.loanId === selectedLoanId);
    
    if (loanScenarios.length === 0) {
      Alert.alert(
        'No Prepayment History', 
        `No prepayment scenarios have been added to "${selectedLoan.name}" yet.\n\nTap the + button to add your first prepayment scenario and see how it affects your loan.`,
        [
          { text: 'OK', style: 'default' },
          { 
            text: 'Add Scenario', 
            style: 'default',
            onPress: () => setShowPrepaymentModal(true)
          }
        ]
      );
      return;
    }
    
    // If there are scenarios, navigate to history
    navigation.navigate('PrepaymentHistory', { loan: selectedLoan });
  };

  const shareTable = async () => {
    if (currentSchedule.length === 0) {
      Alert.alert('Error', 'No data to share');
      return;
    }

    const header = 'Month\t\tPayment\t\tInterest\t\tPrincipal\t\tBalance\n';
    const separator = '─────────────────────────────────────────────────────────────────\n';
    
    const rows = currentSchedule.map(row => 
      `${row.month.toString().padEnd(8)}${formatCurrency(row.payment, currency).padEnd(12)}${formatCurrency(row.interest, currency).padEnd(12)}${formatCurrency(row.principal, currency).padEnd(12)}${formatCurrency(row.balance, currency)}`
    ).join('\n');

    const totalCost = currentSchedule.reduce((sum, row) => sum + row.payment, 0);
    const totalInterest = currentSchedule.reduce((sum, row) => sum + row.interest, 0);

    // Add prepayment info to summary
    let prepaymentInfo = '';
    if (selectedLoanId !== 'combined') {
      const { totalExtraMonthly, totalPrepayments } = calculateTotalPrepayments(selectedLoanId);
      if (totalExtraMonthly > 0 || totalPrepayments > 0) {
        prepaymentInfo = `\nPrepayment Details:
Extra Monthly: ${formatCurrency(totalExtraMonthly, currency)}
Initial Prepayment: ${formatCurrency(totalPrepayments, currency)}`;
      }
    }

    const summary = `Amortization Schedule - ${currentLoanName}

${header}${separator}${rows}

Summary:
Total Payments: ${currentSchedule.length} months
Total Cost: ${formatCurrency(totalCost, currency)}
Total Interest: ${formatCurrency(totalInterest, currency)}${prepaymentInfo}

Generated by C4D Calculator
${new Date().toLocaleDateString()}`;

    try {
      await Share.share({
        message: summary,
        title: `Amortization Schedule - ${currentLoanName}`,
        ...(Platform.OS === 'ios' && {
          url: `data:text/plain;charset=utf-8,${encodeURIComponent(summary)}`
        })
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  const renderAmortizationRow = ({ item, index }: { item: AmortizationRow; index: number }) => (
    <View style={[
      styles.tableRow, 
      { backgroundColor: index % 2 === 0 ? colors.background : colors.surface }
    ]}>
      <Text style={[styles.tableCell, styles.monthCellNew, { color: colors.text }]}>
        {item.month}
      </Text>
      <Text style={[styles.tableCell, { color: colors.text }]}>
        {formatCurrency(item.payment, currency)}
      </Text>
      <Text style={[styles.tableCell, { color: colors.error }]}>
        {formatCurrency(item.interest, currency)}
      </Text>
      <Text style={[styles.tableCell, { color: colors.success }]}>
        {formatCurrency(item.principal, currency)}
      </Text>
      <Text style={[styles.tableCell, { color: colors.text }]}>
        {formatCurrency(item.balance, currency)}
      </Text>
    </View>
  );

  const renderDropdownItem = (loan: Loan) => {
    const loanScenarios = allPrepaymentScenarios.filter(s => s.loanId === loan.id);
    
    return (
      <TouchableOpacity
        key={loan.id}
        style={[
          styles.dropdownItem, 
          { 
            backgroundColor: selectedLoanId === loan.id ? colors.primary + '20' : 'transparent',
            borderBottomColor: colors.border 
          }
        ]}
        onPress={() => handleLoanSelection(loan.id)}
      >
        <View style={{ flex: 1 }}>
          <Text style={[styles.dropdownItemTitle, { color: colors.text }]}>
            {loan.name}
          </Text>
          <Text style={[styles.dropdownItemSubtitle, { color: colors.textSecondary }]}>
            {formatCurrency(loan.amount, currency)} • {loan.rate}% • {loan.term} years
          </Text>
          {loanScenarios.length > 0 && (
            <Text style={[styles.dropdownItemSubtitle, { color: colors.success, fontSize: 12, marginTop: 2 }]}>
              Scenarios: {loanScenarios.map(s => s.name).join(', ')}
            </Text>
          )}
        </View>
        {selectedLoanId === loan.id && (
          <Text style={[styles.selectedIndicator, { color: colors.primary }]}>✓</Text>
        )}
      </TouchableOpacity>
    );
  };

  if (savedLoans.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.emptyStateContainer}>
          <Text style={[styles.emptyStateIcon, { color: colors.textSecondary }]}>📊</Text>
          <Text style={[styles.emptyStateTitle, { color: colors.text }]}>No Saved Loans</Text>
          <Text style={[styles.emptyStateMessage, { color: colors.textSecondary }]}>
            Save loans from the calculator to view their amortization schedules here.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with Dropdown and Action Buttons */}
      <View style={[styles.amortizationHeaderNew, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.loanSelector, { backgroundColor: colors.background, borderColor: colors.border }]}
          onPress={() => setShowDropdown(!showDropdown)}
          activeOpacity={0.8}
        >
          <View style={styles.loanSelectorContent}>
            <Text style={[styles.loanSelectorLabel, { color: colors.textSecondary }]}>
              {selectedLoanId === 'combined' ? 'Viewing' : 'Loan'}
            </Text>
            <Text style={[styles.loanSelectorTitle, { color: colors.text }]} numberOfLines={1}>
              {currentLoanName}
            </Text>
          </View>
          <Text style={[styles.dropdownArrow, { color: colors.primary }]}>
            {showDropdown ? '▲' : '▼'}
          </Text>
        </TouchableOpacity>

        {/* Action Buttons */}
        <View style={styles.headerActionsRow}>
          {selectedLoanId !== 'combined' && (
            <TouchableOpacity
              style={[styles.actionButtonSmall, { backgroundColor: colors.secondary }]}
              onPress={() => setShowPrepaymentModal(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.actionButtonIcon}>➕</Text>
            </TouchableOpacity>
          )}
          
          {selectedLoanId !== 'combined' && (
            <TouchableOpacity
              style={[styles.actionButtonSmall, { backgroundColor: colors.success }]}
              onPress={viewPrepaymentHistory}
              activeOpacity={0.8}
            >
              <Text style={styles.actionButtonIcon}>📋</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.actionButtonSmall, { backgroundColor: colors.primary }]}
            onPress={shareTable}
            activeOpacity={0.8}
          >
            <Text style={styles.actionButtonIcon}>📧</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Dropdown Menu */}
      {showDropdown && (
        <View style={[styles.dropdownMenu, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Combined Option */}
          <TouchableOpacity
            style={[
              styles.dropdownItem, 
              { 
                backgroundColor: selectedLoanId === 'combined' ? colors.primary + '20' : 'transparent',
                borderBottomColor: colors.border 
              }
            ]}
            onPress={() => handleLoanSelection('combined')}
          >
            <View>
              <Text style={[styles.dropdownItemTitle, { color: colors.text }]}>Combined All Loans</Text>
              <Text style={[styles.dropdownItemSubtitle, { color: colors.textSecondary }]}>
                View all {savedLoans.length} loans together
                {allPrepaymentScenarios.length > 0 && ` (${allPrepaymentScenarios.length} total scenarios)`}
              </Text>
            </View>
            {selectedLoanId === 'combined' && (
              <Text style={[styles.selectedIndicator, { color: colors.primary }]}>✓</Text>
            )}
          </TouchableOpacity>

          {/* Individual Loans */}
          {savedLoans.map(renderDropdownItem)}
        </View>
      )}

      {/* Table Header */}
      <View style={[styles.tableHeader, { backgroundColor: colors.primary }]}>
        <Text style={[styles.tableHeaderCell, styles.monthCellNew]}>Month</Text>
        <Text style={styles.tableHeaderCell}>Payment</Text>
        <Text style={styles.tableHeaderCell}>Interest</Text>
        <Text style={styles.tableHeaderCell}>Principal</Text>
        <Text style={styles.tableHeaderCell}>Balance</Text>
      </View>

      {/* Amortization Table */}
      <FlatList
        data={currentSchedule}
        renderItem={renderAmortizationRow}
        keyExtractor={item => `${selectedLoanId}-${item.month}`}
        style={styles.amortizationTableNew}
        showsVerticalScrollIndicator={false}
        bounces={false}
      />

      {/* Table Summary */}
      {currentSchedule.length > 0 && (
        <View style={[styles.tableSummary, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Total Payments:</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>{currentSchedule.length} months</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Total Cost:</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {formatCurrency(currentSchedule.reduce((sum, row) => sum + row.payment, 0), currency)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Total Interest:</Text>
            <Text style={[styles.summaryValue, { color: colors.error }]}>
              {formatCurrency(currentSchedule.reduce((sum, row) => sum + row.interest, 0), currency)}
            </Text>
          </View>
          {/* Show prepayment totals if any exist */}
          {selectedLoanId !== 'combined' && (() => {
            const { totalExtraMonthly, totalPrepayments } = calculateTotalPrepayments(selectedLoanId);
            if (totalExtraMonthly > 0 || totalPrepayments > 0) {
              return (
                <>
                  {totalExtraMonthly > 0 && (
                    <View style={styles.summaryRow}>
                      <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Extra Monthly:</Text>
                      <Text style={[styles.summaryValue, { color: colors.success }]}>
                        {formatCurrency(totalExtraMonthly, currency)}
                      </Text>
                    </View>
                  )}
                  {totalPrepayments > 0 && (
                    <View style={styles.summaryRow}>
                      <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Total Prepaid:</Text>
                      <Text style={[styles.summaryValue, { color: colors.success }]}>
                        {formatCurrency(totalPrepayments, currency)}
                      </Text>
                    </View>
                  )}
                </>
              );
            }
            return null;
          })()}
        </View>
      )}

      {/* Prepayment Modal */}
      <Modal visible={showPrepaymentModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Add Prepayment Scenario</Text>
            
            <CustomInput
              label="Scenario Name"
              value={scenarioName}
              onChangeText={setScenarioName}
              placeholder="Enter scenario name"
              keyboardType="default"
            />
            
            <CustomInput
              label="Extra Monthly Payment"
              value={extraMonthly}
              onChangeText={setExtraMonthly}
              placeholder="Enter extra monthly payment"
            />
            
            <CustomInput
              label="Initial Prepayment"
              value={prepayments}
              onChangeText={setPrepayments}
              placeholder="Enter upfront prepayment"
            />
            
            <View style={styles.modalButtons}>
              <CustomButton
                title="Cancel"
                onPress={() => {
                  setShowPrepaymentModal(false);
                  setScenarioName('');
                  setExtraMonthly('');
                  setPrepayments('');
                }}
                variant="outline"
              />
              <CustomButton
                title="Save"
                onPress={saveScenario}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};