import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import './index.css'
import App from './App.tsx'

const theme = createTheme({
  palette: {
    primary: {
      main: '#2e7d32',
      dark: '#1b5e20',
      light: '#66bb6a',
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
