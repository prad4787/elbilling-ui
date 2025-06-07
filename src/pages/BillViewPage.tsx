import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { toast } from 'react-toastify';
import { Bill, Payment } from '../types';
import { getBill, addPayment } from '../services/billService';
import { getCustomers } from '../services/customerService';
import PaymentModal from '../components/common/PaymentModal';
import Button from '../components/common/Button';

const BillViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [bill, setBill] = useState<Bill | null>(null);
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
      const [billData, customersData] = await Promise.all([
        getBill(billId),
        getCustomers()
      ]);
      
      // Attach customer data
      const billWithCustomer = {
        ...billData,
        customer: customersData.find(c => c.id === billData.customerId)
      };
      
      setBill(billWithCustomer);
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
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
    <div className="max-w-7xl mx-auto py-6">
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Bill #{bill.billNumber}</h1>
              <p className="text-gray-600">
                Date: {format(new Date(bill.date), 'dd/MM/yyyy')}
              </p>
              <p className="text-gray-600">
                Delivery Date: {format(new Date(bill.deliveryDate), 'dd/MM/yyyy')}
              </p>
            </div>
            
            <div className="text-right">
              <div className="mb-2">
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium
                  ${isPaid ? 'bg-green-100 text-green-800' : 
                    isPartiallyPaid ? 'bg-amber-100 text-amber-800' : 
                    'bg-red-100 text-red-800'}`}
                >
                  {isPaid ? 'Paid' : isPartiallyPaid ? 'Partially Paid' : 'Unpaid'}
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
          
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Customer Details</h3>
              <div className="bg-gray-50 p-4 rounded">
                <p className="font-medium">{bill.customer?.name}</p>
                <p className="text-gray-600">{bill.customer?.phone}</p>
                <p className="text-gray-600">{bill.customer?.address}</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Bill Summary</h3>
              <div className="bg-gray-50 p-4 rounded">
                <div className="flex justify-between mb-2">
                  <span>Total:</span>
                  <span className="font-medium">{bill.total}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Discount:</span>
                  <span className="font-medium">{bill.discount}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Grand Total:</span>
                  <span className="font-medium">{bill.grandTotal}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Advance:</span>
                  <span className="font-medium">{bill.advance}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Due:</span>
                  <span>{bill.due}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <Tabs className="p-6">
          <TabList className="flex border-b border-gray-200 mb-6">
            <Tab 
              className="px-4 py-2 text-gray-600 cursor-pointer border-b-2 border-transparent hover:text-gray-900 hover:border-gray-300"
              selectedClassName="text-indigo-600 border-indigo-600"
            >
              Items
            </Tab>
            <Tab 
              className="px-4 py-2 text-gray-600 cursor-pointer border-b-2 border-transparent hover:text-gray-900 hover:border-gray-300"
              selectedClassName="text-indigo-600 border-indigo-600"
            >
              Payments
            </Tab>
          </TabList>
          
          <TabPanel>
            <div className="overflow-x-auto">
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
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bill.items.map((item, index) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.stockId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.total}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabPanel>
          
          <TabPanel>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bill.advance > 0 && (
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(bill.date), 'dd/MM/yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {bill.advance}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Advance
                      </td>
                    </tr>
                  )}
                  {(bill.payments || []).map((payment) => (
                    <tr key={payment.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(payment.date), 'dd/MM/yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Payment
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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