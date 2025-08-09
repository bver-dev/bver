"use client"

import { useEffect, useState, useRef } from 'react'
import { Loader } from '@googlemaps/js-api-loader'
import { MapPin, Home, Calendar, DollarSign, TrendingUp, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ComparableProperty {
  address: string
  distance: number
  squareFeet: number
  bedrooms: number
  bathrooms: number
  yearBuilt: number
  lastSalePrice: number
  lastSaleDate: string
  pricePerSqFt: number
  similarity: number
  listingPrice?: number
  daysOnMarket?: number
  // Add lat/lng for mapping
  lat?: number
  lng?: number
}

interface ComparablesMapProps {
  subjectProperty: {
    address: string
    lat: number
    lng: number
    assessedValue: number
    estimatedMarketValue: number
  }
  comparables: ComparableProperty[]
}

export default function ComparablesMap({ subjectProperty, comparables }: ComparablesMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [markers, setMarkers] = useState<google.maps.Marker[]>([])
  const [selectedProperty, setSelectedProperty] = useState<ComparableProperty | null>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow | null>(null)
  const listRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const initializeMap = async () => {
      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        version: 'weekly',
        libraries: ['places']
      })

      try {
        await loader.load()
        
        if (!mapRef.current) return

        // Create map centered on subject property
        const mapInstance = new google.maps.Map(mapRef.current, {
          center: { lat: subjectProperty.lat, lng: subjectProperty.lng },
          zoom: 14,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ],
          mapTypeControl: false,
          fullscreenControl: false,
          streetViewControl: false
        })

        setMap(mapInstance)

        // Create info window
        const infoWindowInstance = new google.maps.InfoWindow()
        setInfoWindow(infoWindowInstance)

        // Add subject property marker (different color)
        const subjectMarker = new google.maps.Marker({
          position: { lat: subjectProperty.lat, lng: subjectProperty.lng },
          map: mapInstance,
          title: 'Your Property',
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: '#3B82F6',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 3
          }
        })

        subjectMarker.addListener('click', () => {
          infoWindowInstance.setContent(`
            <div class="p-3">
              <h3 class="font-semibold text-gray-900">Your Property</h3>
              <p class="text-sm text-gray-600">${subjectProperty.address}</p>
              <div class="mt-2 space-y-1">
                <p class="text-sm"><strong>Assessed:</strong> ${formatCurrency(subjectProperty.assessedValue)}</p>
                <p class="text-sm"><strong>Est. Market:</strong> ${formatCurrency(subjectProperty.estimatedMarketValue)}</p>
              </div>
            </div>
          `)
          infoWindowInstance.open(mapInstance, subjectMarker)
        })

        // Add comparable property markers
        const newMarkers: google.maps.Marker[] = []
        
        comparables.forEach((comp, index) => {
          // Use geocoding if lat/lng not provided
          if (!comp.lat || !comp.lng) {
            // For now, we'll place them randomly around the subject property
            // In production, you'd use the Geocoding API
            comp.lat = subjectProperty.lat + (Math.random() - 0.5) * 0.02
            comp.lng = subjectProperty.lng + (Math.random() - 0.5) * 0.02
          }

          const marker = new google.maps.Marker({
            position: { lat: comp.lat, lng: comp.lng },
            map: mapInstance,
            title: comp.address,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: getSimilarityColor(comp.similarity),
              fillOpacity: 0.8,
              strokeColor: '#FFFFFF',
              strokeWeight: 2
            }
          })

          // Add click listener
          marker.addListener('click', () => {
            setSelectedProperty(comp)
            showPropertyDetails(comp, marker, mapInstance, infoWindowInstance)
          })

          // Store marker reference
          newMarkers.push(marker)
        })

        setMarkers(newMarkers)

        // Fit bounds to show all markers
        const bounds = new google.maps.LatLngBounds()
        bounds.extend({ lat: subjectProperty.lat, lng: subjectProperty.lng })
        comparables.forEach(comp => {
          if (comp.lat && comp.lng) {
            bounds.extend({ lat: comp.lat, lng: comp.lng })
          }
        })
        mapInstance.fitBounds(bounds)

      } catch (error) {
        console.error('Error loading Google Maps:', error)
      }
    }

    if (subjectProperty && comparables.length > 0) {
      initializeMap()
    }

    return () => {
      // Cleanup markers
      markers.forEach(marker => marker.setMap(null))
    }
  }, [subjectProperty, comparables])

  // Handle hover effect
  useEffect(() => {
    if (hoveredIndex !== null && markers[hoveredIndex]) {
      // Increase marker size on hover
      markers[hoveredIndex].setIcon({
        path: google.maps.SymbolPath.CIRCLE,
        scale: 12, // Larger size
        fillColor: getSimilarityColor(comparables[hoveredIndex].similarity),
        fillOpacity: 1,
        strokeColor: '#FFFFFF',
        strokeWeight: 3
      })
      
      // Bounce animation
      markers[hoveredIndex].setAnimation(google.maps.Animation.BOUNCE)
      setTimeout(() => {
        markers[hoveredIndex]?.setAnimation(null)
      }, 1500)
    }

    // Reset other markers
    markers.forEach((marker, index) => {
      if (index !== hoveredIndex) {
        marker.setIcon({
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: getSimilarityColor(comparables[index].similarity),
          fillOpacity: 0.8,
          strokeColor: '#FFFFFF',
          strokeWeight: 2
        })
      }
    })
  }, [hoveredIndex, markers, comparables])

  const showPropertyDetails = (
    property: ComparableProperty,
    marker: google.maps.Marker,
    map: google.maps.Map,
    infoWindow: google.maps.InfoWindow
  ) => {
    const content = `
      <div class="p-3 max-w-xs">
        <h3 class="font-semibold text-gray-900">${property.address}</h3>
        <div class="mt-2 space-y-1 text-sm">
          <p><strong>Sale Price:</strong> ${formatCurrency(property.lastSalePrice)}</p>
          <p><strong>Sale Date:</strong> ${formatDate(property.lastSaleDate)}</p>
          <p><strong>Price/Sq Ft:</strong> ${formatCurrency(property.pricePerSqFt)}</p>
          <p><strong>Size:</strong> ${property.squareFeet.toLocaleString()} sq ft</p>
          <p><strong>Beds/Baths:</strong> ${property.bedrooms}/${property.bathrooms}</p>
          <p><strong>Year Built:</strong> ${property.yearBuilt}</p>
          <p><strong>Similarity:</strong> ${property.similarity}%</p>
        </div>
      </div>
    `
    infoWindow.setContent(content)
    infoWindow.open(map, marker)
  }

  const getSimilarityColor = (similarity: number): string => {
    if (similarity >= 90) return '#10B981' // green
    if (similarity >= 80) return '#3B82F6' // blue
    if (similarity >= 70) return '#F59E0B' // yellow
    return '#6B7280' // gray
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const handlePropertyClick = (property: ComparableProperty, index: number) => {
    setSelectedProperty(property)
    
    // Center map on property
    if (map && property.lat && property.lng) {
      map.panTo({ lat: property.lat, lng: property.lng })
      map.setZoom(16)
    }

    // Show info window
    if (markers[index] && infoWindow && map) {
      showPropertyDetails(property, markers[index], map, infoWindow)
    }
  }

  const scrollToProperty = (index: number) => {
    listRefs.current[index]?.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'center' 
    })
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Comparable Properties Map
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid lg:grid-cols-2 gap-0">
          {/* Map Container */}
          <div className="relative h-[500px] lg:h-[600px]">
            <div ref={mapRef} className="w-full h-full" />
            
            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3">
              <h4 className="text-xs font-semibold text-gray-700 mb-2">Similarity Score</h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-xs text-gray-600">90-100%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-xs text-gray-600">80-89%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-xs text-gray-600">70-79%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                  <span className="text-xs text-gray-600">&lt;70%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable Properties List */}
          <div className="h-[500px] lg:h-[600px] overflow-y-auto bg-gray-50">
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">
                {comparables.length} Comparable Properties
              </h3>
              
              <div className="space-y-3">
                {comparables.map((property, index) => (
                  <div
                    key={index}
                    ref={el => listRefs.current[index] = el}
                    className={`bg-white rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                      selectedProperty === property 
                        ? 'ring-2 ring-blue-500 shadow-lg' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => handlePropertyClick(property, index)}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Home className="w-4 h-4 text-gray-500" />
                          <h4 className="font-medium text-gray-900 text-sm">
                            {property.address}
                          </h4>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-gray-600">
                          <div>
                            <span className="font-medium">Sale Price:</span> {formatCurrency(property.lastSalePrice)}
                          </div>
                          <div>
                            <span className="font-medium">$/Sq Ft:</span> {formatCurrency(property.pricePerSqFt)}
                          </div>
                          <div>
                            <span className="font-medium">Size:</span> {property.squareFeet.toLocaleString()} sq ft
                          </div>
                          <div>
                            <span className="font-medium">Beds/Baths:</span> {property.bedrooms}/{property.bathrooms}
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" />
                            {formatDate(property.lastSaleDate)}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">
                              {property.distance} mi away
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              property.similarity >= 90 ? 'bg-green-100 text-green-700' :
                              property.similarity >= 80 ? 'bg-blue-100 text-blue-700' :
                              property.similarity >= 70 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {property.similarity}% match
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}