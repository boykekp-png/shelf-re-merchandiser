'use client';

import { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import type { ProductWithCategory } from '@/types';

const emojiMap: Record<string, string> = {
  'Banana': '🍌', 'Apple': '🍎', 'Cherry': '🍒', 'Kiwi': '🥝',
  'Grape': '🍇', 'Fig': '🫒', 'Honeydew': '🍈', 'Dates': '🫐',
  'Lemon': '🍋', 'Mango': '🥭', 'Chicken Breast': '🍗',
  'Ground Beef': '🥩', 'Pork Chop': '🍖', 'Salmon Fillet': '🐟',
  'Turkey Breast': '🦃', 'Smoked Turkey Sliced': '🥪', 'Bacon': '🥓',
  'Salami': '🍖', 'Provolone Cheese': '🧀', 'Ham': '🍖',
  'Milk Gallon': '🥛', 'Half Gallon Milk': '🥛', 'Sour Cream': '🫗',
  'Yogurt': '🍦', 'Butter': '🧈', 'Heavy Cream': '🥛',
  'Sourdough Bread': '🍞', 'Croissant': '🥐', 'Bagel': '🥯',
  'Blueberry Muffin': '🧁', 'Baguette': '🥖', 'Canned Beans': '🥫',
  'Pasta': '🍝', 'Rice': '🍚', 'Olive Oil': '🫒', 'Cereal': '🥣',
  'Peanut Butter': '🥜',
};

interface ProductPickerModalProps {
  onSelect: (product: ProductWithCategory) => void;
  onClose: () => void;
}

export default function ProductPickerModal({ onSelect, onClose }: ProductPickerModalProps) {
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch('/api/products?active=true'),
        fetch('/api/categories'),
      ]);
      const prods = await prodRes.json();
      const cats = await catRes.json();
      if (prods.success) setProducts(prods.data);
      if (cats.success) setCategories(cats.data);
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = products.filter((p) => {
    if (selectedCategory !== 'all' && p.categoryId !== selectedCategory) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Add Product</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter */}
        <div className="p-4 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {categories.map((cat: any) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                  selectedCategory === cat.id
                    ? 'text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                style={selectedCategory === cat.id ? { backgroundColor: cat.color } : {}}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product list */}
        <div className="max-h-[50vh] overflow-y-auto p-4 pt-0">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No products found</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filtered.map((product) => {
                const emoji = emojiMap[product.name] || '📦';
                const cat = product.category;
                return (
                  <button
                    key={product.id}
                    onClick={() => onSelect(product)}
                    className="flex flex-col items-center p-3 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:shadow-md transition-all text-left"
                  >
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-2"
                      style={{ backgroundColor: `${cat.color}20` }}
                    >
                      {product.imagePath ? (
                        <img src={product.imagePath} alt={product.name} className="w-12 h-12 object-contain" />
                      ) : (
                        emoji
                      )}
                    </div>
                    <p className="text-xs font-medium text-center leading-tight">{product.name}</p>
                    <span
                      className="text-[10px] mt-1 px-1.5 py-0.5 rounded-full"
                      style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                    >
                      {cat.icon} {cat.name} · {product.defaultWidth}-grid
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}