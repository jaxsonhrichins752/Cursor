/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPENWEATHER_API_KEY?: string
  readonly VITE_WEATHER_DEFAULT_CITY?: string
  readonly VITE_GOOGLE_CLIENT_ID?: string
  readonly VITE_GOOGLE_AUTH_SCOPE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
