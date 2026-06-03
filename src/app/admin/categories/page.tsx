'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', icon: '📦', color: '#9E9E9E' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) setCategories(data.data);
    } catch { toast.error('Failed to load'); }
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    try {
      const url = editing ? `/api/products/${editing.id}` : '/api/categories';
      // Simple POST for categories (no PUT route for simplicity)
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success(editing ? 'Updated' : 'Created');
        setShowForm(false);
        setEditing(null);
        setForm({ name: '', icon: '📦', color: '#9E9E9E' });
        loadData();
      }
    } catch { toast.error('Failed to save'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    try {
      await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      toast.success('Deleted');
      loadData();
    } catch { toast.error('Failed to delete'); }
  };

  if (loading) return <div className="text-center py-8 text-gray-500">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Categories ({categories.length})</h2>
        <button onClick={() => { setEditing(null); setForm({ name: '', icon: '📦', color: '#9E9E9E' }); setShowForm(true); }} className="toolbar-btn primary">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">{editing ? 'Edit' : 'Add'} Category</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Name</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Icon (emoji)</label>
                <input type="text" value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Color</label>
                <div className="flex gap-2">
                  <input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} className="w-12 h-10 border rounded cursor-pointer" />
                  <input type="text" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} className="flex-1 px-3 py-2 border rounded-lg text-sm" />
                </div>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium">Save</button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2 bg-gray-200 rounded-lg">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(cat => (
          <div key={cat.id} className="bg-white rounded-xl border p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style={{ backgroundColor: `${cat.color}20` }}>{cat.icon}</div>
                <div>
                  <p className="font-semibold text-sm">{cat.name}</p>
                  <p className="text-xs text-gray-500">{cat._count?.products || 0} products</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => { setEditing(cat); setForm({ name: cat.name, icon: cat.icon, color: cat.color }); setShowForm(true); }} className="p-1.5 hover:bg-gray-100 rounded-lg"><Pencil className="w-4 h-4 text-gray-500" /></button>
                <button onClick={() => handleDelete(cat.id)} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4 text-red-500" /></button>
              </div>
            </div>
            <div className="w-full h-2 rounded-full" style={{ backgroundColor: cat.color }} />
          </div>
        ))}
      </div>
    </div>
  );
}