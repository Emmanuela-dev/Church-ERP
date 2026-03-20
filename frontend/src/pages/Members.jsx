import { useEffect, useState } from 'react'
import { membersAPI } from '../api'
import Modal from '../components/Modal'

const emptyMember = { first_name: '', last_name: '', gender: '', date_of_birth: '', phone: '', email: '', address: '', occupation: '', role: 'Member', membership_status: 'Active', family_role: '' }

export default function Members() {
  const [tab, setTab] = useState('members')
  const [members, setMembers] = useState([])
  const [families, setFamilies] = useState([])
  const [modal, setModal] = useState(null) // 'member' | 'family' | 'view'
  const [form, setForm] = useState(emptyMember)
  const [editing, setEditing] = useState(null)
  const [selected, setSelected] = useState(null)
  const [familyForm, setFamilyForm] = useState({ family_name: '', members: [] })
  const [search, setSearch] = useState('')

  const load = () => {
    membersAPI.getAll().then(r => setMembers(r.data))
    membersAPI.getFamilies().then(r => setFamilies(r.data))
  }
  useEffect(() => { load() }, [])

  const saveMember = async () => {
    if (editing) await membersAPI.update(editing, form)
    else await membersAPI.create(form)
    setModal(null); setForm(emptyMember); setEditing(null); load()
  }

  const deleteMember = async (id) => { await membersAPI.delete(id); load() }
  const deleteFamily = async (id) => { await membersAPI.deleteFamily(id); load() }

  const saveFamily = async () => {
    await membersAPI.createFamily(familyForm)
    setModal(null); setFamilyForm({ family_name: '', members: [] }); load()
  }

  const addFamilyMember = () => setFamilyForm({ ...familyForm, members: [...familyForm.members, { ...emptyMember }] })
  const updateFamilyMember = (i, key, val) => {
    const updated = [...familyForm.members]
    updated[i] = { ...updated[i], [key]: val }
    setFamilyForm({ ...familyForm, members: updated })
  }

  const filtered = members.filter(m =>
    `${m.first_name} ${m.last_name}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Members</h1>
        <div className="flex gap-2">
          <button onClick={() => { setForm(emptyMember); setEditing(null); setModal('member') }}
            className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800">+ Add Member</button>
          <button onClick={() => { setFamilyForm({ family_name: '', members: [] }); setModal('family') }}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">+ Add Family</button>
        </div>
      </div>

      <div className="flex gap-4 border-b">
        {['members', 'families'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`pb-2 px-1 capitalize font-medium ${tab === t ? 'border-b-2 border-blue-700 text-blue-700' : 'text-gray-500'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'members' && (
        <>
          <input placeholder="Search members..." value={search} onChange={e => setSearch(e.target.value)}
            className="border rounded-lg px-4 py-2 w-full max-w-sm" />
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>{['Name', 'Gender', 'Phone', 'Role', 'Status', 'Actions'].map(h => <th key={h} className="text-left px-4 py-3">{h}</th>)}</tr>
              </thead>
              <tbody>
                {filtered.map(m => (
                  <tr key={m.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{m.first_name} {m.last_name}</td>
                    <td className="px-4 py-3">{m.gender}</td>
                    <td className="px-4 py-3">{m.phone}</td>
                    <td className="px-4 py-3">{m.role}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${m.membership_status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {m.membership_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex gap-2">
                      <button onClick={() => { setSelected(m); setModal('view') }} className="text-blue-600 hover:underline">View</button>
                      <button onClick={() => { setForm(m); setEditing(m.id); setModal('member') }} className="text-yellow-600 hover:underline">Edit</button>
                      <button onClick={() => deleteMember(m.id)} className="text-red-500 hover:underline">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'families' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {families.map(f => (
            <div key={f.id} className="bg-white rounded-xl shadow p-4">
              <div className="flex justify-between">
                <h3 className="font-bold text-blue-900">{f.family_name} Family</h3>
                <button onClick={() => deleteFamily(f.id)} className="text-red-500 text-sm hover:underline">Delete</button>
              </div>
              {f.head && <p className="text-sm mt-1"><span className="font-medium">Head:</span> {f.head.first_name} {f.head.last_name}</p>}
              {f.spouse && <p className="text-sm"><span className="font-medium">Spouse:</span> {f.spouse.first_name} {f.spouse.last_name}</p>}
              {f.children?.length > 0 && (
                <p className="text-sm"><span className="font-medium">Children:</span> {f.children.map(c => `${c.first_name} ${c.last_name}`).join(', ')}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {modal === 'member' && (
        <Modal title={editing ? 'Edit Member' : 'Add Member'} onClose={() => setModal(null)}>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {['first_name', 'last_name', 'phone', 'email', 'address', 'occupation', 'date_of_birth'].map(key => (
                <div key={key}>
                  <label className="text-xs font-medium capitalize">{key.replace('_', ' ')}</label>
                  <input type={key === 'date_of_birth' ? 'date' : 'text'} className="w-full border rounded p-2 text-sm mt-1"
                    value={form[key] || ''} onChange={e => setForm({ ...form, [key]: e.target.value })} />
                </div>
              ))}
              <div>
                <label className="text-xs font-medium">Gender</label>
                <select className="w-full border rounded p-2 text-sm mt-1" value={form.gender || ''} onChange={e => setForm({ ...form, gender: e.target.value })}>
                  <option value="">Select</option>
                  <option>Male</option><option>Female</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium">Role</label>
                <select className="w-full border rounded p-2 text-sm mt-1" value={form.role || 'Member'} onChange={e => setForm({ ...form, role: e.target.value })}>
                  {['Member', 'Deacon', 'Elder', 'Pastor', 'Usher', 'Choir'].map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium">Status</label>
                <select className="w-full border rounded p-2 text-sm mt-1" value={form.membership_status || 'Active'} onChange={e => setForm({ ...form, membership_status: e.target.value })}>
                  {['Active', 'Inactive', 'Transferred'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <button onClick={saveMember} className="w-full bg-blue-700 text-white py-2 rounded-lg hover:bg-blue-800">Save</button>
          </div>
        </Modal>
      )}

      {modal === 'view' && selected && (
        <Modal title="Member Details" onClose={() => setModal(null)}>
          <div className="space-y-2 text-sm">
            {Object.entries(selected).filter(([k]) => k !== 'id').map(([k, v]) => (
              <div key={k} className="flex gap-2">
                <span className="font-medium capitalize w-36">{k.replace('_', ' ')}:</span>
                <span className="text-gray-700">{v || '—'}</span>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {modal === 'family' && (
        <Modal title="Add Family" onClose={() => setModal(null)}>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Family Name</label>
              <input className="w-full border rounded p-2 text-sm mt-1" value={familyForm.family_name}
                onChange={e => setFamilyForm({ ...familyForm, family_name: e.target.value })} />
            </div>
            {familyForm.members.map((m, i) => (
              <div key={i} className="border rounded p-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  {['first_name', 'last_name', 'phone', 'gender'].map(key => (
                    <div key={key}>
                      <label className="text-xs capitalize">{key.replace('_', ' ')}</label>
                      <input className="w-full border rounded p-1 text-sm mt-1" value={m[key] || ''}
                        onChange={e => updateFamilyMember(i, key, e.target.value)} />
                    </div>
                  ))}
                  <div>
                    <label className="text-xs">Family Role</label>
                    <select className="w-full border rounded p-1 text-sm mt-1" value={m.family_role || ''}
                      onChange={e => updateFamilyMember(i, 'family_role', e.target.value)}>
                      <option value="">Select</option>
                      <option>Head</option><option>Spouse</option><option>Child</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
            <button onClick={addFamilyMember} className="text-sm text-blue-600 hover:underline">+ Add Family Member</button>
            <button onClick={saveFamily} className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">Save Family</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
