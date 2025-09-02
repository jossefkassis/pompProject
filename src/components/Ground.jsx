import React from 'react'

export default function Ground() {
  return (
    <mesh
      rotation-x={-Math.PI / 2}
      receiveShadow
    >
      <planeGeometry args={[500, 500]} />
      <meshStandardMaterial color="#a3b1a8" />
    </mesh>
  )
}