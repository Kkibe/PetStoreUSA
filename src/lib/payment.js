import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';

const FLW_PUBLIC_KEY = process.env.REACT_APP_FLW_PUBLIC_KEY;
const VERIFY_API = process.env.REACT_APP_VERIFY_API;

export function generateTxRef() {
  return `PN-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
}

export async function verifyTransaction(transactionId) {
  const res = await fetch(VERIFY_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: String(transactionId) }),
  });
  if (!res.ok) throw new Error(`Verification request failed (${res.status})`);
  const data = await res.json();
  return data;
}

export function usePayment() {
  const handleFlutterPayment = useFlutterwave({
    public_key: FLW_PUBLIC_KEY,
    tx_ref: generateTxRef(),
    payment_options: 'card, banktransfer, ussd, mobilemoney',
    customizations: {
      title: 'PetNest Checkout',
      description: 'Payment for your pet order',
      logo: 'https://checkout.flutterwave.com/assets/img/rave-logo.png',
    },
  });

  const pay = async ({ amount, customer, txRef, onVerified, onClose }) => {
    const ref = txRef || generateTxRef();
    handleFlutterPayment({
      callback: async (response) => {
        closePaymentModal();
        if (response.status === 'successful' && response.transaction_id) {
          try {
            const verified = await verifyTransaction(response.transaction_id);
            const isVerified =
              verified &&
              (verified.status === 'success' ||
                verified.data?.status === 'successful');
            onVerified({
              tx_ref: ref,
              transaction_id: String(response.transaction_id),
              status: isVerified ? 'verified' : 'unverified',
              amount: response.amount || amount,
              currency: response.currency || 'NGN',
              raw: verified,
            });
          } catch (err) {
            onVerified({
              tx_ref: ref,
              transaction_id: String(response.transaction_id),
              status: 'verify_failed',
              amount: response.amount || amount,
              currency: response.currency || 'NGN',
              error: err.message,
            });
          }
        } else {
          onVerified({
            tx_ref: ref,
            transaction_id: response.transaction_id ? String(response.transaction_id) : null,
            status: 'failed',
            amount,
            currency: 'NGN',
          });
        }
      },
      onClose: () => {
        if (onClose) onClose();
      },
    });
  };

  return { pay };
}
