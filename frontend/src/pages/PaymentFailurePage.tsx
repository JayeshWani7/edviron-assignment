import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import paymentService from '../services/payment';

const PaymentFailurePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Extract payment details from URL parameters
    const collectRequestId = searchParams.get('collect_request_id') || searchParams.get('id');
    const schoolId = searchParams.get('school_id');
    const status = searchParams.get('status');
    const amount = searchParams.get('amount');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (collectRequestId && schoolId) {
      // Try to get updated payment status
      checkPaymentStatus(collectRequestId, schoolId);
    } else {
      // Use URL parameters if available
      setPaymentDetails({
        collect_request_id: collectRequestId,
        school_id: schoolId,
        status: status || 'FAILED',
        amount: amount,
        error: error,
        error_description: errorDescription,
      });
      setLoading(false);
    }

    // Show failure toast
    toast.error('Payment failed. Please try again.');
  }, [searchParams]);

  const checkPaymentStatus = async (collectRequestId: string, schoolId: string) => {
    try {
      const response = await paymentService.checkPaymentStatus(collectRequestId, schoolId);
      setPaymentDetails({
        collect_request_id: collectRequestId,
        school_id: schoolId,
        ...response.data,
      });

      // Update local payment record if it exists
      const paymentRequests = await paymentService.getPaymentRequests();
      const existingPayment = paymentRequests.find(p => p.collect_request_id === collectRequestId);
      if (existingPayment) {
        await paymentService.updatePaymentRequest(existingPayment.id, {
          status: 'failed',
        });
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      // Still show failure page
      setPaymentDetails({
        collect_request_id: collectRequestId,
        school_id: schoolId,
        status: 'FAILED',
        error: 'Payment verification failed',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTryAgain = () => {
    // If we have payment details, navigate back to a new payment with prefilled data
    if (paymentDetails?.school_id && paymentDetails?.amount) {
      navigate('/payments', { 
        state: { 
          prefillData: {
            school_id: paymentDetails.school_id,
            amount: paymentDetails.amount,
          }
        }
      });
    } else {
      navigate('/payments');
    }
  };

  const handleGoToPayments = () => {
    navigate('/payments');
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  const handleContactSupport = () => {
    // You can implement support contact logic here
    toast('Please contact support at support@edviron.com for assistance.', {
      icon: 'ℹ️',
      duration: 5000,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-red-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600 dark:text-gray-400">Checking payment details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {/* Failure Icon */}
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-red-100 dark:bg-red-900/20 mb-6">
            <svg className="h-12 w-12 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Payment Failed 😞
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            We couldn't process your payment. Please try again or contact support.
          </p>

          {/* Payment Details Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Payment Details
            </h2>
            
            <div className="space-y-3 text-left">
              {paymentDetails?.collect_request_id && (
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Payment ID:</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100 font-mono">
                    {paymentDetails.collect_request_id}
                  </span>
                </div>
              )}
              
              {paymentDetails?.amount && (
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Amount:</span>
                  <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {paymentService.formatAmount(paymentDetails.amount)}
                  </span>
                </div>
              )}
              
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Status:</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                  <span className="mr-1">❌</span>
                  {paymentDetails?.status || 'FAILED'}
                </span>
              </div>
              
              {paymentDetails?.error && (
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Error:</span>
                  <span className="text-sm text-red-600 dark:text-red-400">
                    {paymentDetails.error}
                  </span>
                </div>
              )}

              {paymentDetails?.error_description && (
                <div className="py-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-1">Description:</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {paymentDetails.error_description}
                  </span>
                </div>
              )}
              
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Attempted:</span>
                <span className="text-sm text-gray-900 dark:text-gray-100">
                  {new Date().toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={handleTryAgain}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Try Payment Again
            </button>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleGoToPayments}
                className="flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Payments
              </button>
              
              <button
                onClick={handleGoToDashboard}
                className="flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Dashboard
              </button>
            </div>
          </div>

          {/* Support Section */}
          <div className="mt-8 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-md">
            <p className="text-sm text-orange-700 dark:text-orange-300 mb-3">
              Need help? Contact our support team.
            </p>
            <button
              onClick={handleContactSupport}
              className="text-sm text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-200 font-medium underline"
            >
              Contact Support
            </button>
          </div>

          {/* Common Failure Reasons */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-md text-left">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              Common reasons for payment failure:
            </h3>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Insufficient funds in your account</li>
              <li>• Network connectivity issues</li>
              <li>• Card/bank authentication failure</li>
              <li>• Payment gateway timeout</li>
              <li>• Invalid card details or expired card</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailurePage;