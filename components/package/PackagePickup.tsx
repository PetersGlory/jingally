'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Check, ArrowLeft } from 'lucide-react';
import styles from './PackagePickup.module.css';
import { updatePickupDateTime } from '@/lib/shipment';

interface TimeSlot {
  start: string;
  end: string;
  isFree: boolean;
}

export default function PackagePickup({ handleNextStep, handlePreviousStep }: { handleNextStep: () => void, handlePreviousStep: () => void }) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState('');

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      setToken(JSON.parse(accessToken));
    }
  }, []);

  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    for (let i = 10; i < 22; i += 2) {
      slots.push({
        start: `${i}:00`,
        end: `${i + 2}:00`,
        isFree: true
      });
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();
  
  // Get next available Tuesday and Thursday
  const getNextAvailableDays = () => {
    const today = new Date();
    const days = [];
    let currentDate = new Date(today);
    
    // Look for the next 14 days to find available Tuesdays and Thursdays
    for (let i = 0; i < 14; i++) {
      currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);
      
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek === 2 || dayOfWeek === 4) { // 2 is Tuesday, 4 is Thursday
        days.push(new Date(currentDate));
      }
    }
    
    return days.slice(0, 4); // Return next 4 available days (2 Tuesdays and 2 Thursdays)
  };

  const availableDays = getNextAvailableDays();

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleConfirmTimeSlot = async () => {
    if (!selectedDate || selectedSlot === null) {
      alert('Please select both date and time slot');
      return;
    }

    try {
      setIsLoading(true);

      // Get package info
      const packageInfoStr = localStorage.getItem('packageInfo');
      if (!packageInfoStr) {
        alert('Package information not found');
        return;
      }
      const packageInfo = JSON.parse(packageInfoStr);

      // Parse selected date and time
      const selectedDayIndex = availableDays.findIndex(
        date => formatDate(date) === selectedDate
      );
      if (selectedDayIndex === -1) {
        alert('Invalid date selection');
        return;
      }
      
      const timeSlot = timeSlots[selectedSlot];
      const [hours] = timeSlot.start.split(':').map(Number);
      
      // Create date object for the selected date and time
      const scheduledDate = new Date(availableDays[selectedDayIndex]);
      scheduledDate.setHours(hours, 0, 0, 0);

      // Format for API
      const scheduledPickupTime = scheduledDate.toISOString();

      // Update pickup date/time in the backend
      const response = await updatePickupDateTime(
        packageInfo.id,
        { scheduledPickupTime },
        token
      );
      
      if (response.success) {
        localStorage.setItem('packageInfo', JSON.stringify(response.data));
        localStorage.setItem('currentStep', '7')
        handleNextStep();
      } else {
        throw new Error(response.message || 'Failed to update pickup date/time');
      }
    } catch (error) {
      console.error('Error scheduling pickup:', error);
      alert('Failed to schedule pickup. Please try again.');
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
            onClick={handlePreviousStep}
          >
            <ArrowLeft size={20} />
          </button>
          <h1>Schedule Pickup</h1>
        </div>
        <button 
          className={styles.closeButton}
          onClick={() => router.back()}
        >
          <X size={24} />
        </button>
      </header>

      <div className={styles.datesContainer}>
        {availableDays.map((date, index) => (
          <button
            key={index}
            className={`${styles.dateButton} ${
              selectedDate === formatDate(date) ? styles.selectedDate : ''
            }`}
            onClick={() => setSelectedDate(formatDate(date))}
          >
            <span className={styles.weekday}>
              {formatDate(date).split(',')[0]}
            </span>
            <span className={styles.date}>
              {formatDate(date).split(',')[1]}
            </span>
          </button>
        ))}
      </div>

      <main className={styles.main}>
        {selectedDate ? (
          <>
            <h2 className={styles.selectedDateTitle}>
              {selectedDate}
            </h2>

            <div className={styles.timeSlots}>
              {timeSlots.map((slot, index) => (
                <button
                  key={index}
                  className={`${styles.timeSlot} ${
                    selectedSlot === index ? styles.selectedSlot : ''
                  }`}
                  onClick={() => setSelectedSlot(index)}
                >
                  <span className={styles.timeText}>
                    {slot.start} - {slot.end}
                  </span>
                  {selectedSlot === index && (
                    <Check size={20} />
                  )}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className={styles.emptyState}>
            <p>Please select a day to view available time slots</p>
          </div>
        )}
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerButtons}>
          <button
            className={styles.backButton}
            onClick={handlePreviousStep}
          >
            <div className='flex flex-row items-center gap-2'>
              <ArrowLeft size={20} />
              <span>Back</span>
            </div>
          </button>
          <button
            className={`${styles.confirmButton} ${
              selectedSlot !== null && selectedDate !== null
                ? isLoading ? styles.loading : styles.active
                : styles.disabled
            }`}
            disabled={selectedSlot === null || selectedDate === null || isLoading}
            onClick={handleConfirmTimeSlot}
          >
            {isLoading ? 'Scheduling...' : selectedSlot !== null && selectedDate !== null ? 'Confirm Time Slot' : 'Select a Time Slot'}
          </button>
        </div>
      </footer>
    </div>
  );
}
