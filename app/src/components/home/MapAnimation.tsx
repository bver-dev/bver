"use client"

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Loader2, Home, TrendingDown } from 'lucide-react'

interface MapAnimationProps {
  lat: number
  lng: number
  isSearching: boolean
}

export default function MapAnimation({ lat, lng, isSearching }: MapAnimationProps) {
  const [zoomLevel, setZoomLevel] = useState(1)
  const [showPin, setShowPin] = useState(false)
  const [mapOpacity, setMapOpacity] = useState(0)

  useEffect(() => {
    // Fade in map immediately
    setMapOpacity(1)
    
    // Animate zoom effect more smoothly with better timing
    const zoomSteps = [1, 1.2, 1.5, 2, 2.8, 4, 6, 8, 10, 12]
    let currentStep = 0

    const zoomInterval = setInterval(() => {
      if (currentStep < zoomSteps.length) {
        setZoomLevel(zoomSteps[currentStep])
        currentStep++
        
        // Show pin when zoom is mostly complete
        if (currentStep === zoomSteps.length - 3) {
          setShowPin(true)
        }
      } else {
        clearInterval(zoomInterval)
      }
    }, 180)

    return () => clearInterval(zoomInterval)
  }, [])

  return (
    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 overflow-hidden">
      {/* Animated background pattern */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: mapOpacity * 0.3 }}
        transition={{ duration: 1 }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.4)_100%)]" />
      </motion.div>

      {/* Map Container */}
      <motion.div 
        className="relative w-full h-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Animated Map Background */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ scale: 1 }}
          animate={{ scale: zoomLevel }}
          transition={{ 
            duration: 0.4, 
            ease: [0.25, 0.1, 0.25, 1] // Custom easing for smoother animation
          }}
        >
          {/* Grid pattern to simulate map */}
          <div className="w-[200%] h-[200%] relative">
            <svg
              className="absolute inset-0 w-full h-full"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern
                  id="grid"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="1"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* Simulated streets with better layout */}
            <motion.div 
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {/* Main roads */}
              <div className="absolute top-[45%] left-0 right-0 h-2 bg-white/30" />
              <div className="absolute top-[55%] left-0 right-0 h-2 bg-white/30" />
              <div className="absolute left-[45%] top-0 bottom-0 w-2 bg-white/30" />
              <div className="absolute left-[55%] top-0 bottom-0 w-2 bg-white/30" />
              
              {/* Secondary roads */}
              <div className="absolute top-[30%] left-0 right-0 h-1 bg-white/20" />
              <div className="absolute top-[70%] left-0 right-0 h-1 bg-white/20" />
              <div className="absolute left-[30%] top-0 bottom-0 w-1 bg-white/20" />
              <div className="absolute left-[70%] top-0 bottom-0 w-1 bg-white/20" />
            </motion.div>

            {/* Simulated buildings/blocks */}
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: zoomLevel > 3 ? 0.3 : 0 }}
              transition={{ duration: 0.5 }}
            >
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute bg-white/5 rounded"
                  style={{
                    width: `${Math.random() * 40 + 20}px`,
                    height: `${Math.random() * 40 + 20}px`,
                    left: `${Math.random() * 90}%`,
                    top: `${Math.random() * 90}%`,
                  }}
                />
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Map Pin with improved animation */}
        <AnimatePresence>
          {showPin && (
            <motion.div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-full z-20"
              initial={{ scale: 0, y: -200, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ 
                type: "spring",
                stiffness: 120,
                damping: 20,
                delay: 0.2
              }}
            >
              <div className="relative">
                {/* Pulsing ring */}
                <motion.div
                  className="absolute -inset-4"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ 
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 0, 0.5]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <div className="w-16 h-16 bg-red-500/30 rounded-full" />
                </motion.div>

                {/* Pin icon */}
                <MapPin className="w-12 h-12 text-red-500 drop-shadow-xl" fill="currentColor" />
                
                {/* Center dot */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading Overlay with better transition */}
        <AnimatePresence>
          {isSearching && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60 flex items-center justify-center z-30"
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
                  {/* Animated icon */}
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

                  {/* Progress indicators */}
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

        {/* Coordinate Display with fade effect */}
        <motion.div 
          className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: showPin ? 1 : 0, y: showPin ? 0 : 20 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          <div className="flex items-center space-x-2">
            <Home className="w-4 h-4" />
            <span className="font-mono">
              {lat.toFixed(4)}, {lng.toFixed(4)}
            </span>
          </div>
        </motion.div>

        {/* Status indicator */}
        <motion.div 
          className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: showPin && !isSearching ? 1 : 0, x: showPin && !isSearching ? 0 : 20 }}
          transition={{ delay: 0.8, duration: 0.3 }}
        >
          <div className="flex items-center space-x-2 text-green-600">
            <TrendingDown className="w-4 h-4" />
            <span>Property Located</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}