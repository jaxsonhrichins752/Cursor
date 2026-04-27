import { useEffect, useState } from 'react'
import {
  Alert,
  AppBar,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CssBaseline,
  Divider,
  Drawer,
  Grid,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material'
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded'
import FolderRoundedIcon from '@mui/icons-material/FolderRounded'
import MenuRoundedIcon from '@mui/icons-material/MenuRounded'
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded'
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded'
import LoginRoundedIcon from '@mui/icons-material/LoginRounded'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import { WeatherWidget } from './components/WeatherWidget'
import { GoogleCalendarWidget } from './components/GoogleCalendarWidget'
import { GoogleTasksWidget } from './components/GoogleTasksWidget'
import { MtgCardOfDayWidget } from './components/MtgCardOfDayWidget'
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
  const [accountMenuAnchor, setAccountMenuAnchor] = useState<null | HTMLElement>(
    null,
  )

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

  const isAccountMenuOpen = Boolean(accountMenuAnchor)

  const navContent = (
    <>
      <List>
        {navItems.map((item) => (
          <ListItemButton
            key={item.label}
            selected={item.label === 'Overview'}
            onClick={() => setMobileMenuOpen(false)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
      <Divider sx={{ my: 1 }} />
      <Box sx={{ px: 2, pt: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Tip: Replace static values with API data when your backend is ready.
        </Typography>
      </Box>
    </>
  )

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.100' }}>
      <CssBaseline />
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            sx={{ mr: 1, display: { xs: 'inline-flex', md: 'none' } }}
            onClick={() => setMobileMenuOpen(true)}
          >
            <MenuRoundedIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Personal Dashboard
          </Typography>
          {!session ? (
            <Button
              color="inherit"
              variant="outlined"
              size="small"
              onClick={() => void handleGoogleSignIn()}
              disabled={authLoading}
              startIcon={<LoginRoundedIcon />}
              sx={{ mr: 1, borderColor: 'rgba(255,255,255,0.5)', color: 'inherit' }}
            >
              Sign in
            </Button>
          ) : (
            <IconButton
              color="inherit"
              onClick={(event) => setAccountMenuAnchor(event.currentTarget)}
              disabled={authLoading}
              sx={{ mr: 1 }}
              title="Account menu"
            >
              <Avatar
                src={session.picture}
                alt={session.name ?? 'User'}
                sx={{ width: 32, height: 32 }}
              >
                {(session.name?.[0] ?? 'J').toUpperCase()}
              </Avatar>
            </IconButton>
          )}
        </Toolbar>
      </AppBar>
      <Menu
        anchorEl={accountMenuAnchor}
        open={isAccountMenuOpen}
        onClose={() => setAccountMenuAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem
          disabled={authLoading}
          onClick={() => {
            setAccountMenuAnchor(null)
            void handleGoogleSignOut()
          }}
        >
          <ListItemIcon>
            <LogoutRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Log out</ListItemText>
        </MenuItem>
      </Menu>
      {authError && (
        <Box sx={{ p: 2, pb: 0 }}>
          <Alert severity="error">{authError}</Alert>
        </Box>
      )}

      <Box sx={{ display: 'flex' }}>
        <Drawer
          variant="temporary"
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              py: 2,
            },
          }}
        >
          {navContent}
        </Drawer>
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: 'none', md: 'block' },
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              position: 'relative',
              py: 2,
              borderRight: 1,
              borderColor: 'divider',
            },
          }}
        >
          {navContent}
        </Drawer>

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
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    Habit Streak
                  </Typography>
                  <Typography variant="h4">18 days</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    Focus Time
                  </Typography>
                  <Typography variant="h4">2h 40m</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <MtgCardOfDayWidget />
            </Grid>
          </Grid>

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Today
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2">- 9:00 AM: Workout</Typography>
                <Typography variant="body2">- 11:30 AM: Client sync</Typography>
                <Typography variant="body2">- 4:00 PM: Ship dashboard v1</Typography>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  )
}

export default App
