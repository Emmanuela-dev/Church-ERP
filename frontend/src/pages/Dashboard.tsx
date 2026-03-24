import { useEffect, useState } from 'react'
import { churchAPI, membersAPI, activitiesAPI, financeAPI } from '../lib'
import { MdGroup, MdFamilyRestroom, MdEvent, MdAttachMoney, MdLocationOn, MdPerson } from 'react-icons/md'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import type { ChurchInfo, FinanceSummary } from '../types'
import StatCard from '../components/StatCard'

const PIE_COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b']

export default function Dashboard() {
  const [stats, setStats] = useState({ members: 0, families: 0, activities: 0, total: 0 })
  const [summary, setSummary] = useState<FinanceSummary>({ Tithe: 0, Offering: 0, Donation: 0, Pledge: 0 })
  const [church, setChurch] = useState<ChurchInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      membersAPI.getAll(),
      membersAPI.getFamilies(),
      activitiesAPI.getAll(),
      financeAPI.summary(),
      churchAPI.get(),
    ]).then(([m, f, a, fin, c]) => {
      const total = Object.values(fin).reduce((s, v) => s + v, 0)
      setStats({ members: m.length, families: f.length, activities: a.length, total })
      setSummary(fin)
      setChurch(c)
    }).finally(() => setLoading(false))
  }, [])

  const barData = Object.entries(summary).map(([type, total]) => ({ type, total }))
  const pieData = Object.entries(summary)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }))

  const statCards = [
    { label: 'Total Members',   value: stats.members,    icon: <MdGroup />,         gradient: 'linear-gradient(135deg,#4f46e5,#7c3aed)' },
    { label: 'Families',        value: stats.families,   icon: <MdFamilyRestroom />, gradient: 'linear-gradient(135deg,#0891b2,#06b6d4)' },
    { label: 'Activities',      value: stats.activities, icon: <MdEvent />,          gradient: 'linear-gradient(135deg,#059669,#10b981)' },
    { label: 'Total Finance',   value: `GHS ${stats.total.toLocaleString()}`, icon: <MdAttachMoney />, gradient: 'linear-gradient(135deg,#d97706,#f59e0b)' },
  ]

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ textAlign: 'center', color: '#94a3b8' }}>
        <div style={{ fontSize: 48 }}>⛪</div>
        <div style={{ marginTop: 12, fontWeight: 600 }}>Loading dashboard…</div>
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Church Banner */}
      {church && (
        <div style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
          borderRadius: 16,
          padding: '28px 32px',
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at top right, rgba(79,70,229,0.3) 0%, transparent 65%)' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#818cf8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
              Church Profile
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px' }}>{church.name ?? 'Your Church'}</h1>
            {church.motto && <p style={{ color: '#a5b4fc', marginTop: 4, fontStyle: 'italic' }}>"{church.motto}"</p>}
            <div style={{ display: 'flex', gap: 24, marginTop: 16, flexWrap: 'wrap' }}>
              {church.pastor && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#94a3b8' }}>
                  <MdPerson /><span>Pastor {church.pastor}</span>
                </div>
              )}
              {(church.city || church.country) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#94a3b8' }}>
                  <MdLocationOn /><span>{[church.city, church.country].filter(Boolean).join(', ')}</span>
                </div>
              )}
              {church.founding_year && (
                <div style={{ fontSize: 14, color: '#94a3b8' }}>Est. {church.founding_year}</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        {statCards.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Charts */}
      {(barData.some(d => d.total > 0)) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="card card-pad">
            <h2 style={{ fontWeight: 700, fontSize: 16, marginBottom: 16, color: '#0f172a' }}>Finance by Type</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} margin={{ left: -10 }}>
                <XAxis dataKey="type" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => `GHS ${v.toLocaleString()}`} />
                <Bar dataKey="total" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {pieData.length > 0 && (
            <div className="card card-pad">
              <h2 style={{ fontWeight: 700, fontSize: 16, marginBottom: 16, color: '#0f172a' }}>Distribution</h2>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Legend />
                  <Tooltip formatter={(v: number) => `GHS ${v.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {!church && (
        <div className="card card-pad" style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⛪</div>
          <div style={{ fontWeight: 600, fontSize: 16 }}>Welcome to ChurchMS</div>
          <div style={{ fontSize: 14, marginTop: 4 }}>Start by setting up your Church Info</div>
        </div>
      )}
    </div>
  )
}
