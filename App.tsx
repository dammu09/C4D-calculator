// App.tsx
import React, { useState, useEffect, useContext } from 'react';
import { Platform, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Calculator, CreditCard, TrendingUp, Save, Settings } from 'lucide-react-native';

import { ThemeProvider, ThemeContext } from './ThemeContext';
import { 
  SplashScreen,
  PasscodeScreen, 
  CalculatorScreen, 
  DebtIncomeScreen, 
  SavedLoansScreen, 
  AmortizationScreen, 
  SettingsScreen,
  PrepaymentHistoryScreen
} from './screens';

// Navigation Setup
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const SavedLoansStack = () => {
  const { colors } = useContext(ThemeContext);
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '600' }
      }}
    >
      <Stack.Screen 
        name="SavedLoansList" 
        component={SavedLoansScreen} 
        options={{ title: 'Saved Loans' }}
      />
      <Stack.Screen 
        name="Amortization" 
        component={AmortizationScreen} 
        options={{ title: 'Amortization Schedule' }}
      />
      <Stack.Screen 
        name="PrepaymentHistory" 
        component={PrepaymentHistoryScreen} 
        options={{ title: 'Prepayment History' }}
      />
    </Stack.Navigator>
  );
};

const AmortizationStack = () => {
  const { colors } = useContext(ThemeContext);
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '600' }
      }}
    >
      <Stack.Screen 
        name="AmortizationMain" 
        component={AmortizationScreen} 
        options={{ title: 'Amortization' }}
      />
      <Stack.Screen 
        name="PrepaymentHistory" 
        component={PrepaymentHistoryScreen} 
        options={{ title: 'Prepayment History' }}
      />
    </Stack.Navigator>
  );
};

const TabNavigator = () => {
  const { colors } = useContext(ThemeContext);
  
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: { 
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingBottom: Platform.OS === 'ios' ? 20 : 5,
          height: Platform.OS === 'ios' ? 85 : 60
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '600' },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '500' }
      }}
    >
      <Tab.Screen 
        name="Calculator" 
        component={CalculatorScreen}
        options={{
          title: 'Calculator',
          tabBarIcon: ({ color, size }) => <Calculator size={size || 24} color={color} />
        }}
      />
      <Tab.Screen 
        name="DebtIncome" 
        component={DebtIncomeScreen}
        options={{
          title: 'DTI Calculator',
          tabBarIcon: ({ color, size }) => <CreditCard size={size || 24} color={color} />
        }}
      />
      <Tab.Screen 
        name="AmortizationTab" 
        component={AmortizationStack}
        options={{
          title: 'Amortization',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <TrendingUp size={size || 24} color={color} />
        }}
      />
      <Tab.Screen 
        name="SavedLoans" 
        component={SavedLoansStack}
        options={{
          title: 'Saved Loans',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Save size={size || 24} color={color} />
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Settings size={size || 24} color={color} />
        }}
        initialParams={{ navigation: undefined }}
      />
    </Tab.Navigator>
  );
};

// Main App Component with Passcode Protection
const AppContent: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(true);
  const [isPasscodeEnabled, setIsPasscodeEnabled] = useState(false);

  useEffect(() => {
    checkPasscodeProtection();
  }, []);

  const checkPasscodeProtection = async () => {
    const passcode = await AsyncStorage.getItem('passcode');
    if (passcode) {
      setIsPasscodeEnabled(true);
      setIsUnlocked(false);
    }
  };

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  const handleUnlock = () => {
    setIsUnlocked(true);
  };

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  if (isPasscodeEnabled && !isUnlocked) {
    return <PasscodeScreen onUnlock={handleUnlock} />;
  }

  return (
    <NavigationContainer>
      <TabNavigator />
    </NavigationContainer>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;