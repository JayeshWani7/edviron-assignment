import React, { useState } from 'react';

const PaymentCallbackTester: React.FC = () => {
  const [testParams, setTestParams] = useState({
    EdvironCollectRequestId: '68cc56f5154d1bce65b55f9a',
    status: 'SUCCESS',
    school_id: '65b0e6293e9f76a9694d84b4',
    amount: '1000'
  });

  const generateTestUrl = (scenario: string) => {
    const baseUrl = window.location.origin;
    let params = new URLSearchParams();

    switch (scenario) {
      case 'production':
        params.set('EdvironCollectRequestId', testParams.EdvironCollectRequestId);
        params.set('status', testParams.status);
        break;
      case 'development':
        params.set('collect_request_id', testParams.EdvironCollectRequestId);
        params.set('status', testParams.status.toLowerCase());
        params.set('school_id', testParams.school_id);
        break;
      case 'debug':
        params.set('EdvironCollectRequestId', testParams.EdvironCollectRequestId);
        params.set('status', testParams.status);
        params.set('debug', 'true');
        break;
      case 'invalid_vpa':
        params.set('EdvironCollectRequestId', testParams.EdvironCollectRequestId);
        params.set('status', 'INVALID_VPA');
        break;
      case 'failed':
        params.set('EdvironCollectRequestId', testParams.EdvironCollectRequestId);
        params.set('status', 'FAILED');
        params.set('error', 'TRANSACTION_DECLINED');
        break;
    }

    return `${baseUrl}/payments/callback/handler?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          🧪 Payment Callback Tester
        </h1>
        
        <div className="space-y-6">
          {/* Test Parameters */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Test Parameters
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Collect Request ID
                </label>
                <input
                  type="text"
                  value={testParams.EdvironCollectRequestId}
                  onChange={(e) => setTestParams({...testParams, EdvironCollectRequestId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={testParams.status}
                  onChange={(e) => setTestParams({...testParams, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="SUCCESS">SUCCESS</option>
                  <option value="FAILED">FAILED</option>
                  <option value="INVALID_VPA">INVALID_VPA</option>
                  <option value="UNKNOWN">UNKNOWN</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  School ID
                </label>
                <input
                  type="text"
                  value={testParams.school_id}
                  onChange={(e) => setTestParams({...testParams, school_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Amount
                </label>
                <input
                  type="text"
                  value={testParams.amount}
                  onChange={(e) => setTestParams({...testParams, amount: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
          </div>

          {/* Test Scenarios */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Test Scenarios
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* Production Format */}
              <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                  🚀 Production Format
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Uses EdvironCollectRequestId parameter (current production)
                </p>
                <button
                  onClick={() => window.open(generateTestUrl('production'), '_blank')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors text-sm"
                >
                  Test Production Format
                </button>
                <div className="mt-2 text-xs text-gray-500 break-all">
                  {generateTestUrl('production')}
                </div>
              </div>

              {/* Development Format */}
              <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                  🔧 Development Format
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Uses collect_request_id parameter (expected format)
                </p>
                <button
                  onClick={() => window.open(generateTestUrl('development'), '_blank')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors text-sm"
                >
                  Test Development Format
                </button>
                <div className="mt-2 text-xs text-gray-500 break-all">
                  {generateTestUrl('development')}
                </div>
              </div>

              {/* Debug Mode */}
              <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                  🔍 Debug Mode
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Shows all parameters and routing information
                </p>
                <button
                  onClick={() => window.open(generateTestUrl('debug'), '_blank')}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition-colors text-sm"
                >
                  Test Debug Mode
                </button>
                <div className="mt-2 text-xs text-gray-500 break-all">
                  {generateTestUrl('debug')}
                </div>
              </div>

              {/* Invalid VPA */}
              <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                  ❌ Invalid VPA
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Tests invalid VPA scenario (testinvalid@gocash)
                </p>
                <button
                  onClick={() => window.open(generateTestUrl('invalid_vpa'), '_blank')}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded transition-colors text-sm"
                >
                  Test Invalid VPA
                </button>
                <div className="mt-2 text-xs text-gray-500 break-all">
                  {generateTestUrl('invalid_vpa')}
                </div>
              </div>

              {/* Failed Payment */}
              <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                  💥 Failed Payment
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Tests failed payment scenario (testfailure@gocash)
                </p>
                <button
                  onClick={() => window.open(generateTestUrl('failed'), '_blank')}
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors text-sm"
                >
                  Test Failed Payment
                </button>
                <div className="mt-2 text-xs text-gray-500 break-all">
                  {generateTestUrl('failed')}
                </div>
              </div>

              {/* Direct Routes */}
              <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                  🎯 Direct Routes
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Direct access to callback pages
                </p>
                <div className="space-y-2">
                  <button
                    onClick={() => window.open('/payments/callback/debug', '_blank')}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-1 rounded transition-colors text-xs"
                  >
                    Debug Page
                  </button>
                  <button
                    onClick={() => window.open('/payments', '_blank')}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1 rounded transition-colors text-xs"
                  >
                    Payments Page
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
              📋 How to Use
            </h3>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• <strong>Production Format:</strong> Test the exact URL format from your production issue</li>
              <li>• <strong>Debug Mode:</strong> Add ?debug=true to any callback URL to see detailed parameter information</li>
              <li>• <strong>Missing Parameters:</strong> If collect_request_id is missing, it will automatically redirect to debug page</li>
              <li>• <strong>Console Logs:</strong> Check browser console for detailed parameter extraction logs</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCallbackTester;