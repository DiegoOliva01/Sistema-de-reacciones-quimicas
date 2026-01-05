/**
 * API Service for backend communication.
 * Handles all HTTP requests with proper error handling.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Generic fetch wrapper with error handling
 */
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };
  
  try {
    const response = await fetch(url, config);
    
    // Check if response has content
    const contentType = response.headers.get('content-type');
    const text = await response.text();
    
    // If empty response
    if (!text) {
      throw new Error('El servidor devolvió una respuesta vacía');
    }
    
    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error('Response not JSON:', text.substring(0, 200));
      throw new Error('Respuesta del servidor no es JSON válido');
    }
    
    if (!response.ok) {
      throw new Error(data.error?.message || data.error || data.detail || 'Error en la solicitud');
    }
    
    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

// ============================================
// Elements API
// ============================================

export const elementsAPI = {
  /**
   * Get all elements for periodic table display
   */
  async getAll() {
    return fetchAPI('/elements/');
  },
  
  /**
   * Get element by symbol
   */
  async getBySymbol(symbol) {
    return fetchAPI(`/elements/symbol/${symbol}/`);
  },
  
  /**
   * Get periodic table organized data
   */
  async getPeriodicTable() {
    return fetchAPI('/elements/periodic-table/');
  },
  
  /**
   * Get 3D visualization data
   */
  async get3DData() {
    return fetchAPI('/elements/3d-data/');
  },
  
  /**
   * Get elements by category
   */
  async getByCategory(category) {
    return fetchAPI(`/elements/category/${category}/`);
  },
};

// ============================================
// Reactions API
// ============================================

export const reactionsAPI = {
  /**
   * Get all verified reactions
   */
  async getAll(filters = {}) {
    const params = new URLSearchParams();
    if (filters.type) params.append('type', filters.type);
    if (filters.difficulty) params.append('difficulty', filters.difficulty);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchAPI(`/reactions/${query}`);
  },
  
  /**
   * Get reaction by ID
   */
  async getById(id) {
    return fetchAPI(`/reactions/${id}/`);
  },
  
  /**
   * Validate element combination to find reactions
   */
  async validate(elementSymbols) {
    return fetchAPI('/reactions/validate/', {
      method: 'POST',
      body: JSON.stringify({ element_symbols: elementSymbols }),
    });
  },
  
  /**
   * Get 3D animation data for a reaction
   */
  async getAnimation(id) {
    return fetchAPI(`/reactions/${id}/animation/`);
  },
  
  /**
   * Get reactions by type
   */
  async getByType(type) {
    return fetchAPI(`/reactions/by-type/${type}/`);
  },
};

// ============================================
// Molecules API
// ============================================

export const moleculesAPI = {
  /**
   * Get all molecules
   */
  async getAll() {
    return fetchAPI('/molecules/');
  },
  
  /**
   * Search molecules by formula or name
   */
  async search(query) {
    return fetchAPI(`/molecules/search/?q=${encodeURIComponent(query)}`);
  },
  
  /**
   * Get molecule by formula
   */
  async getByFormula(formula) {
    return fetchAPI(`/molecules/${formula}/`);
  },
};

// ============================================
// AI Explanation API
// ============================================

export const aiAPI = {
  /**
   * Get AI explanation for a reaction
   */
  async explainReaction(reactionId) {
    return fetchAPI('/ai/explain-reaction/', {
      method: 'POST',
      body: JSON.stringify({ reaction_id: reactionId }),
    });
  },
  
  /**
   * Get AI explanation for an element
   */
  async explainElement(symbol) {
    return fetchAPI('/ai/explain-element/', {
      method: 'POST',
      body: JSON.stringify({ symbol }),
    });
  },
  
  /**
   * Check AI service status
   */
  async getStatus() {
    return fetchAPI('/ai/status/');
  },
};

export default {
  elements: elementsAPI,
  reactions: reactionsAPI,
  molecules: moleculesAPI,
  ai: aiAPI,
};
