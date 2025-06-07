import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Plus, X, Copy, Building2 } from 'lucide-react';
import { toast } from 'react-toastify';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import SearchableSelect from '../components/common/SearchableSelect';
import MeasurementModal from '../components/common/MeasurementModal';
import MeasurementSelectionModal from '../components/common/MeasurementSelectionModal';
import { Customer, Stock, BillItem, CATEGORY_MEASUREMENTS, Organization } from '../types';
import { getCustomers } from '../services/customerService';
import { getStocks } from '../services/stockService';
import { getBills } from '../services/billService';
import { createBill } from '../services/billService';
import { getOrganization } from '../services/organizationService';

interface BillItemRow extends BillItem {
  tempId: string;
}

const BillPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [previousBills, setPreviousBills] = useState<any[]>([]);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [billNumber, setBillNumber] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [deliveryDate, setDeliveryDate] = useState('');
  
  const [items, setItems] = useState<BillItemRow[]>([{
      tempId: Date.now().toString(),
      id: '',
      stockId: '',
      category: '',
      quantity: 1,
      price: 0,
      total: 0,
      measurements: {}
    }]);
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
      const [customersData, stocksData, orgData] = await Promise.all([
        getCustomers(),
        getStocks(),
        getOrganization()
      ]);
      setCustomers(customersData);
      setStocks(stocksData);
      setOrganization(orgData);
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
        
        // If updating total, calculate price based on quantity
        if (field === 'total' && updatedItem.quantity > 0) {
          updatedItem.price = updatedItem.total / updatedItem.quantity;
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
      if (!item.stockId || !item.category || !item.quantity || !item.total) {
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
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create New Bill</h1>
            <p className="text-gray-600 mt-1">Generate a new bill for your customer</p>
          </div>
          
          {/* Organization Info */}
          {organization ? (
            <div className="text-right bg-gradient-to-br from-primary-50 to-purple-50 p-4 rounded-xl border border-primary-100">
              <div className="flex items-center justify-end mb-2">
                <Building2 size={20} className="text-primary-600 mr-2" />
                <h3 className="font-bold text-gray-900">{organization.name}</h3>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                {organization.phones.length > 0 && (
                  <p>📞 {organization.phones[0]}</p>
                )}
                {organization.emails.length > 0 && (
                  <p>✉️ {organization.emails[0]}</p>
                )}
                <p>📍 {organization.address}</p>
              </div>
            </div>
          ) : (
            <div className="text-right bg-orange-50 p-4 rounded-xl border border-orange-200">
              <p className="text-orange-800 font-medium">⚠️ Organization not set up</p>
              <p className="text-sm text-orange-600">Please configure organization details</p>
            </div>
          )}
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <SearchableSelect
                label="Customer *"
                options={customers.map(c => ({ value: c.id, label: c.name }))}
                value={selectedCustomer}
                onChange={setSelectedCustomer}
                placeholder="Select customer"
              />
              
              <Input
                label="Bill Number *"
                value={billNumber}
                onChange={(e) => setBillNumber(e.target.value)}
                placeholder="Enter bill number"
                required
              />
            </div>
            
            <div className="space-y-4">
              <Input
                type="date"
                label="Date *"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
              
              <Input
                type="date"
                label="Delivery Date *"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                required
              />
            </div>
          </div>
          
          {/* Items Section */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Bill Items</h3>
              <Button
                type="button"
                onClick={addRow}
                icon={<Plus size={16} />}
                variant="outline"
                size="sm"
              >
                Add Item
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">S.N</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Stock</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Qty</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Total</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y-0">
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
                      <React.Fragment key={item.tempId}>
                        {/* Main Item Row */}
                        <tr>
                          <td className="py-3 px-4 text-sm text-gray-600 font-medium border-b border-gray-100">
                            {index + 1}
                          </td>
                          <td className="py-3 px-4 border-b border-gray-100">
                            <div className="w-48">
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
                            </div>
                          </td>
                          <td className="py-3 px-4 border-b border-gray-100">
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
                          <td className="py-3 px-4 border-b border-gray-100">
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateRow(item.tempId, 'quantity', parseInt(e.target.value) || 0)}
                              min="1"
                              className="w-20 px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                          </td>
                          <td className="py-3 px-4 border-b border-gray-100">
                            <input
                              type="number"
                              value={item.total}
                              onChange={(e) => updateRow(item.tempId, 'total', parseFloat(e.target.value) || 0)}
                              min="0"
                              step="0.01"
                              className="w-28 px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              placeholder="Total amount"
                            />
                          </td>
                          <td className="py-3 px-4 text-right border-b border-gray-100">
                            <button
                              type="button"
                              onClick={() => removeRow(item.tempId)}
                              className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 transition-colors"
                            >
                              <X size={18} />
                            </button>
                          </td>
                        </tr>
                        
                        {/* Description Row - seamlessly connected */}
                        <tr>
                          <td className="py-2 px-4 border-b border-gray-200"></td>
                          <td colSpan={5} className="py-2 px-4 border-b border-gray-200">
                            <input
                              type="text"
                              value={item.description || ''}
                              onChange={(e) => updateRow(item.tempId, 'description', e.target.value)}
                              placeholder="Add description for this item..."
                              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white transition-all duration-200"
                            />
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
              
              {items.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No items added yet. Click "Add Item" to get started.</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Totals Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div></div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="font-medium text-gray-700">Subtotal:</span>
                  <span className="text-lg font-bold text-gray-900">{total.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Discount:</span>
                  <div className="w-32">
                    <input
                      type="number"
                      value={discount}
                      onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </div>
                
                <div className="flex justify-between items-center py-2 border-t border-gray-100">
                  <span className="text-lg font-bold text-gray-900">Grand Total:</span>
                  <span className="text-xl font-bold text-primary-600">{grandTotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Advance:</span>
                  <div className="w-32">
                    <input
                      type="number"
                      value={advance}
                      onChange={(e) => setAdvance(parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </div>
                
                <div className="flex justify-between items-center py-2 border-t border-gray-100">
                  <span className="text-lg font-bold text-gray-900">Due Amount:</span>
                  <span className="text-xl font-bold text-orange-600">{due.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={loading}
              disabled={items.length === 0}
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