import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { toast } from 'react-toastify';
import { Building2, Phone, Mail, MapPin } from 'lucide-react';
import { Bill, Payment, Organization } from '../types';
import { getBill, addPayment } from '../services/billService';
import { getCustomers } from '../services/customerService';
import { getOrganization } from '../services/organizationService';
import PaymentModal from '../components/common/PaymentModal';
import Button from '../components/common/Button';

const BillViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [bill, setBill] = useState<Bill | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  
  useEffect(() => {
    if (id) {
      fetchBill(id);
    }
  }, [id]);
  
  const fetchBill = async (billId: string) => {
    setLoading(true);
    try {
      const [billData, customersData, orgData] = await Promise.all([
        getBill(billId),
        getCustomers(),
        getOrganization()
      ]);
      
      // Attach customer data
      const billWithCustomer = {
        ...billData,
        customer: customersData.find(c => c.id === billData.customerId)
      };
      
      setBill(billWithCustomer);
      setOrganization(orgData);
    } catch (error) {
      console.error('Error fetching bill:', error);
      toast.error('Failed to load bill');
    } finally {
      setLoading(false);
    }
  };
  
  const handlePayment = async (data: { date: string; amount: number }) => {
    if (!bill) return;
    
    try {
      const updatedBill = await addPayment(bill.id, data);
      setBill(updatedBill);
      toast.success('Payment added successfully');
    } catch (error) {
      console.error('Error adding payment:', error);
      toast.error('Failed to add payment');
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  if (!bill) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Bill not found</h3>
      </div>
    );
  }
  
  const totalPaid = (bill.payments || []).reduce((sum, payment) => sum + payment.amount, 0) + bill.advance;
  const isPaid = totalPaid >= bill.grandTotal;
  const isPartiallyPaid = totalPaid > 0 && totalPaid < bill.grandTotal;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header with Organization Info */}
      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
        <div className="flex justify-between items-start mb-6">
          {/* Organization Details */}
          {organization && (
            <div className="flex items-start space-x-4">
              {organization.logo && (
                <img
                  src={organization.logo}
                  alt="Organization Logo"
                  className="w-16 h-16 rounded-xl object-cover"
                />
              )}
              <div>
                <div className="flex items-center mb-2">
                  <Building2 size={20} className="text-primary-600 mr-2" />
                  <h2 className="text-xl font-bold text-gray-900">{organization.name}</h2>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  {organization.phones.length > 0 && (
                    <div className="flex items-center">
                      <Phone size={14} className="mr-2" />
                      <span>{organization.phones.join(', ')}</span>
                    </div>
                  )}
                  {organization.emails.length > 0 && (
                    <div className="flex items-center">
                      <Mail size={14} className="mr-2" />
                      <span>{organization.emails.join(', ')}</span>
                    </div>
                  )}
                  <div className="flex items-start">
                    <MapPin size={14} className="mr-2 mt-0.5" />
                    <span>{organization.address}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Bill Status */}
          <div className="text-right">
            <div className="mb-3">
              <span className={`inline-flex px-4 py-2 rounded-xl text-sm font-bold
                ${isPaid ? 'bg-green-100 text-green-800 border border-green-200' : 
                  isPartiallyPaid ? 'bg-orange-100 text-orange-800 border border-orange-200' : 
                  'bg-red-100 text-red-800 border border-red-200'}`}
              >
                {isPaid ? '✅ Paid' : isPartiallyPaid ? '⏳ Partially Paid' : '❌ Unpaid'}
              </span>
            </div>
            
            {!isPaid && (
              <Button
                onClick={() => setIsPaymentModalOpen(true)}
                size="sm"
              >
                Add Payment
              </Button>
            )}
          </div>
        </div>
        
        {/* Bill Header */}
        <div className="border-t border-gray-100 pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Bill Info */}
            <div className="bg-gradient-to-br from-primary-50 to-purple-50 p-4 rounded-xl border border-primary-100">
              <h3 className="font-bold text-gray-900 mb-3">Bill Information</h3>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Bill #:</span> {bill.billNumber}</div>
                <div><span className="font-medium">Date:</span> {format(new Date(bill.date), 'dd/MM/yyyy')}</div>
                <div><span className="font-medium">Delivery:</span> {format(new Date(bill.deliveryDate), 'dd/MM/yyyy')}</div>
              </div>
            </div>
            
            {/* Customer Info */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
              <h3 className="font-bold text-gray-900 mb-3">Customer Details</h3>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Name:</span> {bill.customer?.name}</div>
                <div><span className="font-medium">Phone:</span> {bill.customer?.phone}</div>
                <div><span className="font-medium">Address:</span> {bill.customer?.address}</div>
              </div>
            </div>
            
            {/* Bill Summary */}
            <div className="bg-gradient-to-br from-green-50 to-primary-50 p-4 rounded-xl border border-green-100">
              <h3 className="font-bold text-gray-900 mb-3">Bill Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-medium">{bill.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span className="font-medium">-{bill.discount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-green-200 pt-2">
                  <span className="font-bold">Grand Total:</span>
                  <span className="font-bold text-primary-600">{bill.grandTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Advance:</span>
                  <span className="font-medium">{bill.advance.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-green-200 pt-2">
                  <span className="font-bold">Due:</span>
                  <span className="font-bold text-orange-600">{bill.due.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs Content */}
      <div className="bg-white rounded-2xl shadow-soft border border-gray-100">
        <Tabs className="p-6">
          <TabList className="flex border-b border-gray-200 mb-6">
            <Tab 
              className="px-6 py-3 text-gray-600 cursor-pointer border-b-2 border-transparent hover:text-gray-900 hover:border-gray-300 font-medium transition-all duration-200"
              selectedClassName="text-primary-600 border-primary-600"
            >
              Items & Measurements
            </Tab>
            <Tab 
              className="px-6 py-3 text-gray-600 cursor-pointer border-b-2 border-transparent hover:text-gray-900 hover:border-gray-300 font-medium transition-all duration-200"
              selectedClassName="text-primary-600 border-primary-600"
            >
              Payment History
            </Tab>
          </TabList>
          
          <TabPanel>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      S.N
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bill.items.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {item.stockId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-3 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-full">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {item.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        {item.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.description || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Measurements */}
            <div className="mt-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Measurements</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bill.items.map((item, index) => (
                  <div key={item.id} className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-semibold text-gray-900">{item.category}</h4>
                      <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                        Item #{index + 1}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(item.measurements).map(([key, value]) => (
                        <div key={key} className="text-sm">
                          <span className="text-gray-600 capitalize">
                            {key.replace('_', ' ')}:
                          </span>
                          <span className="ml-1 font-medium text-gray-900">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabPanel>
          
          <TabPanel>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bill.advance > 0 && (
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(bill.date), 'dd/MM/yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                        +{bill.advance.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          Advance Payment
                        </span>
                      </td>
                    </tr>
                  )}
                  {(bill.payments || []).map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(payment.date), 'dd/MM/yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-primary-600">
                        +{payment.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-3 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-full">
                          Payment
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {bill.advance === 0 && (!bill.payments || bill.payments.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <p>No payments recorded yet</p>
                </div>
              )}
            </div>
          </TabPanel>
        </Tabs>
      </div>
      
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        maxAmount={bill.due}
        onSubmit={handlePayment}
      />
    </div>
  );
};

export default BillViewPage;