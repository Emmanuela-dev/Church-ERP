import { NavLink } from 'react-router-dom'
import {
  MdDashboard, MdChurch, MdGroup, MdEvent, MdAccountBalance,
} from 'react-icons/md'

const links = [
  { to: '/',           icon: <MdDashboard />,     label: 'Dashboard' },
  { to: '/church',     icon: <MdChurch />,         label: 'Church Info' },
  { to: '/members',    icon: <MdGroup />,          label: 'Members' },
  { to: '/activities', icon: <MdEvent />,          label: 'Activities' },
  { to: '/finance',    icon: <MdAccountBalance />, label: 'Finance' },
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">⛪</div>
        <div className="sidebar-title">ChurchMS</div>
        <div className="sidebar-subtitle">Church Management System</div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Main Menu</div>
        {links.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div style={{ fontSize: 12, color: '#475569', textAlign: 'center' }}>
          v1.0.0 · Built with ❤️
        </div>
      </div>
    </aside>
  )
}
