# 🔐 Configuración de Google OAuth para Android

## ⚠️ Por qué no funciona el botón de Google

El OAuth de Google en aplicaciones móviles nativas requiere:
1. Configuración en Google Cloud Console
2. Configuración en Supabase
3. SHA-1 fingerprint de tu app
4. Google Services JSON

## 📋 Pasos para habilitar Google Sign-In

### 1. Obtener SHA-1 Fingerprint de tu app

En desarrollo (debug keystore):
```bash
cd android
./gradlew signingReport
```

Busca en la salida el **SHA-1** del debug keystore.

### 2. Crear OAuth Client ID en Google Cloud Console

1. Ve a: https://console.cloud.google.com/apis/credentials
2. Crea un nuevo proyecto (si no tienes uno)
3. Click en **"Create Credentials" → "OAuth Client ID"**
4. Selecciona **"Android"**
5. Pega:
   - **Package name**: `com.patoleonel.hotelmanager`
   - **SHA-1 fingerprint**: El que obtuviste en el paso 1

### 3. Configurar Supabase

1. Ve a: https://supabase.com/dashboard/project/mkflmlbqfdcvdnknmkmt/auth/providers
2. Click en **Google**
3. Habilita Google provider
4. En **"Authorized Client IDs"**, agrega el Client ID de Android que creaste

### 4. Alternativa: Usar Web OAuth (más simple para desarrollo)

Para desarrollo rápido sin toda la configuración nativa, puedes usar **WebBrowser** en lugar de OAuth nativo:

```javascript
// Ya está implementado en AuthContext.js
// Solo necesitas asegurarte de que Google esté habilitado en Supabase
```

## 🚀 Solución rápida para PROBAR AHORA

**Opción 1: Login con Email primero**
- Sí, puedes crear una cuenta con email primero
- Esto te permite probar el resto de la app
- Google OAuth puede configurarse después

**Opción 2: Habilitar Google en Supabase (básico)**
1. Ve a Supabase → Auth → Providers → Google
2. Habilita Google
3. Usa las credenciales por defecto de Supabase
4. Esto puede funcionar en el emulador con WebBrowser

**Opción 3: Deshabilitar el botón temporalmente**
- Comentar el botón de Google en LoginScreen.js
- Usar solo email/password por ahora
- Implementar Google OAuth en producción

## 📱 Nota sobre Emuladores

Google Sign-In en emuladores Android puede ser problemático porque:
- No tiene Google Play Services configurado
- El WebBrowser puede no abrir correctamente
- Funciona mejor en dispositivos físicos con Google Play Services

## ✅ Recomendación

Por ahora:
1. **Usa login con email** para desarrollo
2. **Configura Google OAuth** cuando vayas a producción
3. **Prueba en dispositivo físico** cuando tengas Google configurado
