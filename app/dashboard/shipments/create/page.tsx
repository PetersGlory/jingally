"use client"

import React, { useEffect, useState } from 'react';
import PackageService from '@/components/package/PackageService';
import PackageDimension from '@/components/package/PackageDimension';
import PackagePhoto from '@/components/package/PackagePhoto';
import PackageDelivery from '@/components/package/PackageDelivery';
import PackagePayment from '@/components/package/PackagePayment';
import PackagePickup from '@/components/package/PackagePickup';
import PackageDetails from '@/components/package/PackageDetails';


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
