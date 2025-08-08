import { NextRequest, NextResponse } from 'next/server'

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
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const lat = parseFloat(searchParams.get('lat') || '0')
  const lng = parseFloat(searchParams.get('lng') || '0')
  const squareFeet = parseInt(searchParams.get('squareFeet') || '0')
  const bedrooms = parseInt(searchParams.get('bedrooms') || '0')
  const bathrooms = parseFloat(searchParams.get('bathrooms') || '0')
  const propertyType = searchParams.get('propertyType') || 'Single Family'

  try {
    // In production, this would call RentCast or ATTOM API for actual comparables
    // For now, generate realistic mock comparables
    const comparables = generateMockComparables(
      lat,
      lng,
      squareFeet,
      bedrooms,
      bathrooms,
      propertyType
    )

    return NextResponse.json({
      comparables,
      summary: {
        count: comparables.length,
        avgPricePerSqFt: calculateAvgPricePerSqFt(comparables),
        avgSalePrice: calculateAvgSalePrice(comparables),
        radius: 1.0 // 1 mile radius
      }
    })
  } catch (error) {
    console.error('Comparables API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comparable properties' },
      { status: 500 }
    )
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
      similarity: Math.max(60, Math.min(95, similarity))
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