'use client'

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import PackageDetails from '@/components/package/PackageDetails';
import PackagePhoto from '@/components/package/PackagePhoto';
import PackagePickup from '@/components/package/PackagePickup';
import PackageDelivery from '@/components/package/PackageDelivery';

export default function EditShipmentPage() {
  const router = useRouter();
  const searchParams = useParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [shipmentData, setShipmentData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchShipmentData = async () => {
      try {
        const shipmentId = searchParams
        console.log(searchParams)
        // if (!shipmentId) {
        //   router.push('/dashboard/shipments');
        //   return;
        // }

        // Fetch shipment data here
        // const response = await getShipmentDetails(shipmentId);
        // setShipmentData(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching shipment:', error);
        router.push('/dashboard/shipments');
      }
    };

    fetchShipmentData();
  }, [searchParams, router]);

  const handleNextStep = () => {
    if(currentStep === 3){
      router.push(`/dashboard/shipments/${searchParams?.id}`)
    }else{
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
        <div className="relative group">
          <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 opacity-75 blur-lg group-hover:opacity-100 transition duration-1000"></div>
          <div className="relative flex flex-col items-center">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-white border-t-transparent shadow-lg"></div>
            <div className="mt-6 text-center">
              <p className="text-gray-700 font-medium text-lg tracking-wide">Loading</p>
              <p className="text-gray-500 text-sm mt-1">Please wait while we prepare your shipment...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex justify-end px-4 py-2">
        <button
          onClick={handleNextStep}
          className="text-gray-600 hover:text-gray-800 font-medium"
        >
          Skip
        </button>
      </div>
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
              <span className="step-number">1</span>
              <span className="step-label">Package Details</span>
            </div>
            <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
              <span className="step-number">2</span>
              <span className="step-label">Photos</span>
            </div>
            <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
              <span className="step-number">3</span>
              <span className="step-label">Pickup</span>
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {currentStep === 1 && (
            <PackageDelivery
              handleNextStep={handleNextStep}
              handlePreviousStep={handlePreviousStep}
            />
          )}
          {currentStep === 2 && (
            <PackagePhoto
              handleNextStep={handleNextStep}
              handlePreviousStep={handlePreviousStep}
            />
          )}
          {currentStep === 3 && (
            <PackagePickup
              handleNextStep={handleNextStep}
              handlePreviousStep={handlePreviousStep}
            />
          )}
        </div>
      </div>

      <style jsx>{`
        .step {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          flex: 1;
        }

        .step:not(:last-child)::after {
          content: '';
          position: absolute;
          top: 20px;
          right: -50%;
          width: 100%;
          height: 2px;
          background-color: #e5e7eb;
          z-index: 0;
        }

        .step.active:not(:last-child)::after {
          background-color: #3b82f6;
        }

        .step-number {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: #e5e7eb;
          color: #6b7280;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          margin-bottom: 0.5rem;
          position: relative;
          z-index: 1;
        }

        .step.active .step-number {
          background-color: #3b82f6;
          color: white;
        }

        .step-label {
          font-size: 0.875rem;
          color: #6b7280;
          text-align: center;
        }

        .step.active .step-label {
          color: #3b82f6;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}
