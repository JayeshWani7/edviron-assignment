# School Payments and Dashboard Application

A comprehensive full-stack application for managing school payment transactions with a modern web interface. This system provides secure payment processing, transaction management, and detailed analytics for educational institutions.

## 🚀 Project Overview

This application consists of two main components:
- **Backend API**: NestJS-based REST API with MongoDB integration
- **Frontend Dashboard**: React-based responsive web application

### Key Features
- 🔐 **Secure Authentication**: JWT-based user authentication and authorization
- 💳 **Payment Processing**: Integration with multiple payment gateways (Razorpay, Stripe, PayU)
- 📊 **Transaction Management**: Complete CRUD operations for payment transactions
- 🏫 **School Management**: Multi-school support with dedicated transaction views
- 📈 **Analytics Dashboard**: Real-time statistics and reporting
- 🔍 **Advanced Search**: Filter and search capabilities across all data
- 📱 **Responsive Design**: Mobile-first design for all screen sizes
- 🌙 **Dark Mode**: Theme switching with system preference detection

## 🏗️ Architecture

```
edviron-assessment/
├── backend/                 # NestJS API Server
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── transactions/   # Transaction management
│   │   ├── webhooks/       # Payment gateway webhooks
│   │   └── common/         # Shared utilities and guards
│   ├── package.json
│   └── README.md
├── frontend/               # React Dashboard Application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Main application pages
│   │   ├── contexts/      # React Context providers
│   │   └── services/      # API integration services
│   ├── package.json
│   └── README.md
└── README.md              # This file
```

## 🛠️ Technology Stack

### Backend Technologies
- **Framework**: NestJS (Node.js)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Class Validator & Class Transformer
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest
- **Payment Gateways**: Razorpay, Stripe, PayU Integration

### Frontend Technologies
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context API + React Query
- **Routing**: React Router DOM v6
- **UI Components**: Headless UI + Heroicons
- **HTTP Client**: Axios with interceptors
- **Date Handling**: date-fns
- **Notifications**: React Hot Toast

### Development Tools
- **Language**: TypeScript (Full-stack)
- **Package Manager**: npm
- **Code Quality**: ESLint, Prettier
- **Version Control**: Git

## 🚦 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd edviron-assessment
```

### 2. Setup Backend
```bash
cd backend
npm install

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URL and JWT secret

# Start the backend server
npm run start:dev
```

### 3. Setup Frontend
```bash
cd ../frontend
npm install

# Configure environment
echo "VITE_API_BASE_URL=http://localhost:3000/api" > .env

# Start the frontend development server
npm run dev
```

### 4. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api (Swagger UI)

## 📖 Detailed Setup

For detailed setup instructions, refer to the individual README files:
- [Backend Setup Guide](./backend/README.md)
- [Frontend Setup Guide](./frontend/README.md)

## 🎯 Core Functionalities

### Authentication System
- User registration with email validation
- Secure login with JWT token generation
- Token-based API authentication
- Protected routes and API endpoints
- Automatic token refresh handling

### Payment Transaction Management
- Complete transaction lifecycle management
- Support for multiple payment gateways
- Real-time transaction status updates
- Webhook handling for payment confirmations
- Transaction search and filtering
- Export capabilities for reporting

### Dashboard Analytics
- Real-time transaction statistics
- Revenue tracking and analytics
- Success rate monitoring
- Date-range based reporting
- School-wise transaction breakdown
- Visual data representation

### School Management
- Multi-school support
- School-specific transaction filtering
- Individual school analytics
- Bulk operations for school data
- Custom school configuration

### Advanced Features
- **Real-time Search**: Instant search across transactions
- **Advanced Filtering**: Multiple filter combinations
- **URL State Management**: Bookmarkable filtered views
- **Responsive Design**: Optimized for all devices
- **Dark/Light Theme**: User preference-based theming
- **Data Pagination**: Efficient large dataset handling
- **Error Handling**: Comprehensive error management
- **Loading States**: User-friendly loading indicators

## 🔌 API Endpoints

### Authentication Endpoints
```
POST /api/auth/register    # User registration
POST /api/auth/login       # User login
GET  /api/auth/profile     # Get user profile
```

### Transaction Endpoints
```
GET    /api/transactions                    # Get all transactions (with filters)
GET    /api/transactions/school/:schoolId   # Get school transactions
POST   /api/transactions                    # Create new transaction
PUT    /api/transactions/:id               # Update transaction
DELETE /api/transactions/:id               # Delete transaction
GET    /api/transaction-status/:orderId    # Check transaction status
```

### Webhook Endpoints
```
POST /api/webhooks/razorpay    # Razorpay payment webhook
POST /api/webhooks/stripe      # Stripe payment webhook  
POST /api/webhooks/payu        # PayU payment webhook
```

For complete API documentation, visit the Swagger UI at `http://localhost:3000/api` when the backend is running.

## 📊 Data Models

### User Model
```typescript
interface User {
  _id: string;
  email: string;
  password: string; // hashed
  createdAt: Date;
  updatedAt: Date;
}
```

### Transaction Model
```typescript
interface Transaction {
  collect_id: string;
  school_id: string;
  gateway: 'razorpay' | 'stripe' | 'payu';
  order_amount: number;
  transaction_amount?: number;
  status: 'success' | 'pending' | 'failed';
  custom_order_id: string;
  payment_mode?: string;
  payment_time?: Date;
  bank_reference?: string;
  student_info: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Database
MONGODB_URI=mongodb://localhost:27017/school-payments

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=3000
NODE_ENV=development

# Payment Gateway Keys (Optional for development)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
PAYU_MERCHANT_KEY=your_payu_merchant_key
PAYU_SALT=your_payu_salt
```

#### Frontend (.env)
```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api

# Optional: Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_DEBUG_MODE=false
```

## 🧪 Testing

### Backend Testing
```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run e2e tests
npm run test:e2e
```

### Frontend Testing
```bash
cd frontend

# Type checking
npm run type-check

# Linting
npm run lint

# Build test
npm run build
```

## 📦 Deployment

### Backend Deployment
1. **Build the application**:
   ```bash
   cd backend
   npm run build
   ```

2. **Set production environment variables**
3. **Deploy to your preferred platform** (Heroku, AWS, Digital Ocean, etc.)

### Frontend Deployment
1. **Build for production**:
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy the `dist/` folder** to static hosting (Vercel, Netlify, AWS S3, etc.)

### Docker Deployment (Optional)
Docker configurations can be added for containerized deployment.

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Add tests for new functionality
5. Commit your changes: `git commit -m 'feat: add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Standards
- **TypeScript**: Strict mode enabled for type safety
- **ESLint**: Consistent code style and quality
- **Prettier**: Code formatting (if configured)
- **Conventional Commits**: Structured commit messages
- **Testing**: Write tests for new features

## 📋 Project Status

### ✅ Completed Features
- [x] Backend API with NestJS and MongoDB
- [x] JWT Authentication system
- [x] Complete transaction CRUD operations
- [x] Payment gateway webhook handling
- [x] Frontend React application with TypeScript
- [x] Responsive UI with Tailwind CSS
- [x] Dashboard with real-time statistics
- [x] Advanced transaction filtering and search
- [x] School-specific transaction views
- [x] Transaction status lookup
- [x] Dark/light theme switching
- [x] URL-based state management
- [x] Comprehensive documentation

### 🔄 Future Enhancements
- [ ] Real-time notifications with WebSockets
- [ ] Advanced analytics and reporting
- [ ] Bulk transaction operations
- [ ] Email notification system
- [ ] Mobile app development
- [ ] Advanced user roles and permissions
- [ ] Multi-language support
- [ ] Data export functionality
- [ ] Audit logs and activity tracking

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Issues**:
   - Ensure MongoDB is running
   - Check connection string in `.env`
   - Verify network connectivity

2. **CORS Issues**:
   - Backend CORS is configured for `http://localhost:5173`
   - Update CORS settings for different frontend URLs

3. **Authentication Problems**:
   - Clear browser localStorage
   - Check JWT token expiration
   - Verify JWT secret configuration

4. **Build Errors**:
   - Clear `node_modules` and reinstall dependencies
   - Check TypeScript compilation errors
   - Verify environment variable configuration

For more specific troubleshooting, check the individual README files in the backend and frontend directories.

## 📞 Support

For questions, issues, or contributions:
- Create an issue in the repository
- Check existing documentation
- Review the troubleshooting section

## 📄 License

This project is part of the Edviron Assessment and is proprietary software.

---

## 📚 Additional Resources

- [NestJS Documentation](https://nestjs.com/)
- [React Documentation](https://react.dev/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Vite Documentation](https://vitejs.dev/)

---

**Built with ❤️ for Edviron Assessment**