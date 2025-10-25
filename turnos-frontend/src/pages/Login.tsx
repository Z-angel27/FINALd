import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const { login } = useAuth()
  const nav = useNavigate()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    await login(username, password)
    nav('/reception')
  }

  return (
    <div className="page centered">
      <h2>Iniciar sesión</h2>
      <form onSubmit={submit} className="card">
        <label>
          Usuario
          <input value={username} onChange={e => setUsername(e.target.value)} />
        </label>
        <label>
          Contraseña
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
        </label>
        <button type="submit">Entrar</button>
      </form>
    </div>
  )
}
