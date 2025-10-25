import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Header(){
  const { token, logout, role, setRole } = useAuth()
  return (
    <header className="app-header">
      <div className="brand"><Link to="/">Turnos</Link></div>
      <nav>
        <Link to="/reception">Recepción</Link>
        <Link to="/doctor">Médico</Link>
        <Link to="/display">Display</Link>
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
