import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import paymentService from '../services/payment';

const PaymentTroubleshoot: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<any>(null);

  const runDiagnostics = async () => {
    setTesting(true);
    const diagnostics: any = {
      timestamp: new Date().toISOString(),
      results: {}
    };

    // Test 1: Check if user is logged in
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('user');
    diagnostics.results.auth = {
      hasToken: !!token,
      hasUser: !!user,
      tokenPreview: token ? `${token.substring(0, 20)}...` : null
    };

    // Test 2: Test API connection
    try {
      const apiTest = await paymentService.testConnection();
      diagnostics.results.apiConnection = {
        status: 'success',
        data: apiTest
      };
    } catch (error: any) {
      diagnostics.results.apiConnection = {
        status: 'failed',
        error: error.message
      };
    }

    // Test 3: Test payment creation
    try {
      const testPayment = await paymentService.createPaymentRequest({
        school_id: '65b0e6293e9f76a9694d84b4',
        amount: '1',
        callback_url: window.location.origin + '/payments/callback/success'
      });
      diagnostics.results.paymentCreation = {
        status: 'success',
        data: testPayment
      };
      toast.success('All tests passed! Payment API is working correctly.');
    } catch (error: any) {
      diagnostics.results.paymentCreation = {
        status: 'failed',
        error: error.message
      };
      toast.error(`Payment creation failed: ${error.message}`);
    }

    setResults(diagnostics);
    setTesting(false);
  };

  const fixAuth = () => {
    toast('Please log in first by going to the login page', {
      icon: '🔐',
      duration: 5000
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        🔧 Payment API Diagnostics
      </h2>
      
      <div className="space-y-4 mb-6">
        <button
          onClick={runDiagnostics}
          disabled={testing}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
        >
          {testing ? 'Running Diagnostics...' : '🚀 Run Full Diagnostics'}
        </button>
      </div>

      {results && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Diagnostic Results
          </h3>

          {/* Authentication Status */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
              1. Authentication Status
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Auth Token:</span>
                <span className={results.results.auth.hasToken ? 'text-green-600' : 'text-red-600'}>
                  {results.results.auth.hasToken ? '✅ Present' : '❌ Missing'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>User Data:</span>
                <span className={results.results.auth.hasUser ? 'text-green-600' : 'text-red-600'}>
                  {results.results.auth.hasUser ? '✅ Present' : '❌ Missing'}
                </span>
              </div>
              {!results.results.auth.hasToken && (
                <button
                  onClick={fixAuth}
                  className="mt-2 text-sm bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-1 rounded"
                >
                  🔐 Fix Authentication
                </button>
              )}
            </div>
          </div>

          {/* API Connection */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
              2. API Connection
            </h4>
            <div className="text-sm">
              <div className="flex justify-between items-center mb-2">
                <span>Backend Status:</span>
                <span className={results.results.apiConnection.status === 'success' ? 'text-green-600' : 'text-red-600'}>
                  {results.results.apiConnection.status === 'success' ? '✅ Connected' : '❌ Failed'}
                </span>
              </div>
              {results.results.apiConnection.status === 'success' ? (
                <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded text-xs">
                  <pre>{JSON.stringify(results.results.apiConnection.data, null, 2)}</pre>
                </div>
              ) : (
                <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded text-xs text-red-700 dark:text-red-400">
                  Error: {results.results.apiConnection.error}
                </div>
              )}
            </div>
          </div>

          {/* Payment Creation */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
              3. Payment Creation Test
            </h4>
            <div className="text-sm">
              <div className="flex justify-between items-center mb-2">
                <span>Payment API:</span>
                <span className={results.results.paymentCreation.status === 'success' ? 'text-green-600' : 'text-red-600'}>
                  {results.results.paymentCreation.status === 'success' ? '✅ Working' : '❌ Failed'}
                </span>
              </div>
              {results.results.paymentCreation.status === 'success' ? (
                <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded text-xs">
                  <p className="font-medium text-green-800 dark:text-green-400 mb-1">Payment link created successfully!</p>
                  <pre>{JSON.stringify(results.results.paymentCreation.data, null, 2)}</pre>
                </div>
              ) : (
                <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded text-xs text-red-700 dark:text-red-400">
                  Error: {results.results.paymentCreation.error}
                </div>
              )}
            </div>
          </div>

          {/* Troubleshooting Tips */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              💡 Troubleshooting Tips
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Make sure the backend server is running on port 3000</li>
              <li>• Ensure you're logged in (check Authentication Status above)</li>
              <li>• Verify the API base URL is correct (http://localhost:3000)</li>
              <li>• Check browser console for detailed error messages</li>
              <li>• Try refreshing the page if you just logged in</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentTroubleshoot;