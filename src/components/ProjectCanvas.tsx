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

// 3D Conversation Dialogue Synapse Knot (HireMate Chatbot)
function SynapseKnot() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.5
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.6
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.2
    }
  })

  return (
    <mesh ref={meshRef}>
      <torusKnotGeometry args={[0.5, 0.16, 64, 8, 3, 4]} />
      <meshStandardMaterial
        color="#ec4899"
        roughness={0.1}
        metalness={0.8}
        emissive="#ec4899"
        emissiveIntensity={0.3}
      />
    </mesh>
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
            {type === 'rag' ? <VectorMatrix /> : <SynapseKnot />}
          </Float>
        </Canvas>
      </Suspense>
    </div>
  )
}
