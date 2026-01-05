/**
 * 3D Reaction Viewer Component
 * Renders atoms, molecules, and chemical reactions using Three.js
 * Includes atomic structure view with electrons, protons, and neutrons
 */
import { useRef, useState, useMemo, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Environment,
  Float,
  Sphere,
  Line
} from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { CPK_COLORS } from '../../data/elements';

// ============================================
// Helper Functions
// ============================================

function getElementColor(symbol) {
  return CPK_COLORS[symbol] || CPK_COLORS.default || '#FF1493';
}

function normalizeRadius(atomicRadius) {
  if (!atomicRadius) return 0.5;
  return Math.max(0.3, Math.min(1.2, atomicRadius / 150));
}

// ============================================
// Subatomic Particle Components
// ============================================

/**
 * Proton - Red positive particle
 */
function Proton({ position }) {
  return (
    <Sphere args={[0.15, 16, 16]} position={position}>
      <meshStandardMaterial color="#ff4444" roughness={0.3} metalness={0.2} />
    </Sphere>
  );
}

/**
 * Neutron - Gray neutral particle
 */
function Neutron({ position }) {
  return (
    <Sphere args={[0.15, 16, 16]} position={position}>
      <meshStandardMaterial color="#888888" roughness={0.3} metalness={0.2} />
    </Sphere>
  );
}

/**
 * Electron orbiting around nucleus
 */
function Electron({ orbitRadius, speed, startAngle, orbitTilt }) {
  const ref = useRef();
  
  useFrame((state) => {
    if (ref.current) {
      const angle = startAngle + state.clock.elapsedTime * speed;
      ref.current.position.x = Math.cos(angle) * orbitRadius;
      ref.current.position.y = Math.sin(angle) * orbitRadius * Math.cos(orbitTilt);
      ref.current.position.z = Math.sin(angle) * orbitRadius * Math.sin(orbitTilt);
    }
  });
  
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.08, 16, 16]} />
      <meshStandardMaterial 
        color="#4dabf7" 
        emissive="#4dabf7" 
        emissiveIntensity={0.5}
        roughness={0.2}
      />
    </mesh>
  );
}

/**
 * Electron orbit ring visualization
 */
function ElectronOrbit({ radius, tilt = 0 }) {
  const points = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 64; i++) {
      const angle = (i / 64) * Math.PI * 2;
      pts.push(new THREE.Vector3(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius * Math.cos(tilt),
        Math.sin(angle) * radius * Math.sin(tilt)
      ));
    }
    return pts;
  }, [radius, tilt]);
  
  return (
    <Line 
      points={points} 
      color="#4dabf7" 
      lineWidth={1} 
      transparent 
      opacity={0.3}
    />
  );
}

/**
 * Nucleus with protons and neutrons
 */
function Nucleus({ protons, neutrons }) {
  const particles = useMemo(() => {
    const result = [];
    const total = protons + neutrons;
    
    // Arrange particles in a sphere-like pattern
    for (let i = 0; i < total; i++) {
      const phi = Math.acos(-1 + (2 * i) / total);
      const theta = Math.sqrt(total * Math.PI) * phi;
      const radius = 0.25 * Math.cbrt(total / 10);
      
      result.push({
        type: i < protons ? 'proton' : 'neutron',
        position: [
          radius * Math.cos(theta) * Math.sin(phi),
          radius * Math.sin(theta) * Math.sin(phi),
          radius * Math.cos(phi)
        ]
      });
    }
    return result;
  }, [protons, neutrons]);
  
  return (
    <group>
      {particles.map((p, i) => (
        p.type === 'proton' 
          ? <Proton key={i} position={p.position} />
          : <Neutron key={i} position={p.position} />
      ))}
    </group>
  );
}

/**
 * Complete Atomic Structure (Bohr Model)
 */
function AtomicStructure({ element }) {
  const atomicNumber = element.atomicNumber || element.atomic_number || 1;
  const protons = atomicNumber;
  // Approximate neutrons (actual values vary by isotope)
  const neutrons = Math.round(atomicNumber * 1.1);
  
  // Electron configuration by shells
  const getElectronShells = (z) => {
    const shells = [];
    let remaining = z;
    const maxPerShell = [2, 8, 18, 32, 32, 18, 8];
    
    for (let i = 0; i < maxPerShell.length && remaining > 0; i++) {
      const inShell = Math.min(remaining, maxPerShell[i]);
      shells.push(inShell);
      remaining -= inShell;
    }
    return shells;
  };
  
  const shells = getElectronShells(atomicNumber);
  
  return (
    <Float speed={0.5} rotationIntensity={0.2} floatIntensity={0.2}>
      <group>
        {/* Nucleus */}
        <Nucleus protons={protons} neutrons={neutrons} />
        
        {/* Electron shells */}
        {shells.map((electronCount, shellIndex) => {
          const radius = 1 + shellIndex * 0.8;
          const tilt = (shellIndex * Math.PI) / 6;
          
          return (
            <group key={shellIndex}>
              {/* Orbit ring */}
              <ElectronOrbit radius={radius} tilt={tilt} />
              
              {/* Electrons in this shell */}
              {[...Array(electronCount)].map((_, i) => (
                <Electron
                  key={i}
                  orbitRadius={radius}
                  speed={2 - shellIndex * 0.3}
                  startAngle={(i / electronCount) * Math.PI * 2}
                  orbitTilt={tilt}
                />
              ))}
            </group>
          );
        })}
      </group>
    </Float>
  );
}

// ============================================
// Simple Atom (for molecules)
// ============================================

function SimpleAtom({ position = [0, 0, 0], element = 'C', radius = 0.5, atomicRadius }) {
  const meshRef = useRef();
  const color = getElementColor(element);
  const size = atomicRadius ? normalizeRadius(atomicRadius) : radius;
  
  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
      </mesh>
    </group>
  );
}

// ============================================
// Bond between atoms
// ============================================

function Bond({ start, end, bondType = 'single' }) {
  const bondGeometry = useMemo(() => {
    const startVec = new THREE.Vector3(...start);
    const endVec = new THREE.Vector3(...end);
    const direction = new THREE.Vector3().subVectors(endVec, startVec);
    const length = direction.length();
    const center = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5);
    const up = new THREE.Vector3(0, 1, 0);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction.normalize());
    return { length, center, quaternion };
  }, [start, end]);
  
  const bondCount = bondType === 'double' ? 2 : bondType === 'triple' ? 3 : 1;
  const offset = 0.12;
  
  return (
    <group position={bondGeometry.center.toArray()} quaternion={bondGeometry.quaternion}>
      {[...Array(bondCount)].map((_, i) => {
        const xOffset = bondCount > 1 ? (i - (bondCount - 1) / 2) * offset : 0;
        return (
          <mesh key={i} position={[xOffset, 0, 0]}>
            <cylinderGeometry args={[0.05, 0.05, bondGeometry.length * 0.9, 8]} />
            <meshStandardMaterial color="#888888" roughness={0.4} metalness={0.3} />
          </mesh>
        );
      })}
    </group>
  );
}

// ============================================
// Molecule group
// ============================================

function Molecule({ atoms = [], bonds = [], position = [0, 0, 0], animate = false }) {
  const groupRef = useRef();
  
  useFrame((state) => {
    if (animate && groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });
  
  return (
    <Float speed={1} rotationIntensity={animate ? 0.2 : 0} floatIntensity={animate ? 0.3 : 0}>
      <group ref={groupRef} position={position}>
        {bonds.map((bond, index) => (
          <Bond
            key={`bond-${index}`}
            start={atoms[bond.from]?.position || [0, 0, 0]}
            end={atoms[bond.to]?.position || [0, 0, 0]}
            bondType={bond.type || 'single'}
          />
        ))}
        {atoms.map((atom, index) => (
          <SimpleAtom
            key={`atom-${index}`}
            position={atom.position}
            element={atom.element}
            atomicRadius={atom.atomicRadius}
          />
        ))}
      </group>
    </Float>
  );
}

// ============================================
// Energy Particles Effect
// ============================================

function EnergyParticles({ active = false, type = 'exothermic', position = [0, 0, 0] }) {
  const particlesRef = useRef();
  const particleCount = 100;
  
  const particles = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 6;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 6;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
      
      velocities[i * 3] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
    }
    
    return { positions, velocities };
  }, []);
  
  useFrame(() => {
    if (!active || !particlesRef.current) return;
    
    const positions = particlesRef.current.geometry.attributes.position.array;
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] += particles.velocities[i * 3];
      positions[i * 3 + 1] += particles.velocities[i * 3 + 1];
      positions[i * 3 + 2] += particles.velocities[i * 3 + 2];
      
      // Reset particles that go too far
      const dist = Math.sqrt(
        positions[i * 3] ** 2 + 
        positions[i * 3 + 1] ** 2 + 
        positions[i * 3 + 2] ** 2
      );
      if (dist > 5) {
        positions[i * 3] = (Math.random() - 0.5) * 2;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 2;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 2;
      }
    }
    
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });
  
  if (!active) return null;
  
  const color = type === 'exothermic' ? '#ff6b6b' : '#4dabf7';
  
  return (
    <points ref={particlesRef} position={position}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={particles.positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color={color}
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
}

// ============================================
// Scene lighting
// ============================================

function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
      <pointLight position={[-10, -10, -5]} intensity={0.3} color="#6366f1" />
      <pointLight position={[10, -10, 5]} intensity={0.3} color="#da77f2" />
    </>
  );
}

// ============================================
// Demo Molecules
// ============================================

const DEMO_MOLECULES = {
  water: {
    name: 'Agua (H₂O)',
    atoms: [
      { element: 'O', position: [0, 0, 0], atomicRadius: 48 },
      { element: 'H', position: [-0.8, 0.6, 0], atomicRadius: 53 },
      { element: 'H', position: [0.8, 0.6, 0], atomicRadius: 53 },
    ],
    bonds: [
      { from: 0, to: 1, type: 'single' },
      { from: 0, to: 2, type: 'single' },
    ],
  },
  carbonDioxide: {
    name: 'Dióxido de Carbono (CO₂)',
    atoms: [
      { element: 'C', position: [0, 0, 0], atomicRadius: 67 },
      { element: 'O', position: [-1.2, 0, 0], atomicRadius: 48 },
      { element: 'O', position: [1.2, 0, 0], atomicRadius: 48 },
    ],
    bonds: [
      { from: 0, to: 1, type: 'double' },
      { from: 0, to: 2, type: 'double' },
    ],
  },
  methane: {
    name: 'Metano (CH₄)',
    atoms: [
      { element: 'C', position: [0, 0, 0], atomicRadius: 67 },
      { element: 'H', position: [0.6, 0.6, 0.6], atomicRadius: 53 },
      { element: 'H', position: [-0.6, -0.6, 0.6], atomicRadius: 53 },
      { element: 'H', position: [0.6, -0.6, -0.6], atomicRadius: 53 },
      { element: 'H', position: [-0.6, 0.6, -0.6], atomicRadius: 53 },
    ],
    bonds: [
      { from: 0, to: 1, type: 'single' },
      { from: 0, to: 2, type: 'single' },
      { from: 0, to: 3, type: 'single' },
      { from: 0, to: 4, type: 'single' },
    ],
  },
  sodiumChloride: {
    name: 'Cloruro de Sodio (NaCl)',
    atoms: [
      { element: 'Na', position: [-0.7, 0, 0], atomicRadius: 190 },
      { element: 'Cl', position: [0.7, 0, 0], atomicRadius: 79 },
    ],
    bonds: [
      { from: 0, to: 1, type: 'single' },
    ],
  },
};

// ============================================
// Main Component
// ============================================

export default function ReactionViewer({ 
  reactionData = null,
  selectedElements = [],
}) {
  const [currentMolecule, setCurrentMolecule] = useState('water');
  const [showParticles, setShowParticles] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [viewMode, setViewMode] = useState('molecule'); // 'molecule' | 'atomic'
  
  // Determine what to display
  const displayData = useMemo(() => {
    // Show atomic structure for single element in atomic mode
    if (viewMode === 'atomic' && selectedElements.length === 1) {
      return { type: 'atomic', element: selectedElements[0] };
    }
    
    if (reactionData?.animation_data) {
      return { type: 'molecule', data: reactionData.animation_data };
    }
    
    if (selectedElements.length > 0) {
      return {
        type: 'molecule',
        data: {
          name: 'Elementos Seleccionados',
          atoms: selectedElements.map((el, i) => ({
            element: el.symbol,
            position: [(i % 4) * 2 - 3, Math.floor(i / 4) * 2, 0],
            atomicRadius: el.atomicRadius || 100,
          })),
          bonds: [],
        }
      };
    }
    
    return { type: 'molecule', data: DEMO_MOLECULES[currentMolecule] };
  }, [reactionData, selectedElements, currentMolecule, viewMode]);
  
  const togglePlay = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);
  
  const resetAnimation = useCallback(() => {
    setIsPlaying(false);
    setShowParticles(false);
  }, []);
  
  const toggleParticles = useCallback(() => {
    setShowParticles(prev => !prev);
  }, []);
  
  const toggleViewMode = useCallback(() => {
    setViewMode(prev => prev === 'molecule' ? 'atomic' : 'molecule');
  }, []);
  
  const displayName = displayData.type === 'atomic' 
    ? `Estructura Atómica: ${displayData.element.symbol}`
    : (displayData.data?.name || 'Visualización 3D');
  
  return (
    <div className="glass-card">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <h2 className="text-xl font-bold">{displayName}</h2>
        
        <div className="flex gap-2 items-center">
          {/* View mode toggle */}
          {selectedElements.length === 1 && (
            <button
              onClick={toggleViewMode}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                viewMode === 'atomic' 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
            >
              {viewMode === 'atomic' ? '⚛️ Estructura Atómica' : '🔵 Vista Molecular'}
            </button>
          )}
          
          {/* Molecule selector */}
          {!reactionData && selectedElements.length === 0 && (
            <select
              value={currentMolecule}
              onChange={(e) => setCurrentMolecule(e.target.value)}
              className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 text-sm"
            >
              {Object.entries(DEMO_MOLECULES).map(([key, mol]) => (
                <option key={key} value={key}>{mol.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>
      
      {/* 3D Canvas */}
      <div className="viewer-container" style={{ height: '450px', borderRadius: '12px', overflow: 'hidden' }}>
        <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
          <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={50} />
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={3}
            maxDistance={20}
            autoRotate={isPlaying}
            autoRotateSpeed={1}
          />
          
          <SceneLighting />
          <Environment preset="city" />
          
          {/* Render based on view mode */}
          {displayData.type === 'atomic' ? (
            <AtomicStructure element={displayData.element} />
          ) : (
            <Molecule
              atoms={displayData.data?.atoms || []}
              bonds={displayData.data?.bonds || []}
              animate={isPlaying}
            />
          )}
          
          {/* Energy particles */}
          <EnergyParticles 
            active={showParticles}
            type={reactionData?.energy_change || 'exothermic'}
          />
          
          <gridHelper args={[10, 10, '#333333', '#222222']} position={[0, -3, 0]} />
        </Canvas>
        
        {/* Viewer Controls */}
        <div className="viewer-controls" style={{
          position: 'absolute',
          bottom: '1rem',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '0.5rem',
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(10px)',
          padding: '0.5rem 1rem',
          borderRadius: '50px',
        }}>
          <motion.button
            className="btn btn-icon btn-secondary"
            style={{ width: '40px', height: '40px', borderRadius: '50%', border: 'none', cursor: 'pointer' }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={togglePlay}
            title={isPlaying ? 'Pausar' : 'Reproducir'}
          >
            {isPlaying ? '⏸️' : '▶️'}
          </motion.button>
          
          <motion.button
            className="btn btn-icon btn-secondary"
            style={{ width: '40px', height: '40px', borderRadius: '50%', border: 'none', cursor: 'pointer' }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={resetAnimation}
            title="Reiniciar"
          >
            🔄
          </motion.button>
          
          <motion.button
            className="btn btn-icon btn-secondary"
            style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%', 
              border: showParticles ? '2px solid #ffd43b' : 'none', 
              cursor: 'pointer',
              background: showParticles ? 'rgba(255, 212, 59, 0.3)' : undefined
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleParticles}
            title="Efectos de energía"
          >
            ✨
          </motion.button>
        </div>
        
        {/* Fixed Element Info Overlay */}
        {viewMode === 'atomic' && selectedElements.length === 1 && (
          <div style={{
            position: 'absolute',
            top: '1rem',
            left: '1rem',
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(10px)',
            padding: '1rem',
            borderRadius: '12px',
            color: 'white',
            zIndex: 10,
            minWidth: '180px',
          }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', textAlign: 'center' }}>
              {selectedElements[0].symbol}
            </div>
            <div style={{ textAlign: 'center', opacity: 0.8, marginBottom: '0.5rem' }}>
              {selectedElements[0].nameEs || selectedElements[0].name}
            </div>
            <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div><span style={{ color: '#ff4444' }}>⊕</span> Protones: {selectedElements[0].atomicNumber || selectedElements[0].atomic_number}</div>
              <div><span style={{ color: '#888888' }}>○</span> Neutrones: ~{Math.round((selectedElements[0].atomicNumber || selectedElements[0].atomic_number || 1) * 1.1)}</div>
              <div><span style={{ color: '#4dabf7' }}>⊖</span> Electrones: {selectedElements[0].atomicNumber || selectedElements[0].atomic_number}</div>
            </div>
          </div>
        )}
      </div>
      
      {/* Legend for atomic view */}
      {viewMode === 'atomic' && selectedElements.length === 1 && (
        <div className="mt-4 p-3 rounded-lg text-sm" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
          <div className="flex justify-center gap-6 flex-wrap">
            <span><span style={{ color: '#ff4444' }}>●</span> Protones (+)</span>
            <span><span style={{ color: '#888888' }}>●</span> Neutrones (0)</span>
            <span><span style={{ color: '#4dabf7' }}>●</span> Electrones (-)</span>
          </div>
        </div>
      )}
      
      {/* Instructions */}
      <p className="text-sm text-gray-400 mt-4 text-center">
        🖱️ Arrastra para rotar • Scroll para zoom • Shift+arrastrar para mover
        {selectedElements.length === 1 && ' • Click en "⚛️ Estructura Atómica" para ver electrones'}
      </p>
    </div>
  );
}
