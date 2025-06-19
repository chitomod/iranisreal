import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { AlertTriangle, Shield, Target, Users } from 'lucide-react'

interface EscalationIndicators {
  diplomaticTension: string
  militaryReadiness: string
  civilianEvacuations: string
  internationalConcern: string
}

interface RecentDevelopment {
  time: string
  event: string
  impact: string
}

interface StatusData {
  conflictStatus: {
    level: string
    description: string
    daysActive: number
  }
  escalationIndicators: EscalationIndicators
  recentDevelopments: RecentDevelopment[]
}

export function StatusPanel() {
  const [statusData, setStatusData] = useState<StatusData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStatusData = async () => {
      try {
        const response = await fetch('/data/current_status.json')
        const data = await response.json()
        setStatusData(data)
      } catch (error) {
        console.error('Failed to fetch status data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStatusData()
  }, [])

  const getIndicatorColor = (level: string) => {
    switch (level) {
      case 'critical':
      case 'very-high':
        return 'bg-red-500 text-red-50'
      case 'high':
      case 'maximum':
        return 'bg-orange-500 text-orange-50'
      case 'medium':
      case 'active':
        return 'bg-yellow-500 text-yellow-50'
      default:
        return 'bg-green-500 text-green-50'
    }
  }

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'medium':
        return <Target className="h-4 w-4 text-orange-500" />
      default:
        return <Shield className="h-4 w-4 text-blue-500" />
    }
  }

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString()
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Status Overview</CardTitle>
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

  if (!statusData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Failed to load status data</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Current Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Threat Level</span>
              <Badge variant="destructive" className="animate-pulse">
                {statusData.conflictStatus.level.toUpperCase()}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {statusData.conflictStatus.description}
            </p>
            <div className="flex items-center text-sm">
              <span className="font-medium">Duration:</span>
              <span className="ml-2">{statusData.conflictStatus.daysActive} days of active conflict</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Escalation Indicators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Escalation Indicators</span>
          </CardTitle>
          <CardDescription>Key metrics indicating conflict intensity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Diplomatic Tension</span>
              <Badge className={getIndicatorColor(statusData.escalationIndicators.diplomaticTension)}>
                {statusData.escalationIndicators.diplomaticTension.replace('-', ' ')}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Military Readiness</span>
              <Badge className={getIndicatorColor(statusData.escalationIndicators.militaryReadiness)}>
                {statusData.escalationIndicators.militaryReadiness}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Civilian Evacuations</span>
              <Badge className={getIndicatorColor(statusData.escalationIndicators.civilianEvacuations)}>
                {statusData.escalationIndicators.civilianEvacuations}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">International Concern</span>
              <Badge className={getIndicatorColor(statusData.escalationIndicators.internationalConcern)}>
                {statusData.escalationIndicators.internationalConcern}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Developments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Recent Developments</span>
          </CardTitle>
          <CardDescription>Latest events in the past 24 hours</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {statusData.recentDevelopments.map((dev, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-start space-x-2">
                  {getImpactIcon(dev.impact)}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {formatTime(dev.time)}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {dev.impact}
                      </Badge>
                    </div>
                    <p className="text-sm">{dev.event}</p>
                  </div>
                </div>
                {index < statusData.recentDevelopments.length - 1 && (
                  <Separator className="my-2" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
