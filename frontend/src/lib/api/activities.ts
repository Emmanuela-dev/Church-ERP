import { supabase } from '../supabase'
import type { Activity } from '../../types'

export const activitiesAPI = {
  async getAll(status?: string): Promise<Activity[]> {
    let query = supabase.from('activities').select('*').order('date', { ascending: false })
    if (status) query = query.eq('status', status)
    const { data } = await query
    return data ?? []
  },

  async get(id: string): Promise<Activity | null> {
    const { data } = await supabase
      .from('activities')
      .select('*')
      .eq('id', id)
      .single()
    return data
  },

  async create(activity: Omit<Activity, 'id' | 'created_at'>): Promise<Activity | null> {
    const { data } = await supabase
      .from('activities')
      .insert(activity)
      .select()
      .single()
    return data
  },

  async update(id: string, activity: Partial<Activity>): Promise<void> {
    await supabase.from('activities').update(activity).eq('id', id)
  },

  async delete(id: string): Promise<void> {
    await supabase.from('activities').delete().eq('id', id)
  },
}
