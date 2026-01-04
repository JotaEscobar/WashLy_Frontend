/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Habilitar modo oscuro manual
  theme: {
    extend: {
      colors: {
        // Paleta WashLy
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6', // Azul Corporativo (Estándar)
          600: '#2563eb', // Hover
          900: '#1e3a8a', // Azul profundo
        },
        action: {
          400: '#34d399', // Verde Menta
          500: '#10b981', // Verde Éxito
          600: '#059669', // Verde Hover
        },
        surface: {
          50: '#f8fafc', // Fondo gris muy claro (casi blanco)
          100: '#f1f5f9', // Fondos de tarjetas
          900: '#0f172a', // Fondo modo oscuro
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      }
    },
  },
  plugins: [],
}