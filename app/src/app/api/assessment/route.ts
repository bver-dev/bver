import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface AssessmentRequest {
  propertyDetails: {
    address: string
    assessedValue: number
    marketValue?: number
    lastSalePrice?: number
    lastSaleDate?: string
    squareFeet: number
    yearBuilt: number
    bedrooms: number
    bathrooms: number
    lotSize: number
    propertyType: string
    condition: string
    recentRenovations: boolean
    additionalNotes?: string
  }
  comparables?: any[]
}

interface AssessmentResult {
  viability: 'high' | 'medium' | 'low' | 'none'
  overAssessmentAmount: number
  overAssessmentPercentage: number
  estimatedSavings: number
  confidence: number
  reasons: string[]
  currentAssessment: number
  estimatedMarketValue: number
  comparables: any[]
  recommendation: string
}

export async function POST(request: NextRequest) {
  try {
    const body: AssessmentRequest = await request.json()
    const { propertyDetails } = body

    // Basic validation
    if (!propertyDetails || !propertyDetails.assessedValue) {
      return NextResponse.json(
        { error: 'Property details with assessed value required' },
        { status: 400 }
      )
    }

    // Calculate estimated market value using multiple factors
    const estimatedMarketValue = calculateMarketValue(propertyDetails)
    
    // Determine over-assessment
    const overAssessmentAmount = Math.max(0, propertyDetails.assessedValue - estimatedMarketValue)
    const overAssessmentPercentage = (overAssessmentAmount / propertyDetails.assessedValue) * 100
    
    // Calculate potential savings (assuming average tax rate)
    const averageTaxRate = 0.012 // 1.2% average property tax rate
    const estimatedSavings = overAssessmentAmount * averageTaxRate
    
    // Determine viability
    const viability = determineViability(overAssessmentPercentage, propertyDetails)
    
    // Generate reasons for assessment
    const reasons = generateReasons(propertyDetails, overAssessmentPercentage, estimatedMarketValue)
    
    // Calculate confidence score
    const confidence = calculateConfidence(propertyDetails)
    
    // Generate recommendation
    const recommendation = generateRecommendation(viability, overAssessmentPercentage, estimatedSavings)
    
    const result: AssessmentResult = {
      viability,
      overAssessmentAmount,
      overAssessmentPercentage,
      estimatedSavings,
      confidence,
      reasons,
      currentAssessment: propertyDetails.assessedValue,
      estimatedMarketValue,
      comparables: [], // TODO: Fetch actual comparables
      recommendation
    }

    // Store assessment in database if user is authenticated
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { error } = await supabase
        .from('assessments')
        .insert({
          user_id: user.id,
          address: propertyDetails.address,
          assessed_value: propertyDetails.assessedValue,
          estimated_market_value: estimatedMarketValue,
          over_assessment_amount: overAssessmentAmount,
          over_assessment_percentage: overAssessmentPercentage,
          viability,
          confidence,
          property_data: propertyDetails,
          result_data: result
        })
      
      if (error) {
        console.error('Error storing assessment:', error)
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Assessment error:', error)
    return NextResponse.json(
      { error: 'Failed to process assessment' },
      { status: 500 }
    )
  }
}

function calculateMarketValue(property: any): number {
  let marketValue = property.assessedValue

  // Factor 1: Recent sale price (highest weight)
  if (property.lastSalePrice && property.lastSaleDate) {
    const saleDate = new Date(property.lastSaleDate)
    const yearsSinceSale = (Date.now() - saleDate.getTime()) / (1000 * 60 * 60 * 24 * 365)
    
    if (yearsSinceSale < 2) {
      // Recent sale is strong indicator
      marketValue = property.lastSalePrice * 1.05 // Assume 2.5% appreciation per year
    } else if (yearsSinceSale < 5) {
      // Moderate weight for older sales
      const appreciation = 1 + (yearsSinceSale * 0.025)
      marketValue = property.lastSalePrice * appreciation
    }
  }

  // Factor 2: Price per square foot analysis
  if (property.squareFeet > 0) {
    // Use regional averages (this should be dynamic based on location)
    const avgPricePerSqFt = getRegionalPricePerSqFt(property.propertyType)
    const estimatedBySize = property.squareFeet * avgPricePerSqFt
    
    // Blend with current estimate
    marketValue = (marketValue + estimatedBySize) / 2
  }

  // Factor 3: Condition adjustments
  const conditionMultipliers: Record<string, number> = {
    'excellent': 1.15,
    'good': 1.0,
    'fair': 0.85,
    'poor': 0.70
  }
  const conditionMultiplier = conditionMultipliers[property.condition] || 1.0
  
  marketValue *= conditionMultiplier

  // Factor 4: Recent renovations
  if (property.recentRenovations) {
    marketValue *= 1.08 // 8% premium for recent renovations
  }

  // Factor 5: Age adjustment
  const age = new Date().getFullYear() - property.yearBuilt
  if (age > 50) {
    marketValue *= 0.95 // 5% discount for older homes
  } else if (age < 5) {
    marketValue *= 1.05 // 5% premium for new construction
  }

  return Math.round(marketValue)
}

function getRegionalPricePerSqFt(propertyType: string): number {
  // This should be dynamic based on location
  // Using California averages as placeholder
  const prices: Record<string, number> = {
    'Single Family': 450,
    'Condo': 550,
    'Townhouse': 400,
    'Multi-Family': 350
  }
  return prices[propertyType] || 400
}

function determineViability(
  overAssessmentPercentage: number,
  property: any
): 'high' | 'medium' | 'low' | 'none' {
  // High viability: Over 15% over-assessed
  if (overAssessmentPercentage > 15) {
    return 'high'
  }
  
  // Medium viability: 8-15% over-assessed
  if (overAssessmentPercentage > 8) {
    return 'medium'
  }
  
  // Low viability: 3-8% over-assessed
  if (overAssessmentPercentage > 3) {
    return 'low'
  }
  
  // No viability: Less than 3% over-assessed
  return 'none'
}

function generateReasons(
  property: any,
  overAssessmentPercentage: number,
  estimatedMarketValue: number
): string[] {
  const reasons: string[] = []

  if (overAssessmentPercentage > 10) {
    reasons.push(`Your property is assessed ${overAssessmentPercentage.toFixed(1)}% above estimated market value`)
  }

  if (property.lastSalePrice && property.lastSalePrice < property.assessedValue * 0.9) {
    reasons.push('Recent sale price significantly lower than current assessment')
  }

  if (property.condition === 'fair' || property.condition === 'poor') {
    reasons.push(`Property condition (${property.condition}) not reflected in assessment`)
  }

  const age = new Date().getFullYear() - property.yearBuilt
  if (age > 40) {
    reasons.push(`Property age (${age} years) may warrant depreciation adjustment`)
  }

  if (!property.recentRenovations && age > 20) {
    reasons.push('No recent renovations to justify high assessment')
  }

  if (reasons.length === 0) {
    if (overAssessmentPercentage > 0) {
      reasons.push('Minor over-assessment detected')
    } else {
      reasons.push('Assessment appears to be in line with market value')
    }
  }

  return reasons
}

function calculateConfidence(property: any): number {
  let confidence = 50 // Base confidence

  // Increase confidence based on data availability
  if (property.lastSalePrice && property.lastSaleDate) {
    const saleDate = new Date(property.lastSaleDate)
    const yearsSinceSale = (Date.now() - saleDate.getTime()) / (1000 * 60 * 60 * 24 * 365)
    
    if (yearsSinceSale < 2) {
      confidence += 25 // Very recent sale data
    } else if (yearsSinceSale < 5) {
      confidence += 15 // Moderate recent sale data
    }
  }

  if (property.squareFeet && property.squareFeet > 0) {
    confidence += 10
  }

  if (property.bedrooms && property.bathrooms) {
    confidence += 10
  }

  if (property.condition) {
    confidence += 5
  }

  // Cap at 95% confidence
  return Math.min(95, confidence)
}

function generateRecommendation(
  viability: string,
  overAssessmentPercentage: number,
  estimatedSavings: number
): string {
  switch (viability) {
    case 'high':
      return `Strong appeal recommended. With ${overAssessmentPercentage.toFixed(1)}% over-assessment, you could save approximately $${estimatedSavings.toFixed(0)} annually. File your appeal as soon as possible.`
    
    case 'medium':
      return `Appeal is worthwhile. Your ${overAssessmentPercentage.toFixed(1)}% over-assessment could result in $${estimatedSavings.toFixed(0)} annual savings. Consider filing an appeal.`
    
    case 'low':
      return `Appeal may be beneficial. While the ${overAssessmentPercentage.toFixed(1)}% over-assessment is modest, you could still save $${estimatedSavings.toFixed(0)} annually.`
    
    case 'none':
    default:
      return `Appeal not recommended at this time. Your assessment appears to be in line with market value. Monitor your assessment annually for changes.`
  }
}