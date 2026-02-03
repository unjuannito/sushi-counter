# Guía Técnica: Sistema de Autenticación JWT y Google OAuth

Este documento detalla el flujo de autenticación, la migración de usercodes y los procedimientos de seguridad implementados.

## 1. Flujo de Autenticación JWT

El sistema utiliza tokens JWT (JSON Web Tokens) para la autenticación y autorización.

### Componentes:
- **Access Token**: Token de corta duración (1 hora) utilizado para autorizar solicitudes al backend.
- **Refresh Token**: Token de larga duración (7 días) utilizado para obtener nuevos Access Tokens sin que el usuario deba loguearse nuevamente.
- **Token Versioning**: Cada usuario tiene un `token_version` en la base de datos. Si se incrementa, todos los tokens anteriores (Access y Refresh) quedan invalidados inmediatamente.

### Flujo de Login:
1. El usuario se autentica vía Google OAuth o Email/Password.
2. El servidor valida las credenciales.
3. El servidor genera un Access Token y un Refresh Token que incluyen el `id` del usuario y la `token_version` actual.
4. El cliente almacena estos tokens y envía el Access Token en el header `Authorization: Bearer <token>` en cada solicitud.

## 2. Integración con Google OAuth

Se utiliza `google-auth-library` para validar la identidad de los usuarios.

- El frontend obtiene un `credential` (ID Token) de Google.
- El backend verifica este token contra el `GOOGLE_CLIENT_ID`.
- Se realiza una validación cruzada: se busca al usuario por su `google_id` o `email` verificado por Google.
- Si el usuario no existe, se crea uno nuevo con una `token_version` inicial de 0.

## 3. Migración de Usercodes a JWT

El uso de `userCode` ha sido eliminado de todas las operaciones normales y solo se mantiene para la migración.

### Pasos para la migración gradual:
1. **Detección**: El frontend identifica si el usuario tiene un `userCode` guardado pero no un JWT.
2. **Verificación**: El frontend llama a `/api/auth/verify/:userCode` para confirmar la existencia de la cuenta antigua.
3. **Vinculación**: El usuario elige migrar su cuenta creando una contraseña o vinculando su cuenta de Google.
4. **Actualización**: El backend actualiza el registro del usuario con el nuevo `email`/`password` o `google_id`, e invalida la posibilidad de usar el `userCode` para futuras creaciones marcándolo internamente.
5. **Transición**: Una vez migrado, el `userCode` se mantiene en la DB por referencia histórica pero no se utiliza para autenticación.

## 4. Medidas de Seguridad

- **Invalidación de Sesiones**: El endpoint `/api/auth/logout` incrementa la `token_version`, cerrando sesión en todos los dispositivos.
- **Protección CSRF**: Al usar el header `Authorization`, las solicitudes están protegidas contra CSRF estándar ya que los navegadores no envían este header automáticamente en peticiones de otros sitios.
- **Cifrado**: Los tokens están firmados con algoritmos HS256 utilizando secretos configurados en variables de entorno.
- **Bloqueo de Usercodes**: Se ha bloqueado la generación de nuevos usercodes legibles; ahora se generan con un prefijo `MIGRATED_` que no es aceptado por las rutas antiguas de verificación si se deseara restringir más.

## 5. Procedimientos de Emergencia

### Fallo en la Validación de Google
Si el servicio de Google OAuth falla:
- Los usuarios con Email/Password pueden seguir accediendo.
- Se debe revisar la configuración del `GOOGLE_CLIENT_ID` en el `.env`.

### Compromiso de Tokens
Si se detecta actividad sospechosa masiva:
- Se puede ejecutar una consulta SQL para incrementar el `token_version` de todos los usuarios:
  `UPDATE users SET token_version = token_version + 1;`
- Esto obligará a todos los usuarios a volver a loguearse, invalidando cualquier token robado.

### Error de Base de Datos (SQLite)
Si la base de datos se corrompe:
- Restaurar desde el último backup (si existe).
- Ejecutar `npx ts-node src/scripts/update_db.ts` para asegurar que el esquema es correcto.
