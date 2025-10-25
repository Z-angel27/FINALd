import React, { useEffect, useState } from 'react'
import { Turno } from '../api/mockApi'
import { apiClient } from '../api/apiClient'

export default function Display() {
  const [queues, setQueues] = useState<Record<string, Turno[]>>({})

  useEffect(() => {
    const unsub = apiClient.subscribe(q => setQueues(q))
    return unsub
  }, [])

  const [isFull, setIsFull] = useState(false)

  useEffect(() => {
    const handler = () => setIsFull(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  const toggleFull = async () => {
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen()
      else await document.exitFullscreen()
    } catch (err) { console.warn(err) }
  }

  return (
    <div className="display-screen">
      <header style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h1>Turnos - Pantalla de espera</h1>
        <div>
          <button onClick={toggleFull}>{isFull ? 'Salir pantalla completa' : 'Modo pantalla completa'}</button>
        </div>
      </header>
      <div className="display-grid">
        {Object.keys(queues).map(clinic => {
          const called = queues[clinic].find(t => t.status === 'called') || null
          const waiting = (queues[clinic] || []).filter(t => t.status === 'waiting')
          return (
            <div className="display-card" key={clinic}>
              <div>
                <h2>{clinic}</h2>
                <div className="called">
                  <h4>Llamado</h4>
                  {called ? (
                    <div className={`called-item ${called ? 'pulse' : ''}`}>{called.patientName}</div>
                  ) : <div className="empty">—</div>}
                </div>
              </div>

              <div className="next">
                <h4>Próximos</h4>
                <ul>
                  {waiting.slice(0,5).map(t => (
                    <li key={t.id}>{t.patientName}</li>
                  ))}
                </ul>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
