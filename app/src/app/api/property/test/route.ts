import { NextResponse } from 'next/server'
import { getCacheStats } from '@/lib/property-cache'

// Test endpoint to verify property API and caching
export async function GET() {
  try {
    // Test address
    const testAddress = '1600 Amphitheatre Parkway, Mountain View, CA 94043'
    
    // Fetch property data
    const propertyResponse = await fetch(`http://localhost:3000/api/property?address=${encodeURIComponent(testAddress)}&lat=37.4224764&lng=-122.0842499`)
    const propertyData = await propertyResponse.json()
    
    // Get cache statistics
    const cacheStats = await getCacheStats()
    
    return NextResponse.json({
      success: true,
      testAddress,
      propertyData,
      cacheStats,
      environment: {
        hasRentCastKey: !!process.env.RENTCAST_API_KEY && process.env.RENTCAST_API_KEY !== 'your_rentcast_api_key',
        hasAttomKey: !!process.env.ATTOM_API_KEY && process.env.ATTOM_API_KEY !== 'your_attom_api_key',
        cacheExpiration: process.env.PROPERTY_CACHE_DAYS || '30'
      }
    })
  } catch (error) {
    console.error('Test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}