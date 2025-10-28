import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string|null>(null)
  const { login } = useAuth()
  const nav = useNavigate()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!username || !password) {
      setError('Usuario y contraseña requeridos')
      return
    }
    setLoading(true)
    try {
      await login(username, password)
      nav('/reception')
    } catch (err) {
      setError('Credenciales inválidas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page centered">
      <h2>Iniciar sesión</h2>
      <form onSubmit={submit} className="card" aria-label="Formulario de inicio de sesión">
        <label htmlFor="login-username">Usuario</label>
        <input id="login-username" value={username} onChange={e => setUsername(e.target.value)} autoFocus autoComplete="username" aria-required="true" />
        <label htmlFor="login-password">Contraseña</label>
        <input id="login-password" type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" aria-required="true" />
        <button type="submit" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
        {error && <div className="empty" role="alert" style={{color:'var(--color-error)',marginTop:8}}>{error}</div>}
      </form>
    </div>
  )
}
