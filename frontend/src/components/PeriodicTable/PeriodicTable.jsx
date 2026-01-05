/**
 * Interactive Periodic Table Component
 * Renders all 118 elements with selection capability
 */
import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { elementsData, getCategoryInfo } from '../../data/elements';

// Grid positions for the periodic table layout
const getGridPosition = (element) => {
  const { period, group, category, atomicNumber } = element;
  
  // Lanthanides (57-71) go in row 9
  if (category === 'lanthanide') {
    const lanthanideIndex = atomicNumber - 57;
    return { row: 9, col: lanthanideIndex + 3 };
  }
  
  // Actinides (89-103) go in row 10
  if (category === 'actinide') {
    const actinideIndex = atomicNumber - 89;
    return { row: 10, col: actinideIndex + 3 };
  }
  
  return { row: period, col: group };
};

// Element Cell Component
function ElementCell({ element, isSelected, onSelect, onHover }) {
  const categoryClass = element.category.replace('-', '-');
  
  // Animation variants
  const variants = {
    initial: { scale: 0, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        type: 'spring',
        stiffness: 260,
        damping: 20,
        delay: element.atomicNumber * 0.005
      }
    },
    hover: { 
      scale: 1.15,
      zIndex: 10,
      transition: { type: 'spring', stiffness: 400, damping: 25 }
    },
    tap: { scale: 0.95 },
    selected: {
      scale: 1.2,
      zIndex: 20,
      boxShadow: '0 0 30px currentColor',
    }
  };
  
  const handleClick = useCallback((e) => {
    // Ctrl/Cmd + click for multi-select
    onSelect(element, e.ctrlKey || e.metaKey);
  }, [element, onSelect]);
  
  return (
    <motion.div
      className={`element-cell ${categoryClass} ${isSelected ? 'selected' : ''}`}
      variants={variants}
      initial="initial"
      animate={isSelected ? 'selected' : 'animate'}
      whileHover="hover"
      whileTap="tap"
      onClick={handleClick}
      onMouseEnter={() => onHover(element)}
      onMouseLeave={() => onHover(null)}
      style={{
        gridRow: getGridPosition(element).row,
        gridColumn: getGridPosition(element).col,
      }}
      role="button"
      aria-label={`${element.nameEs} (${element.symbol})`}
      tabIndex={0}
    >
      <span className="element-number">{element.atomicNumber}</span>
      <span className="element-symbol">{element.symbol}</span>
      <span className="element-name">{element.nameEs}</span>
    </motion.div>
  );
}

// Tooltip Component
function ElementTooltip({ element, position }) {
  if (!element) return null;
  
  const category = getCategoryInfo(element.category);
  
  return (
    <motion.div
      className="tooltip"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      style={{
        position: 'fixed',
        top: position.y + 20,
        left: position.x,
        transform: 'translateX(-50%)',
      }}
    >
      <div className="font-bold text-lg">{element.symbol} - {element.nameEs}</div>
      <div className="text-sm opacity-70">{category.name}</div>
      <div className="text-sm mt-1">
        <span>Masa atómica: </span>
        <span className="font-mono">{element.atomicMass}</span>
      </div>
      {element.electronegativity && (
        <div className="text-sm">
          <span>Electronegatividad: </span>
          <span className="font-mono">{element.electronegativity}</span>
        </div>
      )}
    </motion.div>
  );
}

// Selection Summary Component
function SelectionSummary({ selectedElements, onRemove, onClear, onValidate }) {
  if (selectedElements.length === 0) {
    return (
      <div className="selection-summary">
        <span className="text-secondary">
          Selecciona elementos para buscar reacciones (Ctrl+click para múltiples)
        </span>
      </div>
    );
  }
  
  return (
    <div className="selection-summary">
      {selectedElements.map((element) => (
        <motion.div
          key={element.symbol}
          className="selected-element-tag"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          layout
        >
          <span>{element.symbol}</span>
          <button 
            onClick={() => onRemove(element)}
            aria-label={`Quitar ${element.nameEs}`}
          >
            ×
          </button>
        </motion.div>
      ))}
      
      <div className="ml-auto flex gap-2">
        <button className="btn btn-secondary" onClick={onClear}>
          Limpiar
        </button>
        {selectedElements.length >= 2 && (
          <motion.button 
            className="btn btn-primary"
            onClick={onValidate}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Buscar Reacciones
          </motion.button>
        )}
      </div>
    </div>
  );
}

// Category Legend Component
function CategoryLegend() {
  const categories = [
    { key: 'alkali-metal', name: 'Metales Alcalinos' },
    { key: 'alkaline-earth', name: 'Alcalinotérreos' },
    { key: 'transition-metal', name: 'Metales de Transición' },
    { key: 'post-transition-metal', name: 'Post-transición' },
    { key: 'metalloid', name: 'Metaloides' },
    { key: 'nonmetal', name: 'No Metales' },
    { key: 'halogen', name: 'Halógenos' },
    { key: 'noble-gas', name: 'Gases Nobles' },
    { key: 'lanthanide', name: 'Lantánidos' },
    { key: 'actinide', name: 'Actínidos' },
  ];
  
  return (
    <div className="flex flex-wrap gap-2 p-4 justify-center">
      {categories.map(({ key, name }) => {
        const info = getCategoryInfo(key);
        return (
          <div 
            key={key}
            className="flex items-center gap-2 text-xs"
          >
            <div 
              className="w-3 h-3 rounded"
              style={{ backgroundColor: info.color }}
            />
            <span className="text-secondary">{name}</span>
          </div>
        );
      })}
    </div>
  );
}

// Main Periodic Table Component
export default function PeriodicTable({ onSelectionChange, onValidateReaction }) {
  const [selectedElements, setSelectedElements] = useState([]);
  const [hoveredElement, setHoveredElement] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Memoize selected symbols for quick lookup
  const selectedSymbols = useMemo(
    () => new Set(selectedElements.map(el => el.symbol)),
    [selectedElements]
  );
  
  // Handle element selection
  const handleSelect = useCallback((element, isMultiSelect) => {
    setSelectedElements(prev => {
      const isAlreadySelected = prev.some(el => el.symbol === element.symbol);
      
      if (isAlreadySelected) {
        // Remove from selection
        const newSelection = prev.filter(el => el.symbol !== element.symbol);
        onSelectionChange?.(newSelection);
        return newSelection;
      }
      
      if (isMultiSelect) {
        // Add to selection (max 10 elements)
        if (prev.length >= 10) return prev;
        const newSelection = [...prev, element];
        onSelectionChange?.(newSelection);
        return newSelection;
      }
      
      // Replace selection
      onSelectionChange?.([element]);
      return [element];
    });
  }, [onSelectionChange]);
  
  // Handle hover with position tracking
  const handleHover = useCallback((element) => {
    setHoveredElement(element);
  }, []);
  
  // Track mouse position for tooltip
  const handleMouseMove = useCallback((e) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  }, []);
  
  // Remove element from selection
  const handleRemove = useCallback((element) => {
    setSelectedElements(prev => {
      const newSelection = prev.filter(el => el.symbol !== element.symbol);
      onSelectionChange?.(newSelection);
      return newSelection;
    });
  }, [onSelectionChange]);
  
  // Clear selection
  const handleClear = useCallback(() => {
    setSelectedElements([]);
    onSelectionChange?.([]);
  }, [onSelectionChange]);
  
  // Validate reaction
  const handleValidate = useCallback(() => {
    const symbols = selectedElements.map(el => el.symbol);
    onValidateReaction?.(symbols);
  }, [selectedElements, onValidateReaction]);
  
  return (
    <div className="glass-card" onMouseMove={handleMouseMove}>
      <h2 className="text-2xl font-bold mb-4 text-center">
        Tabla Periódica Interactiva
      </h2>
      
      <CategoryLegend />
      
      <div 
        className="periodic-table"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(18, minmax(40px, 1fr))',
          gridTemplateRows: 'repeat(10, minmax(40px, 1fr))',
          gap: '4px',
        }}
      >
        {elementsData.map((element) => (
          <ElementCell
            key={element.atomicNumber}
            element={element}
            isSelected={selectedSymbols.has(element.symbol)}
            onSelect={handleSelect}
            onHover={handleHover}
          />
        ))}
      </div>
      
      <AnimatePresence>
        <ElementTooltip 
          element={hoveredElement} 
          position={mousePosition}
        />
      </AnimatePresence>
      
      <div className="mt-4">
        <SelectionSummary
          selectedElements={selectedElements}
          onRemove={handleRemove}
          onClear={handleClear}
          onValidate={handleValidate}
        />
      </div>
    </div>
  );
}
