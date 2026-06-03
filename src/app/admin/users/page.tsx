'use client';

import { useState, useEffect } from 'react';
import { Shield, User, UserCog } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.success) setUsers(data.data);
    } catch { toast.error('Failed to load users'); }
    setLoading(false);
  };

  const handleRoleToggle = async (user: any) => {
    if (user.email === 'admin@example.com') { toast.error('Cannot change seed admin role'); return; }
    if (!confirm(`Change ${user.name}'s role to ${user.role === 'admin' ? 'user' : 'admin'}?`)) return;
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: user.role === 'admin' ? 'user' : 'admin' }),
      });
      if (res.ok) { toast.success('Role updated'); loadUsers(); }
    } catch { toast.error('Failed to update role'); }
  };

  if (loading) return <div className="text-center py-8 text-gray-500">Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Users ({users.length})</h2>
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">User</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Email</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Role</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Joined</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(user => (
              <tr key={user.id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      {user.role === 'admin' ? <Shield className="w-4 h-4 text-blue-600" /> : <User className="w-4 h-4 text-gray-600" />}
                    </div>
                    <span className="font-medium text-sm">{user.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{user.email}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => handleRoleToggle(user)} className="p-1.5 hover:bg-gray-100 rounded-lg" title={`Toggle to ${user.role === 'admin' ? 'user' : 'admin'}`}>
                    <UserCog className="w-4 h-4 text-gray-500" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}