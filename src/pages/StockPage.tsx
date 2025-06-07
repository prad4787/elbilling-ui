import React, { useEffect, useState } from 'react';
import { 
  Plus, Search, Eye, Edit, Trash2, ArrowUp, ArrowDown, 
  FileText, ArrowUpDown, ChevronsDown, ChevronsUp
} from 'lucide-react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import StockForm from '../features/stock/components/StockForm';
import StockAdjustForm from '../features/stock/components/StockAdjustForm';
import { 
  getStocks, createStock, updateStock, deleteStock, adjustStock 
} from '../services/stockService';
import { Stock, StockAdjustment, FormMode } from '../types';

const StockPage: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [modalMode, setModalMode] = useState<FormMode>('create');
  
  const [sortField, setSortField] = useState<keyof Stock>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  useEffect(() => {
    fetchStocks();
  }, []);
  
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredStocks(stocks);
    } else {
      const lowercasedSearch = searchTerm.toLowerCase();
      setFilteredStocks(
        stocks.filter(
          stock => 
            stock.name.toLowerCase().includes(lowercasedSearch) ||
            stock.code.toLowerCase().includes(lowercasedSearch) ||
            stock.category.toLowerCase().includes(lowercasedSearch)
        )
      );
    }
  }, [searchTerm, stocks]);
  
  const fetchStocks = async () => {
    setLoading(true);
    try {
      const data = await getStocks();
      setStocks(data);
      setFilteredStocks(data);
    } catch (error) {
      console.error('Error fetching stocks:', error);
      toast.error('Failed to load stocks');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSort = (field: keyof Stock) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    
    const sortedStocks = [...filteredStocks].sort((a, b) => {
      if (field === 'quantity') {
        return sortDirection === 'asc' 
          ? a[field] - b[field] 
          : b[field] - a[field];
      } else {
        const aValue = String(a[field]).toLowerCase();
        const bValue = String(b[field]).toLowerCase();
        
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
    });
    
    setFilteredStocks(sortedStocks);
  };
  
  const openCreateModal = () => {
    setSelectedStock(null);
    setModalMode('create');
    setIsModalOpen(true);
  };
  
  const openEditModal = (stock: Stock) => {
    setSelectedStock(stock);
    setModalMode('edit');
    setIsModalOpen(true);
  };
  
  const openDeleteModal = (stock: Stock) => {
    setSelectedStock(stock);
    setIsDeleteModalOpen(true);
  };
  
  const openAdjustModal = (stock: Stock) => {
    setSelectedStock(stock);
    setIsAdjustModalOpen(true);
  };
  
  const handleCreateStock = async (data: Omit<Stock, 'id'>) => {
    try {
      await createStock(data);
      toast.success('Stock created successfully');
      setIsModalOpen(false);
      fetchStocks();
    } catch (error) {
      console.error('Error creating stock:', error);
      toast.error('Failed to create stock');
    }
  };
  
  const handleUpdateStock = async (data: Omit<Stock, 'id'>) => {
    if (!selectedStock) return;
    
    try {
      await updateStock(selectedStock.id, data);
      toast.success('Stock updated successfully');
      setIsModalOpen(false);
      fetchStocks();
    } catch (error) {
      console.error('Error updating stock:', error);
      toast.error('Failed to update stock');
    }
  };
  
  const handleDeleteStock = async () => {
    if (!selectedStock) return;
    
    try {
      await deleteStock(selectedStock.id);
      toast.success('Stock deleted successfully');
      setIsDeleteModalOpen(false);
      fetchStocks();
    } catch (error) {
      console.error('Error deleting stock:', error);
      toast.error('Failed to delete stock');
    }
  };
  
  const handleAdjustStock = async (adjustment: StockAdjustment) => {
    try {
      await adjustStock(adjustment);
      toast.success(`Stock ${adjustment.type === 'add' ? 'added' : 'deducted'} successfully`);
      setIsAdjustModalOpen(false);
      fetchStocks();
    } catch (error) {
      console.error('Error adjusting stock:', error);
      toast.error('Failed to adjust stock');
    }
  };
  
  const getSortIcon = (field: keyof Stock) => {
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
        <h1 className="text-2xl font-bold text-gray-900">Stock Management</h1>
        
        <Button 
          onClick={openCreateModal} 
          icon={<Plus size={16} />}
        >
          Add Stock
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
                placeholder="Search by name, code or category"
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
        ) : filteredStocks.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No stock items found</h3>
            <p className="mt-1 text-gray-500">
              {searchTerm ? 'Try adjusting your search term' : 'Get started by adding your first stock item'}
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <Button onClick={openCreateModal} icon={<Plus size={16} />}>
                  Add Stock
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
                    onClick={() => handleSort('date')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Date</span>
                      {getSortIcon('date')}
                    </div>
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
                    onClick={() => handleSort('code')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Code</span>
                      {getSortIcon('code')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('category')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Category</span>
                      {getSortIcon('category')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('quantity')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Quantity</span>
                      {getSortIcon('quantity')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    HS Code
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStocks.map((stock) => (
                  <tr key={stock.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stock.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {stock.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stock.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stock.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <span className={`font-medium ${stock.quantity < 10 ? 'text-amber-600' : 'text-gray-900'}`}>
                          {stock.quantity}
                        </span>
                        <div className="ml-2 flex space-x-1">
                          <button
                            onClick={() => openAdjustModal(stock)}
                            className="text-gray-500 hover:text-green-600 transition-colors"
                            title="Adjust stock"
                          >
                            <ArrowUp size={16} />
                          </button>
                          <button
                            onClick={() => openAdjustModal(stock)}
                            className="text-gray-500 hover:text-red-600 transition-colors"
                            title="Deduct stock"
                          >
                            <ArrowDown size={16} />
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stock.hsCode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link
                          to={`/stocks/${stock.id}`}
                          className="text-gray-500 hover:text-indigo-600 transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </Link>
                        <button
                          onClick={() => openEditModal(stock)}
                          className="text-gray-500 hover:text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => openDeleteModal(stock)}
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
      
      {/* Stock Form Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={
          modalMode === 'create' 
            ? 'Add New Stock' 
            : modalMode === 'edit' 
              ? 'Edit Stock' 
              : 'View Stock'
        }
      >
        <StockForm 
          stock={selectedStock || undefined}
          mode={modalMode}
          onSubmit={modalMode === 'create' ? handleCreateStock : handleUpdateStock}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
      
      {/* Stock Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Stock"
        size="sm"
      >
        <div className="p-1">
          <p className="mb-4">
            Are you sure you want to delete <span className="font-semibold">{selectedStock?.name}</span>?
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
              onClick={handleDeleteStock}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* Stock Adjust Modal */}
      <Modal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        title="Adjust Stock Quantity"
      >
        {selectedStock && (
          <StockAdjustForm
            stock={selectedStock}
            onSubmit={handleAdjustStock}
            onCancel={() => setIsAdjustModalOpen(false)}
          />
        )}
      </Modal>
    </div>
  );
};

export default StockPage;