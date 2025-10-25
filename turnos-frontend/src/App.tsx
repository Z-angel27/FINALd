import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Reception from './pages/Reception'
import DoctorPanel from './pages/DoctorPanel'
import Display from './pages/Display'
import { useAuth } from './contexts/AuthContext'
import Header from './components/Header'

function Protected({ children }: { children: JSX.Element }) {
  const { token } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <div className="app-root">
      <Header />
      <main>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/reception"
            element={<Protected><Reception /></Protected>}
          />
          <Route
            path="/doctor"
            element={<Protected><DoctorPanel /></Protected>}
          />
          <Route path="/display" element={<Display />} />
          <Route path="/" element={<Navigate to="/reception" replace />} />
        </Routes>
      </main>
    </div>
  )
}
