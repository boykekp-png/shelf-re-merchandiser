'use client';

import type { DesignWithShelves, DesignItemWithProduct } from '@/types';
import Shelf from './Shelf';

interface ShelfContainerProps {
  design: DesignWithShelves;
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

export default function ShelfContainer({
  design, selectedItemId, onSelectItem, onMoveItem, onRemoveItem,
  onEditItem, onDeleteShelf, onRenameShelf, onDropOnShelf, onDropNewProduct,
}: ShelfContainerProps) {
  return (
    <div className="flex flex-col gap-6">
      {design.shelves.map((shelf) => (
        <Shelf
          key={shelf.id}
          shelf={shelf}
          selectedItemId={selectedItemId}
          onSelectItem={onSelectItem}
          onMoveItem={onMoveItem}
          onRemoveItem={onRemoveItem}
          onEditItem={onEditItem}
          onDeleteShelf={onDeleteShelf}
          onRenameShelf={onRenameShelf}
          onDropOnShelf={onDropOnShelf}
          onDropNewProduct={onDropNewProduct}
        />
      ))}
    </div>
  );
}