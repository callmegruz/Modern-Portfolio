import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import ThreeScene from './ThreeScene'

export default function Canvas3D() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Suspense fallback={
        <div className="canvas-loading">
          <span>Initializing 3D Space...</span>
        </div>
      }>
        <Canvas
          camera={{ position: [0, 0, 5.5], fov: 45 }}
          gl={{ antialias: true, alpha: true }}
          shadows
        >
          <ThreeScene />
        </Canvas>
      </Suspense>
    </div>
  )
}
