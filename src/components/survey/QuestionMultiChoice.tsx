"use client"

import { useState, useEffect, ReactNode } from "react"
import { Check } from "lucide-react"

interface QuestionMultiChoiceProps {
  id: string
  label: string
  /** label 아래에 표시될 설명 (JSX 또는 HTML 문자열 지원) */
  description?: ReactNode | string
  options: { value: string; label: string }[]
  required?: boolean
  value?: string[]
  onChange?: (value: string[]) => void
  otherValue?: string
  onOtherChange?: (value: string) => void
}

export function QuestionMultiChoice({
  id,
  label,
  description,
  options,
  required = false,
  value = [],
  onChange,
  otherValue = "",
  onOtherChange,
}: QuestionMultiChoiceProps) {
  const [selectedValues, setSelectedValues] = useState<string[]>(value)
  const [otherText, setOtherText] = useState(otherValue)

  // value prop이 변경되면 selectedValues 업데이트
  useEffect(() => {
    setSelectedValues(value)
  }, [value])

  // otherValue prop이 변경되면 otherText 업데이트
  useEffect(() => {
    setOtherText(otherValue)
  }, [otherValue])

  const handleToggle = (optionValue: string) => {
    const newValues = selectedValues.includes(optionValue)
      ? selectedValues.filter((v) => v !== optionValue)
      : [...selectedValues, optionValue]

    setSelectedValues(newValues)
    onChange?.(newValues)

    // 기타 또는 그 외 국제의료사업을 선택 해제하면 기타 입력 초기화
    if (
      (optionValue === "기타" || optionValue === "그 외 국제의료사업") &&
      selectedValues.includes(optionValue)
    ) {
      setOtherText("")
      onOtherChange?.("")
    }
  }

  const handleOtherChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setOtherText(newValue)
    onOtherChange?.(newValue)
  }

  return (
    <div className="space-y-4" id={id}>
      <div>
        <label className="block text-xl md:text-2xl font-semibold text-gray-900 leading-snug">
          {label}
          {required && <sup className="ml-0.5 text-red-500">*</sup>}
        </label>
        {description && (
          <div className="mt-1 text-base leading-relaxed">
            {typeof description === "string" ? (
              <div dangerouslySetInnerHTML={{ __html: description }} />
            ) : (
              description
            )}
          </div>
        )}
        <p className="mt-2 text-sm text-gray-500">복수 선택 가능</p>
      </div>

      <div className="space-y-2">
        {options.map((option) => {
          const isOtherOption = option.value === "기타" || option.value === "그 외 국제의료사업"
          const isSelected = selectedValues.includes(option.value)

          return (
            <div
              key={option.value}
              className={`overflow-hidden rounded-lg border-2 transition-colors ${
                isSelected
                  ? "border-blue-600 bg-blue-50 text-blue-900"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
              }`}
            >
              <button
                type="button"
                onClick={() => handleToggle(option.value)}
                className="w-full px-4 py-4 text-left text-base transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-all ${
                      isSelected ? "border-blue-600 bg-blue-600" : "border-gray-300"
                    }`}
                  >
                    {isSelected && <Check className="h-4 w-4 text-white" strokeWidth={3} />}
                  </div>
                  <span className="font-medium">{option.label}</span>
                </div>
              </button>

              {/* 기타 또는 그 외 국제의료사업 입력 필드 - 버튼 외부 */}
              {isOtherOption && isSelected && (
                <div className="px-4 pb-4">
                  <input
                    aria-label={`${option.label} 내용`}
                    type="text"
                    value={otherText}
                    onChange={handleOtherChange}
                    placeholder={
                      option.value === "그 외 국제의료사업"
                        ? "그 외 국제의료사업 내용을 입력해주세요"
                        : "기타 내용을 입력해주세요"
                    }
                    className="w-full border-0 border-b-2 border-blue-300 bg-transparent rounded-none px-0 py-2 text-base text-gray-900 placeholder:text-blue-400 focus:border-blue-600 focus:outline-none focus:ring-0"
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
