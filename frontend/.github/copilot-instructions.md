# Copilot Instructions for kajamart Frontend

## Arquitectura General
- Proyecto basado en React + Vite, con estructura modular en `src/features` para funcionalidades principales (productos, ventas, devoluciones, usuarios, etc.).
- Los layouts principales están en `src/layouts/`, separando vistas autenticadas (`MainLayout.jsx`) y de autenticación (`AuthLayout.jsx`).
- Componentes compartidos se ubican en `src/shared/components/` (ej: `alerts.jsx`, `buttons.jsx`, `sidebar.jsx`).
- Archivos de configuración clave: `vite.config.js`, `tailwind.config.js`, `eslint.config.js`, `postcss.config.js`.

## Flujos de Desarrollo
- **Build:** Usar `npm run build` para compilar el proyecto con Vite.
- **Desarrollo:** Usar `npm run dev` para iniciar el servidor local con HMR.
- **Lint:** Ejecutar `npm run lint` para verificar reglas de ESLint.
- **Estilos:** TailwindCSS está configurado vía `tailwind.config.js` y `postcss.config.js`.

## Convenciones y Patrones
- Cada feature tiene su propio subdirectorio en `src/features/`, siguiendo el patrón `index[Feature].jsx` para el punto de entrada.
- Los modales y componentes específicos de cada feature se agrupan en subcarpetas (`modals/`, `modal/`).
- Los archivos de estilos suelen estar junto al componente (`footerComponent.css` junto a `footerComponent.jsx`).
- Las rutas principales se definen en `src/routes.jsx`.
- Los assets se centralizan en `src/assets/`.

## Integraciones y Dependencias
- React Router se utiliza para navegación (ver `src/routes.jsx`).
- TailwindCSS para estilos utilitarios.
- Vite como bundler y servidor de desarrollo.
- ESLint para linting, con reglas personalizadas en `eslint.config.js`.

## Ejemplo de Estructura de Feature
```
src/features/returns/
  indexProductReturns.jsx
  low/
    indexLow.jsx
    modal/
      registerLow.jsx
  returnClient/
    indexClientReturns.jsx
    modals/
      detailsClientReturn/
        detailsClientReturn.jsx
      registerClientReturn/
        completeReturn.jsx
        returnSaleComponent.jsx
        searchSale.jsx
```

## Recomendaciones para Agentes AI
- Priorizar la reutilización de componentes en `src/shared/components/`.
- Mantener la estructura modular por feature.
- Seguir las convenciones de nombres y ubicación de archivos.
- Consultar los archivos de configuración para ajustes de build, lint y estilos.
- Referenciar `README.md` para detalles adicionales sobre configuración y plugins.

---
¿Hay alguna sección que requiera mayor detalle o aclaración? Indica qué parte del flujo, arquitectura o convención no quedó clara para mejorar estas instrucciones.