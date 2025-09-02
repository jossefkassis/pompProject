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
    azimuth = 0, // ✅ لدوران المدفع أفقيًا ليتطابق مع مسار القذيفة
  },
  ref
) {
  const rotationX = (elevationDeg * Math.PI) / 180;
  const muzzleRef = useRef();

  // مجموعتان: خارجية للتموضع/الدوران العام، وداخلية لمحور السبطانة (نستخدمها لاستخراج اتجاه السبطانة)
  const rootRef = useRef();         // تُحرَّك في العالم (ارتداد)
  const barrelAxisRef = useRef();   // تدور بالارتفاع فقط (لنستخرج اتجاه +X)

  // نابض ارتداد
  const recoil = useRef(0);
  const recoilVel = useRef(0);
  const recoilDamping = useRef(2);
  const recoilK = useRef(30); // صلابة الرجوع (spring stiffness)
  const lastApplied = useRef(0);

  useImperativeHandle(ref, () => ({
    getMuzzleWorldPos(target = new THREE.Vector3()) {
      if (!muzzleRef.current) return target.set(0, 1.5, 0);
      return muzzleRef.current.getWorldPosition(target);
    },
    // impulse هنا اعتبرناه "سرعة ابتدائية" لحركة الارتداد على طول السبطانة (بوحدة م/ث تقريبية)
    applyRecoil(impulse, damping = 2) {
      recoilVel.current -= impulse;     // للخلف
      recoilDamping.current = damping;  // تخميد من الواجهة
    },
  }));

  useFrame((_, dt) => {
    // تكامل نابضي: x'' = -k x - c x'
    recoil.current += recoilVel.current * dt;
    recoilVel.current += (-recoilK.current * recoil.current - recoilDamping.current * recoilVel.current) * dt;

    // إيقاف الضجيج الصغير
    if (Math.abs(recoilVel.current) < 0.001 && Math.abs(recoil.current) < 0.001) {
      recoilVel.current = 0;
      recoil.current = 0;
    }

    if (rootRef.current) {
      // تدوير المدفع أفقيًا بحسب السمتي (azimuth) + التدوير الثابت الأصلي
      rootRef.current.rotation.set(0, -Math.PI / 2 + THREE.MathUtils.degToRad(azimuth), 0);

      // نحرّك الجذر للخلف على طول محور السبطانة الفعلي
      if (barrelAxisRef.current) {
        const delta = recoil.current - lastApplied.current; // مقدار الإزاحة الجديدة التي ينبغي تطبيقها هذا الإطار

        if (Math.abs(delta) > 1e-6) {
          // اتّجاه السبطانة = اتجاه +X المحلي لمجموعة barrelAxis بعد التحويل للعالم
          const p0 = new THREE.Vector3(0, 0, 0);
          const p1 = new THREE.Vector3(1, 0, 0); // +X
          barrelAxisRef.current.localToWorld(p0);
          barrelAxisRef.current.localToWorld(p1);
          const forward = p1.sub(p0).normalize();
          const backward = forward.clone().multiplyScalar(-delta);

          // نحرك مجموعة المدفع الجذرية في العالم
          rootRef.current.position.add(backward);

          lastApplied.current = recoil.current;
        }
      }
    }
  });

  /**
   * ملاحظة: قيم الفوهة تعتمد على موديلك. عدّلها لتصطف تمامًا.
   * MUZZLE_OFFSET_X يمثل طول البرميل تقريبًا (محور +X المحلي للسبطانة).
   */
  const MUZZLE_OFFSET_X = 1.2; // طول تقريبي للبرميل
  const MUZZLE_OFFSET_Y = 0.9; // ارتفاع تقريبي لمركز الفوهة

  return (
    <group ref={rootRef} position={[0, 0.5, 0]}>
      {/* البرميل الحقيقي */}
      <Barrel color={barrelColor} rotationX={rotationX} />
      <Base color={baseColor} />
      <Carriage woodColor={woodColor} />
      <Wheel position={[0.75, 0, 0]} wheelColor={wheelColor} metalColor={metalColor} />
      <Wheel position={[-0.75, 0, 0]} wheelColor={wheelColor} metalColor={metalColor} />

      {/* مجموعة تُطبّق زاوية الارتفاع — نستخدمها كمرجع لاتجاه السبطانة (+X) */}
      <group ref={barrelAxisRef} rotation={[rotationX, 0, 0]}>
        {/* عقدة غير مرئية تمثل الفوهة */}
        <object3D ref={muzzleRef} position={[MUZZLE_OFFSET_X, MUZZLE_OFFSET_Y, 0]} />
      </group>
    </group>
  );
});

export default Cannon;
  