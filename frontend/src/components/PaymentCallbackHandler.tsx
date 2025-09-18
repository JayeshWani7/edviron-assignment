import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const PaymentCallbackHandler: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if debug mode is requested
    const debugMode = searchParams.get('debug') === 'true';
    
    if (debugMode) {
      navigate(`/payments/callback/debug?${searchParams.toString()}`, { replace: true });
      return;
    }

    // Extract parameters from the URL
    const collectRequestId = searchParams.get('EdvironCollectRequestId') || 
                             searchParams.get('collect_request_id') || 
                             searchParams.get('id');
    
    const status = searchParams.get('status') || 'UNKNOWN';
    const schoolId = searchParams.get('school_id') || 
                     searchParams.get('SchoolId') || 
                     '65b0e6293e9f76a9694d84b4';
    const amount = searchParams.get('amount');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    console.log('🔗 Payment callback handler received:', {
      collectRequestId,
      status,
      schoolId,
      amount,
      error,
      errorDescription,
      allParams: Object.fromEntries(searchParams.entries())
    });

    // If no collect_request_id found, redirect to debug page
    if (!collectRequestId) {
      console.warn('No collect_request_id found, redirecting to debug page');
      navigate(`/payments/callback/debug?${searchParams.toString()}`, { replace: true });
      return;
    }

    // Determine where to redirect based on status
    let redirectPath = '';
    const queryParams = new URLSearchParams();

    if (collectRequestId) {
      queryParams.set('collect_request_id', collectRequestId);
    }
    if (schoolId) {
      queryParams.set('school_id', schoolId);
    }
    if (amount) {
      queryParams.set('amount', amount);
    }
    
    // Route based on status
    switch (status.toUpperCase()) {
      case 'SUCCESS':
      case 'COMPLETED':
      case 'PAID':
        redirectPath = '/payments/callback/success';
        queryParams.set('status', 'success');
        break;
        
      case 'FAILED':
      case 'FAILURE':
      case 'DECLINED':
        redirectPath = '/payments/callback/failure';
        queryParams.set('status', 'failed');
        if (error) queryParams.set('error', error);
        if (errorDescription) queryParams.set('error_description', errorDescription);
        break;
        
      case 'INVALID_VPA':
      case 'INVALID':
        redirectPath = '/payments/callback/failure';
        queryParams.set('status', 'invalid_vpa');
        queryParams.set('failure_reason', 'Invalid VPA');
        break;
        
      default:
        // Default to failure for unknown status
        redirectPath = '/payments/callback/failure';
        queryParams.set('status', 'unknown');
        queryParams.set('error', `Unknown status: ${status}`);
    }

    // Perform the redirect
    const finalUrl = `${redirectPath}?${queryParams.toString()}`;
    console.log('🔄 Redirecting to:', finalUrl);
    navigate(finalUrl, { replace: true });

  }, [searchParams, navigate]);

  // Loading state while redirecting
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Processing Payment Result...
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Please wait while we redirect you to the payment result page.
        </p>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
          Add ?debug=true to see detailed callback information
        </p>
      </div>
    </div>
  );
};

export default PaymentCallbackHandler;