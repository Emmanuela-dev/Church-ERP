import { supabase } from '../supabase'
import type { ChurchInfo, ChurchService } from '../../types'

export const churchAPI = {
  async get(): Promise<ChurchInfo | null> {
    const { data } = await supabase
      .from('church_info')
      .select('*')
      .limit(1)
      .maybeSingle()
    return data
  },

  async upsert(info: Partial<ChurchInfo>): Promise<ChurchInfo | null> {
    if (info.id) {
      const { data } = await supabase
        .from('church_info')
        .update(info)
        .eq('id', info.id)
        .select()
        .single()
      return data
    } else {
      const { data } = await supabase
        .from('church_info')
        .insert(info)
        .select()
        .single()
      return data
    }
  },

  async getServices(churchId: string): Promise<ChurchService[]> {
    const { data } = await supabase
      .from('church_services')
      .select('*')
      .eq('church_id', churchId)
      .order('created_at')
    return data ?? []
  },

  async addService(service: Omit<ChurchService, 'id' | 'created_at'>): Promise<ChurchService | null> {
    const { data } = await supabase
      .from('church_services')
      .insert(service)
      .select()
      .single()
    return data
  },

  async updateService(id: string, service: Partial<ChurchService>): Promise<void> {
    await supabase.from('church_services').update(service).eq('id', id)
  },

  async deleteService(id: string): Promise<void> {
    await supabase.from('church_services').delete().eq('id', id)
  },
}
