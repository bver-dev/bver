"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Search, Shield, DollarSign, Clock, ChevronRight, TrendingDown, FileText, CheckCircle } from 'lucide-react'
import AddressSearchBar from '@/components/home/AddressSearchBar'
import MapAnimation from '@/components/home/MapAnimation'

export default function HomePage() {
  const router = useRouter()
  const [selectedAddress, setSelectedAddress] = useState<string>('')
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null)
  const [isSearching, setIsSearching] = useState(false)

  const handleAddressSelect = (address: string, lat: number, lng: number) => {
    setSelectedAddress(address)
    // Show map immediately
    setCoordinates({ lat, lng })
    
    // Show loading overlay after zoom completes
    setTimeout(() => {
      setIsSearching(true)
      
      // Navigate after showing loading briefly
      setTimeout(() => {
        router.push(`/assessment?address=${encodeURIComponent(address)}&lat=${lat}&lng=${lng}`)
      }, 1500)
    }, 3000) // Give full time for zoom animation
  }

  const stats = [
    { value: '35%', label: 'Properties Over-Assessed' },
    { value: '$1,800', label: 'Average Annual Savings' },
    { value: '92%', label: 'Success Rate' },
    { value: '2 min', label: 'Time to File' },
  ]

  const features = [
    {
      icon: <TrendingDown className="w-6 h-6" />,
      title: 'Real-Time Assessment Analysis',
      description: 'Instantly compare your property tax assessment against market value using advanced AI models.'
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: 'Automated Form Generation',
      description: 'We generate and submit your appeal forms automatically with all required documentation.'
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: 'No Upfront Costs',
      description: 'Pay nothing unless we successfully reduce your property taxes. Our success is tied to yours.'
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: 'Expert-Backed Appeals',
      description: 'Our system uses domain expertise and comprehensive data to maximize your appeal success.'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation Header */}
      <header className="absolute top-0 left-0 right-0 z-20 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Search className="w-8 h-8 text-blue-600 mr-2" />
              <span className="text-2xl font-bold text-white">BVER</span>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/auth/login"
                className="px-4 py-2 text-white hover:text-blue-200 transition-colors"
              >
                Sign In
              </a>
              <a
                href="/auth/signup"
                className="px-6 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Get Started
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Map Background */}
      <div className="relative h-screen">
        {coordinates ? (
          <MapAnimation 
            lat={coordinates.lat} 
            lng={coordinates.lng}
            isSearching={isSearching}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800 opacity-90" />
        )}
        
        <div className={`relative h-full flex flex-col items-center justify-center px-4 transition-opacity duration-500 ${coordinates ? 'opacity-0 pointer-events-none' : 'opacity-100 z-10'}`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Stop Overpaying on
              <span className="block text-yellow-300">Property Taxes</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-2xl mx-auto">
              35% of properties are over-assessed. Find out if yours is one of them in seconds.
            </p>

            {/* Address Search Bar */}
            <div className="max-w-2xl mx-auto">
              <AddressSearchBar onAddressSelect={handleAddressSelect} />
            </div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="mt-8 flex items-center justify-center space-x-8 text-white"
            >
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-green-300" />
                <span className="text-sm">Bank-level Security</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-green-300" />
                <span className="text-sm">2-Minute Process</span>
              </div>
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-green-300" />
                <span className="text-sm">$0 Unless We Save You Money</span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        {!coordinates && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-white opacity-75"
            >
              <ChevronRight className="w-8 h-8 rotate-90" />
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How BVER Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our AI-powered platform makes property tax appeals simple, fast, and effective
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Lower Your Property Taxes?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of homeowners who have successfully reduced their tax burden
          </p>
          <button
            onClick={() => document.getElementById('address-search')?.focus()}
            className="bg-yellow-400 text-blue-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-yellow-300 transition-colors"
          >
            Start Your Free Assessment
          </button>
        </div>
      </section>
    </div>
  )
}