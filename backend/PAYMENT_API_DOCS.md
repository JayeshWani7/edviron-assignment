# Edviron Payment API Implementation

## Overview
This implementation provides integration with Edviron's Payment API for creating payment links and checking payment status. The API includes both manual JWT signing and automatic JWT generation endpoints.

## Features
- ✅ Create payment collection requests
- ✅ Check payment status
- ✅ Automatic JWT signing and verification
- ✅ Manual JWT handling for advanced use cases
- ✅ Full TypeScript support with DTOs
- ✅ Error handling and validation
- ✅ Environment configuration

## API Endpoints

### 1. Create Collect Request (Simple)
**Endpoint:** `POST /payment/create-collect-request-simple`

**Description:** Creates a payment link with automatic JWT generation.

**Request Body:**
```json
{
  "school_id": "65b0e6293e9f76a9694d84b4",
  "amount": "1",
  "callback_url": "https://google.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "collect_request_id": "6808bc4888e4e3c149e757f1",
    "Collect_request_url": "<payment_url>",
    "sign": "<jwt_token>"
  }
}
```

### 2. Create Collect Request (Manual JWT)
**Endpoint:** `POST /payment/create-collect-request`

**Description:** Creates a payment link with manually provided JWT.

**Request Body:**
```json
{
  "school_id": "65b0e6293e9f76a9694d84b4",
  "amount": "1",
  "callback_url": "https://google.com",
  "sign": "eyJhbGciOiJIUzI1NiJ9..."
}
```

### 3. Check Payment Status (Simple)
**Endpoint:** `GET /payment/collect-request-simple/{collect_request_id}?school_id={school_id}`

**Description:** Checks payment status with automatic JWT generation.

**Parameters:**
- `collect_request_id` (path): The payment request ID
- `school_id` (query): The school ID

### 4. Check Payment Status (Manual JWT)
**Endpoint:** `GET /payment/collect-request/{collect_request_id}?school_id={school_id}&sign={jwt_token}`

**Description:** Checks payment status with manually provided JWT.

## Environment Variables

Add these to your `.env` file:

```env
# Edviron Payment API Configuration
EDVIRON_API_URL=https://dev-vanilla.edviron.com/erp
EDVIRON_API_KEY=your_api_key_here
PG_SECRET_KEY=your_pg_secret_key_here
```

## JWT Signing

The implementation uses the `JwtUtilService` for automatic JWT generation:

### Create Request JWT Payload:
```json
{
  "school_id": "65b0e6293e9f76a9694d84b4",
  "amount": "1",
  "callback_url": "https://google.com"
}
```

### Status Check JWT Payload:
```json
{
  "school_id": "65b0e6293e9f76a9694d84b4",
  "collect_request_id": "6808bc4888e4e3c149e757f1"
}
```

## Error Handling

The API provides comprehensive error handling:

- **Validation Errors:** Invalid request data (400 Bad Request)
- **API Errors:** Edviron API failures (500 Internal Server Error)
- **JWT Errors:** Invalid or missing JWT tokens (401 Unauthorized)
- **Configuration Errors:** Missing environment variables (500 Internal Server Error)

## Usage Examples

### Node.js/JavaScript
```javascript
// Create payment link
const response = await fetch('/payment/create-collect-request-simple', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    school_id: '65b0e6293e9f76a9694d84b4',
    amount: '100',
    callback_url: 'https://yoursite.com/callback'
  })
});

const data = await response.json();
console.log('Payment URL:', data.data.Collect_request_url);
```

### cURL Examples
```bash
# Create payment link
curl -X POST http://localhost:3000/payment/create-collect-request-simple \
  -H "Content-Type: application/json" \
  -d '{
    "school_id": "65b0e6293e9f76a9694d84b4",
    "amount": "1",
    "callback_url": "https://google.com"
  }'

# Check payment status
curl "http://localhost:3000/payment/collect-request-simple/6808bc4888e4e3c149e757f1?school_id=65b0e6293e9f76a9694d84b4"
```

## Test Credentials

Use these test credentials for development:

- **School ID:** `65b0e6293e9f76a9694d84b4`
- **Test Environment:** Use netbanking or card for simulation (not real UPI/QR)
- **Test Credentials:** https://www.cashfree.com/docs/payments/online/resources/sandbox-environmen

## File Structure

```
src/payment/
├── dto/
│   └── payment.dto.ts          # DTOs for request/response validation
├── payment.controller.ts       # API endpoints
├── payment.service.ts          # Business logic and API integration
├── jwt-util.service.ts         # JWT signing and verification
├── payment.module.ts           # Module configuration
└── test-payment-api.ts         # Test scripts
```

## Security Notes

1. **JWT Secret:** Ensure `PG_SECRET_KEY` is kept secure and not exposed
2. **API Key:** Store `EDVIRON_API_KEY` securely in environment variables
3. **HTTPS:** Always use HTTPS in production for callback URLs
4. **Validation:** All requests are validated using class-validator DTOs
5. **Error Sanitization:** Sensitive information is not exposed in error messages

## Testing

Run the test script to verify the implementation:

```bash
cd backend/src/payment
npx ts-node test-payment-api.ts
```

## Integration with Frontend

The frontend can call these endpoints to:
1. Create payment links for fee collection
2. Check payment status in real-time
3. Handle payment callbacks and webhooks
4. Display payment history and reports