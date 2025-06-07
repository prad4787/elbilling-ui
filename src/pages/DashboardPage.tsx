import React, { useEffect, useState } from 'react';
import { Package, Users, TrendingUp, AlertCircle } from 'lucide-react';
import { getStocks } from '../services/stockService';
import { getCustomers } from '../services/customerService';
import { Stock, Customer } from '../types';

const DashboardPage: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stocksData, customersData] = await Promise.all([
          getStocks(),
          getCustomers()
        ]);
        
        setStocks(stocksData);
        setCustomers(customersData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Calculate low stock items (less than 10 units)
  const lowStockItems = stocks.filter(stock => stock.quantity < 10);
  
  // Calculate total inventory value
  const totalStockItems = stocks.length;
  const totalCustomers = customers.length;

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-indigo-500">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-indigo-100 mr-4">
                  <Package className="h-6 w-6 text-indigo-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Stock Items</p>
                  <p className="text-2xl font-semibold text-gray-900">{totalStockItems}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 mr-4">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Customers</p>
                  <p className="text-2xl font-semibold text-gray-900">{totalCustomers}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 mr-4">
                  <TrendingUp className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Inventory Value</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stocks.reduce((total, stock) => total + stock.quantity, 0)} units
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-amber-500">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-amber-100 mr-4">
                  <AlertCircle className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                  <p className="text-2xl font-semibold text-gray-900">{lowStockItems.length}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Recent Stock Items</h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              {stocks.length > 0 ? (
                stocks.slice(0, 5).map((stock) => (
                  <div key={stock.id} className="px-6 py-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{stock.name}</h3>
                        <p className="text-sm text-gray-500">Code: {stock.code}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{stock.quantity} units</p>
                        <p className="text-sm text-gray-500">{stock.category}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-4 text-center text-gray-500">
                  No stock items found. Add some items to get started.
                </div>
              )}
            </div>
          </div>
          
          {/* Recent Customers */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Recent Customers</h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              {customers.length > 0 ? (
                customers.slice(0, 5).map((customer) => (
                  <div key={customer.id} className="px-6 py-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{customer.name}</h3>
                        <p className="text-sm text-gray-500">{customer.phone}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">{customer.address}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-4 text-center text-gray-500">
                  No customers found. Add some customers to get started.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;