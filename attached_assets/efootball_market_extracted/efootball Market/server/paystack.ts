import axios from 'axios';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

export interface PaystackPaymentInitResult {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export async function initializePaystackPayment(amountInKobo: number, email: string, reference: string, callbackUrl?: string) {
  if (!PAYSTACK_SECRET_KEY) {
    throw new Error('PAYSTACK_SECRET_KEY is required for real Paystack checkout.');
  }

  try {
    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      {
        email,
        amount: amountInKobo,
        reference,
        currency: 'KES',
        ...(callbackUrl ? { callback_url: callbackUrl } : {}),
        metadata: { reference },
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return response.data as PaystackPaymentInitResult;
  } catch (error: any) {
    console.error('Paystack initialization error:', error?.response?.data || error.message);
    throw new Error('Unable to initialize a real Paystack payment.');
  }
}

export async function verifyPaystackTransaction(reference: string) {
  if (!PAYSTACK_SECRET_KEY) {
    throw new Error('PAYSTACK_SECRET_KEY is required for real Paystack verification.');
  }

  try {
    const response = await axios.get(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Paystack verification error:', error?.response?.data || error.message);
    throw new Error('Unable to verify the real Paystack transaction.');
  }
}
