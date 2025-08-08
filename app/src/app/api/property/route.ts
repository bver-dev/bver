import { NextRequest, NextResponse } from 'next/server'
import { getCachedPropertyData, setCachedPropertyData } from '@/lib/property-cache'

// Property data service that integrates multiple APIs with caching
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const address = searchParams.get('address')
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')

  if (!address) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 })
  }

  try {
    // Parse address components
    const addressParts = address.split(',').map(s => s.trim())
    const streetAddress = addressParts[0]
    const city = addressParts[1] || ''
    const stateZip = addressParts[2] || ''
    const [state, zipCode] = stateZip.split(' ').filter(Boolean)

    // Check cache first
    const cachedData = await getCachedPropertyData(streetAddress, city, state, zipCode)
    if (cachedData) {
      console.log('Using cached property data')
      return NextResponse.json({
        ...cachedData,
        fromCache: true,
        cacheAge: 'Within configured cache period'
      })
    }

    console.log('Cache miss - fetching fresh data')

    // Initialize property data object
    let propertyData = {
      address: streetAddress,
      city,
      state,
      zipCode,
      lat: lat ? parseFloat(lat) : null,
      lng: lng ? parseFloat(lng) : null,
      assessedValue: null,
      marketValue: null,
      lastSalePrice: null,
      lastSaleDate: null,
      squareFeet: null,
      yearBuilt: null,
      bedrooms: null,
      bathrooms: null,
      lotSize: null,
      propertyType: 'Single Family',
      taxYear: new Date().getFullYear(),
      county: null,
      parcelNumber: null,
      dataSource: 'multiple'
    }

    // Try RentCast API first (since we have the key)
    const rentcastKey = process.env.RENTCAST_API_KEY
    if (rentcastKey && rentcastKey !== 'your_rentcast_api_key') {
      try {
        console.log('Calling RentCast API...')
        // RentCast API endpoint - using v1 API
        const rentcastUrl = `https://api.rentcast.io/v1/properties?address=${encodeURIComponent(streetAddress)}&city=${encodeURIComponent(city)}&state=${state}&zipCode=${zipCode}`
        
        console.log('RentCast URL:', rentcastUrl)
        const rentcastResponse = await fetch(rentcastUrl, {
          headers: {
            'X-Api-Key': rentcastKey,
            'Accept': 'application/json'
          }
        })

        console.log('RentCast Response Status:', rentcastResponse.status)
        
        if (rentcastResponse.ok) {
          const rentcastData = await rentcastResponse.json()
          console.log('RentCast API response structure:', {
            isArray: Array.isArray(rentcastData),
            length: rentcastData.length,
            firstItem: rentcastData[0] ? Object.keys(rentcastData[0]) : null
          })
          
          // Map RentCast data to our format
          if (rentcastData && rentcastData.length > 0) {
            const property = rentcastData[0]
            console.log('RentCast property fields:', Object.keys(property))
            console.log('RentCast lastSale fields:', {
              lastSalePrice: property.lastSalePrice,
              lastSaleDate: property.lastSaleDate,
              lastSoldPrice: property.lastSoldPrice,
              lastSoldDate: property.lastSoldDate
            })
            
            // Extract tax assessment value - RentCast returns it as an object with years as keys
            let assessedValue = property.assessedValue || 
                               property.taxAssessedValue || 
                               property.assessmentTotal ||
                               property.assessment ||
                               null
            
            // Always check taxAssessments object if it exists - get the most recent year
            if (property.taxAssessments && typeof property.taxAssessments === 'object') {
              const years = Object.keys(property.taxAssessments).sort((a, b) => parseInt(b) - parseInt(a))
              if (years.length > 0) {
                const latestYear = years[0]
                const latestAssessment = property.taxAssessments[latestYear]
                // Always use the latest assessment if available
                assessedValue = latestAssessment.value || 
                               latestAssessment.totalValue || 
                               latestAssessment.assessedValue ||
                               latestAssessment.total ||
                               assessedValue
                console.log(`Found assessment for year ${latestYear}:`, assessedValue)
              }
            }
            
            // Check tax history if it exists
            if (!assessedValue && property.taxHistory) {
              if (Array.isArray(property.taxHistory) && property.taxHistory.length > 0) {
                const latestTax = property.taxHistory[0]
                assessedValue = latestTax.assessedValue || latestTax.value || assessedValue
              }
            }
            
            console.log('Extracted assessed value:', assessedValue, 'from taxAssessments:', property.taxAssessments)
            
            // Extract last sale info - check multiple possible field names
            let lastSalePrice = property.lastSalePrice || property.lastSoldPrice || propertyData.lastSalePrice
            let lastSaleDate = property.lastSaleDate || property.lastSoldDate || propertyData.lastSaleDate
            
            // Check sale history - RentCast returns it as an object with dates as keys
            if (!lastSalePrice && property.saleHistory) {
              const saleDates = Object.keys(property.saleHistory).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
              if (saleDates.length > 0) {
                const lastSaleKey = saleDates[0]
                const lastSale = property.saleHistory[lastSaleKey]
                lastSalePrice = lastSale.price || lastSale.amount || lastSalePrice
                lastSaleDate = lastSale.date || lastSaleKey || lastSaleDate
              }
            }
            
            // Check history object (same format as saleHistory)
            if (!lastSalePrice && property.history) {
              const historyDates = Object.keys(property.history).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
              if (historyDates.length > 0) {
                const lastSaleKey = historyDates[0]
                const lastSale = property.history[lastSaleKey]
                lastSalePrice = lastSale.price || lastSale.amount || lastSalePrice
                lastSaleDate = lastSale.date || lastSaleKey || lastSaleDate
              }
            }
            
            propertyData = {
              ...propertyData,
              assessedValue: assessedValue,
              marketValue: property.value || property.estimatedValue || property.rentEstimate || propertyData.marketValue,
              squareFeet: property.squareFootage || property.livingArea || property.buildingSize || propertyData.squareFeet,
              yearBuilt: property.yearBuilt || property.yearConstructed || propertyData.yearBuilt,
              bedrooms: property.bedrooms || property.beds || property.bedroomCount || propertyData.bedrooms,
              bathrooms: property.bathrooms || property.baths || property.bathroomCount || propertyData.bathrooms,
              lotSize: property.lotSize || property.lotSquareFootage || propertyData.lotSize,
              propertyType: property.propertyType || property.type || propertyData.propertyType,
              county: property.county || property.countyName || propertyData.county,
              lastSalePrice: lastSalePrice,
              lastSaleDate: lastSaleDate,
              parcelNumber: property.apn || property.parcelNumber || property.parcelId || property.assessorID || propertyData.parcelNumber,
              // Additional RentCast fields
              owner: property.owner || null,
              hoa: property.hoa || null,
              features: property.features || null,
              taxAssessmentHistory: property.taxAssessments || null,
              saleHistory: property.saleHistory || property.history || null,
              rentEstimate: property.rentEstimate || property.rent || null,
              dataSource: 'rentcast',
              rawData: property // Store raw data for debugging
            }
            
            // Cache the successful response
            await setCachedPropertyData(
              streetAddress,
              city,
              state,
              zipCode,
              propertyData.lat,
              propertyData.lng,
              'rentcast',
              propertyData
            )
          }
        } else {
          const errorText = await rentcastResponse.text()
          console.error('RentCast API error:', rentcastResponse.status, rentcastResponse.statusText, errorText)
          // Store error info for debugging
          propertyData.apiError = `RentCast returned ${rentcastResponse.status}: ${errorText.substring(0, 200)}`
        }
      } catch (error) {
        console.error('RentCast API exception:', error)
        propertyData.apiError = `RentCast exception: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }

    // Try ATTOM Data API if RentCast didn't work and key is available
    const attomKey = process.env.ATTOM_API_KEY
    if (propertyData.dataSource === 'multiple' && attomKey && attomKey !== 'your_attom_api_key') {
      try {
        console.log('Calling ATTOM API...')
        const attomUrl = `https://api.attomdata.com/property/v4/property/detail?address=${encodeURIComponent(streetAddress)}&city=${encodeURIComponent(city)}&state=${state}&zip=${zipCode}`
        
        const attomResponse = await fetch(attomUrl, {
          headers: {
            'apikey': attomKey,
            'Accept': 'application/json'
          }
        })

        if (attomResponse.ok) {
          const attomData = await attomResponse.json()
          console.log('ATTOM API response received')
          
          // Map ATTOM data to our format
          if (attomData && attomData.property) {
            const property = attomData.property
            propertyData = {
              ...propertyData,
              assessedValue: property.assessment?.assessed?.assdTotalValue || propertyData.assessedValue,
              marketValue: property.assessment?.market?.mktTotalValue || propertyData.marketValue,
              squareFeet: property.building?.size?.livingSize || propertyData.squareFeet,
              yearBuilt: property.building?.construction?.yearBuilt || propertyData.yearBuilt,
              bedrooms: property.building?.rooms?.beds || propertyData.bedrooms,
              bathrooms: property.building?.rooms?.bathsTotal || propertyData.bathrooms,
              lotSize: property.lot?.lotSize || propertyData.lotSize,
              propertyType: property.summary?.propertyType || propertyData.propertyType,
              county: property.area?.countrySecSubd || propertyData.county,
              parcelNumber: property.parcel?.apn || propertyData.parcelNumber,
              lastSalePrice: property.sale?.amount?.saleAmt || propertyData.lastSalePrice,
              lastSaleDate: property.sale?.amount?.saleDate || propertyData.lastSaleDate,
              taxYear: property.assessment?.assessed?.assdYear || propertyData.taxYear,
              dataSource: 'attom'
            }
            
            // Cache the successful response
            await setCachedPropertyData(
              streetAddress,
              city,
              state,
              zipCode,
              propertyData.lat,
              propertyData.lng,
              'attom',
              propertyData
            )
          }
        } else {
          console.error('ATTOM API error:', attomResponse.status, attomResponse.statusText)
        }
      } catch (error) {
        console.error('ATTOM API error:', error)
      }
    }

    // Note about Zillow API
    // Zillow's GetDeepSearchResults API was deprecated in 2021
    // They now only offer the Zillow API through their partner program
    // which requires business approval and is primarily for brokers/lenders
    // For now, we'll skip Zillow integration

    // If no real data available, use mock data for demo
    if (propertyData.dataSource === 'multiple') {
      console.log('No API data available, generating mock data')
      // Generate realistic mock data based on the address
      const mockData = generateMockPropertyData(streetAddress, city, state, zipCode)
      propertyData = { ...propertyData, ...mockData, dataSource: 'mock' }
      
      // Cache even mock data to avoid regenerating
      await setCachedPropertyData(
        streetAddress,
        city,
        state,
        zipCode,
        propertyData.lat,
        propertyData.lng,
        'mock',
        propertyData
      )
    }

    return NextResponse.json({
      ...propertyData,
      fromCache: false
    })
  } catch (error) {
    console.error('Property API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch property data' },
      { status: 500 }
    )
  }
}

// Generate realistic mock data for demo purposes
function generateMockPropertyData(street: string, city: string, state: string, zip: string) {
  // Use address components to generate consistent mock data
  const hash = (street + city).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  
  const baseValue = 200000 + (hash * 1000) % 800000
  const yearBuilt = 1950 + (hash % 70)
  const sqft = 1200 + (hash % 3000)
  const bedrooms = 2 + (hash % 4)
  const bathrooms = 1 + (hash % 3) + 0.5 * (hash % 2)
  const lotSize = 5000 + (hash % 15000)
  
  return {
    assessedValue: Math.round(baseValue * 1.15), // Typically assessed higher
    marketValue: baseValue,
    lastSalePrice: Math.round(baseValue * 0.85),
    lastSaleDate: `${2020 + (hash % 4)}-${String((hash % 12) + 1).padStart(2, '0')}-15`,
    squareFeet: sqft,
    yearBuilt: yearBuilt,
    bedrooms: bedrooms,
    bathrooms: bathrooms,
    lotSize: lotSize,
    propertyType: hash % 5 === 0 ? 'Condo' : hash % 7 === 0 ? 'Townhouse' : 'Single Family',
    county: `${city} County`,
    parcelNumber: `${zip}-${String(hash % 10000).padStart(4, '0')}-${String(hash % 100).padStart(2, '0')}`,
    taxRate: 1.0 + (hash % 30) / 100
  }
}