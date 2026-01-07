import axios from 'axios'

// Base URL - uses Vite proxy in development
const API_BASE = '/api'

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Fetch all elements for the periodic table
 */
export async function getElements() {
  try {
    const response = await api.get('/elements/')
    return response.data
  } catch (error) {
    console.error('Error fetching elements:', error)
    throw new Error('No se pudieron cargar los elementos')
  }
}

/**
 * Fetch periodic table organized by period/group
 */
export async function getPeriodicTable() {
  try {
    const response = await api.get('/elements/periodic_table/')
    return response.data
  } catch (error) {
    console.error('Error fetching periodic table:', error)
    throw new Error('No se pudo cargar la tabla periódica')
  }
}

/**
 * Validate if a reaction exists for the given elements
 * @param {string[]} symbols - Array of element symbols
 */
export async function validateReaction(symbols) {
  try {
    const response = await api.post('/reactions/validate/', {
      elements: symbols,
    })
    return response.data
  } catch (error) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error.message)
    }
    throw new Error('Error al validar la reacción')
  }
}

/**
 * Get AI explanation for a reaction
 * @param {number} reactionId - Reaction ID
 * @param {string} level - 'basic', 'intermediate', or 'advanced'
 */
export async function getReactionExplanation(reactionId, level = 'intermediate') {
  try {
    const response = await api.post('/reactions/explain/', {
      reaction_id: reactionId,
      level: level,
    })
    return response.data
  } catch (error) {
    console.error('Error getting explanation:', error)
    throw new Error('Error al obtener la explicación')
  }
}

/**
 * Get single element details
 * @param {string} symbol - Element symbol
 */
export async function getElement(symbol) {
  try {
    const response = await api.get(`/elements/${symbol}/`)
    return response.data
  } catch (error) {
    console.error('Error fetching element:', error)
    throw new Error(`No se encontró el elemento ${symbol}`)
  }
}

/**
 * Get all reactions
 */
export async function getReactions() {
  try {
    const response = await api.get('/reactions/')
    return response.data
  } catch (error) {
    console.error('Error fetching reactions:', error)
    throw new Error('No se pudieron cargar las reacciones')
  }
}

/**
 * Get AI explanation for a single element
 * @param {string} symbol - Element symbol
 * @param {string} level - 'basic', 'intermediate', or 'advanced'
 */
export async function getElementExplanation(symbol, level = 'intermediate') {
  try {
    const response = await api.post('/elements/explain/', {
      symbol: symbol,
      level: level,
    })
    return response.data
  } catch (error) {
    console.error('Error getting element explanation:', error)
    throw new Error('Error al obtener la explicación del elemento')
  }
}

export default api
