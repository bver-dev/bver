"use client"

import { useEffect, useState } from 'react'
import { TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ComparablesMap from './ComparablesMap'

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
  assessedValue?: number
  estimatedMarketValue?: number
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
  propertyType,
  assessedValue,
  estimatedMarketValue
}: ComparablesProps) {
  const [comparablesData, setComparablesData] = useState<ComparablesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchComparables = async () => {
      try {
        setLoading(true)
        console.log('Fetching comparables with:', { address, city, state, zipCode, lat, lng, squareFeet, bedrooms, bathrooms, propertyType })
        
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
        console.log('Comparables data received:', data)
        setComparablesData(data)
      } catch (err) {
        console.error('Error fetching comparables:', err)
        setError('Unable to load comparable properties')
      } finally {
        setLoading(false)
      }
    }

    // Always try to fetch comparables if we have at least an address
    if (address) {
      fetchComparables()
    } else {
      console.log('No address provided for comparables')
      setLoading(false)
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
          <p className="text-gray-600">Comparable properties unavailable</p>
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
                  <div className="text-sm text-gray-700 mb-1">Confidence Score</div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${comparablesData.valuation.confidence}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-600 mt-1">{comparablesData.valuation.confidence}%</div>
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
              <div className="text-sm text-gray-700">Properties Found</div>
              <div className="text-2xl font-semibold text-gray-700">{comparablesData.summary.count}</div>
            </div>
            <div>
              <div className="text-sm text-gray-700">Avg Sale Price</div>
              <div className="text-2xl font-semibold text-gray-700">{formatCurrency(comparablesData.summary.avgSalePrice)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-700">Avg $/Sq Ft</div>
              <div className="text-2xl font-semibold text-gray-700">{formatCurrency(comparablesData.summary.avgPricePerSqFt)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-700">Search Radius</div>
              <div className="text-2xl font-semibold text-gray-700">{comparablesData.summary.radius} mi</div>
            </div>
          </div>
          {process.env.NODE_ENV === 'development' && comparablesData.summary.dataSource && (
            <div className="mt-4 text-xs text-gray-600">
              Data Source: {comparablesData.summary.dataSource.toUpperCase()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comparable Properties Map */}
      {lat && lng && comparablesData.comparables.length > 0 && (
        <ComparablesMap
          subjectProperty={{
            address: `${address}, ${city}, ${state} ${zipCode}`,
            lat: lat,
            lng: lng,
            assessedValue: assessedValue || 0,
            estimatedMarketValue: estimatedMarketValue || 0
          }}
          comparables={comparablesData.comparables}
        />
      )}
    </div>
  )
}