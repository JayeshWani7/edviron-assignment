import React from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';

const PaymentDebugPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();

  // Get all parameters
  const allParams = Object.fromEntries(searchParams.entries());
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          🔍 Payment Callback Debug Information
        </h1>
        
        <div className="space-y-6">
          {/* Current URL */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Current URL
            </h2>
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded font-mono text-sm break-all">
              {window.location.href}
            </div>
          </div>

          {/* Path and Search */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Pathname
              </h2>
              <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded font-mono text-sm">
                {location.pathname}
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Search String
              </h2>
              <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded font-mono text-sm">
                {location.search}
              </div>
            </div>
          </div>

          {/* Parameters */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              URL Parameters
            </h2>
            {Object.keys(allParams).length > 0 ? (
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-300 dark:border-gray-600">
                      <th className="text-left py-2 font-medium">Parameter</th>
                      <th className="text-left py-2 font-medium">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(allParams).map(([key, value]) => (
                      <tr key={key} className="border-b border-gray-200 dark:border-gray-600">
                        <td className="py-2 font-mono text-sm text-blue-600 dark:text-blue-400">
                          {key}
                        </td>
                        <td className="py-2 font-mono text-sm break-all">
                          {value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-4">
                <p className="text-yellow-800 dark:text-yellow-200">
                  No URL parameters found
                </p>
              </div>
            )}
          </div>

          {/* Expected Parameters */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Expected Parameter Mappings
            </h2>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-4">
              <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <p><strong>collect_request_id:</strong> {allParams.collect_request_id || allParams.EdvironCollectRequestId || allParams.id || 'Not found'}</p>
                <p><strong>school_id:</strong> {allParams.school_id || allParams.SchoolId || 'Not found'}</p>
                <p><strong>status:</strong> {allParams.status || 'Not found'}</p>
                <p><strong>amount:</strong> {allParams.amount || 'Not found'}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Quick Actions
            </h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  const collectRequestId = allParams.collect_request_id || allParams.EdvironCollectRequestId || allParams.id;
                  if (collectRequestId) {
                    const params = new URLSearchParams({
                      collect_request_id: collectRequestId,
                      school_id: allParams.school_id || allParams.SchoolId || '65b0e6293e9f76a9694d84b4',
                      status: allParams.status || 'success'
                    });
                    window.location.href = `/payments/callback/success?${params.toString()}`;
                  }
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors"
              >
                Go to Success Page
              </button>
              <button
                onClick={() => {
                  const collectRequestId = allParams.collect_request_id || allParams.EdvironCollectRequestId || allParams.id;
                  if (collectRequestId) {
                    const params = new URLSearchParams({
                      collect_request_id: collectRequestId,
                      school_id: allParams.school_id || allParams.SchoolId || '65b0e6293e9f76a9694d84b4',
                      status: 'failed'
                    });
                    window.location.href = `/payments/callback/failure?${params.toString()}`;
                  }
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
              >
                Go to Failure Page
              </button>
              <button
                onClick={() => window.location.href = '/payments'}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
              >
                Go to Payments
              </button>
            </div>
          </div>

          {/* JSON View */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Raw JSON Data
            </h2>
            <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm overflow-x-auto">
              <pre>{JSON.stringify({
                pathname: location.pathname,
                search: location.search,
                parameters: allParams,
                href: window.location.href
              }, null, 2)}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentDebugPage;