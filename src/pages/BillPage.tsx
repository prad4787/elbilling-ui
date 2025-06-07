import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Plus, X, Copy } from 'lucide-react';
import { toast } from 'react-toastify';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import SearchableSelect from '../components/common/SearchableSelect';
import MeasurementModal from '../components/common/MeasurementModal';
import MeasurementSelectionModal from '../components/common/MeasurementSelectionModal';
import { Customer, Stock, BillItem, CATEGORY_MEASUREMENTS } from '../types';
import { getCustomers } from '../services/customerService';
import { getStocks } from '../services/stockService';
import { getBills } from '../services/billService';
import { createBill } from '../services/billService';

interface BillItemRow extends BillItem {
  tempId: string;
}

const BillPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [previousBills, setPreviousBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [billNumber, setBillNumber] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [deliveryDate, setDeliveryDate] = useState('');
  
  const [items, setItems] = useState<BillItemRow[]>([]);
  const [total, setTotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [advance, setAdvance] = useState(0);
  const [due, setDue] = useState(0);
  
  const [measurementModal, setMeasurementModal] = useState({
    isOpen: false,
    itemId: '',
    category: ''
  });

  const [measurementSelectionModal, setMeasurementSelectionModal] = useState({
    isOpen: false,
    itemId: '',
    category: '',
    options: [] as any[]
  });
  
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedCustomer) {
      fetchPreviousBills(selectedCustomer);
    }
  }, [selectedCustomer]);
  
  useEffect(() => {
    const itemsTotal = items.reduce((sum, item) => sum + (item.total || 0), 0);
    setTotal(itemsTotal);
    const calculatedGrandTotal = itemsTotal - discount;
    setGrandTotal(calculatedGrandTotal);
    setDue(calculatedGrandTotal - advance);
  }, [items, discount, advance]);
  
  const fetchData = async () => {
    setLoading(true);
    try {
      const [customersData, stocksData] = await Promise.all([
        getCustomers(),
        getStocks()
      ]);
      setCustomers(customersData);
      setStocks(stocksData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchPreviousBills = async (customerId: string) => {
    try {
      const bills = await getBills();
      const customerBills = bills.filter(bill => bill.customerId === customerId);
      setPreviousBills(customerBills);
    } catch (error) {
      console.error('Error fetching previous bills:', error);
    }
  };
  
  const addRow = () => {
    setItems(prev => [...prev, {
      tempId: Date.now().toString(),
      id: '',
      stockId: '',
      category: '',
      quantity: 1,
      price: 0,
      total: 0,
      measurements: {}
    }]);
  };
  
  const removeRow = (tempId: string) => {
    setItems(prev => prev.filter(item => item.tempId !== tempId));
  };
  
  const updateRow = (tempId: string, field: keyof BillItemRow, value: any) => {
    setItems(prev => prev.map(item => {
      if (item.tempId === tempId) {
        const updatedItem = { ...item, [field]: value };
        
        if (field === 'quantity' || field === 'price') {
          updatedItem.total = updatedItem.quantity * updatedItem.price;
        }
        
        return updatedItem;
      }
      return item;
    }));
  };
  
  const handleMeasurements = (tempId: string, category: string) => {
    setMeasurementModal({
      isOpen: true,
      itemId: tempId,
      category
    });
  };
  
  const saveMeasurements = (measurements: Record<string, string | number>) => {
    setItems(prev => prev.map(item => {
      if (item.tempId === measurementModal.itemId) {
        return { ...item, measurements };
      }
      return item;
    }));
  };

  const handleCopyMeasurements = (tempId: string, category: string) => {
    // Get measurements from current bill
    const currentBillMeasurements = items
      .filter(item => 
        item.tempId !== tempId && 
        item.category === category && 
        Object.keys(item.measurements).length > 0
      )
      .map(item => ({
        source: 'current' as const,
        measurements: item.measurements
      }));

    // Get measurements from previous bills
    const previousBillMeasurements = previousBills
      .filter(bill => bill.items.some(item => 
        item.category === category && 
        Object.keys(item.measurements).length > 0
      ))
      .map(bill => {
        const item = bill.items.find(item => 
          item.category === category && 
          Object.keys(item.measurements).length > 0
        );
        return {
          source: 'previous' as const,
          billNumber: bill.billNumber,
          date: bill.date,
          measurements: item.measurements
        };
      });

    const options = [...currentBillMeasurements, ...previousBillMeasurements];

    if (options.length === 0) {
      toast.info('No previous measurements found for this category');
      return;
    }

    setMeasurementSelectionModal({
      isOpen: true,
      itemId: tempId,
      category,
      options
    });
  };

  const handleSelectMeasurements = (measurements: Record<string, string | number>) => {
    setItems(prev => prev.map(item => {
      if (item.tempId === measurementSelectionModal.itemId) {
        return { ...item, measurements };
      }
      return item;
    }));
    toast.success('Measurements copied successfully');
  };
  
  const validateForm = () => {
    if (!selectedCustomer) {
      toast.error('Please select a customer');
      return false;
    }
    
    if (!billNumber) {
      toast.error('Please enter bill number');
      return false;
    }
    
    if (!date || !deliveryDate) {
      toast.error('Please select both date and delivery date');
      return false;
    }
    
    if (items.length === 0) {
      toast.error('Please add at least one item');
      return false;
    }
    
    for (const item of items) {
      if (!item.stockId || !item.category || !item.quantity || !item.price) {
        toast.error('Please fill all required fields for each item');
        return false;
      }
      
      if (Object.keys(item.measurements).length === 0) {
        toast.error('Please add measurements for each item');
        return false;
      }
    }
    
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await createBill({
        billNumber,
        customerId: selectedCustomer,
        date,
        deliveryDate,
        items: items.map(({ tempId, ...item }) => item),
        total,
        discount,
        grandTotal,
        advance,
        due,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      toast.success('Bill created successfully');
      // Reset form
      setSelectedCustomer('');
      setBillNumber('');
      setDeliveryDate('');
      setItems([]);
      setDiscount(0);
      setAdvance(0);
    } catch (error) {
      console.error('Error creating bill:', error);
      toast.error('Failed to create bill');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Create Bill</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <SearchableSelect
                label="Customer"
                options={customers.map(c => ({ value: c.id, label: c.name }))}
                value={selectedCustomer}
                onChange={setSelectedCustomer}
                placeholder="Select customer"
              />
              
              <Input
                label="Bill Number"
                value={billNumber}
                onChange={(e) => setBillNumber(e.target.value)}
                placeholder="Enter bill number"
                required
              />
            </div>
            
            <div>
              <Input
                type="date"
                label="Date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
              
              <Input
                type="date"
                label="Delivery Date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="mb-6">
            <Button
              type="button"
              onClick={addRow}
              icon={<Plus size={16} />}
              variant="outline"
            >
              Add Item
            </Button>
          </div>
          
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    S.N
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((item, index) => {
                  const selectedStock = stocks.find(s => s.id === item.stockId);
                  const hasPreviousMeasurements = items.some((prevItem, prevIndex) => 
                    prevIndex < index && 
                    prevItem.category === selectedStock?.category && 
                    Object.keys(prevItem.measurements).length > 0
                  ) || (
                    selectedCustomer && 
                    selectedStock && 
                    previousBills.some(bill => 
                      bill.items.some(billItem => 
                        billItem.category === selectedStock.category && 
                        Object.keys(billItem.measurements).length > 0
                      )
                    )
                  );
                  
                  return (
                    <tr key={item.tempId}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <SearchableSelect
                          options={stocks.map(s => ({ value: s.id, label: s.name }))}
                          value={item.stockId}
                          onChange={(value) => {
                            const stock = stocks.find(s => s.id === value);
                            updateRow(item.tempId, 'stockId', value);
                            if (stock) {
                              updateRow(item.tempId, 'category', stock.category);
                            }
                          }}
                          placeholder="Select stock"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {selectedStock && (
                          <div className="flex items-center space-x-2">
                            <Button
                              onClick={() => handleMeasurements(item.tempId, selectedStock.category)}
                              variant={Object.keys(item.measurements).length > 0 ? 'primary' : 'outline'}
                              size="sm"
                            >
                              {selectedStock.category}
                            </Button>
                            {hasPreviousMeasurements && Object.keys(item.measurements).length === 0 && (
                              <Button
                                onClick={() => handleCopyMeasurements(item.tempId, selectedStock.category)}
                                variant="outline"
                                size="sm"
                                title="Copy measurements"
                              >
                                <Copy size={16} />
                              </Button>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateRow(item.tempId, 'quantity', parseInt(e.target.value) || 0)}
                          min="1"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Input
                          type="number"
                          value={item.price}
                          onChange={(e) => updateRow(item.tempId, 'price', parseFloat(e.target.value) || 0)}
                          min="0"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.total}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Input
                          value={item.description || ''}
                          onChange={(e) => updateRow(item.tempId, 'description', e.target.value)}
                          placeholder="Description"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          type="button"
                          onClick={() => removeRow(item.tempId)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <X size={20} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div></div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Total:</span>
                <span className="text-gray-900 font-medium">{total}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Discount:</span>
                <Input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  min="0"
                  className="w-32"
                />
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Grand Total:</span>
                <span className="text-gray-900 font-medium">{grandTotal}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Advance:</span>
                <Input
                  type="number"
                  value={advance}
                  onChange={(e) => setAdvance(parseFloat(e.target.value) || 0)}
                  min="0"
                  className="w-32"
                />
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Due:</span>
                <span className="text-gray-900 font-medium">{due}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <Button
              type="submit"
              isLoading={loading}
            >
              Create Bill
            </Button>
          </div>
        </form>
      </div>
      
      <MeasurementModal
        isOpen={measurementModal.isOpen}
        onClose={() => setMeasurementModal({ isOpen: false, itemId: '', category: '' })}
        category={measurementModal.category}
        measurements={items.find(item => item.tempId === measurementModal.itemId)?.measurements || {}}
        onSave={saveMeasurements}
      />

      <MeasurementSelectionModal
        isOpen={measurementSelectionModal.isOpen}
        onClose={() => setMeasurementSelectionModal({ isOpen: false, itemId: '', category: '', options: [] })}
        options={measurementSelectionModal.options}
        onSelect={handleSelectMeasurements}
      />
    </div>
  );
};

export default BillPage;