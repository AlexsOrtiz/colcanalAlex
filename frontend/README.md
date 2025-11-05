# Canalco Frontend

Interfaz React + Vite para el módulo de autenticación de Canalco.

## Requisitos

- Node.js 18 o superior
- npm 9 o superior

## Primeros pasos

1. Copia el archivo de entorno:
   ```bash
   cp .env.example .env
   ```
   Ajusta `VITE_API_BASE_URL` si tu backend usa otra URL.

2. Instala dependencias:
   ```bash
   npm install
   ```

3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

   Abre la URL que Vite indique (por defecto `http://localhost:5173`).

## Estructura relevante

- `src/pages/LoginPage.tsx`: pantalla principal de autenticación.
- `src/components/LogoHeader`: contenedor para los logotipos institucionales.
- `src/components/ImageCarousel`: carrusel de imágenes con mensajes corporativos.
- `src/components/LoginForm`: formulario de inicio de sesión con validaciones.
- `src/services/authService.ts`: cliente HTTP que consume `/api/auth/login`.
- `src/styles/global.css`: variables CSS (colores, sombras, tipografías) fáciles de ajustar.

## Personalización pendiente

- Sustituir los logotipos por los archivos definitivos cuando estén disponibles.
- Reemplazar las imágenes del carrusel (`carouselItems` en `LoginPage.tsx`) con activos institucionales.
- Cuando se integre el router, redirigir al módulo por defecto (`default_module`) tras el login exitoso.
