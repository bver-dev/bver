import { createClient } from '@/lib/supabase/server'

// Configurable cache duration (default 30 days)
const CACHE_DURATION_DAYS = parseInt(process.env.PROPERTY_CACHE_DAYS || '30')
const CACHE_DURATION_MS = CACHE_DURATION_DAYS * 24 * 60 * 60 * 1000

// Local in-memory cache for this session
const localCache = new Map<string, { data: any; timestamp: number }>()

export interface CachedPropertyData {
  address: string
  city: string
  state: string
  zipCode: string
  lat: number | null
  lng: number | null
  dataSource: string
  apiResponse: any
  timestamp: string
}

/**
 * Generate a cache key from address components
 */
function getCacheKey(address: string, city: string, state: string, zipCode: string): string {
  return `${address}_${city}_${state}_${zipCode}`.toLowerCase().replace(/\s+/g, '_')
}

/**
 * Check if cached data is still valid
 */
function isCacheValid(timestamp: string | number): boolean {
  const cacheTime = typeof timestamp === 'string' ? new Date(timestamp).getTime() : timestamp
  const now = Date.now()
  return (now - cacheTime) < CACHE_DURATION_MS
}

/**
 * Get property data from cache (local first, then Supabase)
 */
export async function getCachedPropertyData(
  address: string,
  city: string,
  state: string,
  zipCode: string
): Promise<any | null> {
  const cacheKey = getCacheKey(address, city, state, zipCode)
  
  // Check local cache first
  const localData = localCache.get(cacheKey)
  if (localData && isCacheValid(localData.timestamp)) {
    console.log('Property data found in local cache')
    return localData.data
  }
  
  // Check Supabase cache
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('property_data_cache')
      .select('*')
      .eq('address', address)
      .eq('city', city)
      .eq('state', state)
      .eq('zip_code', zipCode)
      .single()
    
    if (error) {
      console.log('No cached data in Supabase:', error.message)
      return null
    }
    
    if (data && data.updated_at && isCacheValid(data.updated_at)) {
      console.log('Property data found in Supabase cache')
      // Update local cache
      localCache.set(cacheKey, {
        data: data.api_response,
        timestamp: new Date(data.updated_at).getTime()
      })
      return data.api_response
    }
    
    console.log('Cached data expired')
    return null
  } catch (error) {
    console.error('Error checking cache:', error)
    return null
  }
}

/**
 * Save property data to cache (both local and Supabase)
 */
export async function setCachedPropertyData(
  address: string,
  city: string,
  state: string,
  zipCode: string,
  lat: number | null,
  lng: number | null,
  dataSource: string,
  apiResponse: any
): Promise<void> {
  const cacheKey = getCacheKey(address, city, state, zipCode)
  
  // Update local cache immediately
  localCache.set(cacheKey, {
    data: apiResponse,
    timestamp: Date.now()
  })
  
  // Update Supabase cache
  try {
    const supabase = await createClient()
    
    const cacheData = {
      address,
      city,
      state,
      zip_code: zipCode,
      lat,
      lng,
      data_source: dataSource,
      api_response: apiResponse,
      updated_at: new Date().toISOString()
    }
    
    // Upsert - insert or update if exists
    const { error } = await supabase
      .from('property_data_cache')
      .upsert(cacheData)
    
    if (error) {
      console.error('Error saving to cache:', error)
    } else {
      console.log('Property data cached successfully')
    }
  } catch (error) {
    console.error('Error updating cache:', error)
  }
}

/**
 * Clear expired cache entries (can be called periodically)
 */
export async function clearExpiredCache(): Promise<void> {
  try {
    const supabase = await createClient()
    
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() - CACHE_DURATION_DAYS)
    
    const { error } = await supabase
      .from('property_data_cache')
      .delete()
      .lt('updated_at', expiryDate.toISOString())
    
    if (error) {
      console.error('Error clearing expired cache:', error)
    } else {
      console.log('Expired cache entries cleared')
    }
  } catch (error) {
    console.error('Error clearing cache:', error)
  }
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
  totalEntries: number
  validEntries: number
  expiredEntries: number
  cacheHitRate?: number
}> {
  try {
    const supabase = await createClient()
    
    const { count: totalCount } = await supabase
      .from('property_data_cache')
      .select('*', { count: 'exact', head: true })
    
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() - CACHE_DURATION_DAYS)
    
    const { count: validCount } = await supabase
      .from('property_data_cache')
      .select('*', { count: 'exact', head: true })
      .gte('updated_at', expiryDate.toISOString())
    
    return {
      totalEntries: totalCount || 0,
      validEntries: validCount || 0,
      expiredEntries: (totalCount || 0) - (validCount || 0)
    }
  } catch (error) {
    console.error('Error getting cache stats:', error)
    return {
      totalEntries: 0,
      validEntries: 0,
      expiredEntries: 0
    }
  }
}