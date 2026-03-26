# Contexto del Proyecto
Este proyecto es una Landing Page interactiva que incluye un chatbot de inteligencia artificial. El objetivo del chatbot es actuar como un experto en diseño UI/UX y recomendar combinaciones tipográficas (de Google Fonts) basándose en las necesidades del usuario.

# Stack Tecnológico Principal
- **Gestor de paquetes:** EXCLUSIVAMENTE `pnpm`. Prohibido usar `npm` o `yarn`.
- **Frontend:** React 18+ (SPA), Vite, Tailwind CSS.
- **Backend (Proxy):** Node.js (Express o Hono) estrictamente para proteger llamadas a la API de IA.
- **Despliegue:** VPS propio gestionado con Dokploy.

# Estructura del Código
- El proyecto se divide lógicamente en `frontend` y `backend`. Mantén las dependencias y la lógica de cada uno estrictamente separadas.
- **Frontend:** - Usa Functional Components y React Hooks (`useState`, `useEffect`, `useCallback`).
  - NUNCA uses Class Components.
  - La estructura debe tener carpetas claras para: `/components`, `/hooks`, `/services` (para llamadas al backend), y `/utils`.

# Reglas de Estilo y UI
- **Tailwind CSS:** Úsalo para TODO el estilizado. Evita crear archivos CSS personalizados a menos que sea para variables globales o animaciones keyframe complejas que Tailwind no soporte nativamente.
- **Iconografía:** Usa la librería `lucide-react`.
- **Diseño Responsivo:** Todas las vistas deben ser "Mobile First". Usa los prefijos `sm:`, `md:`, `lg:` de Tailwind.

# Integración con IA y Seguridad (CRÍTICO)
1. **Cero Secretos en el Cliente:** NUNCA escribas, sugieras, ni expongas API Keys (como `GROQ_API_KEY` o similares) en el código del frontend.
2. **Manejo de Respuestas de la IA:** El backend devolverá respuestas generadas por IA en formato JSON. El frontend DEBE prever que este JSON pueda venir malformado en ocasiones. 
3. **Manejo de Estados:** Al hacer peticiones a la API, siempre debes implementar e inferir tres estados en la UI: 
   - Estado de carga (Loading spinners o Skeletons).
   - Estado de éxito (Renderizado de la respuesta).
   - Estado de error (Mensaje amigable al usuario si la IA falla).

# Convenciones de Nomenclatura e Idioma
- **Código:** Nombra variables, funciones, componentes y archivos en **inglés** (ej: `FontCard.jsx`, `handleChatSubmit`, `isLoading`).
- **Comentarios y Textos UI:** Escribe los comentarios explicativos y cualquier texto visible para el usuario final en **inglés**.
- **Commits:** Si sugieres mensajes de commit, hazlos descriptivos y siguiendo la convención "Conventional Commits" (ej: `feat: add loading state to chat`, `fix: parse invalid JSON from AI`).

# Comportamiento de Copilot
- Escribe código modular y reutilizable. Si un componente de React supera las 150 líneas, sugiere dividirlo.
- Antes de escribir bloques masivos de código, comenta paso a paso lo que vas a hacer.
- Si no estás seguro de cómo se configuró algo en otro archivo, pide que te lo muestre antes de adivinar.