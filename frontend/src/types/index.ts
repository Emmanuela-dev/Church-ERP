// All TypeScript interfaces for the Church ERP system

export interface ChurchInfo {
  id: string
  name: string | null
  motto: string | null
  vision: string | null
  mission: string | null
  address: string | null
  city: string | null
  country: string | null
  phone: string | null
  email: string | null
  website: string | null
  founding_year: number | null
  pastor: string | null
  created_at?: string
}

export interface ChurchService {
  id: string
  church_id: string
  name: string
  day: string | null
  time: string | null
  order_of_service: string[] | null
  created_at?: string
}

export interface Member {
  id: string
  first_name: string
  last_name: string
  gender: string | null
  date_of_birth: string | null
  phone: string | null
  email: string | null
  address: string | null
  occupation: string | null
  role: string
  membership_status: string
  membership_date: string | null
  family_id: string | null
  family_role: string | null
  created_at?: string
}

export interface Family {
  id: string
  family_name: string
  created_at?: string
  head?: Member | null
  spouse?: Member | null
  children?: Member[]
  members?: Member[]
}

export interface Activity {
  id: string
  title: string
  description: string | null
  category: string | null
  date: string | null
  time: string | null
  venue: string | null
  organizer: string | null
  status: string
  created_at?: string
}

export interface Finance {
  id: string
  type: string
  amount: number
  currency: string
  member_id: string | null
  is_anonymous: boolean
  date: string | null
  recorded_by: string | null
  notes: string | null
  created_at?: string
  member?: Pick<Member, 'first_name' | 'last_name'> | null
}

export interface FinanceSummary {
  Tithe: number
  Offering: number
  Donation: number
  Pledge: number
  [key: string]: number
}
