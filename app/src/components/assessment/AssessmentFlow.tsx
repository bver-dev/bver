"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Home, DollarSign, TrendingDown, FileCheck, 
  AlertCircle, CheckCircle, XCircle, Loader2,
  ArrowRight, Info, Download
} from 'lucide-react'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import ViabilityMeter from './ViabilityMeter'
import PropertyDetailsForm from './PropertyDetailsForm'

interface AssessmentFlowProps {
  initialAddress: string
  latitude: number
  longitude: number
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
}

export default function AssessmentFlow({ 
  initialAddress, 
  latitude, 
  longitude 
}: AssessmentFlowProps) {
  const [step, setStep] = useState<'loading' | 'details' | 'analyzing' | 'results'>('loading')
  const [propertyDetails, setPropertyDetails] = useState<any>(null)
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Fetch initial property data
    fetchPropertyData()
  }, [])

  const fetchPropertyData = async () => {
    try {
      // Call our API to fetch property data from multiple sources
      const response = await fetch(
        `/api/property?address=${encodeURIComponent(initialAddress)}&lat=${latitude}&lng=${longitude}`
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch property data')
      }
      
      const data = await response.json()
      
      // Map API response to our property details format
      const propertyData = {
        address: initialAddress,
        lat: latitude,
        lng: longitude,
        assessedValue: data.assessedValue || null,
        marketValue: data.marketValue || null,
        lastSalePrice: data.lastSalePrice || null,
        lastSaleDate: data.lastSaleDate || null,
        squareFeet: data.squareFeet || null,
        yearBuilt: data.yearBuilt || null,
        bedrooms: data.bedrooms || null,
        bathrooms: data.bathrooms || null,
        lotSize: data.lotSize || null,
        propertyType: data.propertyType || 'Single Family',
        county: data.county || null,
        parcelNumber: data.parcelNumber || null,
        taxRate: data.taxRate || 1.2,
        dataSource: data.dataSource || 'unknown',
        // Additional fields from RentCast
        owner: data.owner || null,
        hoa: data.hoa || null,
        features: data.features || null,
        taxAssessmentHistory: data.taxAssessmentHistory || null,
        saleHistory: data.saleHistory || null,
        rentEstimate: data.rentEstimate || null,
        rawData: data.rawData || null,
        apiError: data.apiError || null
      }
      
      setPropertyDetails(propertyData)
      setStep('details')
    } catch (err) {
      console.error('Failed to fetch property data:', err)
      // Fallback to basic data if API fails
      setPropertyDetails({
        address: initialAddress,
        lat: latitude,
        lng: longitude,
        assessedValue: null,
        lastSalePrice: null,
        lastSaleDate: null,
        squareFeet: null,
        yearBuilt: null,
        bedrooms: null,
        bathrooms: null,
        lotSize: null,
        propertyType: 'Single Family',
        taxRate: 1.2
      })
      setStep('details')
    }
  }

  const analyzeAssessment = async (details: any) => {
    setStep('analyzing')
    
    try {
      // Simulate assessment analysis
      setTimeout(() => {
        const mockResult: AssessmentResult = {
          viability: 'high',
          overAssessmentAmount: 125000,
          overAssessmentPercentage: 14.7,
          estimatedSavings: 1500,
          confidence: 92,
          currentAssessment: 850000,
          estimatedMarketValue: 725000,
          reasons: [
            'Assessment exceeds market value by 14.7%',
            'Similar properties in area assessed 12% lower',
            'Recent comparable sales support lower valuation',
            'Property condition factors not reflected in assessment'
          ],
          comparables: [
            { address: '124 Main St', salePrice: 720000, sqft: 2450 },
            { address: '456 Oak Ave', salePrice: 735000, sqft: 2600 },
            { address: '789 Pine Rd', salePrice: 710000, sqft: 2400 }
          ]
        }
        setAssessmentResult(mockResult)
        setStep('results')
      }, 3000)
    } catch (err) {
      setError('Failed to analyze assessment')
      console.error(err)
    }
  }

  const getViabilityColor = (viability: string) => {
    switch (viability) {
      case 'high': return 'text-green-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-orange-600'
      default: return 'text-red-600'
    }
  }

  const getViabilityIcon = (viability: string) => {
    switch (viability) {
      case 'high': return <CheckCircle className="w-8 h-8 text-green-600" />
      case 'medium': return <AlertCircle className="w-8 h-8 text-yellow-600" />
      case 'low': return <AlertCircle className="w-8 h-8 text-orange-600" />
      default: return <XCircle className="w-8 h-8 text-red-600" />
    }
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-50">
        <motion.div
          className="h-full bg-blue-600"
          initial={{ width: '0%' }}
          animate={{ 
            width: 
              step === 'loading' ? '25%' : 
              step === 'details' ? '50%' : 
              step === 'analyzing' ? '75%' : 
              '100%' 
          }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Loading State */}
        {step === 'loading' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center min-h-[60vh]"
          >
            <div className="text-center">
              <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Fetching Property Data
              </h2>
              <p className="text-gray-600">
                Gathering information for {initialAddress}
              </p>
            </div>
          </motion.div>
        )}

        {/* Property Details Form */}
        {step === 'details' && propertyDetails && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Confirm Property Details
              </h1>
              <p className="text-gray-600">
                Please verify and update the information below for accurate assessment
              </p>
            </div>

            <PropertyDetailsForm
              initialData={propertyDetails}
              onSubmit={(details) => {
                setPropertyDetails(details)
                analyzeAssessment(details)
              }}
            />
          </motion.div>
        )}

        {/* Analyzing State */}
        {step === 'analyzing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center min-h-[60vh]"
          >
            <div className="text-center max-w-md">
              <div className="relative mb-8">
                <div className="w-32 h-32 mx-auto">
                  <Loader2 className="w-full h-full text-blue-600 animate-spin" />
                </div>
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <Home className="w-16 h-16 text-blue-600/20" />
                </motion.div>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Analyzing Your Assessment
              </h2>
              
              <div className="space-y-3 text-left bg-white rounded-lg p-6 shadow-lg">
                {[
                  'Comparing to market values...',
                  'Analyzing comparable properties...',
                  'Calculating potential savings...',
                  'Generating recommendations...'
                ].map((text, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.5 }}
                    className="flex items-center space-x-3"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    >
                      <Loader2 className="w-5 h-5 text-blue-600" />
                    </motion.div>
                    <span className="text-gray-700">{text}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Results */}
        {step === 'results' && assessmentResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Assessment Analysis Complete
              </h1>
              <p className="text-gray-600">
                Here's what we found for your property
              </p>
            </div>

            {/* Viability Summary Card */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl shadow-xl p-8 mb-8"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    {getViabilityIcon(assessmentResult.viability)}
                    <h2 className="text-2xl font-bold text-gray-900">
                      Appeal Viability: {' '}
                      <span className={getViabilityColor(assessmentResult.viability)}>
                        {assessmentResult.viability.toUpperCase()}
                      </span>
                    </h2>
                  </div>
                  <p className="text-gray-600">
                    Confidence Level: {assessmentResult.confidence}%
                  </p>
                </div>
                <ViabilityMeter 
                  value={assessmentResult.confidence}
                  viability={assessmentResult.viability}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Current Assessment</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(assessmentResult.currentAssessment)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Estimated Market Value</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(assessmentResult.estimatedMarketValue)}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Over-Assessment</p>
                    <p className="text-2xl font-bold text-red-600">
                      {formatCurrency(assessmentResult.overAssessmentAmount)}
                    </p>
                    <p className="text-sm text-gray-600">
                      ({formatPercentage(assessmentResult.overAssessmentPercentage)})
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Potential Annual Savings</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(assessmentResult.estimatedSavings)}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Reasons for Appeal */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-xl p-8 mb-8"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Info className="w-5 h-5 mr-2" />
                Why You Should Appeal
              </h3>
              <ul className="space-y-3">
                {assessmentResult.reasons.map((reason, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{reason}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <button className="flex-1 bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center">
                <FileCheck className="w-5 h-5 mr-2" />
                Generate Appeal Form
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
              <button className="flex-1 bg-gray-100 text-gray-700 px-8 py-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center">
                <Download className="w-5 h-5 mr-2" />
                Download Full Report
              </button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  )
}