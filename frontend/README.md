# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

ola pene
## Seguridad de dependencias (marzo 2026)

- Se eliminó `force` (arrastraba `request`, `mime@1`, `qs` y `tough-cookie` legacy).
- Se eliminó `@tailwindcss/postcss7-compat` para evitar cadena PostCSS 7 no mantenida.
- Se eliminó `xlsx` (SheetJS CE en npm) y se migraron las exportaciones Excel a `exceljs`.
- En el código actual, las utilidades de Excel solo exportan archivos; no se parsean archivos Excel subidos por usuario en frontend.

Si se vuelve a implementar importación de archivos Excel desde usuario, agregar validación estricta de extensión/tamaño y sanitización en backend antes de parsear.
