"use client"

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import AssessmentFlow from '@/components/assessment/AssessmentFlow'

function AssessmentContent() {
  const searchParams = useSearchParams()
  const address = searchParams.get('address') || ''
  const lat = parseFloat(searchParams.get('lat') || '0')
  const lng = parseFloat(searchParams.get('lng') || '0')

  return (
    <AssessmentFlow 
      initialAddress={address}
      latitude={lat}
      longitude={lng}
    />
  )
}

export default function AssessmentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading assessment...</p>
        </div>
      </div>
    }>
      <AssessmentContent />
    </Suspense>
  )
}