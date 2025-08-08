'use client'

import { useState, useEffect } from 'react'
import { Database, RefreshCw, Trash2, CheckCircle, XCircle } from 'lucide-react'

export default function CachePage() {
  const [cacheStats, setCacheStats] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)

  const fetchCacheStats = async () => {
    try {
      const response = await fetch('/api/admin/cache')
      const data = await response.json()
      setCacheStats(data)
    } catch (error) {
      console.error('Error fetching cache stats:', error)
    }
  }

  const testPropertyAPI = async () => {
    setLoading(true)
    try {
      const testAddress = '456 Oak Street, Los Angeles, CA 90012'
      const response = await fetch(`/api/property?address=${encodeURIComponent(testAddress)}&lat=34.0522&lng=-118.2437`)
      const data = await response.json()
      setTestResult(data)
    } catch (error) {
      console.error('Error testing API:', error)
      setTestResult({ error: 'Failed to test API' })
    }
    setLoading(false)
  }

  const clearExpiredCache = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/cache', {
        method: 'DELETE'
      })
      const data = await response.json()
      alert(data.message || 'Cache cleared')
      fetchCacheStats()
    } catch (error) {
      console.error('Error clearing cache:', error)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchCacheStats()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Database className="w-6 h-6 text-blue-600 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">Property Data Cache</h1>
            </div>
            <button
              onClick={fetchCacheStats}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>

          {cacheStats && (
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Total Entries</div>
                <div className="text-2xl font-bold text-gray-900">{cacheStats.totalEntries}</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-sm text-green-600 mb-1">Valid Entries</div>
                <div className="text-2xl font-bold text-green-900">{cacheStats.validEntries}</div>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <div className="text-sm text-red-600 mb-1">Expired Entries</div>
                <div className="text-2xl font-bold text-red-900">{cacheStats.expiredEntries}</div>
              </div>
            </div>
          )}

          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">API Configuration</h2>
            <div className="space-y-2">
              <div className="flex items-center">
                {cacheStats?.environment?.hasRentCastKey ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600 mr-2" />
                )}
                <span className="text-sm text-gray-700">
                  RentCast API: {cacheStats?.environment?.hasRentCastKey ? 'Configured' : 'Not configured'}
                </span>
              </div>
              <div className="flex items-center">
                {cacheStats?.environment?.hasAttomKey ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600 mr-2" />
                )}
                <span className="text-sm text-gray-700">
                  ATTOM API: {cacheStats?.environment?.hasAttomKey ? 'Configured' : 'Not configured'}
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-gray-700">
                  Cache Duration: {cacheStats?.environment?.cacheExpiration || '30'} days
                </span>
              </div>
            </div>
          </div>

          <div className="border-t pt-6 flex gap-4">
            <button
              onClick={testPropertyAPI}
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              Test Property API
            </button>
            <button
              onClick={clearExpiredCache}
              disabled={loading}
              className="flex items-center px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Expired Cache
            </button>
          </div>
        </div>

        {testResult && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Result</h3>
            <pre className="bg-gray-100 rounded-lg p-4 overflow-x-auto text-sm">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}

        {cacheStats?.recentEntries && (
          <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Cache Entries</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data Source
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cached At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cacheStats.recentEntries.map((entry: any, index: number) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entry.address}, {entry.city}, {entry.state} {entry.zip_code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          entry.data_source === 'rentcast' ? 'bg-green-100 text-green-700' :
                          entry.data_source === 'attom' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {entry.data_source}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(entry.updated_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {entry.is_valid ? (
                          <span className="text-green-600">Valid</span>
                        ) : (
                          <span className="text-red-600">Expired</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}