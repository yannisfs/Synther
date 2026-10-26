import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Light-theme palette: logo-blue (#2d33a7) particles converging on a
// logo-blue wireframe core, rendered with normal blending so they read
// on a white ground.
const BLUE = new THREE.Color('#2d33a7')
const CORE = new THREE.Color('#2d33a7')

// Lift the whole system so the convergence focal point sits a little above
// the viewport center - between the "Engineering synthesis" title and
// the "Transforming disparate systems…" lead. 1 world unit ≈ 7% of viewport
// height at this camera distance, so 1.6 ≈ 11% up. Tune here.
const FOCUS_Y = 1.2
/**
 * Moving datapoints converging on the origin.
 * Points spawn on a shell, drift inward toward a core, then respawn outward -
 * a perpetual convergence that echoes the brand idea "engineering synthesis".
 */
function ConvergingPoints({ count = 1400 }) {
  const pointsRef = useRef()
  const linesRef = useRef()

  const { positions, seeds, velocities } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const seeds = new Float32Array(count)
    const velocities = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      seeds[i] = Math.random()
      velocities[i] = 0.002 + Math.random() * 0.006
      positions[i * 3] = 0
      positions[i * 3 + 1] = 0
      positions[i * 3 + 2] = 0
    }
    return { positions, seeds, velocities }
  }, [count])

  // Persistent store of current radii so respawns feel continuous.
  const radii = useRef(new Float32Array(count))
  const angles = useRef({ theta: new Float32Array(count), phi: new Float32Array(count) })

  useMemo(() => {
    for (let i = 0; i < count; i++) {
      radii.current[i] = 6 + Math.random() * 8
      angles.current.theta[i] = Math.random() * Math.PI * 2
      angles.current.phi[i] = Math.acos(2 * Math.random() - 1)
    }
  }, [count])

  useFrame((_, delta) => {
    if (!pointsRef.current) return
    const t = Math.min(delta, 0.05)
    const pos = pointsRef.current.geometry.attributes.position.array

    for (let i = 0; i < count; i++) {
      // Converge: radius shrinks. When it gets close to core, respawn far out.
      radii.current[i] -= velocities[i] * t * 60
      if (radii.current[i] < 0.35) {
        radii.current[i] = 6 + Math.random() * 8
        angles.current.theta[i] = Math.random() * Math.PI * 2
        angles.current.phi[i] = Math.acos(2 * Math.random() - 1)
      }

      // Slight orbital drift for a living, non-mechanical motion.
      angles.current.theta[i] += (0.05 + seeds[i] * 0.05) * t

      const r = radii.current[i]
      const theta = angles.current.theta[i]
      const phi = angles.current.phi[i]
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = r * Math.cos(phi)
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true

    // Gentle whole-system rotation.
    pointsRef.current.rotation.y += t * 0.05
  })

  // Vertex color: interpolate navy -> blue -> red by convergence (1/r radius).
  const colors = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3] = BLUE.r
      arr[i * 3 + 1] = BLUE.g
      arr[i * 3 + 2] = BLUE.b
    }
    return arr
  }, [count])

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        vertexColors
        transparent
        opacity={0.62}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}

/** A faint wireframe icosahedron core the points converge toward. */
function Core() {
  const ref = useRef()
  useFrame((_, delta) => {
    if (!ref.current) return
    ref.current.rotation.x += delta * 0.12
    ref.current.rotation.y += delta * 0.18
  })
  return (
    <mesh ref={ref} scale={0.34}>
      <icosahedronGeometry args={[1, 1]} />
      <meshBasicMaterial color={CORE} wireframe transparent opacity={0.6} />
    </mesh>
  )
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <group position={[0, FOCUS_Y, 0]}>
        <ConvergingPoints />
        <Core />
      </group>
    </>
  )
}

export default function HeroBackground() {
  return (
    <div className="hero-canvas">
      <Canvas
        camera={{ position: [0, 0, 14], fov: 55 }}
        dpr={[1, 1.8]}
        gl={{ antialias: true, alpha: true }}
      >
        <Scene />
      </Canvas>
      {/* vignette + gradient overlays for legibility over text */}
      <div className="hero-overlay hero-overlay--vignette" />
      <div className="hero-overlay hero-overlay--gradient" />
    </div>
  )
}