"use client"

import { motion } from 'framer-motion'

interface ViabilityMeterProps {
  value: number // 0-100
  viability: 'high' | 'medium' | 'low' | 'none'
}

export default function ViabilityMeter({ value, viability }: ViabilityMeterProps) {
  const getColor = () => {
    if (value >= 80) return '#10b981' // green
    if (value >= 60) return '#f59e0b' // yellow
    if (value >= 40) return '#fb923c' // orange
    return '#ef4444' // red
  }

  const radius = 60
  const strokeWidth = 8
  const normalizedRadius = radius - strokeWidth * 2
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDashoffset = circumference - (value / 100) * circumference

  return (
    <div className="relative">
      <svg
        height={radius * 2}
        width={radius * 2}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          stroke="#e5e7eb"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        
        {/* Progress circle */}
        <motion.circle
          stroke={getColor()}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference + ' ' + circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeOut" }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          strokeLinecap="round"
        />
      </svg>
      
      {/* Center text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-3xl font-bold" style={{ color: getColor() }}>
            {value}%
          </div>
          <div className="text-xs text-gray-600 uppercase">
            {viability}
          </div>
        </div>
      </div>
    </div>
  )
}