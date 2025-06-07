import React, { useEffect, useState } from 'react';
import { Package, Users, TrendingUp, AlertCircle, ArrowUp, ArrowDown } from 'lucide-react';
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
  const totalInventoryUnits = stocks.reduce((total, stock) => total + stock.quantity, 0);

  const statsCards = [
    {
      title: 'Total Stock Items',
      value: totalStockItems,
      icon: Package,
      color: 'from-primary-500 to-primary-600',
      bgColor: 'bg-primary-50',
      textColor: 'text-primary-600',
      change: '+12%',
      changeType: 'increase'
    },
    {
      title: 'Total Customers',
      value: totalCustomers,
      icon: Users,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      change: '+8%',
      changeType: 'increase'
    },
    {
      title: 'Inventory Units',
      value: `${totalInventoryUnits}`,
      icon: TrendingUp,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      change: '+15%',
      changeType: 'increase'
    },
    {
      title: 'Low Stock Alert',
      value: lowStockItems.length,
      icon: AlertCircle,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      change: '-5%',
      changeType: 'decrease'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your inventory.</p>
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsCards.map((stat, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-soft p-6 hover:shadow-medium transition-all duration-300 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
                  </div>
                  <div className={`flex items-center text-sm font-semibold ${
                    stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.changeType === 'increase' ? (
                      <ArrowUp size={16} className="mr-1" />
                    ) : (
                      <ArrowDown size={16} className="mr-1" />
                    )}
                    {stat.change}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-purple-50">
                <h2 className="text-lg font-bold text-gray-900">Recent Stock Items</h2>
                <p className="text-sm text-gray-600">Latest additions to your inventory</p>
              </div>
              
              <div className="divide-y divide-gray-100">
                {stocks.length > 0 ? (
                  stocks.slice(0, 5).map((stock, index) => (
                    <div key={stock.id} className="px-6 py-4 hover:bg-gray-50 transition-colors duration-200">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-3 ${
                            index % 4 === 0 ? 'bg-primary-100 text-primary-600' :
                            index % 4 === 1 ? 'bg-green-100 text-green-600' :
                            index % 4 === 2 ? 'bg-purple-100 text-purple-600' :
                            'bg-orange-100 text-orange-600'
                          }`}>
                            <Package size={18} />
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900">{stock.name}</h3>
                            <p className="text-xs text-gray-500">Code: {stock.code}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900">{stock.quantity} units</p>
                          <p className="text-xs text-gray-500">{stock.category}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-6 py-8 text-center text-gray-500">
                    <Package className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <p>No stock items found. Add some items to get started.</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Recent Customers */}
            <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
                <h2 className="text-lg font-bold text-gray-900">Recent Customers</h2>
                <p className="text-sm text-gray-600">Your newest customer additions</p>
              </div>
              
              <div className="divide-y divide-gray-100">
                {customers.length > 0 ? (
                  customers.slice(0, 5).map((customer, index) => (
                    <div key={customer.id} className="px-6 py-4 hover:bg-gray-50 transition-colors duration-200">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-3 text-white font-semibold text-sm ${
                            index % 4 === 0 ? 'bg-gradient-to-br from-purple-500 to-pink-500' :
                            index % 4 === 1 ? 'bg-gradient-to-br from-primary-500 to-purple-500' :
                            index % 4 === 2 ? 'bg-gradient-to-br from-green-500 to-primary-500' :
                            'bg-gradient-to-br from-orange-500 to-red-500'
                          }`}>
                            {customer.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900">{customer.name}</h3>
                            <p className="text-xs text-gray-500">{customer.phone}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500 max-w-32 truncate">{customer.address}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-6 py-8 text-center text-gray-500">
                    <Users className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <p>No customers found. Add some customers to get started.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;