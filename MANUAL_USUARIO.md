# Manual de Usuario - Sistema de Reacciones Químicas

## 📖 Introducción

Bienvenido al **Sistema de Reacciones Químicas**, una aplicación web educativa que te permite:

- 🔬 Explorar la tabla periódica interactiva
- ⚗️ Visualizar reacciones químicas en 3D
- 🧮 Ver modelos atómicos tridimensionales
- 🤖 Obtener explicaciones científicas con IA

---

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

| Software | Versión mínima | Descarga |
|----------|----------------|----------|
| Node.js | 18 o superior | https://nodejs.org |
| Python | 3.10 o superior | https://python.org |
| Ollama | última versión | https://ollama.ai (opcional, para IA) |

---

## 🚀 Instalación Paso a Paso

### Paso 1: Descargar el Proyecto

```powershell
git clone https://github.com/DiegoOliva01/Sistema-de-reacciones-quimicas.git
cd Sistema-de-reacciones-quimicas
```

### Paso 2: Configurar el Backend

Abre una terminal y ejecuta:

```powershell
# Ir al directorio del backend
cd backend

# (Opcional) Crear entorno virtual
python -m venv venv
.\venv\Scripts\activate

# Instalar dependencias de Python
pip install -r requirements.txt

# Crear la base de datos
python manage.py migrate

# Cargar los elementos y reacciones
python manage.py loaddata elements_part1 elements_part2 elements_part3
python manage.py loaddata reactions_part1 reactions_part2 reactions_part3 reactions_part4 reactions_part5

# Iniciar el servidor
python manage.py runserver
```

✅ Deberías ver: `Starting development server at http://127.0.0.1:8000/`

### Paso 3: Configurar el Frontend

Abre **otra terminal** y ejecuta:

```powershell
# Ir al directorio del frontend
cd frontend

# Instalar dependencias de Node
npm install

# Iniciar el servidor de desarrollo
npm run dev
```

✅ Deberías ver un mensaje con la URL: `http://localhost:5173`

### Paso 4: Configurar la IA (Opcional)

Si quieres usar las explicaciones con inteligencia artificial:

```powershell
# Verificar que Ollama está instalado
ollama --version

# Descargar el modelo de IA
ollama pull llama3.2

# Ollama generalmente se ejecuta automáticamente
# Si no, ejecutar: ollama serve
```

### Paso 5: Abrir la Aplicación

1. Abre tu navegador web
2. Ve a: **http://localhost:5173**

---

## 🎮 Cómo Usar la Aplicación

### Seleccionar Elementos

1. **Haz clic** en cualquier elemento de la tabla periódica
2. El elemento aparecerá en la barra superior con el texto "Seleccionados:"
3. Puedes seleccionar **hasta 5 elementos** a la vez
4. Para **deseleccionar**, haz clic nuevamente en el elemento

### Ver Información de un Elemento

Cuando haces clic en un elemento, aparece un panel a la derecha con:
- Símbolo y número atómico
- Masa atómica
- Electrones de valencia
- Categoría del elemento

### Ver Modelo Atómico 3D

1. Selecciona un elemento haciendo clic
2. En el panel de la derecha, presiona **"🔬 Ver Modelo Atómico 3D"**
3. Se mostrará una visualización 3D del átomo con sus capas electrónicas

### Buscar Reacciones de un Elemento

1. Selecciona un elemento
2. Presiona **"⚗️ Ver Combinaciones Posibles"**
3. Aparecerá una lista de reacciones donde participa ese elemento
4. Haz clic en cualquier reacción para verla

### Crear una Reacción

1. Selecciona **2 o más elementos** (ej: H y O)
2. Presiona el botón **"⚗️ Reaccionar"**
3. Si existe una reacción válida, se mostrará:
   - La ecuación química balanceada
   - Tipo de reacción (síntesis, combustión, etc.)
   - Si es exotérmica o endotérmica
   - Cambio de entalpía (ΔH)

### Obtener Explicación con IA

1. Una vez que tengas una reacción válida
2. Aparecerá un panel **"🤖 Explicación IA (DeepSeek)"**
3. Selecciona el nivel de explicación:
   - **📚 Básico**: Para estudiantes de secundaria
   - **🎓 Intermedio**: Para universitarios
   - **🔬 Avanzado**: Nivel profesional
4. Espera unos segundos mientras la IA genera la explicación

### Analizar un Elemento con IA

1. Selecciona un elemento
2. Presiona **"🤖 Analizar con IA"**
3. Recibirás una explicación detallada del elemento

---

## ⌨️ Controles Rápidos

| Acción | Cómo hacerlo |
|--------|--------------|
| Seleccionar elemento | Clic en el elemento |
| Deseleccionar | Clic en el elemento (si está seleccionado) |
| Ver modelo 3D | Botón "🔬 Ver Modelo Atómico 3D" |
| Buscar reacciones | Botón "⚗️ Ver Combinaciones Posibles" |
| Crear reacción | Seleccionar 2+ elementos → "⚗️ Reaccionar" |
| Limpiar selección | Botón "Limpiar" |
| Cambiar nivel IA | Botones Básico/Intermedio/Avanzado |

---

## 🎨 Leyenda de Colores (Tabla Periódica)

| Color | Categoría |
|-------|-----------|
| 🟥 Rojo | Metal Alcalino |
| 🟧 Naranja | Alcalinotérreo |
| 🟨 Amarillo | Metal de Transición |
| 🟩 Verde | Metal Post-Transición |
| 🟦 Azul | No Metal |
| 🟪 Violeta | Halógeno |
| ⬜ Gris claro | Gas Noble |
| 🟫 Marrón | Metaloide |
| 🌸 Rosa | Lantánido |
| 🔵 Azul oscuro | Actínido |

---

## 🔧 Solución de Problemas

### "No se pudo cargar la tabla periódica"
- Verifica que el servidor backend esté corriendo
- Ejecuta: `python manage.py runserver` en la carpeta `backend`

### "Error al validar la reacción"
- Asegúrate de que el backend esté funcionando
- Verifica que hayas cargado los datos: `python manage.py loaddata ...`

### "La IA no responde / muy lento"
1. Verifica que Ollama esté instalado: `ollama --version`
2. Verifica que esté corriendo: mira si aparece en procesos del sistema
3. Verifica el modelo: `ollama list` debe mostrar `llama3.2:latest`
4. Si no lo tienes, descárgalo: `ollama pull llama3.2`

### "Explicación muestra texto del fixture en vez de IA"
- La IA está tardando mucho o no está disponible
- Se muestra el fallback (descripción predefinida)
- Intenta con el nivel "Básico" que es más rápido

### La página no carga
1. Verifica que el frontend esté corriendo: `npm run dev` en carpeta `frontend`
2. Abre http://localhost:5173 (no 8000)

---

## 📱 Compatibilidad

| Navegador | Compatibilidad |
|-----------|----------------|
| Chrome | ✅ Completo |
| Firefox | ✅ Completo |
| Safari | ✅ Completo |
| Edge | ✅ Completo |
| Mobile | ⚠️ Parcial (tabla puede ser pequeña) |

---

## 🆘 Soporte

Si tienes problemas o preguntas:
1. Revisa la sección "Solución de Problemas"
2. Verifica que todos los servidores estén corriendo
3. Reinicia los servidores si es necesario

---

*Manual generado el 6 de enero de 2026*
