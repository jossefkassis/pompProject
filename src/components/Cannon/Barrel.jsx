import React from 'react'
import { Cylinder } from '@react-three/drei'

export default function Barrel({ color = '#555', rotationX = 0 }) {
  return (
    <group rotation={[rotationX, 0, 0]} position={[0, 1.2, -0.1]}>
      <Cylinder
        args={[0.2, 0.25, 2.5, 32]}
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </Cylinder>
    </group>
  )
}