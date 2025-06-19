import { useState, useEffect } from 'react'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { ScrollArea } from './ui/scroll-area'
import { Separator } from './ui/separator'
import { 
  Search, 
  Filter, 
  ExternalLink, 
  Clock, 
  AlertTriangle,
  Newspaper,
  Globe
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"

interface NewsItem {
  id: string
  title: string
  summary: string
  source: string
  publishedAt: string
  category: string
  url: string
  image?: string
  priority: string
}

export function NewsFeed() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([])
  const [filteredNews, setFilteredNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedSource, setSelectedSource] = useState('all')

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('/data/news_feed.json')
        const data = await response.json()
        setNewsItems(data)
        setFilteredNews(data)
      } catch (error) {
        console.error('Failed to fetch news:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
  }, [])

  useEffect(() => {
    let filtered = newsItems

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.source.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory)
    }

    // Filter by source
    if (selectedSource !== 'all') {
      filtered = filtered.filter(item => item.source === selectedSource)
    }

    // Sort by priority and date
    filtered.sort((a, b) => {
      const priorityOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 }
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 4
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 4
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority
      }
      
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    })

    setFilteredNews(filtered)
  }, [newsItems, searchTerm, selectedCategory, selectedSource])

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive'
      case 'high': return 'secondary'
      case 'medium': return 'outline'
      default: return 'default'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'breaking': return <AlertTriangle className="h-4 w-4" />
      case 'military': return <Globe className="h-4 w-4" />
      case 'diplomatic': return <Newspaper className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`
    }
  }

  const categories = [...new Set(newsItems.map(item => item.category))]
  const sources = [...new Set(newsItems.map(item => item.source))]

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading news feed...</div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Filters */}
      <div className="mb-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search news..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedSource} onValueChange={setSelectedSource}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              {sources.map(source => (
                <SelectItem key={source} value={source}>
                  {source}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{filteredNews.length} articles found</span>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <Clock className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* News Feed */}
      <ScrollArea className="flex-1">
        <div className="space-y-4">
          {filteredNews.map((item, index) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(item.category)}
                      <Badge variant={getPriorityVariant(item.priority)}>
                        {item.priority}
                      </Badge>
                      <Badge variant="outline">{item.category}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatTimeAgo(item.publishedAt)}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg leading-tight line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground text-sm line-clamp-3">
                      {item.summary}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">{item.source}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(item.publishedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <a href={item.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Read More
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredNews.length === 0 && (
            <div className="text-center py-8">
              <Newspaper className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No articles found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria or check back later for updates.
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
