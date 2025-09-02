import React from 'react'
import { Box } from '@react-three/drei'

export default function Carriage({ woodColor = '#6b4423' }) {
  return (
    <group position={[0, 0.25, -0.3]}>
      <Box args={[1.5, 0.5, 2]} castShadow>
        <meshStandardMaterial color={woodColor} />
      </Box>
      <Box args={[0.5, 0.5, 1.5]} position={[0, 0, 1.75]} castShadow>
        <meshStandardMaterial color={woodColor} />
      </Box>
    </group>
  )
}