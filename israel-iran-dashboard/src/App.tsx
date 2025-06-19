import { ThemeProvider } from './components/ui/theme-provider'
import { Dashboard } from './components/Dashboard'
import './App.css'

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="dashboard-theme">
      <div className="min-h-screen bg-background text-foreground">
        <Dashboard />
      </div>
    </ThemeProvider>
  )
}

export default App
