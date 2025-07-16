// utils.ts
import { AmortizationRow } from './types';

export const formatCurrency = (amount: number, currency: string): string => {
  const symbols = { USD: '$', EUR: '€', INR: '₹', GBP: '£', JPY: '¥', CAD: 'C$' };
  const symbol = symbols[currency as keyof typeof symbols] || '$';
  return `${symbol}${amount.toLocaleString('en-US', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
};

export const calculateLoan = (amount: number, rate: number, term: number) => {
  const monthlyRate = rate / 100 / 12;
  const numPayments = term * 12;
  const monthlyPayment = (amount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                        (Math.pow(1 + monthlyRate, numPayments) - 1);
  const totalCost = monthlyPayment * numPayments;
  return { monthlyPayment, totalCost };
};

export const generateAmortization = (
  amount: number, 
  rate: number, 
  term: number, 
  extraMonthly: number = 0,
  prepayments: number = 0
): AmortizationRow[] => {
  const monthlyRate = rate / 100 / 12;
  const schedule: AmortizationRow[] = [];
  let balance = amount - prepayments;
  const basePayment = calculateLoan(amount, rate, term).monthlyPayment;
  
  for (let month = 1; balance > 0 && month <= term * 12; month++) {
    const interestPayment = balance * monthlyRate;
    const principalPayment = Math.min(basePayment + extraMonthly - interestPayment, balance);
    const totalPayment = interestPayment + principalPayment;
    balance -= principalPayment;
    
    schedule.push({
      month,
      payment: totalPayment,
      interest: interestPayment,
      principal: principalPayment,
      balance: Math.max(balance, 0)
    });
  }
  
  return schedule;
};