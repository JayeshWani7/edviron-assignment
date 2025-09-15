# 💳 Edviron Payment Frontend

## Overview
Complete React frontend implementation for the Edviron Payment API integration. This provides a user-friendly interface for creating payment links, tracking payment status, and managing payment history.

## 🚀 Features

### ✅ Payment Management
- **Create Payment Links**: Generate secure payment URLs with automatic JWT signing
- **Real-time Status Tracking**: Monitor payment status with auto-refresh functionality
- **Payment History**: View and manage all payment requests in a searchable table
- **Success/Failure Callbacks**: Handle payment completion with dedicated callback pages

### ✅ User Experience
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Dark Mode Support**: Full light/dark theme integration
- **Interactive Demo**: Complete payment flow demonstration with test data
- **Real-time Updates**: Automatic status refreshes and notifications

### ✅ Developer Experience
- **TypeScript**: Full type safety with comprehensive interfaces
- **Error Handling**: Robust error management with user-friendly messages
- **Modular Architecture**: Reusable components and services
- **API Integration**: Clean service layer for backend communication

## 📁 File Structure

```
src/
├── components/
│   ├── PaymentForm.tsx          # Payment creation form
│   └── PaymentStatus.tsx        # Payment status checker
├── pages/
│   ├── PaymentsPage.tsx         # Main payment management page
│   ├── PaymentDemoPage.tsx      # Interactive demo page
│   ├── PaymentSuccessPage.tsx   # Success callback page
│   └── PaymentFailurePage.tsx   # Failure callback page
├── services/
│   └── payment.ts               # Payment API service layer
└── types/
    └── payment.ts              # TypeScript interfaces
```

## 🎯 Key Components

### PaymentForm Component
```tsx
<PaymentForm 
  onPaymentCreated={(url, id) => console.log('Payment created')}
  className="max-w-2xl"
/>
```

**Features:**
- Form validation with real-time error display
- Auto-generated callback URLs
- Test school ID pre-filled
- Success notifications with toast messages

### PaymentStatus Component
```tsx
<PaymentStatus
  collectRequestId="payment123"
  schoolId="school456"
  autoRefresh={true}
  refreshInterval={5000}
/>
```

**Features:**
- Manual and automatic status checking
- Real-time updates with configurable intervals
- Detailed payment information display
- Status-based visual indicators

### PaymentsPage Component
```tsx
// Main payment management interface
<PaymentsPage />
```

**Features:**
- Tabbed interface (Create, History, Status)
- Payment history table with sorting
- Quick actions (Pay, Check Status, View Details)
- Bulk operations and filtering

## 🔧 API Integration

### Payment Service (`services/payment.ts`)

#### Create Payment Request
```typescript
const response = await paymentService.createPaymentRequest({
  school_id: '65b0e6293e9f76a9694d84b4',
  amount: '100.00',
  callback_url: 'https://yourapp.com/callback'
});
```

#### Check Payment Status
```typescript
const status = await paymentService.checkPaymentStatus(
  collectRequestId,
  schoolId
);
```

#### Payment History Management
```typescript
// Get all payment requests
const requests = await paymentService.getPaymentRequests();

// Save new payment request
await paymentService.savePaymentRequest(paymentData);

// Update payment status
await paymentService.updatePaymentRequest(id, updates);
```

## 🎨 UI/UX Features

### Responsive Tables
- Enhanced hover effects with smooth animations
- Sortable columns with visual indicators
- Mobile-optimized layout
- Dark mode compatibility

### Status Indicators
```tsx
// Dynamic status badges
const getStatusBadge = (status: string) => {
  switch (status.toLowerCase()) {
    case 'success': return 'bg-green-100 text-green-800';
    case 'failed': return 'bg-red-100 text-red-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};
```

### Interactive Demo
The Payment Demo page provides a complete testing environment:
- Step-by-step flow guidance
- Real payment link generation
- Status monitoring in real-time
- Test credential information

## 🔒 Security Features

### JWT Token Management
- Automatic JWT generation for API calls
- Secure token storage and transmission
- Token validation and error handling

### Input Validation
```typescript
const validatePaymentRequest = (data: CreatePaymentRequest) => {
  const errors: string[] = [];
  
  if (!data.school_id?.trim()) errors.push('School ID is required');
  if (!data.amount || parseFloat(data.amount) <= 0) {
    errors.push('Valid amount is required');
  }
  if (!isValidUrl(data.callback_url)) {
    errors.push('Valid callback URL is required');
  }
  
  return { isValid: errors.length === 0, errors };
};
```

### Error Boundaries
- Comprehensive error handling
- User-friendly error messages
- Graceful fallback interfaces

## 📱 Callback Pages

### Success Page (`/payments/callback/success`)
- Payment confirmation display
- Transaction details summary
- Navigation to payment history
- Success notifications

### Failure Page (`/payments/callback/failure`)
- Error message display
- Retry payment options
- Support contact information
- Common failure reason explanations

## 🧪 Testing

### Demo Flow Testing
1. Navigate to **Payment Demo** page
2. Fill payment form with test data
3. Create payment link
4. Open payment URL in new tab
5. Complete payment with test credentials
6. Verify status updates in real-time

### Test Data
```typescript
const testPayment = {
  school_id: '65b0e6293e9f76a9694d84b4',
  amount: '1.00',
  callback_url: window.location.origin + '/payments/callback/success'
};
```

## 🔧 Configuration

### Environment Variables
```env
VITE_API_BASE_URL=http://localhost:3000
```

### Callback URLs
The system automatically generates callback URLs:
- Success: `{origin}/payments/callback/success`
- Failure: `{origin}/payments/callback/failure`

## 🎯 Usage Examples

### Basic Payment Creation
```tsx
import { paymentService } from './services/payment';

const createPayment = async () => {
  try {
    const response = await paymentService.createPaymentRequest({
      school_id: 'school123',
      amount: '500.00',
      callback_url: 'https://myapp.com/success'
    });
    
    console.log('Payment URL:', response.data.Collect_request_url);
    console.log('Request ID:', response.data.collect_request_id);
  } catch (error) {
    console.error('Payment creation failed:', error);
  }
};
```

### Status Monitoring
```tsx
const monitorPayment = (collectRequestId: string, schoolId: string) => {
  const interval = setInterval(async () => {
    try {
      const status = await paymentService.checkPaymentStatus(
        collectRequestId, 
        schoolId
      );
      
      if (status.data.status === 'SUCCESS') {
        clearInterval(interval);
        toast.success('Payment completed!');
      }
    } catch (error) {
      console.error('Status check failed:', error);
    }
  }, 5000);
};
```

## 🚀 Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Navigate to Payment Demo**
   - Go to `/payment-demo` for complete testing
   - Or `/payments` for the main interface

4. **Test Payment Flow**
   - Create a payment link
   - Use test credentials for payment
   - Monitor status updates

## 📚 API Endpoints Used

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/payment/create-collect-request-simple` | Create payment with auto JWT |
| `GET` | `/payment/collect-request-simple/:id` | Check status with auto JWT |
| `POST` | `/payment/create-collect-request` | Create payment with manual JWT |
| `GET` | `/payment/collect-request/:id` | Check status with manual JWT |

## 🎨 Styling

- **Tailwind CSS** for utility-first styling
- **Custom CSS classes** for enhanced hover effects
- **Dark mode support** throughout the interface
- **Responsive design** for all screen sizes

## 🔄 State Management

- **React useState/useEffect** for local state
- **localStorage** for payment history persistence
- **Context API** for auth and theme management
- **React Query** for server state (existing setup)

This frontend provides a complete, production-ready interface for the Edviron Payment API with comprehensive testing capabilities and excellent user experience.