'use client';

import { useState, useEffect } from 'react';
import { X, Package } from 'lucide-react';
import type { ProductWithCategory } from '@/types';

interface ProductTrayProps {
  open: boolean;
  onToggle: () => void;
}

export default function ProductTray({ open, onToggle }: ProductTrayProps) {
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      fetch('/api/products?active=true')
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setProducts(data.data);
        })
        .finally(() => setLoading(false));
    }
  }, [open]);

  const emojiMap: Record<string, string> = {
    'Banana': '🍌', 'Apple': '🍎', 'Cherry': '🍒', 'Kiwi': '🥝',
    'Grape': '🍇', 'Fig': '🫒', 'Honeydew': '🍈', 'Dates': '🫐',
    'Lemon': '🍋', 'Mango': '', 'Chicken Breast': '🍗',
    'Ground Beef': '🥩', 'Pork Chop': '🍖', 'Salmon Fillet': '🐟',
    'Turkey Breast': '🦃', 'Smoked Turkey Sliced': '🥪', 'Bacon': '🥓',
    'Salami': '🍖', 'Provolone Cheese': '', 'Ham': '🍖',
    'Milk Gallon': '🥛', 'Half Gallon Milk': '🥛', 'Sour Cream': '🫗',
    'Yogurt': '🍦', 'Butter': '🧈', 'Heavy Cream': '',
    'Sourdough Bread': '🍞', 'Croissant': '🥐', 'Bagel': '🥯',
    'Blueberry Muffin': '🧁', 'Baguette': '🥖', 'Canned Beans': '🥫',
    'Pasta': '🍝', 'Rice': '🍚', 'Olive Oil': '🫒', 'Cereal': '🥣',
    'Peanut Butter': '🥜',
  };

  if (!open) return null;

  return (
    <div className="fixed right-0 top-16 bottom-0 w-80 bg-white border-l border-gray-200 shadow-lg z-40 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Package className="w-5 h-5" /> Product Tray
        </h2>
        <button onClick={onToggle} className="p-1 hover:bg-gray-100 rounded-lg">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {products.map((product) => {
              const emoji = emojiMap[product.name] || '📦';
              return (
                <div
                  key={product.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData(
                      'application/json',
                      JSON.stringify({
                        type: 'new-product',
                        productId: product.id,
                      })
                    );
                    e.dataTransfer.effectAllowed = 'copy';
                  }}
                  className="flex flex-col items-center p-3 border rounded-xl hover:border-blue-400 hover:bg-blue-50 transition cursor-grab active:cursor-grabbing"
                >
                  <span className="text-3xl mb-2">{emoji}</span>
                  <span className="text-xs font-medium text-center">{product.name}</span>
                  <span className="text-[10px] text-gray-500 mt-1">
                    {product.category.icon} {product.category.name}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}