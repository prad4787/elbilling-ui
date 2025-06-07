import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, Search, Eye, Edit, Trash2, FileText, ArrowUpDown, 
  ChevronsDown, ChevronsUp, UserPlus
} from 'lucide-react';
import { toast } from 'react-toastify';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import CustomerForm from '../features/customer/components/CustomerForm';
import { 
  getCustomers, createCustomer, updateCustomer, deleteCustomer
} from '../services/customerService';
import { Customer, FormMode } from '../types';

const CustomerPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [modalMode, setModalMode] = useState<FormMode>('create');
  
  const [sortField, setSortField] = useState<keyof Customer>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  useEffect(() => {
    fetchCustomers();
  }, []);
  
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCustomers(customers);
    } else {
      const lowercasedSearch = searchTerm.toLowerCase();
      setFilteredCustomers(
        customers.filter(
          customer => 
            customer.name.toLowerCase().includes(lowercasedSearch) ||
            customer.phone.toLowerCase().includes(lowercasedSearch) ||
            customer.address.toLowerCase().includes(lowercasedSearch)
        )
      );
    }
  }, [searchTerm, customers]);
  
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const data = await getCustomers();
      
      // Process referrer relationships
      const customersMap = new Map(data.map(customer => [customer.id, customer]));
      const processedCustomers = data.map(customer => {
        if (customer.referrerId && customersMap.has(customer.referrerId)) {
          return {
            ...customer,
            referrer: customersMap.get(customer.referrerId)
          };
        }
        return customer;
      });
      
      setCustomers(processedCustomers);
      setFilteredCustomers(processedCustomers);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSort = (field: keyof Customer) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    
    const sortedCustomers = [...filteredCustomers].sort((a, b) => {
      const aValue = String(a[field]).toLowerCase();
      const bValue = String(b[field]).toLowerCase();
      
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });
    
    setFilteredCustomers(sortedCustomers);
  };
  
  const openCreateModal = () => {
    setSelectedCustomer(null);
    setModalMode('create');
    setIsModalOpen(true);
  };
  
  const openEditModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setModalMode('edit');
    setIsModalOpen(true);
  };
  
  const openDeleteModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDeleteModalOpen(true);
  };
  
  const handleCreateCustomer = async (data: Omit<Customer, 'id'>) => {
    try {
      await createCustomer(data);
      toast.success('Customer created successfully');
      setIsModalOpen(false);
      fetchCustomers();
    } catch (error) {
      console.error('Error creating customer:', error);
      toast.error('Failed to create customer');
    }
  };
  
  const handleUpdateCustomer = async (data: Omit<Customer, 'id'>) => {
    if (!selectedCustomer) return;
    
    try {
      await updateCustomer(selectedCustomer.id, data);
      toast.success('Customer updated successfully');
      setIsModalOpen(false);
      fetchCustomers();
    } catch (error) {
      console.error('Error updating customer:', error);
      toast.error('Failed to update customer');
    }
  };
  
  const handleDeleteCustomer = async () => {
    if (!selectedCustomer) return;
    
    try {
      await deleteCustomer(selectedCustomer.id);
      toast.success('Customer deleted successfully');
      setIsDeleteModalOpen(false);
      fetchCustomers();
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast.error('Failed to delete customer');
    }
  };
  
  const getSortIcon = (field: keyof Customer) => {
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
        <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
        
        <Button 
          onClick={openCreateModal} 
          icon={<UserPlus size={18} />}
        >
          Add Customer
        </Button>
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
                placeholder="Search by name, phone or address"
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
        ) : filteredCustomers.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No customers found</h3>
            <p className="mt-1 text-gray-500">
              {searchTerm ? 'Try adjusting your search term' : 'Get started by adding your first customer'}
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <Button onClick={openCreateModal} icon={<UserPlus size={18} />}>
                  Add Customer
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    S.No.
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Name</span>
                      {getSortIcon('name')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('phone')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Phone</span>
                      {getSortIcon('phone')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('address')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Address</span>
                      {getSortIcon('address')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Referrer
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.map((customer, index) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {customer.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.address}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.referrer?.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link
                          to={`/customers/${customer.id}`}
                          className="text-gray-500 hover:text-indigo-600 transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </Link>
                        <button
                          onClick={() => openEditModal(customer)}
                          className="text-gray-500 hover:text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => openDeleteModal(customer)}
                          className="text-gray-500 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Customer Form Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'create' ? 'Add New Customer' : 'Edit Customer'}
      >
        <CustomerForm 
          customer={selectedCustomer || undefined}
          mode={modalMode}
          onSubmit={modalMode === 'create' ? handleCreateCustomer : handleUpdateCustomer}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
      
      {/* Customer Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Customer"
        size="sm"
      >
        <div className="p-1">
          <p className="mb-4">
            Are you sure you want to delete <span className="font-semibold">{selectedCustomer?.name}</span>?
            This action cannot be undone.
          </p>
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteCustomer}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CustomerPage;