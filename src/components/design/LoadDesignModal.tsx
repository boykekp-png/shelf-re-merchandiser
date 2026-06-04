/**
 * EN: LoadDesignModal — Dialog to browse and load previously saved designs.
 *     Fetches designs from /api/designs, shows shelf count and last-modified date.
 *     Click to load (activate) a design, with delete button per design.
 *
 * ID: LoadDesignModal — Dialog untuk menelusuri dan memuat desain yang tersimpan.
 *     Mengambil desain dari /api/designs, menampilkan jumlah rak dan tanggal modifikasi terakhir.
 *     Klik untuk memuat (mengaktifkan) desain, dengan tombol hapus per desain.
 */

'use client';

import { useState, useEffect } from 'react';
import { X, Trash2, FolderOpen } from 'lucide-react';

interface LoadDesignModalProps {
  onLoad: (designId: string) => void;
  onDelete: (designId: string) => void;
  onClose: () => void;
}

export default function LoadDesignModal({ onLoad, onDelete, onClose }: LoadDesignModalProps) {
  const [designs, setDesigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // EN: Fetch saved designs on mount / ID: Ambil desain tersimpan saat mount
  useEffect(() => {
    loadDesigns();
  }, []);

  const loadDesigns = async () => {
    try {
      const res = await fetch('/api/designs');
      const data = await res.json();
      if (data.success) setDesigns(data.data);
    } catch (err) {
      console.error('Failed to load designs', err);
    } finally {
      setLoading(false);
    }
  };

  // EN: Delete and remove from local list / ID: Hapus dan hapus dari daftar lokal
  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Delete this design permanently?')) {
      await onDelete(id);
      setDesigns((prev) => prev.filter((d) => d.id !== id));
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Load Design</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-4">
          {loading ? (
            <p className="text-center text-gray-500 py-8">Loading...</p>
          ) : designs.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No saved designs</p>
          ) : (
            <div className="space-y-2">
              {designs.map((design) => (
                <div
                  key={design.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 cursor-pointer transition"
                  onClick={() => onLoad(design.id)}
                >
                  <div className="flex items-center gap-3">
                    <FolderOpen className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="font-medium text-sm">{design.name}</p>
                      <p className="text-xs text-gray-500">
                        {/* EN: Shelf count + optional description / ID: Jumlah rak + deskripsi opsional */}
                        {design._count?.shelves || 0} shelves
                        {design.description && ` · ${design.description}`}
                      </p>
                      {/* EN: Last modified date / ID: Tanggal modifikasi terakhir */}
                      <p className="text-xs text-gray-400">
                        {new Date(design.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, design.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}