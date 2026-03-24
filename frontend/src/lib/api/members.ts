import { supabase } from '../supabase'
import type { Member, Family } from '../../types'

export const membersAPI = {
  async getAll(): Promise<Member[]> {
    const { data } = await supabase
      .from('members')
      .select('*')
      .order('first_name')
    return data ?? []
  },

  async get(id: string): Promise<Member | null> {
    const { data } = await supabase
      .from('members')
      .select('*')
      .eq('id', id)
      .single()
    return data
  },

  async create(member: Omit<Member, 'id' | 'created_at'>): Promise<Member | null> {
    const { data } = await supabase
      .from('members')
      .insert(member)
      .select()
      .single()
    return data
  },

  async update(id: string, member: Partial<Member>): Promise<void> {
    await supabase.from('members').update(member).eq('id', id)
  },

  async delete(id: string): Promise<void> {
    await supabase.from('members').delete().eq('id', id)
  },

  async getFamilies(): Promise<Family[]> {
    const { data: families } = await supabase
      .from('families')
      .select('*')
      .order('family_name')

    if (!families) return []

    const { data: members } = await supabase
      .from('members')
      .select('*')
      .not('family_id', 'is', null)

    return families.map((fam) => {
      const famMembers = (members ?? []).filter((m) => m.family_id === fam.id)
      return {
        ...fam,
        members: famMembers,
        head: famMembers.find((m) => m.family_role === 'Head') ?? null,
        spouse: famMembers.find((m) => m.family_role === 'Spouse') ?? null,
        children: famMembers.filter((m) => m.family_role === 'Child'),
      }
    })
  },

  async createFamily(data: { family_name: string; members: Partial<Member>[] }): Promise<void> {
    const { data: fam } = await supabase
      .from('families')
      .insert({ family_name: data.family_name })
      .select()
      .single()

    if (fam && data.members.length > 0) {
      const membersToInsert = data.members.map((m) => ({
        first_name: m.first_name ?? '',
        last_name: m.last_name ?? '',
        gender: m.gender ?? null,
        phone: m.phone ?? null,
        family_id: fam.id,
        family_role: m.family_role ?? null,
        role: 'Member',
        membership_status: 'Active',
      }))
      await supabase.from('members').insert(membersToInsert)
    }
  },

  async deleteFamily(id: string): Promise<void> {
    // Unlink members first
    await supabase.from('members').update({ family_id: null, family_role: null }).eq('family_id', id)
    await supabase.from('families').delete().eq('id', id)
  },
}
