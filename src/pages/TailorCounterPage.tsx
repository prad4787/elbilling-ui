import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, FileText, ArrowUpDown, ChevronsDown, ChevronsUp } from 'lucide-react';
import { toast } from 'react-toastify';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { TailorCounter, FormMode } from '../types';
import { 
  getTailorCounters,
  createTailorCounter,
  updateTailorCounter,
  deleteTailorCounter
} from '../services/tailorCounterService';

const TailorCounterPage: React.FC = () => {
  const [counters, setCounters] = useState<TailorCounter[]>([]);
  const [filteredCounters, setFilteredCounters] = useState<TailorCounter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCounter, setSelectedCounter] = useState<TailorCounter | null>(null);
  const [modalMode, setModalMode] = useState<FormMode>('create');
  
  const [sortField, setSortField] = useState<keyof TailorCounter>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  useEffect(() => {
    fetchCounters();
  }, []);
  
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCounters(counters);
    } else {
      const lowercasedSearch = searchTerm.toLowerCase();
      setFilteredCounters(
        counters.filter(
          counter => 
            counter.name.toLowerCase().includes(lowercasedSearch) ||
            counter.phone.toLowerCase().includes(lowercasedSearch) ||
            counter.address.toLowerCase().includes(lowercasedSearch)
        )
      );
    }
  }, [searchTerm, counters]);
  
  const fetchCounters = async () => {
    setLoading(true);
    try {
      const data = await getTailorCounters();
      setCounters(data);
      setFilteredCounters(data);
    } catch (error) {
      console.error('Error fetching tailor counters:', error);
      toast.error('Failed to load tailor counters');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSort = (field: keyof TailorCounter) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    
    const sortedCounters = [...filteredCounters].sort((a, b) => {
      const aValue = String(a[field]).toLowerCase();
      const bValue = String(b[field]).toLowerCase();
      
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });
    
    setFilteredCounters(sortedCounters);
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const counterData = {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string
    };
    
    try {
      if (modalMode === 'create') {
        await createTailorCounter(counterData);
        toast.success('Tailor counter created successfully');
      } else if (modalMode === 'edit' && selectedCounter) {
        await updateTailorCounter(selectedCounter.id, counterData);
        toast.success('Tailor counter updated successfully');
      }
      
      setIsModalOpen(false);
      fetchCounters();
    } catch (error) {
      console.error('Error saving tailor counter:', error);
      toast.error('Failed to save tailor counter');
    }
  };
  
  const handleDelete = async () => {
    if (!selectedCounter) return;
    
    try {
      await deleteTailorCounter(selectedCounter.id);
      toast.success('Tailor counter deleted successfully');
      setIsDeleteModalOpen(false);
      fetchCounters();
    } catch (error) {
      console.error('Error deleting tailor counter:', error);
      toast.error('Failed to delete tailor counter');
    }
  };
  
  const getSortIcon = (field: keyof TailorCounter) => {
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
        <h1 className="text-2xl font-bold text-gray-900">Tailor Counters</h1>
        
        <Button 
          onClick={() => {
            setSelectedCounter(null);
            setModalMode('create');
            setIsModalOpen(true);
          }}
          icon={<Plus size={16} />}
        >
          Add Counter
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
        ) : filteredCounters.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No tailor counters found</h3>
            <p className="mt-1 text-gray-500">
              {searchTerm ? 'Try adjusting your search term' : 'Get started by adding your first tailor counter'}
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <Button
                  onClick={() => {
                    setSelectedCounter(null);
                    setModalMode('create');
                    setIsModalOpen(true);
                  }}
                  icon={<Plus size={16} />}
                >
                  Add Counter
                </Button>
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
                      <span>Contact Number</span>
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
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCounters.map((counter) => (
                  <tr key={counter.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {counter.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {counter.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {counter.address}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => {
                            setSelectedCounter(counter);
                            setModalMode('edit');
                            setIsModalOpen(true);
                          }}
                          className="text-gray-500 hover:text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCounter(counter);
                            setIsDeleteModalOpen(true);
                          }}
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
      
      {/* Counter Form Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'create' ? 'Add New Counter' : 'Edit Counter'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            name="name"
            label="Employee Name"
            defaultValue={selectedCounter?.name}
            required
          />
          
          <Input
            name="phone"
            label="Contact Number"
            defaultValue={selectedCounter?.phone}
            required
          />
          
          <Input
            name="address"
            label="Address"
            defaultValue={selectedCounter?.address}
            required
          />
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {modalMode === 'create' ? 'Create Counter' : 'Update Counter'}
            </Button>
          </div>
        </form>
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Counter"
        size="sm"
      >
        <div className="p-1">
          <p className="mb-4">
            Are you sure you want to delete <span className="font-semibold">{selectedCounter?.name}</span>?
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
              onClick={handleDelete}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TailorCounterPage;