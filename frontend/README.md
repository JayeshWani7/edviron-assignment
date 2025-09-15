# School Payments Dashboard - Frontend

A modern, responsive React application for managing school payment transactions. Built with React 18, TypeScript, Vite, and Tailwind CSS.

## Features

### 🎯 Core Functionality
- **User Authentication**: Secure login/register with JWT tokens
- **Dashboard Overview**: Real-time payment statistics and analytics
- **Transaction Management**: View, filter, sort, and search all transactions
- **School-Specific Transactions**: Filter transactions by school with dedicated interface
- **Transaction Status Check**: Look up individual transaction status by Order ID
- **Dark/Light Theme**: Toggle between themes with system preference detection

### 🎨 User Interface
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Modern Components**: Clean, accessible UI components with Headless UI
- **Interactive Tables**: Sortable columns, advanced filtering, and pagination
- **Real-time Search**: Instant search across transaction data
- **Toast Notifications**: User feedback with React Hot Toast
- **Loading States**: Skeleton screens and loading indicators

### 🚀 Technical Features
- **TypeScript**: Full type safety and enhanced developer experience
- **React Query**: Efficient data fetching, caching, and synchronization
- **URL State Management**: Persistent filters and search params in URLs
- **Context API**: Global state management for auth and theme
- **Protected Routes**: Route guards for authenticated users only
- **API Integration**: Axios with request/response interceptors

## Project Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── Layout.tsx     # Main app layout with navigation
│   │   ├── Login.tsx      # Login form component
│   │   ├── Register.tsx   # Registration form component
│   │   └── ProtectedRoute.tsx  # Route protection wrapper
│   ├── contexts/         # React Context providers
│   │   ├── AuthContext.tsx     # Authentication state management
│   │   └── ThemeContext.tsx    # Theme state management
│   ├── lib/              # Utility libraries
│   │   └── api.ts        # Axios configuration and interceptors
│   ├── pages/            # Main page components
│   │   ├── DashboardPage.tsx        # Overview dashboard
│   │   ├── TransactionsPage.tsx     # All transactions view
│   │   ├── SchoolTransactionsPage.tsx   # School-specific transactions
│   │   └── TransactionStatusPage.tsx    # Status lookup page
│   ├── services/         # API service layers
│   │   ├── auth.ts       # Authentication API calls
│   │   └── transaction.ts # Transaction API calls
│   ├── types/            # TypeScript type definitions
│   │   └── index.ts      # Shared interfaces and types
│   ├── App.tsx          # Main app component with routing
│   ├── main.tsx         # Application entry point
│   └── index.css        # Global styles and Tailwind directives
├── package.json         # Dependencies and scripts
├── tailwind.config.js   # Tailwind CSS configuration
├── tsconfig.json       # TypeScript configuration
└── vite.config.ts      # Vite build configuration
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Backend API running (see backend README)

### Installation

1. **Clone and navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   Create a `.env` file in the frontend directory:
   ```env
   VITE_API_BASE_URL=http://localhost:3000/api
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality
- `npm run type-check` - Run TypeScript compiler check

## Usage Guide

### Authentication
1. **Register**: Create a new account with email and password
2. **Login**: Access the dashboard with your credentials
3. **Auto-login**: Stay logged in with JWT token persistence

### Dashboard
- **Overview Statistics**: Total revenue, transaction counts, success rates
- **Recent Transactions**: Quick view of latest payment activity
- **Quick Actions**: Direct links to main features
- **Date Range Filtering**: View data for different time periods

### Transaction Management
- **All Transactions**: Complete list with advanced filtering
- **Search**: Real-time search by order ID, student name, or email
- **Filter Options**: Status, payment gateway, school ID, date range
- **Sorting**: Click column headers to sort data
- **Pagination**: Navigate through large datasets efficiently

### School Transactions
- **School Selection**: Dropdown to choose specific school
- **Filtered View**: See only transactions for selected school
- **School Statistics**: Total transactions and amounts per school

### Status Check
- **Order Lookup**: Enter order ID to check transaction status
- **Detailed View**: Complete transaction information and timeline
- **Status Timeline**: Visual representation of transaction progress

## Key Features Explained

### URL State Persistence
Filters and search parameters are synchronized with URL for:
- **Bookmarkable URLs**: Share specific filtered views
- **Browser Navigation**: Back/forward button support
- **State Restoration**: Maintain filters on page refresh

### Advanced Filtering
Multiple filter types working together:
- **Status Filter**: Multiple selection with checkboxes
- **Gateway Filter**: Payment method filtering
- **Date Range**: Calendar-based date selection
- **School ID**: Specific school filtering
- **Text Search**: Real-time search across multiple fields

### Responsive Design
Mobile-first approach with breakpoints:
- **Mobile (sm)**: Stacked layouts, hamburger menu
- **Tablet (md)**: Grid layouts, expanded navigation
- **Desktop (lg+)**: Full sidebar, multi-column layouts

## API Integration

### Base Configuration
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
```

### Authentication Flow
```typescript
// Login
const response = await authService.login(email, password);
localStorage.setItem('token', response.access_token);

// Auto-attach token to requests
api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
```

### Data Fetching with React Query
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['transactions', filters],
  queryFn: () => transactionService.getAllTransactions(page, limit, sort, order, filters),
});
```

## Troubleshooting

### Common Issues

1. **API Connection Issues**:
   ```bash
   # Check if backend is running
   curl http://localhost:3000/api/health
   
   # Verify environment variables
   echo $VITE_API_BASE_URL
   ```

2. **Build Errors**:
   ```bash
   # Clear node modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   
   # Type check
   npm run type-check
   ```

3. **Authentication Issues**:
   - Clear localStorage: `localStorage.clear()`
   - Check token expiration in browser DevTools
   - Verify backend JWT configuration

## Dependencies

### Core Dependencies
- **React** (^18.2.0): UI library
- **TypeScript** (^5.0.2): Type safety
- **Vite** (^4.4.5): Build tool
- **React Router DOM** (^6.15.0): Routing
- **@tanstack/react-query** (^4.32.6): Data fetching
- **Tailwind CSS** (^3.3.0): Styling
- **Axios** (^1.5.0): HTTP client

### UI Dependencies
- **@headlessui/react** (^1.7.17): Accessible components
- **@heroicons/react** (^2.0.18): Icon library
- **React Hot Toast** (^2.4.1): Notifications
- **date-fns** (^2.30.0): Date manipulation
- **clsx** (^2.0.0): Conditional classes

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
