
import axios from 'axios';

const generalApi = axios.create({
    baseURL: "https://jingally-server.onrender.com/api",
  });

export const createShipment = async (shippingData: any, token: string) => {
  const response = await generalApi.post('/guest-shipments', shippingData);
  return response.data;
};

export const getShipments = async (token: string) => {
  const response = await generalApi.get('/guest-shipments');
  return response.data;
};

// Package Photo Upload Section
export const uploadPackagePhotos = async (photos: any, token: string) => {
  const response = await generalApi.post('/shipping/photos', photos, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};


// Track Shipment
export const trackShipment = async (trackingNumber: string, token: string) => {
  const response = await generalApi.get(`/guest-shipments/track/${trackingNumber}`);
  return response.data;
};

// Get Shipment Details
export const getShipmentDetails = async (packageId: string, token: string) => {
  const response = await generalApi.get(`/guest-shipments/${packageId}`);
  return response.data;
};

// Update Package Dimensions
export const updatePackageDimensions = async (packageId: string, dimensions: any, token: string) => {
  const response = await generalApi.put(`/guest-shipments/${packageId}/dimensions`, dimensions);
  return response.data;
};

// Update Shipment Photos
export const updateShipmentPhotos = async (packageId: string, photos: any, token: string) => {
  const response = await generalApi.put(`/guest-shipments/${packageId}/photos`, photos, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Update Delivery Address
export const updateDeliveryAddress = async (packageId: string, address: any, token: string) => {
  const response = await generalApi.put(`/guest-shipments/${packageId}/address`, address);
  return response.data;
};

// Update Payment Status
export const updatePaymentStatus = async (packageId: string, status: any, token: string) => {
  const response = await generalApi.put(`/guest-shipments/${packageId}/payment`, status);
  return response.data;
};

// Update Pickup Date/Time
export const updatePickupDateTime = async (packageId: string, dateTime: any, token: string) => {
  const response = await generalApi.put(`/guest-shipments/${packageId}/pickup`, dateTime);
  return response.data;
};

// Cancel Shipment
export const cancelShipment = async (packageId: string, token: string) => {
  const response = await generalApi.get(`/guest-shipments/${packageId}/cancel`);
  return response.data;
};


// tracking shipment
export const trackingShipment = async (trackingNumber: string, token: string) => {
  const response = await generalApi.get(`/guest-shipments/track/${trackingNumber}`);
  return response.data;
};

export const updateBookingUser = async (shipmentData: any, token: string) => {
  const response = await generalApi.put(`/guest-shipments/user-info`, shipmentData, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};
