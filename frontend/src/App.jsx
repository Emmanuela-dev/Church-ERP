import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import ChurchInfo from './pages/ChurchInfo'
import Members from './pages/Members'
import Activities from './pages/Activities'
import Finance from './pages/Finance'

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/church" element={<ChurchInfo />} />
            <Route path="/members" element={<Members />} />
            <Route path="/activities" element={<Activities />} />
            <Route path="/finance" element={<Finance />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
