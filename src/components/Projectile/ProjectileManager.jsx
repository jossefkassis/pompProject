import React, { useState, useEffect } from 'react'
import Projectile from './Projectile'

function getRandomColor() {
  const colors = ['red', 'blue', 'green', 'orange', 'purple', 'cyan', 'yellow']
  return colors[Math.floor(Math.random() * colors.length)]
}

export default function ProjectileManager({ params, launched }) {
  const [projectiles, setProjectiles] = useState([])

  useEffect(() => {
    if (launched) {
      const id = Date.now()
      setProjectiles(prev => [
        ...prev,
        { id, params: { ...params }, color: getRandomColor() }
      ])
    }
  }, [launched, params])

  return (
    <>
      {projectiles.map(p => (
        <Projectile key={p.id} params={p.params} color={p.color} />
      ))}
    </>
  )
}
