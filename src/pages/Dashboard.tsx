import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import type { InventoryItem } from '../types/inventory'

const LOW_STOCK_THRESHOLD = 5

export function Dashboard() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('inventory')
      .select('*')
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setItems(data as InventoryItem[])
        setLoading(false)
      })
  }, [])

  const totalItems = items.length
  const totalUnits = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalValue = items.reduce((sum, item) => sum + item.quantity * item.price, 0)
  const lowStock = items
    .filter((item) => item.quantity < LOW_STOCK_THRESHOLD)
    .sort((a, b) => a.quantity - b.quantity)

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-16">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="Items" value={totalItems.toString()} />
            <StatCard label="Units in stock" value={totalUnits.toString()} />
            <StatCard label="Inventory value" value={`$${totalValue.toFixed(2)}`} />
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">
                Low stock (below {LOW_STOCK_THRESHOLD} units)
              </h2>
              <Link to="/inventory" className="text-sm text-gray-600 underline hover:text-gray-900">
                Manage inventory
              </Link>
            </div>

            {lowStock.length === 0 ? (
              <p className="text-sm text-gray-500">Nothing is running low.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {lowStock.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between rounded-md border border-gray-200 px-4 py-2 text-sm"
                  >
                    <span className="text-gray-900">{item.name}</span>
                    <span className="text-red-600">{item.quantity} left</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-gray-200 p-4">
      <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  )
}