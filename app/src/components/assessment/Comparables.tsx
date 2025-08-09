"use client"

import { useEffect, useState } from 'react'
import { MapPin, Home, Calendar, TrendingUp, DollarSign } from 'lucide-react'
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
}

interface ComparablesData {
  comparables: ComparableProperty[]
  summary: {
    count: number
    avgPricePerSqFt: number
    avgSalePrice: number
    radius: number
    dataSource: string
  }
  valuation?: {
    estimate: number | null
    estimateRange: {
      low: number | null
      high: number | null
    }
    confidence: number | null
  }
}

interface ComparablesProps {
  address: string
  city: string
  state: string
  zipCode: string
  lat?: number
  lng?: number
  squareFeet?: number
  bedrooms?: number
  bathrooms?: number
  propertyType?: string
}

export default function Comparables({
  address,
  city,
  state,
  zipCode,
  lat,
  lng,
  squareFeet,
  bedrooms,
  bathrooms,
  propertyType
}: ComparablesProps) {
  const [comparablesData, setComparablesData] = useState<ComparablesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchComparables = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams({
          address,
          city,
          state,
          zipCode,
          ...(lat && { lat: lat.toString() }),
          ...(lng && { lng: lng.toString() }),
          ...(squareFeet && { squareFeet: squareFeet.toString() }),
          ...(bedrooms && { bedrooms: bedrooms.toString() }),
          ...(bathrooms && { bathrooms: bathrooms.toString() }),
          ...(propertyType && { propertyType })
        })
        
        const response = await fetch(`/api/comparables?${params}`)
        if (!response.ok) throw new Error('Failed to fetch comparables')
        
        const data = await response.json()
        setComparablesData(data)
      } catch (err) {
        console.error('Error fetching comparables:', err)
        setError('Unable to load comparable properties')
      } finally {
        setLoading(false)
      }
    }

    if (address && city && state && zipCode) {
      fetchComparables()
    }
  }, [address, city, state, zipCode, lat, lng, squareFeet, bedrooms, bathrooms, propertyType])

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !comparablesData) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-500">Comparable properties unavailable</p>
        </CardContent>
      </Card>
    )
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
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 90) return 'text-green-600 bg-green-50'
    if (similarity >= 80) return 'text-blue-600 bg-blue-50'
    if (similarity >= 70) return 'text-yellow-600 bg-yellow-50'
    return 'text-gray-600 bg-gray-50'
  }

  return (
    <div className="space-y-6">
      {/* Valuation Estimate */}
      {comparablesData.valuation && comparablesData.valuation.estimate && (
        <Card className="border-2 border-blue-200 bg-blue-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Estimated Market Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">
                {formatCurrency(comparablesData.valuation.estimate)}
              </div>
              {comparablesData.valuation.estimateRange.low && comparablesData.valuation.estimateRange.high && (
                <div className="text-sm text-gray-600 mt-2">
                  Range: {formatCurrency(comparablesData.valuation.estimateRange.low)} - {formatCurrency(comparablesData.valuation.estimateRange.high)}
                </div>
              )}
              {comparablesData.valuation.confidence && (
                <div className="mt-3">
                  <div className="text-sm text-gray-500 mb-1">Confidence Score</div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${comparablesData.valuation.confidence}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{comparablesData.valuation.confidence}%</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Comparables Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-500">Properties Found</div>
              <div className="text-2xl font-semibold">{comparablesData.summary.count}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Avg Sale Price</div>
              <div className="text-2xl font-semibold">{formatCurrency(comparablesData.summary.avgSalePrice)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Avg $/Sq Ft</div>
              <div className="text-2xl font-semibold">{formatCurrency(comparablesData.summary.avgPricePerSqFt)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Search Radius</div>
              <div className="text-2xl font-semibold">{comparablesData.summary.radius} mi</div>
            </div>
          </div>
          {comparablesData.summary.dataSource && (
            <div className="mt-4 text-xs text-gray-500">
              Data Source: {comparablesData.summary.dataSource.toUpperCase()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comparable Properties List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="w-5 h-5" />
            Comparable Properties
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {comparablesData.comparables.map((property, index) => (
              <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{property.address}</div>
                        <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
                          <span>{property.bedrooms} bed</span>
                          <span>{property.bathrooms} bath</span>
                          <span>{property.squareFeet.toLocaleString()} sq ft</span>
                          <span>Built {property.yearBuilt}</span>
                          <span className="text-blue-600">{property.distance} mi away</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right ml-4">
                    <div className="text-lg font-semibold text-gray-900">
                      {formatCurrency(property.lastSalePrice)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatCurrency(property.pricePerSqFt)}/sq ft
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        Sold {formatDate(property.lastSaleDate)}
                      </span>
                    </div>
                    <div className="mt-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getSimilarityColor(property.similarity)}`}>
                        {property.similarity}% match
                      </span>
                    </div>
                  </div>
                </div>
                
                {property.listingPrice && (
                  <div className="mt-2 pt-2 border-t text-sm text-gray-600">
                    <DollarSign className="w-3 h-3 inline mr-1" />
                    Listed at {formatCurrency(property.listingPrice)}
                    {property.daysOnMarket && ` • ${property.daysOnMarket} days on market`}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}