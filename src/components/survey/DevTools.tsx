"use client"

import { useState, useEffect } from "react"
import { Settings, Zap, X, ChevronUp, ChevronDown } from "lucide-react"

interface DevToolsProps {
  onAutoFill?: () => void
  onSkipValidation?: (skip: boolean) => void
}

export function DevTools({ onAutoFill, onSkipValidation }: DevToolsProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [skipValidation, setSkipValidation] = useState(true)

  // 컴포넌트 마운트 시 검증 스킵 상태를 부모 컴포넌트에 알림
  useEffect(() => {
    onSkipValidation?.(true)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // 프로덕션 환경에서는 렌더링하지 않음
  if (process.env.NODE_ENV === "production") {
    return null
  }

  const handleSkipToggle = () => {
    const newSkipState = !skipValidation
    setSkipValidation(newSkipState)
    onSkipValidation?.(newSkipState)
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
            {onSkipValidation && (
              <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                <span className="text-sm font-medium text-gray-700">검증 스킵</span>
                <button
                  onClick={handleSkipToggle}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    skipValidation ? "bg-purple-600" : "bg-gray-300"
                  }`}
                  aria-label="검증 스킵 토글"
                >
                  <div
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                      skipValidation ? "translate-x-5" : "translate-x-0.5"
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
