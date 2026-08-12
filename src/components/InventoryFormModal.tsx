import { useState, type FormEvent } from 'react'
import type { InventoryItem, InventoryItemInput } from '../types/inventory'

type Props = {
  initial?: InventoryItem | null
  onSave: (input: InventoryItemInput) => Promise<string | null>
  onClose: () => void
}

export function InventoryFormModal({ initial, onSave, onClose }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [sku, setSku] = useState(initial?.sku ?? '')
  const [quantity, setQuantity] = useState(String(initial?.quantity ?? 0))
  const [price, setPrice] = useState(String(initial?.price ?? 0))
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const error = await onSave({
      name,
      sku,
      quantity: Number(quantity),
      price: Number(price),
    })

    setSubmitting(false)
    if (error) setError(error)
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-md bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          {initial ? 'Edit item' : 'Add item'}
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm text-gray-700">
            Name
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-gray-700">
            SKU
            <input
              type="text"
              required
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
            />
          </label>
          <div className="flex gap-3">
            <label className="flex flex-1 flex-col gap-1 text-sm text-gray-700">
              Quantity
              <input
                type="number"
                required
                min={0}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
              />
            </label>
            <label className="flex flex-1 flex-col gap-1 text-sm text-gray-700">
              Price
              <input
                type="number"
                required
                min={0}
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
              />
            </label>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="mt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-gray-900 px-3 py-2 text-sm text-white hover:bg-gray-700 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
