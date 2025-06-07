import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { FileText, Package, TrendingDown, TrendingUp, Calendar, Hash, Tag, BarChart3 } from 'lucide-react';
import { Stock, Bill } from '../types';
import { getStock } from '../services/stockService';
import { getBills } from '../services/billService';

interface StockTransaction {
  date: string;
  type: 'opening' | 'bill' | 'adjustment';
  quantity: number;
  balance: number;
  reference?: string;
  billId?: string;
  description?: string;
}

// Mock transaction data for demonstration
const MOCK_TRANSACTIONS: StockTransaction[] = [
  {
    date: '2024-01-10',
    type: 'opening',
    quantity: 50,
    balance: 50,
    reference: 'Opening Stock',
    description: 'Initial stock entry'
  },
  {
    date: '2024-01-12',
    type: 'bill',
    quantity: -5,
    balance: 45,
    reference: 'Bill #INV-2024-001',
    billId: 'bill-1',
    description: 'Sale to John Doe'
  },
  {
    date: '2024-01-15',
    type: 'adjustment',
    quantity: 10,
    balance: 55,
    reference: 'Stock Adjustment',
    description: 'Received new shipment'
  },
  {
    date: '2024-01-18',
    type: 'bill',
    quantity: -3,
    balance: 52,
    reference: 'Bill #INV-2024-002',
    billId: 'bill-2',
    description: 'Sale to Jane Smith'
  },
  {
    date: '2024-01-20',
    type: 'bill',
    quantity: -2,
    balance: 50,
    reference: 'Bill #INV-2024-003',
    billId: 'bill-3',
    description: 'Sale to Ahmed Khan'
  },
  {
    date: '2024-01-22',
    type: 'adjustment',
    quantity: -5,
    balance: 45,
    reference: 'Stock Adjustment',
    description: 'Damaged items removed'
  },
  {
    date: '2024-01-25',
    type: 'bill',
    quantity: -8,
    balance: 37,
    reference: 'Bill #INV-2024-004',
    billId: 'bill-4',
    description: 'Bulk sale to Fashion Store'
  }
];

// Helper function to safely format dates
const formatDate = (dateValue: string | Date | undefined | null): string => {
  if (!dateValue) return 'N/A';
  
  const date = new Date(dateValue);
  if (isNaN(date.getTime())) return 'N/A';
  
  return format(date, 'dd/MM/yyyy');
};

const StockViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [stock, setStock] = useState<Stock | null>(null);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (id) {
      fetchStockData(id);
    }
  }, [id]);
  
  const fetchStockData = async (stockId: string) => {
    setLoading(true);
    try {
      const [stockData, billsData] = await Promise.all([
        getStock(stockId),
        getBills()
      ]);
      
      setStock(stockData);
      
      // For demo purposes, use mock transactions
      // In a real app, you would generate this from actual data
      setTransactions(MOCK_TRANSACTIONS);
      
    } catch (error) {
      console.error('Error fetching stock data:', error);
      toast.error('Failed to load stock data');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  if (!stock) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Stock not found</h3>
        <p className="text-gray-500">The requested stock item could not be found.</p>
      </div>
    );
  }

  // Calculate statistics
  const currentBalance = transactions[transactions.length - 1]?.balance || 0;
  const totalIn = transactions.filter(t => t.quantity > 0).reduce((sum, t) => sum + t.quantity, 0);
  const totalOut = Math.abs(transactions.filter(t => t.quantity < 0).reduce((sum, t) => sum + t.quantity, 0));
  const totalTransactions = transactions.length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
        {/* Header Section */}
        <div className="bg-gray-900 px-8 py-6">
          <div className="flex justify-between items-start">
            <div className="text-white">
              <h1 className="text-3xl font-bold mb-2">{stock.name}</h1>
              <p className="text-gray-300 text-lg">Stock Details & Transaction History</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">{currentBalance}</div>
                <div className="text-sm text-white/80">Current Stock</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stock Information */}
        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            {/* Basic Info Card */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-gray-100 rounded-lg mr-3">
                  <Package className="h-5 w-5 text-gray-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Basic Info</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Hash className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-sm text-gray-600">Code:</span>
                  <span className="ml-2 font-medium text-gray-900">{stock.code}</span>
                </div>
                <div className="flex items-center">
                  <Tag className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-sm text-gray-600">Category:</span>
                  <span className="ml-2 font-medium text-gray-900">{stock.category}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-sm text-gray-600">Added:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {formatDate(stock.date)}
                  </span>
                </div>
                {stock.hsCode && (
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm text-gray-600">HS Code:</span>
                    <span className="ml-2 font-medium text-gray-900">{stock.hsCode}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Stock In Card */}
            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-green-100 rounded-lg mr-3">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Stock In</h3>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">+{totalIn}</div>
                <div className="text-sm text-green-700">Total Received</div>
              </div>
            </div>

            {/* Stock Out Card */}
            <div className="bg-red-50 rounded-xl p-6 border border-red-200">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-red-100 rounded-lg mr-3">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Stock Out</h3>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600 mb-1">-{totalOut}</div>
                <div className="text-sm text-red-700">Total Sold</div>
              </div>
            </div>

            {/* Transactions Card */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Activity</h3>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">{totalTransactions}</div>
                <div className="text-sm text-blue-700">Total Transactions</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg mr-3">
                <FileText className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Transaction History</h2>
                <p className="text-gray-600">Complete record of all stock movements</p>
              </div>
            </div>
            <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
              {transactions.length} transactions
            </span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Reference
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Balance
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction, index) => (
                <tr key={`${transaction.date}-${index}`} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {formatDate(transaction.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                      transaction.type === 'opening' 
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : transaction.type === 'bill'
                        ? 'bg-red-100 text-red-800 border border-red-200'
                        : 'bg-green-100 text-green-800 border border-green-200'
                    }`}>
                      {transaction.type === 'opening' ? 'Opening' : 
                       transaction.type === 'bill' ? 'Sale' : 'Adjustment'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {transaction.type === 'bill' && transaction.billId ? (
                      <Link 
                        to={`/bills/${transaction.billId}`}
                        className="text-blue-600 hover:text-blue-900 flex items-center font-medium"
                      >
                        {transaction.reference}
                        <FileText size={14} className="ml-1" />
                      </Link>
                    ) : (
                      <span className="text-gray-900 font-medium">{transaction.reference}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {transaction.description || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold">
                    <span className={`${
                      transaction.quantity < 0 
                        ? 'text-red-600' 
                        : transaction.quantity > 0 
                        ? 'text-green-600' 
                        : 'text-gray-600'
                    }`}>
                      {transaction.quantity > 0 ? '+' : ''}{transaction.quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-gray-900">
                    {transaction.balance}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {transactions.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
            <p className="text-gray-500">Transaction history will appear here as stock moves in and out.</p>
          </div>
        )}
      </div>

      {/* Stock Status Alert */}
      {currentBalance < 10 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg mr-4">
              <Package className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-orange-900">Low Stock Alert</h3>
              <p className="text-orange-700">
                Current stock level ({currentBalance} units) is below the recommended minimum of 10 units. 
                Consider restocking soon to avoid stockouts.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockViewPage;