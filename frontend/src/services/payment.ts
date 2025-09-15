import api from '../lib/api';

export interface CreatePaymentRequest {
  school_id: string;
  amount: string;
  callback_url: string;
}

export interface CreatePaymentResponse {
  success: boolean;
  data: {
    collect_request_id?: string;
    id?: string;
    collect_request_url?: string;  // Lowercase version (primary)
    Collect_request_url?: string;  // Uppercase version (fallback)
    payment_url?: string;          // Alternative field name
    sign?: string;
  };
}

export interface PaymentStatusResponse {
  success: boolean;
  data: {
    status: string;
    amount: number;
    details: {
      payment_methods: any;
    };
    jwt: string;
  };
}

export interface PaymentRequest {
  id: string;
  school_id: string;
  amount: string;
  callback_url: string;
  collect_request_id?: string;
  payment_url?: string;
  status: 'created' | 'pending' | 'success' | 'failed';
  created_at: Date;
  updated_at: Date;
}

class PaymentService {

  /**
   * Test API connection
   */
  async testConnection(): Promise<{ success: boolean; message: string; timestamp: string }> {
    try {
      const response = await api.get('/payment/test');
      return response.data;
    } catch (error: any) {
      console.error('API connection test failed:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to connect to API');
    }
  }

  /**
   * Create a new payment request
   */
  async createPaymentRequest(data: CreatePaymentRequest): Promise<CreatePaymentResponse> {
    try {
      const response = await api.post('/payment/create-collect-request-simple', data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating payment request:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to create payment request');
    }
  }

  /**
   * Check payment status
   */
  async checkPaymentStatus(collectRequestId: string, schoolId: string): Promise<PaymentStatusResponse> {
    try {
      const response = await api.get(`/payment/collect-request-simple/${collectRequestId}`, {
        params: { school_id: schoolId }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error checking payment status:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to check payment status');
    }
  }

  /**
   * Get all payment requests (mock implementation - you can connect to actual backend)
   */
  async getPaymentRequests(): Promise<PaymentRequest[]> {
    try {
      // This would connect to your backend to get stored payment requests
      // For now, returning mock data from localStorage
      const stored = localStorage.getItem('paymentRequests');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting payment requests:', error);
      return [];
    }
  }

  /**
   * Save payment request locally (you can extend this to save to backend)
   */
  async savePaymentRequest(request: Omit<PaymentRequest, 'id' | 'created_at' | 'updated_at'>): Promise<PaymentRequest> {
    try {
      const paymentRequest: PaymentRequest = {
        ...request,
        id: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const existing = await this.getPaymentRequests();
      const updated = [paymentRequest, ...existing];
      localStorage.setItem('paymentRequests', JSON.stringify(updated));

      return paymentRequest;
    } catch (error) {
      console.error('Error saving payment request:', error);
      throw error;
    }
  }

  /**
   * Update payment request status
   */
  async updatePaymentRequest(id: string, updates: Partial<PaymentRequest>): Promise<PaymentRequest | null> {
    try {
      const requests = await this.getPaymentRequests();
      const index = requests.findIndex(req => req.id === id);
      
      if (index === -1) {
        return null;
      }

      requests[index] = {
        ...requests[index],
        ...updates,
        updated_at: new Date(),
      };

      localStorage.setItem('paymentRequests', JSON.stringify(requests));
      return requests[index];
    } catch (error) {
      console.error('Error updating payment request:', error);
      throw error;
    }
  }

  /**
   * Generate callback URL for this application
   */
  generateCallbackUrl(type: 'success' | 'failure' = 'success'): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/payments/callback/${type}`;
  }

  /**
   * Format currency amount
   */
  formatAmount(amount: string | number): string {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(num);
  }

  /**
   * Validate payment request data
   */
  validatePaymentRequest(data: CreatePaymentRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.school_id?.trim()) {
      errors.push('School ID is required');
    }

    if (!data.amount?.trim()) {
      errors.push('Amount is required');
    } else {
      const amount = parseFloat(data.amount);
      if (isNaN(amount) || amount <= 0) {
        errors.push('Amount must be a positive number');
      }
    }

    if (!data.callback_url?.trim()) {
      errors.push('Callback URL is required');
    } else {
      try {
        new URL(data.callback_url);
      } catch {
        errors.push('Invalid callback URL format');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export const paymentService = new PaymentService();
export default paymentService;