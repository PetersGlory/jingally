import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { MapPin, Truck, Info, X, ChevronDown, ArrowRight, Loader, Check } from 'lucide-react';
import styles from './PackageDelivery.module.css';

interface CountryCode {
  code: string;
  name: string;
  flag: string;
  dial_code: string;
}

interface Address {
  id: string;
  street: string;
  city: string;
  postcode: string;
  country: string;
  isDefault: boolean;
}

interface Receiver {
  name: string;
  phone: string;
  email: string;
  countryCode: string;
}

interface DeliveryForm {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  placeId: string;
  type: 'delivery';
}

const countryCodes: CountryCode[] = [
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', dial_code: '+44' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', dial_code: '+234' },
  { code: 'GM', name: 'Gambia', flag: '🇬🇲', dial_code: '+220' },
];

export default function PackageDelivery({ handleNextStep, handlePreviousStep }: { handleNextStep: () => void, handlePreviousStep: () => void }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedPickupAddressId, setSelectedPickupAddressId] = useState<string>('');
  const [selectedDeliveryAddressId, setSelectedDeliveryAddressId] = useState<string>('');
  const [deliveryMode, setDeliveryMode] = useState<'home' | 'park'>('home');
  const [receiver, setReceiver] = useState<Receiver>({
    name: '',
    phone: '',
    email: '',
    countryCode: '+44'
  });
  const [deliveryForm, setDeliveryForm] = useState<DeliveryForm>({
    street: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    latitude: 0,
    longitude: 0,
    placeId: '',
    type: 'delivery'
  });
  const [formErrors, setFormErrors] = useState<Partial<DeliveryForm>>({});
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchAddresses = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          router.push('/sign-in');
          return;
        }
        const response = await fetch('/api/addresses', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setAddresses(data);
        } else {
          alert('Failed to fetch addresses');
        }
      } catch (error) {
        console.error('Error fetching addresses:', error);
        alert('An error occurred while fetching addresses');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAddresses();
  }, []);

  const isValidForm = () => {
    const phoneRegex = /^[0-9]{10,15}$/;
    return (
      selectedPickupAddressId !== '' &&
      receiver.name.trim() !== '' &&
      receiver.phone.trim() !== '' &&
      phoneRegex.test(receiver.phone.trim())
    );
  };

  const handleSubmit = async () => {
    if (!isValidForm()) {
      alert('Please fill in all required fields correctly');
      return;
    }

    try {
      setIsLoading(true);
      const packageInfoStr = localStorage.getItem('packageInfo');
      if (!packageInfoStr) {
        alert('Package information not found');
        return;
      }

      const packageInfo = JSON.parse(packageInfoStr);
      const deliveryAddress = addresses.find(addr => addr.id === selectedDeliveryAddressId);
      const pickupAddress = addresses.find(addr => addr.id === selectedPickupAddressId);

      const deliveryDetails = {
        deliveryAddress: deliveryForm || deliveryAddress || {},
        pickupAddress: pickupAddress || {},
        receiverName: receiver.name.trim(),
        receiverEmail: receiver.email.trim(),
        receiverPhoneNumber: receiver.phone.trim()
      };

      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/shipment/${packageInfo.id}/delivery`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(deliveryDetails)
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('packageInfo', JSON.stringify(data));
        handleNextStep();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to update delivery details');
      }
    } catch (error: any) {
      console.error('Error saving delivery details:', error);
      alert(error.message || 'Failed to save delivery details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderInput = (
    label: string,
    value: string,
    onChange: (value: string) => void,
    placeholder: string,
    isOptional: boolean = false,
    type: string = 'text'
  ) => (
    <div className={styles.inputGroup}>
      <label className={styles.label}>
        {label} {isOptional && <span className={styles.optional}>(Optional)</span>}
      </label>
      <input
        type={type}
        className={styles.input}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );

  const renderAddressSection = (
    title: string,
    icon: React.ReactNode,
    selectedAddressId: string,
    setSelectedAddressId: (id: string) => void
  ) => (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <div className={styles.iconContainer}>
          {icon}
        </div>
        <h2 className={styles.sectionTitle}>{title}</h2>
      </div>

      <div className={styles.addressList}>
        {addresses.map((address) => (
          <div
            key={address.id}
            className={`${styles.addressCard} ${selectedAddressId === address.id ? styles.selected : ''}`}
            onClick={() => setSelectedAddressId(address.id)}
          >
            <div className={styles.addressHeader}>
              <div className={styles.addressIcon}>
                <MapPin size={20} />
              </div>
              <span className={styles.addressType}>
                {address.isDefault ? 'Default Address' : 'Address'}
              </span>
              {address.isDefault && (
                <span className={styles.defaultBadge}>Default</span>
              )}
            </div>
            
            <p className={styles.addressText}>
              {address.street}<br />
              {address.city}, {address.postcode}<br />
              {address.country}
            </p>
          </div>
        ))}

        <button
          className={styles.addAddressButton}
          onClick={() => router.push('/settings/add-address')}
        >
          Add New Address
        </button>
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Delivery Details</h1>
        <button 
          className={styles.cancelButton}
          onClick={() => router.back()}
        >
          Cancel
        </button>
      </header>

      <main className={styles.main}>
        {/* Delivery Mode */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <MapPin size={20} />
            <h2 className={styles.sectionTitle}>Delivery Mode</h2>
          </div>
          <div className={styles.deliveryModeButtons}>
            <button
              className={`${styles.modeButton} ${deliveryMode === 'home' ? styles.active : ''}`}
              onClick={() => setDeliveryMode('home')}
            >
              Home
            </button>
            <button
              className={`${styles.modeButton} ${deliveryMode === 'park' ? styles.active : ''}`}
              onClick={() => {
                alert('Park delivery is not available yet');
                setDeliveryMode('home');
              }}
            >
              Park
            </button>
          </div>
        </div>

        {/* Delivery Address Form */}
        {deliveryMode === 'home' && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <MapPin size={20} />
              <h2 className={styles.sectionTitle}>Delivery Address</h2>
            </div>

            <div className={styles.addressForm}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Street Address</label>
                <input
                  type="text"
                  className={`${styles.input} ${formErrors.street ? styles.error : ''}`}
                  placeholder="Search for an address"
                  value={deliveryForm.street}
                  onChange={(e) => setDeliveryForm({ ...deliveryForm, street: e.target.value })}
                />
                {formErrors.street && (
                  <span className={styles.errorMessage}>{formErrors.street}</span>
                )}
              </div>

              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>City</label>
                  <input
                    type="text"
                    className={`${styles.input} ${formErrors.city ? styles.error : ''}`}
                    placeholder="City"
                    value={deliveryForm.city}
                    onChange={(e) => setDeliveryForm({ ...deliveryForm, city: e.target.value })}
                  />
                  {formErrors.city && (
                    <span className={styles.errorMessage}>{formErrors.city}</span>
                  )}
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>State</label>
                  <input
                    type="text"
                    className={`${styles.input} ${formErrors.state ? styles.error : ''}`}
                    placeholder="State"
                    value={deliveryForm.state}
                    onChange={(e) => setDeliveryForm({ ...deliveryForm, state: e.target.value })}
                  />
                  {formErrors.state && (
                    <span className={styles.errorMessage}>{formErrors.state}</span>
                  )}
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Country</label>
                  <input
                    type="text"
                    className={`${styles.input} ${formErrors.country ? styles.error : ''}`}
                    placeholder="Country"
                    value={deliveryForm.country}
                    onChange={(e) => setDeliveryForm({ ...deliveryForm, country: e.target.value })}
                  />
                  {formErrors.country && (
                    <span className={styles.errorMessage}>{formErrors.country}</span>
                  )}
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>ZIP Code</label>
                  <input
                    type="text"
                    className={`${styles.input} ${formErrors.zipCode ? styles.error : ''}`}
                    placeholder="ZIP code"
                    value={deliveryForm.zipCode}
                    onChange={(e) => setDeliveryForm({ ...deliveryForm, zipCode: e.target.value })}
                  />
                  {formErrors.zipCode && (
                    <span className={styles.errorMessage}>{formErrors.zipCode}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Receiver Details */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Receiver Details</h2>
          
          {renderInput(
            'Full Name',
            receiver.name,
            (text) => setReceiver({ ...receiver, name: text }),
            'Enter receiver\'s full name'
          )}

          {renderInput(
            'Email Address',
            receiver.email,
            (text) => setReceiver({ ...receiver, email: text }),
            'Enter receiver\'s email address',
            true
          )}

          <div className={styles.inputGroup}>
            <label className={styles.label}>Phone Number</label>
            <div className={styles.phoneInput}>
              <button
                className={styles.countryCodeButton}
                onClick={() => setShowCountryModal(true)}
              >
                <span className={styles.flag}>
                  {countryCodes.find(c => c.dial_code === receiver.countryCode)?.flag}
                </span>
                <span className={styles.dialCode}>{receiver.countryCode}</span>
                <ChevronDown size={16} />
              </button>
              <input
                type="tel"
                className={styles.phoneNumberInput}
                placeholder="Enter phone number"
                value={receiver.phone}
                onChange={(e) => setReceiver({ ...receiver, phone: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Pickup Address */}
        {renderAddressSection(
          'Pickup Address',
          <Truck size={20} />,
          selectedPickupAddressId,
          setSelectedPickupAddressId
        )}

        {/* Info Note */}
        <div className={styles.infoNote}>
          <Info size={20} />
          <div>
            <h3>Important Note</h3>
            <p>
              Please ensure all address details are accurate. The driver will contact the receiver before delivery.
            </p>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <button
          className={`${styles.continueButton} ${!isValidForm() || isLoading ? styles.disabled : ''}`}
          onClick={handleSubmit}
          disabled={!isValidForm() || isLoading}
        >
          {isLoading ? (
            <>
              <Loader size={20} className={styles.spinner} />
              Saving...
            </>
          ) : (
            <>
              Continue
              <ArrowRight size={20} />
            </>
          )}
        </button>
      </footer>

      {/* Country Code Modal */}
      {showCountryModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Select Country</h2>
              <button onClick={() => setShowCountryModal(false)}>
                <X size={24} />
              </button>
            </div>
            <div className={styles.modalContent}>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search countries"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className={styles.countryList}>
                {countryCodes
                  .filter(country => 
                    country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    country.dial_code.includes(searchQuery)
                  )
                  .map(country => (
                    <button
                      key={country.code}
                      className={`${styles.countryItem} ${receiver.countryCode === country.dial_code ? styles.selected : ''}`}
                      onClick={() => {
                        setReceiver({ ...receiver, countryCode: country.dial_code });
                        setShowCountryModal(false);
                      }}
                    >
                      <span className={styles.flag}>{country.flag}</span>
                      <div className={styles.countryInfo}>
                        <span className={styles.countryName}>{country.name}</span>
                        <span className={styles.dialCode}>{country.dial_code}</span>
                      </div>
                      {receiver.countryCode === country.dial_code && (
                        <div className={styles.checkIcon}>
                          <Check size={20} />
                        </div>
                      )}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
