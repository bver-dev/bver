"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Loader2 } from 'lucide-react'

interface MapAnimationProps {
  lat: number
  lng: number
  isSearching: boolean
}

export default function MapAnimation({ lat, lng, isSearching }: MapAnimationProps) {
  const [zoomLevel, setZoomLevel] = useState(5)
  const [showPin, setShowPin] = useState(false)

  useEffect(() => {
    // Animate zoom effect
    const zoomSteps = [5, 8, 11, 14, 17]
    let currentStep = 0

    const zoomInterval = setInterval(() => {
      if (currentStep < zoomSteps.length) {
        setZoomLevel(zoomSteps[currentStep])
        currentStep++
        
        // Show pin at final zoom
        if (currentStep === zoomSteps.length) {
          setShowPin(true)
        }
      } else {
        clearInterval(zoomInterval)
      }
    }, 300)

    return () => clearInterval(zoomInterval)
  }, [])

  return (
    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800">
      {/* Map Container */}
      <div className="relative w-full h-full overflow-hidden">
        {/* Animated Map Background - Simplified version */}
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1 }}
          animate={{ scale: zoomLevel / 5 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          {/* Grid pattern to simulate map */}
          <div className="w-full h-full relative">
            <svg
              className="absolute inset-0 w-full h-full"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern
                  id="grid"
                  width="50"
                  height="50"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 50 0 L 0 0 0 50"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="1"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* Simulated roads */}
            <div className="absolute inset-0">
              <div className="absolute top-1/3 left-0 right-0 h-2 bg-white/10" />
              <div className="absolute top-2/3 left-0 right-0 h-2 bg-white/10" />
              <div className="absolute left-1/3 top-0 bottom-0 w-2 bg-white/10" />
              <div className="absolute left-2/3 top-0 bottom-0 w-2 bg-white/10" />
            </div>
          </div>
        </motion.div>

        {/* Map Pin */}
        {showPin && (
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-full"
            initial={{ scale: 0, y: -100 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ 
              type: "spring",
              stiffness: 200,
              damping: 15
            }}
          >
            <div className="relative">
              <MapPin className="w-12 h-12 text-red-500 drop-shadow-lg" fill="currentColor" />
              <motion.div
                className="absolute inset-0"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <div className="w-12 h-12 bg-red-500/30 rounded-full" />
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Loading Overlay */}
        <motion.div
          className="absolute inset-0 bg-black/50 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: isSearching ? 1 : 0 }}
          transition={{ delay: isSearching ? 1 : 0, duration: 0.3 }}
        >
          <motion.div
            className="bg-white rounded-2xl p-8 shadow-2xl"
            initial={{ scale: 0.9 }}
            animate={{ scale: isSearching ? 1 : 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
              <div className="text-center">
                <p className="text-xl font-semibold text-gray-900">
                  Analyzing Property
                </p>
                <p className="text-gray-600 mt-2">
                  Gathering assessment data...
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Coordinate Display */}
        <div className="absolute bottom-4 left-4 bg-black/50 text-white px-4 py-2 rounded-lg text-sm">
          <span className="font-mono">
            {lat.toFixed(4)}, {lng.toFixed(4)}
          </span>
        </div>
      </div>
    </div>
  )
}