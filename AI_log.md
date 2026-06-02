# Registro de Uso de Inteligencia Artificial (AI Log)

## Resumen del uso de la IA
Durante este desarrollo, se utilizó la IA como asistente de programación principalmente para:
- Implementar la integración con la **API de Google Wallet** para la creación y gestión de pases de fidelidad (Loyalty Objects / Classes).
- Desarrollar la lógica de back-end en Node.js/TypeScript, incluyendo el servicio `googleWallet.service.ts`, el controlador `wallet.controller.ts` y las rutas en `wallet.ts`.
- Generar el enlace seguro JWT ("Save to Google Wallet") para que los usuarios (customers) puedan guardar su tarjeta de fidelidad de EasyEat.

## Errores de la IA y Rectificaciones realizadas
A lo largo de la integración, la IA cometió algunos errores y asunciones incorrectas que tuvieron que ser corregidas manualmente:

1. **Rutas de Archivos de Credenciales**: 
   - *Error de la IA*: La IA propuso rutas estáticas o incorrectas para acceder al archivo de configuración de Service Account de Google (`google-wallet.json`), lo que provocaba que el servidor fallara al intentar leer el archivo con `fs.readFileSync`.
   - *Rectificación*: Se tuvo que depurar y ajustar las rutas usando `path.resolve(process.cwd(), ...)` y crear un fallback lógico para asegurar que el archivo se encontrara correctamente independientemente desde dónde se iniciara el script.

2. **Manejo de Errores de la API de Google (404 Not Found)**:
   - *Error de la IA*: Al buscar si un `LoyaltyObject` ya existía mediante una petición `GET`, la API de Google devolvía un `404` si era la primera vez. El código original de la IA fallaba estrepitosamente en lugar de capturar el 404 y proceder a crearlo.
   - *Rectificación*: Hubo que modificar el bloque `try/catch` para verificar si `err.response?.status === 404` y permitir que el flujo continuara hacia la creación del nuevo objeto de fidelidad en lugar de lanzar una excepción que tirara el proceso.

3. **Configuración del JWT e Identificadores**:
   - *Error de la IA*: La IA tuvo problemas al manejar los `objectId` e `issuerId`, mezclando los formatos que requiere Google (ej. `ISSUER_ID.OBJECT_SUFFIX`).
   - *Rectificación*: Se verificaron los ID y los orígenes válidos (CORS `origins`) en el *payload* del JWT para garantizar que el botón de añadir a Google Wallet renderizara correctamente en el frontend de React.

4. **Variables de Entorno**:
   - La IA intentó en varias ocasiones insertar el contenido sensible en el código directamente o no lo aisló adecuadamente. Hubo que asegurar que el archivo `.env` y el JSON de Google se mantuvieran en `.gitignore`.
