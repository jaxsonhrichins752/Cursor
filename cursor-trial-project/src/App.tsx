import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  CssBaseline,
  Grid,
  Typography,
} from '@mui/material'
import { WeatherWidget } from './components/WeatherWidget'
import { GoogleCalendarWidget } from './components/GoogleCalendarWidget'
import { GoogleTasksWidget } from './components/GoogleTasksWidget'
import { MtgCardOfDayWidget } from './components/MtgCardOfDayWidget'
import { AppHeader } from './components/layout/AppHeader'
import {
  fetchGoogleUserProfile,
  loadGoogleIdentityScript,
  requestGoogleAccessToken,
  revokeGoogleAccessToken,
} from './lib/googleIdentity'

/**
 * App shell + orchestration layer.
 *
 * Responsibilities:
 * - Reads auth-related env config (Google client ID and requested scopes)
 * - Owns global auth state (signed-in user session, loading, and auth errors)
 * - Handles Google sign-in/sign-out token lifecycle
 * - Passes access token down to widgets that need Google APIs
 * - Lays out dashboard widgets in a responsive grid
 *
 * Mental model:
 * - This file is mostly app-level wiring and state.
 * - Feature details live in widget and lib files.
 */
type GoogleSession = {
  accessToken: string
  name: string
  email: string
  picture?: string
}

function App() {
  // Read order for this component:
  // 1) Config from env
  // 2) Auth-related state
  // 3) Startup preload effect
  // 4) Sign-in / sign-out handlers
  // 5) JSX layout that composes dashboard widgets

  // 1) Config: env-driven OAuth settings with a default scope string.
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ''
  const googleScope =
    import.meta.env.VITE_GOOGLE_AUTH_SCOPE ??
    'openid profile email https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/tasks'

  // 2) App-level auth state shared with the header and Google-backed widgets.
  const [session, setSession] = useState<GoogleSession | null>(null)
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  // 3) Startup effect: preload Google Identity script for smoother sign-in clicks.
  useEffect(() => {
    // Preload Google Identity so popup can open directly on click.
    void loadGoogleIdentityScript().catch(() => {
      setAuthError('Failed to load Google sign-in script. Check your network and try again.')
    })
  }, [])

  // 4a) Auth action: request token + profile, then persist an in-memory session.
  const handleGoogleSignIn = async () => {
    if (!googleClientId) {
      setAuthError('Add VITE_GOOGLE_CLIENT_ID to your .env file.')
      return
    }

    setAuthLoading(true)
    setAuthError(null)
    try {
      const accessToken = await requestGoogleAccessToken({
        clientId: googleClientId,
        scope: googleScope,
      })
      const profile = await fetchGoogleUserProfile(accessToken)
      setSession({
        accessToken,
        name: profile.name,
        email: profile.email,
        picture: profile.picture,
      })
    } catch (error) {
      setAuthError(
        error instanceof Error ? error.message : 'Google sign-in failed.',
      )
    } finally {
      setAuthLoading(false)
    }
  }

  // 4b) Auth action: revoke current token and clear session state.
  const handleGoogleSignOut = async () => {
    if (!session) {
      return
    }

    setAuthLoading(true)
    setAuthError(null)
    try {
      await revokeGoogleAccessToken(session.accessToken)
      setSession(null)
    } catch (error) {
      setAuthError(
        error instanceof Error ? error.message : 'Google sign-out failed.',
      )
    } finally {
      setAuthLoading(false)
    }
  }

  // 5) Render: app shell, auth error banner, then responsive dashboard widgets.
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.100' }}>
      <CssBaseline />
      {/* Header reflects auth state and exposes sign-in/sign-out actions. */}
      <AppHeader
        isSignedIn={Boolean(session)}
        authLoading={authLoading}
        userName={session?.name}
        userAvatar={session?.picture}
        onSignIn={() => void handleGoogleSignIn()}
        onSignOut={() => void handleGoogleSignOut()}
      />
      {authError && (
        <Box sx={{ p: 2, pb: 0 }}>
          <Alert severity="error">{authError}</Alert>
        </Box>
      )}

      <Box component="main" sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Overview
        </Typography>
        {/* Grid is the high-level dashboard composition map. */}
        <Grid
          container
          spacing={2}
          sx={{
            alignItems: 'stretch',
            gridAutoRows: { xs: 'auto', md: 'minmax(160px, auto)' },
          }}
        >
          {/* Left/top: task list (Google token required). */}
          <Grid size={{ xs: 12, md: 7 }}>
            <GoogleTasksWidget accessToken={session?.accessToken ?? null} />
          </Grid>
          {/* Right/top: weather (public API, no Google token needed). */}
          <Grid size={{ xs: 12, md: 5 }}>
            <WeatherWidget />
          </Grid>
          {/* Bottom-left: compact calendar agenda (Google token required). */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }} sx={{ alignSelf: 'start' }}>
            <GoogleCalendarWidget accessToken={session?.accessToken ?? null} />
          </Grid>
          {/* Bottom-right: MTG card content block (independent feature card). */}
          <Grid size={{ xs: 12, sm: 6, md: 8 }}>
            <MtgCardOfDayWidget />
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}

export default App
