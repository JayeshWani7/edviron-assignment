import { useState, useEffect } from 'react';
import { 
  CurrencyRupeeIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import { transactionService } from '../services/transaction';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

interface DashboardStats {
  totalTransactions: number;
  totalAmount: number;
  successfulTransactions: number;
  pendingTransactions: number;
  failedTransactions: number;
  successRate: number;
  todayTransactions: number;
  todayAmount: number;
  recentTransactions: any[];
}

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState('7'); // Last 7 days
  const [stats, setStats] = useState<DashboardStats>({
    totalTransactions: 0,
    totalAmount: 0,
    successfulTransactions: 0,
    pendingTransactions: 0,
    failedTransactions: 0,
    successRate: 0,
    todayTransactions: 0,
    todayAmount: 0,
    recentTransactions: []
  });

  // Fetch all transactions for calculations
  const { data: transactionsData, isLoading } = useQuery({
    queryKey: ['dashboard-transactions', dateRange],
    queryFn: () => transactionService.getAllTransactions(1, 1000), // Get many transactions for calculations
  });

  // Fetch recent transactions for display
  const { data: recentData } = useQuery({
    queryKey: ['recent-transactions'],
    queryFn: () => transactionService.getAllTransactions(1, 10, 'createdAt', 'desc'),
  });

  useEffect(() => {
    if (transactionsData?.transactions) {
      const transactions = transactionsData.transactions;
      const now = new Date();
      const rangeStart = subDays(now, parseInt(dateRange));
      const todayStart = startOfDay(now);
      const todayEnd = endOfDay(now);

      // Filter transactions by date range
      const filteredTransactions = transactions.filter(transaction => {
        if (!transaction.createdAt) return false;
        const createdAt = new Date(transaction.createdAt);
        return createdAt >= rangeStart;
      });

      // Filter today's transactions
      const todayTransactions = transactions.filter(transaction => {
        if (!transaction.createdAt) return false;
        const createdAt = new Date(transaction.createdAt);
        return createdAt >= todayStart && createdAt <= todayEnd;
      });

      // Calculate statistics
      const totalAmount = filteredTransactions.reduce((sum, t) => sum + (t.order_amount || 0), 0);
      const successfulTransactions = filteredTransactions.filter(t => t.status === 'success').length;
      const pendingTransactions = filteredTransactions.filter(t => t.status === 'pending').length;
      const failedTransactions = filteredTransactions.filter(t => t.status === 'failed').length;
      const successRate = filteredTransactions.length > 0 ? (successfulTransactions / filteredTransactions.length) * 100 : 0;
      
      const todayAmount = todayTransactions.reduce((sum, t) => sum + (t.order_amount || 0), 0);

      setStats({
        totalTransactions: filteredTransactions.length,
        totalAmount,
        successfulTransactions,
        pendingTransactions,
        failedTransactions,
        successRate,
        todayTransactions: todayTransactions.length,
        todayAmount,
        recentTransactions: recentData?.transactions || []
      });
    }
  }, [transactionsData, dateRange, recentData]);

  const statCards = [
    {
      title: 'Total Revenue',
      value: `₹${stats.totalAmount.toLocaleString()}`,
      icon: CurrencyRupeeIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      change: '+12.5%',
      changeColor: 'text-green-600'
    },
    {
      title: 'Total Transactions',
      value: stats.totalTransactions.toLocaleString(),
      icon: ChartBarIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      change: '+8.3%',
      changeColor: 'text-green-600'
    },
    {
      title: 'Success Rate',
      value: `${stats.successRate.toFixed(1)}%`,
      icon: CheckCircleIcon,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/20',
      change: '+2.1%',
      changeColor: 'text-green-600'
    },
    {
      title: "Today's Revenue",
      value: `₹${stats.todayAmount.toLocaleString()}`,
      icon: CalendarDaysIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
      change: '+15.7%',
      changeColor: 'text-green-600'
    }
  ];

  const statusCards = [
    {
      title: 'Successful',
      count: stats.successfulTransactions,
      icon: CheckCircleIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20'
    },
    {
      title: 'Pending',
      count: stats.pendingTransactions,
      icon: ClockIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20'
    },
    {
      title: 'Failed',
      count: stats.failedTransactions,
      icon: XCircleIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900/20'
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      success: 'status-success',
      pending: 'status-pending',
      failed: 'status-failed',
    };
    
    // Handle undefined or null status
    const safeStatus = status || 'unknown';
    
    return (
      <span className={statusClasses[safeStatus as keyof typeof statusClasses] || 'bg-gray-100 text-gray-800'}>
        {safeStatus.charAt(0).toUpperCase() + safeStatus.slice(1)}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Overview of payment transactions and analytics</p>
        </div>
        
        <div className="mt-4 sm:mt-0">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="input-field"
          >
            <option value="1">Last 24 hours</option>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="card">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <div className="flex items-center">
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                  <span className={`ml-2 text-sm ${stat.changeColor}`}>
                    {stat.change}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statusCards.map((status, index) => (
          <div key={index} className="card">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${status.bgColor}`}>
                <status.icon className={`h-6 w-6 ${status.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {status.title} Transactions
                </p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {status.count.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Transactions
          </h2>
          <a
            href="/transactions"
            className="text-primary-600 hover:text-primary-500 text-sm font-medium"
          >
            View all →
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="table-header">Order ID</th>
                <th className="table-header">Student</th>
                <th className="table-header">Amount</th>
                <th className="table-header">Gateway</th>
                <th className="table-header">Status</th>
                <th className="table-header">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {stats.recentTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="table-cell text-center py-8 text-gray-500 dark:text-gray-400">
                    No recent transactions
                  </td>
                </tr>
              ) : (
                stats.recentTransactions.slice(0, 5).map((transaction) => (
                  <tr key={transaction.collect_id} className="table-row">
                    <td className="table-cell">
                      <div className="font-mono text-sm">
                        {transaction.custom_order_id}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {transaction.student_info.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {transaction.student_info.email}
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="font-medium">
                        ₹{transaction.order_amount?.toLocaleString()}
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded">
                        {transaction.gateway}
                      </span>
                    </td>
                    <td className="table-cell">
                      {getStatusBadge(transaction.status)}
                    </td>
                    <td className="table-cell text-sm">
                      {format(new Date(transaction.createdAt), 'MMM dd, HH:mm')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <BuildingOfficeIcon className="h-8 w-8 text-blue-600 mr-4" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">School Transactions</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">View transactions by school</p>
            </div>
          </div>
          <a
            href="/school-transactions"
            className="mt-4 block w-full btn-secondary text-center"
          >
            View School Transactions
          </a>
        </div>

        <div className="card">
          <div className="flex items-center">
            <AcademicCapIcon className="h-8 w-8 text-green-600 mr-4" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">All Transactions</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Browse all payment records</p>
            </div>
          </div>
          <a
            href="/transactions"
            className="mt-4 block w-full btn-secondary text-center"
          >
            View All Transactions
          </a>
        </div>

        <div className="card">
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-purple-600 mr-4" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Check Status</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Look up transaction status</p>
            </div>
          </div>
          <a
            href="/status-check"
            className="mt-4 block w-full btn-secondary text-center"
          >
            Check Transaction Status
          </a>
        </div>
      </div>
    </div>
  );
}