import React, { useState } from 'react';
import { Plus, GripVertical, X, List, Ruler } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from 'react-toastify';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

interface Measurement {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  measurements: Measurement[];
}

interface SortableMeasurementProps {
  measurement: Measurement;
  onRemove: (id: string) => void;
}

const SortableMeasurement: React.FC<SortableMeasurementProps> = ({ measurement, onRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: measurement.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center bg-white p-4 rounded-lg shadow-soft border border-gray-200 mb-3 hover:shadow-medium transition-all duration-200"
    >
      <button
        className="p-2 hover:text-gray-600 cursor-grab active:cursor-grabbing text-gray-400 hover:bg-gray-50 rounded-lg transition-colors"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={18} />
      </button>
      <span className="flex-1 ml-3 font-medium text-gray-900">{measurement.name}</span>
      <button
        onClick={() => onRemove(measurement.id)}
        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
      >
        <X size={18} />
      </button>
    </div>
  );
};

const CategoryPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [newMeasurement, setNewMeasurement] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      setErrors(prev => ({ ...prev, category: 'Category name is required' }));
      return;
    }

    if (categories.some(c => c.name.toLowerCase() === newCategory.toLowerCase())) {
      setErrors(prev => ({ ...prev, category: 'Category already exists' }));
      return;
    }

    const category: Category = {
      id: Date.now().toString(),
      name: newCategory,
      measurements: []
    };

    setCategories(prev => [...prev, category]);
    setNewCategory('');
    setErrors({});
    setSelectedCategory(category);
    toast.success('Category added successfully');
  };

  const handleAddMeasurement = () => {
    if (!selectedCategory) return;
    if (!newMeasurement.trim()) {
      setErrors(prev => ({ ...prev, measurement: 'Measurement name is required' }));
      return;
    }

    if (selectedCategory.measurements.some(m => m.name.toLowerCase() === newMeasurement.toLowerCase())) {
      setErrors(prev => ({ ...prev, measurement: 'Measurement already exists' }));
      return;
    }

    const measurement: Measurement = {
      id: Date.now().toString(),
      name: newMeasurement
    };

    setCategories(prev => prev.map(category => 
      category.id === selectedCategory.id
        ? { ...category, measurements: [...category.measurements, measurement] }
        : category
    ));

    setSelectedCategory(prev => prev ? {
      ...prev,
      measurements: [...prev.measurements, measurement]
    } : null);

    setNewMeasurement('');
    setErrors({});
    toast.success('Measurement added successfully');
  };

  const handleRemoveMeasurement = (measurementId: string) => {
    if (!selectedCategory) return;

    setCategories(prev => prev.map(category => 
      category.id === selectedCategory.id
        ? {
            ...category,
            measurements: category.measurements.filter(m => m.id !== measurementId)
          }
        : category
    ));

    setSelectedCategory(prev => prev ? {
      ...prev,
      measurements: prev.measurements.filter(m => m.id !== measurementId)
    } : null);

    toast.success('Measurement removed successfully');
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!selectedCategory || !active.id || !over?.id || active.id === over.id) return;

    const oldIndex = selectedCategory.measurements.findIndex(m => m.id === active.id);
    const newIndex = selectedCategory.measurements.findIndex(m => m.id === over.id);

    setCategories(prev => prev.map(category => 
      category.id === selectedCategory.id
        ? {
            ...category,
            measurements: arrayMove(category.measurements, oldIndex, newIndex)
          }
        : category
    ));

    setSelectedCategory(prev => prev ? {
      ...prev,
      measurements: arrayMove(prev.measurements, oldIndex, newIndex)
    } : null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
        <div className="flex items-center mb-4">
          <div className="p-3 bg-gray-100 rounded-xl mr-4">
            <List className="h-6 w-6 text-gray-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Category Management</h1>
            <p className="text-gray-600">Manage product categories and their measurement fields</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Categories Section */}
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg mr-3">
                <List className="h-5 w-5 text-gray-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Categories</h2>
            </div>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {categories.length} categories
            </span>
          </div>
          
          {/* Add Category Form */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Enter category name"
                  value={newCategory}
                  onChange={(e) => {
                    setNewCategory(e.target.value);
                    setErrors(prev => ({ ...prev, category: '' }));
                  }}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                />
              </div>
              <Button
                onClick={handleAddCategory}
                icon={<Plus size={16} />}
                className="flex-shrink-0 w-20"
              >
                Add
              </Button>
            </div>
            {errors.category && (
              <p className="mt-2 text-sm text-red-600 font-medium">{errors.category}</p>
            )}
          </div>

          {/* Categories List */}
          <div className="space-y-3">
            {categories.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <List className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <p className="font-medium">No categories yet</p>
                <p className="text-sm">Add your first category to get started</p>
              </div>
            ) : (
              categories.map(category => (
                <div
                  key={category.id}
                  className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
                    selectedCategory?.id === category.id
                      ? 'bg-primary-50 border-primary-200 shadow-soft'
                      : 'bg-gray-50 hover:bg-gray-100 border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg mr-3 ${
                        selectedCategory?.id === category.id
                          ? 'bg-primary-100'
                          : 'bg-gray-100'
                      }`}>
                        <List className={`h-4 w-4 ${
                          selectedCategory?.id === category.id
                            ? 'text-primary-600'
                            : 'text-gray-600'
                        }`} />
                      </div>
                      <span className="font-semibold text-gray-900">{category.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-full border border-gray-200">
                        {category.measurements.length} fields
                      </span>
                      {selectedCategory?.id === category.id && (
                        <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Measurements Section */}
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg mr-3">
                <Ruler className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Measurement Fields</h2>
                {selectedCategory && (
                  <p className="text-sm text-gray-600">for {selectedCategory.name}</p>
                )}
              </div>
            </div>
            {selectedCategory && (
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {selectedCategory.measurements.length} fields
              </span>
            )}
          </div>

          {selectedCategory ? (
            <>
              {/* Add Measurement Form */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Enter measurement field name"
                      value={newMeasurement}
                      onChange={(e) => {
                        setNewMeasurement(e.target.value);
                        setErrors(prev => ({ ...prev, measurement: '' }));
                      }}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddMeasurement()}
                    />
                  </div>
                  <Button
                    onClick={handleAddMeasurement}
                    icon={<Plus size={16} />}
                    className="flex-shrink-0 w-20"
                  >
                    Add
                  </Button>
                </div>
                {errors.measurement && (
                  <p className="mt-2 text-sm text-red-600 font-medium">{errors.measurement}</p>
                )}
              </div>

              {/* Measurements List */}
              {selectedCategory.measurements.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Ruler className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                  <p className="font-medium">No measurement fields yet</p>
                  <p className="text-sm">Add measurement fields for this category</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-gray-600">
                      Drag to reorder measurement fields
                    </p>
                  </div>
                  
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={selectedCategory.measurements}
                      strategy={verticalListSortingStrategy}
                    >
                      {selectedCategory.measurements.map(measurement => (
                        <SortableMeasurement
                          key={measurement.id}
                          measurement={measurement}
                          onRemove={handleRemoveMeasurement}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Ruler className="h-8 w-8 text-gray-400" />
              </div>
              <p className="font-medium text-gray-700 mb-2">Select a category</p>
              <p className="text-sm">Choose a category from the left to manage its measurement fields</p>
            </div>
          )}
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">How to Use</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center text-sm font-bold mr-3">
                1
              </div>
              <h4 className="font-semibold text-gray-900">Create Categories</h4>
            </div>
            <p className="text-sm text-gray-600">
              Add product categories like "Shirt", "Pants", "Coat" etc.
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center text-sm font-bold mr-3">
                2
              </div>
              <h4 className="font-semibold text-gray-900">Add Measurements</h4>
            </div>
            <p className="text-sm text-gray-600">
              Define measurement fields like "chest", "length", "waist" for each category.
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center text-sm font-bold mr-3">
                3
              </div>
              <h4 className="font-semibold text-gray-900">Reorder Fields</h4>
            </div>
            <p className="text-sm text-gray-600">
              Drag and drop measurement fields to arrange them in your preferred order.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;