
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { getMenuImage } from '../utils/localMenuImage';

const Menu = () => {
  const [items, setItems] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    image: ''
  });

  const fetchMenu = async () => {
    try {
      const { data } = await api.get('/menu');
      setItems(data);
    } catch (error) {
      console.error('Error fetching menu', error);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();

    try {
      await api.post('/menu', formData);
      setShowAddForm(false);
      setFormData({
        name: '',
        price: '',
        category: '',
        image: ''
      });
      fetchMenu();
    } catch (error) {
      console.error('Error adding item', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await api.delete(`/menu/${id}`);
        fetchMenu();
      } catch (error) {
        console.error('Error deleting item', error);
      }
    }
  };

  return (
    <div className="p-2 md:p-6 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-blue-800 tracking-tight">
          Menu Management
        </h2>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-sky-500 text-white px-5 py-3 rounded-2xl hover:from-blue-700 hover:to-sky-600 transition-all duration-300 shadow-lg font-bold"
        >
          <Plus size={20} />
          <span>Add Item</span>
        </button>
      </div>

      {/* Add Item Form */}
      {showAddForm && (
        <div className="bg-white/70 backdrop-blur-md border border-white/40 shadow-xl p-8 rounded-3xl mb-10">

          <h3 className="text-xl font-bold mb-6 text-gray-800">
            Add New Menu Item
          </h3>

          <form
            onSubmit={handleAdd}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Name
              </label>

              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    name: e.target.value
                  })
                }
                className="w-full border border-gray-200 rounded-xl p-3 shadow-sm"
                placeholder="e.g. Paneer Tikka"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Price (₹)
              </label>

              <input
                type="number"
                step="0.01"
                required
                value={formData.price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: e.target.value
                  })
                }
                className="w-full border border-gray-200 rounded-xl p-3 shadow-sm"
                placeholder="299"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Category
              </label>

              <select
                required
                value={formData.category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value
                  })
                }
                className="w-full border border-gray-200 rounded-xl p-3 shadow-sm bg-white"
              >
                <option value="">Select Category</option>
                <option value="Soups">Soups</option>
                <option value="Starters">Starters</option>
                <option value="Main Course">Main Course</option>
                <option value="Rice & Noodles">Rice & Noodles</option>
                <option value="Breads">Breads</option>
                <option value="Desserts">Desserts</option>
                <option value="Beverages">Beverages</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Image URL
              </label>

              <input
                type="text"
                value={formData.image}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    image: e.target.value
                  })
                }
                className="w-full border border-gray-200 rounded-xl p-3 shadow-sm"
                placeholder="/images/food.png"
              />
            </div>

            <div className="md:col-span-2 flex justify-end space-x-3 mt-4">

              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-6 py-3 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 font-bold"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-sky-500 text-white rounded-xl shadow-md font-bold"
              >
                Save Item
              </button>

            </div>
          </form>
        </div>
      )}

      {/* Menu Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

        {items.map((item) => (

          <div
            key={item._id}
            className="bg-white/70 backdrop-blur-md border border-white/40 shadow-sm rounded-3xl overflow-hidden flex flex-col group hover:-translate-y-1 hover:shadow-2xl transition-all duration-300"
          >

            {/* LOCAL FOOD IMAGE */}
            <div className="h-48 bg-gray-100 overflow-hidden relative">

              <img
                src={getMenuImage(item)}
                alt={item.name}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                onError={(e) => {
                  const img = e.currentTarget;
                  img.onerror = null;
                  img.src = '/images/food.png';
                }}
              />

              {/* Price Badge */}
              <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-sm font-extrabold text-blue-700 shadow-sm">
                ₹{Number(item.price).toFixed(0)}
              </div>

            </div>

            {/* Item Details */}
            <div className="p-5 flex-1 flex flex-col">

              <h3 className="font-extrabold text-lg text-gray-800 mb-1 leading-tight">
                {item.name}
              </h3>

              <p className="text-xs font-semibold text-blue-500 mb-1 uppercase tracking-wider">
                {item.category}
              </p>

              {item.description && (
                <p className="text-xs text-gray-500 line-clamp-2 mb-4">
                  {item.description}
                </p>
              )}

              {/* Action Buttons */}
              <div className="mt-auto flex justify-end space-x-2 pt-3 border-t border-gray-100">

                <button
                  type="button"
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                  title="Edit item"
                >
                  <Edit2 size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(item._id)}
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  title="Delete item"
                >
                  <Trash2 size={16} />
                </button>

              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Menu;
