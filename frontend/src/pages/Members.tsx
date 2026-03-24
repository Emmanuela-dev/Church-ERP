import { useEffect, useState } from 'react'
import { membersAPI } from '../lib'
import type { Member, Family } from '../types'
import Modal from '../components/Modal'
import { MdSearch, MdAdd, MdEdit, MdDelete, MdVisibility, MdPeople, MdFamilyRestroom } from 'react-icons/md'

const emptyMember: Omit<Member, 'id' | 'created_at'> = {
  first_name: '', last_name: '', gender: '', date_of_birth: null, phone: null,
  email: null, address: null, occupation: null, role: 'Member',
  membership_status: 'Active', membership_date: null, family_id: null, family_role: null,
}

const ROLES = ['Member', 'Deacon', 'Elder', 'Pastor', 'Usher', 'Choir', 'Worker']
const STATUSES = ['Active', 'Inactive', 'Transferred']

function statusBadge(s: string) {
  if (s === 'Active')      return <span className="badge badge-green">{s}</span>
  if (s === 'Transferred') return <span className="badge badge-blue">{s}</span>
  return <span className="badge badge-gray">{s}</span>
}

export default function Members() {
  const [tab, setTab] = useState<'members' | 'families'>('members')
  const [members, setMembers] = useState<Member[]>([])
  const [families, setFamilies] = useState<Family[]>([])
  const [modal, setModal] = useState<'member' | 'family' | 'view' | null>(null)
  const [form, setForm] = useState<Omit<Member, 'id' | 'created_at'>>(emptyMember)
  const [editing, setEditing] = useState<string | null>(null)
  const [selected, setSelected] = useState<Member | null>(null)
  const [familyForm, setFamilyForm] = useState<{ family_name: string; members: Partial<Member>[] }>({ family_name: '', members: [] })
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () => {
    membersAPI.getAll().then(setMembers)
    membersAPI.getFamilies().then(setFamilies)
  }
  useEffect(() => { load() }, [])

  const saveMember = async () => {
    setSaving(true)
    if (editing) await membersAPI.update(editing, form)
    else await membersAPI.create(form)
    setModal(null); setForm(emptyMember); setEditing(null); setSaving(false); load()
  }

  const deleteMember = async (id: string) => { await membersAPI.delete(id); load() }
  const deleteFamily = async (id: string) => { await membersAPI.deleteFamily(id); load() }

  const saveFamily = async () => {
    setSaving(true)
    await membersAPI.createFamily(familyForm)
    setModal(null); setFamilyForm({ family_name: '', members: [] }); setSaving(false); load()
  }

  const filtered = members.filter(m =>
    `${m.first_name} ${m.last_name}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Members</h1>
          <p className="page-subtitle">{members.length} members · {families.length} families</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-primary" onClick={() => { setForm(emptyMember); setEditing(null); setModal('member') }}>
            <MdAdd /> Add Member
          </button>
          <button className="btn btn-success" onClick={() => { setFamilyForm({ family_name: '', members: [] }); setModal('family') }}>
            <MdAdd /> Add Family
          </button>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="tab-bar">
        {([['members', 'Members', <MdPeople />], ['families', 'Families', <MdFamilyRestroom />]] as const).map(([t, label, icon]) => (
          <button key={t} className={`tab-btn${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
            {icon} {label}
          </button>
        ))}
      </div>

      {/* Members Table */}
      {tab === 'members' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ position: 'relative', maxWidth: 340 }}>
            <MdSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 18 }} />
            <input className="input" style={{ paddingLeft: 38 }} placeholder="Search members…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="card" style={{ overflow: 'hidden' }}>
            <table className="table">
              <thead>
                <tr>
                  {['Name', 'Gender', 'Phone', 'Role', 'Status', 'Actions'].map(h => <th key={h}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>No members found</td></tr>
                ) : filtered.map(m => (
                  <tr key={m.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0,
                        }}>
                          {m.first_name[0]}{m.last_name[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{m.first_name} {m.last_name}</div>
                          {m.email && <div style={{ fontSize: 12, color: '#94a3b8' }}>{m.email}</div>}
                        </div>
                      </div>
                    </td>
                    <td>{m.gender || '—'}</td>
                    <td>{m.phone || '—'}</td>
                    <td><span className="badge badge-purple">{m.role}</span></td>
                    <td>{statusBadge(m.membership_status)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-sm btn-icon" title="View" onClick={() => { setSelected(m); setModal('view') }}><MdVisibility /></button>
                        <button className="btn btn-ghost btn-sm btn-icon" title="Edit" onClick={() => { setForm({ ...m }); setEditing(m.id); setModal('member') }}><MdEdit /></button>
                        <button className="btn btn-danger btn-sm btn-icon" title="Delete" onClick={() => deleteMember(m.id)}><MdDelete /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Families Grid */}
      {tab === 'families' && (
        families.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👨‍👩‍👧‍👦</div>
            <div className="empty-state-text">No families yet</div>
            <div className="empty-state-sub">Click "Add Family" to create one</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {families.map(f => (
              <div key={f.id} className="card card-pad hover-lift">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: 16 }}>{f.family_name} Family</h3>
                    <span className="badge badge-blue" style={{ marginTop: 4 }}>{f.members?.length ?? 0} members</span>
                  </div>
                  <button className="btn btn-danger btn-sm btn-icon" onClick={() => deleteFamily(f.id)}><MdDelete /></button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {f.head && (
                    <div style={{ display: 'flex', gap: 8, fontSize: 14 }}>
                      <span style={{ color: '#94a3b8', minWidth: 60 }}>Head:</span>
                      <span style={{ fontWeight: 600 }}>{f.head.first_name} {f.head.last_name}</span>
                    </div>
                  )}
                  {f.spouse && (
                    <div style={{ display: 'flex', gap: 8, fontSize: 14 }}>
                      <span style={{ color: '#94a3b8', minWidth: 60 }}>Spouse:</span>
                      <span style={{ fontWeight: 600 }}>{f.spouse.first_name} {f.spouse.last_name}</span>
                    </div>
                  )}
                  {(f.children?.length ?? 0) > 0 && (
                    <div style={{ display: 'flex', gap: 8, fontSize: 14 }}>
                      <span style={{ color: '#94a3b8', minWidth: 60 }}>Children:</span>
                      <span>{f.children!.map(c => `${c.first_name} ${c.last_name}`).join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Add/Edit Member Modal */}
      {modal === 'member' && (
        <Modal title={editing ? 'Edit Member' : 'Add Member'} onClose={() => setModal(null)} size="lg">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {(['first_name', 'last_name', 'phone', 'email', 'address', 'occupation'] as const).map(key => (
              <div key={key}>
                <label className="label">{key.replace('_', ' ')}</label>
                <input className="input" value={form[key] ?? ''} onChange={e => setForm({ ...form, [key]: e.target.value })} />
              </div>
            ))}
            <div>
              <label className="label">Date of Birth</label>
              <input className="input" type="date" value={form.date_of_birth ?? ''} onChange={e => setForm({ ...form, date_of_birth: e.target.value })} />
            </div>
            <div>
              <label className="label">Gender</label>
              <select className="input" value={form.gender ?? ''} onChange={e => setForm({ ...form, gender: e.target.value })}>
                <option value="">Select</option>
                <option>Male</option><option>Female</option>
              </select>
            </div>
            <div>
              <label className="label">Role</label>
              <select className="input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.membership_status} onChange={e => setForm({ ...form, membership_status: e.target.value })}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginTop: 20 }}>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={saveMember} disabled={saving}>
              {saving ? 'Saving…' : (editing ? 'Update Member' : 'Add Member')}
            </button>
          </div>
        </Modal>
      )}

      {/* View Member Modal */}
      {modal === 'view' && selected && (
        <Modal title="Member Profile" onClose={() => setModal(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ textAlign: 'center', padding: '16px 0 20px' }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 800, fontSize: 26, margin: '0 auto 12px',
              }}>
                {selected.first_name[0]}{selected.last_name[0]}
              </div>
              <div style={{ fontWeight: 800, fontSize: 20 }}>{selected.first_name} {selected.last_name}</div>
              <div style={{ marginTop: 6, display: 'flex', gap: 8, justifyContent: 'center' }}>
                <span className="badge badge-purple">{selected.role}</span>
                {statusBadge(selected.membership_status)}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {([
                ['Gender', selected.gender],
                ['Phone', selected.phone],
                ['Email', selected.email],
                ['Occupation', selected.occupation],
                ['Address', selected.address],
                ['Date of Birth', selected.date_of_birth],
              ] as const).filter(([, v]) => v).map(([label, value]) => (
                <div key={label} style={{ background: '#f8fafc', borderRadius: 8, padding: '10px 14px' }}>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
                  <div style={{ fontWeight: 600, marginTop: 2 }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {/* Add Family Modal */}
      {modal === 'family' && (
        <Modal title="Add Family" onClose={() => setModal(null)} size="lg">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label className="label">Family Name</label>
              <input className="input" placeholder="e.g. Mensah" value={familyForm.family_name}
                onChange={e => setFamilyForm({ ...familyForm, family_name: e.target.value })} />
            </div>
            <div style={{ fontWeight: 700, fontSize: 14, marginTop: 4 }}>Family Members</div>
            {familyForm.members.map((m, i) => (
              <div key={i} style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {(['first_name', 'last_name', 'phone', 'gender'] as const).map(key => (
                    <div key={key}>
                      <label className="label">{key.replace('_', ' ')}</label>
                      <input className="input" value={m[key] ?? ''}
                        onChange={e => {
                          const updated = [...familyForm.members]
                          updated[i] = { ...updated[i], [key]: e.target.value }
                          setFamilyForm({ ...familyForm, members: updated })
                        }} />
                    </div>
                  ))}
                  <div>
                    <label className="label">Family Role</label>
                    <select className="input" value={m.family_role ?? ''}
                      onChange={e => {
                        const updated = [...familyForm.members]
                        updated[i] = { ...updated[i], family_role: e.target.value }
                        setFamilyForm({ ...familyForm, members: updated })
                      }}>
                      <option value="">Select</option>
                      <option>Head</option><option>Spouse</option><option>Child</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
            <button className="btn btn-ghost" style={{ alignSelf: 'flex-start' }}
              onClick={() => setFamilyForm({ ...familyForm, members: [...familyForm.members, {}] })}>
              <MdAdd /> Add Member
            </button>
            <button className="btn btn-success" style={{ width: '100%' }} onClick={saveFamily} disabled={saving}>
              {saving ? 'Saving…' : 'Create Family'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
