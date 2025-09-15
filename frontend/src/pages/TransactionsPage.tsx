import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import { transactionService } from '../services/transaction';
import type { Transaction, TransactionFilters } from '../types';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const statusOptions = [
  { value: 'success', label: 'Success', color: 'status-success' },
  { value: 'pending', label: 'Pending', color: 'status-pending' },
  { value: 'failed', label: 'Failed', color: 'status-failed' },
];

const gatewayOptions = [
  { value: 'PhonePe', label: 'PhonePe' },
  { value: 'Razorpay', label: 'Razorpay' },
  { value: 'Paytm', label: 'Paytm' },
];

export default function TransactionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Get URL parameters
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const sort = searchParams.get('sort') || 'createdAt';
  const order = searchParams.get('order') || 'desc';
  const statusFilter = searchParams.getAll('status');
  const schoolFilter = searchParams.getAll('school_id');
  const gatewayFilter = searchParams.getAll('gateway');
  const dateFrom = searchParams.get('date_from') || '';
  const dateTo = searchParams.get('date_to') || '';

  const filters: TransactionFilters = useMemo(() => ({
    status: statusFilter,
    school_id: schoolFilter,
    gateway: gatewayFilter,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
  }), [statusFilter, schoolFilter, gatewayFilter, dateFrom, dateTo]);

  // Fetch transactions
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['transactions', page, limit, sort, order, filters],
    queryFn: () => transactionService.getAllTransactions(page, limit, sort, order, filters),
  });

  // Filter transactions by search term locally
  const filteredTransactions = useMemo(() => {
    if (!data?.transactions || !searchTerm) return data?.transactions || [];
    
    return data.transactions.filter(transaction =>
      transaction.custom_order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.student_info.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.student_info.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.school_id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data?.transactions, searchTerm]);

  // Update URL when parameters change
  const updateSearchParams = (key: string, value: string | string[] | null) => {
    const newParams = new URLSearchParams(searchParams);
    
    if (value === null || (Array.isArray(value) && value.length === 0)) {
      newParams.delete(key);
    } else if (Array.isArray(value)) {
      newParams.delete(key);
      value.forEach(v => newParams.append(key, v));
    } else {
      newParams.set(key, value);
    }
    
    // Reset to page 1 when filters change
    if (key !== 'page') {
      newParams.set('page', '1');
    }
    
    setSearchParams(newParams);
  };

  const handleSort = (column: string) => {
    const newOrder = sort === column && order === 'asc' ? 'desc' : 'asc';
    updateSearchParams('sort', column);
    updateSearchParams('order', newOrder);
  };

  const handleStatusFilter = (status: string) => {
    const newStatuses = statusFilter.includes(status)
      ? statusFilter.filter(s => s !== status)
      : [...statusFilter, status];
    updateSearchParams('status', newStatuses);
  };

  const handleGatewayFilter = (gateway: string) => {
    const newGateways = gatewayFilter.includes(gateway)
      ? gatewayFilter.filter(g => g !== gateway)
      : [...gatewayFilter, gateway];
    updateSearchParams('gateway', newGateways);
  };

  const handleSchoolFilter = (schoolId: string) => {
    if (!schoolId.trim()) return;
    const newSchools = schoolFilter.includes(schoolId)
      ? schoolFilter.filter(s => s !== schoolId)
      : [...schoolFilter, schoolId];
    updateSearchParams('school_id', newSchools);
  };

  const clearFilters = () => {
    setSearchParams({});
    setSearchTerm('');
  };

  const getSortIcon = (column: string) => {
    if (sort !== column) return null;
    return order === 'asc' ? 
      <ChevronUpIcon className="h-4 w-4" /> : 
      <ChevronDownIcon className="h-4 w-4" />;
  };

  const getStatusBadge = (status: string) => {
    const safeStatus = status || 'unknown';
    const statusConfig = statusOptions.find(s => s.value === safeStatus);
    return (
      <span className={statusConfig?.color || 'bg-gray-100 text-gray-800'}>
        {statusConfig?.label || safeStatus}
      </span>
    );
  };

  if (error) {
    toast.error('Failed to fetch transactions');
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          All Transactions
        </h1>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary flex items-center"
          >
            <FunnelIcon className="h-4 w-4 mr-2" />
            Filters
          </button>
          <button
            onClick={clearFilters}
            className="btn-secondary"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order ID, student name, email..."
                className="pl-10 input-field"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <div className="space-y-2">
                {statusOptions.map((status) => (
                  <label key={status.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={statusFilter.includes(status.value)}
                      onChange={() => handleStatusFilter(status.value)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {status.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Gateway Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Gateway
              </label>
              <div className="space-y-2">
                {gatewayOptions.map((gateway) => (
                  <label key={gateway.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={gatewayFilter.includes(gateway.value)}
                      onChange={() => handleGatewayFilter(gateway.value)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {gateway.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date From
              </label>
              <input
                type="date"
                className="input-field"
                value={dateFrom}
                onChange={(e) => updateSearchParams('date_from', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date To
              </label>
              <input
                type="date"
                className="input-field"
                value={dateTo}
                onChange={(e) => updateSearchParams('date_to', e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Transactions Table */}
      <div className="card p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th
                  className="table-header cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleSort('custom_order_id')}
                >
                  <div className="flex items-center">
                    Order ID
                    {getSortIcon('custom_order_id')}
                  </div>
                </th>
                <th
                  className="table-header cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleSort('school_id')}
                >
                  <div className="flex items-center">
                    School ID
                    {getSortIcon('school_id')}
                  </div>
                </th>
                <th className="table-header">Student</th>
                <th
                  className="table-header cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleSort('gateway')}
                >
                  <div className="flex items-center">
                    Gateway
                    {getSortIcon('gateway')}
                  </div>
                </th>
                <th
                  className="table-header cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleSort('order_amount')}
                >
                  <div className="flex items-center">
                    Amount
                    {getSortIcon('order_amount')}
                  </div>
                </th>
                <th
                  className="table-header cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center">
                    Status
                    {getSortIcon('status')}
                  </div>
                </th>
                <th
                  className="table-header cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleSort('payment_time')}
                >
                  <div className="flex items-center">
                    Date
                    {getSortIcon('payment_time')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="table-cell text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                      <span className="ml-2">Loading transactions...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="table-cell text-center py-8 text-gray-500 dark:text-gray-400">
                    No transactions found
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((transaction) => (
                  <tr key={transaction.collect_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="table-cell font-mono text-sm">
                      {transaction.custom_order_id}
                    </td>
                    <td className="table-cell">
                      {transaction.school_id}
                    </td>
                    <td className="table-cell">
                      <div>
                        <div className="font-medium">{transaction.student_info.name}</div>
                        <div className="text-sm text-gray-500">{transaction.student_info.email}</div>
                      </div>
                    </td>
                    <td className="table-cell">
                      {transaction.gateway}
                    </td>
                    <td className="table-cell">
                      <div>
                        <div>₹{transaction.order_amount?.toLocaleString()}</div>
                        {transaction.transaction_amount !== transaction.order_amount && (
                          <div className="text-sm text-gray-500">
                            Paid: ₹{transaction.transaction_amount?.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="table-cell">
                      {getStatusBadge(transaction.status)}
                    </td>
                    <td className="table-cell text-sm">
                      {transaction.payment_time ? 
                        format(new Date(transaction.payment_time), 'MMM dd, yyyy HH:mm') :
                        '-'
                      }
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data?.pagination && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Showing {((page - 1) * limit) + 1} to{' '}
              {Math.min(page * limit, data.pagination.total)} of{' '}
              {data.pagination.total} results
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => updateSearchParams('page', (page - 1).toString())}
                disabled={page <= 1}
                className="p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, data.pagination.totalPages) }, (_, i) => {
                  const pageNumber = i + 1;
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => updateSearchParams('page', pageNumber.toString())}
                      className={`px-3 py-2 text-sm rounded-md ${
                        page === pageNumber
                          ? 'bg-primary-600 text-white'
                          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => updateSearchParams('page', (page + 1).toString())}
                disabled={page >= (data.pagination.totalPages || 1)}
                className="p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}