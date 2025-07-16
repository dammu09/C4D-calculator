// Components.tsx
import React, { useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemeContext } from './ThemeContext';

export const CustomInput: React.FC<{
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'numeric' | 'default';
  suffix?: string;
  multiline?: boolean;
}> = ({ label, value, onChangeText, placeholder, keyboardType = 'numeric', suffix, multiline }) => {
  const { colors } = useContext(ThemeContext);
  
  return (
    <View style={[styles.inputContainer, { borderColor: colors.border }]}>
      <Text style={[styles.inputLabel, { color: colors.text }]}>{label}</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={[
            styles.input, 
            { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border },
            multiline && { height: 80, textAlignVertical: 'top' }
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          keyboardType={keyboardType}
          multiline={multiline}
        />
        {suffix && <Text style={[styles.inputSuffix, { color: colors.textSecondary }]}>{suffix}</Text>}
      </View>
    </View>
  );
};

export const CustomButton: React.FC<{
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  disabled?: boolean;
  icon?: string;
}> = ({ title, onPress, variant = 'primary', disabled, icon }) => {
  const { colors } = useContext(ThemeContext);
  
  const getButtonStyle = () => {
    if (disabled) return [styles.button, { backgroundColor: colors.textSecondary }];
    
    switch (variant) {
      case 'secondary':
        return [styles.button, { backgroundColor: colors.secondary }];
      case 'outline':
        return [styles.button, styles.buttonOutline, { borderColor: colors.primary }];
      case 'danger':
        return [styles.button, { backgroundColor: colors.error }];
      default:
        return [styles.button, { backgroundColor: colors.primary }];
    }
  };
  
  const getTextStyle = () => {
    if (variant === 'outline') return [styles.buttonText, { color: colors.primary }];
    return [styles.buttonText, { color: '#ffffff' }];
  };
  
  return (
    <TouchableOpacity style={getButtonStyle()} onPress={onPress} disabled={disabled}>
      <View style={styles.buttonContent}>
        {icon && <Text style={[styles.buttonIcon, getTextStyle()]}>{icon}</Text>}
        <Text style={getTextStyle()}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

export const ResultCard: React.FC<{
  title: string;
  value: string;
  subtitle?: string;
  color?: string;
  icon?: string;
}> = ({ title, value, subtitle, color, icon }) => {
  const { colors } = useContext(ThemeContext);
  
  return (
    <View style={[styles.resultCard, { backgroundColor: colors.surface }]}>
      <View style={styles.resultHeader}>
        {icon && <Text style={[styles.resultIcon, { color: color || colors.primary }]}>{icon}</Text>}
        <Text style={[styles.resultTitle, { color: colors.textSecondary }]}>{title}</Text>
      </View>
      <Text style={[styles.resultValue, { color: color || colors.text }]}>{value}</Text>
      {subtitle && <Text style={[styles.resultSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 52,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 17,
    fontWeight: '600',
    backgroundColor: 'transparent',
  },
  inputSuffix: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    elevation: 0,
    shadowOpacity: 0,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIcon: {
    marginRight: 8,
    fontSize: 16,
  },
  resultCard: {
    flex: 1,
    padding: 16,
    borderRadius: 20,
    borderWidth: 0,
    margin: 4,
    minHeight: 130,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  resultHeader: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 8,
    width: '100%',
  },
  resultIcon: {
    fontSize: 24,
    marginBottom: 6,
    textAlign: 'center',
  },
  resultTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
    lineHeight: 14,
  },
  resultValue: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: -0.3,
    textAlign: 'center',
    lineHeight: 24,
  },
  resultSubtitle: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 12,
    marginTop: 2,
  },
});