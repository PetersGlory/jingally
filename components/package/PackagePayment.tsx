'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Shield, Check, X, Edit2 } from 'lucide-react';
import styles from './PackagePayment.module.css';
import { updatePaymentStatus } from '@/lib/shipment';

// Types
interface PaymentMethod {
  id: 'card' | 'paypal';
  name: string;
  description: string;
  icon: React.ReactNode;
  isEnabled: boolean;
}

interface CardDetails {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardHolderName: string;
}

interface CostItem {
  label: string;
  amount: string;
  type: 'regular' | 'total';
}

// Constants
const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '';

// Shipping method constants
const SHIPPING_METHODS = {
  AIR: 'air',
  JINGSLY: 'jingsly',
  FROZEN: 'frozen',
  SEA: 'sea'
} as const;

// Air freight price per kg
const AIR_PRICE_PER_KG = 10; // £10 per kg

// Jingslly price tiers
const JINGSLY_PRICES = {
  TIER_1: { maxWeight: 50, pricePerKg: 650 },
  TIER_2: { maxWeight: 100, pricePerKg: 550 },
  TIER_3: { minWeight: 101, pricePerKg: 500 }
};

// Frozen food price
const FROZEN_PRICE_PER_KG = 1100;

// Sea freight constants
const SEA_FREIGHT_PRICE_PER_CUBIC_METER = 300;
const SEA_MAX_WEIGHT_PER_ITEM = 40; // kg

export default function PackagePayment({ handleNextStep, handlePreviousStep }: { handleNextStep: () => void, handlePreviousStep: () => void }) {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod['id'] | null>(null);
  const [showCardModal, setShowCardModal] = useState(false);
  const [showPayPalModal, setShowPayPalModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [packageInfo, setPackageInfo] = useState<any>(null);
  const [token, setToken] = useState('');
  const [cardDetails, setCardDetails] = useState<CardDetails>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolderName: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [packageInfoStr, accessToken] = await Promise.all([
          localStorage.getItem('packageInfo'),
          localStorage.getItem('accessToken')
        ]);

        if (packageInfoStr && accessToken) {
          setPackageInfo(JSON.parse(packageInfoStr));
          setToken(JSON.parse(accessToken));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      description: 'Pay with your credit or debit card',
      icon: <CreditCard size={20} />,
      isEnabled: true
    },
    {
      id: 'paypal',
      name: 'PayPal',
      description: 'Pay with your PayPal account',
      icon: <CreditCard size={20} />,
      isEnabled: true
    }
  ];

  const calculateVolumetricWeight = (dimensions: { length: number; width: number; height: number }) => {
    return (dimensions.length * dimensions.width * dimensions.height) / 6000;
  };

  const calculateAirFreightPrice = (weight: number, dimensions: { length: number; width: number; height: number }) => {
    const volumetricWeight = calculateVolumetricWeight(dimensions);
    const chargeableWeight = Math.max(weight, volumetricWeight);
    return chargeableWeight * AIR_PRICE_PER_KG;
  };

  const calculateJingsllyPrice = (weight: number) => {
    if (weight <= JINGSLY_PRICES.TIER_1.maxWeight) {
      return weight * JINGSLY_PRICES.TIER_1.pricePerKg;
    } else if (weight <= JINGSLY_PRICES.TIER_2.maxWeight) {
      return weight * JINGSLY_PRICES.TIER_2.pricePerKg;
    } else {
      return weight * JINGSLY_PRICES.TIER_3.pricePerKg;
    }
  };

  const calculateSeaFreightPrice = (dimensions: { length: number; width: number; height: number }) => {
    const volume = (dimensions.length * dimensions.width * dimensions.height) / 1000000; // Convert to cubic meters
    return volume * SEA_FREIGHT_PRICE_PER_CUBIC_METER;
  };

  const calculateCosts = (): CostItem[] => {
    if (!packageInfo) return [];
    
    const { weight, dimensions, serviceType } = packageInfo;
    let baseFee = 0;
    let methodName = '';

    switch (serviceType) {
      case SHIPPING_METHODS.AIR:
        baseFee = calculateAirFreightPrice(weight, dimensions);
        methodName = 'Air Freight';
        break;
      case SHIPPING_METHODS.JINGSLY:
        baseFee = calculateJingsllyPrice(weight);
        methodName = 'Jingslly Logistics';
        break;
      case SHIPPING_METHODS.FROZEN:
        baseFee = weight * FROZEN_PRICE_PER_KG;
        methodName = 'Frozen Food Shipping';
        break;
      case SHIPPING_METHODS.SEA:
        if (weight > SEA_MAX_WEIGHT_PER_ITEM) {
          throw new Error(`Sea freight items cannot exceed ${SEA_MAX_WEIGHT_PER_ITEM}kg per item`);
        }
        baseFee = calculateSeaFreightPrice(dimensions);
        methodName = 'Sea Freight';
        break;
      default:
        throw new Error('Invalid shipping method');
    }

    const serviceFee = Math.round(baseFee * 0.1 * 100) / 100;
    const vat = Math.round((baseFee + serviceFee) * 0.2 * 100) / 100;
    const total = Math.round((baseFee + serviceFee + vat) * 100) / 100;

    return [
      { label: `${methodName} Fee`, amount: `£${baseFee.toFixed(2)}`, type: 'regular' },
      { label: 'Service Fee', amount: `£${serviceFee.toFixed(2)}`, type: 'regular' },
      { label: 'VAT (20%)', amount: `£${vat.toFixed(2)}`, type: 'regular' },
      { label: 'Total', amount: `£${total.toFixed(2)}`, type: 'total' }
    ];
  };

  const costs = calculateCosts();

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
    setCardDetails({ ...cardDetails, cardNumber: value });
  };

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1/$2')
      .substr(0, 5);
    setCardDetails({ ...cardDetails, expiryDate: value });
  };

  const validateCard = () => {
    if (cardDetails.cardNumber.replace(/\s/g, '').length !== 16) {
      alert('Please enter a valid 16-digit card number');
      return false;
    }
    if (!/^\d{2}\/\d{2}$/.test(cardDetails.expiryDate)) {
      alert('Please enter a valid expiry date (MM/YY)');
      return false;
    }
    if (cardDetails.cvv.length !== 3) {
      alert('Please enter a valid 3-digit CVV');
      return false;
    }
    if (!cardDetails.cardHolderName.trim()) {
      alert('Please enter the cardholder name');
      return false;
    }
    return true;
  };

  const handlePayment = async () => {
    if (!selectedMethod) {
      alert('Please select a payment method');
      return;
    }

    try {
      setIsLoading(true);

      if (selectedMethod === 'paypal') {
        setShowPayPalModal(true);
        return;
      }

      const amount = parseFloat(costs.find(c => c.type === 'total')?.amount.replace('£', '') || '0');
      const paymentDetails = {
        method: 'card',
        amount,
        currency: 'GBP',
        card: {
          ...cardDetails,
          cardNumber: cardDetails.cardNumber.replace(/\s/g, '')
        }
      };

      const paymentResponse = await updatePaymentStatus(
        packageInfo.id,
        {
            ...paymentDetails
          },
        token
      );

      if (paymentResponse.success) {
        localStorage.setItem('packageInfo', JSON.stringify(paymentResponse.data));
        setShowSuccessModal(true);
        
      setTimeout(() => {
        setShowSuccessModal(false);
        router.replace("/dashboard/shipments");
        }, 2000);
      } else {
        console.log(paymentResponse.message || 'Payment failed');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      alert(error.message || 'Payment failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Payment</h1>
        <button 
          className={styles.cancelButton}
          onClick={() => router.back()}
        >
          Cancel
        </button>
      </header>

      <main className={styles.main}>
        {/* Package Summary */}
        {packageInfo && (
          <div className={styles.summarySection}>
            <h2 className={styles.sectionTitle}>Package Summary</h2>
            <div className={styles.summaryGrid}>
              <div className={styles.summaryItem}>
                <span>Tracking Number</span>
                <span>{packageInfo.trackingNumber}</span>
              </div>
              <div className={styles.summaryItem}>
                <span>Weight</span>
                <span>{packageInfo.weight}kg</span>
              </div>
              <div className={styles.summaryItem}>
                <span>Dimensions</span>
                <span>
                  {packageInfo.dimensions.length}x{packageInfo.dimensions.width}x{packageInfo.dimensions.height}cm
                </span>
              </div>
              <div className={styles.summaryItem}>
                <span>Receiver</span>
                <span>{packageInfo.receiverName}</span>
              </div>
              <div className={styles.summaryItem}>
                <span>Pickup Date</span>
                <span>
                  {new Date(packageInfo.scheduledPickupTime).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <div className={styles.summaryItem}>
                <span>Delivery Address</span>
                <span>
                  {packageInfo.deliveryAddress.street}, {packageInfo.deliveryAddress.city}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Cost Breakdown */}
        <div className={styles.costSection}>
          <h2 className={styles.sectionTitle}>Cost Breakdown</h2>
          <div className={styles.costList}>
            {costs.map((item) => (
              <div 
                key={item.label}
                className={`${styles.costItem} ${item.type === 'total' ? styles.totalItem : ''}`}
              >
                <span className={item.type === 'total' ? styles.totalLabel : ''}>
                  {item.label}
                </span>
                <span className={item.type === 'total' ? styles.totalAmount : ''}>
                  {item.amount}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div className={styles.paymentSection}>
          <h2 className={styles.sectionTitle}>Select Payment Method</h2>
          <div className={styles.paymentMethods}>
            {paymentMethods.map((method) => {
              const isSelected = selectedMethod === method.id;
              return (
                <button
                  key={method.id}
                  className={`${styles.paymentMethod} ${isSelected ? styles.selected : ''}`}
                  onClick={() => {
                    if (method.id === 'card') {
                      setShowCardModal(true);
                    } else {
                      setSelectedMethod(method.id);
                    }
                  }}
                  disabled={!method.isEnabled}
                >
                  <div className={styles.methodContent}>
                    <div className={`${styles.methodIcon} ${isSelected ? styles.selectedIcon : ''}`}>
                      {method.icon}
                    </div>
                    <div className={styles.methodInfo}>
                      <h3>{method.name}</h3>
                      <p>{method.description}</p>
                    </div>
                    {method.id === 'card' && cardDetails.cardNumber && (
                      <button 
                        className={styles.editButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowCardModal(true);
                        }}
                      >
                        <Edit2 size={16} />
                      </button>
                    )}
                    {isSelected && <Check size={20} className={styles.checkIcon} />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Security Note */}
        <div className={styles.securityNote}>
          <Shield size={20} />
          <div>
            <h3>Secure Payment</h3>
            <p>
              Your payment information is encrypted and securely processed. We never store your complete card details.
            </p>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <button
          className={`${styles.payButton} ${selectedMethod && !isLoading ? styles.active : ''}`}
          disabled={!selectedMethod || isLoading}
          onClick={handlePayment}
        >
          {isLoading ? (
            'Processing...'
          ) : (
            selectedMethod === 'paypal' ? 'Pay with PayPal' : 
            selectedMethod ? `Pay ${costs.find(c => c.type === 'total')?.amount}` : 
            'Select Payment Method'
          )}
        </button>
      </footer>

      {/* Card Modal */}
      {showCardModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Add Card Details</h2>
              <button onClick={() => setShowCardModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div className={styles.modalContent}>
              <div className={styles.formGroup}>
                <label>Card Number</label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={cardDetails.cardNumber}
                  onChange={handleCardNumberChange}
                  maxLength={19}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Expiry Date</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={cardDetails.expiryDate}
                    onChange={handleExpiryDateChange}
                    maxLength={5}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>CVV</label>
                  <input
                    type="password"
                    placeholder="123"
                    value={cardDetails.cvv}
                    onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                    maxLength={3}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Cardholder Name</label>
                <input
                  type="text"
                  placeholder="JOHN SMITH"
                  value={cardDetails.cardHolderName}
                  onChange={(e) => setCardDetails({ ...cardDetails, cardHolderName: e.target.value })}
                />
              </div>

              <button
                className={styles.saveButton}
                onClick={() => {
                  if (validateCard()) {
                    setSelectedMethod('card');
                    setShowCardModal(false);
                  }
                }}
              >
                Save Card
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.successModal}>
            <div className={styles.successIcon}>
              <Check size={32} />
            </div>
            <h2>Payment Successful!</h2>
            <p>
              Your payment has been processed successfully. You will be redirected to tracking shortly.
            </p>
            <div className={styles.progressBar}>
              <div className={styles.progress} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
