/**
 * EN: Header — Top navigation bar with app branding, user info, and sign-out.
 *     Shows "Admin Panel" link for admin users. Hidden in print mode (no-print).
 *
 * ID: Header — Bilah navigasi atas dengan branding aplikasi, info pengguna, dan keluar.
 *     Menampilkan tautan "Panel Admin" untuk pengguna admin. Tersembunyi saat cetak (no-print).
 */

'use client';

import Link from 'next/link';
import { Package, LogOut, Settings } from 'lucide-react';

interface HeaderProps {
  user?: {
    name?: string | null;
    email?: string | null;
  } | null;
  isAdmin: boolean;
  onSignOut: () => void;
}

export default function Header({ user, isAdmin, onSignOut }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 no-print">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* EN: App branding / ID: Branding aplikasi */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Package className="w-7 h-7 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900 hidden sm:block">
              Shelf Re‑merchandiser
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* EN: Admin panel link (admin only) / ID: Tautan panel admin (khusus admin) */}
          {isAdmin && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200 transition"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Admin Panel</span>
            </Link>
          )}

          <div className="flex items-center gap-3">
            {/* EN: User name & email (desktop only) / ID: Nama & email pengguna (hanya desktop) */}
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <button
              onClick={onSignOut}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}