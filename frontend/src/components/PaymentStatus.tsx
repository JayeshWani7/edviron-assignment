import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import paymentService, { type PaymentStatusResponse } from '../services/payment';

interface PaymentStatusProps {
  collectRequestId?: string;
  schoolId?: string;
  className?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const PaymentStatus: React.FC<PaymentStatusProps> = ({
  collectRequestId: initialCollectRequestId = '',
  schoolId: initialSchoolId = '65b0e6293e9f76a9694d84b4',
  className = '',
  autoRefresh = false,
  refreshInterval = 5000,
}) => {
  const [collectRequestId, setCollectRequestId] = useState(initialCollectRequestId);
  const [schoolId, setSchoolId] = useState(initialSchoolId);
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  // Auto-refresh functionality
  useEffect(() => {
    let interval: number | null = null;

    if (autoRefresh && collectRequestId && schoolId && paymentStatus?.data?.status !== 'SUCCESS') {
      interval = setInterval(() => {
        checkPaymentStatus();
      }, refreshInterval);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [autoRefresh, collectRequestId, schoolId, paymentStatus?.data?.status, refreshInterval]);

  const checkPaymentStatus = async () => {
    if (!collectRequestId.trim() || !schoolId.trim()) {
      setError('Both Collect Request ID and School ID are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await paymentService.checkPaymentStatus(collectRequestId.trim(), schoolId.trim());
      setPaymentStatus(response);
      setLastChecked(new Date());

      if (response.data.status === 'SUCCESS') {
        toast.success('Payment completed successfully!');
      }
    } catch (error: any) {
      console.error('Payment status check error:', error);
      const errorMessage = error.message || 'Failed to check payment status';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    checkPaymentStatus();
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'SUCCESS':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'FAILED':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'SUCCESS':
        return '✅';
      case 'FAILED':
        return '❌';
      case 'PENDING':
        return '⏳';
      default:
        return '❓';
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${className}`}>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Check Payment Status
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <div>
          <label htmlFor="collectRequestId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Collect Request ID
          </label>
          <input
            type="text"
            id="collectRequestId"
            value={collectRequestId}
            onChange={(e) => setCollectRequestId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            placeholder="Enter collect request ID"
            required
          />
        </div>

        <div>
          <label htmlFor="schoolId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            School ID
          </label>
          <input
            type="text"
            id="schoolId"
            value={schoolId}
            onChange={(e) => setSchoolId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            placeholder="Enter school ID"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                    ${loading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                    }`}
        >
          {loading ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Checking Status...
            </div>
          ) : (
            'Check Payment Status'
          )}
        </button>
      </form>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Payment Status Result */}
      {paymentStatus && (
        <div className="space-y-4">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Payment Status
              </h3>
              {lastChecked && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Last checked: {lastChecked.toLocaleTimeString()}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</label>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(paymentStatus.data.status)}`}>
                    <span className="mr-2">{getStatusIcon(paymentStatus.data.status)}</span>
                    {paymentStatus.data.status}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Amount</label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {paymentService.formatAmount(paymentStatus.data.amount)}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Collection Request ID</label>
                  <p className="text-sm text-gray-900 dark:text-gray-100 font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {collectRequestId}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">School ID</label>
                  <p className="text-sm text-gray-900 dark:text-gray-100 font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {schoolId}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Methods Info */}
            {paymentStatus.data.details && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Payment Details</label>
                <pre className="mt-2 text-xs text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-2 rounded overflow-x-auto">
                  {JSON.stringify(paymentStatus.data.details, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Auto-refresh indicator */}
          {autoRefresh && paymentStatus.data.status !== 'SUCCESS' && (
            <div className="flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Auto-refreshing every {refreshInterval / 1000}s...
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PaymentStatus;