import React, { useState, useEffect } from 'react';
import { X, Save, Package } from 'lucide-react';

const StockForm = ({ isOpen, onClose, onSave, editItem = null }) => {
  const [formData, setFormData] = useState({
    type: '',
    length: '',
    diameter: '',
    material: '',
    quantity: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editItem) {
      setFormData({
        type: editItem.type || '',
        length: editItem.length || '',
        diameter: editItem.diameter || '',
        material: editItem.material || '',
        quantity: editItem.quantity || ''
      });
    } else {
      setFormData({
        type: '',
        length: '',
        diameter: '',
        material: '',
        quantity: ''
      });
    }
  }, [editItem, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving stock:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              {editItem ? 'Edit Stock Item' : 'Add New Stock'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Pipeline Type
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select type</option>
              <option value="PVC">PVC</option>
              <option value="Steel">Steel</option>
              <option value="Copper">Copper</option>
              <option value="HDPE">HDPE</option>
              <option value="Galvanized">Galvanized</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="length" className="block text-sm font-medium text-gray-700 mb-1">
                Length
              </label>
              <input
                type="text"
                id="length"
                name="length"
                value={formData.length}
                onChange={handleChange}
                required
                placeholder="e.g., 6m"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label htmlFor="diameter" className="block text-sm font-medium text-gray-700 mb-1">
                Diameter
              </label>
              <input
                type="text"
                id="diameter"
                name="diameter"
                value={formData.diameter}
                onChange={handleChange}
                required
                placeholder="e.g., 100mm"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="material" className="block text-sm font-medium text-gray-700 mb-1">
              Material
            </label>
            <select
              id="material"
              name="material"
              value={formData.material}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select material</option>
              <option value="PVC">PVC</option>
              <option value="Steel">Steel</option>
              <option value="Copper">Copper</option>
              <option value="HDPE">HDPE</option>
              <option value="Galvanized Steel">Galvanized Steel</option>
              <option value="Stainless Steel">Stainless Steel</option>
            </select>
          </div>

          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
              Quantity
            </label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              required
              min="0"
              placeholder="Enter quantity"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Save className="h-4 w-4" />
                  <span>{editItem ? 'Update' : 'Save'}</span>
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockForm;
