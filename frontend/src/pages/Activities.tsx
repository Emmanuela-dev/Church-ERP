import { useEffect, useState } from 'react'
import { activitiesAPI } from '../lib'
import type { Activity } from '../types'
import Modal from '../components/Modal'
import { MdAdd, MdEdit, MdDelete, MdCalendarMonth } from 'react-icons/md'

const CATEGORIES = ['Outreach', 'Conference', 'Youth', 'Prayer', 'Worship', 'Bible Study', 'Thanksgiving', 'Evangelism', 'Other']
const STATUSES = ['Upcoming', 'Ongoing', 'Completed', 'Cancelled']

const emptyActivity: Omit<Activity, 'id' | 'created_at'> = {
  title: '', description: null, category: null, date: null,
  time: null, venue: null, organizer: null, status: 'Upcoming',
}

function statusBadge(s: string) {
  const map: Record<string, string> = {
    Upcoming: 'badge-blue', Ongoing: 'badge-yellow', Completed: 'badge-green', Cancelled: 'badge-red',
  }
  return <span className={`badge ${map[s] ?? 'badge-gray'}`}>{s}</span>
}

function categoryColor(c: string | null): string {
  const map: Record<string, string> = {
    Outreach: '#4f46e5', Conference: '#0891b2', Youth: '#f59e0b',
    Prayer: '#7c3aed', Worship: '#db2777', 'Bible Study': '#16a34a',
    Thanksgiving: '#ea580c', Evangelism: '#dc2626', Other: '#475569',
  }
  return map[c ?? ''] ?? '#475569'
}

export default function Activities() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [filter, setFilter] = useState<string>('all')
  const [modal, setModal] = useState<'form' | null>(null)
  const [form, setForm] = useState<Omit<Activity, 'id' | 'created_at'>>(emptyActivity)
  const [editing, setEditing] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const load = () => activitiesAPI.getAll().then(setActivities)
  useEffect(() => { load() }, [])

  const save = async () => {
    setSaving(true)
    if (editing) await activitiesAPI.update(editing, form)
    else await activitiesAPI.create(form)
    setModal(null); setForm(emptyActivity); setEditing(null); setSaving(false); load()
  }

  const del = async (id: string) => { await activitiesAPI.delete(id); load() }

  const filtered = filter === 'all' ? activities : activities.filter(a => a.status === filter)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Activities</h1>
          <p className="page-subtitle">{activities.length} total activities</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm(emptyActivity); setEditing(null); setModal('form') }}>
          <MdAdd /> Add Activity
        </button>
      </div>

      {/* Status filter */}
      <div className="tab-bar">
        {(['all', ...STATUSES]).map(s => (
          <button key={s} className={`tab-btn${filter === s ? ' active' : ''}`} onClick={() => setFilter(s)}>
            {s === 'all' ? 'All' : s}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🗓️</div>
          <div className="empty-state-text">No activities found</div>
          <div className="empty-state-sub">Change the filter or add a new one</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {filtered.map(a => (
            <div key={a.id} className="card hover-lift" style={{ overflow: 'hidden' }}>
              {/* Color stripe */}
              <div style={{ height: 5, background: categoryColor(a.category) }} />
              <div style={{ padding: '16px 18px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: 15 }}>{a.title}</h3>
                    {a.category && (
                      <span style={{ fontSize: 11, fontWeight: 600, color: categoryColor(a.category), background: `${categoryColor(a.category)}18`, padding: '2px 8px', borderRadius: 99, marginTop: 4, display: 'inline-block' }}>
                        {a.category}
                      </span>
                    )}
                  </div>
                  {statusBadge(a.status)}
                </div>

                {a.description && <p style={{ fontSize: 13, color: '#64748b', marginBottom: 10, lineHeight: 1.5 }}>{a.description}</p>}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {a.date && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b' }}>
                      <MdCalendarMonth />{a.date} {a.time && `· ${a.time}`}
                    </div>
                  )}
                  {a.venue && <div style={{ fontSize: 13, color: '#64748b' }}>📍 {a.venue}</div>}
                  {a.organizer && <div style={{ fontSize: 13, color: '#64748b' }}>👤 {a.organizer}</div>}
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 14, justifyContent: 'flex-end' }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => { setForm({ ...a }); setEditing(a.id); setModal('form') }}>
                    <MdEdit /> Edit
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => del(a.id)}>
                    <MdDelete />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {modal === 'form' && (
        <Modal title={editing ? 'Edit Activity' : 'Add Activity'} onClose={() => setModal(null)} size="lg">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="label">Title</label>
              <input className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="label">Category</label>
              <select className="input" value={form.category ?? ''} onChange={e => setForm({ ...form, category: e.target.value })}>
                <option value="">Select</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Date</label>
              <input className="input" type="date" value={form.date ?? ''} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
            <div>
              <label className="label">Time</label>
              <input className="input" type="time" value={form.time ?? ''} onChange={e => setForm({ ...form, time: e.target.value })} />
            </div>
            <div>
              <label className="label">Venue</label>
              <input className="input" value={form.venue ?? ''} onChange={e => setForm({ ...form, venue: e.target.value })} />
            </div>
            <div>
              <label className="label">Organizer</label>
              <input className="input" value={form.organizer ?? ''} onChange={e => setForm({ ...form, organizer: e.target.value })} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="label">Description</label>
              <textarea className="input" rows={3} style={{ resize: 'vertical' }} value={form.description ?? ''}
                onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>
          <div style={{ marginTop: 20 }}>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={save} disabled={saving}>
              {saving ? 'Saving…' : (editing ? 'Update Activity' : 'Create Activity')}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
