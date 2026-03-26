# PLAN - Landing Page + Chatbot de Recomendación Tipográfica

## 1) Objetivo y alcance

Construir una Landing Page en React con un chatbot integrado que recomiende combinaciones tipográficas web según necesidades de diseño del usuario.

Alcance de esta fase:
- Definir arquitectura y flujo de datos end-to-end.
- Definir inicialización y estructura del proyecto con pnpm.
- Definir estrategia de streaming de respuestas IA (OpenRouter) vía backend proxy en Express.
- Definir plan de despliegue en VPS con Dokploy (Railpack).

Fuera de alcance por ahora:
- Implementación de componentes, rutas y endpoints.
- Integración visual final y copy definitivo de marketing.
- Configuración avanzada de observabilidad.

---

## 2) Decisión de estructura del repositorio

### Recomendación: monorepo simple con carpetas separadas

Ventajas para este caso:
- Mantiene frontend y backend aislados, pero en un solo repositorio.
- Simplifica versionado, coordinación de cambios y despliegue.
- Permite comandos unificados con pnpm workspaces.

Estructura propuesta:

```txt
hackaton-cubepath/
  .github/
    copilot-instructions.md
    free-models.md
  frontend/
    src/
      components/
      hooks/
      services/
      utils/
      App.jsx
      main.jsx
    public/
    index.html
    package.json
    vite.config.js
    tailwind.config.js
    postcss.config.js
  backend/
    src/
      routes/
      services/
      utils/
      app.js
      server.js
    package.json
  package.json
  pnpm-workspace.yaml
  .gitignore
  .env.example
  PLAN.md
```

Notas clave:
- Frontend y backend tienen dependencias totalmente separadas.
- Las API keys viven solo en backend.
- En frontend se usa la carpeta services para llamadas HTTP al backend.

---

## 3) Inicialización del proyecto con pnpm

### 3.1 Pre-requisitos
- Node.js LTS (recomendado 20+).
- pnpm instalado globalmente.
- Cuenta y API key en OpenRouter.
- VPS con Dokploy operativo.

### 3.2 Bootstrap del monorepo
1. Inicializar repositorio raíz con pnpm.
2. Crear pnpm workspaces para frontend y backend.
3. Inicializar frontend con Vite + React.
4. Instalar y configurar Tailwind CSS en frontend.
5. Inicializar backend con Express básico.
6. Definir scripts en raíz para correr ambos servicios en desarrollo.

### 3.3 Dependencias planificadas
Frontend:
- react, react-dom
- tailwindcss
- lucide-react

Backend:
- express
- cors
- dotenv
- @openrouter/sdk

Desarrollo raíz:
- concurrently (opcional para ejecutar frontend y backend en paralelo)

### 3.4 Variables de entorno
- En backend:
  - OPENROUTER_API_KEY
  - OPENROUTER_MODEL (ejemplo: openrouter/free)
  - PORT
- En frontend:
  - Solo variables públicas necesarias (por ejemplo URL base del backend).
  - Nunca exponer secretos.

---

## 4) Arquitectura técnica

## 4.1 Diagrama lógico

```txt
Usuario
  -> Frontend React (SPA)
  -> POST /api/chat/stream (Backend Express)
  -> OpenRouter API (stream=true)
  -> Backend reenvía chunks en streaming
  -> Frontend renderiza respuesta incremental
```

## 4.2 Responsabilidades por capa

Frontend (React + Vite + Tailwind):
- Captura prompt del usuario.
- Llama al backend (nunca a OpenRouter directamente).
- Consume streaming y pinta texto incremental.
- Gestiona estados obligatorios:
  - loading
  - success
  - error
- Tolera respuestas parciales o payloads no ideales.

Backend (Express):
- Expone endpoint de streaming al frontend.
- Inyecta API key desde entorno.
- Llama a OpenRouter con stream activado.
- Reenvía chunks al cliente con formato apto para streaming.
- Maneja errores, timeouts y cierre prematuro de conexión.

OpenRouter:
- Ejecuta inferencia del modelo gratuito definido.
- Entrega chunks de contenido y metadata de uso al final.

## 4.3 Protocolo de streaming recomendado

Recomendación principal: usar Server-Sent Events (SSE) desde backend hacia frontend.

Motivos:
- Es simple para texto incremental.
- Evita complejidad de WebSockets para este caso.
- Compatible con fetch streaming en cliente moderno.

Formato orientativo de eventos:
- event: token -> fragmentos de texto
- event: done -> fin de stream
- event: error -> error controlado

## 4.4 Flujo detallado de una petición

1. Frontend envía mensaje del usuario al endpoint backend de chat.
2. Backend valida input mínimo y prepara prompt de sistema.
3. Backend llama OpenRouter con stream=true.
4. Por cada chunk recibido:
   - Extrae delta.content si existe.
   - Emite token al frontend de forma incremental.
5. Al finalizar:
   - Emite done.
   - Cierra respuesta.
6. Si ocurre error:
   - Emite evento de error.
   - Registra log en backend sin exponer secretos.

## 4.5 Manejo de JSON potencialmente malformado

Riesgo:
- El backend podría retornar payload no perfecto desde IA (texto no JSON estricto).

Plan de robustez en frontend:
- Definir parser seguro en utils:
  - intento de JSON.parse.
  - fallback controlado a texto plano.
- Mostrar mensaje amigable si no se logra parseo estructurado.
- Nunca bloquear render si falla parseo; degradar con gracia.

## 4.6 Contrato de datos sugerido (alto nivel)

Entrada frontend -> backend:
- message: string
- context opcional (preferencias de branding, tono, idioma)

Salida backend -> frontend (stream):
- tokens de texto incremental
- evento final de cierre
- evento de error si aplica

Estructura objetivo final de recomendación (si IA responde estructurado):
- primaryFont
- secondaryFont
- rationale
- useCases
- googleFontsLinks

---

## 5) Plan de implementación por fases

## Fase 0 - Base de proyecto
1. Crear monorepo y workspaces con pnpm.
2. Inicializar frontend Vite React.
3. Configurar Tailwind y estructura de carpetas frontend.
4. Inicializar backend Express mínimo.
5. Configurar scripts raíz para desarrollo paralelo.

Criterio de salida:
- frontend y backend levantan localmente con un comando raíz.

## Fase 1 - Contratos y servicio de chat
1. Definir contrato de request/response de chat.
2. Implementar endpoint backend /api/chat/stream.
3. Integrar OpenRouter SDK con stream=true.
4. Propagar chunks al frontend via SSE.

Criterio de salida:
- un prompt desde frontend produce texto incremental visible.

## Fase 2 - UI de Landing + Chat UX
1. Construir layout de Landing responsive mobile-first.
2. Integrar módulo chatbot en la Landing.
3. Implementar estados loading/success/error.
4. Añadir manejo de reintento y cancelación básica.

Criterio de salida:
- experiencia usable en móvil y escritorio con feedback claro.

## Fase 3 - Robustez y calidad
1. Manejo de errores de red y timeout.
2. Sanitización básica de entrada.
3. Parser tolerante a salida IA no estructurada.
4. Validaciones mínimas y logs backend.

Criterio de salida:
- sistema estable ante fallos comunes sin romper UI.

## Fase 4 - Preparación de producción
1. Variables de entorno definitivas.
2. Build de frontend y start de backend.
3. Hardening básico de CORS y headers.
4. Smoke tests manuales en entorno similar a prod.

Criterio de salida:
- artefactos listos para Dokploy.

---

## 6) Despliegue en Dokploy (Railpack) sobre VPS

## 6.1 Estrategia recomendada
Desplegar como dos servicios independientes en Dokploy:
- Servicio 1: frontend (build estático de Vite).
- Servicio 2: backend Node (Express).

Ventajas:
- Separación de responsabilidades.
- Escalado y reinicio independiente.
- Variables de entorno aisladas por servicio.

## 6.2 Pasos de despliegue
1. Conectar repositorio en Dokploy.
2. Crear servicio frontend:
   - Contexto: carpeta frontend.
   - Build command: pnpm install --frozen-lockfile && pnpm build.
   - Output: dist.
3. Crear servicio backend:
   - Contexto: carpeta backend.
   - Build/install: pnpm install --frozen-lockfile.
   - Start: pnpm start.
4. Configurar variables de entorno backend:
   - OPENROUTER_API_KEY
   - OPENROUTER_MODEL
   - PORT
5. Configurar dominio/subdominio:
   - frontend en dominio principal.
   - backend en subdominio api.
6. Configurar CORS backend para permitir origen del frontend.
7. Probar flujo completo en producción con streaming.

## 6.3 Consideraciones específicas de Railpack
- Confirmar detección de Node y comandos de build/start por servicio.
- Verificar que pnpm esté disponible en imagen/buildpack o definir instalación previa.
- Validar healthcheck del backend para reinicios automáticos.

## 6.4 Checklist post-deploy
- El chat responde en streaming real, sin esperar respuesta completa.
- No hay API keys visibles en frontend ni en payloads públicos.
- CORS correctamente restringido al dominio frontend.
- Logs backend sin datos sensibles.

---

## 7) Riesgos técnicos y mitigaciones

1. Saturación o límites del modelo gratuito.
Mitigación: fallback de modelo configurable por entorno.

2. Cortes de streaming por proxies intermedios.
Mitigación: headers correctos para SSE y keep-alive.

3. Respuestas IA inconsistentes o malformadas.
Mitigación: parser tolerante + fallback a texto.

4. Exposición accidental de secretos.
Mitigación: auditoría de variables y revisión de código antes de deploy.

---

## 8) Definiciones de éxito

- Arquitectura separada frontend/backend funcionando en local.
- Streaming de IA operativo de extremo a extremo.
- Estados UX loading/success/error implementados.
- Despliegue estable en Dokploy con dominio activo.
- Cero secretos en cliente.

---

## 9) Próximo paso después de aprobación

Tras tu aprobación de este PLAN.md:
1. Ejecutar Fase 0 paso a paso.
2. Validar cada hito contigo antes de continuar.
3. Implementar streaming en backend y consumo progresivo en frontend.
