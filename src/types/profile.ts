export type Role = 'user' | 'superadmin'

export type Profile = {
  id: string
  email: string
  full_name: string | null
  role: Role
  is_active: boolean
  created_at: string
}