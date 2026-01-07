import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getElements } from '../../services/api'

// Periodic table layout - [row, col] positions for each element
const PERIODIC_TABLE_LAYOUT = {
  H: [0, 0], He: [0, 17],
  Li: [1, 0], Be: [1, 1], B: [1, 12], C: [1, 13], N: [1, 14], O: [1, 15], F: [1, 16], Ne: [1, 17],
  Na: [2, 0], Mg: [2, 1], Al: [2, 12], Si: [2, 13], P: [2, 14], S: [2, 15], Cl: [2, 16], Ar: [2, 17],
  K: [3, 0], Ca: [3, 1], Sc: [3, 2], Ti: [3, 3], V: [3, 4], Cr: [3, 5], Mn: [3, 6], Fe: [3, 7], Co: [3, 8], Ni: [3, 9], Cu: [3, 10], Zn: [3, 11], Ga: [3, 12], Ge: [3, 13], As: [3, 14], Se: [3, 15], Br: [3, 16], Kr: [3, 17],
  Rb: [4, 0], Sr: [4, 1], Y: [4, 2], Zr: [4, 3], Nb: [4, 4], Mo: [4, 5], Tc: [4, 6], Ru: [4, 7], Rh: [4, 8], Pd: [4, 9], Ag: [4, 10], Cd: [4, 11], In: [4, 12], Sn: [4, 13], Sb: [4, 14], Te: [4, 15], I: [4, 16], Xe: [4, 17],
  Cs: [5, 0], Ba: [5, 1], La: [5, 2], Hf: [5, 3], Ta: [5, 4], W: [5, 5], Re: [5, 6], Os: [5, 7], Ir: [5, 8], Pt: [5, 9], Au: [5, 10], Hg: [5, 11], Tl: [5, 12], Pb: [5, 13], Bi: [5, 14], Po: [5, 15], At: [5, 16], Rn: [5, 17],
  Fr: [6, 0], Ra: [6, 1], Ac: [6, 2], Rf: [6, 3], Db: [6, 4], Sg: [6, 5], Bh: [6, 6], Hs: [6, 7], Mt: [6, 8], Ds: [6, 9], Rg: [6, 10], Cn: [6, 11], Nh: [6, 12], Fl: [6, 13], Mc: [6, 14], Lv: [6, 15], Ts: [6, 16], Og: [6, 17],
  // Lanthanides
  Ce: [8, 3], Pr: [8, 4], Nd: [8, 5], Pm: [8, 6], Sm: [8, 7], Eu: [8, 8], Gd: [8, 9], Tb: [8, 10], Dy: [8, 11], Ho: [8, 12], Er: [8, 13], Tm: [8, 14], Yb: [8, 15], Lu: [8, 16],
  // Actinides  
  Th: [9, 3], Pa: [9, 4], U: [9, 5], Np: [9, 6], Pu: [9, 7], Am: [9, 8], Cm: [9, 9], Bk: [9, 10], Cf: [9, 11], Es: [9, 12], Fm: [9, 13], Md: [9, 14], No: [9, 15], Lr: [9, 16],
}

// Category to CSS class mapping
const categoryClasses = {
  'alkali-metal': 'category-alkali-metal',
  'alkaline-earth': 'category-alkaline-earth',
  'transition-metal': 'category-transition-metal',
  'post-transition-metal': 'category-post-transition-metal',
  'metalloid': 'category-metalloid',
  'nonmetal': 'category-nonmetal',
  'halogen': 'category-halogen',
  'noble-gas': 'category-noble-gas',
  'lanthanide': 'category-lanthanide',
  'actinide': 'category-actinide',
}

// Traducciones de categorías al español
const categoryTranslations = {
  'alkali-metal': 'Metal Alcalino',
  'alkaline-earth': 'Alcalinotérreo',
  'transition-metal': 'Metal de Transición',
  'post-transition-metal': 'Metal Post-Transición',
  'metalloid': 'Metaloide',
  'nonmetal': 'No Metal',
  'halogen': 'Halógeno',
  'noble-gas': 'Gas Noble',
  'lanthanide': 'Lantánido',
  'actinide': 'Actínido',
}

function PeriodicTable({ onElementSelect, selectedElements = [], onElementHover }) {
  const [elements, setElements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadElements() {
      try {
        const data = await getElements()
        setElements(data)
      } catch (error) {
        console.error('Failed to load elements:', error)
      } finally {
        setLoading(false)
      }
    }
    loadElements()
  }, [])

  const isSelected = (symbol) => selectedElements.some(e => e.symbol === symbol)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    )
  }

  // Create grid
  const grid = Array(10).fill(null).map(() => Array(18).fill(null))
  
  elements.forEach(element => {
    const pos = PERIODIC_TABLE_LAYOUT[element.symbol]
    if (pos) {
      grid[pos[0]][pos[1]] = element
    }
  })

  return (
    <div className="relative">
      <h2 className="text-md font-semibold mb-2 text-slate-300">Tabla Periódica</h2>
      
      {/* Grid */}
      <div className="grid gap-0.5" style={{ gridTemplateColumns: 'repeat(18, minmax(38px, 1fr))' }}>
        {grid.map((row, rowIdx) => (
          row.map((element, colIdx) => (
            <div key={`${rowIdx}-${colIdx}`} className="min-h-[42px]">
              {element && (
                <motion.button
                  whileHover={{ scale: 1.05, zIndex: 10 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onElementSelect(element)}
                  onMouseEnter={() => onElementHover?.(element)}
                  className={`
                    element-cell w-full
                    ${categoryClasses[element.category] || 'bg-slate-600'}
                    ${isSelected(element.symbol) ? 'selected' : ''}
                  `}
                >
                  <span className="element-number">{element.atomic_number}</span>
                  <span className="element-symbol">{element.symbol}</span>
                  <span className="element-name">{element.name}</span>
                </motion.button>
              )}
            </div>
          ))
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-2 text-[10px]">
        {Object.entries(categoryClasses).map(([category, className]) => (
          <div key={category} className="flex items-center gap-1">
            <div className={`w-3 h-3 rounded ${className}`}></div>
            <span className="text-slate-400">{categoryTranslations[category]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PeriodicTable
