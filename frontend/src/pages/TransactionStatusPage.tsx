import { useState } from 'react';
import { MagnifyingGlassIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import { transactionService } from '../services/transaction';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function TransactionStatusPage() {
  const [orderId, setOrderId] = useState('');
  const [shouldFetch, setShouldFetch] = useState(false);

  // Fetch transaction status
  const { data: transactionData, isLoading, error, refetch } = useQuery({
    queryKey: ['transaction-status', orderId],
    queryFn: () => transactionService.getTransactionStatus(orderId),
    enabled: shouldFetch && orderId.trim() !== '',
    retry: false,
  });

  const transaction = transactionData?.transaction;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) {
      toast.error('Please enter a valid Order ID');
      return;
    }
    setShouldFetch(true);
    refetch();
  };

  const handleClear = () => {
    setOrderId('');
    setShouldFetch(false);
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      success: 'status-success',
      pending: 'status-pending',
      failed: 'status-failed',
    };
    
    // Handle undefined or null status
    const safeStatus = status || 'unknown';
    
    return (
      <span className={`${statusClasses[safeStatus as keyof typeof statusClasses] || 'bg-gray-100 text-gray-800'} px-4 py-2 text-lg font-semibold`}>
        {safeStatus.charAt(0).toUpperCase() + safeStatus.slice(1)}
      </span>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return '✅';
      case 'pending':
        return '⏳';
      case 'failed':
        return '❌';
      default:
        return '❓';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Transaction Status Check
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Enter your Order ID to check the current status of your transaction
        </p>
      </div>

      {/* Search Form */}
      <div className="card">
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Order ID / Transaction ID
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Enter your order ID (e.g., ORDER_123456)"
                className="pl-10 input-field text-lg"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={isLoading || !orderId.trim()}
              className="flex-1 btn-primary py-3 text-lg font-semibold disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Checking...
                </>
              ) : (
                <>
                  <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
                  Check Status
                </>
              )}
            </button>
            
            {(transaction || error) && (
              <button
                type="button"
                onClick={handleClear}
                className="btn-secondary py-3 px-6"
              >
                Clear
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Results */}
      {error && (
        <div className="card border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-500 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
                Transaction Not Found
              </h3>
              <p className="text-red-600 dark:text-red-300 mt-1">
                No transaction found with Order ID: <strong>{orderId}</strong>
              </p>
              <p className="text-sm text-red-500 dark:text-red-400 mt-2">
                Please check your Order ID and try again. Make sure you're using the exact Order ID provided during payment.
              </p>
            </div>
          </div>
        </div>
      )}

      {transaction && (
        <div className="space-y-6">
          {/* Status Header */}
          <div className="card text-center">
            <div className="text-6xl mb-4">
              {getStatusIcon(transaction.status)}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Transaction Status
            </h2>
            <div className="mb-4">
              {getStatusBadge(transaction.status)}
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Order ID: <span className="font-mono font-semibold">{transaction.custom_order_id}</span>
            </p>
          </div>

          {/* Transaction Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Payment Information */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                Payment Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Amount</span>
                  <span className="font-semibold">₹{transaction.order_amount?.toLocaleString()}</span>
                </div>
                
                {transaction.transaction_amount !== transaction.order_amount && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Paid Amount</span>
                    <span className="font-semibold">₹{transaction.transaction_amount?.toLocaleString()}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Gateway</span>
                  <span className="font-semibold">{transaction.gateway}</span>
                </div>
                
                {transaction.payment_mode && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Payment Mode</span>
                    <span className="font-semibold">{transaction.payment_mode}</span>
                  </div>
                )}
                
                {transaction.bank_reference && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Bank Reference</span>
                    <span className="font-mono text-sm">{transaction.bank_reference}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Student Information */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                Student Information
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-600 dark:text-gray-400 text-sm">Name</span>
                  <div className="font-semibold">{transaction.student_info.name}</div>
                </div>
                
                <div>
                  <span className="text-gray-600 dark:text-gray-400 text-sm">Email</span>
                  <div className="font-semibold">{transaction.student_info.email}</div>
                </div>
                
                <div>
                  <span className="text-gray-600 dark:text-gray-400 text-sm">Student ID</span>
                  <div className="font-mono text-sm">{transaction.student_info.id}</div>
                </div>
                
                <div>
                  <span className="text-gray-600 dark:text-gray-400 text-sm">School ID</span>
                  <div className="font-mono text-sm">{transaction.school_id}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
              Transaction Timeline
            </h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-semibold">
                  1
                </div>
                <div className="ml-4">
                  <div className="font-medium">Transaction Created</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {transaction.createdAt ? format(new Date(transaction.createdAt), 'MMM dd, yyyy HH:mm:ss') : 'N/A'}
                  </div>
                </div>
              </div>
              
              {transaction.payment_time && (
                <div className="flex items-start">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    transaction.status === 'success' 
                      ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400' 
                      : transaction.status === 'failed'
                      ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
                      : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400'
                  }`}>
                    2
                  </div>
                  <div className="ml-4">
                    <div className="font-medium">
                      {transaction.status === 'success' ? 'Payment Completed' : 
                       transaction.status === 'failed' ? 'Payment Failed' : 'Payment Processing'}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {transaction.payment_time ? format(new Date(transaction.payment_time), 'MMM dd, yyyy HH:mm:ss') : 'N/A'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Additional Information */}
          {(transaction.collect_id || transaction.updatedAt) && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                Additional Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                {transaction.collect_id && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Collection ID</span>
                    <div className="font-mono">{transaction.collect_id}</div>
                  </div>
                )}
                
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Last Updated</span>
                  <div>{transaction.updatedAt ? format(new Date(transaction.updatedAt), 'MMM dd, yyyy HH:mm:ss') : 'N/A'}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Help Section */}
      <div className="card bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Need Help?
        </h3>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p>• Your Order ID can be found in your payment confirmation email</p>
          <p>• If your transaction status shows as "pending", please wait a few minutes and check again</p>
          <p>• For failed transactions, you may need to retry the payment</p>
          <p>• Contact support if you have any questions about your transaction</p>
        </div>
      </div>
    </div>
  );
}