# School Payment and Dashboard Application Backend

A comprehensive NestJS microservice for managing school payments and transactions, integrated with payment gateways and providing robust APIs for dashboard operations.

## 🚀 Features

- **JWT Authentication**: Secure user authentication and authorization
- **Payment Gateway Integration**: Seamless integration with external payment APIs
- **Webhook Handling**: Real-time payment status updates
- **Transaction Management**: Complete CRUD operations for transactions
- **MongoDB Integration**: Robust database operations with Mongoose
- **Comprehensive Logging**: Request/response logging with error tracking
- **Data Validation**: Input validation using class-validator
- **Error Handling**: Global exception handling with detailed error responses
- **Pagination & Sorting**: Efficient data retrieval with pagination support

## 📋 Prerequisites

- Node.js (v16 or later)
- npm or yarn
- MongoDB Atlas account
- Payment gateway credentials

## 🛠️ Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Configuration**
```bash
cp .env.example .env
```

Edit `.env` file with your configuration:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/edviron?retryWrites=true&w=majority

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# Payment Gateway
PAYMENT_API_URL=https://staging.edviron.com/api
PG_KEY=edvtest01
PAYMENT_API_KEY=your-api-key
SCHOOL_ID=your-school-id

# Application
PORT=3000
NODE_ENV=development
```

4. **Build the application**
```bash
npm run build
```

5. **Start the application**

Development mode:
```bash
npm run start:dev
```

Production mode:
```bash
npm run start:prod
```

## 📚 API Documentation

### Authentication

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}
```

#### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "jwt-token",
  "user": {
    "id": "user-id",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "user"
  }
}
```

### Payment Operations

#### Create Payment
```http
POST /payment/create-payment
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "school_id": "65b0e6293e9f76a9694d84b4",
  "trustee_id": "trustee-id",
  "student_info": {
    "name": "Student Name",
    "id": "student-123",
    "email": "student@example.com"
  },
  "gateway_name": "PhonePe",
  "amount": 2000,
  "currency": "INR",
  "description": "School fee payment"
}
```

**Response:**
```json
{
  "success": true,
  "order_id": "EDV_1234567890_abcd1234",
  "collect_id": "mongodb-object-id",
  "payment_url": "https://payment-gateway-url.com/pay/xyz",
  "gateway_response": {}
}
```

#### Check Payment Status
```http
GET /payment/status/:customOrderId
Authorization: Bearer <jwt-token>
```

### Transaction Operations

#### Get All Transactions
```http
GET /transactions?page=1&limit=10&sort=createdAt&order=desc
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `sort`: Sort field (default: createdAt)
- `order`: Sort order - asc/desc (default: desc)

**Response:**
```json
{
  "transactions": [
    {
      "collect_id": "mongodb-object-id",
      "school_id": "school-id",
      "gateway": "PhonePe",
      "order_amount": 2000,
      "transaction_amount": 2200,
      "status": "success",
      "custom_order_id": "EDV_1234567890_abcd1234",
      "student_info": {
        "name": "Student Name",
        "id": "student-123",
        "email": "student@example.com"
      },
      "payment_mode": "upi",
      "payment_details": "success@ybl",
      "bank_reference": "YESBNK222",
      "payment_message": "payment success",
      "payment_time": "2025-04-23T08:14:21.945Z"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

#### Get Transactions by School
```http
GET /transactions/school/:schoolId?page=1&limit=10&sort=createdAt&order=desc
Authorization: Bearer <jwt-token>
```

#### Get Transaction Status
```http
GET /transaction-status/:customOrderId
Authorization: Bearer <jwt-token>
```

### Webhook Operations

#### Payment Webhook (Called by Payment Gateway)
```http
POST /webhook
Content-Type: application/json

{
  "status": 200,
  "order_info": {
    "order_id": "EDV_1234567890_abcd1234",
    "order_amount": 2000,
    "transaction_amount": 2200,
    "gateway": "PhonePe",
    "bank_reference": "YESBNK222",
    "status": "success",
    "payment_mode": "upi",
    "payemnt_details": "success@ybl",
    "Payment_message": "payment success",
    "payment_time": "2025-04-23T08:14:21.945+00:00",
    "error_message": "NA"
  }
}
```

#### Get Webhook Logs
```http
GET /webhook/logs?page=1&limit=50
Authorization: Bearer <jwt-token>
```

## 🗄️ Database Schemas

### User Schema
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  name: String,
  role: String (default: 'user'),
  createdAt: Date,
  updatedAt: Date
}
```

### Order Schema
```javascript
{
  _id: ObjectId,
  school_id: String,
  trustee_id: String,
  student_info: {
    name: String,
    id: String,
    email: String
  },
  gateway_name: String,
  custom_order_id: String (unique),
  status: String (default: 'pending'),
  createdAt: Date,
  updatedAt: Date
}
```

### Order Status Schema
```javascript
{
  _id: ObjectId,
  collect_id: ObjectId (ref: Order),
  order_amount: Number,
  transaction_amount: Number,
  payment_mode: String,
  payment_details: String,
  bank_reference: String,
  payment_message: String,
  status: String,
  error_message: String,
  payment_time: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Webhook Log Schema
```javascript
{
  _id: ObjectId,
  order_id: String,
  status_code: Number,
  payload: Object,
  source: String,
  processing_status: String (default: 'received'),
  error_message: String,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔐 Security Features

- JWT-based authentication for all protected routes
- Password hashing using bcryptjs
- Input validation and sanitization
- CORS configuration
- Request logging and monitoring
- Global exception handling

## 📊 Performance Optimizations

- MongoDB indexing on key fields (school_id, custom_order_id, collect_id)
- Pagination for large datasets
- Efficient aggregation pipelines
- Request/response compression
- Connection pooling

## 🧪 Testing

Run tests:
```bash
npm run test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Run test coverage:
```bash
npm run test:cov
```

## 📝 Logging

The application includes comprehensive logging:
- Request/response logging
- Error tracking
- Webhook event logging
- Database operation logging

Logs include:
- Timestamp
- HTTP method and URL
- Response status
- Response time
- User agent
- IP address

## 🚀 Deployment

### Environment Variables for Production

Make sure to set these environment variables in your production environment:

```env
NODE_ENV=production
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
PAYMENT_API_URL=https://production.edviron.com/api
SUCCESS_URL=https://yourdomain.com/payment/success
FAILURE_URL=https://yourdomain.com/payment/failure
WEBHOOK_URL=https://yourdomain.com/webhook
```

### Build for Production
```bash
npm run build
npm run start:prod
```

## 📋 Postman Collection

Import the Postman collection for testing all APIs:

1. Open Postman
2. Click Import
3. Upload the `edviron-api-collection.json` file
4. Set environment variables:
   - `baseUrl`: http://localhost:3000
   - `token`: Your JWT token (from login response)

### Sample Postman Requests

**Environment Variables:**
```json
{
  "baseUrl": "http://localhost:3000",
  "token": "{{access_token}}"
}
```

**Collection Structure:**
- Auth
  - Register User
  - Login User
- Payment
  - Create Payment
  - Get Payment Status
- Transactions
  - Get All Transactions
  - Get School Transactions
  - Get Transaction Status
- Webhook
  - Simulate Webhook
  - Get Webhook Logs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 📞 Support

For support and questions, please contact the development team or create an issue in the repository.

## 🔄 API Flow

1. **User Registration/Login** → Get JWT token
2. **Create Payment** → Generate order and get payment URL
3. **User Completes Payment** → Payment gateway processes
4. **Webhook Notification** → Update transaction status
5. **Check Status** → Retrieve updated transaction status

## 📈 Monitoring

- Use webhook logs to monitor payment gateway communications
- Monitor application logs for errors and performance
- Set up alerts for failed payments and webhook processing errors
- Track transaction success rates and processing times