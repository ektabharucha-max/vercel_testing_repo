import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import type { Profile, Role } from '../types/profile'

export function Users() {
  const { user, session } = useAuth()
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  useEffect(() => {
    loadUsers()
  }, [])

  async function loadUsers() {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) setError(error.message)
    else {
      setUsers(data as Profile[])
      setError(null)
    }
    setLoading(false)
  }

  async function handleRoleChange(id: string, role: Role) {
    setBusyId(id)
    const { error } = await supabase.from('profiles').update({ role }).eq('id', id)
    setBusyId(null)
    if (error) setError(error.message)
    else await loadUsers()
  }

  async function handleToggleActive(target: Profile) {
    setBusyId(target.id)
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: !target.is_active })
      .eq('id', target.id)
    setBusyId(null)
    if (error) setError(error.message)
    else await loadUsers()
  }

  async function handleDelete(target: Profile) {
    if (!window.confirm(`Permanently delete "${target.email}"? This cannot be undone.`)) return
    if (!session) return

    setBusyId(target.id)
    setError(null)

    const { data, error } = await supabase.functions.invoke('admin-delete-user', {
      body: { userId: target.id },
    })

    setBusyId(null)

    if (error) {
      setError((data as { error?: string } | null)?.error ?? error.message)
      return
    }

    await loadUsers()
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-16">
      <h1 className="text-2xl font-semibold text-gray-900">Users</h1>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : (
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500">
              <th className="py-2">Name</th>
              <th className="py-2">Email</th>
              <th className="py-2">Role</th>
              <th className="py-2">Status</th>
              <th className="py-2">Joined</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-gray-100">
                <td className="py-3 text-gray-900">{u.full_name ?? '—'}</td>
                <td className="py-3 text-gray-600">{u.email}</td>
                <td className="py-3">
                  <select
                    value={u.role}
                    disabled={busyId === u.id || u.id === user?.id}
                    onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                    className="rounded-md border border-gray-300 px-2 py-1 text-sm disabled:opacity-50"
                  >
                    <option value="user">user</option>
                    <option value="superadmin">superadmin</option>
                  </select>
                </td>
                <td className="py-3">
                  <span className={u.is_active ? 'text-green-700' : 'text-gray-400'}>
                    {u.is_active ? 'Active' : 'Deactivated'}
                  </span>
                </td>
                <td className="py-3 text-gray-600">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
                <td className="py-3">
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => handleToggleActive(u)}
                      disabled={busyId === u.id || u.id === user?.id}
                      className="text-gray-600 hover:text-gray-900 disabled:opacity-50"
                    >
                      {u.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDelete(u)}
                      disabled={busyId === u.id || u.id === user?.id}
                      className="text-red-600 hover:text-red-800 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}