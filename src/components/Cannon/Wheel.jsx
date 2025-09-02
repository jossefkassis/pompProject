import React from 'react'
import { Torus, Cylinder } from '@react-three/drei'

export default function Wheel({ position = [0, 0, 0], wheelColor = 'black', metalColor = '#222' }) {
  return (
    <group position={position} rotation={[0, 0, Math.PI / 2]}>
      <Torus args={[0.5, 0.1, 16, 100]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <meshStandardMaterial color={wheelColor} metalness={0.5} roughness={0.5} />
      </Torus>
      <Cylinder args={[0.02, 0.02, 0.9, 16]} castShadow>
        <meshStandardMaterial color={metalColor} metalness={0.8} roughness={0.2} />
      </Cylinder>
      <Cylinder args={[0.02, 0.02, 0.9, 16]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <meshStandardMaterial color={metalColor} metalness={0.8} roughness={0.2} />
      </Cylinder>
    </group>
  )
}