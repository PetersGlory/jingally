"use client"

import React, { useEffect, useState } from 'react';
import PackageService from '@/components/package/PackageService';
import PackageDimension from '@/components/package/PackageDimension';
import PackagePhoto from '@/components/package/PackagePhoto';
import PackageDelivery from '@/components/package/PackageDelivery';
import PackagePayment from '@/components/package/PackagePayment';
import PackagePickup from '@/components/package/PackagePickup';
import PackageDetails from '@/components/package/PackageDetails';

const STEPS = [
  { id: 1, title: 'Service' },
  { id: 2, title: 'Details' },
  { id: 3, title: 'Dimensions' },
  { id: 4, title: 'Photos' },
  { id: 5, title: 'Delivery' },
  { id: 6, title: 'Pickup' },
  { id: 7, title: 'Payment' },
];

export default function CreateShipment() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedType, setSelectedType] = useState('');

  useEffect(() => {
    console.log('selectedType:', selectedType);
    const currentStep = localStorage.getItem('currentStep')
    if(currentStep){
      setCurrentStep(parseInt(currentStep))
    }
  }, []);

  const handleNextStep = () => {
    setCurrentStep(currentStep + 1);
  }

  const handlePreviousStep = () => {
    setCurrentStep(currentStep - 1);
  }
  return (
    <>
      <div className="w-full max-w-4xl mx-auto px-4 py-8">
        <div className="overflow-x-auto w-full">
          <div className="flex items-center justify-between mb-8 md:w-full w-[350px] overflow-x-auto">
            {STEPS.map((step, index) => (
              <React.Fragment key={step.id}>
                <div
                  className={`flex flex-col items-center ${
                    index === currentStep - 1
                      ? 'text-blue-600'
                      : index < currentStep - 1
                      ? 'text-green-600'
                      : 'text-gray-400'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    index === currentStep - 1
                      ? 'border-blue-600 bg-blue-50'
                      : index < currentStep - 1
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-300'
                  }`}>
                    {index < currentStep - 1 ? '✓' : index + 1}
                  </div>
                  <span className="text-sm mt-2 font-medium">{step.title}</span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 ${
                      index < currentStep - 1 ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
      {currentStep === 1 && <PackageService onSelectType={setSelectedType} handleNextStep={handleNextStep} />} 
      {currentStep === 2 && <PackageDetails serviceType={selectedType} handleNextStep={handleNextStep} handlePreviousStep={handlePreviousStep} />}
      {currentStep === 3 && <PackageDimension handleNextStep={handleNextStep} handlePreviousStep={handlePreviousStep} />}
      {currentStep === 4 && <PackagePhoto handleNextStep={handleNextStep} handlePreviousStep={handlePreviousStep} />}
      {currentStep === 5 && <PackageDelivery handleNextStep={handleNextStep} handlePreviousStep={handlePreviousStep} />}
      {currentStep === 6 && <PackagePickup handleNextStep={handleNextStep} handlePreviousStep={handlePreviousStep} />}
      {currentStep === 7 && <PackagePayment handleNextStep={handleNextStep} handlePreviousStep={handlePreviousStep} />}
    </>
  )
}
