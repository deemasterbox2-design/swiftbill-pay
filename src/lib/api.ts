/**
 * API utility functions for connecting to PHP backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://www.superbills.org';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: any;
}

async function apiCall<T = any>(
  endpoint: string,
  method: 'GET' | 'POST' = 'GET',
  body?: any
): Promise<ApiResponse<T>> {
  try {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    };

    if (body && method === 'POST') {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const data = await response.json();

    return data;
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      message: 'Network error. Please check your connection.',
      error,
    };
  }
}

// VTpass API functions
export const vtpassApi = {
  getCategories: () => apiCall('/vtpass/categories.php'),
  
  getServices: (identifier: string) => 
    apiCall(`/vtpass/services.php?identifier=${identifier}`),
  
  getVariations: (serviceID: string) =>
    apiCall(`/vtpass/variations.php?serviceID=${serviceID}`),
  
  verifyCustomer: (data: { serviceID: string; billersCode: string; type?: string }) =>
    apiCall('/vtpass/verify.php', 'POST', data),
  
  pay: (data: {
    serviceID: string;
    billersCode: string;
    variation_code?: string;
    amount: number;
    phone: string;
    paymentMethod: 'naira' | 'espees' | 'wallet';
  }) => apiCall('/vtpass/pay.php', 'POST', data),
  
  requery: (requestId: string) =>
    apiCall('/vtpass/requery.php', 'POST', { request_id: requestId }),
};

// Espees API functions
export const espeesApi = {
  initiate: (data: { amount: number; invoice_id: string; narration: string }) =>
    apiCall('/espees/initiate.php', 'POST', data),
  
  verify: (invoiceId: string, tabInstance: string) =>
    apiCall(`/espees/verify.php?invoice_id=${invoiceId}&tab_instance=${tabInstance}`),
};

// Wallet API functions
export const walletApi = {
  getBalance: () => apiCall('/wallet/balance.php'),
  
  fund: (data: { currency: 'Naira' | 'Espees'; amount: number; payment_method: string }) =>
    apiCall('/wallet/fund.php', 'POST', data),
};

// Transaction API functions
export const transactionApi = {
  getHistory: (filters?: { status?: string; dateRange?: string }) =>
    apiCall('/transactions/history.php' + (filters ? `?${new URLSearchParams(filters as any)}` : '')),
  
  exportCSV: () => apiCall('/transactions/export.php'),
};
