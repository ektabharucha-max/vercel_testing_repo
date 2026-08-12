export type InventoryItem = {
  id: string
  user_id: string
  name: string
  sku: string
  quantity: number
  price: number
  created_at: string
}

export type InventoryItemInput = {
  name: string
  sku: string
  quantity: number
  price: number
}