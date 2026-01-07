import { useRef, useMemo, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sphere, Line, Html } from '@react-three/drei'
import * as THREE from 'three'

// Element colors from periodic table
const ELEMENT_COLORS = {
  H: '#FFFFFF', He: '#D9FFFF', Li: '#CC80FF', Be: '#C2FF00', B: '#FFB5B5',
  C: '#909090', N: '#3050F8', O: '#FF0D0D', F: '#90E050', Ne: '#B3E3F5',
  Na: '#AB5CF2', Mg: '#8AFF00', Al: '#BFA6A6', Si: '#F0C8A0', P: '#FF8000',
  S: '#FFFF30', Cl: '#1FF01F', Ar: '#80D1E3', K: '#8F40D4', Ca: '#3DFF00',
  Fe: '#E06633', Cu: '#C88033', Zn: '#7D80B0', Ag: '#C0C0C0', Au: '#FFD123',
}

// Electron shell configuration (simplified)
const ELECTRON_SHELLS = {
  1: [1], 2: [2], 3: [2, 1], 4: [2, 2], 5: [2, 3], 6: [2, 4],
  7: [2, 5], 8: [2, 6], 9: [2, 7], 10: [2, 8], 11: [2, 8, 1], 12: [2, 8, 2],
  13: [2, 8, 3], 14: [2, 8, 4], 15: [2, 8, 5], 16: [2, 8, 6], 17: [2, 8, 7],
  18: [2, 8, 8], 19: [2, 8, 8, 1], 20: [2, 8, 8, 2], 26: [2, 8, 14, 2],
  29: [2, 8, 18, 1], 30: [2, 8, 18, 2], 47: [2, 8, 18, 18, 1], 79: [2, 8, 18, 32, 18, 1]
}

// Get electron shells for atomic number
function getElectronShells(atomicNumber) {
  if (ELECTRON_SHELLS[atomicNumber]) {
    return ELECTRON_SHELLS[atomicNumber]
  }
  // Simple fallback for other elements
  const shells = []
  let remaining = atomicNumber
  const maxPerShell = [2, 8, 18, 32, 32, 18, 8]
  for (let i = 0; i < maxPerShell.length && remaining > 0; i++) {
    const electrons = Math.min(remaining, maxPerShell[i])
    shells.push(electrons)
    remaining -= electrons
  }
  return shells
}

// Proton component (red sphere in nucleus)
function Proton({ position }) {
  return (
    <Sphere args={[0.15, 16, 16]} position={position}>
      <meshStandardMaterial
        color="#ff3333"
        emissive="#ff0000"
        emissiveIntensity={0.3}
        metalness={0.4}
        roughness={0.3}
      />
    </Sphere>
  )
}

// Neutron component (gray sphere in nucleus)
function Neutron({ position }) {
  return (
    <Sphere args={[0.15, 16, 16]} position={position}>
      <meshStandardMaterial
        color="#888888"
        emissive="#666666"
        emissiveIntensity={0.2}
        metalness={0.4}
        roughness={0.4}
      />
    </Sphere>
  )
}

// Single electron orbiting a shell
function ElectronParticle({ shellRadius, speed, initialAngle, tiltAngle = 0 }) {
  const ref = useRef()
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime() * speed + initialAngle
    const x = Math.cos(t) * shellRadius
    const y = Math.sin(t) * Math.sin(tiltAngle) * shellRadius * 0.3
    const z = Math.sin(t) * shellRadius
    ref.current.position.set(x, y, z)
  })

  return (
    <Sphere ref={ref} args={[0.08, 16, 16]}>
      <meshStandardMaterial
        color="#06b6d4"
        emissive="#06b6d4"
        emissiveIntensity={1}
        metalness={0.5}
        roughness={0.2}
      />
    </Sphere>
  )
}

// Electron orbit ring visualization
function ElectronOrbitRing({ radius, tiltAngle = 0 }) {
  const points = useMemo(() => {
    const pts = []
    for (let i = 0; i <= 64; i++) {
      const angle = (i / 64) * Math.PI * 2
      pts.push(new THREE.Vector3(
        Math.cos(angle) * radius,
        Math.sin(angle) * Math.sin(tiltAngle) * radius * 0.3,
        Math.sin(angle) * radius
      ))
    }
    return pts
  }, [radius, tiltAngle])

  return (
    <Line
      points={points}
      color="#6366f1"
      lineWidth={1}
      transparent
      opacity={0.4}
    />
  )
}

// Full Atomic Model with protons, neutrons, and electron shells
function AtomicModel({ element }) {
  const groupRef = useRef()
  const atomicNumber = element.atomic_number || 1
  const massNumber = Math.round(element.atomic_mass || atomicNumber * 2)
  const neutronCount = Math.max(0, massNumber - atomicNumber)
  const electronShells = getElectronShells(atomicNumber)
  
  // Generate nucleus particle positions
  const nucleusParticles = useMemo(() => {
    const particles = []
    const total = atomicNumber + neutronCount
    const nucleusRadius = Math.min(0.8, 0.2 + total * 0.02)
    
    // Use fibonacci sphere for even distribution
    for (let i = 0; i < total; i++) {
      const y = 1 - (i / (total - 1)) * 2
      const radius = Math.sqrt(1 - y * y)
      const theta = ((Math.PI * (3 - Math.sqrt(5))) * i) + (Math.random() * 0.3)
      
      const scale = nucleusRadius * (0.5 + Math.random() * 0.5)
      particles.push({
        position: [
          Math.cos(theta) * radius * scale,
          y * scale,
          Math.sin(theta) * radius * scale
        ],
        isProton: i < atomicNumber
      })
    }
    return particles
  }, [atomicNumber, neutronCount])

  // Slow rotation of the model
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.1
    }
  })

  return (
    <group ref={groupRef}>
      {/* Nucleus with protons and neutrons */}
      <group>
        {nucleusParticles.map((particle, idx) => (
          particle.isProton ? (
            <Proton key={`proton-${idx}`} position={particle.position} />
          ) : (
            <Neutron key={`neutron-${idx}`} position={particle.position} />
          )
        ))}
      </group>
      
      {/* Electron shells */}
      {electronShells.map((electronsInShell, shellIdx) => {
        const shellRadius = 1.5 + shellIdx * 0.8
        const tiltAngle = (shellIdx * Math.PI) / 4 // Different tilt per shell
        
        return (
          <group key={`shell-${shellIdx}`}>
            {/* Orbit ring */}
            <ElectronOrbitRing radius={shellRadius} tiltAngle={tiltAngle} />
            
            {/* Electrons in this shell */}
            {Array.from({ length: electronsInShell }).map((_, eIdx) => (
              <ElectronParticle
                key={`electron-${shellIdx}-${eIdx}`}
                shellRadius={shellRadius}
                speed={0.8 - shellIdx * 0.1}
                initialAngle={(eIdx / electronsInShell) * Math.PI * 2}
                tiltAngle={tiltAngle}
              />
            ))}
          </group>
        )
      })}
      
      {/* Element label */}
      <Html position={[0, 2.5 + electronShells.length * 0.5, 0]} center>
        <div className="text-white text-lg font-bold bg-black/70 px-3 py-2 rounded-lg">
          <span className="text-indigo-400 text-2xl">{element.symbol}</span>
          <span className="text-slate-300 ml-2">{element.name}</span>
        </div>
      </Html>

    </group>
  )
}

// Simple Atom for reaction view (existing functionality)
function SimpleAtom({ position, symbol, size = 0.5, color }) {
  const meshRef = useRef()
  const [hovered, setHovered] = useState(false)
  
  const atomColor = color || ELEMENT_COLORS[symbol] || '#888888'
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01
    }
  })

  return (
    <group position={position}>
      <Sphere
        ref={meshRef}
        args={[size, 32, 32]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={atomColor}
          metalness={0.3}
          roughness={0.4}
          emissive={atomColor}
          emissiveIntensity={hovered ? 0.5 : 0.2}
        />
      </Sphere>
      
      <Html position={[0, size + 0.3, 0]} center>
        <div className="text-white text-sm font-bold bg-black/50 px-2 py-1 rounded">
          {symbol}
        </div>
      </Html>
    </group>
  )
}

// Bond between atoms
function Bond({ start, end, type = 'covalent' }) {
  return (
    <Line
      points={[start, end]}
      color={type === 'ionic' ? '#f59e0b' : '#8b5cf6'}
      lineWidth={type === 'ionic' ? 3 : 4}
    />
  )
}

// Main 3D Scene for reactions
function ReactionScene({ reaction, selectedElements, animate }) {
  const groupRef = useRef()
  
  const atoms = useMemo(() => {
    if (!selectedElements || selectedElements.length === 0) return []
    
    const positions = []
    const spacing = 3
    const startX = -((selectedElements.length - 1) * spacing) / 2
    
    selectedElements.forEach((el, idx) => {
      positions.push({
        symbol: el.symbol,
        position: [startX + idx * spacing, 0, 0],
        size: 0.3 + (el.atomic_number || 1) * 0.02,
      })
    })
    
    return positions
  }, [selectedElements])

  useFrame((state) => {
    if (groupRef.current && animate) {
      groupRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.3) * 0.1
    }
  })

  return (
    <group ref={groupRef}>
      {atoms.map((atom, idx) => (
        <SimpleAtom
          key={`${atom.symbol}-${idx}`}
          position={atom.position}
          symbol={atom.symbol}
          size={atom.size}
        />
      ))}
      
      {animate && atoms.length >= 2 && (
        <Bond
          start={atoms[0].position}
          end={atoms[1].position}
          type={reaction?.animation_data?.bond_type || 'covalent'}
        />
      )}
    </group>
  )
}

// Background particles
function BackgroundParticles() {
  const count = 100
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20
    }
    return pos
  }, [])

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#6366f1"
        transparent
        opacity={0.3}
        sizeAttenuation
      />
    </points>
  )
}

// Main ReactionViewer component
function ReactionViewer({ reaction, selectedElements, showAnimation, viewAtomicModel }) {
  const hasElements = selectedElements && selectedElements.length > 0
  const showSingleAtomModel = viewAtomicModel && selectedElements?.length === 1

  return (
    <div className="h-full relative">
      <h3 className="text-lg font-semibold text-slate-300 mb-2">
        {showSingleAtomModel 
          ? `Modelo Atómico: ${selectedElements[0].name}` 
          : reaction 
            ? 'Visualización de Reacción' 
            : 'Vista 3D de Átomos'}
      </h3>
      
      {reaction && !showSingleAtomModel && (
        <div className="absolute top-2 right-2 z-10 glass-panel px-3 py-1 text-sm">
          <span className="text-cyan-400 font-mono">{reaction.equation}</span>
        </div>
      )}
      
      <div className="h-[calc(100%-40px)] rounded-lg overflow-hidden bg-gradient-to-b from-slate-900 to-slate-800">
        <Canvas
          camera={{ position: showSingleAtomModel ? [0, 2, 8] : [0, 3, 8], fov: 50 }}
          dpr={[1, 2]}
        >
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <pointLight position={[-10, -10, -5]} intensity={0.5} color="#8b5cf6" />
          
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            autoRotate={!hasElements && !showSingleAtomModel}
            autoRotateSpeed={0.5}
          />
          
          {showSingleAtomModel ? (
            <AtomicModel element={selectedElements[0]} />
          ) : hasElements ? (
            <ReactionScene
              reaction={reaction}
              selectedElements={selectedElements}
              animate={showAnimation}
            />
          ) : (
            <SimpleAtom position={[0, 0, 0]} symbol="?" size={1} color="#6366f1" />
          )}
          
          <BackgroundParticles />
        </Canvas>
      </div>
      
      {!hasElements && !showSingleAtomModel && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-slate-500 text-center">
            Selecciona elementos de la tabla periódica<br />
            para visualizarlos en 3D
          </p>
        </div>
      )}
      
      {showSingleAtomModel && selectedElements[0] && (
        <div className="absolute bottom-2 left-2 right-2 flex justify-center">
          <div className="bg-black/70 backdrop-blur-sm rounded-lg px-4 py-2 flex gap-6 text-xs">
            <span><span className="text-red-400 text-lg">●</span> Protones: <strong>{selectedElements[0].atomic_number}</strong></span>
            <span><span className="text-gray-400 text-lg">●</span> Neutrones: <strong>{Math.round((selectedElements[0].atomic_mass || selectedElements[0].atomic_number * 2) - selectedElements[0].atomic_number)}</strong></span>
            <span><span className="text-cyan-400 text-lg">●</span> Electrones: <strong>{selectedElements[0].atomic_number}</strong></span>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReactionViewer
