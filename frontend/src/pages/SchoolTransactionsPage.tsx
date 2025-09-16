import { useState, useMemo } from 'react';
import { MagnifyingGlassIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import { transactionService } from '../services/transaction';
import { format } from 'date-fns';

const schoolOptions = [
  { id: '65b0e6293e9f76a9694d84b4', name: 'Springfield Elementary School' },
  { id: '65b0e6293e9f76a9694d84b5', name: 'Riverside High School' },
  { id: '65b0e6293e9f76a9694d84b6', name: 'Oakwood Academy' },
  { id: '65b0e6293e9f76a9694d84b7', name: 'Greenfield International' },
];

export default function SchoolTransactionsPage() {
  const [selectedSchoolId, setSelectedSchoolId] = useState('65b0e6293e9f76a9694d84b4');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const limit = 10;

  // Fetch school transactions
  const { data, isLoading, error } = useQuery({
    queryKey: ['school-transactions', selectedSchoolId, page, sortField, sortOrder],
    queryFn: () => transactionService.getTransactionsBySchool(
      selectedSchoolId,
      page,
      limit,
      sortField,
      sortOrder
    ),
    enabled: !!selectedSchoolId,
  });

  // Filter transactions by search term
  const filteredTransactions = useMemo(() => {
    if (!data?.transactions || !searchTerm) return data?.transactions || [];
    
    return data.transactions.filter(transaction =>
      transaction.custom_order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.student_info.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.student_info.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data?.transactions, searchTerm]);

  const selectedSchool = schoolOptions.find(school => school.id === selectedSchoolId);

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

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <BuildingOfficeIcon className="h-8 w-8 mr-3 text-primary-600" />
          School Transactions
        </h1>
      </div>

      {/* School Selection and Search */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select School
            </label>
            <select
              value={selectedSchoolId}
              onChange={(e) => {
                setSelectedSchoolId(e.target.value);
                setPage(1);
              }}
              className="input-field"
            >
              <option value="">Select a school...</option>
              {schoolOptions.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Transactions
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order ID, student name..."
                className="pl-10 input-field"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* School Info */}
      {selectedSchool && (
        <div className="card bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800">
          <div className="flex items-center">
            <BuildingOfficeIcon className="h-8 w-8 text-primary-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-100">
                {selectedSchool.name}
              </h3>
              <p className="text-sm text-primary-700 dark:text-primary-300">
                School ID: {selectedSchool.id}
              </p>
              {data?.pagination && (
                <p className="text-sm text-primary-600 dark:text-primary-400">
                  Total Transactions: {data.pagination.total}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      {selectedSchoolId && (
        <div className="card p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th
                    className="table-header sortable"
                    onClick={() => handleSort('custom_order_id')}
                  >
                    Order ID {getSortIcon('custom_order_id')}
                  </th>
                  <th className="table-header">Student Details</th>
                  <th
                    className="table-header sortable"
                    onClick={() => handleSort('gateway')}
                  >
                    Gateway {getSortIcon('gateway')}
                  </th>
                  <th
                    className="table-header sortable"
                    onClick={() => handleSort('order_amount')}
                  >
                    Amount {getSortIcon('order_amount')}
                  </th>
                  <th
                    className="table-header sortable"
                    onClick={() => handleSort('status')}
                  >
                    Status {getSortIcon('status')}
                  </th>
                  <th className="table-header">Payment Details</th>
                  <th
                    className="table-header sortable"
                    onClick={() => handleSort('payment_time')}
                  >
                    Date {getSortIcon('payment_time')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="table-cell text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                        <span className="ml-2">Loading transactions...</span>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={7} className="table-cell text-center py-8 text-red-500">
                      Failed to load transactions
                    </td>
                  </tr>
                ) : filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="table-cell text-center py-8 text-gray-500 dark:text-gray-400">
                      {data?.transactions.length === 0 
                        ? 'No transactions found for this school' 
                        : 'No transactions match your search'
                      }
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((transaction) => (
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
                          <div className="text-xs text-gray-400 dark:text-gray-500">
                            ID: {transaction.student_info.id}
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded">
                          {transaction.gateway}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div>
                          <div className="font-medium">
                            ₹{transaction.order_amount?.toLocaleString()}
                          </div>
                          {transaction.transaction_amount !== transaction.order_amount && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Paid: ₹{transaction.transaction_amount?.toLocaleString()}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="table-cell">
                        {getStatusBadge(transaction.status)}
                      </td>
                      <td className="table-cell">
                        <div className="text-sm">
                          {transaction.payment_mode && (
                            <div>Mode: {transaction.payment_mode}</div>
                          )}
                          {transaction.bank_reference && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Ref: {transaction.bank_reference}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="table-cell text-sm">
                        {transaction.payment_time ? 
                          format(new Date(transaction.payment_time), 'MMM dd, yyyy HH:mm') :
                          transaction.createdAt ? 
                            format(new Date(transaction.createdAt), 'MMM dd, yyyy HH:mm') :
                            '-'
                        }
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data?.pagination && data.pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing {((page - 1) * limit) + 1} to{' '}
                {Math.min(page * limit, data.pagination.total)} of{' '}
                {data.pagination.total} results
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                  className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <span className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                  Page {page} of {data.pagination.totalPages}
                </span>
                
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= data.pagination.totalPages}
                  className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}