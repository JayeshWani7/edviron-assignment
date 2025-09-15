import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import paymentService, { type PaymentRequest } from '../services/payment';
import PaymentForm from '../components/PaymentForm';
import PaymentStatus from '../components/PaymentStatus';


const PaymentsPage: React.FC = () => {
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'create' | 'history' | 'status'>('create');
  const [selectedPayment, setSelectedPayment] = useState<PaymentRequest | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [createdPayment, setCreatedPayment] = useState<{
    paymentUrl: string;
    collectRequestId: string;
  } | null>(null);

  // Load payment requests on component mount
  useEffect(() => {
    loadPaymentRequests();
  }, []);

  // Clear created payment when switching away from create tab
  useEffect(() => {
    if (activeTab !== 'create') {
      setCreatedPayment(null);
    }
  }, [activeTab]);

  const loadPaymentRequests = async () => {
    try {
      setLoading(true);
      const requests = await paymentService.getPaymentRequests();
      setPaymentRequests(requests);
    } catch (error) {
      console.error('Error loading payment requests:', error);
      toast.error('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  const refreshPaymentRequests = async () => {
    setRefreshing(true);
    await loadPaymentRequests();
    setRefreshing(false);
    toast.success('Payment history refreshed');
  };

  const handlePaymentCreated = (paymentUrl: string, collectRequestId: string) => {
    // Store the created payment for immediate access
    setCreatedPayment({ paymentUrl, collectRequestId });
    
    // Refresh the payment history
    loadPaymentRequests();
    
    toast.success('🎉 Payment link created successfully! You can now share it or test the payment.');
  };

  const handleCheckStatus = async (payment: PaymentRequest) => {
    if (!payment.collect_request_id) {
      toast.error('No collect request ID available for this payment');
      return;
    }

    try {
      const status = await paymentService.checkPaymentStatus(payment.collect_request_id, payment.school_id);
      
      // Update the payment status locally
      await paymentService.updatePaymentRequest(payment.id, {
        status: status.data.status.toLowerCase() as PaymentRequest['status'],
      });
      
      // Refresh the list
      loadPaymentRequests();
      
      toast.success(`Payment status updated: ${status.data.status}`);
    } catch (error: any) {
      console.error('Error checking payment status:', error);
      toast.error(error.message || 'Failed to check payment status');
    }
  };

  const openPaymentLink = (url?: string) => {
    const targetUrl = url || createdPayment?.paymentUrl;
    if (targetUrl) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
      toast.success('Payment page opened in new tab');
    } else {
      toast.error('No payment URL available');
    }
  };

  const getStatusBadge = (status: string) => {
    const safeStatus = status || 'unknown';
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    
    switch (safeStatus.toLowerCase()) {
      case 'success':
        return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400`;
      case 'failed':
        return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400`;
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400`;
      case 'created':
        return `${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400`;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  const tabs = [
    { id: 'create', label: 'Create Payment', icon: '➕' },
    { id: 'history', label: 'Payment History', icon: '📋' },
    { id: 'status', label: 'Check Status', icon: '🔍' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Payment Management
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Create payment links, track payment status, and manage payment history
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {/* Create Payment Tab */}
        {activeTab === 'create' && (
          <PaymentForm 
            onPaymentCreated={handlePaymentCreated}
            className="max-w-2xl"
          />
        )}

        {/* Payment History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Payment History
                </h2>
                <button
                  onClick={refreshPaymentRequests}
                  disabled={refreshing}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40"
                >
                  {refreshing ? (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                  )}
                  Refresh
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-6 text-center">
                  <div className="inline-flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading payment history...
                  </div>
                </div>
              ) : paymentRequests.length === 0 ? (
                <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                  <p>No payment requests found.</p>
                  <p className="mt-2 text-sm">Create your first payment link using the "Create Payment" tab.</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Payment ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {paymentRequests.map((payment) => (
                      <tr key={payment.id} className="table-row">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 font-mono">
                          {payment.collect_request_id || payment.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 font-semibold">
                          {paymentService.formatAmount(payment.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={getStatusBadge(payment.status)}>
                            {payment.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(payment.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          {payment.payment_url && (
                            <button
                              onClick={() => openPaymentLink(payment.payment_url!)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              Pay
                            </button>
                          )}
                          {payment.collect_request_id && (
                            <button
                              onClick={() => handleCheckStatus(payment)}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                            >
                              Check Status
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedPayment(payment);
                              setActiveTab('status');
                            }}
                            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Check Status Tab */}
        {activeTab === 'status' && (
          <PaymentStatus
            collectRequestId={selectedPayment?.collect_request_id}
            schoolId={selectedPayment?.school_id}
            className="max-w-2xl"
            autoRefresh={true}
            refreshInterval={10000}
          />
        )}



        {/* Payment Link Display Section */}
        {createdPayment && activeTab === 'create' && (
          <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                🎉 Payment Link Created Successfully!
              </h3>
              <button
                onClick={() => setCreatedPayment(null)}
                className="ml-auto text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200 text-sm hover:bg-green-100 dark:hover:bg-green-900/40 rounded p-1"
                title="Dismiss"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-green-700 dark:text-green-300">Request ID:</span>
                  <span className="ml-2 text-green-800 dark:text-green-200 font-mono text-xs">
                    {createdPayment.collectRequestId}
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-green-700 dark:text-green-300 mb-2">
                  Payment Link (collect_request_url):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={createdPayment.paymentUrl}
                    readOnly
                    className="flex-1 px-3 py-2 bg-green-100 dark:bg-green-900/50 border border-green-300 dark:border-green-700 rounded-md text-sm text-green-800 dark:text-green-200 font-mono"
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(createdPayment.paymentUrl);
                        toast.success('Payment link copied to clipboard!');
                      } catch (error) {
                        toast.error('Failed to copy link');
                      }
                    }}
                    className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md transition-colors duration-200"
                  >
                    📋 Copy
                  </button>
                  <button
                    type="button"
                    onClick={() => openPaymentLink()}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors duration-200"
                  >
                    🔗 Open
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Share this link with the student/parent to complete the payment</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentsPage;