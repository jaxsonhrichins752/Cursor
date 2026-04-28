import { useState } from 'react'
import {
  AppBar,
  Avatar,
  Button,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@mui/material'
import MenuRoundedIcon from '@mui/icons-material/MenuRounded'
import LoginRoundedIcon from '@mui/icons-material/LoginRounded'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'

type AppHeaderProps = {
  isSignedIn: boolean
  authLoading: boolean
  userName?: string
  userAvatar?: string
  onOpenMobileMenu?: () => void
  onSignIn: () => void
  onSignOut: () => void
}

export function AppHeader({
  isSignedIn,
  authLoading,
  userName,
  userAvatar,
  onOpenMobileMenu,
  onSignIn,
  onSignOut,
}: AppHeaderProps) {
  const [accountMenuAnchor, setAccountMenuAnchor] = useState<null | HTMLElement>(
    null,
  )
  const isAccountMenuOpen = Boolean(accountMenuAnchor)

  return (
    <>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          {onOpenMobileMenu && (
            <IconButton
              color="inherit"
              edge="start"
              sx={{ mr: 1, display: { xs: 'inline-flex', md: 'none' } }}
              onClick={onOpenMobileMenu}
            >
              <MenuRoundedIcon />
            </IconButton>
          )}
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Personal Dashboard
          </Typography>
          {!isSignedIn ? (
            <Button
              color="primary"
              variant="outlined"
              size="small"
              onClick={onSignIn}
              disabled={authLoading}
              startIcon={<LoginRoundedIcon />}
              sx={{ mr: 1 }}
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
              <Avatar src={userAvatar} alt={userName ?? 'User'} sx={{ width: 32, height: 32 }}>
                {(userName?.[0] ?? 'J').toUpperCase()}
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
            onSignOut()
          }}
        >
          <ListItemIcon>
            <LogoutRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Log out</ListItemText>
        </MenuItem>
      </Menu>
    </>
  )
}
