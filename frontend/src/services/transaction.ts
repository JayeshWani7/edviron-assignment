import api from '../lib/api';
import type { Transaction, TransactionsResponse, TransactionFilters } from '../types';

export const transactionService = {
  getAllTransactions: async (
    page = 1,
    limit = 10,
    sort = 'createdAt',
    order = 'desc',
    filters?: TransactionFilters
  ): Promise<TransactionsResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sort,
      order,
    });

    // Add filters to params
    if (filters?.status?.length) {
      filters.status.forEach(status => params.append('status', status));
    }
    if (filters?.school_id?.length) {
      filters.school_id.forEach(schoolId => params.append('school_id', schoolId));
    }
    if (filters?.gateway?.length) {
      filters.gateway.forEach(gateway => params.append('gateway', gateway));
    }
    if (filters?.date_from) {
      params.append('date_from', filters.date_from);
    }
    if (filters?.date_to) {
      params.append('date_to', filters.date_to);
    }

    const response = await api.get(`/transactions?${params.toString()}`);
    return response.data;
  },

  getTransactionsBySchool: async (
    schoolId: string,
    page = 1,
    limit = 10,
    sort = 'createdAt',
    order = 'desc'
  ): Promise<TransactionsResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sort,
      order,
    });

    const response = await api.get(`/transactions/school/${schoolId}?${params.toString()}`);
    return response.data;
  },

  getTransactionStatus: async (customOrderId: string): Promise<{ transaction: Transaction }> => {
    const response = await api.get(`/transaction-status/${customOrderId}`);
    return response.data;
  },
};