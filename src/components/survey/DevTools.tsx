"use client"

import { useEffect, useState } from "react"
import { Settings, Zap, X, ChevronUp, ChevronDown } from "lucide-react"

interface DevToolsProps {
  onAutoFill?: () => void
  skipValidation?: boolean
  onSkipValidationChange?: (skip: boolean) => void
}

export function DevTools({ onAutoFill, skipValidation, onSkipValidationChange }: DevToolsProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [internalSkipValidation, setInternalSkipValidation] = useState(
    process.env.NODE_ENV !== "production"
  )

  const isControlled = typeof skipValidation === "boolean"
  const effectiveSkipValidation = isControlled ? skipValidation : internalSkipValidation

  useEffect(() => {
    if (isControlled) {
      setInternalSkipValidation(skipValidation)
    }
  }, [isControlled, skipValidation])

  // 프로덕션 환경에서는 렌더링하지 않음
  if (process.env.NODE_ENV === "production") {
    return null
  }

  const handleSkipToggle = () => {
    const newSkipState = !effectiveSkipValidation
    if (!isControlled) {
      setInternalSkipValidation(newSkipState)
    }
    onSkipValidationChange?.(newSkipState)
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <div className="rounded-lg border-2 border-purple-500 bg-white shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-purple-200 bg-purple-50 px-4 py-3">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-purple-600" />
              <span className="font-bold text-purple-900">개발자 도구</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded p-1 text-purple-600 hover:bg-purple-100"
              aria-label="닫기"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-3 p-4">
            {/* Auto Fill Button */}
            {onAutoFill && (
              <button
                onClick={onAutoFill}
                className="flex w-full items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-3 text-sm font-semibold text-white transition-all hover:from-purple-700 hover:to-purple-800"
              >
                <Zap className="h-4 w-4" />
                <span>자동 채우기</span>
              </button>
            )}

            {/* Skip Validation Toggle */}
            {onSkipValidationChange && (
              <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                <span className="text-sm font-medium text-gray-700">검증 스킵</span>
                <button
                  onClick={handleSkipToggle}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    effectiveSkipValidation ? "bg-purple-600" : "bg-gray-300"
                  }`}
                  aria-label="검증 스킵 토글"
                >
                  <div
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                      effectiveSkipValidation ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            )}

            {/* Info */}
            <div className="rounded-lg bg-amber-50 px-3 py-2">
              <p className="text-xs text-amber-900">⚠️ 개발 환경에서만 표시됩니다</p>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 rounded-full bg-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-purple-700 hover:shadow-xl"
          aria-label="개발자 도구 열기"
        >
          <Settings className="h-5 w-5" />
          <span>개발자 도구</span>
          <ChevronUp className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
