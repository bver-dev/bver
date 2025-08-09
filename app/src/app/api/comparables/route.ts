import { NextRequest, NextResponse } from 'next/server'
import { getCachedPropertyData, setCachedPropertyData } from '@/lib/property-cache'

interface RentCastComparable {
  id: string
  formattedAddress: string
  addressLine1: string
  city: string
  state: string
  zipCode: string
  county: string
  latitude: number
  longitude: number
  squareFootage?: number
  bedrooms?: number
  bathrooms?: number
  yearBuilt?: number
  propertyType?: string
  lastSaleDate?: string
  lastSalePrice?: number
  price?: number
  listedDate?: string
  listedPrice?: number
  removedDate?: string
  daysOnMarket?: number
  distance: number
  correlation: number
}

interface ComparableProperty {
  address: string
  distance: number // miles from subject property
  squareFeet: number
  bedrooms: number
  bathrooms: number
  yearBuilt: number
  lastSalePrice: number
  lastSaleDate: string
  pricePerSqFt: number
  similarity: number // 0-100 score
  listingPrice?: number
  daysOnMarket?: number
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const address = searchParams.get('address')
  const city = searchParams.get('city')
  const state = searchParams.get('state')
  const zipCode = searchParams.get('zipCode')
  const lat = parseFloat(searchParams.get('lat') || '0')
  const lng = parseFloat(searchParams.get('lng') || '0')
  const squareFeet = parseInt(searchParams.get('squareFeet') || '0')
  const bedrooms = parseInt(searchParams.get('bedrooms') || '0')
  const bathrooms = parseFloat(searchParams.get('bathrooms') || '0')
  const propertyType = searchParams.get('propertyType') || 'Single Family'

  // Only require address, others can be optional
  if (!address) {
    return NextResponse.json(
      { error: 'Address is required' },
      { status: 400 }
    )
  }

  try {
    // Check cache first
    const cacheKey = `comparables_${address}_${city || 'unknown'}_${state || 'unknown'}_${zipCode || 'unknown'}`
    const cachedData = await getCachedPropertyData(
      cacheKey,
      city || 'unknown',
      state || 'unknown',
      zipCode || 'unknown'
    )
    
    if (cachedData) {
      console.log('Using cached comparables data')
      return NextResponse.json(cachedData)
    }

    // Try RentCast API if configured
    const rentcastKey = process.env.RENTCAST_API_KEY
    if (rentcastKey) {
      try {
        const comparablesData = await fetchRentCastComparables(
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
          rentcastKey
        )
        
        // Check if RentCast returned actual comparables
        console.log('Comparables data check:', {
          hasComparables: !!comparablesData.comparables,
          comparablesLength: comparablesData.comparables?.length || 0
        })
        
        if (comparablesData.comparables && comparablesData.comparables.length > 0) {
          // Cache the response
          await setCachedPropertyData(
            cacheKey,
            city || 'unknown',
            state || 'unknown',
            zipCode || 'unknown',
            lat,
            lng,
            'rentcast_comparables',
            comparablesData
          )
          
          console.log('Returning RentCast data with', comparablesData.comparables.length, 'comparables')
          return NextResponse.json(comparablesData)
        } else {
          console.log('RentCast returned no comparables, falling back to mock data')
          // Fall through to mock data
        }
      } catch (apiError) {
        console.error('RentCast comparables API error:', apiError)
        // Fall through to mock data
      }
    }

    // Fall back to mock data
    const comparables = generateMockComparables(
      lat,
      lng,
      squareFeet,
      bedrooms,
      bathrooms,
      propertyType
    )

    const response = {
      comparables,
      summary: {
        count: comparables.length,
        avgPricePerSqFt: calculateAvgPricePerSqFt(comparables),
        avgSalePrice: calculateAvgSalePrice(comparables),
        radius: 1.0,
        dataSource: 'mock'
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Comparables API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comparable properties' },
      { status: 500 }
    )
  }
}

async function fetchRentCastComparables(
  address: string,
  city: string | null,
  state: string | null,
  zipCode: string | null,
  lat: number,
  lng: number,
  squareFeet: number,
  bedrooms: number,
  bathrooms: number,
  propertyType: string,
  apiKey: string
) {
  // RentCast AVM endpoint for property value and comparables
  const url = new URL('https://api.rentcast.io/v1/avm/value')
  
  // Build query parameters
  // Construct full address, handling null values
  const fullAddress = [
    address,
    city,
    state && zipCode ? `${state} ${zipCode}` : state || zipCode
  ].filter(Boolean).join(', ')
  
  const params = new URLSearchParams({
    address: fullAddress,
    compCount: '20', // Request up to 20 comparables (RentCast recommended)
    maxRadius: '2', // 2 mile radius for better coverage
    daysOld: '180', // Comparables from last 6 months for more recent data
  })

  // Add optional property details if available
  if (squareFeet > 0) params.append('squareFootage', squareFeet.toString())
  if (bedrooms > 0) params.append('bedrooms', bedrooms.toString())
  if (bathrooms > 0) params.append('bathrooms', bathrooms.toString())
  if (propertyType) params.append('propertyType', propertyType)

  url.search = params.toString()

  console.log('RentCast AVM request URL:', url.toString())
  
  const response = await fetch(url.toString(), {
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
  console.log('RentCast AVM response:', JSON.stringify(data, null, 2))
  
  // Transform RentCast response to our format
  const comparables: ComparableProperty[] = (data.comparables || []).map((comp: RentCastComparable) => ({
    address: comp.formattedAddress || `${comp.addressLine1}, ${comp.city}, ${comp.state} ${comp.zipCode}`,
    distance: comp.distance || 0,
    squareFeet: comp.squareFootage || 0,
    bedrooms: comp.bedrooms || 0,
    bathrooms: comp.bathrooms || 0,
    yearBuilt: comp.yearBuilt || 0,
    lastSalePrice: comp.price || comp.lastSalePrice || comp.listedPrice || 0,
    lastSaleDate: comp.lastSaleDate || comp.listedDate || '',
    pricePerSqFt: comp.squareFootage ? Math.round((comp.price || comp.lastSalePrice || comp.listedPrice || 0) / comp.squareFootage) : 0,
    similarity: Math.round((comp.correlation || 0) * 100),
    listingPrice: comp.listedPrice,
    daysOnMarket: comp.daysOnMarket
  })).filter((comp: ComparableProperty) => comp.lastSalePrice > 0)

  return {
    comparables,
    summary: {
      count: comparables.length,
      avgPricePerSqFt: calculateAvgPricePerSqFt(comparables),
      avgSalePrice: calculateAvgSalePrice(comparables),
      radius: 1.0,
      dataSource: 'rentcast'
    },
    valuation: {
      estimate: data.price || null,
      estimateRange: {
        low: data.priceRangeLow || null,
        high: data.priceRangeHigh || null
      },
      confidence: data.fmvConfidenceScore || null
    }
  }
}

function generateMockComparables(
  lat: number,
  lng: number,
  squareFeet: number,
  bedrooms: number,
  bathrooms: number,
  propertyType: string
): ComparableProperty[] {
  const comparables: ComparableProperty[] = []
  const basePrice = squareFeet * 400 // Base price per sq ft

  // Generate 5-8 comparables
  const count = 5 + Math.floor(Math.random() * 4)
  
  for (let i = 0; i < count; i++) {
    const sqftVariation = 0.8 + Math.random() * 0.4 // 80% to 120% of subject
    const compSqFt = Math.round(squareFeet * sqftVariation)
    
    const priceVariation = 0.85 + Math.random() * 0.3 // 85% to 115% of base
    const salePrice = Math.round(basePrice * priceVariation)
    
    const distance = Math.round((0.1 + Math.random() * 0.9) * 10) / 10 // 0.1 to 1.0 miles
    
    // Calculate similarity score
    const sqftDiff = Math.abs(compSqFt - squareFeet) / squareFeet
    const bedroomDiff = Math.abs((bedrooms + (Math.random() > 0.7 ? 1 : 0)) - bedrooms)
    const similarity = Math.round(100 - (sqftDiff * 50) - (bedroomDiff * 10) - (distance * 10))
    
    comparables.push({
      address: generateMockAddress(i),
      distance,
      squareFeet: compSqFt,
      bedrooms: bedrooms + (Math.random() > 0.7 ? 1 : Math.random() > 0.3 ? 0 : -1),
      bathrooms: bathrooms + (Math.random() > 0.8 ? 0.5 : 0),
      yearBuilt: 1970 + Math.floor(Math.random() * 50),
      lastSalePrice: salePrice,
      lastSaleDate: generateRecentDate(),
      pricePerSqFt: Math.round(salePrice / compSqFt),
      similarity: Math.max(60, Math.min(95, similarity)),
      daysOnMarket: Math.floor(Math.random() * 90)
    })
  }

  // Sort by similarity score
  return comparables.sort((a, b) => b.similarity - a.similarity)
}

function generateMockAddress(index: number): string {
  const streets = ['Oak St', 'Maple Ave', 'Cedar Dr', 'Pine Ln', 'Elm Way', 'Birch Ct', 'Willow Rd', 'Spruce Pl']
  const numbers = [100, 200, 300, 400, 500, 600, 700, 800, 900]
  
  return `${numbers[index % numbers.length] + Math.floor(Math.random() * 99)} ${streets[index % streets.length]}`
}

function generateRecentDate(): string {
  const daysAgo = Math.floor(Math.random() * 365 * 2) // Within last 2 years
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date.toISOString().split('T')[0]
}

function calculateAvgPricePerSqFt(comparables: ComparableProperty[]): number {
  if (comparables.length === 0) return 0
  const sum = comparables.reduce((acc, comp) => acc + comp.pricePerSqFt, 0)
  return Math.round(sum / comparables.length)
}

function calculateAvgSalePrice(comparables: ComparableProperty[]): number {
  if (comparables.length === 0) return 0
  const sum = comparables.reduce((acc, comp) => acc + comp.lastSalePrice, 0)
  return Math.round(sum / comparables.length)
}