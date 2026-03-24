import { useEffect, useState } from 'react'
import { churchAPI } from '../lib'
import type { ChurchInfo, ChurchService } from '../types'
import Modal from '../components/Modal'
import { MdEdit, MdAdd, MdDelete } from 'react-icons/md'

const emptyChurch: Partial<ChurchInfo> = {
  name: '', motto: '', vision: '', mission: '',
  address: '', city: '', country: '', phone: '',
  email: '', website: '', founding_year: undefined, pastor: '',
}

export default function ChurchInfoPage() {
  const [church, setChurch] = useState<ChurchInfo | null>(null)
  const [services, setServices] = useState<ChurchService[]>([])
  const [form, setForm] = useState<Partial<ChurchInfo>>(emptyChurch)
  const [modal, setModal] = useState<'church' | 'service' | null>(null)
  const [svcForm, setSvcForm] = useState<Partial<ChurchService>>({ name: '', day: '', time: '' })
  const [editSvc, setEditSvc] = useState<ChurchService | null>(null)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    const c = await churchAPI.get()
    setChurch(c)
    if (c) {
      const svcs = await churchAPI.getServices(c.id)
      setServices(svcs)
    }
  }
  useEffect(() => { load() }, [])

  const saveChurch = async () => {
    setSaving(true)
    await churchAPI.upsert(form)
    setModal(null)
    setSaving(false)
    load()
  }

  const saveService = async () => {
    if (!church) return
    setSaving(true)
    if (editSvc) {
      await churchAPI.updateService(editSvc.id, svcForm)
    } else {
      await churchAPI.addService({ ...svcForm, church_id: church.id } as Omit<ChurchService, 'id' | 'created_at'>)
    }
    setSvcForm({ name: '', day: '', time: '' })
    setEditSvc(null)
    setModal(null)
    setSaving(false)
    load()
  }

  const deleteService = async (id: string) => {
    await churchAPI.deleteService(id)
    load()
  }

  const openChurchModal = () => {
    setForm(church ?? emptyChurch)
    setModal('church')
  }

  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Church Information</h1>
          <p className="page-subtitle">Manage your church profile and services</p>
        </div>
        <button className="btn btn-primary" onClick={openChurchModal}>
          <MdEdit /> {church ? 'Edit Church' : 'Setup Church'}
        </button>
      </div>

      {church ? (
        <>
          {/* Church Profile Card */}
          <div className="card card-pad">
            <div style={{
              background: 'linear-gradient(135deg, #0f172a, #1e1b4b)',
              borderRadius: 12,
              padding: '24px 28px',
              marginBottom: 20,
              color: '#fff',
            }}>
              <h2 style={{ fontSize: 24, fontWeight: 800 }}>{church.name}</h2>
              {church.motto && <p style={{ color: '#a5b4fc', marginTop: 4, fontStyle: 'italic' }}>"{church.motto}"</p>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
              {[
                { label: 'Lead Pastor',    value: church.pastor },
                { label: 'Phone',          value: church.phone },
                { label: 'Email',          value: church.email },
                { label: 'Website',        value: church.website },
                { label: 'Address',        value: church.address },
                { label: 'City',           value: church.city },
                { label: 'Country',        value: church.country },
                { label: 'Founded',        value: church.founding_year?.toString() },
              ].filter(it => it.value).map(({ label, value }) => (
                <div key={label} style={{ padding: '14px 16px', background: '#f8fafc', borderRadius: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{label}</div>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{value}</div>
                </div>
              ))}
            </div>

            {church.vision && (
              <div style={{ marginTop: 20, padding: '16px 20px', background: '#eff6ff', borderRadius: 10, borderLeft: '3px solid #3b82f6' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Vision</div>
                <p style={{ color: '#1e40af', fontSize: 14 }}>{church.vision}</p>
              </div>
            )}
            {church.mission && (
              <div style={{ marginTop: 12, padding: '16px 20px', background: '#f0fdf4', borderRadius: 10, borderLeft: '3px solid #22c55e' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Mission</div>
                <p style={{ color: '#15803d', fontSize: 14 }}>{church.mission}</p>
              </div>
            )}
          </div>

          {/* Services */}
          <div className="card card-pad">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontWeight: 700, fontSize: 17 }}>Church Services</h2>
              <button className="btn btn-primary btn-sm" onClick={() => { setEditSvc(null); setSvcForm({ name: '', day: '', time: '' }); setModal('service') }}>
                <MdAdd /> Add Service
              </button>
            </div>

            {services.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🗓️</div>
                <div className="empty-state-text">No services added yet</div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                {services.map((s) => (
                  <div key={s.id} style={{ background: '#f8fafc', borderRadius: 10, padding: '14px 16px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{s.name}</div>
                    {s.day && <div style={{ fontSize: 13, color: '#64748b' }}>{s.day}</div>}
                    {s.time && <div style={{ fontSize: 13, color: '#64748b' }}>{s.time}</div>}
                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => { setEditSvc(s); setSvcForm(s); setModal('service') }}>
                        <MdEdit />
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => deleteService(s.id)}>
                        <MdDelete />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="card card-pad" style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>⛪</div>
          <h2 style={{ fontWeight: 700, fontSize: 20 }}>No church info found</h2>
          <p style={{ color: '#94a3b8', marginTop: 6 }}>Click "Setup Church" to get started</p>
        </div>
      )}

      {/* Church Modal */}
      {modal === 'church' && (
        <Modal title={church ? 'Edit Church Info' : 'Setup Church'} onClose={() => setModal(null)} size="lg">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {([
              ['name', 'Church Name', 'text'],
              ['motto', 'Motto', 'text'],
              ['pastor', 'Lead Pastor', 'text'],
              ['founding_year', 'Founding Year', 'number'],
              ['phone', 'Phone', 'text'],
              ['email', 'Email', 'email'],
              ['website', 'Website', 'url'],
              ['address', 'Address', 'text'],
              ['city', 'City', 'text'],
              ['country', 'Country', 'text'],
            ] as const).map(([key, label, type]) => (
              <div key={key}>
                <label className="label">{label}</label>
                <input className="input" type={type} value={(form as Record<string, unknown>)[key] as string ?? ''}
                  onChange={e => setForm({ ...form, [key]: key === 'founding_year' ? Number(e.target.value) : e.target.value })} />
              </div>
            ))}
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="label">Vision</label>
              <textarea className="input" rows={2} style={{ resize: 'vertical' }} value={form.vision ?? ''}
                onChange={e => setForm({ ...form, vision: e.target.value })} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="label">Mission</label>
              <textarea className="input" rows={2} style={{ resize: 'vertical' }} value={form.mission ?? ''}
                onChange={e => setForm({ ...form, mission: e.target.value })} />
            </div>
          </div>
          <div style={{ marginTop: 20 }}>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={saveChurch} disabled={saving}>
              {saving ? 'Saving…' : 'Save Church Info'}
            </button>
          </div>
        </Modal>
      )}

      {/* Service Modal */}
      {modal === 'service' && (
        <Modal title={editSvc ? 'Edit Service' : 'Add Service'} onClose={() => setModal(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label className="label">Service Name</label>
              <input className="input" value={svcForm.name ?? ''} onChange={e => setSvcForm({ ...svcForm, name: e.target.value })} />
            </div>
            <div>
              <label className="label">Day</label>
              <select className="input" value={svcForm.day ?? ''} onChange={e => setSvcForm({ ...svcForm, day: e.target.value })}>
                <option value="">Select day</option>
                {DAYS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Time</label>
              <input className="input" type="time" value={svcForm.time ?? ''} onChange={e => setSvcForm({ ...svcForm, time: e.target.value })} />
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={saveService} disabled={saving}>
              {saving ? 'Saving…' : editSvc ? 'Update Service' : 'Add Service'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
