'use client';

import { useCallback, useEffect, useState } from 'react';

type User = { id: number; name: string | null; username: string; email: string; role: string };

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const loadUsers = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const response = await fetch('/api/users', { cache: 'no-store' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to load users');
      setUsers(result.data || result.details || []);
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally { setLoading(false); }
  }, []);
  useEffect(() => {
    const timer = window.setTimeout(() => { void loadUsers(); }, 0);
    return () => window.clearTimeout(timer);
  }, [loadUsers]);
  return <main className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h1 className="text-3xl font-bold">Users</h1><p className="mt-1 text-gray-600">Directory of users in your workspace</p></div><button type="button" onClick={() => void loadUsers()} disabled={loading} className="w-fit rounded-md border bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">{loading ? 'Refreshing...' : 'Refresh users'}</button></div>
    {error && <p className="mt-6 rounded-md bg-red-100 p-3 text-red-700" role="alert">{error === 'Forbidden' ? 'You do not have permission to view the user directory.' : error}</p>}
    {!loading && !error && (users.length === 0 ? <p className="mt-6 rounded-lg border bg-white p-6 text-center text-gray-600">No users found.</p> : <div className="mt-6 overflow-x-auto rounded-lg border bg-white shadow-sm"><table className="w-full min-w-[640px] text-left text-sm"><thead className="bg-gray-50 text-gray-700"><tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Username</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Role</th></tr></thead><tbody>{users.map((user) => <tr key={user.id} className="border-t"><td className="px-4 py-3 font-medium">{user.name || `User ${user.id}`}</td><td className="px-4 py-3">{user.username}</td><td className="break-all px-4 py-3">{user.email}</td><td className="px-4 py-3"><span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">{user.role}</span></td></tr>)}</tbody></table></div>)}
  </main>;
}
