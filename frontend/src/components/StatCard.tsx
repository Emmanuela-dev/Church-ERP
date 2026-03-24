interface StatCardProps {
  label: string
  value: number | string
  icon: React.ReactNode
  gradient: string
  subtext?: string
}

export default function StatCard({ label, value, icon, gradient, subtext }: StatCardProps) {
  return (
    <div className="stat-card hover-lift" style={{ background: gradient }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.75)', marginBottom: 6 }}>
            {label}
          </div>
          <div style={{ fontSize: 36, fontWeight: 800, color: '#fff', letterSpacing: '-1px' }}>
            {value}
          </div>
          {subtext && (
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>{subtext}</div>
          )}
        </div>
        <div style={{
          width: 48, height: 48,
          background: 'rgba(255,255,255,0.15)',
          borderRadius: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24, color: '#fff',
          backdropFilter: 'blur(4px)',
        }}>
          {icon}
        </div>
      </div>
    </div>
  )
}
