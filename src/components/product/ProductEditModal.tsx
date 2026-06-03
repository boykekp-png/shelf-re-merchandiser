'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import type { DesignItemWithProduct } from '@/types';

interface ProductEditModalProps {
  item: DesignItemWithProduct;
  onSave: (quantity: number) => void;
  onClose: () => void;
}

export default function ProductEditModal({ item, onSave, onClose }: ProductEditModalProps) {
  const [quantity, setQuantity] = useState(item.quantity);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Edit {item.product.name}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">Product</p>
            <p className="font-medium">{item.product.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Category</p>
            <p className="font-medium">{item.product.category.icon} {item.product.category.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Grid Width</p>
            <p className="font-medium">{item.occupiedWidth} grid cells</p>
          </div>
          <div>
            <label className="text-sm text-gray-500 mb-1 block">Quantity</label>
            <input
              type="number"
              min={1}
              max={99}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <button
            onClick={() => onSave(quantity)}
            className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}