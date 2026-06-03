'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Pencil, ToggleLeft, ToggleRight, Upload, Search, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterActive, setFilterActive] = useState('all');
  const [editing, setEditing] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', categoryId: '', defaultWidth: 3 });
  const [formImagePreview, setFormImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const formFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([fetch('/api/products'), fetch('/api/categories')]);
      const prods = await prodRes.json();
      const cats = await catRes.json();
      if (prods.success) setProducts(prods.data);
      if (cats.success) setCategories(cats.data);
    } catch { toast.error('Failed to load data'); }
    setLoading(false);
  };

  const handleToggle = async (product: any) => {
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...product, isActive: !product.isActive, categoryId: product.categoryId }),
      });
      if (res.ok) {
        toast.success(product.isActive ? 'Product disabled' : 'Product enabled');
        loadData();
      }
    } catch { toast.error('Failed to update'); }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.categoryId) { toast.error('Name and category required'); return; }
    try {
      const url = editing ? `/api/products/${editing.id}` : '/api/products';
      const method = editing ? 'PUT' : 'POST';
      const body = editing ? { ...form, isActive: editing.isActive } : form;
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (res.ok) {
        toast.success(editing ? 'Product updated' : 'Product created');
        setShowForm(false);
        setEditing(null);
        setForm({ name: '', categoryId: '', defaultWidth: 3 });
        loadData();
      }
    } catch { toast.error('Failed to save'); }
  };

  const handleImageUpload = async (productId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('productId', productId);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (res.ok) { toast.success('Image uploaded'); loadData(); }
    } catch { toast.error('Upload failed'); }
  };

  const handleFormImageUpload = async (productId: string, file: File) => {
    setUploadingImage(true);
    // Show immediate preview
    setFormImagePreview(URL.createObjectURL(file));
    const formData = new FormData();
    formData.append('file', file);
    formData.append('productId', productId);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (res.ok) {
        toast.success('Image uploaded');
        await loadData();
        // Refresh editing state with updated product
        const updated = products.find((p: any) => p.id === productId);
        if (updated) setEditing(updated);
      }
    } catch { toast.error('Upload failed'); }
    finally { setUploadingImage(false); }
  };

  const filtered = products.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterCategory !== 'all' && p.categoryId !== filterCategory) return false;
    if (filterActive === 'active' && !p.isActive) return false;
    if (filterActive === 'disabled' && p.isActive) return false;
    return true;
  });

  if (loading) return <div className="text-center py-8 text-gray-500">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Products ({filtered.length})</h2>
        <button onClick={() => { setEditing(null); setForm({ name: '', categoryId: '', defaultWidth: 3 }); setShowForm(true); }} className="toolbar-btn primary">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 pr-4 py-2 border rounded-lg text-sm" />
        </div>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>
        <select value={filterActive} onChange={e => setFilterActive(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="disabled">Disabled</option>
        </select>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">{editing ? 'Edit' : 'Add'} Product</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Name</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Category</label>
                <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required>
                  <option value="">Select...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Default Grid Width</label>
                <select value={form.defaultWidth} onChange={e => setForm({ ...form, defaultWidth: parseInt(e.target.value) })} className="w-full px-3 py-2 border rounded-lg text-sm">
                  <option value={1}>1 grid</option>
                  <option value={2}>2 grids</option>
                  <option value={3}>3 grids</option>
                </select>
              </div>

              {/* Product Image */}
              {editing && (
                <div>
                  <label className="text-sm font-medium block mb-2">Product Image</label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
                      {formImagePreview ? (
                        <img src={formImagePreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : editing.imagePath ? (
                        <img src={editing.imagePath} alt={editing.name} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => formFileRef.current?.click()}
                        disabled={uploadingImage}
                        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition disabled:opacity-50"
                      >
                        <Upload className="w-4 h-4" />
                        {uploadingImage ? 'Uploading...' : editing.imagePath ? 'Change Image' : 'Upload Image'}
                      </button>
                      {editing.imagePath && (
                        <button
                          type="button"
                          onClick={() => {
                            setFormImagePreview(null);
                            fetch(`/api/products/${editing.id}`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ ...editing, imagePath: '', categoryId: editing.categoryId, isActive: editing.isActive }),
                            }).then(() => { toast.success('Image removed'); loadData(); });
                          }}
                          className="block mt-1 text-xs text-red-500 hover:text-red-700"
                        >
                          Remove image
                        </button>
                      )}
                    </div>
                    <input
                      ref={formFileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => {
                        const f = e.target.files?.[0];
                        if (f) handleFormImageUpload(editing.id, f);
                        e.target.value = '';
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium">Save</button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2 bg-gray-200 rounded-lg">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product List */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Product</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Category</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Width</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Status</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(product => (
                <tr key={product.id} className={product.isActive ? '' : 'opacity-50 bg-gray-50'}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {product.imagePath ? (
                        <img src={product.imagePath} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-lg">📦</div>
                      )}
                      <span className="font-medium text-sm">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span style={{ color: product.category?.color }}>{product.category?.icon} {product.category?.name}</span>
                  </td>
                  <td className="px-4 py-3 text-sm">{product.defaultWidth}-grid</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${product.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {product.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleToggle(product)} className="p-1.5 hover:bg-gray-100 rounded-lg" title={product.isActive ? 'Disable' : 'Enable'}>
                        {product.isActive ? <ToggleRight className="w-4 h-4 text-green-600" /> : <ToggleLeft className="w-4 h-4 text-gray-400" />}
                      </button>
                      <button onClick={() => { setEditing(product); setForm({ name: product.name, categoryId: product.categoryId, defaultWidth: product.defaultWidth }); setShowForm(true); }} className="p-1.5 hover:bg-gray-100 rounded-lg">
                        <Pencil className="w-4 h-4 text-gray-500" />
                      </button>
                      <button onClick={() => fileRef.current?.click()} className="p-1.5 hover:bg-gray-100 rounded-lg">
                        <Upload className="w-4 h-4 text-gray-500" />
                      </button>
                      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(product.id, f); }} />
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="text-center py-8 text-gray-500">No products found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}