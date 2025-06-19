import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Separator } from './ui/separator'
import { InteractiveMap } from './InteractiveMap'
import { NewsFeed } from './NewsFeed'
import { ConflictTimeline } from './ConflictTimeline'
import { StatusPanel } from './StatusPanel'
import { MetricsPanel } from './MetricsPanel'
import { ThemeToggle } from './ThemeToggle'
import { AlertTriangle, MapPin, Newspaper, Clock, Activity } from 'lucide-react'
import { useAutoRefresh } from '../hooks/useAutoRefresh'

interface ConflictStatus {
  level: string
  description: string
  daysActive: number
}

export function Dashboard() {
  const [conflictStatus, setConflictStatus] = useState<ConflictStatus>({
    level: 'critical',
    description: 'Loading...',
    daysActive: 0
  })
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Auto-refresh hook
  useAutoRefresh(async () => {
    if (autoRefresh) {
      await fetchLatestData()
    }
  }, 30000) // 30 seconds

  const fetchLatestData = async () => {
    try {
      const response = await fetch('/data/current_status.json')
      const data = await response.json()
      setConflictStatus(data.conflictStatus)
      setLastUpdated(data.lastUpdated)
    } catch (error) {
      console.error('Failed to fetch latest data:', error)
    }
  }

  useEffect(() => {
    fetchLatestData()
  }, [])

  const getStatusBadgeVariant = (level: string) => {
    switch (level) {
      case 'critical': return 'destructive'
      case 'high': return 'secondary'
      case 'medium': return 'outline'
      default: return 'default'
    }
  }

  const formatLastUpdated = (timestamp: string) => {
    if (!timestamp) return 'Never'
    return new Date(timestamp).toLocaleString()
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <h1 className="text-xl font-bold">Israel-Iran Conflict Dashboard</h1>
            </div>
            <Badge variant={getStatusBadgeVariant(conflictStatus.level)} className="animate-pulse">
              {conflictStatus.level.toUpperCase()}
            </Badge>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Last updated: {formatLastUpdated(lastUpdated)}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={autoRefresh ? 'bg-green-500/10 border-green-500/20' : ''}
            >
              <Activity className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-pulse' : ''}`} />
              Auto-refresh: {autoRefresh ? 'ON' : 'OFF'}
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Status Bar */}
      <div className="bg-red-500/10 border-b border-red-500/20 px-4 py-2">
        <div className="container flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium">Conflict Status:</span>
            <span className="text-sm">{conflictStatus.description}</span>
            <Separator orientation="vertical" className="h-4" />
            <span className="text-sm">Day {conflictStatus.daysActive} of direct military exchange</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Current Time: {new Date().toLocaleString()}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 container py-6 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
          {/* Left Sidebar - Status and Metrics */}
          <div className="lg:col-span-1 space-y-6">
            <StatusPanel />
            <MetricsPanel />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="map" className="h-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="map" className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>Map</span>
                </TabsTrigger>
                <TabsTrigger value="news" className="flex items-center space-x-2">
                  <Newspaper className="h-4 w-4" />
                  <span>News</span>
                </TabsTrigger>
                <TabsTrigger value="timeline" className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>Timeline</span>
                </TabsTrigger>
                <TabsTrigger value="analysis" className="flex items-center space-x-2">
                  <Activity className="h-4 w-4" />
                  <span>Analysis</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="map" className="h-[calc(100vh-240px)]">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Interactive Conflict Map</CardTitle>
                    <CardDescription>
                      Real-time visualization of conflict zones, strike locations, and defense systems
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-[calc(100%-80px)]">
                    <InteractiveMap />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="news" className="h-[calc(100vh-240px)]">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Live News Feed</CardTitle>
                    <CardDescription>
                      Latest updates from trusted international and regional news sources
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-[calc(100%-80px)]">
                    <NewsFeed />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="timeline" className="h-[calc(100vh-240px)]">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Conflict Timeline</CardTitle>
                    <CardDescription>
                      Chronological overview of major events from October 2024 to present
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-[calc(100%-80px)]">
                    <ConflictTimeline />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analysis" className="h-[calc(100vh-240px)]">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Conflict Analysis</CardTitle>
                    <CardDescription>
                      Strategic analysis, patterns, and escalation indicators
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-[calc(100%-80px)]">
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      <div className="text-center space-y-2">
                        <Activity className="h-12 w-12 mx-auto opacity-50" />
                        <p>Analysis panel coming soon</p>
                        <p className="text-sm">Advanced analytics and trend analysis will be available here</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-12 items-center justify-between px-4 text-sm text-muted-foreground">
          <div>
            © 2025 Israel-Iran Conflict Dashboard. Data from multiple verified sources.
          </div>
          <div className="flex items-center space-x-4">
            <span>Sources: AP, Reuters, BBC, CNN, Al Jazeera, Jerusalem Post</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
