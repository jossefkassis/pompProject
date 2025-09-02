import React from 'react'

export default function SceneLights() {
  return (
    <>
      {/* إضاءة محيطة خفيفة */}
      <ambientLight intensity={0.4} />

      {/* إضاءة شمسية مع ظلال */}
      <directionalLight
        position={[10, 15, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
    </>
  )
}