# 🍣 Sushi Counter

**Cada pieza cuenta.** Sushi Counter te ayuda a contar lo que comes, guardar tus comidas y competir con tus amigos.

Empieza a contar al instante, sin crear una cuenta. Si inicias sesión, también puedes consultar tu calendario e historial, ver estadísticas y participar en torneos. La app está disponible en español e inglés y funciona como una PWA instalable.

## ✨ Qué puedes hacer

- **Contar sushi al momento:** suma o resta piezas con un toque, sin registro.
- **Guardar tus comidas:** crea una cuenta para mantener tu historial.
- **Ver tu progreso:** consulta el calendario y las estadísticas de consumo.
- **Competir con amigos:** crea o únete a torneos y comparte invitaciones.
- **Instalar la app:** úsala como aplicación web progresiva en dispositivos compatibles.

## 🧰 Tecnologías

- **Frontend:** React 19, React Router, TypeScript y Tailwind CSS.
- **Backend:** Node.js, Express, TypeScript y Socket.IO.
- **Datos:** SQLite.
- **Despliegue:** Docker y Docker Compose.

## 🚀 Puesta en marcha con Docker

Necesitas Docker y Docker Compose. Desde la raíz del proyecto:

1. Copia `.env.example` a `.env`.
2. Sustituye los secretos de ejemplo por valores aleatorios largos y distintos. Añade un `GOOGLE_CLIENT_ID` si vas a habilitar el inicio de sesión con Google.
3. Construye y arranca la aplicación:

```bash
docker compose up --build -d
```

La aplicación estará disponible en [http://localhost:50541](http://localhost:50541). La base de datos se conserva en `./data` gracias al volumen de Docker.

Para seguir los registros o detener el servicio:

```bash
docker compose logs -f sushi-app
docker compose down
```

## 🛠️ Desarrollo local

Requisitos: Node.js 20 o superior y npm. El backend y el frontend se ejecutan por separado en dos terminales.

### Backend

```bash
cd backend
npm ci
npm run dev
```

### Frontend

```bash
cd frontend
npm ci
npm run dev
```

Vite sirve la interfaz en `http://localhost:5173`. Configura el cliente del frontend para apuntar al backend local y revisa las variables de entorno antes de iniciar ambos servicios. Para compilar cada parte, ejecuta `npm run build` en `backend/` y `frontend/`.

## ⚙️ Configuración

Usa `.env.example` como referencia para la configuración del servidor:

| Variable | Uso |
| --- | --- |
| `NODE_ENV` | Entorno de ejecución (`development` o `production`). |
| `PORT` | Puerto del servidor. Docker Compose publica la app en el puerto `50541` del host. |
| `DATABASE_URL` | Ruta del archivo SQLite. En Docker, los datos persistentes viven en `/app/data`. |
| `JWT_SECRET` | Secreto privado para firmar tokens de acceso. |
| `REFRESH_TOKEN_SECRET` | Secreto privado e independiente para tokens de renovación. |
| `GOOGLE_CLIENT_ID` | Cliente OAuth de Google; necesario para activar ese método de inicio de sesión. |
| `ACCOUNT_DELETION_DAYS` | Días antes de completar una eliminación de cuenta programada. |

No reutilices los secretos de ejemplo en producción ni subas tu archivo `.env` al repositorio.

## 📁 Estructura

```text
.
├── backend/       # API, autenticación, base de datos y WebSocket
├── frontend/      # Aplicación React y recursos públicos
├── docs/          # Documentación del proyecto
├── scripts/       # Tareas de mantenimiento
├── Dockerfile
└── docker-compose.yml
```

## 📜 Licencia

Consulta al propietario del proyecto para conocer las condiciones de uso y distribución.
