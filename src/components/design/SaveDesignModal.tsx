'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface SaveDesignModalProps {
  onSave: (name: string, description: string) => void;
  onClose: () => void;
}

export default function SaveDesignModal({ onSave, onClose }: SaveDesignModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Save Design As</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Design Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="My Layout" className="w-full px-3 py-2 border rounded-lg text-sm" required />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Description (optional)</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description..." className="w-full px-3 py-2 border rounded-lg text-sm" rows={3} />
          </div>
          <button onClick={() => { if (name.trim()) onSave(name.trim(), description.trim()); }} className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
            Save Design
          </button>
        </div>
      </div>
    </div>
  );
}