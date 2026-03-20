import { useEffect, useState } from 'react'
import { activitiesAPI } from '../api'
import Modal from '../components/Modal'

const empty = { title: '', description: '', category: '', date: '', start_time: '', end_time: '', venue: '', organizer: '', status: 'Upcoming' }
const categories = ['Outreach', 'Conference', 'Youth', 'Prayer', 'Worship', 'Bible Study', 'Other']
const statuses = ['Upcoming', 'Ongoing', 'Completed', 'Cancelled']

export default function Activities() {
  const [activities, setActivities] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState(null)
  const [filter, setFilter] = useState('')

  const load = () => activitiesAPI.getAll(filter || undefined).then(r => setActivities(r.data))
  useEffect(() => { load() }, [filter])

  const save = async () => {
    if (editing) await activitiesAPI.update(editing, form)
    else await activitiesAPI.create(form)
    setModal(false); setForm(empty); setEditing(null); load()
  }

  const del = async (id) => { await activitiesAPI.delete(id); load() }

  const statusColor = { Upcoming: 'bg-blue-100 text-blue-700', Ongoing: 'bg-yellow-100 text-yellow-700', Completed: 'bg-green-100 text-green-700', Cancelled: 'bg-red-100 text-red-700' }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Activities</h1>
        <button onClick={() => { setForm(empty); setEditing(null); setModal(true) }}
          className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800">+ Add Activity</button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['', ...statuses].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1 rounded-full text-sm border ${filter === s ? 'bg-blue-700 text-white border-blue-700' : 'border-gray-300 text-gray-600 hover:bg-gray-100'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activities.map(a => (
          <div key={a.id} className="bg-white rounded-xl shadow p-4 space-y-1">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-blue-900">{a.title}</h3>
              <span className={`text-xs px-2 py-1 rounded-full ${statusColor[a.status]}`}>{a.status}</span>
            </div>
            <p className="text-sm text-gray-500">{a.category} • {a.date}</p>
            <p className="text-sm">{a.venue} {a.start_time && `• ${a.start_time} - ${a.end_time}`}</p>
            <p className="text-sm text-gray-600">{a.description}</p>
            <p className="text-xs text-gray-400">Organizer: {a.organizer}</p>
            <div className="flex gap-3 pt-1">
              <button onClick={() => { setForm(a); setEditing(a.id); setModal(true) }} className="text-yellow-600 text-sm hover:underline">Edit</button>
              <button onClick={() => del(a.id)} className="text-red-500 text-sm hover:underline">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <Modal title={editing ? 'Edit Activity' : 'Add Activity'} onClose={() => setModal(false)}>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {['title', 'venue', 'organizer', 'start_time', 'end_time'].map(key => (
                <div key={key}>
                  <label className="text-xs font-medium capitalize">{key.replace('_', ' ')}</label>
                  <input className="w-full border rounded p-2 text-sm mt-1" value={form[key] || ''}
                    onChange={e => setForm({ ...form, [key]: e.target.value })} />
                </div>
              ))}
              <div>
                <label className="text-xs font-medium">Date</label>
                <input type="date" className="w-full border rounded p-2 text-sm mt-1" value={form.date || ''}
                  onChange={e => setForm({ ...form, date: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium">Category</label>
                <select className="w-full border rounded p-2 text-sm mt-1" value={form.category || ''}
                  onChange={e => setForm({ ...form, category: e.target.value })}>
                  <option value="">Select</option>
                  {categories.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium">Status</label>
                <select className="w-full border rounded p-2 text-sm mt-1" value={form.status || 'Upcoming'}
                  onChange={e => setForm({ ...form, status: e.target.value })}>
                  {statuses.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium">Description</label>
              <textarea className="w-full border rounded p-2 text-sm mt-1" rows={3} value={form.description || ''}
                onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <button onClick={save} className="w-full bg-blue-700 text-white py-2 rounded-lg hover:bg-blue-800">Save</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
