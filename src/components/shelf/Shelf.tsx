/**
 * EN: Shelf — A single 12-column grid shelf row.
 *     Renders sorted items in their grid positions, with empty slot placeholders.
 *     Handles:
 *       - Drag/drop from ProductTray (new products via JSON dataTransfer)
 *       - Drag/drop between shelves (existing items via text/plain)
 *       - Column-level drop calculation using getBoundingClientRect
 *       - Click to select, double-click to edit, inline rename
 *       - Delete with confirmation
 *
 * ID: Shelf — Satu baris rak grid 12 kolom.
 *     Merender item yang diurutkan di posisi gridnya, dengan placeholder slot kosong.
 *     Menangani:
 *       - Drag/drop dari ProductTray (produk baru via JSON dataTransfer)
 *       - Drag/drop antar rak (item existing via text/plain)
 *       - Kalkulasi drop level kolom menggunakan getBoundingClientRect
 *       - Klik untuk pilih, double-klik untuk edit, rename inline
 *       - Hapus dengan konfirmasi
 */

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
  // EN: toPosition added for column-level precision / ID: toPosition ditambahkan untuk presisi level kolom
  onDropOnShelf: (itemId: string, shelfId: string, toPosition: number) => void;
  // EN: toPosition added for column-level precision / ID: toPosition ditambahkan untuk presisi level kolom
  onDropNewProduct: (productId: string, defaultWidth: number, shelfId: string, toPosition: number) => void;
}

export default function Shelf({
  shelf, selectedItemId, onSelectItem, onMoveItem, onRemoveItem,
  onEditItem, onDeleteShelf, onRenameShelf, onDropOnShelf, onDropNewProduct,
}: ShelfProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(shelf.name);
  // EN: Ref for precise column calculation / ID: Ref untuk kalkulasi kolom presisi
  const gridRef = useRef<HTMLDivElement>(null);

  // EN: Sort items left-to-right by grid position / ID: Urutkan item kiri-ke-kanan berdasarkan posisi grid
  const sortedItems = [...shelf.items].sort((a, b) => a.gridPosition - b.gridPosition);

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

    if (!gridRef.current) return;

    // EN: Calculate target column from mouse X position relative to grid width
    // ID: Hitung kolom target dari posisi X mouse relatif terhadap lebar grid
    const gridRect = gridRef.current.getBoundingClientRect();
    const dropX = e.clientX - gridRect.left;
    const targetColumn = Math.max(0, Math.min(Math.floor((dropX / gridRect.width) * 12), 11));

    // EN: Try JSON format (new products from ProductTray) / ID: Coba format JSON (produk baru dari ProductTray)
    const jsonData = e.dataTransfer.getData('application/json');
    if (jsonData) {
      try {
        const parsed = JSON.parse(jsonData);
        if (parsed.type === 'new-product' && parsed.productId) {
          onDropNewProduct(parsed.productId, parsed.defaultWidth || 3, shelf.id, targetColumn);
          return;
        }
      } catch { /* EN: Not valid JSON / ID: Bukan JSON yang valid */ }
    }

    // EN: Fallback: plain text (existing item being moved) / ID: Fallback: teks biasa (item existing yang dipindahkan)
    const itemId = e.dataTransfer.getData('text/plain');
    if (itemId) {
      onDropOnShelf(itemId, shelf.id, targetColumn);
    }
  };

  const handleRename = () => {
    if (nameInput.trim() && nameInput !== shelf.name) {
      onRenameShelf(shelf.id, nameInput.trim());
    } else {
      setNameInput(shelf.name); // EN: Reset if empty or unchanged / ID: Reset jika kosong atau tidak berubah
    }
    setEditingName(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* EN: Shelf Header / ID: Kepala Rak */}
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
          {/* EN: Slot usage indicator / ID: Indikator penggunaan slot */}
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {shelf.items.length} items · {12 - shelf.items.length} slots free
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

      {/* EN: Shelf Grid / ID: Grid Rak */}
      <div
        ref={gridRef}
        className={`shelf-grid ${isDragOver ? 'drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* EN: Build a proper 12-column grid with items at their positions + empty slots / ID: Bangun grid 12-kolom dengan item di posisinya + slot kosong */}
        {(() => {
          const cells: React.ReactNode[] = [];
          let cursor = 0; // EN: Track current column position / ID: Lacak posisi kolom saat ini

          for (const item of sortedItems) {
            // EN: Render empty slots before this item / ID: Render slot kosong sebelum item ini
            for (let i = cursor; i < item.gridPosition; i++) {
              cells.push(
                <div
                  key={`empty-${i}`}
                  className="grid-col-1 min-h-[4rem] border border-dashed border-gray-100 rounded-lg flex items-center justify-center"
                  style={{ gridColumn: `${i + 1}` }}
                >
                  <span className="text-xs text-gray-300">slot {i + 1}</span>
                </div>
              );
            }
            // EN: Render the item (always width 1) at its column / ID: Render item (selalu lebar 1) di kolomnya
            cells.push(
              <div
                key={item.id}
                className="grid-col-1 h-full"
                style={{ gridColumn: `${item.gridPosition + 1}` }}
              >
                <ProductCard
                  item={item}
                  isSelected={selectedItemId === item.id}
                  onSelect={() => onSelectItem(selectedItemId === item.id ? null : item.id)}
                  onRemove={() => onRemoveItem(item.id)}
                  onEdit={() => onEditItem(item)}
                  onDragStart={(e) => {
                    // EN: Set item ID for drag/drop within/between shelves / ID: Set item ID untuk drag/drop di dalam/antar rak
                    e.dataTransfer.setData('text/plain', item.id);
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                />
              </div>
            );
            cursor = item.gridPosition + 1; // EN: Column after this item / ID: Kolom setelah item ini
          }

          // EN: Render remaining empty slots after the last item / ID: Render slot kosong sisa setelah item terakhir
          for (let i = cursor; i < 12; i++) {
            cells.push(
              <div
                key={`empty-${i}`}
                className="grid-col-1 min-h-[4rem] border border-dashed border-gray-100 rounded-lg flex items-center justify-center"
                style={{ gridColumn: `${i + 1}` }}
              >
                <span className="text-xs text-gray-300">slot {i + 1}</span>
              </div>
            );
          }

          return cells;
        })()}
      </div>
    </div>
  );
}