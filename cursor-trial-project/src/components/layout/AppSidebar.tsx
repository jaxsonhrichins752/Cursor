import type { ReactNode } from 'react'
import { Box, Divider, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material'

type NavItem = {
  label: string
  icon: ReactNode
}

type AppSidebarProps = {
  drawerWidth: number
  mobileOpen: boolean
  onCloseMobile: () => void
  navItems: NavItem[]
}

export function AppSidebar({
  drawerWidth,
  mobileOpen,
  onCloseMobile,
  navItems,
}: AppSidebarProps) {
  const navContent = (
    <>
      <List>
        {navItems.map((item) => (
          <ListItemButton
            key={item.label}
            selected={item.label === 'Overview'}
            onClick={onCloseMobile}
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
    <>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onCloseMobile}
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
    </>
  )
}
