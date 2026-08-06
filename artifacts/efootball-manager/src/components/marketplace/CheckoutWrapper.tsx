import React from 'react';
import { CheckoutCardForm } from './CheckoutCardForm';

interface CheckoutWrapperProps {
  amount: number;
  tradeId: string;
  onPaymentSuccess?: (paymentIntentId: string) => void;
  onCancel?: () => void;
}

export const CheckoutWrapper: React.FC<CheckoutWrapperProps> = ({ amount, tradeId, onPaymentSuccess, onCancel }) => {
  return (
    <CheckoutCardForm amount={amount} tradeId={tradeId} onPaymentSuccess={onPaymentSuccess} onCancel={onCancel} />
  );
};
