# Plan — Feedback Sprint: Flujos y Concordancia de Roles

## Contexto

El equipo revisó el prototipo UniLibreTour e identificó brechas entre el wireframe oficial (MDIUL.png) y la implementación actual. Los cambios abarcan: modelo de datos incompleto, flujos de rol con inconsistencias (egresado ausente, wizard de estudiante inferior al de docente, bandeja de docente sin separación), secciones faltantes en la Home, Timeline no interactiva, y el Admin sin flujo para Hall de la Fama ni vista de registros generales.

---

## Archivos críticos a modificar

| Archivo | Cambios |
|---|---|
| `src/data.ts` | Nuevos tipos/datos |
| `src/App.tsx` | Nuevas páginas, egresado demo |
| `src/components/Layout.tsx` | Sidebar admin expandido, badge egresado |
| `src/pages/Public.tsx` | Home + Explorar + Buscar + Detalle |
| `src/pages/Auth.tsx` | Opción egresado en Registro |
| `src/pages/Student.tsx` | Wizard 4 pasos + notificaciones + contenido reciente |
| `src/pages/Teacher.tsx` | Bandeja doble en DocDashboard |
| `src/pages/Admin.tsx` | Hall Registro + Registros Generales + mejoras |

---

## Cambios por área

### 1 · data.ts

**Tipos:**
- `Role` → agregar `'egresado'` (misma UI de estudiante pero con badge diferenciado)
- `Page` → agregar: `'admin-hall-registro'`, `'admin-registros'`
- `ContentItem` → agregar campo opcional `involvedTeacher?: string` y `featured?: boolean`

**Nuevos datos:**
```ts
researchGroups: { id, name, category: 'semillero'|'grupo', lead, members, description, image }[]
// 4 registros: 2 semilleros (ej. SeedAI, DataSeed), 2 grupos (GISI, SISDIS)

achievements: { id, title, year, category: 'premio'|'reconocimiento'|'certificacion', institution, description, image }[]
// 5 registros: Premio Innova MinTIC, Acreditación CNA, Premio SciHub, etc.
```

---

### 2 · Home (Public.tsx — HomePage)

**Secciones a agregar (entre Timeline y Recent Content):**

**A. Logros Destacados** — grid horizontal de 3 tarjetas con imagen, ícono de trofeo, nombre del premio, año. Datos de `achievements`.

**B. Semilleros y Grupos de Investigación** — 2 filas (semilleros / grupos), tarjetas compactas con nombre, líder, n° miembros. Datos de `researchGroups`.

**C. Timeline interactiva** — cada ítem del timeline pasa a ser `<button>` que expande un panel de detalle (estado `expandedYear: number | null`). Al hacer clic, aparece una sección con scroll interno mostrando descripción completa + foto referencial + botón "Ver en el archivo".

**D. Eventos Próximos** — sección simple con 3 eventos hardcoded (nombre, fecha, lugar) extraídos de `contentItems` con `category === 'eventos'`.

---

### 3 · Explorar (Public.tsx — ExplorarPage)

- Agregar categorías al filtro: `'galeria'`, `'egresados'`, `'premios'`
- Agregar labels: `galeria → 'Galería Histórica'`, `egresados → 'Egresados Destacados'`, `premios → 'Premios y Reconocimientos'`
- En la Collection Showcase, mostrar 8 colecciones (agregar Galería Histórica, Egresados Destacados)
- Cambiar título de la página de "Explorar" por **"Descubrir Contenido"** (per feedback admin)

---

### 4 · Buscar (Public.tsx — BuscarPage)

- Agregar campo **"Por persona"**: input de texto adicional que filtra por `item.author`
- Expandir el select de categoría para incluir `fotografías`, `videos`, `documentos` como tipos de contenido visualizable
- Mostrar subtítulo con los filtros activos (ya existe la línea de resultados, mejorar con chips de filtros activos)

---

### 5 · Detalle (Public.tsx — DetallePage)

- Agregar botón **"Compartir"** junto al botón de favoritos (ícono de share). Al hacer clic: copia la URL simulada al portapapeles y muestra toast "¡Enlace copiado!" durante 2 segundos (estado `copied: boolean`).
- Mejorar sección de evidencias: si `item.involvedTeacher` existe, mostrarlo en la Ficha Técnica como "Docente Responsable".
- Sección de evidencias (archivos adjuntos) simulada con 2-3 archivos ficticios en todos los detalles (actualmente solo en AdminValidacion).

---

### 6 · Auth (Auth.tsx — RegistroPage)

- En el select de `role`: agregar opción `egresado` con label "Egresado"
- En `LoginPage.demoAccounts`: agregar cuenta `{ email: 'egresado@unilibre.edu.co', password: '123456', role: 'egresado', label: 'Egresado' }`
- `handleLogin` en App.tsx: `egresado` → `navigate('est-dashboard')` (mismo dashboard, estado compartido)

---

### 7 · Student (Student.tsx)

**A. EstDashboard — dos mejoras:**

1. **Banner de campaña/notificación** (tope del dashboard, descartable): caja dorada/azul con mensaje institucional activo. Ej: "📢 Convocatoria Proyectos Destacados 2025 — Fecha límite: 31 julio". Estado `bannerDismissed: boolean`.

2. **Sección "Contenido Reciente del Programa"**: grid de 3 tarjetas `ContentCard` con los últimos publicados (los mismos de Home) bajo el área de insignias.

3. **Distintivo egresado**: el header y sidebar muestran badge `Egresado` (dorado-teal) en lugar de `Estudiante` cuando `role === 'egresado'`. El saludo cambia a "Bienvenido, egresado · Cohorte 2018".

**B. EstContribuir — convertir a wizard de 4 pasos igual que DocWizard:**

| Paso | Contenido |
|---|---|
| 1 · Datos Generales | Título*, Categoría*, Año, Descripción*, Tags, **Docente Involucrado*** (select de la lista de docentes, campo obligatorio) |
| 2 · Evidencias | Drag & drop igual que DocWizard |
| 3 · Revisión | Checklist de 5 ítems idéntico a DocWizard |
| 4 · Confirmación | Vista previa + submit → confirmación |

El campo **"Docente Involucrado"** es required (validación en step 1). Muestra el nombre seleccionado en la vista previa del paso 4. En `data.ts` agregar `teacherOptions: { name, email }[]` (lista de 4 docentes) para el select.

---

### 8 · Teacher (Teacher.tsx — DocDashboard)

**Dividir el dashboard en dos tabs/secciones:**

**Tab 1 — "Mi Contenido"** (activo por defecto):
- Contribuciones creadas por el docente (misma lista actual de `myContent`)
- Botón "+ Registrar Evidencia" → `navigate('doc-wizard')`

**Tab 2 — "Me Involucran"** (nueva):
- Lista de contenidos donde `item.involvedTeacher` contiene el nombre del docente
- Cada ítem muestra quién lo envió, el estado, y botón "Ver detalle" → `navigate('detalle', id)`
- Estado vacío con mensaje "No hay proyectos que te involucren aún."
- Badge numérico en el tab si hay ítems pendientes (naranja)

Implementar con `activeTab: 'mio' | 'involucrado'` local state.

---

### 9 · Admin (Admin.tsx)

**A. AdminCola — mejoras menores:**
- Agregar botón **"⭐ Destacar"** junto a "Validar" por cada ítem. Al hacer clic activa `featured = true` en el ítem (estado local) y muestra badge dorado "Destacado".
- Cambiar etiqueta del filtro a **"Ver Contenido"** en vez de usar el término "Explorar" (per feedback).

**B. AdminValidacion — mejorar observaciones de devolución:**
- Bajo el textarea de nota, agregar **chips de razones rápidas** pre-seleccionables (clic agrega al textarea):
  - "Falta autorización del docente responsable"
  - "Imágenes de baja resolución"
  - "Descripción incompleta"
  - "Falta evidencia documental"
  - "Año incorrecto o faltante"
- Estado `selectedChips: string[]`, chips clickeables que añaden texto al `returnNote`.

**C. Nueva página: `AdminHallRegistro` (Page: `'admin-hall-registro'`)**

Formulario de registro de persona al Hall de la Fama siguiendo el workflow del wireframe:
1. **Paso 1 — Seleccionar categoría**: Docente / Estudiante / Egresado / Pionero (radio buttons)
2. **Paso 2 — Datos personales**: Nombre*, Correo, Año de graduación*, Cargo actual*, Institución*
3. **Paso 3 — Biografía e historia**: textarea larga*, Logros y reconocimientos (textarea)
4. **Paso 4 — Fotografía**: drag-and-drop de imagen simulado
5. **Confirmación**: "Publicar en Hall de la Fama" → success screen

**D. Nueva página: `AdminRegistros` (Page: `'admin-registros'`)**

Vista de registros generales del museo:
- Tabla/lista de todos los `contentItems` + `contentQueue` combinados (total)
- Buscador por palabra clave en título/descripción
- Acordeón por categoría: cada categoría es un `<details>` colapsable que muestra sus ítems
- Columnas: Título, Categoría, Estado (badge), Autor, Fecha, Acciones (Ver / Destacar)
- Filtro de estado (todos / publicado / pendiente / devuelto)

---

### 10 · Layout (Layout.tsx)

**DashboardSidebar — Admin links actualizados:**
```
admin: [
  { label: 'Dashboard', page: 'admin-dashboard', icon: '⊞' },
  { label: 'Ver Contenido', page: 'admin-registros', icon: '📁' },   // nuevo (renombrado de explorar)
  { label: 'Cola de Validación', page: 'admin-cola', icon: '📋' },
  { label: 'Hall de la Fama', page: 'admin-hall-registro', icon: '★' }, // nuevo
  { label: 'Usuarios', page: 'admin-usuarios', icon: '👥' },
]
```

**Header — roleBadge:**
```ts
{ egresado: 'Egresado' }  // agregar al mapa
```

**Header nav links — egresado:**
Mismo que estudiante: `'est-dashboard'`, `'est-favoritos'`, `'est-contribuir'`

---

### 11 · App.tsx

- `Role` → aceptar `'egresado'` (sin cambio de tipo en la importación, ya se actualiza en data.ts)
- Login demo: `egresado` → `navigate('est-dashboard')` en `handleVerify`
- `renderPage` → agregar casos:
  - `'admin-hall-registro'` → `<AdminHallRegistro navigate={navigate} />`
  - `'admin-registros'` → `<AdminRegistros navigate={navigate} />`
- `noFooterPages` → agregar `'admin-hall-registro'`, `'admin-registros'`

---

## Reordenamiento del flujo completado (verificación de workflows)

| Flujo | Estado tras el plan |
|---|---|
| Visitante → Explorar → Detalle → Compartir | ✓ botón compartir |
| Estudiante → Contribuir (wizard 4 pasos + docente obligatorio) → confirmación | ✓ wizard igualado |
| Egresado → misma UI estudiante + badge distintivo | ✓ |
| Docente → bandeja "Me involucran" + creación independiente | ✓ tabs separados |
| Admin → Hall de la Fama registro completo | ✓ nueva página |
| Admin → Vista registros generales con desplegables | ✓ nueva página |
| Admin → Devolución con chips de razones | ✓ |
| Admin → Destacar proyecto | ✓ |
| Timeline clickeable con detalle desplegable | ✓ |
| Home: Logros + Semilleros + Grupos | ✓ |

---

## Verificación (cómo probar)

1. **Egresado**: Login demo → "Egresado" → 2FA `123456` → dashboard con badge "Egresado" visible
2. **Wizard estudiante**: est-contribuir → debe tener 4 pasos, "Docente Involucrado" requerido en paso 1
3. **Bandeja docente**: doc-dashboard → tabs "Mi Contenido" / "Me Involucran" → tab 2 muestra ítems donde `involvedTeacher` coincide
4. **Compartir**: cualquier detalle → botón "Compartir" → toast "¡Enlace copiado!"
5. **Timeline expandible**: Home → click en evento → se expande con descripción completa
6. **Admin Hall**: admin-dashboard → sidebar "Hall de la Fama" → formulario 4 pasos → success
7. **Admin Registros**: sidebar "Ver Contenido" → lista acordeón filtrable
8. **Admin devolución con chips**: admin-validacion → clic en chip → texto se añade al textarea
9. **Sin errores de tipos**: `npx tsc --noEmit` limpio
