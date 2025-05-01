import axios from "axios";

export const api = axios.create({
  baseURL: "https://jingally-server.onrender.com/api",
});

// Authentication Section
export const signIn = async (email: string, password: string) => {
  const response = await api.post("/auth/login", { email, password });
  return response.data;
};

export const signUp = async (data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  gender?: string;
  deviceToken?: string;
}) => {
  const response = await api.post("/auth/register", data);
  return response.data;
};

export const verifyEmail = async (data: { email: string; verificationCode: string }, accessToken: string) => {
  const response = await api.post("/auth/verify", data, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
};

export const verifyResetCode = async (data: { email: string; verificationCode: string }) => {
  const response = await api.post("/auth/verify-reset-email", data);
  return response.data;
};

export const sendVerificationCode = async (email: string, type: 'email' | 'phone') => {
  const response = await api.post("/auth/send-verification", { email, type });
  return response.data;
};

export const signOut = async () => {
  const response = await api.post("/auth/logout");
  return response.data;
};

// Users Section
export const getUser = async (token: string) => {
  const response = await api.get("/users/profile", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const updateUser = async (data: object, token: string) => {
  const response = await api.put("/users/profile", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Password Management Section
export const requestPasswordReset = async (email: string) => {
  const response = await api.post("/auth/forgot-password", { email });
  return response.data;
};

export const resetPassword = async (token: string, password: string) => {
  const response = await api.post("/auth/reset-password", { token, password });
  return response.data;
};

export const changePassword = async (currentPassword: string, newPassword: string, token: string) => {
  const response = await api.post("/auth/change-password", { currentPassword, newPassword }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};


// Address Section
export const getAddress = async (token: string) => {
  const response = await api.get("/addresses", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const createAddress = async (data: object, token: string) => {
  const response = await api.post("/addresses", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const deleteAddress = async (addressId: string, token: string) => {
  const response = await api.delete(`/addresses/${addressId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }); 
  return response.data;
};

export const updateAddress = async (addressId: string, data: object, token: string) => {
  const response = await api.put(`/addresses/${addressId}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const verifyAddress = async (addressId: string, token: string) => {
  const response = await api.post(`/addresses/${addressId}/verify`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};  

