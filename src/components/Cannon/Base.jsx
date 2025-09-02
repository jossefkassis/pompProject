import React from 'react'
import { Torus } from '@react-three/drei'

export default function Base({ color = '#444' }) {
  return (
    <Torus args={[0.2, 0.05, 16, 100]} rotation={[0, Math.PI / 2, 0]} position={[0, 1.2, 1.1]} castShadow>
      <meshStandardMaterial color={color} metalness={0.9} roughness={0.1} />
    </Torus>
  )
}