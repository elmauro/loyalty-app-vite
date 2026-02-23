# React + TypeScript + Vite

Aplicación de fidelización (loyalty) con acumulación, redención, historial y administración de reglas.

## Módulos principales

- **Acumulación / Redención:** Formularios para registrar compras y canjear puntos. Selector de tipo de transacción (income).
- **Reglas:** Administración de reglas de bonificación por tipo de transacción (engine-api). GET/PUT plain JSON; ver `loyalty-program-serverless/docs/REQUERIMIENTOS-FRONTEND-JSON-RULES.md`.
- **Administración del Programa:** Configuración del programa y gestión de tipos de transacción (income/expense). Ver `docs/REQUERIMIENTO-TRANSACTION-TYPES-LOVABLE.md`.

## Despliegue en AWS (S3 + CloudFront + Route 53)

Hay un flujo de GitHub Actions para desplegar en AWS. Ver **[docs/DEPLOY-AWS.md](docs/DEPLOY-AWS.md)** para secrets, configuración S3/CloudFront y uso.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
