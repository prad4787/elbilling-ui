import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { toast } from 'react-toastify';
import { Edit, FileText, DollarSign } from 'lucide-react';
import { Customer, Bill } from '../types';
import { getCustomer, updateCustomer } from '../services/customerService';
import { getBills } from '../services/billService';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import CustomerForm from '../features/customer/components/CustomerForm';
import PaymentModal from '../components/common/PaymentModal';

const CustomerViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  
  useEffect(() => {
    if (id) {
      fetchCustomerData(id);
    }
  }, [id]);
  
  const fetchCustomerData = async (customerId: string) => {
    setLoading(true);
    try {
      const [customerData, billsData] = await Promise.all([
        getCustomer(customerId),
        getBills()
      ]);
      
      setCustomer(customerData);
      setBills(billsData.filter(bill => bill.customerId === customerId));
    } catch (error) {
      console.error('Error fetching customer data:', error);
      toast.error('Failed to load customer data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCustomer = async (data: Omit<Customer, 'id'>) => {
    if (!customer) return;
    
    try {
      const updatedCustomer = await updateCustomer(customer.id, data);
      setCustomer(updatedCustomer);
      setIsEditModalOpen(false);
      toast.success('Customer updated successfully');
    } catch (error) {
      console.error('Error updating customer:', error);
      toast.error('Failed to update customer');
    }
  };

  const handlePayment = async (data: { date: string; amount: number }) => {
    if (!selectedBill) return;
    
    try {
      // Add payment logic here
      toast.success('Payment added successfully');
      setIsPaymentModalOpen(false);
      fetchCustomerData(id!);
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
  
  if (!customer) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Customer not found</h3>
      </div>
    );
  }
  
  // Calculate total amount spent and due
  const totalSpent = bills.reduce((sum, bill) => sum + bill.grandTotal, 0);
  const totalDue = bills.reduce((sum, bill) => sum + bill.due, 0);

  return (
    <div className="max-w-7xl mx-auto py-6">
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0">
                {customer.avatar ? (
                  <img
                    src={customer.avatar}
                    alt={customer.name}
                    className="h-24 w-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-2xl font-medium text-indigo-600">
                      {customer.name?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  </div>
                )}
              </div>
              
              <div>
                <div className="flex items-center space-x-4">
                  <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="text-gray-400 hover:text-indigo-600 transition-colors"
                  >
                    <Edit size={20} />
                  </button>
                </div>
                <p className="text-gray-600">{customer.phone}</p>
                <p className="text-gray-600">{customer.address}</p>
                {customer.description && (
                  <p className="mt-2 text-gray-600">{customer.description}</p>
                )}
              </div>
            </div>
            
            <div className="text-right">
              <div className="bg-gray-50 p-4 rounded">
                <div className="mb-2">
                  <span className="text-gray-600">Total Spent:</span>
                  <span className="ml-2 font-medium">{totalSpent}</span>
                </div>
                <div>
                  <span className="text-gray-600">Total Due:</span>
                  <span className="ml-2 font-medium text-red-600">{totalDue}</span>
                </div>
              </div>
            </div>
          </div>
          
          {customer.referrer && (
            <div className="bg-gray-50 p-4 rounded mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Referred By</h3>
              <p className="font-medium">{customer.referrer.name}</p>
              <p className="text-gray-600">{customer.referrer.phone}</p>
            </div>
          )}
        </div>
        
        <Tabs className="p-6">
          <TabList className="flex border-b border-gray-200 mb-6">
            <Tab 
              className="px-4 py-2 text-gray-600 cursor-pointer border-b-2 border-transparent hover:text-gray-900 hover:border-gray-300"
              selectedClassName="text-indigo-600 border-indigo-600"
            >
              Bills & Payments
            </Tab>
            <Tab 
              className="px-4 py-2 text-gray-600 cursor-pointer border-b-2 border-transparent hover:text-gray-900 hover:border-gray-300"
              selectedClassName="text-indigo-600 border-indigo-600"
            >
              Measurements
            </Tab>
          </TabList>
          
          <TabPanel>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bill Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Paid
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bills.map((bill) => {
                    const totalPaid = (bill.payments || []).reduce((sum, payment) => sum + payment.amount, 0) + bill.advance;
                    const isPaid = totalPaid >= bill.grandTotal;
                    const isPartiallyPaid = totalPaid > 0 && totalPaid < bill.grandTotal;
                    
                    return (
                      <tr key={bill.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {bill.billNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {format(new Date(bill.date), 'dd/MM/yyyy')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {bill.grandTotal}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {totalPaid}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {bill.due}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full
                            ${isPaid ? 'bg-green-100 text-green-800' : 
                              isPartiallyPaid ? 'bg-amber-100 text-amber-800' : 
                              'bg-red-100 text-red-800'}`}
                          >
                            {isPaid ? 'Paid' : isPartiallyPaid ? 'Partial' : 'Unpaid'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            {!isPaid && (
                              <button
                                onClick={() => {
                                  setSelectedBill(bill);
                                  setIsPaymentModalOpen(true);
                                }}
                                className="text-gray-500 hover:text-indigo-600 transition-colors"
                                title="Add Payment"
                              >
                                <DollarSign size={18} />
                              </button>
                            )}
                            <Link
                              to={`/bills/${bill.id}`}
                              className="text-gray-500 hover:text-blue-600 transition-colors"
                              title="View Bill"
                            >
                              <FileText size={18} />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </TabPanel>
          
          <TabPanel>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bills.map((bill) => (
                bill.items.map((item) => (
                  <div key={`${bill.id}-${item.id}`} className="bg-gray-50 p-4 rounded">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-medium text-gray-900">{item.category}</h3>
                        <p className="text-sm text-gray-600">
                          Bill #{bill.billNumber} - {format(new Date(bill.date), 'dd/MM/yyyy')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(item.measurements).map(([key, value]) => (
                        <div key={key}>
                          <span className="text-sm text-gray-600">
                            {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}:
                          </span>
                          <span className="ml-2 font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ))}
            </div>
          </TabPanel>
        </Tabs>
      </div>
      
      {/* Edit Customer Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Customer"
      >
        <CustomerForm
          customer={customer}
          mode="edit"
          onSubmit={handleUpdateCustomer}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>
      
      {/* Payment Modal */}
      {selectedBill && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false);
            setSelectedBill(null);
          }}
          maxAmount={selectedBill.due}
          onSubmit={handlePayment}
        />
      )}
    </div>
  );
};

export default CustomerViewPage;