import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Progress } from './ui/progress'
import { Separator } from './ui/separator'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Target, Shield, AlertTriangle, Activity } from 'lucide-react'

interface Metrics {
  totalCasualties: number
  israeliCasualties: number
  iranianCasualties: number
  strikesBy: {
    israel: number
    iran: number
  }
  locationsTargeted: {
    inIran: string[]
    inIsrael: string[]
  }
  missileInterceptions: number
  infrastructureDamage: {
    iran: string[]
    israel: string[]
  }
}

interface MetricsData {
  metrics: Metrics
}

export function MetricsPanel() {
  const [metricsData, setMetricsData] = useState<MetricsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMetricsData = async () => {
      try {
        const response = await fetch('/data/current_status.json')
        const data = await response.json()
        setMetricsData(data)
      } catch (error) {
        console.error('Failed to fetch metrics data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMetricsData()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Conflict Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!metricsData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Conflict Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Failed to load metrics data</p>
        </CardContent>
      </Card>
    )
  }

  const { metrics } = metricsData

  // Data for charts
  const strikeData = [
    { name: 'Israel', strikes: metrics.strikesBy.israel, fill: '#3b82f6' },
    { name: 'Iran', strikes: metrics.strikesBy.iran, fill: '#ef4444' }
  ]

  const casualtyData = [
    { name: 'Israeli', value: metrics.israeliCasualties, fill: '#3b82f6' },
    { name: 'Iranian', value: metrics.iranianCasualties, fill: '#ef4444' }
  ]

  const interceptionRate = (metrics.missileInterceptions / (metrics.strikesBy.iran * 2.5)) * 100

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Key Metrics</span>
          </CardTitle>
          <CardDescription>Real-time conflict statistics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium">Casualties</span>
              </div>
              <div className="text-2xl font-bold">{metrics.totalCasualties}</div>
              <div className="text-xs text-muted-foreground">
                Israel: {metrics.israeliCasualties} | Iran: {metrics.iranianCasualties}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium">Total Strikes</span>
              </div>
              <div className="text-2xl font-bold">
                {metrics.strikesBy.israel + metrics.strikesBy.iran}
              </div>
              <div className="text-xs text-muted-foreground">
                Israel: {metrics.strikesBy.israel} | Iran: {metrics.strikesBy.iran}
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Interception Rate</span>
              </div>
              <span className="text-sm font-bold">{interceptionRate.toFixed(1)}%</span>
            </div>
            <Progress value={interceptionRate} className="h-2" />
            <div className="text-xs text-muted-foreground">
              {metrics.missileInterceptions} missiles intercepted
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Strike Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Strike Activity</CardTitle>
          <CardDescription>Comparative strike numbers by country</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={strikeData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Bar dataKey="strikes" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Casualty Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Casualty Distribution</CardTitle>
          <CardDescription>Breakdown of reported casualties</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={casualtyData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {casualtyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Targeted Locations */}
      <Card>
        <CardHeader>
          <CardTitle>Targeted Locations</CardTitle>
          <CardDescription>Areas under attack in both countries</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="font-medium text-sm mb-2 text-red-600">Iran ({metrics.locationsTargeted.inIran.length} locations)</div>
            <div className="space-y-1">
              {metrics.locationsTargeted.inIran.map((location, index) => (
                <div key={index} className="text-sm bg-red-50 dark:bg-red-950 p-2 rounded">
                  {location}
                </div>
              ))}
            </div>
          </div>
          
          <Separator />
          
          <div>
            <div className="font-medium text-sm mb-2 text-blue-600">Israel ({metrics.locationsTargeted.inIsrael.length} locations)</div>
            <div className="space-y-1">
              {metrics.locationsTargeted.inIsrael.map((location, index) => (
                <div key={index} className="text-sm bg-blue-50 dark:bg-blue-950 p-2 rounded">
                  {location}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Infrastructure Damage */}
      <Card>
        <CardHeader>
          <CardTitle>Infrastructure Impact</CardTitle>
          <CardDescription>Damaged civilian and military infrastructure</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="font-medium text-sm mb-2">Iran</div>
            <div className="space-y-1">
              {metrics.infrastructureDamage.iran.map((item, index) => (
                <div key={index} className="text-sm text-muted-foreground">• {item}</div>
              ))}
            </div>
          </div>
          
          <Separator />
          
          <div>
            <div className="font-medium text-sm mb-2">Israel</div>
            <div className="space-y-1">
              {metrics.infrastructureDamage.israel.map((item, index) => (
                <div key={index} className="text-sm text-muted-foreground">• {item}</div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
