import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import { ItemStatusEntry, TailorCounter, Stock, ItemStatus } from '../types';
import { getItemStatus, updateItemStatus } from '../services/itemStatusService';
import { getTailorCounters } from '../services/tailorCounterService';
import { getStocks } from '../services/stockService';

const ItemStatusPage: React.FC = () => {
  const [items, setItems] = useState<ItemStatusEntry[]>([]);
  const [tailorCounters, setTailorCounters] = useState<TailorCounter[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [itemsData, countersData, stocksData] = await Promise.all([
        getItemStatus(),
        getTailorCounters(),
        getStocks()
      ]);
      setItems(itemsData);
      setTailorCounters(countersData);
      setStocks(stocksData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: ItemStatus) => {
    try {
      await updateItemStatus(id, { status });
      fetchData();
      toast.success('Status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleTailorChange = async (id: string, tailorCounterId: string) => {
    try {
      await updateItemStatus(id, { tailorCounterId: tailorCounterId || null });
      fetchData();
      toast.success('Tailor counter assigned successfully');
    } catch (error) {
      console.error('Error assigning tailor:', error);
      toast.error('Failed to assign tailor');
    }
  };

  const getStatusColor = (status: ItemStatus) => {
    switch (status) {
      case 'in_progress':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'ready':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: ItemStatus) => {
    switch (status) {
      case 'in_progress':
        return 'In Progress';
      case 'ready':
        return 'Ready';
      case 'delivered':
        return 'Delivered';
      default:
        return status;
    }
  };

  const filteredItems = items.filter(item => 
    item.date === selectedDate
  );

  // Get unique dates for quick navigation
  const availableDates = [...new Set(items.map(item => item.date))].sort();

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Item Status</h1>
        
        <div className="flex items-center space-x-4">
          <div className="w-48">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              label="Select Date"
            />
          </div>
          
          {/* Quick date navigation */}
          <div className="flex space-x-2">
            {availableDates.map(date => (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  selectedDate === date
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {format(new Date(date), 'MMM dd')}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">No items found for this date</h3>
            <p className="mt-1 text-gray-500">Try selecting a different date</p>
            {availableDates.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Available dates:</p>
                <div className="flex justify-center space-x-2">
                  {availableDates.map(date => (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      className="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200"
                    >
                      {format(new Date(date), 'MMM dd, yyyy')}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">
                  Items for {format(new Date(selectedDate), 'MMMM dd, yyyy')}
                </h2>
                <span className="text-sm text-gray-600">
                  {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      S.N
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tailor Counter
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredItems.map((item, index) => {
                    const stock = stocks.find(s => s.id === item.itemId);
                    const assignedTailor = tailorCounters.find(t => t.id === item.tailorCounterId);
                    
                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {stock?.name || 'Unknown Item'}
                            </div>
                            <div className="text-sm text-gray-500">
                              Code: {stock?.code} | Category: {stock?.category}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="max-w-xs">
                            <Select
                              value={item.tailorCounterId || ''}
                              onChange={(e) => handleTailorChange(item.id, e.target.value)}
                              options={[
                                { value: '', label: 'Not Assigned' },
                                ...tailorCounters.map(counter => ({
                                  value: counter.id,
                                  label: counter.name
                                }))
                              ]}
                              className="text-sm"
                            />
                            {assignedTailor && (
                              <div className="text-xs text-gray-500 mt-1">
                                {assignedTailor.phone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="max-w-xs">
                            <Select
                              value={item.status}
                              onChange={(e) => handleStatusChange(item.id, e.target.value as ItemStatus)}
                              options={[
                                { value: 'in_progress', label: 'In Progress' },
                                { value: 'ready', label: 'Ready' },
                                { value: 'delivered', label: 'Delivered' }
                              ]}
                              className={`text-sm border-2 ${getStatusColor(item.status)}`}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
      
      {/* Status Legend */}
      <div className="mt-6 bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Status Legend</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center">
            <div className="w-4 h-4 rounded bg-red-100 border border-red-200 mr-2"></div>
            <span className="text-sm text-gray-600">In Progress</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded bg-yellow-100 border border-yellow-200 mr-2"></div>
            <span className="text-sm text-gray-600">Ready</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded bg-green-100 border border-green-200 mr-2"></div>
            <span className="text-sm text-gray-600">Delivered</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemStatusPage;