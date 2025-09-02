  import React, { useRef, useState } from "react";
  import { Canvas } from "@react-three/fiber";
  import { OrbitControls } from "@react-three/drei";
  import { Leva, useControls } from "leva";
  import * as THREE from "three";

  import Cannon from "./components/Cannon/Cannon";
  import Ground from "./components/Ground";
  import SceneLights from "./components/SceneLights";
  import Projectile from "./components/Projectile/Projectile";

  export default function App() {
    const cannonRef = useRef();
    const [shot, setShot] = useState(null); // { id, initialPosition, initialVelocity, params }

    const controls = useControls("إعدادات المحاكاة", {
      muzzleSpeed: { value: 60, min: 1, max: 300, step: 1 },
      elevationDeg: { value: 35, min: 0, max: 85, step: 1 },
      azimuth: { value: 0, min: -180, max: 180, step: 1 },

      mass: { value: 5, min: 0.1, max: 50, step: 0.1 },
      radius: { value: 0.12, min: 0.02, max: 0.5, step: 0.01 },

      rho: { value: 1.225, min: 0.5, max: 1.5, step: 0.01 },
      Cd: { value: 0.47, min: 0.05, max: 1.2, step: 0.01 },

      g: { value: 9.81, min: 0.1, max: 20, step: 0.01 },

      windX: { value: 0, min: -50, max: 50, step: 0.1 },
      windY: { value: 0, min: -10, max: 10, step: 0.1 },
      windZ: { value: 0, min: -50, max: 50, step: 0.1 },

      dragOn: { value: true },
      windOn: { value: false },

      restitution: { value: 0.5, min: 0, max: 1, step: 0.05 },
      friction: { value: 0.9, min: 0, max: 1, step: 0.01 },

      recordPath: { value: true },
      idealPath: { value: true },

      // ✅ خيارات الارتداد لرؤيته بوضوح
      cannonMass: { value: 500, min: 50, max: 3000, step: 10, label: "كتلة المدفع (كغ)" },
      recoilDamping: { value: 3, min: 0.1, max: 10, step: 0.1, label: "تخميد الارتداد" },
      recoilScale: { value: 0.002, min: 0.0002, max: 0.01, step: 0.0002, label: "مقياس الارتداد" }, // لتحويل الزخم لإزاحة محسوسة
    });

    const handleFire = () => {
      const muzzlePos = new THREE.Vector3(0, 1.5, 0);
      if (cannonRef.current?.getMuzzleWorldPos) {
        cannonRef.current.getMuzzleWorldPos(muzzlePos);
      }

      const theta = THREE.MathUtils.degToRad(controls.elevationDeg);
      const phi = THREE.MathUtils.degToRad(controls.azimuth);
      const v0 = controls.muzzleSpeed;

      const initVel = new THREE.Vector3(
        v0 * Math.cos(theta) * Math.cos(phi),
        v0 * Math.sin(theta),
        v0 * Math.cos(theta) * Math.sin(phi)
      );

      const paramsSnapshot = { ...controls };

      setShot({
        id: Date.now(),
        initialPosition: muzzlePos.clone(),
        initialVelocity: initVel.clone(),
        params: paramsSnapshot
      });

      // 💥 ارتداد يعتمد على الزخم: p = m*v —> إزاحة أولية ~ (p / M_cannon) * scale
      if (cannonRef.current?.applyRecoil) {
        const momentum = controls.mass * controls.muzzleSpeed; // kg·m/s
        const impulse = (momentum / Math.max(1, controls.cannonMass)) * controls.recoilScale;
        cannonRef.current.applyRecoil(impulse, controls.recoilDamping);
      }
    };

    const handleReset = () => setShot(null);

    return (
      <>
        <div style={{ position: "absolute", top: 18, left: 18, zIndex: 20 }}>
          <button
            onClick={() => (shot ? handleReset() : handleFire())}
            style={{ padding: "8px 12px", fontSize: 14 }}
          >
            {shot ? "إعادة الضبط" : "إطلاق"}
          </button>
        </div>

        <Leva collapsed />

        <Canvas shadows camera={{ position: [10, 8, 14], fov: 50 }} style={{ width: "100vw", height: "100vh" }}>
          <OrbitControls />
          <SceneLights />
          <Ground />
          {/* azimuth الآن يُستخدم داخل المدفع لتوجيهه ولحساب اتجاه الارتداد */}
          <Cannon ref={cannonRef} elevationDeg={controls.elevationDeg} azimuth={controls.azimuth} />
          <gridHelper args={[500, 50, "black", "black"]} rotation={[0, 0, 0]} />

          {shot && (
            <Projectile
              key={shot.id}
              initialPosition={shot.initialPosition}
              initialVelocity={shot.initialVelocity}
              params={shot.params}
            />
          )}
        </Canvas>
      </>
    );
  }
