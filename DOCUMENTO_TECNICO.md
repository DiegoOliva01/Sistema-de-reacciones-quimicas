# Documento Técnico - Sistema de Reacciones Químicas

## 1. Descripción General

Sistema web educativo e interactivo para explorar la tabla periódica, visualizar reacciones químicas en 3D y obtener explicaciones científicas mediante Inteligencia Artificial local.

---

## 2. Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                    │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────────────┐   │
│  │   React     │  │  Three.js    │  │   Framer Motion              │   │
│  │   18.3.1    │  │  (3D Viewer) │  │   (Animaciones)              │   │
│  └──────┬──────┘  └──────┬───────┘  └────────────────┬─────────────┘   │
│         │                │                           │                  │
│         └────────────────┴───────────────────────────┘                  │
│                          │ Axios HTTP                                   │
│                          ▼                                              │
└──────────────────────────┼──────────────────────────────────────────────┘
                           │ Proxy Vite → localhost:8000
┌──────────────────────────┼──────────────────────────────────────────────┐
│                          ▼                                              │
│                      BACKEND                                            │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────────────┐   │
│  │   Django    │  │  Django REST │  │   SQLite                     │   │
│  │   5.1       │  │  Framework   │  │   (Base de datos)            │   │
│  └──────┬──────┘  └──────┬───────┘  └────────────────┬─────────────┘   │
│         │                │                           │                  │
│         └────────────────┴───────────────────────────┘                  │
│                          │ requests HTTP                                │
│                          ▼                                              │
│              ┌───────────────────────┐                                  │
│              │   Ollama (IA Local)   │                                  │
│              │   llama3.2:latest     │                                  │
│              └───────────────────────┘                                  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Stack Tecnológico

### 3.1 Frontend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| React | 18.3.1 | Framework UI |
| Vite | 6.0.0 | Build tool y servidor de desarrollo |
| Three.js | 0.170.0 | Visualización 3D |
| @react-three/fiber | 8.17.10 | Integración React-Three.js |
| @react-three/drei | 9.120.0 | Helpers para Three.js |
| Framer Motion | 11.15.0 | Animaciones UI |
| Tailwind CSS | 3.4.0 | Framework de estilos |
| Axios | 1.7.9 | Cliente HTTP |

### 3.2 Backend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Python | 3.10+ | Lenguaje base |
| Django | 5.1+ | Framework web |
| Django REST Framework | 3.15+ | API REST |
| django-cors-headers | 4.6+ | Manejo de CORS |
| requests | 2.32+ | Cliente HTTP para IA |
| SQLite | 3 | Base de datos (desarrollo) |

### 3.3 Inteligencia Artificial
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Ollama | 0.13.5+ | Servidor de modelos IA |
| llama3.2 | latest | Modelo de lenguaje |

---

## 4. Estructura de la Base de Datos

### 4.1 Modelo Element (Elementos Químicos)

```python
class Element(models.Model):
    # Identificación
    symbol          # CharField(3) - Símbolo químico (H, He, Li...)
    name            # CharField(50) - Nombre en español
    name_en         # CharField(50) - Nombre en inglés
    
    # Propiedades atómicas
    atomic_number   # IntegerField - Número atómico
    atomic_mass     # FloatField - Masa atómica
    category        # CharField(25) - Categoría del elemento
    
    # Configuración electrónica
    electron_config      # CharField(100) - Config. electrónica
    electrons_per_shell  # JSONField - Electrones por capa [2, 8, 1]
    valence_electrons    # IntegerField - Electrones de valencia
    
    # Propiedades químicas
    electronegativity   # FloatField - Electronegatividad
    ionization_energy   # FloatField - Energía de ionización (kJ/mol)
    
    # Propiedades físicas
    density         # FloatField - Densidad (g/cm³)
    melting_point   # FloatField - Punto de fusión (K)
    boiling_point   # FloatField - Punto de ebullición (K)
    
    # Posición en tabla
    period          # IntegerField - Período (1-7)
    group           # IntegerField - Grupo (1-18)
    color_hex       # CharField(7) - Color para UI (#RRGGBB)
```

**Categorías disponibles:**
- `alkali-metal` - Metal Alcalino
- `alkaline-earth` - Metal Alcalinotérreo
- `transition-metal` - Metal de Transición
- `post-transition-metal` - Metal Post-Transición
- `metalloid` - Metaloide
- `nonmetal` - No Metal
- `halogen` - Halógeno
- `noble-gas` - Gas Noble
- `lanthanide` - Lantánido
- `actinide` - Actínido

### 4.2 Modelo Reaction (Reacciones Químicas)

```python
class Reaction(models.Model):
    # Ecuación
    equation        # CharField(300) - "2Na + Cl₂ → 2NaCl"
    equation_html   # CharField(500) - Con formato HTML
    
    # Clasificación
    reaction_type    # CharField(20) - Tipo de reacción
    difficulty_level # CharField(15) - basic/intermediate/advanced
    
    # Reactivos y productos (JSON)
    reactants   # JSONField - [{symbol, count, state}]
    products    # JSONField - [{formula, count, state, name}]
    
    # Termodinámica
    enthalpy_change  # FloatField - ΔH en kJ/mol
    is_exothermic    # BooleanField - ¿Libera energía?
    
    # Datos 3D
    animation_data   # JSONField - Datos para animación
    
    # Metadatos
    description              # TextField - Descripción científica
    real_world_applications  # JSONField - Aplicaciones reales
```

**Tipos de reacción:**
- `synthesis` - Síntesis
- `decomposition` - Descomposición
- `single-replacement` - Sustitución Simple
- `double-replacement` - Sustitución Doble
- `combustion` - Combustión
- `acid-base` - Ácido-Base
- `redox` - Oxidación-Reducción
- `precipitation` - Precipitación

---

## 5. API REST Endpoints

### 5.1 Elementos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/elements/` | Lista todos los elementos (118) |
| GET | `/api/elements/{symbol}/` | Detalle de un elemento |
| GET | `/api/elements/periodic_table/` | Tabla periódica organizada |
| GET | `/api/elements/by_category/?category=X` | Filtrar por categoría |
| POST | `/api/elements/explain/` | Explicación IA de elemento |

### 5.2 Reacciones

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/reactions/` | Lista todas las reacciones |
| GET | `/api/reactions/{id}/` | Detalle de una reacción |
| POST | `/api/reactions/validate/` | Validar combinación de elementos |
| POST | `/api/reactions/explain/` | Explicación IA de reacción |
| GET | `/api/reactions/by_type/?type=X` | Filtrar por tipo |

### 5.3 Ejemplos de Request/Response

**Validar reacción:**
```json
// POST /api/reactions/validate/
// Request:
{
  "elements": ["H", "O"]
}

// Response:
{
  "success": true,
  "found": true,
  "reactions": [{
    "id": 1,
    "equation": "2H₂ + O₂ → 2H₂O",
    "reaction_type": "synthesis",
    "is_exothermic": true,
    "enthalpy_change": -572
  }]
}
```

**Explicación IA:**
```json
// POST /api/reactions/explain/
// Request:
{
  "reaction_id": 1,
  "level": "intermediate"
}

// Response:
{
  "success": true,
  "explanation": "La síntesis del agua es una reacción exotérmica..."
}
```

---

## 6. Configuración

### 6.1 Variables de Entorno Backend

| Variable | Default | Descripción |
|----------|---------|-------------|
| `DJANGO_SECRET_KEY` | (dev key) | Clave secreta Django |
| `DJANGO_DEBUG` | True | Modo debug |
| `OLLAMA_BASE_URL` | http://localhost:11434 | URL de Ollama |
| `OLLAMA_MODEL` | llama3.2:latest | Modelo de IA |

### 6.2 Configuración Vite (Frontend)

```javascript
// vite.config.js
export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
```

---

## 7. Seguridad Implementada (OWASP Top 10)

| Vulnerabilidad | Protección |
|----------------|------------|
| SQL Injection | Django ORM (consultas parametrizadas) |
| XSS | React auto-escaping + CSP headers |
| CSRF | Tokens CSRF de Django |
| Broken Auth | Rate limiting en endpoints de IA |
| Security Misconfiguration | DEBUG=False en producción |
| Sensitive Data Exposure | Sin API keys expuestas (IA local) |
| Outdated Components | React 18.3.1 (sin CVE-2025-55182) |

**Rate Limiting:**
- General: 60 requests/minuto
- IA: 10 requests/minuto

---

## 8. Comandos para Levantar Servidores

### 8.1 Backend (Django)

```powershell
# Navegar al directorio
cd backend

# (Opcional) Crear y activar entorno virtual
python -m venv venv
.\venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar migraciones
python manage.py migrate

# Cargar datos iniciales
python manage.py loaddata elements_part1 elements_part2 elements_part3
python manage.py loaddata reactions_part1 reactions_part2 reactions_part3 reactions_part4 reactions_part5

# Iniciar servidor
python manage.py runserver
```

**URL:** http://localhost:8000

### 8.2 Frontend (React + Vite)

```powershell
# Navegar al directorio
cd frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

**URL:** http://localhost:5173

### 8.3 IA Local (Ollama)

```powershell
# Verificar instalación
ollama --version

# Ver modelos disponibles
ollama list

# Descargar modelo (si no lo tienes)
ollama pull llama3.2

# Iniciar servidor (se ejecuta en segundo plano generalmente)
ollama serve
```

**URL:** http://localhost:11434

---

## 9. Requisitos del Sistema

### Mínimos
- **CPU:** 4 cores
- **RAM:** 8 GB (16 GB recomendado para IA)
- **Disco:** 5 GB libres
- **SO:** Windows 10+, macOS 10.15+, Linux

### Software Requerido
- Node.js 18+
- Python 3.10+
- Ollama (para funcionalidad IA)

---

## 10. Datos Incluidos

- **118 elementos** químicos completos
- **100+ reacciones** químicas validadas científicamente
- Tipos de reacciones: síntesis, combustión, ácido-base, redox, etc.
- Aplicaciones del mundo real para cada reacción

---

*Documento generado el 6 de enero de 2026*
