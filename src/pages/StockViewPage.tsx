import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { FileText } from 'lucide-react';
import { Stock, Bill } from '../types';
import { getStock } from '../services/stockService';
import { getBills } from '../services/billService';

interface StockTransaction {
  date: string;
  type: 'opening' | 'bill';
  quantity: number;
  balance: number;
  reference?: string;
  billId?: string;
}

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
      
      // Generate transactions list
      const stockTransactions: StockTransaction[] = [];
      
      // Add opening stock
      stockTransactions.push({
        date: stockData.date,
        type: 'opening',
        quantity: stockData.quantity,
        balance: stockData.quantity,
        reference: 'Opening Stock'
      });
      
      // Add bill transactions
      const relevantBills = billsData.filter(bill => 
        bill.items.some(item => item.stockId === stockId)
      );
      
      relevantBills.forEach(bill => {
        const stockItem = bill.items.find(item => item.stockId === stockId);
        if (stockItem) {
          stockTransactions.push({
            date: bill.date,
            type: 'bill',
            quantity: -stockItem.quantity, // Negative because it's a deduction
            balance: 0, // Will be calculated below
            reference: `Bill #${bill.billNumber}`,
            billId: bill.id
          });
        }
      });
      
      // Sort transactions by date
      stockTransactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      // Calculate running balance
      let runningBalance = stockTransactions[0].balance;
      for (let i = 1; i < stockTransactions.length; i++) {
        runningBalance += stockTransactions[i].quantity;
        stockTransactions[i].balance = runningBalance;
      }
      
      setTransactions(stockTransactions);
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (!stock) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Stock not found</h3>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6">
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{stock.name}</h1>
              <p className="text-gray-600">Code: {stock.code}</p>
              <p className="text-gray-600">Category: {stock.category}</p>
              {stock.hsCode && (
                <p className="text-gray-600">HS Code: {stock.hsCode}</p>
              )}
            </div>
            
            <div className="text-right">
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-sm text-gray-600">Current Stock</p>
                <p className="text-2xl font-bold text-gray-900">
                  {transactions[transactions.length - 1]?.balance || 0}
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Stock Journal</h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reference
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Balance
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction, index) => (
                    <tr key={`${transaction.date}-${index}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(transaction.date), 'dd/MM/yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {transaction.type === 'bill' && transaction.billId ? (
                          <Link 
                            to={`/bills/${transaction.billId}`}
                            className="text-indigo-600 hover:text-indigo-900 flex items-center"
                          >
                            {transaction.reference}
                            <FileText size={16} className="ml-1" />
                          </Link>
                        ) : (
                          <span className="text-gray-900">{transaction.reference}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        <span className={transaction.quantity < 0 ? 'text-red-600' : 'text-green-600'}>
                          {transaction.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                        {transaction.balance}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockViewPage;