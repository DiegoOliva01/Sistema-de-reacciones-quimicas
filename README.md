# Sistema de Reacciones Químicas 🧪

Aplicación web educativa e interactiva para explorar la tabla periódica, visualizar reacciones químicas en 3D y obtener explicaciones científicas mediante IA local.

## 🚀 Tecnologías

### Frontend
- **React 18.3.1** (sin vulnerabilidad CVE-2025-55182)
- **Vite 6** - Build tool
- **Three.js + React Three Fiber** - Visualización 3D
- **Tailwind CSS** - Estilos
- **Framer Motion** - Animaciones UI
- **Axios** - Cliente HTTP

### Backend
- **Django 5.1** + Django REST Framework
- **SQLite** (desarrollo) / PostgreSQL (producción)
- **Python 3.10+**

### IA Local
- **Ollama** con **DeepSeek-R1:7b**
- Sin API keys externas

## 📋 Requisitos Previos

- Node.js 18+
- Python 3.10+
- [Ollama](https://ollama.ai/) instalado (opcional, para explicaciones IA)

## ⚡ Inicio Rápido

### 1. Backend

```bash
cd backend

# Crear entorno virtual (opcional)
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar migraciones
python manage.py migrate

# Cargar datos iniciales (118 elementos + 25 reacciones)
python manage.py loaddata elements_part1 elements_part2 elements_part3
python manage.py loaddata reactions_part1 reactions_part2

# Iniciar servidor
python manage.py runserver
```

El backend estará disponible en: `http://localhost:8000`

### 2. Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

El frontend estará disponible en: `http://localhost:5173`

### 3. IA Local (Opcional)

```bash
# Instalar modelo DeepSeek
ollama pull deepseek-r1:7b

# Iniciar Ollama (generalmente se inicia automáticamente)
ollama serve
```

## 🎮 Uso

1. Abre `http://localhost:5173` en tu navegador
2. Haz clic en elementos de la tabla periódica para seleccionarlos
3. Presiona **"⚗️ Reaccionar"** para validar la reacción
4. Observa la visualización 3D de la reacción
5. Lee la explicación científica (ajusta el nivel: básico/intermedio/avanzado)

## 📁 Estructura del Proyecto

```
Sistema-de-reacciones-quimicas/
├── backend/                 # Django REST API
│   ├── config/              # Configuración Django
│   ├── elements/            # Modelo Element
│   ├── reactions/           # Modelo Reaction
│   ├── api/                 # ViewSets REST
│   └── ai_service/          # Integración DeepSeek
│
├── frontend/                # React + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── PeriodicTable/
│   │   │   ├── ReactionViewer/
│   │   │   └── ExplanationPanel/
│   │   ├── services/        # API client
│   │   └── styles/
│   └── package.json
│
└── README.md
```

## 🔒 Seguridad (OWASP Top 10)

- ✅ Protección contra SQL Injection (Django ORM)
- ✅ Protección XSS (React auto-escaping)
- ✅ Protección CSRF (tokens Django)
- ✅ Rate Limiting en endpoints de IA
- ✅ Sin API keys expuestas
- ✅ React 18.3.1 (sin CVE-2025-55182)

## 📡 API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/elements/` | Lista todos los elementos |
| GET | `/api/elements/{symbol}/` | Detalle de elemento |
| GET | `/api/elements/periodic_table/` | Tabla organizada |
| POST | `/api/reactions/validate/` | Validar combinación |
| POST | `/api/reactions/explain/` | Explicación IA |

## 🧪 Reacciones Disponibles

El sistema incluye 25+ reacciones validadas científicamente:

- **Síntesis**: H₂O, NaCl, NH₃, FeS...
- **Combustión**: CH₄, H₂S, C...
- **Ácido-Base**: HCl + NaOH...
- **Redox**: Zn + CuSO₄, Termita...
- **Descomposición**: H₂O₂, CaCO₃...

## 📝 Licencia

MIT License

---

Desarrollado con 💜 usando React, Three.js, Django y DeepSeek
