"use client"

import React, { useEffect, useState, useCallback } from 'react';
import { Package, Maximize2, Box, AlertCircle, ArrowRight, ArrowLeft, Plus } from 'lucide-react';
import styles from './PackageDimension.module.css';
import { useRouter } from 'next/navigation';
import { updatePackageDimensions } from '@/lib/guestShipment';
import { getPriceGuides } from '@/lib/guestShipment';

// Constants
const MAX_DIMENSION = 1000;
const MAX_WEIGHT = 40;

// Types
interface PackageDimensions {
  weight: string;
  length: string;
  width: string;
  height: string;
}

interface FormErrors {
  weight?: string;
  length?: string;
  width?: string;
  height?: string;
  general?: string;
}

interface Shipment {
  id: string;
  trackingNumber: string;
  status: string;
  packageType: string;
  serviceType: string;
  packageDescription: string;
  fragile: boolean;
  weight: number;
  dimensions: {
    width: number;
    height: number;
    length: number;
  };
  pickupAddress: {
    city: string;
    type: string;
    state: string;
    street: string;
    country: string;
    postcode: string;
  };
  deliveryAddress: {
    city: string;
    type: string;
    state: string;
    street: string;
    country: string;
    postcode: string;
  };
  scheduledPickupTime: string;
  estimatedDeliveryTime: string;
  receiverName: string;
  receiverPhoneNumber: string;
  receiverEmail: string;
  price: number | null;
  paymentStatus: string;
  notes: string | null;
  driverId: string | null;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

interface PriceGuide {
  id: string;
  guideName: string;
  guideNumber: string;
  price: number;
}

// Component: DimensionInput
const DimensionInput: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  max?: number;
  icon: React.ReactNode;
  placeholder: string;
}> = ({ label, value, onChange, error, icon, placeholder, max }) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = e.target.value.replace(/[^0-9.]/g, '');
    const finalValue = numericValue.replace(/(\..*)\./g, '$1');
    
    // if (max && parseFloat(finalValue) > max) {
    //   return;
    // }
    
    onChange(finalValue);
  };

  return (
    <div className={`${styles.inputContainer} ${error ? styles.error : ''} ${isFocused ? styles.focused : ''}`}>
      <label className={styles.label}>{label}</label>
      <div className={styles.inputWrapper}>
        <div className={styles.iconContainer}>
          {icon}
        </div>
        <input
          type="number"
          className={styles.input}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </div>
      {error && (
        <div className={styles.errorMessage}>
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

// Main Component
export default function PackageDimension({ 
  onNext, 
  onBack 
}: { 
  onNext: () => void, 
  onBack: () => void 
}) {
  const router = useRouter();
  const [token, setToken] = useState<string>("");
  const [formData, setFormData] = useState<PackageDimensions>({
    weight: '',
    length: '',
    width: '',
    height: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [guides, setGuides] = useState<PriceGuide[]>([]);
  const [shipInfo, setShipInfo] = useState<Shipment>();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGuides, setSelectedGuides] = useState<string[]>([]);
  const [extraguides, setExtraguides] = useState<PriceGuide[]>([]);

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    const packageInfo = localStorage.getItem('packageInfo');
    
    setToken('');
    getPricings('');
    setShipInfo(JSON.parse(packageInfo || '{}'));
  }, []);

  const toggleGuideSelection = (guideId: string) => {
    setSelectedGuides(prev => 
      prev.includes(guideId) 
        ? prev.filter(id => id !== guideId)
        : [...prev, guideId]
    );
  };

  const getPricings = async (token: string) => {
    try {
      setIsLoading(true);
      const response = await getPriceGuides();
      if (response) {
        setGuides(response.data);
      }
    } catch (err) {
      console.error('Error fetching price guides:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    const numericFields = ['weight', 'length', 'width', 'height'] as const;
    if(selectedGuides.length == 0){
    
    numericFields.forEach(field => {
      const value = formData[field];
      if (!value.trim()) {
        newErrors[field] = `Please enter package ${field}`;
      } else if (isNaN(Number(value)) || Number(value) <= 0) {
        newErrors[field] = `Please enter a valid ${field}`;
      } else if (Number(value) > MAX_DIMENSION) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} cannot exceed ${MAX_DIMENSION}`;
      }
    });

    setErrors(newErrors);
    }
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleInputChange = (field: keyof PackageDimensions, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined, general: undefined }));
  };

  const calculateVolume = useCallback((): string => {
    const { length, width, height } = formData;
    if (length && width && height) {
      const volume = Number(length) * Number(width) * Number(height);
      return volume.toFixed(2);
    }
    return '0.00';
  }, [formData]);

  const handleSubmit = async () => {

    if (!validateForm() && selectedGuides.length==0) return;

    const packageInfo = localStorage.getItem('packageInfo');
    const shipment = JSON.parse(packageInfo || '{}');
    
    if (parseFloat(formData.weight) > MAX_WEIGHT && shipment.serviceType !== 'airfreight') {
      setErrors(prev => ({ ...prev, weight: `Weight cannot exceed ${MAX_WEIGHT}kg` }));
      return;
    }

    try {
      setIsLoading(true);
      const packageId = shipment.id;
      
      let response;

      if(formData.weight !== "" && formData.length !== ""){
        response = await updatePackageDimensions(
          packageId,
          {
            weight: parseFloat(formData.weight),
            dimensions: {
              length: parseFloat(formData.length),
              width: parseFloat(formData.width),
              height: parseFloat(formData.height),
            }
          },
          token
        );
      }else{
        console.log(guides)
        const selectedPriceGuides = [...selectedGuides, ...extraguides].map(guideId => {
          const guide = [...guides, ...extraguides].find(g => g.id === guideId);
          if (!guide) return null;
          return {
            id: guide.id,
            guideName: guide.guideName,
            price: guide.price,
            guideNumber: guide.guideNumber
          };
        }).filter(Boolean);

        response = await updatePackageDimensions(
          packageId,
          {
            priceGuides: selectedPriceGuides,
          },
          token
        );
        console.log(selectedGuides)
      }
      
      if (response.success) {
        localStorage.setItem('packageInfo', JSON.stringify(response.data));
        localStorage.setItem('currentStep', '4');
        onNext();
      } else {
        throw new Error(response.message || 'Failed to update package dimensions');
      }
    } catch (error) {
      console.error('Error updating package dimensions:', error);
      setErrors(prev => ({ ...prev, general: 'An error occurred while updating package dimensions' }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className="flex flex-row items-center gap-4">
          <button 
            className={styles.backButton}
            onClick={onBack}
          >
            <ArrowLeft size={20} />
          </button>
          <h1>Package Dimensions</h1>
        </div>
        <button 
          className={styles.cancelButton}
          onClick={onBack}
        >
          Cancel
        </button>
      </header>

      <main className={styles.main}>
        <div className={styles.content}>
          <div className={styles.headerSection}>
            <h2 className={styles.title}>Package Dimensions</h2>
            <p className={styles.subtitle}>
              Enter the dimensions and weight of your package
            </p>
          </div>
          
          {errors.general && (
            <div className={styles.errorContainer}>
              <AlertCircle size={20} />
              <span>{errors.general}</span>
            </div>
          )}

          {shipInfo?.serviceType === "seafreight" && shipInfo.packageType == "items" ? (
            <div className={styles.priceGuideSection}>
              <h3 className={styles.sectionTitle}>Item Selection</h3>
              <div className={styles.filterSection}>
                <div className={styles.searchBox}>
                  <input
                    type="text"
                    placeholder="Search price guides..."
                    className={styles.searchInput}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className={styles.priceGuideList}>
                <div className={styles.addNewItem}>
                  <button 
                    className={styles.addButton}
                    onClick={() => {
                      const itemName = prompt('Enter item name:');
                      if (itemName) {
                        const newGuide: PriceGuide = {
                          id: 'custom-extraguide-'+Date.now().toString(),
                          guideName: itemName,
                          guideNumber: `CUSTOM-${Date.now()}`,
                          price: 0
                        };
                        setExtraguides(prev => [...prev, newGuide]);
                      }
                    }}
                  >
                    <Plus size={20} />
                    Add New Item
                  </button>
                </div>

                
                <div className={styles.extraItemsSection}>
                  <h4 className={styles.extraItemsTitle}>Extra Items Added</h4>
                  {extraguides.map((guide) => (
                    <div 
                      key={guide.id} 
                      className={`${styles.priceGuideItem} ${selectedGuides.includes(guide.id) ? styles.selected : ''} gap-3`}
                      onClick={() => toggleGuideSelection(guide.id)}
                    >
                      <div className={styles.checkbox}>
                        <input
                          type="checkbox"
                          checked={selectedGuides.includes(guide.id)}
                          onChange={() => {}}
                        />
                      </div>
                      <div className={styles.guideInfo}>
                        <h4>{guide.guideName}</h4>
                        <p>{guide.guideNumber}</p>
                        <span className={styles.price}>${guide.price}</span>
                      </div>
                      <div className={styles.quantityControls}>
                        <button 
                          className={styles.quantityButton}
                          onClick={(e) => {
                            e.stopPropagation();
                            const currentCount = selectedGuides.filter(id => id === guide.id).length;
                            if (currentCount > 0) {
                              const index = selectedGuides.indexOf(guide.id);
                              const newSelectedGuides = [...selectedGuides];
                              newSelectedGuides.splice(index, 1);
                              setSelectedGuides(newSelectedGuides);
                            }
                          }}
                        >
                          -
                        </button>
                        <span className={styles.quantity}>
                          {selectedGuides.filter(id => id === guide.id).length}
                        </span>
                        <button 
                          className={styles.quantityButton}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedGuides([...selectedGuides, guide.id]);
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                
                <h4 className={styles.extraItemsTitle}>Item List</h4>

                {guides
                  .filter(guide => 
                    guide.guideName.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((guide) => (
                    <div 
                      key={guide.id} 
                      className={`${styles.priceGuideItem} ${selectedGuides.includes(guide.id) ? styles.selected : ''} gap-3`}
                      onClick={() => toggleGuideSelection(guide.id)}
                    >
                      <div className={styles.checkbox}>
                        <input
                          type="checkbox"
                          checked={selectedGuides.includes(guide.id)}
                          onChange={() => {}}
                        />
                      </div>
                      <div className={styles.guideInfo}>
                        <h4>{guide.guideName}</h4>
                        <p>{guide.guideNumber}</p>
                        <span className={styles.price}>${guide.price}</span>
                      </div>
                      <div className={styles.quantityControls}>
                        <button 
                          className={styles.quantityButton}
                          onClick={(e) => {
                            e.stopPropagation();
                            const currentCount = selectedGuides.filter(id => id === guide.id).length;
                            if (currentCount > 0) {
                              const index = selectedGuides.indexOf(guide.id);
                              const newSelectedGuides = [...selectedGuides];
                              newSelectedGuides.splice(index, 1);
                              setSelectedGuides(newSelectedGuides);
                            }
                          }}
                        >
                          -
                        </button>
                        <span className={styles.quantity}>
                          {selectedGuides.filter(id => id === guide.id).length}
                        </span>
                        <button 
                          className={styles.quantityButton}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedGuides([...selectedGuides, guide.id]);
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ): shipInfo?.serviceType === "airfreight" ? (
            <>
              <div className={styles.priceGuideSection}>
                <h3 className={styles.sectionTitle}>Add Item</h3>
                
                <div className={styles.priceGuideList}>
                  <div className={styles.addNewItem}>
                    <button 
                      className={styles.addButton}
                      onClick={() => {
                        const modal = document.createElement('div');
                        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
                        modal.innerHTML = `
                          <div class="bg-white rounded-lg w-full max-w-md p-6">
                            <h3 class="text-xl font-semibold text-gray-900 mb-4">Add New Item</h3>
                            <div class="mb-4">
                              <label class="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                              <input type="text" id="itemName" placeholder="Enter item name" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div class="mb-4">
                              <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                              <textarea id="itemDescription" placeholder="Enter item description"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"></textarea>
                            </div>
                            <div class="flex justify-end gap-3">
                              <button class="cancleButton px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">Cancel</button>
                              <button class="confirmButton px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Add Item</button>
                            </div>
                          </div>
                        `;
                        document.body.appendChild(modal);

                        const closeModal = () => {
                          document.body.removeChild(modal);
                        };

                        const cancelButton = modal.querySelector(`.cancleButton`);
                        const confirmButton = modal.querySelector(`.confirmButton`);
                        const itemNameInput = modal.querySelector('#itemName') as HTMLInputElement;
                        const itemDescriptionInput = modal.querySelector('#itemDescription') as HTMLTextAreaElement;

                        cancelButton?.addEventListener('click', closeModal);
                        confirmButton?.addEventListener('click', () => {
                          const itemName = itemNameInput.value.trim();
                          const description = itemDescriptionInput.value.trim();
                          
                          if (itemName) {
                            const newGuide: PriceGuide = {
                              id: 'custom-extraguide-'+Date.now().toString(),
                              guideName: itemName,
                              guideNumber: description || `CUSTOM-${Date.now()}`,
                              price: 0
                            };
                            setExtraguides(prev => [...prev, newGuide]);
                            closeModal();
                          }
                        });
                      }}
                    >
                      <Plus size={20} />
                      Add New Item
                    </button>
                  </div>

                  
                  <div className={styles.extraItemsSection}>
                    <h4 className={styles.extraItemsTitle}>Added Items</h4>
                    {extraguides.map((guide) => (
                      <div 
                        key={guide.id} 
                        className={`${styles.priceGuideItem} ${selectedGuides.includes(guide.id) ? styles.selected : ''} gap-3`}
                        onClick={() => toggleGuideSelection(guide.id)}
                      >
                        <div className={styles.checkbox}>
                          <input
                            type="checkbox"
                            checked={selectedGuides.includes(guide.id)}
                            onChange={() => {}}
                          />
                        </div>
                        <div className={styles.guideInfo}>
                          <h4>{guide.guideName}</h4>
                          <p>{guide.guideNumber}</p>
                          <span className={styles.price}>${guide.price}</span>
                        </div>
                        <div className={styles.quantityControls}>
                          <button 
                            className={styles.quantityButton}
                            onClick={(e) => {
                              e.stopPropagation();
                              const currentCount = selectedGuides.filter(id => id === guide.id).length;
                              if (currentCount > 0) {
                                const index = selectedGuides.indexOf(guide.id);
                                const newSelectedGuides = [...selectedGuides];
                                newSelectedGuides.splice(index, 1);
                                setSelectedGuides(newSelectedGuides);
                              }
                            }}
                          >
                            -
                          </button>
                          <span className={styles.quantity}>
                            {selectedGuides.filter(id => id === guide.id).length}
                          </span>
                          <button 
                            className={styles.quantityButton}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedGuides([...selectedGuides, guide.id]);
                            }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) :(
            <>
              <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Weight</h3>
            <DimensionInput
              label="Weight (kg)"
              value={formData.weight}
              onChange={(value) => handleInputChange('weight', value)}
              error={errors.weight}
              icon={<Package size={20} />}
              max={MAX_WEIGHT}
              placeholder="Enter weight in kilograms"
            />
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Dimensions (cm)</h3>
            <div className={styles.dimensionsGrid}>
              <DimensionInput
                label="Length"
                value={formData.length}
                onChange={(value) => handleInputChange('length', value)}
                error={errors.length}
                icon={<Maximize2 size={20} />}
                placeholder="Enter length"
              />

              <DimensionInput
                label="Width"
                value={formData.width}
                onChange={(value) => handleInputChange('width', value)}
                error={errors.width}
                icon={<Maximize2 size={20} />}
                placeholder="Enter width"
              />

              <DimensionInput
                label="Height"
                value={formData.height}
                onChange={(value) => handleInputChange('height', value)}
                error={errors.height}
                icon={<Maximize2 size={20} />}
                placeholder="Enter height"
              />
            </div>
          </div>

          <div className={styles.volumeSection}>
            <div className={styles.volumeHeader}>
              <div className={styles.volumeIcon}>
                <Box size={20} />
              </div>
              <h3 className={styles.volumeTitle}>Total Volume</h3>
            </div>
            <p className={styles.volumeValue}>
              {calculateVolume()} cm³
            </p>
            <p className={styles.volumeSubtitle}>
              Calculated based on length × width × height
            </p>
          </div>
            </>
          )}          

          <button
            className={`${styles.submitButton} ${isLoading ? styles.loading : ''}`}
            onClick={handleSubmit}
            type='button'
            disabled={isLoading}
          >
            {isLoading ? (
              'Updating...'
            ) : (
              <div className='flex flex-row items-center gap-2'>
                Continue
                <ArrowRight size={20} />
              </div>
            )}
          </button>
        </div>
      </main>
    </div>
  );
} 