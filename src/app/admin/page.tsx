/**
 * EN: Admin Dashboard — overview page showing counts for Products, Categories, Users, and Designs.
 *     Fetches stats from all 4 API endpoints in parallel via Promise.all.
 *
 * ID: Dasbor Admin — halaman ringkasan yang menampilkan jumlah Produk, Kategori, Pengguna, dan Desain.
 *     Mengambil statistik dari 4 endpoint API secara paralel via Promise.all.
 */

'use client';

import { useState, useEffect } from 'react';
import { Package, Tags, Users, FolderOpen } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, categories: 0, users: 0, designs: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // EN: Fetch all stats in parallel / ID: Ambil semua statistik secara paralel
      const [prodRes, catRes, userRes, designRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
        fetch('/api/users'),
        fetch('/api/designs'),
      ]);
      const prods = await prodRes.json();
      const cats = await catRes.json();
      const users = await userRes.json();
      const designs = await designRes.json();
      setStats({
        products: prods.data?.length || 0,
        categories: cats.data?.length || 0,
        users: users.data?.length || 0,
        designs: designs.data?.length || 0,
      });
    } catch {}
    setLoading(false);
  };

  // EN: Stat cards config / ID: Konfigurasi kartu statistik
  const cards = [
    { label: 'Products', value: stats.products, icon: Package, color: 'blue' },
    { label: 'Categories', value: stats.categories, icon: Tags, color: 'green' },
    { label: 'Users', value: stats.users, icon: Users, color: 'purple' },
    { label: 'Designs', value: stats.designs, icon: FolderOpen, color: 'orange' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="bg-white rounded-xl border p-4 shadow-sm">
                <div className={`w-10 h-10 rounded-lg bg-${card.color}-100 flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 text-${card.color}-600`} />
                </div>
                <p className="text-2xl font-bold">{card.value}</p>
                <p className="text-sm text-gray-500">{card.label}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}