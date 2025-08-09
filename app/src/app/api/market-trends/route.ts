import { NextRequest, NextResponse } from 'next/server'
import { getCachedPropertyData, setCachedPropertyData } from '@/lib/property-cache'

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
    priceChangeYoY: number // Year over year change
    priceChangeMoM: number // Month over month change
  }
  trends: MarketTrend[] // Historical trends
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

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const zipCode = searchParams.get('zipCode')
  const city = searchParams.get('city')
  const state = searchParams.get('state')

  if (!zipCode) {
    return NextResponse.json(
      { error: 'Zip code is required' },
      { status: 400 }
    )
  }

  try {
    // Check cache first
    const cacheKey = `market_${zipCode}`
    const cachedData = await getCachedPropertyData(
      cacheKey,
      city || '',
      state || '',
      zipCode
    )
    
    if (cachedData) {
      console.log('Using cached market trends data')
      return NextResponse.json(cachedData)
    }

    // Try RentCast API if configured
    const rentcastKey = process.env.RENTCAST_API_KEY
    if (rentcastKey) {
      try {
        const marketData = await fetchRentCastMarketData(
          zipCode,
          city || '',
          state || '',
          rentcastKey
        )
        
        // Check if RentCast returned actual data
        if (marketData.trends && marketData.trends.length > 0) {
          // Cache the response
          await setCachedPropertyData(
            cacheKey,
            city || '',
            state || '',
            zipCode,
            null,
            null,
            'rentcast_market',
            marketData
          )
          
          return NextResponse.json(marketData)
        } else {
          console.log('RentCast returned no market data, falling back to mock data')
          // Fall through to mock data
        }
      } catch (apiError) {
        console.error('RentCast market API error:', apiError)
        // Fall through to mock data
      }
    }

    // Generate mock market data
    const mockData = generateMockMarketData(zipCode, city || '', state || '')
    
    return NextResponse.json(mockData)
  } catch (error) {
    console.error('Market trends API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch market trends' },
      { status: 500 }
    )
  }
}

async function fetchRentCastMarketData(
  zipCode: string,
  city: string,
  state: string,
  apiKey: string
): Promise<MarketStats> {
  // RentCast markets endpoint
  const url = `https://api.rentcast.io/v1/markets?zipCode=${zipCode}`
  
  console.log('RentCast Markets request URL:', url)

  const response = await fetch(url, {
    headers: {
      'X-Api-Key': apiKey,
      'Accept': 'application/json'
    }
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`RentCast API error: ${response.status} - ${error}`)
  }

  const data = await response.json()
  console.log('RentCast Markets response:', JSON.stringify(data, null, 2))
  
  // Transform RentCast response to our format
  const currentMonth = new Date()
  const trends: MarketTrend[] = []
  
  // Process historical data if available
  if (data.saleData?.history) {
    // Convert history object to array and sort by date
    const historyEntries = Object.entries(data.saleData.history)
      .map(([key, value]: [string, any]) => ({
        ...value,
        date: new Date(value.date)
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Most recent first
      .slice(0, 12) // Last 12 months
    
    historyEntries.forEach((monthData: any) => {
      trends.push({
        month: monthData.date.toLocaleString('default', { month: 'long' }),
        year: monthData.date.getFullYear(),
        medianSalePrice: monthData.medianPrice || 0,
        medianRentPrice: data.rentalData?.medianPrice || 0, // Use rental data if available
        medianPricePerSqFt: monthData.medianPricePerSquareFoot || 0,
        averageDaysOnMarket: monthData.averageDaysOnMarket || 0,
        inventoryCount: monthData.totalListings || 0,
        salesCount: monthData.newListings || 0
      })
    })
  }

  // Get current month data (most recent from history or overall stats)
  const currentData = trends[0] || {
    medianSalePrice: data.saleData?.medianPrice || 0,
    medianPricePerSqFt: data.saleData?.medianPricePerSquareFoot || 0,
    averageDaysOnMarket: data.saleData?.averageDaysOnMarket || 0,
    inventoryCount: data.saleData?.totalListings || 0
  }
  
  // Calculate YoY and MoM changes
  const lastYearData = trends[11] || {}
  const lastMonthData = trends[1] || {}
  
  const priceChangeYoY = lastYearData.medianSalePrice 
    ? ((currentData.medianSalePrice - lastYearData.medianSalePrice) / lastYearData.medianSalePrice) * 100
    : 0
    
  const priceChangeMoM = lastMonthData.medianSalePrice
    ? ((currentData.medianSalePrice - lastMonthData.medianSalePrice) / lastMonthData.medianSalePrice) * 100
    : 0

  return {
    zipCode,
    city: city || data.city || '',
    state: state || data.state || '',
    currentMonth: {
      medianSalePrice: currentData.medianSalePrice || data.saleData?.medianPrice || 0,
      medianRentPrice: data.rentalData?.medianPrice || 0,
      medianPricePerSqFt: currentData.medianPricePerSqFt || data.saleData?.medianPricePerSquareFoot || 0,
      averageDaysOnMarket: currentData.averageDaysOnMarket || data.saleData?.averageDaysOnMarket || 0,
      inventoryCount: currentData.inventoryCount || data.saleData?.totalListings || 0,
      priceChangeYoY: Math.round(priceChangeYoY * 10) / 10,
      priceChangeMoM: Math.round(priceChangeMoM * 10) / 10
    },
    trends: trends, // Already sliced to 12 months above
    propertyTypeBreakdown: (() => {
      if (!data.saleData?.dataByPropertyType) return undefined
      
      const breakdown: any = {}
      data.saleData.dataByPropertyType.forEach((type: any) => {
        if (type.propertyType === 'Single Family') {
          breakdown.singleFamily = {
            medianPrice: type.medianPrice,
            count: type.totalListings
          }
        } else if (type.propertyType === 'Condo') {
          breakdown.condo = {
            medianPrice: type.medianPrice,
            count: type.totalListings
          }
        } else if (type.propertyType === 'Townhouse') {
          breakdown.townhouse = {
            medianPrice: type.medianPrice,
            count: type.totalListings
          }
        }
      })
      
      return Object.keys(breakdown).length > 0 ? breakdown : undefined
    })()
  }
}

function generateMockMarketData(
  zipCode: string,
  city: string,
  state: string
): MarketStats {
  const basePrice = 500000 + Math.random() * 500000 // $500k to $1M
  const currentMonth = new Date()
  const trends: MarketTrend[] = []
  
  // Generate 12 months of historical data
  for (let i = 11; i >= 0; i--) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    
    // Add some realistic variation
    const variation = 0.95 + Math.random() * 0.1 // ±5% variation
    const monthPrice = Math.round(basePrice * variation)
    
    trends.push({
      month: date.toLocaleString('default', { month: 'long' }),
      year: date.getFullYear(),
      medianSalePrice: monthPrice,
      medianRentPrice: Math.round(monthPrice * 0.006), // ~0.6% of sale price
      medianPricePerSqFt: Math.round(monthPrice / 2000), // Assume 2000 sqft average
      averageDaysOnMarket: 20 + Math.floor(Math.random() * 40),
      inventoryCount: 50 + Math.floor(Math.random() * 100),
      salesCount: 20 + Math.floor(Math.random() * 30)
    })
  }
  
  const currentData = trends[trends.length - 1]
  const lastYearData = trends[0]
  const lastMonthData = trends[trends.length - 2]
  
  const priceChangeYoY = ((currentData.medianSalePrice - lastYearData.medianSalePrice) / lastYearData.medianSalePrice) * 100
  const priceChangeMoM = ((currentData.medianSalePrice - lastMonthData.medianSalePrice) / lastMonthData.medianSalePrice) * 100
  
  return {
    zipCode,
    city: city || 'Unknown City',
    state: state || 'CA',
    currentMonth: {
      medianSalePrice: currentData.medianSalePrice,
      medianRentPrice: currentData.medianRentPrice,
      medianPricePerSqFt: currentData.medianPricePerSqFt,
      averageDaysOnMarket: currentData.averageDaysOnMarket,
      inventoryCount: currentData.inventoryCount,
      priceChangeYoY: Math.round(priceChangeYoY * 10) / 10,
      priceChangeMoM: Math.round(priceChangeMoM * 10) / 10
    },
    trends,
    propertyTypeBreakdown: {
      singleFamily: {
        medianPrice: Math.round(currentData.medianSalePrice * 1.1),
        count: Math.floor(currentData.inventoryCount * 0.6)
      },
      condo: {
        medianPrice: Math.round(currentData.medianSalePrice * 0.7),
        count: Math.floor(currentData.inventoryCount * 0.25)
      },
      townhouse: {
        medianPrice: Math.round(currentData.medianSalePrice * 0.85),
        count: Math.floor(currentData.inventoryCount * 0.15)
      }
    }
  }
}