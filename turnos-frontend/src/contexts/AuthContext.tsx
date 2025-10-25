import React, { createContext, useContext, useEffect, useState } from 'react'

type Role = 'reception' | 'doctor' | 'admin' | null

type AuthContextType = {
  token: string | null
  role: Role
  login: (username: string, password: string, role?: Role) => Promise<void>
  logout: () => void
  setRole: (r: Role) => void
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
  const [role, setRoleState] = useState<Role>(() => (localStorage.getItem('role') as Role) || null)

  useEffect(() => {
    if (token) localStorage.setItem('token', token)
    else localStorage.removeItem('token')
  }, [token])

  useEffect(() => {
    if (role) localStorage.setItem('role', role)
    else localStorage.removeItem('role')
  }, [role])

  const login = async (username: string, password: string, r: Role = 'reception') => {
    // Mock login: produce a fake token and set role. Replace this with real API call.
    const fakeToken = btoa(`${username}:${Date.now()}`)
    setToken(fakeToken)
    setRoleState(r)
  }

  const logout = () => {
    setToken(null)
    setRoleState(null)
  }

  const setRole = (r: Role) => setRoleState(r)

  return (
    <AuthContext.Provider value={{ token, role, login, logout, setRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
