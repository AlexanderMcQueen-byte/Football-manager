import React, { useMemo, useState } from 'react';
import { Lock, CreditCard, CheckCircle2 } from 'lucide-react';

interface CheckoutCardFormProps {
  amount: number;
  tradeId: string;
  onPaymentSuccess?: (paymentIntentId: string) => void;
  onCancel?: () => void;
}

export const CheckoutCardForm: React.FC<CheckoutCardFormProps> = ({ amount, tradeId, onPaymentSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const amountLabel = useMemo(() => `$${amount.toFixed(0)} USD`, [amount]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    const response = await fetch('/api/payments/create-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, tradeId, buyerEmail: 'buyer@example.com' }),
    });

    const paymentIntentData = await response.json();

    if (!response.ok) {
      setMessage(paymentIntentData.error || 'Unable to initialize Paystack payment.');
      setLoading(false);
      return;
    }

    if (paymentIntentData?.data?.authorization_url) {
      const reference = paymentIntentData.paymentIntentId || paymentIntentData.data.reference;
      window.location.href = paymentIntentData.data.authorization_url;
      setSuccess(true);
      setMessage('Redirecting you to Paystack to complete your payment securely.');
      onPaymentSuccess?.(reference);
      setLoading(false);
      return;
    }

    setMessage('Paystack payment could not be started.');
    setLoading(false);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-indigo-950">Pay with Paystack</h3>
          <p className="text-xs text-slate-500">You will be redirected to Paystack to complete your card payment securely.</p>
        </div>
        <div className="rounded-full bg-indigo-950 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-orange-400">
          {amountLabel}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-xl border border-slate-300 bg-slate-50 p-3 text-sm text-slate-700">
          <div className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-700">
            <CreditCard className="h-4 w-4 text-orange-500" />
            Secure checkout
          </div>
          <p className="text-sm text-slate-600">Paystack will handle the card payment flow and return you to the app after confirmation.</p>
        </div>

        {message && (
          <div className={`rounded-xl border px-3 py-2 text-xs font-semibold ${success ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-amber-300 bg-amber-50 text-amber-800'}`}>
            {success ? <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" />{message}</div> : message}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-xl bg-indigo-950 px-4 py-3 text-sm font-black text-white transition hover:bg-indigo-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Preparing Paystack…' : `Pay ${amountLabel}`}
          </button>
          {onCancel && (
            <button type="button" onClick={onCancel} className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700">
              Cancel
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <Lock className="h-3.5 w-3.5 text-emerald-600" />
          Payments are processed securely with Paystack. Funds remain in escrow until release.
        </div>
      </form>
    </div>
  );
};
