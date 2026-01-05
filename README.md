# 🧪 Sistema de Reacciones Químicas

Aplicación web educativa interactiva para explorar la tabla periódica, visualizar reacciones químicas en 3D y obtener explicaciones científicas asistidas por IA.

![React](https://img.shields.io/badge/React-18.3.1-blue)
![Django](https://img.shields.io/badge/Django-4.2-green)
![Three.js](https://img.shields.io/badge/Three.js-WebGL-orange)
![Gemini](https://img.shields.io/badge/AI-Gemini-purple)

## ✨ Características

- 🔬 **Tabla Periódica Interactiva** - Selección múltiple de elementos con animaciones
- ⚗️ **Validación de Reacciones Reales** - Base de datos de reacciones químicas verificadas
- 🎮 **Visualización 3D** - Renderizado de átomos, moléculas y enlaces con Three.js
- 🤖 **Explicaciones con IA** - Descripciones educativas generadas por Gemini AI
- 🔒 **Seguridad OWASP** - Rate limiting, sanitización, protección CSRF

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+ y npm
- Python 3.10+
- PostgreSQL (o Supabase)
- API Key de Google Gemini

### Backend (Django)

```bash
cd backend

# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # Windows: .\venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Migraciones
python manage.py migrate

# Cargar datos de ejemplo
python manage.py loaddata_demo

# Ejecutar servidor
python manage.py runserver
```

### Frontend (React + Vite)

```bash
cd frontend

# Instalar dependencias
npm install

# Ejecutar desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 🏗️ Arquitectura

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│    Backend      │────▶│   PostgreSQL    │
│   React + Vite  │     │   Django DRF    │     │   (Supabase)    │
│   Three.js      │     │                 │     │                 │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │   Gemini API    │
                        │   (Explicación) │
                        └─────────────────┘
```

## 📁 Estructura del Proyecto

```
Sistema-de-reacciones-quimicas/
├── frontend/                   # React + Vite + Tailwind
│   ├── src/
│   │   ├── components/
│   │   │   ├── PeriodicTable/  # Tabla periódica interactiva
│   │   │   ├── ReactionViewer/ # Visualización 3D
│   │   │   └── AIExplanation/  # Componente de explicación IA
│   │   ├── data/               # Datos de elementos
│   │   ├── services/           # API client
│   │   └── App.jsx             # Componente principal
│   └── package.json
│
├── backend/                    # Django + DRF
│   ├── core/                   # Configuración Django
│   ├── elements/               # App de elementos
│   ├── reactions/              # App de reacciones
│   ├── ai_service/             # Integración Gemini
│   └── requirements.txt
│
└── docs/                       # Documentación
```

## 🔌 API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/elements/` | Lista todos los elementos |
| GET | `/api/elements/symbol/{symbol}/` | Obtener elemento por símbolo |
| GET | `/api/elements/periodic-table/` | Datos para tabla periódica |
| GET | `/api/reactions/` | Lista reacciones verificadas |
| POST | `/api/reactions/validate/` | Validar combinación de elementos |
| GET | `/api/reactions/{id}/animation/` | Datos de animación 3D |
| POST | `/api/ai/explain-reaction/` | Explicación de reacción con IA |
| POST | `/api/ai/explain-element/` | Explicación de elemento con IA |

## 🔒 Seguridad (OWASP Top 10)

- ✅ **A01** - Control de acceso validado en cada endpoint
- ✅ **A03** - Sanitización de inputs con `bleach`
- ✅ **A05** - Configuración segura en producción
- ✅ **A09** - Logging sin datos sensibles
- ✅ Rate limiting: 100 req/hora general, 10 req/min para IA

## 🌐 Deploy

### Frontend en Vercel

```bash
cd frontend
npm run build
vercel deploy
```

### Backend en Railway/Render

1. Conectar repositorio
2. Configurar variables de entorno
3. Deploy automático

## 📝 Licencia

MIT License - Uso educativo

## 👥 Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue primero.

---

⚠️ **Nota**: Esta aplicación es solo para fines educativos. Las reacciones químicas mostradas son representaciones simplificadas.
