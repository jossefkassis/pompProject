// src/components/Projectile/Projectile.jsx
import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

export default function Projectile({ params = {} }) {
  const {
    muzzleSpeed = 60,
    elevationDeg = 35,
    azimuth = 0,
    mass = 5,
    radius = 0.12,
    rho = 1.225,
    Cd = 0.47,
    g = 9.81,
    windX = 0,
    windY = 0,
    windZ = 0,
    dragOn = true,
    windOn = false,
    restitution = 0.5,
    friction = 0.9,
    recordPath = true,
    idealPath: idealPathOn = true,
  } = params;

  const meshRef = useRef();
  const velocity = useRef(new THREE.Vector3());
  const position = useRef(new THREE.Vector3());
  const active = useRef(true);

  const [trajectory, setTrajectory] = useState([]);
  const [idealPath, setIdealPath] = useState([]);

  const area = Math.PI * radius * radius;
  const gravity = new THREE.Vector3(0, -g, 0);
  const windVec = new THREE.Vector3(windX, windY, windZ);

  useEffect(() => {
    position.current.set(0, 1.5, 0);

    const theta = THREE.MathUtils.degToRad(elevationDeg);
    const phi = THREE.MathUtils.degToRad(azimuth);

    velocity.current.set(
      muzzleSpeed * Math.cos(theta) * Math.cos(phi),
      muzzleSpeed * Math.sin(theta),
      muzzleSpeed * Math.cos(theta) * Math.sin(phi)
    );

    active.current = true;
    setTrajectory([position.current.clone()]);
    setIdealPath([]);

    if (idealPathOn) {
      const pts = [];
      const dt = 0.05;
      let t = 0;
      const x0 = position.current.x;
      const y0 = position.current.y;
      const z0 = position.current.z;
      const vx = velocity.current.x;
      const vy = velocity.current.y;
      const vz = velocity.current.z;

      while (true) {
        const x = x0 + vx * t;
        const y = y0 + vy * t - 0.5 * g * t * t;
        const z = z0 + vz * t;
        pts.push(new THREE.Vector3(x, y, z));
        if (y <= 0) break;
        t += dt;
        if (t > 120) break;
      }
      setIdealPath(pts);
    }
  }, [muzzleSpeed, elevationDeg, azimuth, g, radius, idealPathOn]);

  useFrame((_, delta) => {
    if (!meshRef.current || !active.current) return;

    // مقاومة الهواء + الرياح
    if (dragOn) {
      const relVel = velocity.current.clone();
      if (windOn) relVel.sub(windVec);
      const v = relVel.length();
      if (v > 0) {
        const dragMag = 0.5 * rho * Cd * area * v * v;
        const dragAcc = relVel.clone().multiplyScalar(-1 / v).multiplyScalar(dragMag / mass);
        velocity.current.addScaledVector(dragAcc, delta);
      }
    }

    velocity.current.addScaledVector(gravity, delta);
    position.current.addScaledVector(velocity.current, delta);

    // ارتداد عند الاصطدام بالأرض
   // ارتداد عند الاصطدام بالأرض
if (position.current.y <= 0) {
  position.current.y = 0;

  // هل السرعة الرأسية كافية للارتداد؟
  if (Math.abs(velocity.current.y) > 0.01) {
    velocity.current.y *= -restitution;

    // فقدان طفيف إضافي للطاقة (اختياري)
    velocity.current.y *= 0.98;

    // تقليل السرعة الأفقية بالاحتكاك
    velocity.current.x *= friction;
    velocity.current.z *= friction;
  } else {
    velocity.current.set(0, 0, 0);
    active.current = false;
  }
}


    meshRef.current.position.copy(position.current);

    if (recordPath) {
      setTrajectory((prev) => {
        if (prev.length > 4000) return [...prev.slice(1), position.current.clone()];
        return [...prev, position.current.clone()];
      });
    }
  });

  return (
    <>
      <mesh ref={meshRef} castShadow>
        <sphereGeometry args={[radius, 24, 24]} />
        <meshStandardMaterial color="black" />
      </mesh>

      {recordPath && trajectory.length > 1 && (
        <Line points={trajectory} color="yellow" lineWidth={5} transparent opacity={0.95} />
      )}

      {idealPathOn && idealPath.length > 1 && (
        <Line
          points={idealPath}
          color="blue"
          lineWidth={2}
          dashed
          dashSize={0.3}
          gapSize={0.2}
          transparent
          opacity={0.4}
        />
      )}
    </>
  );
}
