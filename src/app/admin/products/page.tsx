'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import type { ProductWithCategory } from '@/types';
import toast from 'react-hot-toast';

export default function AdminProductsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ProductWithCategory | null>(null);
  const [form, setForm] = useState({ name: '', categoryId: '' });

  const loadData = async () => {
    setLoading(true);
    const [prodRes, catRes] = await Promise.all([
      fetch('/api/products'),
      fetch('/api/categories'),
    ]);
    const prodData = await prodRes.json();
    const catData = await catRes.json();
    if (prodData.success) setProducts(prodData.data);
    if (catData.success) setCategories(catData.data);
    setLoading(false);
  };

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return; }
    if (status === 'authenticated') {
      const role = (session?.user as any)?.role;
      if (role !== 'admin') { router.push('/'); return; }
      loadData();
    }
  }, [status, session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.categoryId) {
      toast.error('Name and category are required');
      return;
    }
    try {
      if (editing) {
        const res = await fetch(`/api/products/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: form.name, categoryId: form.categoryId }),
        });
        if (!res.ok) throw new Error('Update failed');
        toast.success('Product updated');
      } else {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: form.name, categoryId: form.categoryId }),
        });
        if (!res.ok) throw new Error('Create failed');
        toast.success('Product created');
      }
      setShowForm(false);
      setEditing(null);
      setForm({ name: '', categoryId: '' });
      loadData();
    } catch {
      toast.error('Failed to save product');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      toast.success('Product deleted');
      loadData();
    } catch {
      toast.error('Failed to delete product');
    }
  };

  const filtered = products;

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Products ({filtered.length})</h2>
        <button onClick={() => { setEditing(null); setForm({ name: '', categoryId: '' }); setShowForm(true); }} className="toolbar-btn primary">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{editing ? 'Edit' : 'New'} Product</h3>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Name</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Category</label>
                <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required>
                  <option value="">Select category</option>
                  {categories.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
                {editing ? 'Update' : 'Create'} Product
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium">Name</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Category</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Status</th>
              <th className="text-right px-4 py-3 text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((product) => (
              <tr key={product.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{product.name}</td>
                <td className="px-4 py-3 text-sm">{product.category.icon} {product.category.name}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${product.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {product.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => { setEditing(product); setForm({ name: product.name, categoryId: product.categoryId }); setShowForm(true); }} className="p-1.5 hover:bg-gray-100 rounded-lg">
                      <Pencil className="w-4 h-4 text-gray-500" />
                    </button>
                    <button onClick={() => handleDelete(product.id)} className="p-1.5 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-8 text-gray-500">No products found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
