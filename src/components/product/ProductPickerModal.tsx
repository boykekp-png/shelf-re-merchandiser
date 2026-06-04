/**
 * EN: ProductPickerModal — Searchable product picker dialog.
 *     Fetches active products, supports name search filtering,
 *     and calls onSelect when a product is clicked.
 *     Shows emoji, name, and category for each product.
 *
 * ID: ProductPickerModal — Dialog pemilih produk yang dapat dicari.
 *     Mengambil produk aktif, mendukung pencarian berdasarkan nama,
 *     dan memanggil onSelect saat produk diklik.
 *     Menampilkan emoji, nama, dan kategori untuk setiap produk.
 */

'use client';

import { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import type { ProductWithCategory } from '@/types';

interface ProductPickerModalProps {
  onSelect: (product: ProductWithCategory) => void;
  onClose: () => void;
}

export default function ProductPickerModal({ onSelect, onClose }: ProductPickerModalProps) {
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // EN: Fetch active products on mount / ID: Ambil produk aktif saat mount
  useEffect(() => {
    fetch('/api/products?active=true')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setProducts(data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  // EN: Filter by search term / ID: Saring berdasarkan kata pencarian
  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  // EN: Emoji fallback map / ID: Peta fallback emoji
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
        {/* EN: Modal header / ID: Kepala modal */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Add Product</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          {/* EN: Search input / ID: Input pencarian */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
            />
          </div>

          {/* EN: Product grid (3 columns) / ID: Grid produk (3 kolom) */}
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading products...</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[50vh] overflow-y-auto">
              {filtered.map((product) => {
                const emoji = emojiMap[product.name] || '📦';
                return (
                  <button
                    key={product.id}
                    onClick={() => onSelect(product)}
                    className="flex flex-col items-center p-3 border rounded-xl hover:border-blue-400 hover:bg-blue-50 transition"
                  >
                    <span className="text-3xl mb-2">{emoji}</span>
                    <span className="text-sm font-medium text-center">{product.name}</span>
                    <span className="text-xs text-gray-500 mt-1">
                      {product.category.icon} {product.category.name}
                    </span>
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <div className="col-span-full text-center py-8 text-gray-500">
                  No products found
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}