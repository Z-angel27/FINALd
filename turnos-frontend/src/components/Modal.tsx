import React from 'react'

export default function Modal({ title, children, onClose }: { title?: string, children: React.ReactNode, onClose: ()=>void }){
  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        {title && <h3>{title}</h3>}
        <div className="modal-body">{children}</div>
        <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
          <button onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  )
}
