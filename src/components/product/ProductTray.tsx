'use client';

import { useState, useEffect } from 'react';
import { X, Search, ChevronRight, ChevronLeft, Package } from 'lucide-react';
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

interface ProductTrayProps {
  open: boolean;
  onToggle: () => void;
}

export default function ProductTray({ open, onToggle }: ProductTrayProps) {
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) loadData();
  }, [open]);

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
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const filtered = products.filter((p) => {
    if (selectedCategory !== 'all' && p.categoryId !== selectedCategory) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleDragStart = (e: React.DragEvent, product: ProductWithCategory) => {
    const data = JSON.stringify({
      type: 'new-product',
      productId: product.id,
      defaultWidth: product.defaultWidth,
    });
    e.dataTransfer.setData('application/json', data);
    e.dataTransfer.effectAllowed = 'copy';
    // Set a visual drag image
    const el = e.currentTarget as HTMLElement;
    e.dataTransfer.setDragImage(el, el.offsetWidth / 2, el.offsetHeight / 2);
  };

  return (
    <>
      {/* Toggle tab */}
      <button
        onClick={onToggle}
        className={`fixed right-0 top-1/2 -translate-y-1/2 z-40 flex items-center gap-1 px-2 py-4 rounded-l-lg shadow-lg transition-all duration-300 no-print ${
          open
            ? 'translate-x-full opacity-0 pointer-events-none'
            : 'translate-x-0 bg-blue-600 text-white hover:bg-blue-700'
        }`}
        title="Open product tray"
      >
        <ChevronLeft className="w-4 h-4" />
        <Package className="w-4 h-4" />
      </button>

      {/* Slide-out tray */}
      <div
        className={`fixed top-0 right-0 h-full z-50 transition-transform duration-300 ease-in-out no-print ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ width: '340px' }}
      >
        <div className="h-full bg-white shadow-2xl border-l border-gray-200 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              <h2 className="font-semibold text-gray-900">Products</h2>
              <span className="text-xs text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full">
                {filtered.length}
              </span>
            </div>
            <button
              onClick={onToggle}
              className="p-1.5 hover:bg-gray-200 rounded-lg transition"
              title="Close tray"
            >
              <ChevronRight className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Search */}
          <div className="px-4 py-3">
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
          </div>

          {/* Category filters */}
          <div className="px-4 pb-3 flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition ${
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
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition ${
                  selectedCategory === cat.id
                    ? 'text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                style={selectedCategory === cat.id ? { backgroundColor: cat.color } : {}}
              >
                {cat.icon}
              </button>
            ))}
          </div>

          {/* Product list */}
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {loading ? (
              <div className="text-center py-8 text-gray-400">Loading products...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-8 text-gray-400">No products found</div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {filtered.map((product) => {
                  const emoji = emojiMap[product.name] || '📦';
                  const cat = product.category;
                  return (
                    <div
                      key={product.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, product)}
                      className="flex flex-col items-center p-3 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:shadow-md transition-all cursor-grab active:cursor-grabbing active:scale-95 bg-white"
                    >
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-1.5"
                        style={{ backgroundColor: `${cat.color}20` }}
                      >
                        {product.imagePath ? (
                          <img
                            src={product.imagePath}
                            alt={product.name}
                            className="w-10 h-10 object-contain"
                          />
                        ) : (
                          emoji
                        )}
                      </div>
                      <p className="text-xs font-medium text-center leading-tight line-clamp-2">
                        {product.name}
                      </p>
                      <span
                        className="text-[10px] mt-1 px-1.5 py-0.5 rounded-full"
                        style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                      >
                        {product.defaultWidth}-grid
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Backdrop for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/20 z-40 md:hidden no-print"
          onClick={onToggle}
        />
      )}
    </>
  );
}