import api from './axios';

// ── Orders ──────────────────────────────
export const createOrder = (data) => api.post('/orders', data);
export const verifyOrderOtp = (id, data) => api.post(`/orders/${id}/verify-otp`, data);
export const verifyDeliveryOtp = (id, data) => api.post(`/orders/${id}/verify-delivery-otp`, data);
export const trackOrder  = (id)   => api.get(`/orders/${id}`);
export const getMyOrders = ()     => api.get('/orders/myorders');
export const getAllOrders = ()    => api.get('/orders');
export const updateOrder = (id, data) => api.put(`/orders/${id}`, data);
export const getStats    = ()     => api.get('/orders/stats');

// ── Partner Order APIs ──────────────────
export const getAvailableOrders = () => api.get('/orders/available');
export const acceptOrder = (id) => api.put(`/orders/${id}/accept`);
export const updateOrderStatus = (id, data) => api.put(`/orders/${id}/status`, data);
export const getPartnerOrders = () => api.get('/orders/partner/orders');
export const getPartnerEarnings = () => api.get('/orders/partner/earnings');

// ── Payments (Razorpay) ─────────────────
export const getRazorpayKey = () => api.get('/payments/key');
export const createRazorpayOrder = (data) => api.post('/payments/create-order', data);
export const verifyPayment = (data) => api.post('/payments/verify', data);

// ── Users / Auth ─────────────────────────
export const registerUser = (data) => api.post('/users/register', data);
export const loginUser    = (data) => api.post('/users/login', data);
export const getMe        = ()     => api.get('/users/me');
export const getPartners  = ()     => api.get('/users/partners');
export const getAllUsers   = ()     => api.get('/users');
export const updateUserAccess = (id, data) => api.put(`/users/${id}/access`, data);
export const uploadPhoto  = (formData) => api.post('/users/upload-photo', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const createAdmin  = (data) => api.post('/users/admin', data);

// ── Support ──────────────────────────────
export const submitTicket  = (data) => api.post('/support', data);
export const getAllTickets  = ()     => api.get('/support');
export const updateTicket  = (id, data) => api.put(`/support/${id}`, data);

