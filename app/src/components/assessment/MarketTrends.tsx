"use client"

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Home, Calendar, DollarSign, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface MarketTrend {
  month: string
  year: number
  medianSalePrice: number
  medianRentPrice: number
  medianPricePerSqFt: number
  averageDaysOnMarket: number
  inventoryCount: number
  salesCount: number
}

interface MarketStats {
  zipCode: string
  city: string
  state: string
  currentMonth: {
    medianSalePrice: number
    medianRentPrice: number
    medianPricePerSqFt: number
    averageDaysOnMarket: number
    inventoryCount: number
    priceChangeYoY: number
    priceChangeMoM: number
  }
  trends: MarketTrend[]
  propertyTypeBreakdown?: {
    singleFamily?: {
      medianPrice: number
      count: number
    }
    condo?: {
      medianPrice: number
      count: number
    }
    townhouse?: {
      medianPrice: number
      count: number
    }
  }
}

interface MarketTrendsProps {
  zipCode: string
  city?: string
  state?: string
}

export default function MarketTrends({ zipCode, city, state }: MarketTrendsProps) {
  const [marketData, setMarketData] = useState<MarketStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams({
          zipCode,
          ...(city && { city }),
          ...(state && { state })
        })
        
        const response = await fetch(`/api/market-trends?${params}`)
        if (!response.ok) throw new Error('Failed to fetch market data')
        
        const data = await response.json()
        setMarketData(data)
      } catch (err) {
        console.error('Error fetching market data:', err)
        setError('Unable to load market trends')
      } finally {
        setLoading(false)
      }
    }

    if (zipCode) {
      fetchMarketData()
    }
  }, [zipCode, city, state])

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

  if (error || !marketData) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-500">Market data unavailable</p>
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

  const formatPercent = (value: number) => {
    const isPositive = value > 0
    return (
      <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
        {isPositive ? '+' : ''}{value.toFixed(1)}%
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Market Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Market Overview - {marketData.city}, {marketData.state} {marketData.zipCode}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Median Sale Price */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Median Sale Price</span>
                {marketData.currentMonth.priceChangeYoY !== 0 && (
                  marketData.currentMonth.priceChangeYoY > 0 ? 
                    <TrendingUp className="w-4 h-4 text-green-600" /> :
                    <TrendingDown className="w-4 h-4 text-red-600" />
                )}
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(marketData.currentMonth.medianSalePrice)}
              </div>
              <div className="flex gap-3 mt-2 text-sm">
                <span>YoY: {formatPercent(marketData.currentMonth.priceChangeYoY)}</span>
                <span>MoM: {formatPercent(marketData.currentMonth.priceChangeMoM)}</span>
              </div>
            </div>

            {/* Price per Sq Ft */}
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Price per Sq Ft</span>
                <Home className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(marketData.currentMonth.medianPricePerSqFt)}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Average for area
              </div>
            </div>

            {/* Days on Market */}
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Avg Days on Market</span>
                <Calendar className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {marketData.currentMonth.averageDaysOnMarket}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                days to sell
              </div>
            </div>

            {/* Inventory */}
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Active Inventory</span>
                <Home className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {marketData.currentMonth.inventoryCount}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                homes for sale
              </div>
            </div>

            {/* Median Rent */}
            <div className="bg-indigo-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Median Rent</span>
                <DollarSign className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(marketData.currentMonth.medianRentPrice)}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                per month
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Property Type Breakdown */}
      {marketData.propertyTypeBreakdown && (
        <Card>
          <CardHeader>
            <CardTitle>Property Type Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {marketData.propertyTypeBreakdown.singleFamily && (
                <div className="flex items-center justify-between py-2 border-b">
                  <div>
                    <span className="font-medium">Single Family</span>
                    <span className="text-sm text-gray-500 ml-2">
                      ({marketData.propertyTypeBreakdown.singleFamily.count} homes)
                    </span>
                  </div>
                  <span className="font-semibold">
                    {formatCurrency(marketData.propertyTypeBreakdown.singleFamily.medianPrice)}
                  </span>
                </div>
              )}
              {marketData.propertyTypeBreakdown.condo && (
                <div className="flex items-center justify-between py-2 border-b">
                  <div>
                    <span className="font-medium">Condo</span>
                    <span className="text-sm text-gray-500 ml-2">
                      ({marketData.propertyTypeBreakdown.condo.count} units)
                    </span>
                  </div>
                  <span className="font-semibold">
                    {formatCurrency(marketData.propertyTypeBreakdown.condo.medianPrice)}
                  </span>
                </div>
              )}
              {marketData.propertyTypeBreakdown.townhouse && (
                <div className="flex items-center justify-between py-2">
                  <div>
                    <span className="font-medium">Townhouse</span>
                    <span className="text-sm text-gray-500 ml-2">
                      ({marketData.propertyTypeBreakdown.townhouse.count} units)
                    </span>
                  </div>
                  <span className="font-semibold">
                    {formatCurrency(marketData.propertyTypeBreakdown.townhouse.medianPrice)}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Historical Trends */}
      {marketData.trends && marketData.trends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>12-Month Price Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative h-64">
              <div className="absolute inset-0 flex items-end justify-between gap-1">
                {marketData.trends.map((trend, index) => {
                  const maxPrice = Math.max(...marketData.trends.map(t => t.medianSalePrice))
                  const minPrice = Math.min(...marketData.trends.map(t => t.medianSalePrice))
                  const height = ((trend.medianSalePrice - minPrice) / (maxPrice - minPrice)) * 100
                  
                  return (
                    <div
                      key={index}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 transition-colors relative group"
                      style={{ height: `${height}%` }}
                    >
                      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {trend.month.slice(0, 3)} {trend.year}
                        <br />
                        {formatCurrency(trend.medianSalePrice)}
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 mt-2">
                <span>{marketData.trends[0]?.month.slice(0, 3)}</span>
                <span>{marketData.trends[marketData.trends.length - 1]?.month.slice(0, 3)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}