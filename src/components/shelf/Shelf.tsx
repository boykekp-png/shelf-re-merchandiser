'use client';

import { useState, useRef } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import type { DesignShelfWithItems, DesignItemWithProduct } from '@/types';
import ProductCard from '@/components/product/ProductCard';

interface ShelfProps {
  shelf: DesignShelfWithItems;
  selectedItemId: string | null;
  onSelectItem: (itemId: string | null) => void;
  onMoveItem: (itemId: string, toShelfId: string, toPosition: number) => void;
  onRemoveItem: (itemId: string) => void;
  onEditItem: (item: DesignItemWithProduct) => void;
  onDeleteShelf: (shelfId: string) => void;
  onRenameShelf: (shelfId: string, newName: string) => void;
  // Added toPosition parameter
  onDropOnShelf: (itemId: string, shelfId: string, toPosition: number) => void;
  // Added toPosition parameter
  onDropNewProduct: (productId: string, defaultWidth: number, shelfId: string, toPosition: number) => void;
}

export default function Shelf({
  shelf, selectedItemId, onSelectItem, onMoveItem, onRemoveItem,
  onEditItem, onDeleteShelf, onRenameShelf, onDropOnShelf, onDropNewProduct,
}: ShelfProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(shelf.name);
  const gridRef = useRef<HTMLDivElement>(null); // Ref for the grid container

  // Calculate occupied grid positions for empty slot display
  const occupiedPositions = new Array(12).fill(false);
  const itemPositions: Record<number, DesignItemWithProduct> = {};
  for (const item of shelf.items) {
    for (let i = item.gridPosition; i < item.gridPosition + item.occupiedWidth; i++) {
      if (i < 12) occupiedPositions[i] = true;
    }
    itemPositions[item.gridPosition] = item;
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (!gridRef.current) return; // Ensure ref is available

    const gridRect = gridRef.current.getBoundingClientRect();
    const mouseX = e.clientX;
    const dropX = mouseX - gridRect.left; // Mouse position relative to the grid

    // Calculate the target column (0-indexed)
    const numColumns = 12;
    const columnWidth = gridRect.width / numColumns;
    // Ensure targetColumn is an integer and within bounds
    const targetColumn = Math.max(0, Math.min(Math.floor(dropX / columnWidth), numColumns - 1));

    // Try JSON format (new products from tray)
    const jsonData = e.dataTransfer.getData('application/json');
    if (jsonData) {
      try {
        const parsed = JSON.parse(jsonData);
        if (parsed.type === 'new-product' && parsed.productId) {
          // Pass the calculated targetColumn
          onDropNewProduct(parsed.productId, parsed.defaultWidth || 3, shelf.id, targetColumn);
          return;
        }
      } catch { /* not JSON */ }
    }

    // Fallback: plain text (existing item move)
    const itemId = e.dataTransfer.getData('text/plain');
    if (itemId) {
      // Pass the calculated targetColumn
      onDropOnShelf(itemId, shelf.id, targetColumn);
    }
  };

  const handleRename = () => {
    if (nameInput.trim() && nameInput !== shelf.name) {
      onRenameShelf(shelf.id, nameInput.trim());
    } else {
      setNameInput(shelf.name);
    }
    setEditingName(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Shelf Header */}
      <div className="shelf-header bg-gray-50/50 px-4 py-3 border-b border-gray-100 no-print">
        <div className="flex items-center gap-3">
          {editingName ? (
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => e.key === 'Enter' && handleRename()}
              className="text-lg font-semibold bg-white border border-blue-300 rounded-lg px-2 py-1 w-48 outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          ) : (
            <h3
              className="shelf-title cursor-pointer hover:text-blue-600 transition"
              onDoubleClick={() => setEditingName(true)}
            >
              {shelf.name}
            </h3>
          )}
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {shelf.items.length} items · {12 - shelf.items.reduce((sum, i) => sum + i.occupiedWidth, 0)} slots free
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setEditingName(true)}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
            title="Rename shelf"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (confirm(`Delete "${shelf.name}" and all its items?`)) {
                onDeleteShelf(shelf.id);
              }
            }}
            className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
            title="Delete shelf"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Shelf Grid */}
      <div
        ref={gridRef}
        className={`shelf-grid ${isDragOver ? 'drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Render item placeholders and empty slots */}
        {Array.from({ length: 12 }, (_, col) => {
          const item = itemPositions[col];
          if (item) {
            return (
              <div
                key={item.id}
                className={`grid-col-${item.occupiedWidth} h-full`}
                style={{ gridColumn: `${col + 1} / span ${item.occupiedWidth}` }}
              >
                <ProductCard
                  item={item}
                  isSelected={selectedItemId === item.id}
                  onSelect={() => onSelectItem(selectedItemId === item.id ? null : item.id)}
                  onRemove={() => onRemoveItem(item.id)}
                  onEdit={() => onEditItem(item)}
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', item.id);
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                />
              </div>
            );
          } else if (!occupiedPositions[col]) {
            return (
              <div
                key={`empty-${col}`}
                className="grid-col-1 min-h-[4rem] border border-dashed border-gray-100 rounded-lg flex items-center justify-center"
              >
                <span className="text-xs text-gray-300">slot {col + 1}</span>
              </div>
            );
          } else {
            return null;
          }
        })}
      </div>
    </div>
  );
}