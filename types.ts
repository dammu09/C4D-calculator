// types.ts
export interface Loan {
    id: string;
    name: string;
    amount: number;
    rate: number;
    term: number;
    monthlyPayment: number;
    totalCost: number;
    prepayments?: number;
    extraMonthly?: number;
  }
  
  export interface PrepaymentScenario {
    id: string;
    loanId: string;
    name: string;
    extraMonthly: number;
    prepayments: number;
    createdAt: string;
  }
  
  export interface AmortizationRow {
    month: number;
    payment: number;
    interest: number;
    principal: number;
    balance: number;
  }
  
  export interface ThemeColors {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
  }
  
  export interface ThemeContextType {
    isDark: boolean;
    colors: ThemeColors;
    toggleTheme: () => void;
    currency: string;
    setCurrency: (currency: string) => void;
  }