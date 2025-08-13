import React, { useState } from 'react';
import { Edit, Trash2, Package, AlertTriangle } from 'lucide-react';

const InventoryTable = ({ inventory, onEdit, onDelete, onUpdateQuantity }) => {
  const [editingQuantity, setEditingQuantity] = useState(null);
  const [newQuantity, setNewQuantity] = useState('');

  // Helper function to safely format dates from both Firestore Timestamps and regular Date objects
  const formatDate = (date) => {
    if (!date) return "N/A";
    
    // If it's a Firestore Timestamp, convert it to Date
    if (date && typeof date.toDate === 'function') {
      return new Date(date.toDate()).toLocaleDateString();
    }
    
    // If it's already a Date object, format it directly
    if (date instanceof Date) {
      return date.toLocaleDateString();
    }
    
    // If it's a string or other format, try to create a Date
    try {
      return new Date(date).toLocaleDateString();
    } catch (error) {
      return "N/A";
    }
  };

  const handleQuantityEdit = (item) => {
    setEditingQuantity(item.id);
    setNewQuantity(item.quantity.toString());
  };

  const handleQuantitySave = async (item) => {
    try {
      await onUpdateQuantity(item.id, parseInt(newQuantity));
      setEditingQuantity(null);
      setNewQuantity('');
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const handleQuantityCancel = () => {
    setEditingQuantity(null);
    setNewQuantity('');
  };

  const getLowStockItems = () => {
    return inventory.filter(item => item.quantity <= 5);
  };

  const lowStockItems = getLowStockItems();

  return (
    <div className="bg-white shadow rounded-lg">
      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Low Stock Alert:</strong> {lowStockItems.length} item(s) have 5 or fewer units remaining.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Item Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dimensions
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Material
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Updated
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {inventory.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <Package className="h-5 w-5 text-primary-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        ID: {item.id.slice(-8)}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {item.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.length} × {item.diameter}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.material}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingQuantity === item.id ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={newQuantity}
                        onChange={(e) => setNewQuantity(e.target.value)}
                        className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        min="0"
                      />
                      <button
                        onClick={() => handleQuantitySave(item)}
                        className="text-green-600 hover:text-green-900 text-sm"
                      >
                        ✓
                      </button>
                      <button
                        onClick={handleQuantityCancel}
                        className="text-red-600 hover:text-red-900 text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-medium ${
                        item.quantity <= 5 ? 'text-red-600' : 'text-gray-900'
                      }`}>
                        {item.quantity}
                      </span>
                      {item.quantity <= 5 && (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                      <button
                        onClick={() => handleQuantityEdit(item)}
                        className="text-primary-600 hover:text-primary-900 text-sm"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(item.lastUpdated)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onEdit(item)}
                      className="text-primary-600 hover:text-primary-900 flex items-center space-x-1"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => onDelete(item.id)}
                      className="text-red-600 hover:text-red-900 flex items-center space-x-1"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {inventory.length === 0 && (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No inventory items</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding your first pipeline stock item.
          </p>
        </div>
      )}
    </div>
  );
};

export default InventoryTable;
