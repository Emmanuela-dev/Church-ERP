import { supabase } from '../supabase'
import type { Finance, FinanceSummary } from '../../types'

export const financeAPI = {
  async getAll(type?: string): Promise<Finance[]> {
    let query = supabase
      .from('finance')
      .select('*, member:members(first_name, last_name)')
      .order('date', { ascending: false })
    if (type) query = query.eq('type', type)
    const { data } = await query
    return (data as Finance[]) ?? []
  },

  async create(entry: Omit<Finance, 'id' | 'created_at' | 'member'>): Promise<Finance | null> {
    const { data } = await supabase
      .from('finance')
      .insert(entry)
      .select()
      .single()
    return data
  },

  async update(id: string, entry: Partial<Finance>): Promise<void> {
    await supabase.from('finance').update(entry).eq('id', id)
  },

  async delete(id: string): Promise<void> {
    await supabase.from('finance').delete().eq('id', id)
  },

  async summary(): Promise<FinanceSummary> {
    const { data } = await supabase.from('finance').select('type, amount')
    const result: FinanceSummary = { Tithe: 0, Offering: 0, Donation: 0, Pledge: 0 }
    for (const row of data ?? []) {
      result[row.type] = (result[row.type] ?? 0) + Number(row.amount)
    }
    return result
  },
}
