import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import * as THREE from 'three'

interface NetNode {
  id: string
  pos: THREE.Vector3
  layer: number
}

interface Synapse {
  from: NetNode
  to: NetNode
}

interface SignalPulse {
  connectionIdx: number
  progress: number
  speed: number
}

function NeuralNetwork() {
  const networkRef = useRef<THREE.Group>(null)
  
  // Drag rotation states
  const isDragging = useRef(false)
  const previousMouse = useRef({ x: 0, y: 0 })
  const rotationOffset = useRef({ x: 0, y: 0 })
  const localRotationY = useRef(0)

  const { viewport } = useThree()
  
  // Responsive coordinates to position the network in the middle-right area
  const isMobile = viewport.width < 7
  // Sweet spot divisor of 3.7 balances it between main content and right page edge
  const xOffset = isMobile ? 0 : viewport.width / 3.7
  const yOffset = isMobile ? 0.05 : 0

  // 1. Generate nodes locally around [0,0,0]
  const nodes = useMemo(() => {
    const list: NetNode[] = []
    const layerConfigs = [
      { count: 4, x: -1.7, yGap: 0.75 },
      { count: 5, x: -0.55, yGap: 0.68 },
      { count: 5, x: 0.55, yGap: 0.68 },
      { count: 3, x: 1.7, yGap: 0.75 }
    ]

    let idCounter = 0
    layerConfigs.forEach((layerConf, layerIdx) => {
      const { count, x, yGap } = layerConf
      const startY = -((count - 1) * yGap) / 2
      
      for (let i = 0; i < count; i++) {
        const y = startY + i * yGap
        const z = Math.sin(layerIdx * 1.5 + i * 2.3) * 0.5
        list.push({
          id: `node-${idCounter++}`,
          pos: new THREE.Vector3(x, y, z),
          layer: layerIdx
        })
      }
    })

    return list
  }, [])

  // 2. Generate connections
  const synapses = useMemo(() => {
    const list: Synapse[] = []
    for (let i = 0; i < nodes.length; i++) {
      for (let j = 0; j < nodes.length; j++) {
        if (nodes[i].layer + 1 === nodes[j].layer) {
          list.push({ from: nodes[i], to: nodes[j] })
        }
      }
    }
    return list
  }, [nodes])

  // 3. Compile connections into a single line geometry for high WebGL performance
  const synapsesGeometry = useMemo(() => {
    const points: number[] = []
    synapses.forEach((syn) => {
      points.push(syn.from.pos.x, syn.from.pos.y, syn.from.pos.z)
      points.push(syn.to.pos.x, syn.to.pos.y, syn.to.pos.z)
    })
    
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(points, 3))
    return geo
  }, [synapses])

  // 4. Initialize signal pulses
  const signalsRef = useRef<SignalPulse[]>([])
  const signalMeshesRef = useRef<(THREE.Mesh | null)[]>([])

  if (signalsRef.current.length === 0 && synapses.length > 0) {
    for (let i = 0; i < 22; i++) {
      signalsRef.current.push({
        connectionIdx: Math.floor(Math.random() * synapses.length),
        progress: Math.random(),
        speed: 0.35 + Math.random() * 0.65
      })
    }
  }

  // 5. Drag & auto-rotation frame loop
  useFrame((state, delta) => {
    // Only auto-rotate when the user is not actively dragging the network
    if (!isDragging.current) {
      localRotationY.current += 0.2 * delta
    }

    if (networkRef.current) {
      const currentMouseX = state.pointer.x
      const currentMouseY = state.pointer.y

      if (isDragging.current) {
        // Compute delta motion
        const deltaX = currentMouseX - previousMouse.current.x
        const deltaY = currentMouseY - previousMouse.current.y

        // Scale motion to group rotation
        rotationOffset.current.y += deltaX * 2.8
        rotationOffset.current.x -= deltaY * 2.8 // invert Y axis for standard tilt

        // Constrain vertical rotation to prevent flipping upside down
        rotationOffset.current.x = Math.max(-Math.PI / 3.5, Math.min(Math.PI / 3.5, rotationOffset.current.x))
      }

      previousMouse.current.x = currentMouseX
      previousMouse.current.y = currentMouseY

      // Smoothly interpolate rotations
      const targetRotY = localRotationY.current + rotationOffset.current.y
      const targetRotX = rotationOffset.current.x

      networkRef.current.rotation.x = THREE.MathUtils.lerp(networkRef.current.rotation.x, targetRotX, 0.1)
      networkRef.current.rotation.y = THREE.MathUtils.lerp(networkRef.current.rotation.y, targetRotY, 0.1)
    }

    // Animate signals
    if (synapses.length > 0) {
      signalsRef.current.forEach((sig, idx) => {
        sig.progress += sig.speed * delta
        
        if (sig.progress >= 1) {
          sig.progress = 0
          sig.connectionIdx = Math.floor(Math.random() * synapses.length)
          sig.speed = 0.35 + Math.random() * 0.65
        }

        const mesh = signalMeshesRef.current[idx]
        const syn = synapses[sig.connectionIdx]
        if (mesh && syn) {
          mesh.position.lerpVectors(syn.from.pos, syn.to.pos, sig.progress)
        }
      })
    }
  })

  // Pointer drag event handlers
  const handlePointerDown = (e: any) => {
    e.stopPropagation()
    // Lock pointer focus to continue capturing drags off-mesh
    e.target.setPointerCapture(e.pointerId)
    isDragging.current = true
    previousMouse.current.x = e.pointer.x
    previousMouse.current.y = e.pointer.y
    document.body.style.cursor = 'grabbing'
  }

  const handlePointerUp = (e: any) => {
    e.stopPropagation()
    e.target.releasePointerCapture(e.pointerId)
    isDragging.current = false
    document.body.style.cursor = 'grab'
  }

  const handlePointerOver = (e: any) => {
    e.stopPropagation()
    document.body.style.cursor = 'grab'
  }

  const handlePointerOut = () => {
    if (!isDragging.current) {
      document.body.style.cursor = 'auto'
    }
  }

  return (
    <>
      {/* Viewport-wide grab overlay to allow dragging anywhere on the canvas */}
      <mesh
        position={[0, 0, -1]}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <planeGeometry args={[viewport.width * 3, viewport.height * 3]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Rotating Neural Network group */}
      <group ref={networkRef} position={[xOffset, yOffset, 0]} scale={0.75}>
        {/* Synapses */}
        <lineSegments geometry={synapsesGeometry}>
          <lineBasicMaterial
            color="#06b6d4"
            opacity={0.22}
            transparent
            linewidth={1}
          />
        </lineSegments>

        {/* Nodes */}
        {nodes.map((node) => (
          <mesh key={node.id} position={node.pos}>
            <sphereGeometry args={[0.11, 16, 16]} />
            <meshStandardMaterial
              color={node.layer === 0 ? '#06b6d4' : node.layer === 3 ? '#ec4899' : '#8b5cf6'}
              metalness={0.9}
              roughness={0.1}
              emissive={node.layer === 0 ? '#06b6d4' : node.layer === 3 ? '#ec4899' : '#8b5cf6'}
              emissiveIntensity={0.25}
            />
          </mesh>
        ))}

        {/* Active Signal Pulses */}
        {Array.from({ length: 22 }).map((_, idx) => (
          <mesh
            key={`signal-${idx}`}
            ref={(el) => { signalMeshesRef.current[idx] = el }}
          >
            <sphereGeometry args={[0.055, 8, 8]} />
            <meshBasicMaterial color="#ec4899" />
          </mesh>
        ))}
      </group>
    </>
  )
}

function MouseTrackerLight() {
  const lightRef = useRef<THREE.DirectionalLight>(null)
  const { mouse, viewport } = useThree()

  useFrame(() => {
    if (lightRef.current) {
      const x = (mouse.x * viewport.width) / 2
      const y = (mouse.y * viewport.height) / 2
      
      lightRef.current.position.x = THREE.MathUtils.lerp(lightRef.current.position.x, x, 0.08)
      lightRef.current.position.y = THREE.MathUtils.lerp(lightRef.current.position.y, y, 0.08)
    }
  })

  return (
    <directionalLight
      ref={lightRef}
      position={[0, 0, 5]}
      intensity={2.2}
      color="#ffffff"
    />
  )
}

export default function ThreeScene() {
  const { viewport } = useThree()
  const sparklesScale: [number, number, number] = [
    viewport.width * 1.5,
    viewport.height * 1.5,
    10
  ]

  return (
    <>
      <ambientLight intensity={0.45} />
      
      <pointLight position={[-10, -5, -10]} intensity={1.5} color="#8b5cf6" />
      <pointLight position={[10, 5, 10]} intensity={2.0} color="#06b6d4" />
      
      <MouseTrackerLight />

      <NeuralNetwork />

      <Sparkles
        count={65}
        scale={sparklesScale}
        size={2.2}
        speed={0.18}
        color="#8b5cf6"
      />
      <Sparkles
        count={45}
        scale={sparklesScale}
        size={1.2}
        speed={0.25}
        color="#06b6d4"
      />
    </>
  )
}
