import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  CssBaseline,
  Grid,
  Typography,
} from '@mui/material'
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded'
import FolderRoundedIcon from '@mui/icons-material/FolderRounded'
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded'
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded'
import { WeatherWidget } from './components/WeatherWidget'
import { GoogleCalendarWidget } from './components/GoogleCalendarWidget'
import { GoogleTasksWidget } from './components/GoogleTasksWidget'
import { MtgCardOfDayWidget } from './components/MtgCardOfDayWidget'
import { AppHeader } from './components/layout/AppHeader'
import { AppSidebar } from './components/layout/AppSidebar'
import {
  fetchGoogleUserProfile,
  loadGoogleIdentityScript,
  requestGoogleAccessToken,
  revokeGoogleAccessToken,
} from './lib/googleIdentity'

type GoogleSession = {
  accessToken: string
  name: string
  email: string
  picture?: string
}

function App() {
  const drawerWidth = 240
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ''
  const googleScope =
    import.meta.env.VITE_GOOGLE_AUTH_SCOPE ??
    'openid profile email https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/tasks'

  const [session, setSession] = useState<GoogleSession | null>(null)
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { label: 'Overview', icon: <DashboardRoundedIcon /> },
    { label: 'Projects', icon: <FolderRoundedIcon /> },
    { label: 'Team', icon: <PeopleRoundedIcon /> },
    { label: 'Settings', icon: <SettingsRoundedIcon /> },
  ]

  useEffect(() => {
    // Preload Google Identity so popup can open directly on click.
    void loadGoogleIdentityScript().catch(() => {
      setAuthError('Failed to load Google sign-in script. Check your network and try again.')
    })
  }, [])

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

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.100' }}>
      <CssBaseline />
      <AppHeader
        isSignedIn={Boolean(session)}
        authLoading={authLoading}
        userName={session?.name}
        userAvatar={session?.picture}
        onOpenMobileMenu={() => setMobileMenuOpen(true)}
        onSignIn={() => void handleGoogleSignIn()}
        onSignOut={() => void handleGoogleSignOut()}
      />
      {authError && (
        <Box sx={{ p: 2, pb: 0 }}>
          <Alert severity="error">{authError}</Alert>
        </Box>
      )}

      <Box sx={{ display: 'flex' }}>
        <AppSidebar
          drawerWidth={drawerWidth}
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
          navItems={navItems}
        />

        <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 3 } }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Overview
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <GoogleTasksWidget accessToken={session?.accessToken ?? null} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <WeatherWidget />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <GoogleCalendarWidget accessToken={session?.accessToken ?? null} />
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <MtgCardOfDayWidget />
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  )
}

export default App
