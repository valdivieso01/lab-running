# Reglas y Pautas del Proyecto (Lab Running)

Este archivo define las reglas mandatorias que el asistente de IA debe seguir automáticamente en cada interacción y modificación de código.

---

## 1. Transparencia y Consentimiento Previo (Mandatorio)
- **Nunca modificar, crear ni eliminar archivos sin autorización:** Antes de realizar cualquier cambio en el código o estructura del proyecto, explicar claramente:
  1. Qué archivos se van a modificar o crear.
  2. Por qué se realiza el cambio.
  3. Esperar la confirmación y visto bueno explícito del usuario antes de proceder.

---

## 2. Rendimiento y Buenas Prácticas en React
- **Optimización de renderizado:** Evitar cálculos pesados en el cuerpo de los componentes. Usar `useMemo` y `useCallback` en listas grandes, tablas de ritmos o filtrado de zapatillas.
- **Ciclo de vida y Hooks:** Mantener dependencias de hooks (`useEffect`, `useCallback`) estrictas y limpias, evitando bucles o re-renders innecesarios.
- **Componentes modulares:** Mantener componentes limpios, enfocados en una única responsabilidad (por ejemplo: `PaceTable`, `GearAdvisor`, `TestInput`).

---

## 3. Calidad de Código y TypeScript
- **Tipado estricto:** Prohibido el uso de `any`. Todos los modelos de datos (zonas de ritmo, ritmos de carrera, tipos de calzado, marcas) deben estar tipados con interfaces o tipos explícitos.
- **Inmutabilidad y seguridad:** Evitar mutar estados o props directamente. Validar valores nulos o indefinidos de manera segura.

---

## 4. Diseño y Accesibilidad (A11y)
- **Semántica HTML:** Utilizar elementos semánticos estándar (`<main>`, `<section>`, `<article>`, `<button>`, `<label>`).
- **Accesibilidad:** Todos los inputs deben tener `<label>` asociado o `aria-label`. Los elementos interactivos deben ser accesibles por teclado y tener estados de foco claros.
- **Responsive Design:** Diseño adaptativo para dispositivos móviles y escritorio usando Tailwind CSS (*mobile-first*).

---

## 5. Verificación de Sanidad
- Antes de dar por finalizada una tarea técnica o refactorización, validar que la aplicación compile sin errores de tipos (`npm run build` o `npx tsc --noEmit`).

---

## 6. Uso Obligatorio de Herramientas y Agentes Globales (`C:\Users\hjavi\.agents`)
El asistente debe consultar y aplicar activamente las pautas de las herramientas globales instaladas en `C:\Users\hjavi\.agents` según la tarea:
- **Revisión de React y Componentes:** Aplicar los criterios de `agents/react-reviewer.md` y `workflows/react-review.md`.
- **Optimización y Rendimiento:** Aplicar las pautas de `agents/performance-optimizer.md`.
- **Accesibilidad:** Cumplir los estándares de `agents/a11y-architect.md`.
- **Calidad de Código y Arquitectura:** Seguir las directivas de `agents/code-reviewer.md`, `agents/code-architect.md` y el flujo de `workflows/quality-gate.md`.

