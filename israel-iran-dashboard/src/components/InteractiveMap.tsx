import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet'
import { LatLngExpression, Icon, divIcon } from 'leaflet'
import { Badge } from './ui/badge'
import { AlertTriangle, Target, Shield, MapPin } from 'lucide-react'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in React-Leaflet
delete (Icon.Default.prototype as any)._getIconUrl
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface ConflictLocation {
  name: string
  coordinates: [number, number]
  status: string
  recentActivity: string
  severity: string
  casualties?: number
  lastStrike?: string
  type?: string
  damage?: string
  interceptions?: number
}

interface LocationData {
  iran: {
    capital: ConflictLocation
    targetedSites: ConflictLocation[]
  }
  israel: {
    majorCities: ConflictLocation[]
    defenseSystems: ConflictLocation[]
  }
  regionalContext: {
    center: [number, number]
    zoom: number
    countries: Array<{
      name: string
      coordinates: [number, number]
      status: string
      involvement: string
    }>
  }
}

// Custom icon components
const createCustomIcon = (type: string, severity: string) => {
  const getColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#ef4444'
      case 'high': return '#f97316'
      case 'medium': return '#eab308'
      default: return '#22c55e'
    }
  }

  const getIconHtml = (type: string) => {
    const iconMap = {
      'military': '⚔️',
      'infrastructure': '🏭',
      'city': '🏙️',
      'defense': '🛡️',
      'monitoring': '👁️'
    }
    return iconMap[type as keyof typeof iconMap] || '📍'
  }

  return divIcon({
    html: `<div style="background-color: ${getColor(severity)}; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
      <span style="font-size: 12px;">${getIconHtml(type)}</span>
    </div>`,
    className: 'custom-div-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  })
}

export function InteractiveMap() {
  const [locationData, setLocationData] = useState<LocationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedLayer, setSelectedLayer] = useState<string>('all')

  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        const response = await fetch('/data/conflict_locations.json')
        const data = await response.json()
        setLocationData(data)
      } catch (error) {
        console.error('Failed to fetch location data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLocationData()
  }, [])

  const formatTime = (timeString?: string) => {
    if (!timeString) return 'N/A'
    return new Date(timeString).toLocaleString()
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'rgb(239, 68, 68)'
      case 'high': return 'rgb(249, 115, 22)'
      case 'medium': return 'rgb(234, 179, 8)'
      default: return 'rgb(34, 197, 94)'
    }
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading map...</div>
      </div>
    )
  }

  if (!locationData) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-muted-foreground">Failed to load map data</div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Map Controls */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedLayer('all')}
          className={`px-3 py-1 text-xs rounded ${
            selectedLayer === 'all' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          All Locations
        </button>
        <button
          onClick={() => setSelectedLayer('strikes')}
          className={`px-3 py-1 text-xs rounded ${
            selectedLayer === 'strikes' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          Strike Sites
        </button>
        <button
          onClick={() => setSelectedLayer('cities')}
          className={`px-3 py-1 text-xs rounded ${
            selectedLayer === 'cities' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          Major Cities
        </button>
        <button
          onClick={() => setSelectedLayer('defense')}
          className={`px-3 py-1 text-xs rounded ${
            selectedLayer === 'defense' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          Defense Systems
        </button>
      </div>

      {/* Map Container */}
      <div className="flex-1 rounded-lg overflow-hidden border">
        <MapContainer
          center={locationData.regionalContext.center as LatLngExpression}
          zoom={locationData.regionalContext.zoom}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Iran - Capital */}
          {(selectedLayer === 'all' || selectedLayer === 'cities') && (
            <>
              <Marker
                position={locationData.iran.capital.coordinates as LatLngExpression}
                icon={createCustomIcon('city', locationData.iran.capital.severity)}
              >
                <Popup>
                  <div className="space-y-2">
                    <div className="font-bold flex items-center space-x-2">
                      <span>{locationData.iran.capital.name}</span>
                      <Badge variant="destructive">
                        {locationData.iran.capital.status.replace('-', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm">{locationData.iran.capital.recentActivity}</p>
                    <div className="text-xs text-muted-foreground">
                      Severity: {locationData.iran.capital.severity}
                    </div>
                  </div>
                </Popup>
              </Marker>
              <Circle
                center={locationData.iran.capital.coordinates as LatLngExpression}
                radius={50000}
                pathOptions={{
                  color: getSeverityColor(locationData.iran.capital.severity),
                  fillColor: getSeverityColor(locationData.iran.capital.severity),
                  fillOpacity: 0.1
                }}
              />
            </>
          )}

          {/* Iran - Targeted Sites */}
          {(selectedLayer === 'all' || selectedLayer === 'strikes') && 
            locationData.iran.targetedSites.map((site, index) => (
              <div key={index}>
                <Marker
                  position={site.coordinates as LatLngExpression}
                  icon={createCustomIcon(site.type || 'military', site.damage === 'severe' ? 'critical' : 'high')}
                >
                  <Popup>
                    <div className="space-y-2">
                      <div className="font-bold">{site.name}</div>
                      <div className="flex space-x-2">
                        <Badge variant="outline">{site.type}</Badge>
                        <Badge variant={site.damage === 'severe' ? 'destructive' : 'secondary'}>
                          {site.damage}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Last Strike: {formatTime(site.lastStrike)}
                      </div>
                    </div>
                  </Popup>
                </Marker>
                <Circle
                  center={site.coordinates as LatLngExpression}
                  radius={10000}
                  pathOptions={{
                    color: '#ef4444',
                    fillColor: '#ef4444',
                    fillOpacity: 0.15
                  }}
                />
              </div>
            ))
          }

          {/* Israel - Major Cities */}
          {(selectedLayer === 'all' || selectedLayer === 'cities') && 
            locationData.israel.majorCities.map((city, index) => (
              <div key={index}>
                <Marker
                  position={city.coordinates as LatLngExpression}
                  icon={createCustomIcon('city', city.severity)}
                >
                  <Popup>
                    <div className="space-y-2">
                      <div className="font-bold flex items-center space-x-2">
                        <span>{city.name}</span>
                        <Badge variant={city.severity === 'critical' ? 'destructive' : 'secondary'}>
                          {city.status.replace('-', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm">{city.recentActivity}</p>
                      {city.casualties && city.casualties > 0 && (
                        <div className="text-sm text-red-600 font-medium">
                          Casualties: {city.casualties}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        Last Strike: {formatTime(city.lastStrike)}
                      </div>
                    </div>
                  </Popup>
                </Marker>
                <Circle
                  center={city.coordinates as LatLngExpression}
                  radius={30000}
                  pathOptions={{
                    color: getSeverityColor(city.severity),
                    fillColor: getSeverityColor(city.severity),
                    fillOpacity: 0.1
                  }}
                />
              </div>
            ))
          }

          {/* Israel - Defense Systems */}
          {(selectedLayer === 'all' || selectedLayer === 'defense') && 
            locationData.israel.defenseSystems.map((system, index) => (
              <Marker
                key={index}
                position={system.coordinates as LatLngExpression}
                icon={createCustomIcon('defense', 'medium')}
              >
                <Popup>
                  <div className="space-y-2">
                    <div className="font-bold flex items-center space-x-2">
                      <span>{system.name}</span>
                      <Badge variant="outline">{system.status}</Badge>
                    </div>
                    <div className="text-sm text-green-600 font-medium">
                      Interceptions: {system.interceptions}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Type: {system.type}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))
          }

          {/* Regional Countries */}
          {selectedLayer === 'all' && 
            locationData.regionalContext.countries.map((country, index) => (
              <Marker
                key={index}
                position={country.coordinates as LatLngExpression}
                icon={createCustomIcon('monitoring', 'medium')}
              >
                <Popup>
                  <div className="space-y-2">
                    <div className="font-bold">{country.name}</div>
                    <Badge variant="outline">{country.status}</Badge>
                    <div className="text-sm text-muted-foreground">
                      Involvement: {country.involvement.replace('-', ' ')}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))
          }
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span>Critical</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-orange-500"></div>
          <span>High</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <span>Medium</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span>Low/Monitoring</span>
        </div>
      </div>
    </div>
  )
}
