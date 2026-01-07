import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PeriodicTable from './components/PeriodicTable/PeriodicTable'
import ReactionViewer from './components/ReactionViewer/ReactionViewer'
import ExplanationPanel from './components/ExplanationPanel/ExplanationPanel'
import { validateReaction, getReactionExplanation, getElements, getElementExplanation } from './services/api'

// Traducciones de tipos de reacción
const reactionTypeTranslations = {
  'synthesis': 'Síntesis',
  'decomposition': 'Descomposición',
  'single-replacement': 'Sustitución Simple',
  'double-replacement': 'Sustitución Doble',
  'combustion': 'Combustión',
  'acid-base': 'Ácido-Base',
  'redox': 'Oxidación-Reducción',
  'precipitation': 'Precipitación',
}

function App() {
  const [selectedElements, setSelectedElements] = useState([])
  const [reaction, setReaction] = useState(null)
  const [explanation, setExplanation] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [explanationLevel, setExplanationLevel] = useState('intermediate')
  const [showReaction, setShowReaction] = useState(false)
  const [activeElement, setActiveElement] = useState(null) // Element being viewed in detail
  const [viewAtomicModel, setViewAtomicModel] = useState(false)
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false)
  const [suggestions, setSuggestions] = useState([]) // Suggested reactions

  const handleElementSelect = useCallback((element) => {
    // Set activeElement for the info panel
    setActiveElement(element)
    
    setSelectedElements(prev => {
      const isSelected = prev.some(e => e.symbol === element.symbol)
      if (isSelected) {
        return prev.filter(e => e.symbol !== element.symbol)
      }
      if (prev.length >= 5) {
        return prev // Max 5 elements
      }
      return [...prev, element]
    })
    // Clear previous reaction and states when selecting new elements
    setReaction(null)
    setExplanation(null)
    setShowReaction(false)
    setViewAtomicModel(false)
    setSuggestions([])
    setIsLoading(false) // Reset loading state
    setError(null) // Clear any errors
  }, [])

  const handleReact = async () => {
    if (selectedElements.length < 1) return

    setIsLoading(true)
    setError(null)
    setSuggestions([])

    try {
      const symbols = selectedElements.map(e => e.symbol)
      const result = await validateReaction(symbols)
      
      if (result.found && result.reactions && result.reactions.length > 0) {
        setReaction(result.reactions[0])
        setShowReaction(true)
        
        // Get AI explanation
        try {
          const expResult = await getReactionExplanation(
            result.reactions[0].id,
            explanationLevel
          )
          setExplanation(expResult.explanation)
        } catch (expError) {
          // Use fallback description if AI fails
          setExplanation(result.reactions[0].description || 'Explicación no disponible.')
        }
      } else if (result.suggestions && result.suggestions.length > 0) {
        // Show suggestions
        setSuggestions(result.suggestions)
        if (symbols.length === 1) {
          setError(`Reacciones posibles con ${symbols[0]}:`)
        } else {
          setError(`No hay reacción directa entre ${symbols.join(' + ')}. Mira las sugerencias:`)
        }
      } else {
        // No reactions found at all
        const elementNames = symbols.join(', ')
        setError(`No se encontraron reacciones con ${elementNames} en la base de datos. Prueba con otros elementos como H, O, Na, Cl, Fe, Cu, etc.`)
      }
    } catch (err) {
      console.error('Error validating reaction:', err)
      setError(err.message || 'Error al validar la reacción. Verifica que el servidor esté en ejecución.')
    } finally {
      setIsLoading(false)
    }
  }

  // Función para obtener/regenerar explicación IA
  const handleGetExplanation = async (level) => {
    if (!reaction) return
    
    setIsLoadingExplanation(true)
    setExplanationLevel(level)
    
    try {
      const expResult = await getReactionExplanation(reaction.id, level)
      setExplanation(expResult.explanation)
    } catch (expError) {
      console.error('Error getting explanation:', expError)
      setExplanation(reaction.description || 'No se pudo obtener la explicación.')
    } finally {
      setIsLoadingExplanation(false)
    }
  }

  const handleClear = () => {
    setSelectedElements([])
    setReaction(null)
    setExplanation(null)
    setShowReaction(false)
    setError(null)
    setViewAtomicModel(false)
    setActiveElement(null)
    setSuggestions([])
  }

  // Función para seleccionar una sugerencia y cargar sus elementos
  const handleSelectSuggestion = async (suggestion) => {
    // Extraer símbolos de los reactantes de la sugerencia
    const elementSymbols = []
    if (suggestion.reactants) {
      for (const reactant of suggestion.reactants) {
        if (reactant.symbol) {
          elementSymbols.push(reactant.symbol)
        }
      }
    }
    
    // Crear objetos de elementos simplificados para los seleccionados
    const elementsToSelect = elementSymbols.map(symbol => ({
      symbol,
      name: symbol, // Nombre básico, se actualizará si tenemos más info
      atomic_number: null
    }))
    
    // Actualizar estados
    setSelectedElements(elementsToSelect)
    setReaction(suggestion)
    setShowReaction(true)
    setSuggestions([])
    setError(null)
    
    // Obtener explicación IA
    try {
      const expResult = await getReactionExplanation(suggestion.id, explanationLevel)
      setExplanation(expResult.explanation)
    } catch (expError) {
      setExplanation(suggestion.description || 'Explicación no disponible.')
    }
  }

  const handleViewAtomicModel = () => {
    if (activeElement) {
      // Add to selected if not already
      if (!selectedElements.some(e => e.symbol === activeElement.symbol)) {
        setSelectedElements(prev => [...prev, activeElement])
      }
      setViewAtomicModel(true)
    }
  }

  // Función para ver todas las combinaciones posibles de un elemento
  const handleShowElementReactions = async () => {
    if (!activeElement) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      // Buscar reacciones donde participe este elemento
      const symbols = [activeElement.symbol]
      const result = await validateReaction(symbols)
      
      if (result.suggestions && result.suggestions.length > 0) {
        setSuggestions(result.suggestions)
        setError(`Reacciones posibles con ${activeElement.name} (${activeElement.symbol}):`)
      } else if (result.found && result.reactions.length > 0) {
        setSuggestions(result.reactions)
        setError(`Reacciones posibles con ${activeElement.name} (${activeElement.symbol}):`)
      } else {
        setError(`No se encontraron reacciones con ${activeElement.name} en la base de datos.`)
      }
    } catch (err) {
      setError(err.message || 'Error al buscar reacciones')
    } finally {
      setIsLoading(false)
    }
  }

  // Función para analizar un elemento con IA
  const handleAnalyzeElement = async () => {
    if (!activeElement) return
    
    setIsLoadingExplanation(true)
    setError(null)
    setReaction(null)
    setSuggestions([])
    
    try {
      const result = await getElementExplanation(activeElement.symbol, explanationLevel)
      setExplanation(result.explanation)
    } catch (err) {
      console.error('Error analyzing element:', err)
      setError('No se pudo obtener el análisis del elemento. Verifica que el servidor esté en ejecución.')
    } finally {
      setIsLoadingExplanation(false)
    }
  }

  return (
    <div className="min-h-screen p-2 md:p-4">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-4"
      >
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
          Sistema de Reacciones Químicas
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Selecciona elementos de la tabla • Visualiza modelos atómicos en 3D • Genera explicaciones con IA
        </p>
      </motion.header>

      {/* Control Bar - Selected Elements & Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-panel p-3 mb-4 flex flex-wrap items-center gap-3"
      >
        <span className="text-slate-400 text-sm">Seleccionados:</span>
        <div className="flex gap-2 flex-wrap flex-1">
          {selectedElements.length > 0 ? (
            selectedElements.map((el) => (
              <span
                key={el.symbol}
                className="px-2 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/50 font-mono text-sm cursor-pointer hover:bg-indigo-500/50"
                onClick={() => handleElementSelect(el)}
                title="Clic para deseleccionar"
              >
                {el.symbol}
              </span>
            ))
          ) : (
            <span className="text-slate-500 text-sm">Ninguno - Haz clic en los elementos de la tabla</span>
          )}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleClear}
            disabled={selectedElements.length === 0}
            className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors text-sm disabled:opacity-50"
          >
            Limpiar
          </button>
          <button
            onClick={handleReact}
            disabled={isLoading || selectedElements.length < 1}
            className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 transition-all text-sm font-medium disabled:opacity-50"
          >
            {isLoading ? 'Analizando...' : selectedElements.length === 1 ? '🔍 Ver Reacciones' : '⚗️ Reaccionar'}
          </button>
        </div>
      </motion.div>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-panel p-3 mb-4 border-l-4 border-amber-500 bg-amber-500/10"
          >
            <p className="text-amber-200 text-sm">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Suggestions Panel */}
      <AnimatePresence>
        {suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-panel p-4 mb-4 border-l-4 border-indigo-500 bg-indigo-500/10"
          >
            <h3 className="text-indigo-300 text-sm font-semibold mb-3">💡 Sugerencias de reacciones posibles (haz clic para seleccionar):</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectSuggestion(suggestion)}
                  className="text-left p-3 rounded-lg bg-slate-700/50 hover:bg-indigo-600/30 transition-colors border border-slate-600 hover:border-indigo-500"
                >
                  <span className="text-cyan-400 font-mono text-sm block">{suggestion.equation}</span>
                  <p className="text-indigo-300 text-xs mt-1">
                    {reactionTypeTranslations[suggestion.reaction_type] || suggestion.reaction_type}
                  </p>
                  {suggestion.reactants && (
                    <p className="text-slate-500 text-[10px] mt-1">
                      Elementos: {suggestion.reactants.map(r => r.symbol).filter(Boolean).join(', ')}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left: Periodic Table (full width on mobile, 70% on desktop) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-panel p-3 lg:flex-[7] overflow-x-auto"
        >
          <PeriodicTable
            onElementSelect={handleElementSelect}
            selectedElements={selectedElements}
          />
        </motion.div>

        {/* Right Column: Element Info + 3D Viewer + Explanation */}
        <div className="lg:flex-[3] space-y-4">
          {/* Element Info Panel */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-panel p-4"
          >
            <h3 className="text-lg font-semibold text-slate-300 mb-3">
              {activeElement ? 'Información del Elemento' : 'Elemento'}
            </h3>
            {activeElement ? (
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-bold text-indigo-400">{activeElement.symbol}</div>
                  <div>
                    <div className="text-xl text-slate-300">{activeElement.atomic_number}</div>
                    <div className="text-slate-400 text-xs">Número atómico</div>
                  </div>
                </div>
                <h4 className="text-lg font-medium text-white">{activeElement.name}</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400">Masa:</span>
                    <span className="ml-1 text-slate-200">{activeElement.atomic_mass?.toFixed(3)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Valencia:</span>
                    <span className="ml-1 text-slate-200">{activeElement.valence_electrons}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400">Categoría:</span>
                    <span className="ml-1 text-slate-200 capitalize">{activeElement.category?.replace(/-/g, ' ')}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 mt-3">
                  <button
                    onClick={handleViewAtomicModel}
                    className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm transition-colors font-medium"
                  >
                    🔬 Ver Modelo Atómico 3D
                  </button>
                  <button
                    onClick={handleShowElementReactions}
                    disabled={isLoading}
                    className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm transition-colors font-medium disabled:opacity-50"
                  >
                    {isLoading ? 'Buscando...' : '⚗️ Ver Combinaciones Posibles'}
                  </button>
                  <button
                    onClick={handleAnalyzeElement}
                    disabled={isLoadingExplanation}
                    className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm transition-colors font-medium disabled:opacity-50"
                  >
                    {isLoadingExplanation ? '🤖 Analizando...' : '🤖 Analizar con IA'}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-slate-500 text-center py-4 text-sm">
                Haz clic en un elemento de la tabla para ver sus detalles
              </p>
            )}
          </motion.div>

          {/* 3D Viewer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-panel p-3 h-[300px]"
          >
            <ReactionViewer
              reaction={reaction}
              showAnimation={showReaction}
              selectedElements={selectedElements}
              viewAtomicModel={viewAtomicModel}
            />
          </motion.div>

          {/* AI Explanation Controls - Always visible when elements selected */}
          {reaction && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel p-4"
            >
              <h3 className="text-md font-semibold text-slate-300 mb-3">🤖 Explicación IA (DeepSeek)</h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {['basic', 'intermediate', 'advanced'].map((level) => (
                  <button
                    key={level}
                    onClick={() => handleGetExplanation(level)}
                    disabled={isLoadingExplanation}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      explanationLevel === level
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    } disabled:opacity-50`}
                  >
                    {isLoadingExplanation && explanationLevel === level ? (
                      'Generando...'
                    ) : (
                      level === 'basic' ? '📚 Básico' : level === 'intermediate' ? '🎓 Intermedio' : '🔬 Avanzado'
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Explanation Panel */}
          <AnimatePresence>
            {explanation && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="glass-panel p-4"
              >
                {reaction ? (
                  <ExplanationPanel
                    reaction={reaction}
                    explanation={explanation}
                    level={explanationLevel}
                    onLevelChange={(level) => handleGetExplanation(level)}
                  />
                ) : (
                  /* Element-only explanation panel */
                  <div className="space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div>
                        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                          🤖 Análisis de {activeElement?.name || 'Elemento'}
                          <span className="text-indigo-400">({activeElement?.symbol})</span>
                        </h3>
                        <div className="flex gap-2 mt-2">
                          <span className="px-2 py-1 rounded text-xs font-medium bg-purple-500/30 text-purple-300">
                            Generado por IA
                          </span>
                          <span className="px-2 py-1 rounded text-xs font-medium bg-indigo-500/30 text-indigo-300">
                            Nivel: {explanationLevel === 'basic' ? 'Básico' : explanationLevel === 'intermediate' ? 'Intermedio' : 'Avanzado'}
                          </span>
                        </div>
                      </div>
                      {/* Level selector for element analysis */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-400">Nivel:</span>
                        <div className="flex rounded-lg overflow-hidden border border-slate-600">
                          {['basic', 'intermediate', 'advanced'].map((lvl) => (
                            <button
                              key={lvl}
                              onClick={() => {
                                setExplanationLevel(lvl)
                                handleAnalyzeElement()
                              }}
                              disabled={isLoadingExplanation}
                              className={`px-3 py-1.5 text-sm transition-colors disabled:opacity-50 ${
                                explanationLevel === lvl 
                                  ? 'bg-indigo-500 text-white' 
                                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                              }`}
                            >
                              {lvl === 'basic' ? 'Básico' : lvl === 'intermediate' ? 'Intermedio' : 'Avanzado'}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                      <h4 className="text-sm font-semibold text-indigo-400 mb-2 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" />
                        </svg>
                        Explicación Científica
                      </h4>
                      <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {explanation}
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-6 text-center text-slate-500 text-xs">
        <p>Sistema educativo de reacciones químicas • React + Three.js + Django + DeepSeek</p>
      </footer>
    </div>
  )
}

export default App
