# Gestor de tareas - Prueba Ant Pack

Aplicación web para crear, editar, filtrar y actualizar tareas. Incluye un dashboard con métricas, búsqueda por título y paginación.

## Ejecutar el proyecto en local

Necesitas tener instalado Node.js y npm.

1. Instala las dependencias:

```bash
npm install
```

2. Inicia el servidor de desarrollo:

```bash
npm run dev
```

3. Abre [http://localhost:3000](http://localhost:3000) en el navegador.

La base de datos SQLite se crea automáticamente en el archivo `data.db` cuando se ejecuta la aplicación por primera vez.

## Arquitectura

- **Next.js App Router:** organiza las páginas y las rutas de la API dentro de la carpeta `app`.
- **Server Component inicial:** `app/page.tsx` carga las tareas en el servidor antes de enviar la página al navegador. Esto mejora la carga inicial y evita una petición duplicada al montar la pantalla.
- **Componentes cliente:** los filtros, la búsqueda, la paginación, los formularios y los cambios de estado funcionan en el navegador porque necesitan interacción del usuario.
- **API Routes:** las rutas de `app/api` manejan las operaciones de tareas y métricas: consultar, crear y actualizar.
- **Axios:** `app/lib/api.ts` centraliza las llamadas del frontend a la API para que sean más fáciles de mantener.
- **SQLite con better-sqlite3:** guarda las tareas en una base de datos local y sencilla, sin necesitar un servidor de base de datos externo.

## Librerías principales

- **Tailwind CSS:** estilos de la interfaz.
- **shadcn/ui:** componentes reutilizables como `Card`, `Dialog`, `Select`, `Skeleton` y `Sonner`.
- **Lucide React:** iconos de la interfaz.
- **Sonner:** mensajes de confirmación y error para las acciones de la API.
- **Ubuntu:** fuente principal de la aplicación.

## Comandos disponibles

```bash
npm run dev      # Inicia el entorno de desarrollo
npm run build    # Crea la versión de producción
npm run start    # Inicia la versión de producción
npm run lint     # Revisa el código con ESLint
```
