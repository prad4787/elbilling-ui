import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, Search, Eye, FileText, ArrowUpDown, 
  ChevronsDown, ChevronsUp, DollarSign
} from 'lucide-react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import PaymentModal from '../components/common/PaymentModal';
import { Bill } from '../types';
import { getBills, addPayment } from '../services/billService';
import { getCustomers } from '../services/customerService';

const BillListPage: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [filteredBills, setFilteredBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [sortField, setSortField] = useState<keyof Bill>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  
  useEffect(() => {
    fetchBills();
  }, []);
  
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredBills(bills);
    } else {
      const lowercasedSearch = searchTerm.toLowerCase();
      setFilteredBills(
        bills.filter(
          bill => 
            bill.billNumber.toLowerCase().includes(lowercasedSearch) ||
            bill.customer?.name.toLowerCase().includes(lowercasedSearch) ||
            bill.customer?.phone.toLowerCase().includes(lowercasedSearch)
        )
      );
    }
  }, [searchTerm, bills]);
  
  const fetchBills = async () => {
    setLoading(true);
    try {
      const [billsData, customersData] = await Promise.all([
        getBills(),
        getCustomers()
      ]);
      
      // Attach customer data to bills
      const billsWithCustomers = billsData.map(bill => ({
        ...bill,
        customer: customersData.find(c => c.id === bill.customerId)
      }));
      
      setBills(billsWithCustomers);
      setFilteredBills(billsWithCustomers);
    } catch (error) {
      console.error('Error fetching bills:', error);
      toast.error('Failed to load bills');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSort = (field: keyof Bill) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    
    const sortedBills = [...filteredBills].sort((a, b) => {
      let aValue = a[field];
      let bValue = b[field];
      
      if (field === 'date' || field === 'deliveryDate') {
        aValue = new Date(aValue as string).getTime();
        bValue = new Date(bValue as string).getTime();
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    setFilteredBills(sortedBills);
  };
  
  const getPaymentStatus = (bill: Bill) => {
    const totalPaid = (bill.payments || []).reduce((sum, payment) => sum + payment.amount, 0) + bill.advance;
    
    if (totalPaid >= bill.grandTotal) {
      return <span className="text-green-600 font-medium">Paid</span>;
    } else if (totalPaid > 0) {
      return <span className="text-amber-600 font-medium">Partial</span>;
    }
    return <span className="text-red-600 font-medium">Unpaid</span>;
  };
  
  const handlePayment = async (data: { date: string; amount: number }) => {
    if (!selectedBill) return;
    
    try {
      const updatedBill = await addPayment(selectedBill.id, data);
      setBills(prev => prev.map(bill => 
        bill.id === updatedBill.id ? updatedBill : bill
      ));
      toast.success('Payment added successfully');
    } catch (error) {
      console.error('Error adding payment:', error);
      toast.error('Failed to add payment');
    }
  };
  
  const getSortIcon = (field: keyof Bill) => {
    if (sortField !== field) {
      return <ArrowUpDown size={16} />;
    }
    return sortDirection === 'asc' 
      ? <ChevronsUp size={16} /> 
      : <ChevronsDown size={16} />;
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Bills</h1>
        
        <Link to="/bills/new">
          <Button icon={<Plus size={16} />}>
            Create Bill
          </Button>
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Search by bill number or customer"
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : filteredBills.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No bills found</h3>
            <p className="mt-1 text-gray-500">
              {searchTerm ? 'Try adjusting your search term' : 'Get started by creating your first bill'}
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <Link to="/bills/new">
                  <Button icon={<Plus size={16} />}>
                    Create Bill
                  </Button>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('billNumber')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Bill Number</span>
                      {getSortIcon('billNumber')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('date')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Date</span>
                      {getSortIcon('date')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Address
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('grandTotal')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Total</span>
                      {getSortIcon('grandTotal')}
                    </div>
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
                {filteredBills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {bill.billNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(bill.date), 'dd/MM/yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {bill.customer?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {bill.customer?.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {bill.customer?.address}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {bill.grandTotal}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {getPaymentStatus(bill)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
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
                        <Link
                          to={`/bills/${bill.id}`}
                          className="text-gray-500 hover:text-blue-600 transition-colors"
                          title="View"
                        >
                          <Eye size={18} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
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

export default BillListPage;