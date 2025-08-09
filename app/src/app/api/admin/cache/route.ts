import { NextResponse } from 'next/server'
import { getCacheStats, clearExpiredCache } from '@/lib/property-cache'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const stats = await getCacheStats()
    
    // Get recent cache entries
    const supabase = await createClient()
    const { data: recentEntries } = await supabase
      .from('property_data_cache')
      .select('address, data_source, created_at, updated_at')
      .order('created_at', { ascending: false })
      .limit(10)
    
    // Check if entries are valid (30 days from updated_at)
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    const entriesWithValidity = recentEntries?.map(entry => ({
      ...(entry as Record<string, any>),
      is_valid: new Date(entry.updated_at || entry.created_at || '') > thirtyDaysAgo
    }))
    
    return NextResponse.json({
      ...stats,
      recentEntries: entriesWithValidity || [],
      environment: {
        hasRentCastKey: !!process.env.RENTCAST_API_KEY && process.env.RENTCAST_API_KEY !== 'your_rentcast_api_key',
        hasAttomKey: !!process.env.ATTOM_API_KEY && process.env.ATTOM_API_KEY !== 'your_attom_api_key',
        cacheExpiration: process.env.PROPERTY_CACHE_DAYS || '30'
      }
    })
  } catch (error) {
    console.error('Error getting cache stats:', error)
    return NextResponse.json(
      { error: 'Failed to get cache statistics' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    await clearExpiredCache()
    return NextResponse.json({ message: 'Expired cache entries cleared' })
  } catch (error) {
    console.error('Error clearing cache:', error)
    return NextResponse.json(
      { error: 'Failed to clear cache' },
      { status: 500 }
    )
  }
}