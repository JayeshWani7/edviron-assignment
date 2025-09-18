import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';

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
    const failure_reason = searchParams.get('failure_reason') || searchParams.get('reason');

    const updatePaymentFailureStatus = async () => {
      if (collectRequestId && schoolId) {
        try {
          // Determine failure type based on URL parameters or test UPI ID
          let failureType = 'failed';
          let failureMessage = 'Payment failed';
          let paymentMethod = 'UPI';

          if (failure_reason) {
            if (failure_reason.includes('invalid') || failure_reason.includes('Invalid VPA')) {
              failureType = 'invalid_vpa';
              failureMessage = 'Invalid UPI ID';
              paymentMethod = 'UPI (testinvalid@gocash)';
            } else {
              failureMessage = failure_reason;
              paymentMethod = 'UPI (testfailure@gocash)';
            }
          } else if (error) {
            failureMessage = errorDescription || error;
          }

          // Update payment status in backend database
          const updateResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/payment/update-status`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              collect_request_id: collectRequestId,
              status: failureType,
              payment_details: {
                payment_mode: 'UPI',
                payment_details: paymentMethod,
                failure_reason: failureMessage,
                gateway_response: `Payment ${failureType}: ${failureMessage}`,
                payment_time: new Date().toISOString()
              }
            })
          });

          if (updateResponse.ok) {
            const result = await updateResponse.json();
            console.log('✅ Payment failure status updated in database:', result);
          }

          // Set payment details for UI display
          setPaymentDetails({
            collect_request_id: collectRequestId,
            school_id: schoolId,
            status: failureType,
            amount: amount,
            error: error,
            error_description: errorDescription,
            failure_type: failureType,
            failure_message: failureMessage,
            payment_method: paymentMethod
          });

        } catch (error: any) {
          console.error('❌ Error updating payment failure status:', error);
          setPaymentDetails({
            collect_request_id: collectRequestId,
            school_id: schoolId,
            status: status || 'FAILED',
            amount: amount,
            error: error,
            error_description: errorDescription,
          });
        }
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
      }
      setLoading(false);

      // Show appropriate failure toast
      if (failure_reason?.includes('invalid') || failure_reason?.includes('Invalid VPA')) {
        toast.error('❌ Invalid UPI ID provided');
      } else {
        toast.error('❌ Payment failed. Please try again.');
      }
    };

    updatePaymentFailureStatus();
  }, [searchParams]);



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
          <div className={`mx-auto flex items-center justify-center h-24 w-24 rounded-full mb-6 ${
            paymentDetails?.failure_type === 'invalid_vpa' 
              ? 'bg-orange-100 dark:bg-orange-900/20' 
              : 'bg-red-100 dark:bg-red-900/20'
          }`}>
            {paymentDetails?.failure_type === 'invalid_vpa' ? (
              <svg className="h-12 w-12 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            ) : (
              <svg className="h-12 w-12 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {paymentDetails?.failure_type === 'invalid_vpa' ? 'Invalid UPI ID ⚠️' : 'Payment Failed ❌'}
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {paymentDetails?.failure_type === 'invalid_vpa' 
              ? 'The UPI ID provided is not valid. Please check and try again with a valid UPI ID.'
              : 'We couldn\'t process your payment. This could be due to insufficient funds, network issues, or other banking restrictions.'
            }
          </p>

          {/* Payment Details Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Payment Details
            </h2>
            
            <div className="space-y-3 text-left">
              {paymentDetails?.collect_request_id && (
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Transaction ID:</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100 font-mono">
                    {paymentDetails.collect_request_id}
                  </span>
                </div>
              )}
              
              {paymentDetails?.payment_method && (
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Payment Method:</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100">
                    {paymentDetails.payment_method}
                  </span>
                </div>
              )}
              
              {paymentDetails?.amount && (
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Amount:</span>
                  <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    ₹{paymentDetails.amount}
                  </span>
                </div>
              )}
              
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Status:</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  paymentDetails?.failure_type === 'invalid_vpa' 
                    ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                }`}>
                  <span className="mr-1">
                    {paymentDetails?.failure_type === 'invalid_vpa' ? '⚠️' : '❌'}
                  </span>
                  {paymentDetails?.failure_type === 'invalid_vpa' ? 'Invalid VPA' : 'Failed'}
                </span>
              </div>
              
              {paymentDetails?.failure_message && (
                <div className="py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-1">Reason:</span>
                  <span className={`text-sm ${
                    paymentDetails?.failure_type === 'invalid_vpa' 
                      ? 'text-orange-600 dark:text-orange-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {paymentDetails.failure_message}
                  </span>
                </div>
              )}

              {(paymentDetails?.error_description || paymentDetails?.error) && (
                <div className="py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-1">Additional Info:</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {paymentDetails.error_description || paymentDetails.error}
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