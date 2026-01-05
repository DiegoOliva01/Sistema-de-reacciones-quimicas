/**
 * AI Explanation Component
 * Displays AI-generated explanations for reactions and elements
 */
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { aiAPI } from '../../services/api';

/**
 * Markdown-like text renderer
 * Converts basic markdown to styled HTML
 */
function FormattedText({ text }) {
  if (!text) return null;
  
  // Simple markdown parsing
  const lines = text.split('\n');
  
  return (
    <div className="explanation-content">
      {lines.map((line, index) => {
        // Headers
        if (line.startsWith('### ')) {
          return <h3 key={index} className="text-lg font-semibold mt-4 mb-2 text-primary-light">{line.slice(4)}</h3>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={index} className="text-xl font-bold mt-4 mb-2 text-primary-light">{line.slice(3)}</h2>;
        }
        if (line.startsWith('# ')) {
          return <h1 key={index} className="text-2xl font-bold mt-4 mb-3 text-primary-light">{line.slice(2)}</h1>;
        }
        
        // Bold text
        const boldPattern = /\*\*(.*?)\*\*/g;
        let formattedLine = line.replace(boldPattern, '<strong>$1</strong>');
        
        // Italic text
        const italicPattern = /\*(.*?)\*/g;
        formattedLine = formattedLine.replace(italicPattern, '<em>$1</em>');
        
        // List items
        if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
          return (
            <li 
              key={index} 
              className="ml-4 mb-1"
              dangerouslySetInnerHTML={{ __html: formattedLine.slice(2) }}
            />
          );
        }
        
        // Numbered list
        const numberedMatch = line.trim().match(/^(\d+)\.\s/);
        if (numberedMatch) {
          return (
            <li 
              key={index} 
              className="ml-4 mb-1 list-decimal"
              dangerouslySetInnerHTML={{ __html: line.slice(numberedMatch[0].length) }}
            />
          );
        }
        
        // Empty lines
        if (!line.trim()) {
          return <br key={index} />;
        }
        
        // Regular paragraph
        return (
          <p 
            key={index} 
            className="mb-2 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: formattedLine }}
          />
        );
      })}
    </div>
  );
}

/**
 * Loading skeleton
 */
function LoadingSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-6 bg-tertiary rounded w-3/4"></div>
      <div className="h-4 bg-tertiary rounded w-full"></div>
      <div className="h-4 bg-tertiary rounded w-5/6"></div>
      <div className="h-4 bg-tertiary rounded w-4/6"></div>
      <div className="h-6 bg-tertiary rounded w-1/2 mt-4"></div>
      <div className="h-4 bg-tertiary rounded w-full"></div>
      <div className="h-4 bg-tertiary rounded w-3/4"></div>
    </div>
  );
}

/**
 * Error display
 */
function ErrorDisplay({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <div className="text-4xl">⚠️</div>
      <p className="text-secondary text-center">{message}</p>
      <button 
        onClick={onRetry}
        className="btn btn-primary"
      >
        Reintentar
      </button>
    </div>
  );
}

/**
 * AI Explanation Panel Component
 */
export default function AIExplanation({ 
  reaction = null,
  element = null,
  autoLoad = false 
}) {
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [source, setSource] = useState(null);
  
  // Fetch explanation
  const fetchExplanation = useCallback(async () => {
    if (!reaction && !element) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let result;
      
      if (reaction) {
        console.log('Fetching reaction explanation for ID:', reaction.id);
        result = await aiAPI.explainReaction(reaction.id);
      } else if (element) {
        const symbolToUse = element.symbol;
        console.log('Fetching element explanation for:', symbolToUse);
        result = await aiAPI.explainElement(symbolToUse);
      }
      
      console.log('AI API result:', result);
      
      if (result && result.success) {
        setExplanation(result.explanation);
        setSource(result.source);
      } else if (result) {
        setError(result.error || 'No se pudo obtener la explicación.');
        if (result.fallback) {
          setExplanation(result.fallback);
          setSource('fallback');
        }
      } else {
        setError('Respuesta vacía del servidor.');
      }
    } catch (err) {
      console.error('AI fetch error:', err);
      setError(`Error: ${err.message || 'Error de conexión. Verifica tu conexión a internet.'}`);
    } finally {
      setLoading(false);
    }
  }, [reaction, element]);
  
  // Auto-load if enabled
  // useEffect(() => {
  //   if (autoLoad && (reaction || element)) {
  //     fetchExplanation();
  //   }
  // }, [autoLoad, reaction, element, fetchExplanation]);
  
  // No content state
  if (!reaction && !element) {
    return (
      <div className="glass-card">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span>🤖</span>
          <span>Explicación con IA</span>
        </h2>
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🔬</div>
          <p className="text-secondary">
            Selecciona elementos y busca una reacción para obtener 
            una explicación científica detallada.
          </p>
        </div>
      </div>
    );
  }
  
  // Title based on content
  const elementName = element ? (element.nameEs || element.name_es || element.name || element.symbol) : '';
  const title = reaction 
    ? `Explicación: ${reaction.name || reaction.equation}`
    : `Sobre: ${elementName} (${element?.symbol || ''})`;
  
  return (
    <motion.div 
      className="glass-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <span>🤖</span>
          <span>Explicación con IA</span>
        </h2>
        
        {source && (
          <span className={`text-xs px-2 py-1 rounded ${
            source === 'gemini' 
              ? 'bg-green-500/20 text-green-400' 
              : 'bg-yellow-500/20 text-yellow-400'
          }`}>
            {source === 'gemini' ? '✨ Gemini AI' : '📚 Base de datos'}
          </span>
        )}
      </div>
      
      {/* Content info */}
      <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
        <p className="text-sm font-medium">{title}</p>
      </div>
      
      {/* Load button */}
      {!explanation && !loading && !error && (
        <motion.button
          className="btn btn-primary w-full"
          onClick={fetchExplanation}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span>✨</span>
          <span>Generar Explicación con IA</span>
        </motion.button>
      )}
      
      {/* Loading state */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LoadingSkeleton />
            <p className="text-center text-secondary mt-4 text-sm">
              Generando explicación con Gemini AI...
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Error state */}
      {error && !explanation && (
        <ErrorDisplay message={error} onRetry={fetchExplanation} />
      )}
      
      {/* Explanation content */}
      <AnimatePresence>
        {explanation && (
          <motion.div
            className="explanation-panel mt-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <FormattedText text={explanation} />
            
            {/* Regenerate button */}
            <div className="mt-6 pt-4 border-t border-glass flex justify-between items-center">
              <span className="text-xs text-secondary">
                Generado por inteligencia artificial. 
                Verifica la información con fuentes adicionales.
              </span>
              <button
                onClick={fetchExplanation}
                disabled={loading}
                className="btn btn-secondary text-sm"
              >
                🔄 Regenerar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
