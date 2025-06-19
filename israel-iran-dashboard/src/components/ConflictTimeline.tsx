import { useState, useEffect } from 'react'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { ScrollArea } from './ui/scroll-area'
import { Separator } from './ui/separator'
import { 
  Calendar,
  Target,
  AlertTriangle,
  Users,
  FileText,
  Clock
} from 'lucide-react'

interface TimelineEvent {
  id: string
  date: string
  title: string
  description: string
  type: string
  severity: string
  location: string
  casualties: number
  source: string
}

export function ConflictTimeline() {
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState('all')

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const response = await fetch('/data/conflict_timeline.json')
        const data = await response.json()
        // Sort events by date (newest first)
        const sortedData = data.sort((a: TimelineEvent, b: TimelineEvent) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )
        setTimelineEvents(sortedData)
      } catch (error) {
        console.error('Failed to fetch timeline:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTimeline()
  }, [])

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'military_action': return <Target className="h-5 w-5" />
      case 'execution': return <AlertTriangle className="h-5 w-5" />
      case 'analysis': return <FileText className="h-5 w-5" />
      default: return <Calendar className="h-5 w-5" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 border-red-600'
      case 'high': return 'bg-orange-500 border-orange-600'
      case 'medium': return 'bg-yellow-500 border-yellow-600'
      case 'low': return 'bg-blue-500 border-blue-600'
      default: return 'bg-gray-500 border-gray-600'
    }
  }

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive'
      case 'high': return 'secondary'
      case 'medium': return 'outline'
      default: return 'default'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return {
      day: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      year: date.getFullYear(),
      fullDate: date.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
  }

  const filteredEvents = selectedType === 'all' 
    ? timelineEvents 
    : timelineEvents.filter(event => event.type === selectedType)

  const eventTypes = [...new Set(timelineEvents.map(event => event.type))]

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading timeline...</div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Filter Controls */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedType('all')}
          className={`px-3 py-1 text-xs rounded ${
            selectedType === 'all'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          All Events ({timelineEvents.length})
        </button>
        {eventTypes.map(type => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-3 py-1 text-xs rounded ${
              selectedType === type
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} 
            ({timelineEvents.filter(e => e.type === type).length})
          </button>
        ))}
      </div>

      {/* Timeline */}
      <ScrollArea className="flex-1">
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border"></div>

          <div className="space-y-6">
            {filteredEvents.map((event, index) => {
              const date = formatDate(event.date)
              const isToday = new Date(event.date).toDateString() === new Date().toDateString()
              
              return (
                <div key={event.id} className="relative flex items-start space-x-4">
                  {/* Date Circle */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full border-4 flex flex-col items-center justify-center text-xs font-bold ${getSeverityColor(event.severity)} text-white ${isToday ? 'animate-pulse' : ''}`}>
                    <div className="leading-none">{date.day}</div>
                    <div className="leading-none text-[8px] opacity-75">{date.month}</div>
                  </div>

                  {/* Event Card */}
                  <Card className="flex-1 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="text-muted-foreground">
                              {getEventIcon(event.type)}
                            </div>
                            <Badge variant={getSeverityVariant(event.severity)}>
                              {event.severity}
                            </Badge>
                            <Badge variant="outline">
                              {event.type.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {date.fullDate}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="space-y-2">
                          <h3 className="font-semibold text-lg leading-tight">
                            {event.title}
                          </h3>
                          <p className="text-muted-foreground text-sm">
                            {event.description}
                          </p>
                        </div>

                        {/* Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">Location:</span>
                            <span className="font-medium">{event.location}</span>
                          </div>
                          {event.casualties > 0 && (
                            <div className="flex items-center space-x-1">
                              <Users className="h-3 w-3 text-red-500" />
                              <span className="text-muted-foreground">Casualties:</span>
                              <span className="font-medium text-red-600">{event.casualties}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-1">
                            <FileText className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">Source:</span>
                            <span className="font-medium">{event.source}</span>
                          </div>
                        </div>

                        {/* Today indicator */}
                        {isToday && (
                          <div className="flex items-center space-x-2 text-xs text-blue-600 bg-blue-50 dark:bg-blue-950 p-2 rounded">
                            <Clock className="h-3 w-3" />
                            <span className="font-medium">Happening Today</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )
            })}
          </div>

          {filteredEvents.length === 0 && (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No events found</h3>
              <p className="text-muted-foreground">
                No events match the selected filter criteria.
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Summary */}
      <div className="mt-4 p-4 bg-muted/50 rounded-lg">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-xl font-bold text-red-600">
              {timelineEvents.filter(e => e.severity === 'critical').length}
            </div>
            <div className="text-xs text-muted-foreground">Critical Events</div>
          </div>
          <div>
            <div className="text-xl font-bold text-orange-600">
              {timelineEvents.filter(e => e.type === 'military_action').length}
            </div>
            <div className="text-xs text-muted-foreground">Military Actions</div>
          </div>
          <div>
            <div className="text-xl font-bold text-red-600">
              {timelineEvents.reduce((sum, e) => sum + e.casualties, 0)}
            </div>
            <div className="text-xs text-muted-foreground">Total Casualties</div>
          </div>
          <div>
            <div className="text-xl font-bold">
              {Math.ceil((new Date().getTime() - new Date('2024-10-26').getTime()) / (1000 * 60 * 60 * 24))}
            </div>
            <div className="text-xs text-muted-foreground">Days Since First Strike</div>
          </div>
        </div>
      </div>
    </div>
  )
}
