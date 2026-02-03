export interface User {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  is_active: boolean
  role: {
    id: number
    name: string
  }
  created_at: string
  updated_at: string
}
