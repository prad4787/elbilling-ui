import React, { useState } from 'react';
import { Plus, GripVertical, X } from 'lucide-react';
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
      className="flex items-center bg-white p-3 rounded-lg shadow-sm border border-gray-200 mb-2"
    >
      <button
        className="p-1 hover:text-gray-600 cursor-grab"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={20} />
      </button>
      <span className="flex-1 ml-2">{measurement.name}</span>
      <button
        onClick={() => onRemove(measurement.id)}
        className="p-1 text-gray-400 hover:text-red-500"
      >
        <X size={20} />
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
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Category Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Categories Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Categories</h2>
          
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Enter category name"
              value={newCategory}
              onChange={(e) => {
                setNewCategory(e.target.value);
                setErrors(prev => ({ ...prev, category: '' }));
              }}
              error={errors.category}
            />
            <Button
              onClick={handleAddCategory}
              icon={<Plus size={16} />}
            >
              Add
            </Button>
          </div>

          <div className="space-y-2">
            {categories.map(category => (
              <div
                key={category.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedCategory?.id === category.id
                    ? 'bg-indigo-50 border-2 border-indigo-500'
                    : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{category.name}</span>
                  <span className="text-sm text-gray-500">
                    {category.measurements.length} measurements
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Measurements Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {selectedCategory 
              ? `Measurements for ${selectedCategory.name}`
              : 'Select a category to manage measurements'}
          </h2>

          {selectedCategory && (
            <>
              <div className="flex gap-2 mb-6">
                <Input
                  placeholder="Enter measurement name"
                  value={newMeasurement}
                  onChange={(e) => {
                    setNewMeasurement(e.target.value);
                    setErrors(prev => ({ ...prev, measurement: '' }));
                  }}
                  error={errors.measurement}
                />
                <Button
                  onClick={handleAddMeasurement}
                  icon={<Plus size={16} />}
                >
                  Add
                </Button>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;