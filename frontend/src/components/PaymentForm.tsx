import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import paymentService, { type CreatePaymentRequest } from '../services/payment';

interface PaymentFormProps {
  onPaymentCreated?: (paymentUrl: string, collectRequestId: string) => void;
  className?: string;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ onPaymentCreated, className = '' }) => {
  const [formData, setFormData] = useState<CreatePaymentRequest>({
    school_id: '65b0e6293e9f76a9694d84b4', // Default test school ID
    amount: '',
    callback_url: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [createdPayment, setCreatedPayment] = useState<{
    url: string;
    collectRequestId: string;
    amount: string;
  } | null>(null);

  // Auto-generate callback URL
  React.useEffect(() => {
    if (!formData.callback_url) {
      setFormData(prev => ({
        ...prev,
        callback_url: paymentService.generateCallbackUrl('success'),
      }));
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const validation = paymentService.validatePaymentRequest(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);
    setCreatedPayment(null); // Clear previous payment link
    try {
      // Create payment request
      const response = await paymentService.createPaymentRequest(formData);
      
      console.log('🔍 Full API Response:', JSON.stringify(response, null, 2));
      
      if (response.success) {
        // Extract payment URL and collect request ID from response
        let paymentUrl = '';
        let collectRequestId = '';
        
        const responseData = response.data as any;
        
        console.log('📊 Response data keys:', Object.keys(responseData));
        console.log('📊 Looking for collect_request_url...');
        
        // Look for collect_request_url (lowercase as you mentioned)
        if (responseData.collect_request_url) {
          paymentUrl = responseData.collect_request_url;
          collectRequestId = responseData.collect_request_id || responseData.id || 'N/A';
          console.log('✅ Found collect_request_url (lowercase):', paymentUrl);
          console.log('✅ Collect request ID:', collectRequestId);
        } 
        // Fallback: Check for uppercase version
        else if (responseData.Collect_request_url) {
          paymentUrl = responseData.Collect_request_url;
          collectRequestId = responseData.collect_request_id || responseData.id || 'N/A';
          console.log('✅ Found Collect_request_url (uppercase):', paymentUrl);
          console.log('✅ Collect request ID:', collectRequestId);
        }
        // Additional fallbacks for other possible field names
        else if (responseData.payment_url) {
          paymentUrl = responseData.payment_url;
          collectRequestId = responseData.collect_request_id || responseData.id || 'N/A';
          console.log('✅ Found payment_url:', paymentUrl);
          console.log('✅ Collect request ID:', collectRequestId);
        } 
        else {
          console.error('❌ Payment URL not found in response!');
          console.error('❌ Response data:', JSON.stringify(responseData, null, 2));
          console.error('❌ Available keys:', Object.keys(responseData));
          toast.error('Payment URL (collect_request_url) not found in API response. Check console for details.');
          return;
        }

        console.log('✅ Extracted Payment URL:', paymentUrl);
        console.log('✅ Extracted Collect ID:', collectRequestId);

        // Validate extracted data
        if (!paymentUrl || paymentUrl === 'undefined' || !paymentUrl.startsWith('http')) {
          console.error('❌ Invalid payment URL extracted:', paymentUrl);
          toast.error('Payment was created but the payment link is invalid. Please check backend logs.');
          return;
        }

        if (!collectRequestId) {
          console.warn('⚠️ No collect request ID found, using placeholder');
          collectRequestId = 'N/A';
        }

        // Store the created payment details for display
        setCreatedPayment({
          url: paymentUrl,
          collectRequestId: collectRequestId,
          amount: formData.amount
        });

        // Save to local storage for tracking
        await paymentService.savePaymentRequest({
          school_id: formData.school_id,
          amount: formData.amount,
          callback_url: formData.callback_url,
          collect_request_id: collectRequestId,
          payment_url: paymentUrl,
          status: 'created',
        });

        toast.success('Payment link created successfully!');
        
        // Call callback if provided
        if (onPaymentCreated) {
          onPaymentCreated(paymentUrl, collectRequestId);
        }

        // Reset form
        setFormData({
          school_id: formData.school_id, // Keep school ID
          amount: '',
          callback_url: paymentService.generateCallbackUrl('success'),
        });
      }
    } catch (error: any) {
      console.error('Payment creation error:', error);
      toast.error(error.message || 'Failed to create payment link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${className}`}>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Create Payment Request
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* School ID */}
        <div>
          <label htmlFor="school_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            School ID
          </label>
          <input
            type="text"
            id="school_id"
            name="school_id"
            value={formData.school_id}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            placeholder="Enter school ID"
            required
          />
        </div>

        {/* Amount */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Amount (INR)
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleInputChange}
            min="1"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            placeholder="Enter amount"
            required
          />
        </div>

        {/* Callback URL */}
        <div>
          <label htmlFor="callback_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Callback URL
          </label>
          <input
            type="url"
            id="callback_url"
            name="callback_url"
            value={formData.callback_url}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            placeholder="https://yoursite.com/callback"
            required
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            URL where users will be redirected after payment completion
          </p>
        </div>

        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
            <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-400">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Submit Button */}
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
              Creating Payment Link...
            </div>
          ) : (
            'Create Payment Link'
          )}
        </button>
      </form>

      {/* Payment Link Display Section */}
      {createdPayment && (
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
              🎉 Payment Link Created Successfully!
            </h3>
          </div>
          
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-green-700 dark:text-green-300">Amount:</span>
                <span className="ml-2 text-green-800 dark:text-green-200">₹{createdPayment.amount}</span>
              </div>
              <div>
                <span className="font-medium text-green-700 dark:text-green-300">Request ID:</span>
                <span className="ml-2 text-green-800 dark:text-green-200 font-mono text-xs">
                  {createdPayment.collectRequestId}
                </span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-green-700 dark:text-green-300 mb-2">
                Payment Link:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={createdPayment.url}
                  readOnly
                  className="flex-1 px-3 py-2 bg-green-100 dark:bg-green-900/50 border border-green-300 dark:border-green-700 rounded-md text-sm text-green-800 dark:text-green-200 font-mono"
                />
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(createdPayment.url);
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
                  onClick={() => {
                    window.open(createdPayment.url, '_blank');
                    toast.success('Payment page opened in new tab');
                  }}
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

            <button
              type="button"
              onClick={() => setCreatedPayment(null)}
              className="text-sm text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200 underline"
            >
              ✕ Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Additional Info */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
          💡 Payment Information
        </h3>
        <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
          <li>• Use test environment credentials for development</li>
          <li>• For testing, use netbanking or card (not real UPI/QR)</li>
          <li>• Payment links are valid for 24 hours</li>
          <li>• You can track payment status in real-time</li>
        </ul>
      </div>
    </div>
  );
};

export default PaymentForm;