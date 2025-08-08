"use client"

import { useState, useRef, useEffect } from 'react'
import { Search, MapPin, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { loadGoogleMaps } from '@/lib/google-maps'

interface AddressSearchBarProps {
  onAddressSelect: (address: string, lat: number, lng: number) => void
}

interface PlacePrediction {
  description: string
  place_id: string
  structured_formatting: {
    main_text: string
    secondary_text: string
  }
}

export default function AddressSearchBar({ onAddressSelect }: AddressSearchBarProps) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<PlacePrediction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null)
  const placesService = useRef<google.maps.places.PlacesService | null>(null)

  // Load Google Maps
  useEffect(() => {
    loadGoogleMaps().then(() => {
      autocompleteService.current = new google.maps.places.AutocompleteService()
      // Create a dummy div for PlacesService
      const dummyDiv = document.createElement('div')
      placesService.current = new google.maps.places.PlacesService(dummyDiv)
      setIsGoogleLoaded(true)
    }).catch(error => {
      console.error('Failed to load Google Maps:', error)
    })
  }, [])

  // Search for addresses
  const searchAddresses = async (input: string) => {
    if (input.length < 3) {
      setSuggestions([])
      return
    }

    setIsLoading(true)
    
    if (isGoogleLoaded && autocompleteService.current) {
      // Use real Google Places API
      try {
        const request = {
          input,
          types: ['address'],
          componentRestrictions: { country: 'us' }
        }
        
        autocompleteService.current.getPlacePredictions(request, (predictions, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            setSuggestions(predictions)
          } else {
            setSuggestions([])
          }
          setIsLoading(false)
          setShowSuggestions(true)
        })
      } catch (error) {
        console.error('Autocomplete error:', error)
        setIsLoading(false)
      }
    } else {
      // Fallback to mock data if Google Maps isn't loaded
      setTimeout(() => {
        const mockSuggestions: PlacePrediction[] = [
          {
            description: '123 Main Street, San Francisco, CA 94105',
            place_id: '1',
            structured_formatting: {
              main_text: '123 Main Street',
              secondary_text: 'San Francisco, CA 94105'
            }
          },
          {
            description: '456 Oak Avenue, Los Angeles, CA 90001',
            place_id: '2',
            structured_formatting: {
              main_text: '456 Oak Avenue',
              secondary_text: 'Los Angeles, CA 90001'
            }
          },
          {
            description: '789 Pine Road, San Diego, CA 92101',
            place_id: '3',
            structured_formatting: {
              main_text: '789 Pine Road',
              secondary_text: 'San Diego, CA 92101'
            }
          }
        ].filter(s => 
          s.description.toLowerCase().includes(input.toLowerCase())
        )
        
        setSuggestions(mockSuggestions)
        setIsLoading(false)
        setShowSuggestions(true)
      }, 500)
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query) {
        searchAddresses(query)
      } else {
        setSuggestions([])
      }
    }, 300)

    return () => clearTimeout(delayDebounce)
  }, [query, isGoogleLoaded])

  const handleSelect = async (suggestion: PlacePrediction) => {
    setQuery(suggestion.description)
    setShowSuggestions(false)
    
    // Get place details including coordinates
    if (isGoogleLoaded && placesService.current) {
      const request = {
        placeId: suggestion.place_id,
        fields: ['geometry', 'formatted_address']
      }
      
      placesService.current.getDetails(request, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
          const lat = place.geometry.location.lat()
          const lng = place.geometry.location.lng()
          const address = place.formatted_address || suggestion.description
          onAddressSelect(address, lat, lng)
        } else {
          // Fallback to mock coordinates
          onAddressSelect(suggestion.description, 37.7749, -122.4194)
        }
      })
    } else {
      // Use mock coordinates if Google Maps isn't loaded
      onAddressSelect(suggestion.description, 37.7749, -122.4194)
    }
  }

  return (
    <div ref={searchRef} className="relative w-full">
      <div className="relative">
        <input
          id="address-search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder="Enter your property address..."
          className={cn(
            "w-full px-6 py-5 pl-14 pr-14 text-lg rounded-xl",
            "bg-white/95 backdrop-blur-sm",
            "border-2 border-white/20 focus:border-yellow-300",
            "text-gray-900 placeholder-gray-500",
            "focus:outline-none focus:ring-4 focus:ring-yellow-300/20",
            "transition-all duration-200"
          )}
        />
        
        <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        
        <button
          type="button"
          onClick={() => query && searchAddresses(query)}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Search className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-2xl overflow-hidden z-50 border border-gray-100">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.place_id}
              onClick={() => handleSelect(suggestion)}
              className="w-full px-6 py-4 text-left hover:bg-blue-50 transition-colors flex items-start space-x-3 border-b border-gray-100 last:border-0"
            >
              <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-gray-900 font-medium">
                  {suggestion.structured_formatting?.main_text || suggestion.description}
                </p>
                <p className="text-sm text-gray-500 mt-0.5">
                  {suggestion.structured_formatting?.secondary_text || 'Click to analyze this property'}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Status indicator */}
      <div className="mt-4 text-center">
        {isGoogleLoaded ? (
          <p className="text-xs text-green-300 bg-green-900/30 px-3 py-1 rounded-full inline-flex items-center">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
            Google Maps Connected
          </p>
        ) : (
          <p className="text-xs text-yellow-300 bg-yellow-900/30 px-3 py-1 rounded-full inline-block">
            Loading Google Maps...
          </p>
        )}
        
        {/* Example addresses */}
        <p className="text-sm text-white/80 mt-3 mb-2">Try typing a real address or click an example:</p>
        <div className="flex flex-wrap justify-center gap-2">
          {[
            '1600 Pennsylvania Ave, Washington, DC',
            '350 5th Ave, New York, NY',
            '1 Apple Park Way, Cupertino, CA'
          ].map((example) => (
            <button
              key={example}
              onClick={() => setQuery(example)}
              className="px-3 py-1 text-sm bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}