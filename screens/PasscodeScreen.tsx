// PasscodeScreen.tsx
import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Delete } from 'lucide-react-native';
import { ThemeContext } from '../ThemeContext';
import { styles } from '../styles';

export const PasscodeScreen: React.FC<{ onUnlock: () => void }> = ({ onUnlock }) => {
  const { colors } = useContext(ThemeContext);
  const [passcode, setPasscode] = useState('');
  const [storedPasscode, setStoredPasscode] = useState('');

  useEffect(() => {
    loadPasscode();
  }, []);

  const loadPasscode = async () => {
    const stored = await AsyncStorage.getItem('passcode');
    if (stored) {
      setStoredPasscode(stored);
    }
  };

  const handleNumberPress = (num: string) => {
    if (passcode.length < 4) {
      const newPasscode = passcode + num;
      setPasscode(newPasscode);
      
      if (newPasscode.length === 4) {
        if (newPasscode === storedPasscode) {
          onUnlock();
        } else {
          Alert.alert('Error', 'Incorrect passcode');
          setPasscode('');
        }
      }
    }
  };

  const handleDelete = () => {
    setPasscode(passcode.slice(0, -1));
  };

  return (
    <View style={[styles.passcodeContainer, { backgroundColor: colors.background }]}>
      <View style={styles.passcodeHeader}>
        <Text style={[styles.passcodeTitle, { color: colors.text }]}>C4D Calculator</Text>
        <Text style={[styles.passcodeSubtitle, { color: colors.textSecondary }]}>Enter your passcode to continue</Text>
      </View>
      
      <View style={styles.passcodeDisplay}>
        {[0, 1, 2, 3].map((index) => (
          <View
            key={index}
            style={[
              styles.passcodeDot,
              { 
                backgroundColor: passcode.length > index ? colors.primary : 'transparent',
                borderColor: colors.border 
              }
            ]}
          />
        ))}
      </View>

      <View style={styles.passcodeKeypad}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <TouchableOpacity
            key={num}
            style={[styles.passcodeKey, { 
              backgroundColor: colors.surface,
              shadowColor: colors.text,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }]}
            onPress={() => handleNumberPress(num.toString())}
          >
            <Text style={[styles.passcodeKeyText, { color: colors.text }]}>{num}</Text>
          </TouchableOpacity>
        ))}
        
        {/* Empty space for layout */}
        <View style={styles.passcodeKey} />
        
        {/* Zero button */}
        <TouchableOpacity
          style={[styles.passcodeKey, { 
            backgroundColor: colors.surface,
            shadowColor: colors.text,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }]}
          onPress={() => handleNumberPress('0')}
        >
          <Text style={[styles.passcodeKeyText, { color: colors.text }]}>0</Text>
        </TouchableOpacity>
        
        {/* Delete/Backspace button */}
        <TouchableOpacity
          style={[styles.passcodeKey, { 
            backgroundColor: colors.surface,
            shadowColor: colors.text,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }]}
          onPress={handleDelete}
        >
          <Delete size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
};