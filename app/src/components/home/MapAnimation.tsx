"use client"

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Loader2, Home } from 'lucide-react'
import { loadGoogleMaps } from '@/lib/google-maps'

interface MapAnimationProps {
  lat: number
  lng: number
  isSearching: boolean
}

export default function MapAnimation({ lat, lng, isSearching }: MapAnimationProps) {
  const [zoom, setZoom] = useState(5)
  const [showMarker, setShowMarker] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)
  const mapRef = useRef<google.maps.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  
  const center = {
    lat: lat,
    lng: lng
  }

  // Load Google Maps and create map instance
  useEffect(() => {
    loadGoogleMaps().then(() => {
      if (!mapContainerRef.current || mapRef.current) return
      
      // Create the map
      mapRef.current = new google.maps.Map(mapContainerRef.current, {
        center,
        zoom: 5,
        disableDefaultUI: true,
        zoomControl: false,
        mapTypeControl: false,
        scaleControl: false,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: false,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ]
      })
      
      setMapLoaded(true)
    }).catch(error => {
      console.error('Failed to load Google Maps:', error)
    })
  }, [])

  // Animate zoom when map is loaded
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return

    // Animate zoom in steps
    const zoomSteps = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]
    let currentStep = 0

    const zoomInterval = setInterval(() => {
      if (currentStep < zoomSteps.length && mapRef.current) {
        const newZoom = zoomSteps[currentStep]
        setZoom(newZoom)
        mapRef.current.setZoom(newZoom)
        mapRef.current.setCenter(center)
        currentStep++
        
        // Show marker when zoom is at 70% complete
        if (currentStep === Math.floor(zoomSteps.length * 0.7)) {
          setShowMarker(true)
          
          // Add marker to map
          if (mapRef.current) {
            new google.maps.Marker({
              position: center,
              map: mapRef.current,
              animation: google.maps.Animation.DROP,
              icon: {
                path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                scale: 10,
                fillColor: '#EF4444',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2,
              }
            })
          }
        }
      } else {
        clearInterval(zoomInterval)
      }
    }, 200)

    return () => clearInterval(zoomInterval)
  }, [mapLoaded, lat, lng])

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Map Container */}
      <div ref={mapContainerRef} className="absolute inset-0" />
      
      {/* Loading state if map hasn't loaded */}
      {!mapLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 flex items-center justify-center">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
        </div>
      )}

      {/* Loading Overlay */}
      <AnimatePresence>
        {isSearching && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/70 flex items-center justify-center z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              className="bg-white rounded-3xl p-10 shadow-2xl max-w-md"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ 
                duration: 0.3,
                ease: [0.25, 0.1, 0.25, 1]
              }}
            >
              <div className="flex flex-col items-center space-y-6">
                <div className="relative">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Loader2 className="w-16 h-16 text-blue-600" />
                  </motion.div>
                </div>

                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-bold text-gray-900">
                    Analyzing Property
                  </h3>
                  <p className="text-gray-600">
                    Gathering assessment data...
                  </p>
                </div>

                {/* Progress dots */}
                <div className="flex space-x-2">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 bg-blue-600 rounded-full"
                      animate={{ 
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.2
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Coordinate Display */}
      <motion.div 
        className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm text-gray-800 px-4 py-2 rounded-lg shadow-lg text-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: showMarker ? 1 : 0, y: showMarker ? 0 : 20 }}
        transition={{ delay: 0.5, duration: 0.3 }}
      >
        <div className="flex items-center space-x-2">
          <Home className="w-4 h-4 text-blue-600" />
          <span className="font-mono">
            {lat.toFixed(4)}, {lng.toFixed(4)}
          </span>
        </div>
      </motion.div>

      {/* Status indicator */}
      <motion.div 
        className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg text-sm font-medium"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: showMarker && !isSearching ? 1 : 0, x: showMarker && !isSearching ? 0 : 20 }}
        transition={{ delay: 0.8, duration: 0.3 }}
      >
        <div className="flex items-center space-x-2 text-green-600">
          <MapPin className="w-4 h-4" />
          <span>Property Located</span>
        </div>
      </motion.div>
    </div>
  )
}