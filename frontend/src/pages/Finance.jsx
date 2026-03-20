import { useEffect, useMemo, useState } from 'react'
import { financeAPI, membersAPI } from '../api'
import Modal from '../components/Modal'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ComposedChart,
  Line,
} from 'recharts'

const empty = { member_id: '', type: 'Tithe', amount: '', currency: 'USD', date: '', description: '', recorded_by: '' }
const types = ['Tithe', 'Offering', 'Donation', 'Pledge', 'Expense']
const COLORS = ['#1e40af', '#16a34a', '#d97706', '#dc2626', '#7c3aed']

const isExpense = (type = '') => type.toLowerCase() === 'expense'

const monthLabel = (date) =>
  date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })

const sundayLabel = (date) =>
  date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

const parseISODate = (value) => {
  if (!value) return null
  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime()) ? null : date
}

const getSundayOfWeek = (date) => {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - d.getDay())
  return d
}

export default function Finance() {
  const [records, setRecords] = useState([])
  const [members, setMembers] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState(null)
  const [filter, setFilter] = useState('')

  const load = () => {
    financeAPI.getAll().then(r => setRecords(r.data))
    membersAPI.getAll().then(r => setMembers(r.data))
  }
  useEffect(() => { load() }, [])

  const save = async () => {
    if (editing) await financeAPI.update(editing, form)
    else await financeAPI.create(form)
    setModal(false); setForm(empty); setEditing(null); load()
  }

  const del = async (id) => { await financeAPI.delete(id); load() }

  const filteredRecords = useMemo(
    () => (filter ? records.filter(r => r.type === filter) : records),
    [records, filter]
  )

  const totals = useMemo(() => {
    const byType = records.reduce((acc, record) => {
      const key = record.type || 'Other'
      acc[key] = (acc[key] || 0) + (record.amount || 0)
      return acc
    }, {})

    const income = records
      .filter(record => !isExpense(record.type))
      .reduce((sum, record) => sum + (record.amount || 0), 0)

    const expense = records
      .filter(record => isExpense(record.type))
      .reduce((sum, record) => sum + (record.amount || 0), 0)

    return {
      byType,
      income,
      expense,
      net: income - expense,
    }
  }, [records])

  const pieData = useMemo(
    () => Object.entries(totals.byType)
      .filter(([name]) => !isExpense(name))
      .map(([name, value]) => ({ name, value })),
    [totals.byType]
  )

  const weeklyData = useMemo(() => {
    const today = new Date()
    const thisSunday = getSundayOfWeek(today)
    const buckets = []

    for (let i = 7; i >= 0; i -= 1) {
      const sunday = new Date(thisSunday)
      sunday.setDate(thisSunday.getDate() - (i * 7))
      buckets.push({
        key: sunday.toISOString().slice(0, 10),
        label: sundayLabel(sunday),
        contributions: 0,
      })
    }

    const bucketMap = Object.fromEntries(buckets.map(b => [b.key, b]))
    records.forEach((record) => {
      if (isExpense(record.type)) return
      const date = parseISODate(record.date)
      if (!date) return
      const key = getSundayOfWeek(date).toISOString().slice(0, 10)
      if (bucketMap[key]) {
        bucketMap[key].contributions += record.amount || 0
      }
    })

    return buckets
  }, [records])

  const monthlyData = useMemo(() => {
    const today = new Date()
    const monthBuckets = []

    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      monthBuckets.push({
        key,
        label: monthLabel(d),
        contributions: 0,
        expenses: 0,
        net: 0,
      })
    }

    const bucketMap = Object.fromEntries(monthBuckets.map(b => [b.key, b]))

    records.forEach((record) => {
      const date = parseISODate(record.date)
      if (!date) return
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      if (!bucketMap[key]) return

      if (isExpense(record.type)) bucketMap[key].expenses += record.amount || 0
      else bucketMap[key].contributions += record.amount || 0
    })

    monthBuckets.forEach((bucket) => {
      bucket.net = bucket.contributions - bucket.expenses
    })

    return monthBuckets
  }, [records])

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Finance</h1>
        <button onClick={() => { setForm(empty); setEditing(null); setModal(true) }}
          className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800">+ Record</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {types.map((t, i) => (
          <div key={t} className="bg-white rounded-xl shadow p-4">
            <p className="text-sm text-gray-500">{t}</p>
            <p className="text-xl font-bold" style={{ color: COLORS[i] }}>{totals.byType[t]?.toFixed(2) || '0.00'}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow p-4 border-l-4 border-green-600">
          <p className="text-xs uppercase tracking-wide text-gray-500">Total Contributions</p>
          <p className="text-2xl font-bold text-green-700">{totals.income.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 border-l-4 border-red-600">
          <p className="text-xs uppercase tracking-wide text-gray-500">Total Expenses</p>
          <p className="text-2xl font-bold text-red-700">{totals.expense.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 border-l-4 border-blue-700">
          <p className="text-xs uppercase tracking-wide text-gray-500">Net Balance</p>
          <p className={`text-2xl font-bold ${totals.net < 0 ? 'text-red-700' : 'text-blue-700'}`}>{totals.net.toFixed(2)}</p>
        </div>
      </div>

      {pieData.length > 0 && (
        <div className="bg-white rounded-xl shadow p-4">
          <p className="font-semibold mb-2">Contribution Mix by Type</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip /><Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="bg-white rounded-xl shadow p-4">
        <p className="font-semibold mb-3">Weekly Contributions (Sunday to Saturday)</p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip formatter={(value) => Number(value).toFixed(2)} />
            <Bar dataKey="contributions" fill="#1e40af" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl shadow p-4">
        <p className="font-semibold mb-3">Monthly Contributions vs Expenses</p>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip formatter={(value) => Number(value).toFixed(2)} />
            <Legend />
            <Bar dataKey="contributions" name="Contributions" fill="#16a34a" radius={[6, 6, 0, 0]} />
            <Bar dataKey="expenses" name="Expenses" fill="#dc2626" radius={[6, 6, 0, 0]} />
            <Line type="monotone" dataKey="net" name="Net" stroke="#1e40af" strokeWidth={3} dot={{ r: 3 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="flex gap-2">
        {['', ...types].map(t => (
          <button key={t} onClick={() => setFilter(t)}
            className={`px-3 py-1 rounded-full text-sm border ${filter === t ? 'bg-blue-700 text-white border-blue-700' : 'border-gray-300 text-gray-600 hover:bg-gray-100'}`}>
            {t || 'All'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>{['Member', 'Type', 'Amount', 'Date', 'Recorded By', 'Actions'].map(h => <th key={h} className="text-left px-4 py-3">{h}</th>)}</tr>
          </thead>
          <tbody>
            {filteredRecords.map(r => (
              <tr key={r.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">{r.member_name}</td>
                <td className="px-4 py-3"><span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">{r.type}</span></td>
                <td className="px-4 py-3 font-medium">{r.currency} {r.amount?.toFixed(2)}</td>
                <td className="px-4 py-3">{r.date}</td>
                <td className="px-4 py-3">{r.recorded_by}</td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => { setForm({ ...r, member_id: r.member_id || '' }); setEditing(r.id); setModal(true) }} className="text-yellow-600 hover:underline">Edit</button>
                  <button onClick={() => del(r.id)} className="text-red-500 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title={editing ? 'Edit Record' : 'Add Finance Record'} onClose={() => setModal(false)}>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium">Member (optional)</label>
              <select className="w-full border rounded p-2 text-sm mt-1" value={form.member_id || ''}
                onChange={e => setForm({ ...form, member_id: e.target.value })}>
                <option value="">Anonymous</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium">Type</label>
                <select className="w-full border rounded p-2 text-sm mt-1" value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value })}>
                  {types.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium">Amount</label>
                <input type="number" className="w-full border rounded p-2 text-sm mt-1" value={form.amount || ''}
                  onChange={e => setForm({ ...form, amount: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium">Currency</label>
                <input className="w-full border rounded p-2 text-sm mt-1" value={form.currency || 'USD'}
                  onChange={e => setForm({ ...form, currency: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium">Date</label>
                <input type="date" className="w-full border rounded p-2 text-sm mt-1" value={form.date || ''}
                  onChange={e => setForm({ ...form, date: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium">Recorded By</label>
                <input className="w-full border rounded p-2 text-sm mt-1" value={form.recorded_by || ''}
                  onChange={e => setForm({ ...form, recorded_by: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium">Description</label>
              <input className="w-full border rounded p-2 text-sm mt-1" value={form.description || ''}
                onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <button onClick={save} className="w-full bg-blue-700 text-white py-2 rounded-lg hover:bg-blue-800">Save</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
