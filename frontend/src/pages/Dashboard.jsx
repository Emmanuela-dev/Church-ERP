import { useEffect, useState } from 'react'
import { churchAPI, membersAPI, activitiesAPI, financeAPI } from '../api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function Dashboard() {
  const [stats, setStats] = useState({ members: 0, families: 0, activities: 0 })
  const [summary, setSummary] = useState({})
  const [church, setChurch] = useState(null)

  useEffect(() => {
    Promise.all([
      membersAPI.getAll(), membersAPI.getFamilies(),
      activitiesAPI.getAll(), financeAPI.summary(), churchAPI.get()
    ]).then(([m, f, a, fin, c]) => {
      setStats({ members: m.data.length, families: f.data.length, activities: a.data.length })
      setSummary(fin.data)
      setChurch(c.data)
    }).catch(() => {})
  }, [])

  const financeData = Object.entries(summary).map(([type, total]) => ({ type, total }))

  return (
    <div className="space-y-6">
      {church && (
        <div className="bg-blue-900 text-white rounded-xl p-6">
          <h1 className="text-2xl font-bold">{church.name}</h1>
          <p className="text-blue-200">{church.motto}</p>
          <p className="text-sm mt-1">{church.address}, {church.city}, {church.country}</p>
          <p className="text-sm">Pastor: {church.pastor}</p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Members', value: stats.members, color: 'bg-blue-100 text-blue-800' },
          { label: 'Families', value: stats.families, color: 'bg-green-100 text-green-800' },
          { label: 'Activities', value: stats.activities, color: 'bg-purple-100 text-purple-800' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`rounded-xl p-5 ${color}`}>
            <p className="text-sm font-medium">{label}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
          </div>
        ))}
      </div>

      {financeData.length > 0 && (
        <div className="bg-white rounded-xl p-5 shadow">
          <h2 className="font-semibold mb-4">Finance Summary</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={financeData}>
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="#1e40af" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
