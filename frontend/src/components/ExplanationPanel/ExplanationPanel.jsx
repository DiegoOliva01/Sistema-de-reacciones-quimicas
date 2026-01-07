import { motion } from 'framer-motion'

const levelLabels = {
  basic: 'Básico',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
}

const reactionTypeLabels = {
  'synthesis': 'Síntesis',
  'decomposition': 'Descomposición',
  'single-replacement': 'Sustitución Simple',
  'double-replacement': 'Sustitución Doble',
  'combustion': 'Combustión',
  'acid-base': 'Ácido-Base',
  'redox': 'Oxidación-Reducción',
  'precipitation': 'Precipitación',
}

function ExplanationPanel({ reaction, explanation, level, onLevelChange }) {
  if (!reaction) return null

  return (
    <div className="space-y-4">
      {/* Header with equation */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-xl font-semibold text-white">{reaction.equation}</h3>
          <div className="flex gap-2 mt-2">
            <span className={`
              px-2 py-1 rounded text-xs font-medium
              ${reaction.is_exothermic ? 'bg-red-500/30 text-red-300' : 'bg-blue-500/30 text-blue-300'}
            `}>
              {reaction.is_exothermic ? '🔥 Exotérmica' : '❄️ Endotérmica'}
            </span>
            <span className="px-2 py-1 rounded text-xs font-medium bg-purple-500/30 text-purple-300">
              {reactionTypeLabels[reaction.reaction_type] || reaction.reaction_type}
            </span>
            {reaction.enthalpy_change && (
              <span className="px-2 py-1 rounded text-xs font-medium bg-slate-500/30 text-slate-300">
                ΔH = {reaction.enthalpy_change} kJ/mol
              </span>
            )}
          </div>
        </div>

        {/* Level selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">Nivel:</span>
          <div className="flex rounded-lg overflow-hidden border border-slate-600">
            {Object.entries(levelLabels).map(([key, label]) => (
              <button
                key={key}
                onClick={() => onLevelChange(key)}
                className={`
                  px-3 py-1.5 text-sm transition-colors
                  ${level === key 
                    ? 'bg-indigo-500 text-white' 
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }
                `}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Explanation text */}
      <motion.div
        key={explanation}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-lg bg-slate-800/50 border border-slate-700"
      >
        <h4 className="text-sm font-semibold text-indigo-400 mb-2 flex items-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" />
          </svg>
          Explicación Científica
        </h4>
        <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
          {explanation || reaction.description || 'Cargando explicación...'}
        </p>
      </motion.div>

      {/* Applications */}
      {reaction.real_world_applications && reaction.real_world_applications.length > 0 && (
        <div className="p-4 rounded-lg bg-emerald-900/20 border border-emerald-700/30">
          <h4 className="text-sm font-semibold text-emerald-400 mb-2 flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Aplicaciones del Mundo Real
          </h4>
          <ul className="flex flex-wrap gap-2">
            {reaction.real_world_applications.map((app, idx) => (
              <li
                key={idx}
                className="px-3 py-1 rounded-full bg-emerald-800/40 text-emerald-200 text-sm"
              >
                {app}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Reaction details */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
          <h5 className="text-slate-400 mb-1">Reactivos</h5>
          <div className="flex flex-wrap gap-1">
            {reaction.reactants?.map((r, idx) => (
              <span key={idx} className="px-2 py-0.5 bg-slate-700 rounded font-mono text-cyan-300">
                {r.count > 1 && r.count}{r.symbol || r.formula}
              </span>
            ))}
          </div>
        </div>
        <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
          <h5 className="text-slate-400 mb-1">Productos</h5>
          <div className="flex flex-wrap gap-1">
            {reaction.products?.map((p, idx) => (
              <span key={idx} className="px-2 py-0.5 bg-slate-700 rounded font-mono text-emerald-300">
                {p.count > 1 && p.count}{p.formula}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExplanationPanel
