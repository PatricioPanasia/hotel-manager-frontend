
Proyecto "hotel-manager-native" — Conversión parcial del frontend a React Native (Expo).

Qué contiene:
- Estructura base de proyecto Expo con pantallas Login, Dashboard, Notes, Tasks.
- Context/AuthContext adaptado para comunicación con el backend (axios baseURL por defecto a http://10.0.2.2:3000; en dispositivo físico use la IP de su máquina).
- Componentes y estilos nativos (StyleSheet).
- Hooks/context originales copiados (si existían en frontend/src).

Siguientes pasos para ejecutar:
1. Copie o mueva esta carpeta a su máquina de trabajo.
2. Instale dependencias: npm install
3. Ejecute: npx expo start
4. Asegúrese que el backend (backend/) esté corriendo. Para emuladores Android use http://10.0.2.2:3000, para iOS simulador use http://localhost:3000, para dispositivo físico reemplace con la IP local de su PC.

Notas:
- He convertido los archivos principales y creado pantallas equivalentes. Falta convertir componentes específicos (Attendance, layout sidebar, etc.) — puedo continuar y convertir más archivos si lo desea.
- Reutilice hooks y contextos originales (copiados automáticamente si existían).
