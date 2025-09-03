// src/components/Cannon/Cannon.jsx
import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import Barrel from "./Barrel";
import Base from "./base";
import Carriage from "./Carriage";
import Wheel from "./wheel";

const Cannon = forwardRef(function Cannon(
  {
    barrelColor = "#555",
    baseColor = "#444",
    woodColor = "#6b4423",
    wheelColor = "black",
    metalColor = "#222",
    elevationDeg = 35,
    azimuth = 0,
    recoilMagnify = 1,
  },
  ref
) {
  const rotationX = (elevationDeg * Math.PI) / 180;
  const muzzleRef = useRef();
  const rootRef = useRef();
  const barrelAxisRef = useRef();

  // spring-mass recoil state
  const recoil = useRef(0);
  const recoilVel = useRef(0);
  const recoilDamping = useRef(2);
  const recoilK = useRef(30);
  const lastApplied = useRef(0);

  useImperativeHandle(ref, () => ({
    getMuzzleWorldPos(target = new THREE.Vector3()) {
      if (!muzzleRef.current) return target.set(0, 1.5, 0);
      return muzzleRef.current.getWorldPosition(target);
    },
    applyRecoil(impulse, damping = 2) {
      recoilVel.current -= impulse;
      recoilDamping.current = damping;
    },
    reset() {
      // clear spring state
      recoil.current = 0;
      recoilVel.current = 0;
      lastApplied.current = 0;
      // reset position & rotation
      if (rootRef.current) {
        rootRef.current.position.set(0, 0.5, 0);
        rootRef.current.rotation.set(
          0,
          -Math.PI / 2 + THREE.MathUtils.degToRad(azimuth),
          0
        );
      }
    },
  }));

  useFrame((_, dt) => {
    // spring integration
    recoil.current += recoilVel.current * dt;
    recoilVel.current +=
      (-recoilK.current * recoil.current -
        recoilDamping.current * recoilVel.current) *
      dt;

    // kill tiny jitter
    if (Math.abs(recoilVel.current) < 1e-3 && Math.abs(recoil.current) < 1e-3) {
      recoilVel.current = 0;
      recoil.current = 0;
    }

    if (!rootRef.current || !barrelAxisRef.current) return;

    // yaw
    rootRef.current.rotation.set(
      0,
      -Math.PI / 2 + THREE.MathUtils.degToRad(azimuth),
      0
    );

    const delta = recoil.current - lastApplied.current;
    if (Math.abs(delta) > 1e-6) {
      // world forward (local −Z)
      const forward = new THREE.Vector3();
      barrelAxisRef.current.getWorldDirection(forward);
      // if your barrel mesh actually points +Z, do: forward.negate()

      // only XZ
      forward.y = 0;
      forward.normalize();

      // shift back
      const backward = forward.clone().multiplyScalar(-delta * recoilMagnify);
      rootRef.current.position.add(backward);

      lastApplied.current = recoil.current;
    }
  });

  const MUZZLE_OFFSET_X = 1.2;
  const MUZZLE_OFFSET_Y = 0.9;

  return (
    <group ref={rootRef} position={[0, 0.5, 0]}>
      <Barrel color={barrelColor} rotationX={rotationX} />
      <Base color={baseColor} />
      <Carriage woodColor={woodColor} />
      <Wheel
        position={[0.75, 0, 0]}
        wheelColor={wheelColor}
        metalColor={metalColor}
      />
      <Wheel
        position={[-0.75, 0, 0]}
        wheelColor={wheelColor}
        metalColor={metalColor}
      />

      <group ref={barrelAxisRef} rotation={[rotationX, 0, 0]}>
        <object3D
          ref={muzzleRef}
          position={[MUZZLE_OFFSET_X, MUZZLE_OFFSET_Y, 0]}
        />
      </group>
    </group>
  );
});

export default Cannon;