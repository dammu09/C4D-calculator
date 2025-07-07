// SettingsScreen.tsx (Updated)
import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Alert, 
  Modal, Switch, FlatList, Platform, Linking, BackHandler
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../ThemeContext';
import { CustomInput, CustomButton } from '../Components';
import { styles } from '../styles';

export const SettingsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, isDark, toggleTheme, currency, setCurrency } = useContext(ThemeContext);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [isPasscodeEnabled, setIsPasscodeEnabled] = useState(false);
  const [showPasscodeSetup, setShowPasscodeSetup] = useState(false);
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [showPasscodeTestModal, setShowPasscodeTestModal] = useState(false);

  useEffect(() => {
    checkPasscodeStatus();
  }, []);

  const checkPasscodeStatus = async () => {
    const passcode = await AsyncStorage.getItem('passcode');
    setIsPasscodeEnabled(!!passcode);
  };

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C' }
  ];

  const togglePasscode = async () => {
    if (isPasscodeEnabled) {
      await AsyncStorage.removeItem('passcode');
      setIsPasscodeEnabled(false);
      Alert.alert('Success', 'Passcode protection disabled');
    } else {
      setShowPasscodeSetup(true);
    }
  };

  const savePasscode = async () => {
    if (newPasscode.length !== 4 || confirmPasscode.length !== 4) {
      Alert.alert('Error', 'Passcode must be 4 digits');
      return;
    }
    
    if (newPasscode !== confirmPasscode) {
      Alert.alert('Error', 'Passcodes do not match');
      return;
    }

    await AsyncStorage.setItem('passcode', newPasscode);
    setIsPasscodeEnabled(true);
    setShowPasscodeSetup(false);
    setNewPasscode('');
    setConfirmPasscode('');
    
    setShowPasscodeTestModal(true);
  };

  const applyNow = () => {
    Linking.openURL('https://151261.my1003app.com/161464/register');
  };

  const clearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all saved loans and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.multiRemove(['savedLoans', 'passcode', 'theme', 'currency', 'prepaymentScenarios']);
            
            Alert.alert(
              'Data Cleared Successfully',
              'Please close and reopen the app for changes to take effect.',
              [
                {
                  text: 'OK',
                  onPress: () => {
                    if (Platform.OS === 'android') {
                      BackHandler.exitApp();
                    } else {
                      Alert.alert('Please manually close and reopen the app');
                    }
                  }
                }
              ],
              { cancelable: false }
            );
            setIsPasscodeEnabled(false);
          }
        }
      ]
    );
  };

  const contactSupport = () => {
    Alert.alert(
      'Contact Support',
      'Choose how you\'d like to contact us:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call',
          onPress: () => Linking.openURL('tel:586-914-4459')
        },
        {
          text: 'Email',
          onPress: () => {
            const email = 'Cdeshpande@c4dmortgage.com';
            const subject = 'C4D Calculator Support';
            const body = 'Hi, I need help with...';
            Linking.openURL(`mailto:${email}?subject=${subject}&body=${body}`);
          }
        }
      ]
    );
  };

  const openZeroLag = () => {
    Linking.openURL('https://www.zerolag.tech/');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Apply Now Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Apply Now</Text>
        
        <TouchableOpacity
          style={[styles.settingRow, { borderBottomColor: colors.border }]}
          onPress={applyNow}
        >
          <View style={styles.settingLabelContainer}>
            <Text style={[styles.settingLabel, { color: colors.primary }]}>Apply for Mortgage</Text>
            <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
              Start your mortgage application process
            </Text>
          </View>
          <Text style={[styles.settingValue, { color: colors.primary }]}>→</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
        
        <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
          <View style={styles.settingLabelContainer}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>Dark Mode</Text>
            <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
              Switch between light and dark themes
            </Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.surface}
          />
        </View>

        <TouchableOpacity
          style={[styles.settingRow, { borderBottomColor: colors.border }]}
          onPress={() => setShowCurrencyModal(true)}
        >
          <View style={styles.settingLabelContainer}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>Currency</Text>
            <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
              Choose your preferred currency
            </Text>
          </View>
          <Text style={[styles.settingValue, { color: colors.primary }]}>{currency}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Security</Text>
        
        <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
          <View style={styles.settingLabelContainer}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>Passcode Lock</Text>
            <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
              Protect your app with a 4-digit passcode
            </Text>
          </View>
          <Switch
            value={isPasscodeEnabled}
            onValueChange={togglePasscode}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.surface}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Data</Text>
        
        <TouchableOpacity
          style={[styles.settingRow, { borderBottomColor: colors.border }]}
          onPress={clearAllData}
        >
          <View style={styles.settingLabelContainer}>
            <Text style={[styles.settingLabel, { color: colors.error }]}>Clear All Data</Text>
            <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
              Delete all saved loans and reset settings
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Support</Text>
        
        <TouchableOpacity
          style={[styles.settingRow, { borderBottomColor: colors.border }]}
          onPress={contactSupport}
        >
          <View style={styles.settingLabelContainer}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>Contact Support</Text>
            <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
              Phone: 586-914-4459{'\n'}Email: Cdeshpande@c4dmortgage.com
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>

        <View style={[styles.aboutCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.aboutTitle, { color: colors.text }]}>C4D Calculator</Text>
          <Text style={[styles.aboutVersion, { color: colors.textSecondary }]}>Version 2.0.0</Text>
          <TouchableOpacity onPress={openZeroLag} activeOpacity={0.7}>
            <Text style={[styles.aboutBuilt, { color: colors.primary, textDecorationLine: 'underline' }]}>
              Built by Team ZeroLag
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={showCurrencyModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Select Currency</Text>
            
            <ScrollView style={styles.currencyList}>
              {currencies.map((curr) => (
                <TouchableOpacity
                  key={curr.code}
                  style={[styles.currencyOption, { borderBottomColor: colors.border }]}
                  onPress={() => {
                    setCurrency(curr.code);
                    setShowCurrencyModal(false);
                  }}
                >
                  <Text style={[styles.currencyName, { color: colors.text }]}>
                    {curr.symbol} {curr.name} ({curr.code})
                  </Text>
                  {currency === curr.code && (
                    <Text style={[styles.currencySelected, { color: colors.primary }]}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <View style={styles.modalButtons}>
              <CustomButton
                title="Cancel"
                onPress={() => setShowCurrencyModal(false)}
                variant="outline"
              />
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showPasscodeSetup} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Set Passcode</Text>

            <CustomInput
              label="New Passcode (4 digits)"
              value={newPasscode}
              onChangeText={setNewPasscode}
              placeholder="Enter 4-digit passcode"
              keyboardType="numeric"
            />

            <CustomInput
              label="Confirm Passcode"
              value={confirmPasscode}
              onChangeText={setConfirmPasscode}
              placeholder="Confirm passcode"
              keyboardType="numeric"
            />

            <View style={styles.modalButtons}>
              <CustomButton
                title="Cancel"
                onPress={() => {
                  setShowPasscodeSetup(false);
                  setNewPasscode('');
                  setConfirmPasscode('');
                }}
                variant="outline"
              />
              <CustomButton
                title="Save"
                onPress={savePasscode}
              />
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showPasscodeTestModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.confirmationModal}>
            <Text style={styles.modalTitle}>✅ Passcode Enabled</Text>
            <Text style={styles.modalMessage}>
              Your passcode has been set successfully.{"\n"}You'll be asked to enter it the next time you open the app.
            </Text>
            <CustomButton
              title="Got it"
              onPress={() => setShowPasscodeTestModal(false)}
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};