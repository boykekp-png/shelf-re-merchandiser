'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import type { DesignWithShelves, DesignItemWithProduct, ClipboardItem } from '@/types';
import Header from '@/components/layout/Header';
import Toolbar from '@/components/layout/Toolbar';
import ShelfContainer from '@/components/shelf/ShelfContainer';
import ProductPickerModal from '@/components/product/ProductPickerModal';
import ProductTray from '@/components/product/ProductTray';
import ProductEditModal from '@/components/product/ProductEditModal';
import SaveDesignModal from '@/components/design/SaveDesignModal';
import LoadDesignModal from '@/components/design/LoadDesignModal';
import PrintModal from '@/components/design/PrintModal';
import toast from 'react-hot-toast';

export default function HomePageClient() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [design, setDesign] = useState<DesignWithShelves | null>(null);
  const [loading, setLoading] = useState(true);
  const [clipboard, setClipboard] = useState<ClipboardItem | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [showProductTray, setShowProductTray] = useState(false);
  const [editingItem, setEditingItem] = useState<DesignItemWithProduct | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);

  const fetchDesign = useCallback(async (userId?: string) => {
    try {
      const params = userId ? `?userId=${userId}` : '';
      const res = await fetch(`/api/designs/active${params}`);
      if (!res.ok) throw new Error('Failed to fetch design');
      const data = await res.json();
      if (data.success && data.data) setDesign(data.data);
    } catch {
      // Design not yet created - OK
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        if (data.success) setUsers(data.data);
      }
    } catch { /* not admin */ }
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return; }
    if (status === 'authenticated') {
      fetchDesign();
      if ((session?.user as any)?.role === 'admin') fetchUsers();
    }
  }, [status, session, router, fetchDesign, fetchUsers]);

  const saveDesign = useCallback(async (designId: string) => {
    if (!design) return;
    try {
      const res = await fetch(`/api/designs/${designId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shelves: design.shelves.map((shelf: any) => ({
            id: shelf.id, name: shelf.name, position: shelf.position,
            items: shelf.items.map((item: any) => ({
              id: item.id, productId: item.productId, gridPosition: item.gridPosition,
              occupiedWidth: item.occupiedWidth, quantity: item.quantity,
            })),
          })),
        }),
      });
      if (!res.ok) throw new Error('Save failed');
      return true;
    } catch { toast.error('Failed to save'); return false; }
  }, [design]);

  // Modified to accept gridPosition and ensure product width is respected
  const addProductToShelf = useCallback(async (shelfId: string, productId: string, productWidth: number, gridPosition: number) => {
    if (!design) return;
    const shelf = design.shelves.find((s: any) => s.id === shelfId);
    if (!shelf) return;
    const occupied = new Array(12).fill(false);
    for (const item of shelf.items) {
      for (let i = item.gridPosition; i < item.gridPosition + item.occupiedWidth; i++) {
        if (i < 12) occupied[i] = true;
      }
    }

    let finalGridPosition = -1;

    // Check if the requested gridPosition is valid and has enough space
    const isRequestedPositionValid = gridPosition >= 0 && gridPosition + productWidth <= 12;

    if (isRequestedPositionValid) {
      let slotsAreFree = true;
      for (let i = gridPosition; i < gridPosition + productWidth; i++) {
        if (occupied[i]) {
          slotsAreFree = false;
          break;
        }
      }
      if (slotsAreFree) {
        finalGridPosition = gridPosition;
      }
    }

    // If the requested position is not valid or not free, find the first available slot starting from the requested position
    if (finalGridPosition === -1) {
      for (let i = gridPosition; i <= 12 - productWidth; i++) { // Start search from gridPosition
        let canFit = true;
        for (let j = i; j < i + productWidth; j++) {
          if (occupied[j]) {
            canFit = false;
            break;
          }
        }
        if (canFit) {
          finalGridPosition = i;
          break;
        }
      }
    }

    if (finalGridPosition === -1) {
      toast.error('No space available on this shelf.');
      return;
    }

    try {
      const res = await fetch('/api/designs/items', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shelfId, productId, gridPosition: finalGridPosition, occupiedWidth: productWidth, quantity: 1 }),
      });
      if (!res.ok) throw new Error('Add failed');
      await fetchDesign(viewingUserId || undefined);
      toast.success('Product added');
    } catch { toast.error('Failed to add product'); }
  }, [design, fetchDesign, viewingUserId]);

  const removeProductFromShelf = useCallback(async (itemId: string) => {
    try {
      const res = await fetch(`/api/designs/items/${itemId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Remove failed');
      await fetchDesign(viewingUserId || undefined);
      if (selectedItemId === itemId) setSelectedItemId(null);
      toast.success('Product removed');
    } catch { toast.error('Failed to remove product'); }
  }, [fetchDesign, viewingUserId, selectedItemId]);

  // Modified moveItem to correctly handle occupied slots and sourceShelfId
  const moveItem = useCallback(async (itemId: string, toShelfId: string, toPosition: number) => {
    if (!design) return;

    let itemToMove: DesignItemWithProduct | null = null;
    let sourceShelfId: string | null = null;

    // Find the item and its original shelf
    for (const shelf of design.shelves) {
      const item = shelf.items.find((i: any) => i.id === itemId);
      if (item) {
        itemToMove = item;
        sourceShelfId = shelf.id; // Store source shelf ID
        break;
      }
    }

    if (!itemToMove) {
      toast.error('Item not found.');
      return;
    }

    const productWidth = itemToMove.occupiedWidth;

    // Get occupied slots for the target shelf
    const targetShelf = design.shelves.find((s: any) => s.id === toShelfId);
    if (!targetShelf) {
      toast.error('Target shelf not found.');
      return;
    }

    const occupied = new Array(12).fill(false);

    // Populate occupied slots from all shelves, excluding the item being moved if it's on the same shelf
    for (const shelf of design.shelves) {
        for (const item of shelf.items) {
            // If this is the item being moved AND it's on the target shelf, skip it for now
            if (item.id === itemId && shelf.id === toShelfId) {
                continue;
            }
            // Otherwise, mark its slots as occupied
            for (let i = item.gridPosition; i < item.gridPosition + item.occupiedWidth; i++) {
                if (i < 12) occupied[i] = true;
            }
        }
    }

    let finalGridPosition = -1;

    // Check if the requested toPosition is valid and has enough space
    const isRequestedPositionValid = toPosition >= 0 && toPosition + productWidth <= 12;

    if (isRequestedPositionValid) {
      let slotsAreFree = true;
      for (let i = toPosition; i < toPosition + productWidth; i++) {
        if (occupied[i]) {
          slotsAreFree = false;
          break;
        }
      }
      if (slotsAreFree) {
        finalGridPosition = toPosition;
      }
    }

    // If the requested position is not valid or not free, find the first available slot starting from the requested position
    if (finalGridPosition === -1) {
      for (let i = toPosition; i <= 12 - productWidth; i++) { // Start search from toPosition
        let canFit = true;
        for (let j = i; j < i + productWidth; j++) {
          if (occupied[j]) {
            canFit = false;
            break;
          }
        }
        if (canFit) {
          finalGridPosition = i;
          break;
        }
      }
    }

    if (finalGridPosition === -1) {
      toast.error('No space available on this shelf for the item.');
      return;
    }

    try {
      const res = await fetch(`/api/designs/items/${itemId}/move`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shelfId: toShelfId, gridPosition: finalGridPosition }),
      });
      if (!res.ok) throw new Error('Move failed');
      await fetchDesign(viewingUserId || undefined);
    } catch { toast.error('Failed to move item'); }
  }, [design, fetchDesign, viewingUserId]);


  const updateItemQuantity = useCallback(async (itemId: string, quantity: number) => {
    try {
      const res = await fetch(`/api/designs/items/${itemId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });
      if (!res.ok) throw new Error('Update failed');
      await fetchDesign(viewingUserId || undefined);
    } catch { toast.error('Failed to update'); }
  }, [fetchDesign, viewingUserId]);

  const addShelf = useCallback(async () => {
    if (!design) return;
    try {
      const res = await fetch('/api/designs/shelves', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          designId: design.id, name: `Shelf ${design.shelves.length + 1}`, position: design.shelves.length,
        }),
      });
      if (!res.ok) throw new Error('Add shelf failed');
      await fetchDesign(viewingUserId || undefined);
      toast.success('Shelf added');
    } catch { toast.error('Failed to add shelf'); }
  }, [design, fetchDesign, viewingUserId]);

  const deleteShelf = useCallback(async (shelfId: string) => {
    try {
      const res = await fetch(`/api/designs/shelves/${shelfId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete shelf failed');
      await fetchDesign(viewingUserId || undefined);
      toast.success('Shelf deleted');
    } catch { toast.error('Failed to delete shelf'); }
  }, [fetchDesign, viewingUserId]);

  const isAdmin = (session?.user as any)?.role === 'admin';

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={session?.user} isAdmin={isAdmin} onSignOut={() => signOut()} />
      <div className="max-w-7xl mx-auto px-4 py-4">
        <Toolbar
          clipboard={clipboard} selectedItemId={selectedItemId} isAdmin={isAdmin}
          designName={design?.name || 'Untitled'}
          onSave={() => design && saveDesign(design.id)}
          onSaveAs={() => setShowSaveModal(true)}
          onLoad={() => setShowLoadModal(true)}
          onPrint={() => setShowPrintModal(true)}
          onAddShelf={addShelf}
          onAddProduct={() => setShowProductTray(true)}
          onCut={() => {
            if (selectedItemId && design) {
              for (const shelf of design.shelves) {
                const item = shelf.items.find((i: any) => i.id === selectedItemId);
                if (item) {
                  setClipboard({ itemId: item.id, productId: item.productId, sourceShelfId: shelf.id, designItem: item });
                  removeProductFromShelf(item.id);
                  break;
                }
              }
            }
          }}
          onPaste={() => {
            if (clipboard && design) {
              const shelf = design.shelves[0]; // Default to first shelf if no specific target
              if (shelf) {
                // Pass the default width and the target shelf ID
                addProductToShelf(shelf.id, clipboard.productId, clipboard.designItem.occupiedWidth, clipboard.designItem.gridPosition); // Use original position as default for paste
                setClipboard(null);
              }
            }
          }}
          viewingUserId={viewingUserId}
          users={users}
          onViewUser={(userId: string) => { setViewingUserId(userId); setSelectedItemId(null); setClipboard(null); fetchDesign(userId); }}
          onViewOwnDesigns={() => { setViewingUserId(null); setSelectedItemId(null); setClipboard(null); fetchDesign(); }}
        />

        {design && (
          <ShelfContainer
            design={design} selectedItemId={selectedItemId}
            onSelectItem={setSelectedItemId} onMoveItem={moveItem}
            onRemoveItem={removeProductFromShelf}
            onEditItem={(item: DesignItemWithProduct) => setEditingItem(item)}
            onDeleteShelf={deleteShelf}
            onRenameShelf={async (shelfId: string, newName: string) => {
              try {
                await fetch(`/api/designs/shelves/${shelfId}`, {
                  method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ name: newName }),
                });
                await fetchDesign(viewingUserId || undefined);
              } catch { toast.error('Failed to rename shelf'); }
            }}
            // Updated to receive and pass toPosition
            onDropOnShelf={async (itemId: string, shelfId: string, toPosition: number) => {
              // Validation logic for moveItem is now inside moveItem itself.
              await moveItem(itemId, shelfId, toPosition);
            }}
            // Updated to receive and pass toPosition
            onDropNewProduct={async (productId: string, defaultWidth: number, shelfId: string, toPosition: number) => {
              await addProductToShelf(shelfId, productId, defaultWidth, toPosition);
            }}
          />
        )}

        {!design && !loading && (
          <div className="text-center py-20"><p className="text-gray-500 text-lg">No design loaded. Create one to get started!</p></div>
        )}
      </div>

      {showProductPicker && (
        <ProductPickerModal
          onSelect={(product: any) => {
            if (design && design.shelves.length > 0) addProductToShelf(design.shelves[0].id, product.id, product.defaultWidth, 0); // Default to position 0 for new product picker
            setShowProductPicker(false);
          }}
          onClose={() => setShowProductPicker(false)}
        />
      )}
      {editingItem && (
        <ProductEditModal item={editingItem}
          onSave={(quantity: number) => { updateItemQuantity(editingItem.id, quantity); setEditingItem(null); }}
          onClose={() => setEditingItem(null)}
        />
      )}
      {showSaveModal && design && (
        <SaveDesignModal
          onSave={async (name: string, description: string) => {
            try {
              const res = await fetch('/api/designs', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description }),
              });
              if (!res.ok) throw new Error('Create failed');
              const data = await res.json();
              await saveDesign(data.data.id);
              setShowSaveModal(false);
              toast.success('Design saved as: ' + name);
            } catch { toast.error('Failed to save design'); }
          }}
          onClose={() => setShowSaveModal(false)}
        />
      )}
      {showLoadModal && (
        <LoadDesignModal
          onLoad={(designId: string) => {
            fetch(`/api/designs/${designId}/activate`, { method: 'POST' }).then(() => {
              fetchDesign(viewingUserId || undefined);
              setShowLoadModal(false);
              toast.success('Design loaded');
            }).catch(() => toast.error('Failed to load design'));
          }}
          onDelete={async (designId: string) => { await fetch(`/api/designs/${designId}`, { method: 'DELETE' }); toast.success('Design deleted'); }}
          onClose={() => setShowLoadModal(false)}
        />
      )}
      {showPrintModal && design && (
        <PrintModal design={design} onClose={() => setShowPrintModal(false)} />
      )}

      <ProductTray open={showProductTray} onToggle={() => setShowProductTray(!showProductTray)} />
    </div>
  );
}