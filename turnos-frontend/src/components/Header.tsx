import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../hooks/useTheme'

export default function Header(){
  const { token, logout, role, setRole } = useAuth()
  const { theme, setTheme } = useTheme()
  return (
    <header className="app-header">
      <div className="brand"><Link to="/">Turnos</Link></div>
      <nav>
        <Link to="/reception">Recepción</Link>
        <Link to="/doctor">Médico</Link>
        <Link to="/display">Display</Link>
        <select value={theme} onChange={e => setTheme(e.target.value as 'light'|'dark')} style={{marginRight:8}} aria-label="Tema">
          <option value="light">Claro</option>
          <option value="dark">Oscuro</option>
        </select>
        {token ? (
          <>
            <span style={{marginRight:12}}>Rol: {role || '—'}</span>
            <select value={role || ''} onChange={e => setRole(e.target.value as any)} style={{marginRight:8}}>
              <option value="">—</option>
              <option value="reception">Recepción</option>
              <option value="doctor">Médico</option>
              <option value="admin">Admin</option>
            </select>
            <button onClick={logout}>Salir</button>
          </>
        ) : <Link to="/login">Login</Link>}
      </nav>
    </header>
  )
}
