/**
 * Sistema de Reacciones Químicas
 * Main Application Component
 */
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PeriodicTable from './components/PeriodicTable';
import ReactionViewer from './components/ReactionViewer';
import AIExplanation from './components/AIExplanation';
import { reactionsAPI } from './services/api';
import './index.css';

/**
 * Header Component
 */
function Header() {
  return (
    <header className="glass-card mb-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <motion.div 
            className="text-4xl"
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            ⚗️
          </motion.div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Sistema de Reacciones Químicas
            </h1>
            <p className="text-secondary text-sm">
              Explora la tabla periódica y visualiza reacciones en 3D
            </p>
          </div>
        </div>
        
        <nav className="flex gap-4">
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-secondary text-sm"
          >
            📚 Documentación
          </a>
        </nav>
      </div>
    </header>
  );
}

/**
 * Reaction Result Card Component
 */
function ReactionCard({ reaction, onSelect, isSelected }) {
  return (
    <motion.div
      className={`p-4 rounded-lg cursor-pointer transition-all ${
        isSelected 
          ? 'bg-primary-dark border-2 border-primary' 
          : 'bg-tertiary hover:bg-tertiary/80'
      }`}
      style={{ backgroundColor: isSelected ? 'var(--color-primary-dark)' : 'var(--bg-tertiary)' }}
      onClick={() => onSelect(reaction)}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <h3 className="font-bold">{reaction.name}</h3>
      <p className="text-lg font-mono text-secondary">{reaction.equation}</p>
      <div className="flex gap-2 mt-2 flex-wrap">
        <span className="text-xs px-2 py-1 rounded-full bg-indigo-500/20 text-indigo-300">
          {reaction.reaction_type_display}
        </span>
        <span className={`text-xs px-2 py-1 rounded-full ${
          reaction.energy_change === 'exothermic' 
            ? 'bg-red-500/20 text-red-300' 
            : 'bg-blue-500/20 text-blue-300'
        }`}>
          {reaction.energy_change_display}
        </span>
        {reaction.is_reversible && (
          <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-300">
            ⇌ Reversible
          </span>
        )}
      </div>
    </motion.div>
  );
}

/**
 * No Reactions Found Message
 */
function NoReactionsMessage({ message, suggestions }) {
  return (
    <motion.div
      className="glass-card text-center py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="text-5xl mb-4">🔬</div>
      <p className="text-lg text-secondary mb-4">{message}</p>
      
      {suggestions && suggestions.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-semibold mb-2">Sugerencias:</p>
          <ul className="text-sm text-secondary">
            {suggestions.map((s, i) => (
              <li key={i} className="mb-1">💡 {s}</li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}

/**
 * Main App Component
 */
export default function App() {
  // State
  const [selectedElements, setSelectedElements] = useState([]);
  const [reactions, setReactions] = useState([]);
  const [selectedReaction, setSelectedReaction] = useState(null);
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Handle element selection change
  const handleSelectionChange = useCallback((elements) => {
    setSelectedElements(elements);
    // Clear previous search when selection changes
    if (elements.length < 2) {
      setReactions([]);
      setSelectedReaction(null);
      setSearchResult(null);
    }
  }, []);
  
  // Validate selected elements for reactions
  const handleValidateReaction = useCallback(async (symbols) => {
    setLoading(true);
    setError(null);
    setSelectedReaction(null);
    
    try {
      const result = await reactionsAPI.validate(symbols);
      setSearchResult(result);
      
      if (result.found) {
        setReactions(result.reactions || []);
      } else {
        setReactions([]);
      }
    } catch (err) {
      console.error('Validation error:', err);
      setError(err.message || 'Error al buscar reacciones. Intenta de nuevo.');
      setReactions([]);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Handle reaction selection
  const handleSelectReaction = useCallback((reaction) => {
    setSelectedReaction(reaction);
  }, []);
  
  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-[1800px] mx-auto">
        <Header />
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Left Column: Periodic Table */}
          <div className="space-y-6">
            <PeriodicTable 
              onSelectionChange={handleSelectionChange}
              onValidateReaction={handleValidateReaction}
            />
            
            {/* Search Results */}
            <AnimatePresence>
              {loading && (
                <motion.div 
                  className="glass-card text-center py-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="spinner mx-auto mb-4" />
                  <p className="text-secondary">Buscando reacciones...</p>
                </motion.div>
              )}
              
              {error && (
                <motion.div 
                  className="glass-card text-center py-8 border-l-4 border-red-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <p className="text-red-400">⚠️ {error}</p>
                </motion.div>
              )}
              
              {!loading && searchResult && !searchResult.found && (
                <NoReactionsMessage 
                  message={searchResult.message}
                  suggestions={searchResult.suggestions}
                />
              )}
              
              {!loading && reactions.length > 0 && (
                <motion.div 
                  className="glass-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h2 className="text-xl font-bold mb-4">
                    Reacciones Encontradas ({reactions.length})
                  </h2>
                  <div className="space-y-3">
                    {reactions.map((reaction) => (
                      <ReactionCard
                        key={reaction.id}
                        reaction={reaction}
                        onSelect={handleSelectReaction}
                        isSelected={selectedReaction?.id === reaction.id}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Right Column: 3D Viewer + AI Explanation */}
          <div className="space-y-6">
            <ReactionViewer 
              reactionData={selectedReaction}
              selectedElements={selectedElements}
            />
            
            <AIExplanation 
              reaction={selectedReaction}
              element={selectedElements.length === 1 ? selectedElements[0] : null}
            />
          </div>
        </div>
        
        {/* Footer */}
        <footer className="mt-12 py-6 text-center text-secondary text-sm">
          <p>
            Sistema de Reacciones Químicas • 
            Desarrollado con React, Three.js y Django • 
            Powered by Gemini AI
          </p>
          <p className="mt-2 text-xs opacity-60">
            ⚠️ Esta aplicación es solo para fines educativos. 
            Las reacciones químicas reales pueden ser peligrosas.
          </p>
        </footer>
      </div>
    </div>
  );
}
