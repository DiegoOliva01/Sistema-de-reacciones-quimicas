# Funcionamiento del Código - Sistema de Reacciones Químicas

## 📁 Estructura del Proyecto

```
Sistema-de-reacciones-quimicas/
│
├── backend/                    # API REST con Django
│   ├── config/                 # Configuración principal Django
│   │   ├── settings.py         # Configuraciones del proyecto
│   │   ├── urls.py             # Rutas principales
│   │   └── wsgi.py             # Servidor WSGI
│   │
│   ├── elements/               # App de Elementos Químicos
│   │   ├── models.py           # Modelo Element
│   │   ├── fixtures/           # Datos JSON (elements_part1/2/3.json)
│   │   └── migrations/         # Migraciones de DB
│   │
│   ├── reactions/              # App de Reacciones Químicas
│   │   ├── models.py           # Modelos Reaction, ReactionElement
│   │   ├── fixtures/           # Datos JSON (reactions_part1...5.json)
│   │   └── migrations/         # Migraciones de DB
│   │
│   ├── api/                    # API REST Framework
│   │   ├── views.py            # ViewSets (ElementViewSet, ReactionViewSet)
│   │   ├── serializers.py      # Serializers para JSON
│   │   ├── urls.py             # Rutas de la API
│   │   └── exceptions.py       # Manejadores de errores
│   │
│   ├── ai_service/             # Servicio de IA
│   │   ├── service.py          # DeepSeekService (conexión Ollama)
│   │   └── views.py            # (vacío, lógica en api/views.py)
│   │
│   ├── manage.py               # Script de gestión Django
│   ├── requirements.txt        # Dependencias Python
│   └── db.sqlite3              # Base de datos SQLite
│
├── frontend/                   # Aplicación React
│   ├── src/
│   │   ├── App.jsx             # Componente principal
│   │   ├── main.jsx            # Punto de entrada React
│   │   ├── index.css           # Estilos globales
│   │   │
│   │   ├── components/
│   │   │   ├── PeriodicTable/  # Tabla periódica interactiva
│   │   │   ├── ReactionViewer/ # Visualizador 3D
│   │   │   └── ExplanationPanel/ # Panel de explicaciones
│   │   │
│   │   ├── services/
│   │   │   └── api.js          # Cliente Axios para backend
│   │   │
│   │   └── styles/
│   │       └── elements.css    # Estilos de elementos
│   │
│   ├── vite.config.js          # Configuración Vite
│   ├── tailwind.config.js      # Configuración Tailwind
│   └── package.json            # Dependencias Node
│
├── DOCUMENTO_TECNICO.md        # Documentación técnica
├── MANUAL_USUARIO.md           # Guía de usuario
├── FUNCIONAMIENTO_CODIGO.md    # Este documento
└── README.md                   # Introducción rápida
```

---

## 🔙 Backend (Django)

### Flujo de una Petición

```
Usuario → Frontend → Vite Proxy → Django URLs → ViewSet → Serializer → Response
```

### config/settings.py

```python
# Aplicaciones instaladas
INSTALLED_APPS = [
    'rest_framework',       # Django REST Framework
    'corsheaders',          # Manejo de CORS
    'elements',             # App de elementos
    'reactions',            # App de reacciones
    'api',                  # ViewSets y endpoints
    'ai_service',           # Integración con Ollama
]

# Configuración de IA
OLLAMA_BASE_URL = 'http://localhost:11434'
OLLAMA_MODEL = 'llama3.2:latest'
```

### elements/models.py - Modelo Element

```python
class Element(models.Model):
    symbol = CharField(max_length=3)          # "H", "He", "Li"...
    atomic_number = IntegerField()            # 1, 2, 3...
    electrons_per_shell = JSONField()         # [2, 8, 1] para Na
    
    def get_electron_shells(self):
        """Retorna datos para visualización 3D."""
        shells = []
        for i, count in enumerate(self.electrons_per_shell):
            shells.append({
                'shell': i + 1,
                'electrons': count,
                'radius': 1.0 + (i * 0.8)     # Radio para Three.js
            })
        return shells
```

### reactions/models.py - Modelo Reaction

```python
class Reaction(models.Model):
    equation = CharField()          # "2H₂ + O₂ → 2H₂O"
    reactants = JSONField()         # [{symbol: "H", count: 4}, ...]
    products = JSONField()          # [{formula: "H2O", count: 2}, ...]
    enthalpy_change = FloatField()  # -572 (kJ/mol)
    is_exothermic = BooleanField()  # True si libera energía
    
    def get_element_symbols(self):
        """Retorna símbolos de elementos involucrados."""
        symbols = set()
        for reactant in self.reactants:
            if 'symbol' in reactant:
                symbols.add(reactant['symbol'])
        return list(symbols)
```

### api/views.py - ViewSets

```python
class ElementViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Element.objects.all()
    lookup_field = 'symbol'  # Buscar por símbolo, no por ID
    
    @action(methods=['post'])
    def explain(self, request):
        """Genera explicación IA de un elemento."""
        symbol = request.data.get('symbol')
        element = Element.objects.get(symbol=symbol)
        ai_service = DeepSeekService()
        explanation = ai_service.explain_element(element)
        return Response({'explanation': explanation})

class ReactionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Reaction.objects.all()
    
    @action(methods=['post'])
    def validate(self, request):
        """Busca reacciones con los elementos dados."""
        elements = request.data.get('elements')  # ["H", "O"]
        reactions = self.find_reactions_for_elements(elements)
        return Response({'reactions': reactions})
    
    @action(methods=['post'])
    def explain(self, request):
        """Genera explicación IA de una reacción."""
        reaction_id = request.data.get('reaction_id')
        level = request.data.get('level', 'intermediate')
        reaction = Reaction.objects.get(id=reaction_id)
        ai_service = DeepSeekService()
        explanation = ai_service.explain_reaction(reaction, level)
        return Response({'explanation': explanation})
```

### ai_service/service.py - Servicio de IA

```python
class DeepSeekService:
    def __init__(self):
        self.base_url = 'http://localhost:11434'
        self.model = 'llama3.2:latest'
        self.timeout = 120
    
    def is_available(self):
        """Verifica si Ollama está disponible."""
        response = requests.get(f"{self.base_url}/api/tags")
        return response.status_code == 200
    
    def explain_reaction(self, reaction, level):
        """Genera explicación de una reacción."""
        prompt = self._build_prompt(reaction, level)
        
        if not self.is_available():
            return self._get_fallback_explanation(reaction)
        
        response = self._call_ollama(prompt)
        return self._clean_response(response)
    
    def _call_ollama(self, prompt):
        """Llama a Ollama con streaming."""
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": True,
            "options": {
                "temperature": 0.7,
                "num_predict": 400,
                "num_ctx": 2048
            }
        }
        
        full_response = ""
        with requests.post(url, json=payload, stream=True) as response:
            for line in response.iter_lines():
                data = json.loads(line)
                full_response += data.get('response', '')
        
        return full_response
```

---

## 🎨 Frontend (React)

### Flujo de la Aplicación

```
App.jsx (Estado global)
    │
    ├── PeriodicTable.jsx      → Carga elementos, maneja clicks
    │       │
    │       └── api.js         → getElements() → GET /api/elements/
    │
    ├── ReactionViewer.jsx     → Visualización 3D con Three.js
    │
    └── ExplanationPanel.jsx   → Muestra explicación de IA
```

### src/App.jsx - Componente Principal

```jsx
function App() {
  // Estados principales
  const [selectedElements, setSelectedElements] = useState([])
  const [reaction, setReaction] = useState(null)
  const [explanation, setExplanation] = useState(null)
  const [activeElement, setActiveElement] = useState(null)
  
  // Seleccionar elemento de la tabla
  const handleElementSelect = useCallback((element) => {
    setActiveElement(element)
    setSelectedElements(prev => {
      if (prev.some(e => e.symbol === element.symbol)) {
        return prev.filter(e => e.symbol !== element.symbol)
      }
      if (prev.length >= 5) return prev
      return [...prev, element]
    })
  }, [])
  
  // Buscar reacción con los elementos seleccionados
  const handleReact = async () => {
    const symbols = selectedElements.map(e => e.symbol)
    const result = await validateReaction(symbols)
    
    if (result.found) {
      setReaction(result.reactions[0])
      // Obtener explicación IA
      const exp = await getReactionExplanation(result.reactions[0].id)
      setExplanation(exp.explanation)
    }
  }
  
  // Analizar elemento con IA
  const handleAnalyzeElement = async () => {
    const result = await getElementExplanation(activeElement.symbol)
    setExplanation(result.explanation)
  }
  
  return (
    <div>
      <PeriodicTable onElementSelect={handleElementSelect} />
      <ReactionViewer reaction={reaction} />
      <ExplanationPanel explanation={explanation} />
    </div>
  )
}
```

### src/components/PeriodicTable/PeriodicTable.jsx

```jsx
function PeriodicTable({ onElementSelect, selectedElements }) {
  const [elements, setElements] = useState([])
  
  // Cargar elementos al montar
  useEffect(() => {
    async function loadElements() {
      const data = await getElements()  // API call
      setElements(data)
    }
    loadElements()
  }, [])
  
  // Layout de la tabla (posiciones fijas)
  const PERIODIC_TABLE_LAYOUT = {
    H: [0, 0], He: [0, 17],
    Li: [1, 0], Be: [1, 1], ...
  }
  
  return (
    <div className="grid" style={{ gridTemplateColumns: 'repeat(18, 1fr)' }}>
      {elements.map(element => (
        <button
          key={element.symbol}
          onClick={() => onElementSelect(element)}
          className={categoryClasses[element.category]}
        >
          <span>{element.atomic_number}</span>
          <span>{element.symbol}</span>
          <span>{element.name}</span>
        </button>
      ))}
    </div>
  )
}
```

### src/services/api.js - Cliente HTTP

```javascript
import axios from 'axios'

const api = axios.create({
  baseURL: '/api',  // Proxy de Vite redirige a localhost:8000
})

export async function getElements() {
  const response = await api.get('/elements/')
  return response.data
}

export async function validateReaction(symbols) {
  const response = await api.post('/reactions/validate/', {
    elements: symbols
  })
  return response.data
}

export async function getReactionExplanation(reactionId, level) {
  const response = await api.post('/reactions/explain/', {
    reaction_id: reactionId,
    level: level
  })
  return response.data
}

export async function getElementExplanation(symbol, level) {
  const response = await api.post('/elements/explain/', {
    symbol: symbol,
    level: level
  })
  return response.data
}
```

### src/components/ReactionViewer/ReactionViewer.jsx

```jsx
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sphere } from '@react-three/drei'

function ReactionViewer({ reaction, selectedElements, viewAtomicModel }) {
  // Visualizar modelo atómico de un elemento
  if (viewAtomicModel && selectedElements.length > 0) {
    const element = selectedElements[selectedElements.length - 1]
    return (
      <Canvas>
        <OrbitControls />
        <ambientLight />
        <AtomicModel element={element} />
      </Canvas>
    )
  }
  
  // Visualizar reacción
  if (reaction) {
    return (
      <Canvas>
        <ReactionAnimation reaction={reaction} />
      </Canvas>
    )
  }
}

function AtomicModel({ element }) {
  // Renderizar núcleo y capas electrónicas
  const shells = element.electrons_per_shell || []
  
  return (
    <group>
      {/* Núcleo */}
      <Sphere args={[0.5]}>
        <meshStandardMaterial color="red" />
      </Sphere>
      
      {/* Capas de electrones */}
      {shells.map((electrons, shellIndex) => (
        <ElectronShell
          key={shellIndex}
          radius={1 + shellIndex * 0.8}
          electrons={electrons}
        />
      ))}
    </group>
  )
}
```

---

## 🔄 Flujo de Datos Completo

### Ejemplo: Crear reacción H + O → H₂O

```
1. Usuario hace clic en H
   └── PeriodicTable.onClick → App.handleElementSelect("H")
       └── selectedElements = [{symbol: "H", ...}]

2. Usuario hace clic en O
   └── selectedElements = [{symbol: "H"}, {symbol: "O"}]

3. Usuario presiona "Reaccionar"
   └── App.handleReact()
       │
       ├── api.validateReaction(["H", "O"])
       │   └── POST /api/reactions/validate/
       │       └── ReactionViewSet.validate()
       │           └── find_reactions_for_elements()
       │               └── Busca en DB reacciones con H y O
       │
       ├── response = { found: true, reactions: [...] }
       │
       ├── setReaction(reactions[0])
       │
       └── api.getReactionExplanation(reaction.id, "intermediate")
           └── POST /api/reactions/explain/
               └── ReactionViewSet.explain()
                   └── DeepSeekService.explain_reaction()
                       └── POST http://localhost:11434/api/generate
                           └── Ollama genera texto
                       └── return "La síntesis del agua..."

4. Frontend muestra:
   ├── ReactionViewer → Animación 3D
   └── ExplanationPanel → Texto de IA
```

---

## 📊 Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────┐
│                         App.jsx                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ selectedEl  │  │  reaction   │  │    explanation      │  │
│  │   useState  │  │   useState  │  │      useState       │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
│         │                │                    │              │
│  ┌──────┴────────────────┴────────────────────┴──────────┐  │
│  │                    Handlers                            │  │
│  │  handleElementSelect  handleReact  handleAnalyzeElement│  │
│  └─────────────────────────┬──────────────────────────────┘  │
│                            │                                 │
└────────────────────────────┼─────────────────────────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
         ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  PeriodicTable  │ │ ReactionViewer  │ │ExplanationPanel │
│  - elementos    │ │ - Canvas 3D     │ │ - texto IA      │
│  - onClick      │ │ - OrbitControls │ │ - niveles       │
└─────────────────┘ └─────────────────┘ └─────────────────┘
         │
         ▼
┌─────────────────┐
│    api.js       │
│ - getElements   │
│ - validateRx    │
│ - getExplanation│
└────────┬────────┘
         │ HTTP
         ▼
┌─────────────────┐
│  Django Backend │
└─────────────────┘
```

---

## 🧪 Fixtures (Datos Iniciales)

### elements_part1.json (ejemplo)
```json
[
  {
    "model": "elements.element",
    "pk": 1,
    "fields": {
      "symbol": "H",
      "name": "Hidrógeno",
      "atomic_number": 1,
      "atomic_mass": 1.008,
      "category": "nonmetal",
      "electron_config": "1s¹",
      "electrons_per_shell": [1],
      "valence_electrons": 1
    }
  }
]
```

### reactions_part1.json (ejemplo)
```json
[
  {
    "model": "reactions.reaction",
    "pk": 1,
    "fields": {
      "equation": "2H₂ + O₂ → 2H₂O",
      "reaction_type": "synthesis",
      "reactants": [
        {"symbol": "H", "count": 4},
        {"symbol": "O", "count": 2}
      ],
      "products": [
        {"formula": "H2O", "count": 2, "name": "Agua"}
      ],
      "enthalpy_change": -572,
      "is_exothermic": true
    }
  }
]
```

---

*Documento generado el 6 de enero de 2026*
