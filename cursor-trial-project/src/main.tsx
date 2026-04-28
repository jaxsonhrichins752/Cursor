import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { CssBaseline } from '@mui/material'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import './index.css'
import App from './App.tsx'

const theme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
    },
    primary: {
      main: '#3f6f57',
      dark: '#325845',
      light: '#5e8c75',
    },
  },
  shape: {
    borderRadius: 14,
  },
  typography: {
    fontFamily: ['Inter', 'Segoe UI', 'Roboto', 'sans-serif'].join(','),
    h5: {
      fontWeight: 700,
      color: '#333333',
    },
    h6: {
      fontWeight: 700,
      color: '#333333',
    },
    body2: {
      color: '#666666',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#f8f9fa',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#333333',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          borderBottom: '1px solid #edf0f2',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundColor: '#ffffff',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          border: '1px solid #f0f2f4',
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: 24,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'standard',
      },
    },
    MuiInput: {
      styleOverrides: {
        root: {
          backgroundColor: '#fbfcfc',
          borderRadius: 8,
          paddingLeft: 10,
          paddingRight: 10,
        },
        underline: {
          '&:before': {
            borderBottom: '1px solid #d7dde1',
          },
          '&:after': {
            borderBottom: '2px solid #3f6f57',
          },
        },
      },
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
)
