"use client"

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Home, DollarSign, Calendar, Square, Bed, Bath, Trees, Info } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

const propertySchema = z.object({
  assessedValue: z.number().min(1000, 'Assessed value must be at least $1,000'),
  lastSalePrice: z.number().optional(),
  lastSaleDate: z.string().optional(),
  squareFeet: z.number().min(100, 'Square footage must be at least 100'),
  yearBuilt: z.number().min(1800).max(new Date().getFullYear()),
  bedrooms: z.number().min(0).max(20),
  bathrooms: z.number().min(0).max(20),
  lotSize: z.number().min(0),
  propertyType: z.string(),
  condition: z.enum(['excellent', 'good', 'fair', 'poor']),
  recentRenovations: z.boolean(),
  additionalNotes: z.string().optional()
})

type PropertyFormData = z.infer<typeof propertySchema>

interface PropertyDetailsFormProps {
  initialData: any
  onSubmit: (data: PropertyFormData) => void
}

export default function PropertyDetailsForm({ initialData, onSubmit }: PropertyDetailsFormProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [hasUserEdited, setHasUserEdited] = useState(false)
  
  // Debug log
  console.log('PropertyDetailsForm initialData:', {
    assessedValue: initialData.assessedValue,
    dataSource: initialData.dataSource,
    lastSalePrice: initialData.lastSalePrice
  })
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    setValue
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      assessedValue: initialData.assessedValue || undefined,
      lastSalePrice: initialData.lastSalePrice || 0,
      lastSaleDate: initialData.lastSaleDate ? new Date(initialData.lastSaleDate).toISOString().split('T')[0] : '',
      squareFeet: initialData.squareFeet || 0,
      yearBuilt: initialData.yearBuilt || new Date().getFullYear(),
      bedrooms: initialData.bedrooms || 0,
      bathrooms: initialData.bathrooms || 0,
      lotSize: initialData.lotSize || 0,
      propertyType: initialData.propertyType || 'Single Family',
      condition: 'good',
      recentRenovations: false,
      additionalNotes: ''
    }
  })
  
  // Store original values to detect changes
  const [originalValues, setOriginalValues] = useState<any>(null)
  
  // Update form values when initialData changes
  useEffect(() => {
    const formData: any = {}
    
    if (initialData.assessedValue) {
      setValue('assessedValue', initialData.assessedValue)
      formData.assessedValue = initialData.assessedValue
    }
    if (initialData.lastSalePrice) {
      setValue('lastSalePrice', initialData.lastSalePrice)
      formData.lastSalePrice = initialData.lastSalePrice
    }
    if (initialData.lastSaleDate) {
      setValue('lastSaleDate', new Date(initialData.lastSaleDate).toISOString().split('T')[0])
      formData.lastSaleDate = new Date(initialData.lastSaleDate).toISOString().split('T')[0]
    }
    if (initialData.squareFeet) {
      setValue('squareFeet', initialData.squareFeet)
      formData.squareFeet = initialData.squareFeet
    }
    if (initialData.yearBuilt) {
      setValue('yearBuilt', initialData.yearBuilt)
      formData.yearBuilt = initialData.yearBuilt
    }
    if (initialData.bedrooms) {
      setValue('bedrooms', initialData.bedrooms)
      formData.bedrooms = initialData.bedrooms
    }
    if (initialData.bathrooms) {
      setValue('bathrooms', initialData.bathrooms)
      formData.bathrooms = initialData.bathrooms
    }
    if (initialData.lotSize) {
      setValue('lotSize', initialData.lotSize)
      formData.lotSize = initialData.lotSize
    }
    if (initialData.propertyType) {
      setValue('propertyType', initialData.propertyType)
      formData.propertyType = initialData.propertyType
    }
    
    // Store original values
    if (!originalValues) {
      setOriginalValues(formData)
    }
  }, [initialData, setValue, originalValues])
  
  // Watch for changes in property details
  const watchedFields = watch(['squareFeet', 'yearBuilt', 'bedrooms', 'bathrooms', 'lotSize', 'condition'])
  
  useEffect(() => {
    if (originalValues) {
      const currentValues = {
        squareFeet: watchedFields[0],
        yearBuilt: watchedFields[1],
        bedrooms: watchedFields[2],
        bathrooms: watchedFields[3],
        lotSize: watchedFields[4],
        condition: watchedFields[5]
      }
      
      // Check if any property detail has changed from original
      const hasChanged = 
        currentValues.squareFeet !== originalValues.squareFeet ||
        currentValues.yearBuilt !== originalValues.yearBuilt ||
        currentValues.bedrooms !== originalValues.bedrooms ||
        currentValues.bathrooms !== originalValues.bathrooms ||
        currentValues.lotSize !== originalValues.lotSize ||
        (currentValues.condition && currentValues.condition !== 'good')
      
      if (hasChanged && !hasUserEdited) {
        setHasUserEdited(true)
        setValue('recentRenovations', true)
        console.log('User edited property details - checking renovations box')
      }
    }
  }, [watchedFields, originalValues, hasUserEdited, setValue])

  const onFormSubmit = (data: PropertyFormData) => {
    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Property Address Card */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Home className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Property Address</h3>
          </div>
          {process.env.NODE_ENV === 'development' && initialData.dataSource && (
            <span className={`text-xs px-2 py-1 rounded-full ${
              initialData.dataSource === 'rentcast' ? 'bg-green-100 text-green-700' :
              initialData.dataSource === 'attom' ? 'bg-blue-100 text-blue-700' :
              initialData.dataSource === 'zillow' ? 'bg-purple-100 text-purple-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              Data: {initialData.dataSource === 'mock' ? 'Demo Mode' : initialData.dataSource.toUpperCase()}
            </span>
          )}
        </div>
        <p className="text-gray-700">{initialData.address}</p>
        {initialData.county && (
          <p className="text-sm text-gray-500 mt-1">
            {initialData.county} • Parcel: {initialData.parcelNumber || 'N/A'}
          </p>
        )}
        {initialData.owner && (
          <p className="text-sm text-gray-500 mt-1">
            Owner: {initialData.owner.names ? initialData.owner.names.join(', ') : initialData.owner.name || 'Not available'}
            {initialData.owner.type && ` (${initialData.owner.type})`}
          </p>
        )}
      </div>

      {/* Assessment Information */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center mb-4">
          <DollarSign className="w-5 h-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Assessment Information</h3>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Assessed Value *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                {...register('assessedValue', { valueAsNumber: true })}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>
            {errors.assessedValue && (
              <p className="mt-1 text-sm text-red-600">{errors.assessedValue.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Sale Price
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                {...register('lastSalePrice', { valueAsNumber: true })}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Sale Date
            </label>
            <input
              type="date"
              {...register('lastSaleDate')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Type *
            </label>
            <select
              {...register('propertyType')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            >
              <option value="Single Family">Single Family</option>
              <option value="Condo">Condo</option>
              <option value="Townhouse">Townhouse</option>
              <option value="Multi-Family">Multi-Family</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tax Assessment History */}
      {initialData.taxAssessmentHistory && Object.keys(initialData.taxAssessmentHistory).length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center mb-4">
            <DollarSign className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Tax Assessment History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Assessed Value</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Land Value</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Improvement Value</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(initialData.taxAssessmentHistory)
                  .sort(([yearA], [yearB]) => parseInt(yearB) - parseInt(yearA))
                  .slice(0, 5)
                  .map(([year, assessment]: [string, any]) => (
                    <tr key={year}>
                      <td className="px-4 py-2 text-sm text-gray-900">{year}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {assessment.value ? formatCurrency(assessment.value) : 'N/A'}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {assessment.land ? formatCurrency(assessment.land) : 'N/A'}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {assessment.improvements ? formatCurrency(assessment.improvements) : 'N/A'}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sale History */}
      {initialData.saleHistory && Object.keys(initialData.saleHistory).length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center mb-4">
            <Calendar className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Sale History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Sale Price</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price/Sqft</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(initialData.saleHistory)
                  .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
                  .slice(0, 5)
                  .map(([date, sale]: [string, any]) => (
                    <tr key={date}>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {new Date(sale.date || date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {sale.price ? formatCurrency(sale.price) : 'N/A'}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {sale.price && initialData.squareFeet 
                          ? formatCurrency(sale.price / initialData.squareFeet)
                          : 'N/A'}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Property Details */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center mb-4">
          <Square className="w-5 h-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Property Details</h3>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Square Feet *
            </label>
            <input
              type="number"
              {...register('squareFeet', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
            {errors.squareFeet && (
              <p className="mt-1 text-sm text-red-600">{errors.squareFeet.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Year Built *
            </label>
            <input
              type="number"
              {...register('yearBuilt', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
            {errors.yearBuilt && (
              <p className="mt-1 text-sm text-red-600">{errors.yearBuilt.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lot Size (sq ft)
            </label>
            <input
              type="number"
              {...register('lotSize', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bedrooms *
            </label>
            <input
              type="number"
              {...register('bedrooms', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bathrooms *
            </label>
            <input
              type="number"
              step="0.5"
              {...register('bathrooms', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Condition *
            </label>
            <select
              {...register('condition')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            >
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
            </select>
          </div>
        </div>

        <div className="mt-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              {...register('recentRenovations')}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">
              Recent renovations or improvements (last 5 years)
            </span>
          </label>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes (Optional)
          </label>
          <textarea
            {...register('additionalNotes')}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            placeholder="Any additional information that might affect your property value..."
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          Analyze Assessment
        </button>
      </div>

      {/* DEBUG: Raw Data Display (Remove in Production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6 mt-6">
          <div className="flex items-center mb-4">
            <Info className="w-5 h-5 text-yellow-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Debug: Raw API Data</h3>
          </div>
          <div className="space-y-2 text-sm">
            <p className="text-gray-700">
              <strong>Data Source:</strong> {initialData.dataSource || 'Unknown'}
            </p>
            <p className="text-gray-700">
              <strong>Assessed Value:</strong> {initialData.assessedValue || 'NULL'}
            </p>
            <p className="text-gray-700">
              <strong>Market Value:</strong> {initialData.marketValue || 'NULL'}
            </p>
            <p className="text-gray-700">
              <strong>Last Sale Price:</strong> {initialData.lastSalePrice || 'NULL'}
            </p>
            <p className="text-gray-700">
              <strong>Last Sale Date:</strong> {initialData.lastSaleDate || 'NULL'}
            </p>
            <p className="text-gray-700">
              <strong>Square Feet:</strong> {initialData.squareFeet || 'NULL'}
            </p>
            <p className="text-gray-700">
              <strong>Year Built:</strong> {initialData.yearBuilt || 'NULL'}
            </p>
            <p className="text-gray-700">
              <strong>Bedrooms:</strong> {initialData.bedrooms || 'NULL'}
            </p>
            <p className="text-gray-700">
              <strong>Bathrooms:</strong> {initialData.bathrooms || 'NULL'}
            </p>
            <p className="text-gray-700">
              <strong>Lot Size:</strong> {initialData.lotSize || 'NULL'}
            </p>
            <p className="text-gray-700">
              <strong>Property Type:</strong> {initialData.propertyType || 'NULL'}
            </p>
            <p className="text-gray-700">
              <strong>County:</strong> {initialData.county || 'NULL'}
            </p>
            <p className="text-gray-700">
              <strong>Parcel Number:</strong> {initialData.parcelNumber || 'NULL'}
            </p>
            
            {/* Show API errors if any */}
            {initialData.apiError && (
              <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                <p className="text-sm text-red-700">
                  <strong>API Error:</strong> {initialData.apiError}
                </p>
              </div>
            )}
            
            {/* Show raw data if available - development only */}
            {process.env.NODE_ENV === 'development' && initialData.rawData && (
              <details className="mt-4">
                <summary className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium">
                  Click to see full raw RentCast response
                </summary>
                <pre className="mt-2 p-4 bg-gray-100 rounded-lg overflow-x-auto text-xs">
                  {JSON.stringify(initialData.rawData, null, 2)}
                </pre>
              </details>
            )}
          </div>
        </div>
      )}
    </form>
  )
}