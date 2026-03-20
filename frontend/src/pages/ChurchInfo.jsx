import { useEffect, useState } from 'react'
import { churchAPI } from '../api'
import Modal from '../components/Modal'

const emptyChurch = { name: '', motto: '', vision: '', mission: '', address: '', city: '', country: '', phone: '', email: '', website: '', founded_year: '', pastor: '' }
const emptyService = { name: '', day: '', time: '', description: '', order_of_service: [] }

export default function ChurchInfo() {
  const [church, setChurch] = useState(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(emptyChurch)
  const [serviceModal, setServiceModal] = useState(false)
  const [serviceForm, setServiceForm] = useState(emptyService)
  const [orderInput, setOrderInput] = useState('')

  const load = () => churchAPI.get().then(r => setChurch(r.data)).catch(() => setChurch(null))
  useEffect(() => { load() }, [])

  const saveChurch = async () => {
    if (church) await churchAPI.update(church.id, form)
    else await churchAPI.create(form)
    setEditing(false); load()
  }

  const addService = async () => {
    await churchAPI.addService(church.id, serviceForm)
    setServiceModal(false); setServiceForm(emptyService); setOrderInput(''); load()
  }

  const deleteService = async (id) => {
    await churchAPI.deleteService(id); load()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Church Information</h1>
        <button onClick={() => { setForm(church || emptyChurch); setEditing(true) }}
          className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800">
          {church ? 'Edit Info' : 'Setup Church'}
        </button>
      </div>

      {church ? (
        <div className="bg-white rounded-xl shadow p-6 space-y-3">
          <h2 className="text-xl font-bold text-blue-900">{church.name}</h2>
          <p className="italic text-gray-500">{church.motto}</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="font-medium">Pastor:</span> {church.pastor}</div>
            <div><span className="font-medium">Founded:</span> {church.founded_year}</div>
            <div><span className="font-medium">Address:</span> {church.address}, {church.city}, {church.country}</div>
            <div><span className="font-medium">Phone:</span> {church.phone}</div>
            <div><span className="font-medium">Email:</span> {church.email}</div>
            <div><span className="font-medium">Website:</span> {church.website}</div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div><p className="font-medium">Vision</p><p className="text-sm text-gray-600">{church.vision}</p></div>
            <div><p className="font-medium">Mission</p><p className="text-sm text-gray-600">{church.mission}</p></div>
          </div>

          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-lg">Services</h3>
              <button onClick={() => setServiceModal(true)} className="text-sm bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700">+ Add Service</button>
            </div>
            <div className="space-y-3">
              {church.services?.map(s => (
                <div key={s.id} className="border rounded-lg p-4">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">{s.name} — {s.day} @ {s.time}</p>
                      <p className="text-sm text-gray-500">{s.description}</p>
                    </div>
                    <button onClick={() => deleteService(s.id)} className="text-red-500 hover:text-red-700 text-sm">Delete</button>
                  </div>
                  {s.order_of_service?.length > 0 && (
                    <ol className="mt-2 list-decimal list-inside text-sm text-gray-700 space-y-1">
                      {s.order_of_service.map(o => <li key={o.id}>{o.item}</li>)}
                    </ol>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : <p className="text-gray-500">No church info yet. Click "Setup Church" to get started.</p>}

      {editing && (
        <Modal title={church ? 'Edit Church Info' : 'Setup Church'} onClose={() => setEditing(false)}>
          <div className="space-y-3">
            {Object.keys(emptyChurch).map(key => (
              <div key={key}>
                <label className="text-sm font-medium capitalize">{key.replace('_', ' ')}</label>
                {['vision', 'mission'].includes(key)
                  ? <textarea className="w-full border rounded p-2 text-sm mt-1" rows={3} value={form[key] || ''} onChange={e => setForm({ ...form, [key]: e.target.value })} />
                  : <input className="w-full border rounded p-2 text-sm mt-1" value={form[key] || ''} onChange={e => setForm({ ...form, [key]: e.target.value })} />
                }
              </div>
            ))}
            <button onClick={saveChurch} className="w-full bg-blue-700 text-white py-2 rounded-lg hover:bg-blue-800">Save</button>
          </div>
        </Modal>
      )}

      {serviceModal && (
        <Modal title="Add Service" onClose={() => setServiceModal(false)}>
          <div className="space-y-3">
            {['name', 'day', 'time', 'description'].map(key => (
              <div key={key}>
                <label className="text-sm font-medium capitalize">{key}</label>
                <input className="w-full border rounded p-2 text-sm mt-1" value={serviceForm[key] || ''}
                  onChange={e => setServiceForm({ ...serviceForm, [key]: e.target.value })} />
              </div>
            ))}
            <div>
              <label className="text-sm font-medium">Order of Service (one item per line)</label>
              <textarea className="w-full border rounded p-2 text-sm mt-1" rows={5} value={orderInput}
                onChange={e => { setOrderInput(e.target.value); setServiceForm({ ...serviceForm, order_of_service: e.target.value.split('\n').filter(Boolean) }) }} />
            </div>
            <button onClick={addService} className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">Add Service</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
