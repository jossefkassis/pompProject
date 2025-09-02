import * as THREE from 'three'

// حساب التسارع الكلي للقذيفة
export function computeAcceleration({
  v,        // السرعة الحالية (THREE.Vector3)
  wind,     // سرعة الرياح (THREE.Vector3)
  Cd,       // معامل السحب
  A,        // مساحة المقطع العرضي
  m,        // الكتلة
  g,        // الجاذبية
  rho,      // كثافة الهواء
  dragOn,   // هل مقاومة الهواء مفعلة؟
  windOn    // هل الرياح مفعلة؟
}) {
  const gravity = new THREE.Vector3(0, -g, 0)

  // السرعة النسبية مع الرياح
  const vRel = new THREE.Vector3().copy(v)
  if (windOn) vRel.sub(wind)

  // قوة السحب
  let drag = new THREE.Vector3()
  if (dragOn) {
    const speed = vRel.length()
    if (speed > 0) {
      const dragMag = 0.5 * Cd * rho * A * speed * speed
      drag = vRel.clone().normalize().multiplyScalar(-dragMag / m)
    }
  }

  // التسارع الكلي
  return gravity.add(drag)
}