'use client'

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import PackageDetails from '@/components/package/PackageDetails';
import PackagePhoto from '@/components/package/PackagePhoto';
import PackagePickup from '@/components/package/PackagePickup';
import PackageDelivery from '@/components/package/PackageDelivery';
import PackageDimension from '@/components/package/PackageDimension';
import PackagePayment from '@/components/package/PackagePayment';

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
    if(currentStep === 6){
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" style={{ animationDuration: '1.5s' }}></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" style={{ animationDuration: '2s' }}></div>
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Loading Shipment Details
            </h2>
            <div className="flex items-center justify-center space-x-1">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
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
          <div className={`step ${currentStep >= 4 ? 'active' : ''}`}>
            <span className="step-number">4</span>
            <span className="step-label">Dimensions</span>
          </div>
          <div className={`step ${currentStep >= 5 ? 'active' : ''}`}>
            <span className="step-number">5</span>
            <span className="step-label">Payment</span>
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

        {currentStep === 4 && (
          <PackageDimension
            handleNextStep={handleNextStep}
            handlePreviousStep={handlePreviousStep}
          />
        )}
        {currentStep === 5 && (
          <PackagePayment
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
