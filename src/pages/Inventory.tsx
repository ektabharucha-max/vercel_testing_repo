import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import type { InventoryItem, InventoryItemInput } from '../types/inventory'
import { InventoryFormModal } from '../components/InventoryFormModal'

export function Inventory() {
  const { user } = useAuth()
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<InventoryItem | null | undefined>(undefined)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    loadItems()
  }, [])

  async function loadItems() {
    setLoading(true)
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      setItems(data as InventoryItem[])
      setError(null)
    }
    setLoading(false)
  }

  async function handleSave(input: InventoryItemInput): Promise<string | null> {
    if (!user) return 'Not signed in'

    if (editing) {
      const { error } = await supabase.from('inventory').update(input).eq('id', editing.id)
      if (error) return error.message
    } else {
      const { error } = await supabase.from('inventory').insert({ ...input, user_id: user.id })
      if (error) return error.message
    }

    setEditing(undefined)
    await loadItems()
    return null
  }

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return

    setDeletingId(id)
    const { error } = await supabase.from('inventory').delete().eq('id', id)
    setDeletingId(null)
    if (error) {
      setError(error.message)
      return
    }
    await loadItems()
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Inventory</h1>
        <button
          onClick={() => setEditing(null)}
          className="rounded-md bg-gray-900 px-3 py-2 text-sm text-white hover:bg-gray-700"
        >
          Add item
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-gray-500">No inventory items yet.</p>
      ) : (
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500">
              <th className="py-2">Name</th>
              <th className="py-2">SKU</th>
              <th className="py-2">Quantity</th>
              <th className="py-2">Price</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-gray-100">
                <td className="py-3 text-gray-900">{item.name}</td>
                <td className="py-3 text-gray-600">{item.sku}</td>
                <td className="py-3 text-gray-600">{item.quantity}</td>
                <td className="py-3 text-gray-600">${item.price.toFixed(2)}</td>
                <td className="py-3">
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setEditing(item)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id, item.name)}
                      disabled={deletingId === item.id}
                      className="text-red-600 hover:text-red-800 disabled:opacity-50"
                    >
                      {deletingId === item.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {editing !== undefined && (
        <InventoryFormModal
          initial={editing}
          onSave={handleSave}
          onClose={() => setEditing(undefined)}
        />
      )}
    </div>
  )
}