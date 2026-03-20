import { NavLink } from 'react-router-dom'
import { FaChurch, FaUsers, FaCalendarAlt, FaDollarSign, FaHome } from 'react-icons/fa'

const links = [
  { to: '/', label: 'Dashboard', icon: <FaHome /> },
  { to: '/church', label: 'Church Info', icon: <FaChurch /> },
  { to: '/members', label: 'Members', icon: <FaUsers /> },
  { to: '/activities', label: 'Activities', icon: <FaCalendarAlt /> },
  { to: '/finance', label: 'Finance', icon: <FaDollarSign /> },
]

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-blue-900 text-white flex flex-col">
      <div className="p-6 text-xl font-bold border-b border-blue-700">⛪ ChurchMS</div>
      <nav className="flex-1 p-4 space-y-1">
        {links.map(({ to, label, icon }) => (
          <NavLink
            key={to} to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive ? 'bg-blue-600' : 'hover:bg-blue-800'}`
            }
          >
            {icon} {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
