"use client"

import { ReactNode } from "react"
import { ChevronLeft } from "lucide-react"

interface SurveyLayoutProps {
  children: ReactNode
  currentStep: number
  totalSteps: number
  onBack?: () => void
  showBackButton?: boolean
}

export function SurveyLayout({
  children,
  currentStep,
  totalSteps,
  onBack,
  showBackButton = true,
}: SurveyLayoutProps) {
  const progress = (currentStep / totalSteps) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Progress Bar */}
      <div className="fixed left-0 right-0 top-0 z-50 h-1 bg-gray-200">
        <div
          className="h-full bg-blue-600 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Header with Back Button */}
      {showBackButton && (
        <div className="fixed left-0 right-0 top-1 z-40 bg-gradient-to-b from-white/80 to-transparent backdrop-blur-sm">
          <div className="mx-auto max-w-2xl px-4 py-4 flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-gray-900"
              aria-label="이전으로"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>이전</span>
            </button>
            {/* Step Counter */}
            <div className="text-center text-sm text-gray-500">
              {currentStep} / {totalSteps}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="mx-auto max-w-2xl px-4 py-20 pb-32">
        {/* Content Area */}
        <div className="min-h-[60vh]">{children}</div>
      </div>

      {/* Footer Spacing */}
      <div className="h-20" />
    </div>
  )
}
