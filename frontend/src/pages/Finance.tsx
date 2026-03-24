import { useEffect, useState } from 'react'
import { financeAPI, membersAPI } from '../lib'
import type { Finance, FinanceSummary, Member } from '../types'
import Modal from '../components/Modal'
import { MdAdd, MdDelete, MdEdit, MdAttachMoney } from 'react-icons/md'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'

const TYPES = ['Tithe', 'Offering', 'Donation', 'Pledge']
const CURRENCIES = ['GHS', 'USD', 'EUR', 'GBP', 'NGN']
const PIE_COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b']

const emptyEntry: Omit<Finance, 'id' | 'created_at' | 'member'> = {
  type: 'Tithe', amount: 0, currency: 'KHS',
  member_id: null, is_anonymous: false, date: new Date().toISOString().slice(0, 10),
  recorded_by: null, notes: null,
}

function typeBadge(t: string) {
  const map: Record<string, string> = {
    Tithe: 'badge-purple', Offering: 'badge-blue', Donation: 'badge-green', Pledge: 'badge-yellow',
  }
  return <span className={`badge ${map[t] ?? 'badge-gray'}`}>{t}</span>
}

export default function Finance() {
  const [entries, setEntries] = useState<Finance[]>([])
  const [summary, setSummary] = useState<FinanceSummary>({ Tithe: 0, Offering: 0, Donation: 0, Pledge: 0 })
  const [members, setMembers] = useState<Member[]>([])
  const [filter, setFilter] = useState('all')
  const [modal, setModal] = useState<'form' | null>(null)
  const [form, setForm] = useState<Omit<Finance, 'id' | 'created_at' | 'member'>>(emptyEntry)
  const [editing, setEditing] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    const [e, s, m] = await Promise.all([
      financeAPI.getAll(), financeAPI.summary(), membersAPI.getAll(),
    ])
    setEntries(e); setSummary(s); setMembers(m)
  }
  useEffect(() => { load() }, [])

  const save = async () => {
    setSaving(true)
    if (editing) await financeAPI.update(editing, form)
    else await financeAPI.create(form)
    setModal(null); setForm(emptyEntry); setEditing(null); setSaving(false); load()
  }

  const del = async (id: string) => { await financeAPI.delete(id); load() }

  const filtered = filter === 'all' ? entries : entries.filter(e => e.type === filter)
  const totalAll = Object.values(summary).reduce((a, b) => a + b, 0)

  const barData = TYPES.map(type => ({ type, amount: summary[type] ?? 0 }))
  const pieData = TYPES.filter(t => (summary[t] ?? 0) > 0).map(name => ({ name, value: summary[name] }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Finance</h1>
          <p className="page-subtitle">Track tithes, offerings, donations & pledges</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm(emptyEntry); setEditing(null); setModal('form') }}>
          <MdAdd /> Record Entry
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
        <div className="stat-card" style={{ background: 'linear-gradient(135deg,#0f172a,#1e1b4b)' }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>Total Collected</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#fff' }}>GHS {totalAll.toLocaleString()}</div>
          <MdAttachMoney style={{ fontSize: 28, color: 'rgba(255,255,255,0.3)', marginTop: 4 }} />
        </div>
        {TYPES.map((type, i) => (
          <div key={type} className="stat-card" style={{ background: [
            'linear-gradient(135deg,#4f46e5,#7c3aed)',
            'linear-gradient(135deg,#0891b2,#06b6d4)',
            'linear-gradient(135deg,#059669,#10b981)',
            'linear-gradient(135deg,#d97706,#f59e0b)',
          ][i] }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{type}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>GHS {(summary[type] ?? 0).toLocaleString()}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      {totalAll > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="card card-pad">
            <h2 style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Contributions by Type</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData} margin={{ left: -10 }}>
                <XAxis dataKey="type" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => `GHS ${v.toLocaleString()}`} />
                <Bar dataKey="amount" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card card-pad">
            <h2 style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Distribution</h2>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70}>
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Legend />
                <Tooltip formatter={(v: number) => `GHS ${v.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="tab-bar">
        {(['all', ...TYPES]).map(t => (
          <button key={t} className={`tab-btn${filter === t ? ' active' : ''}`} onClick={() => setFilter(t)}>
            {t === 'all' ? 'All' : t}
          </button>
        ))}
      </div>

      {/* Ledger Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <table className="table">
          <thead>
            <tr>{['Date', 'Type', 'Member', 'Amount', 'Currency', 'Recorded By', 'Notes', 'Actions'].map(h => <th key={h}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <div className="empty-state">
                    <div className="empty-state-icon">💰</div>
                    <div className="empty-state-text">No records found</div>
                  </div>
                </td>
              </tr>
            ) : filtered.map(e => {
              const m = e.member ?? (members.find(mm => mm.id === e.member_id))
              const memberName = e.is_anonymous ? 'Anonymous' : (m ? `${(m as Member).first_name} ${(m as Member).last_name}` : '—')
              return (
                <tr key={e.id}>
                  <td>{e.date ?? '—'}</td>
                  <td>{typeBadge(e.type)}</td>
                  <td>{memberName}</td>
                  <td style={{ fontWeight: 700, color: '#059669' }}>{Number(e.amount).toLocaleString()}</td>
                  <td>{e.currency}</td>
                  <td>{e.recorded_by ?? '—'}</td>
                  <td style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.notes ?? '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => {
                        setForm({ type: e.type, amount: e.amount, currency: e.currency, member_id: e.member_id, is_anonymous: e.is_anonymous, date: e.date, recorded_by: e.recorded_by, notes: e.notes })
                        setEditing(e.id); setModal('form')
                      }}><MdEdit /></button>
                      <button className="btn btn-danger btn-sm btn-icon" onClick={() => del(e.id)}><MdDelete /></button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Form Modal */}
      {modal === 'form' && (
        <Modal title={editing ? 'Edit Entry' : 'Record Contribution'} onClose={() => setModal(null)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label className="label">Type</label>
              <select className="input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                {TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Amount</label>
              <input className="input" type="number" min={0} value={form.amount}
                onChange={e => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })} />
            </div>
            <div>
              <label className="label">Currency</label>
              <select className="input" value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })}>
                {CURRENCIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Date</label>
              <input className="input" type="date" value={form.date ?? ''} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="label">Member</label>
              <select className="input" value={form.member_id ?? ''} onChange={e => setForm({ ...form, member_id: e.target.value || null, is_anonymous: false })}>
                <option value="">Anonymous</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Recorded By</label>
              <input className="input" value={form.recorded_by ?? ''} onChange={e => setForm({ ...form, recorded_by: e.target.value })} />
            </div>
            <div>
              <label className="label">Notes</label>
              <input className="input" value={form.notes ?? ''} onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <div style={{ marginTop: 20 }}>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={save} disabled={saving}>
              {saving ? 'Saving…' : (editing ? 'Update Entry' : 'Record Contribution')}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
