export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface Transaction {
  collect_id: string;
  school_id: string;
  gateway: string;
  order_amount: number;
  transaction_amount: number;
  status: 'success' | 'pending' | 'failed';
  custom_order_id: string;
  student_info: {
    name: string;
    id: string;
    email: string;
  };
  trustee_id: string;
  payment_mode?: string;
  payment_details?: string;
  bank_reference?: string;
  payment_message?: string;
  error_message?: string;
  payment_time?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TransactionFilters {
  status?: string[];
  school_id?: string[];
  gateway?: string[];
  date_from?: string;
  date_to?: string;
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TransactionsResponse {
  transactions: Transaction[];
  pagination: PaginationInfo;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
  path: string;
}