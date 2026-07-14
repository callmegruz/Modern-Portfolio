import { useRef, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'

// 3D Grid representing a Vector Space / Embedding Database (RAG Bot)
function VectorMatrix() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      // Gentle auto-rotation
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.4
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.2
      
      // Animate grid nodes bobbing to represent activation
      groupRef.current.children.forEach((child, index) => {
        const x = index % 3
        const y = Math.floor((index / 3) % 3)
        child.position.z = Math.sin(state.clock.elapsedTime * 2 + x + y) * 0.15
      })
    }
  })

  // Create a 3x3 grid of data nodes
  const nodes = []
  const spacing = 0.55
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      nodes.push(
        <mesh key={`node-${x}-${y}`} position={[x * spacing, y * spacing, 0]}>
          <boxGeometry args={[0.22, 0.22, 0.22]} />
          <meshStandardMaterial
            color={(x + y) % 2 === 0 ? '#06b6d4' : '#8b5cf6'}
            metalness={0.9}
            roughness={0.1}
            emissive={(x + y) % 2 === 0 ? '#06b6d4' : '#8b5cf6'}
            emissiveIntensity={0.25}
          />
        </mesh>
      )
    }
  }

  return <group ref={groupRef}>{nodes}</group>
}

// 3D Document / Resume Matcher with matching signal nodes
function ResumeMatcher() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.45
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.15
    }
  })

  return (
    <group ref={groupRef}>
      {/* Dark metallic clipboard backing */}
      <mesh>
        <boxGeometry args={[0.8, 1.1, 0.05]} />
        <meshStandardMaterial
          color="#0d0e25"
          roughness={0.2}
          metalness={0.9}
        />
      </mesh>

      {/* Floating semi-transparent glowing resume sheet */}
      <mesh position={[0, 0, 0.035]}>
        <boxGeometry args={[0.7, 0.98, 0.04]} />
        <meshStandardMaterial
          color="#8b5cf6"
          transparent
          opacity={0.8}
          roughness={0.15}
          metalness={0.3}
          emissive="#8b5cf6"
          emissiveIntensity={0.15}
        />
      </mesh>

      {/* Stylized horizontal resume content bars */}
      <mesh position={[-0.05, 0.26, 0.06]}>
        <boxGeometry args={[0.42, 0.035, 0.015]} />
        <meshBasicMaterial color="#06b6d4" />
      </mesh>
      
      <mesh position={[-0.1, 0.12, 0.06]}>
        <boxGeometry args={[0.32, 0.025, 0.015]} />
        <meshBasicMaterial color="#06b6d4" />
      </mesh>

      <mesh position={[-0.05, -0.02, 0.06]}>
        <boxGeometry args={[0.42, 0.025, 0.015]} />
        <meshBasicMaterial color="#06b6d4" />
      </mesh>

      <mesh position={[-0.15, -0.16, 0.06]}>
        <boxGeometry args={[0.22, 0.025, 0.015]} />
        <meshBasicMaterial color="#94a3b8" />
      </mesh>

      {/* Glowing AI matching indicator node (chat dialog node) */}
      <mesh position={[0.2, 0.28, 0.075]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial
          color="#ec4899"
          emissive="#ec4899"
          emissiveIntensity={1.2}
        />
      </mesh>
      
      {/* Secondary node */}
      <mesh position={[0.2, -0.1, 0.075]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial
          color="#06b6d4"
          emissive="#06b6d4"
          emissiveIntensity={0.8}
        />
      </mesh>
    </group>
  )
}

interface ProjectCanvasProps {
  type: 'rag' | 'hiremate'
}

export default function ProjectCanvas3D({ type }: ProjectCanvasProps) {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Suspense fallback={
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'var(--text-dark)',
          fontSize: '0.8rem',
          fontFamily: 'var(--font-mono)'
        }}>
          Loading Node...
        </div>
      }>
        <Canvas camera={{ position: [0, 0, 3], fov: 45 }} gl={{ antialias: true, alpha: true }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[5, 5, 5]} intensity={2.0} color="#ffffff" />
          <pointLight position={[-5, -5, -5]} intensity={1.0} color="#06b6d4" />
          
          <Float speed={1.8} rotationIntensity={1.2} floatIntensity={1.2}>
            {type === 'rag' ? <VectorMatrix /> : <ResumeMatcher />}
          </Float>
        </Canvas>
      </Suspense>
    </div>
  )
}
