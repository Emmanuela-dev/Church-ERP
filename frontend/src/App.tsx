import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import ChurchInfo from './pages/ChurchInfo'
import Members from './pages/Members'
import Activities from './pages/Activities'
import Finance from './pages/Finance'
import './index.css'

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>
        <Sidebar />
        <main style={{ flex: 1, padding: '28px 32px', overflowY: 'auto', maxWidth: '100%' }}>
          <Routes>
            <Route path="/"           element={<Dashboard />} />
            <Route path="/church"     element={<ChurchInfo />} />
            <Route path="/members"    element={<Members />} />
            <Route path="/activities" element={<Activities />} />
            <Route path="/finance"    element={<Finance />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
