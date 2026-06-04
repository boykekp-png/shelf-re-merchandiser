/**
 * EN: ProductCard — Displays a single product item on a shelf.
 *     Shows emoji or uploaded image, product name, category badge.
 *     Supports: click to select, double-click to edit, drag to move,
 *     hover-reveal remove button, disabled/unavailable indicator.
 *     All products occupy exactly 1 grid column (width = 1).
 *
 * ID: ProductCard — Menampilkan satu item produk di rak.
 *     Menampilkan emoji atau gambar upload, nama produk, lencana kategori.
 *     Mendukung: klik untuk pilih, double-klik untuk edit, seret untuk pindah,
 *     tombol hapus saat hover, indikator dinonaktifkan/tidak tersedia.
 *     Semua produk menempati tepat 1 kolom grid (lebar = 1).
 */

'use client';

import type { DesignItemWithProduct } from '@/types';
import { X, GripVertical } from 'lucide-react';

// EN: Emoji fallback mapping for products without uploaded images / ID: Pemetaan fallback emoji untuk produk tanpa gambar upload
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

interface ProductCardProps {
  item: DesignItemWithProduct;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onEdit: () => void;
  onDragStart: (e: React.DragEvent) => void;
}

export default function ProductCard({
  item, isSelected, onSelect, onRemove, onEdit, onDragStart,
}: ProductCardProps) {
  const product = item.product;
  const category = product.category;
  const emoji = emojiMap[product.name] || '📦';
  const isDisabled = !product.isActive;

  return (
    <div
      className={`product-card ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
      style={{ backgroundColor: `${category.color}15` }}
      draggable
      onDragStart={onDragStart}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onEdit();
      }}
    >
      {/* EN: Hover-reveal remove button / ID: Tombol hapus muncul saat hover */}
      <button
        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition shadow-sm opacity-0 group-hover:opacity-100 hover:opacity-100 z-10"
        style={{ opacity: 0 }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        title="Remove from shelf"
      >
        <X className="w-3 h-3" />
      </button>

      {/* EN: Unavailable badge / ID: Lencana tidak tersedia */}
      {isDisabled && (
        <div className="absolute -top-2 left-2 bg-yellow-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium z-10">
          ⚠️ Unavailable
        </div>
      )}

      {/* EN: Product image or emoji fallback / ID: Gambar produk atau fallback emoji */}
      <div className="w-full flex items-center justify-center mb-2">
        {product.imagePath ? (
          <img
            src={product.imagePath}
            alt={product.name}
            className="w-16 h-16 object-contain rounded-xl"
            style={{ filter: isDisabled ? 'grayscale(0.5)' : 'none' }}
          />
        ) : (
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
            style={{
              backgroundColor: `${category.color}25`,
              filter: isDisabled ? 'grayscale(0.5) opacity(0.7)' : 'none',
            }}
          >
            {emoji}
          </div>
        )}
      </div>

      {/* EN: Product name (2 lines max) / ID: Nama produk (maks 2 baris) */}
      <p className="text-xs font-semibold text-gray-800 text-center leading-tight mb-1 line-clamp-2">
        {product.name}
      </p>

      {/* EN: Category badge with color / ID: Lencana kategori dengan warna */}
      <span
        className="category-badge"
        style={{
          backgroundColor: `${category.color}20`,
          color: category.color,
        }}
      >
        {category.icon} {category.name}
      </span>

      {/* EN: Quantity indicator (only shown if > 1) / ID: Indikator jumlah (hanya muncul jika > 1) */}
      {item.quantity > 1 && (
        <span className="text-[10px] text-gray-400 mt-1">×{item.quantity}</span>
      )}
    </div>
  );
}