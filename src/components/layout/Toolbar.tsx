/**
 * EN: Toolbar — Main action bar with save, load, print, cut/paste, add, and admin controls.
 *     Contains all design manipulation buttons with icon + text labels (icons only on mobile).
 *     Admin users get a user-switcher dropdown to view other users' designs.
 *
 * ID: Toolbar — Bilah aksi utama dengan kontrol simpan, muat, cetak, potong/tempel, tambah, dan admin.
 *     Berisi semua tombol manipulasi desain dengan label ikon + teks (hanya ikon di mobile).
 *     Pengguna admin mendapat dropdown pengalih pengguna untuk melihat desain pengguna lain.
 */

'use client';

import { Save, FolderOpen, FilePlus, Printer, Scissors, Clipboard, Plus, Package, Users, PanelRightOpen, PanelRightClose } from 'lucide-react';
import type { ClipboardItem } from '@/types';

interface ToolbarProps {
  clipboard: ClipboardItem;
  selectedItemId: string | null;
  isAdmin: boolean;
  designName: string;
  showProductTray: boolean;
  onSave: () => void;
  onSaveAs: () => void;
  onLoad: () => void;
  onPrint: () => void;
  onAddShelf: () => void;
  onAddProduct: () => void;
  onCut: () => void;
  onPaste: () => void;
  onToggleProductTray: () => void;
  viewingUserId: string | null;
  users: Array<{ id: string; name: string; email: string }>;
  onViewUser: (userId: string) => void;
  onViewOwnDesigns: () => void;
}

export default function Toolbar({
  clipboard, selectedItemId, isAdmin, designName, showProductTray,
  onSave, onSaveAs, onLoad, onPrint, onAddShelf, onAddProduct,
  onCut, onPaste, onToggleProductTray, viewingUserId, users, onViewUser, onViewOwnDesigns,
}: ToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-6 no-print">
      {/* EN: Current design name / ID: Nama desain saat ini */}
      <span className="text-sm font-semibold text-gray-700 mr-2 truncate max-w-[200px]">
        📋 {designName}
      </span>

      {/* ─── Save/Load group / Grup Simpan/Muat ─── */}
      <button onClick={onSave} className="toolbar-btn" title="Save (Ctrl+S)">
        <Save className="w-4 h-4" />
        <span className="hidden sm:inline">Save</span>
      </button>
      <button onClick={onSaveAs} className="toolbar-btn" title="Save As...">
        <FilePlus className="w-4 h-4" />
        <span className="hidden sm:inline">Save As</span>
      </button>
      <button onClick={onLoad} className="toolbar-btn" title="Load Design">
        <FolderOpen className="w-4 h-4" />
        <span className="hidden sm:inline">Load</span>
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* ─── Edit group / Grup Edit ─── */}
      <button onClick={onCut} disabled={!selectedItemId} className="toolbar-btn" title="Cut (Ctrl+X)">
        <Scissors className="w-4 h-4" />
        <span className="hidden sm:inline">Cut</span>
      </button>
      <button onClick={onPaste} disabled={!clipboard} className="toolbar-btn" title="Paste (Ctrl+V)">
        <Clipboard className="w-4 h-4" />
        <span className="hidden sm:inline">Paste</span>
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* ─── Add group / Grup Tambah ─── */}
      <button onClick={onAddProduct} className="toolbar-btn primary" title="Add Product">
        <Package className="w-4 h-4" />
        <span className="hidden sm:inline">Add Product</span>
      </button>
      <button onClick={onAddShelf} className="toolbar-btn" title="Add Shelf">
        <Plus className="w-4 h-4" />
        <span className="hidden sm:inline">Add Shelf</span>
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* ─── Print / Cetak ─── */}
      <button onClick={onPrint} className="toolbar-btn" title="Print / PDF">
        <Printer className="w-4 h-4" />
        <span className="hidden sm:inline">Print</span>
      </button>

      {/* ─── Product Browser Toggle / Toggle Browser Produk ─── */}
      <button onClick={onToggleProductTray} className="toolbar-btn" title={showProductTray ? 'Hide Product Browser' : 'Show Product Browser'}>
        {showProductTray ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
        <span className="hidden sm:inline">{showProductTray ? 'Hide Tray' : 'Browse'}</span>
      </button>

      {/* ─── Admin: View as user dropdown / Admin: Dropdown lihat sebagai pengguna ─── */}
      {isAdmin && users.length > 0 && (
        <>
          <div className="w-px h-6 bg-gray-300 mx-1" />
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4 text-gray-500" />
            <select
              className="text-sm border border-gray-300 rounded-lg px-2 py-1.5 bg-white"
              value={viewingUserId || ''}
              onChange={(e) => {
                if (e.target.value) {
                  onViewUser(e.target.value);
                } else {
                  onViewOwnDesigns();
                }
              }}
            >
              <option value="">My Designs</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          </div>
        </>
      )}
    </div>
  );
}