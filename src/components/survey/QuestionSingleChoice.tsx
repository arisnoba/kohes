"use client"

import { useState, useEffect, ReactNode } from "react"

interface QuestionSingleChoiceProps {
  id: string
  label: string
  /** label 아래에 표시될 설명 (JSX 또는 HTML 문자열 지원) */
  description?: ReactNode | string
  options: { value: string; label: string }[]
  required?: boolean
  value?: string
  onChange?: (value: string) => void
  otherValue?: string
  onOtherChange?: (value: string) => void
  /** "기타" 옵션 선택 시 추가 입력 필드를 표시하지 않음 */
  disableOtherInput?: boolean
}

export function QuestionSingleChoice({
  id,
  label,
  description,
  options,
  required = false,
  value = "",
  onChange,
  otherValue = "",
  onOtherChange,
  disableOtherInput = false,
}: QuestionSingleChoiceProps) {
  const [selectedValue, setSelectedValue] = useState(value)
  const [otherText, setOtherText] = useState(otherValue)

  // value prop이 변경되면 selectedValue 업데이트
  useEffect(() => {
    setSelectedValue(value)
  }, [value])

  // otherValue prop이 변경되면 otherText 업데이트
  useEffect(() => {
    setOtherText(otherValue)
  }, [otherValue])

  const handleSelect = (optionValue: string) => {
    setSelectedValue(optionValue)
    onChange?.(optionValue)

    // 기타가 아닌 다른 옵션 선택 시 기타 입력 초기화
    if (optionValue !== "기타") {
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
    <div id={id} className="space-y-4" role="group" aria-labelledby={`${id}-label`}>
      <div>
        <div id={`${id}-label`} className="block text-2xl font-semibold text-gray-900 leading-relaxed">
          {label}
          {required && <sup className="ml-0.5 text-red-500">*</sup>}
        </div>
        {description && (
          <div className="mt-1 text-base leading-relaxed">
            {typeof description === "string" ? (
              <div dangerouslySetInnerHTML={{ __html: description }} />
            ) : (
              description
            )}
          </div>
        )}
      </div>

      <div className="space-y-2">
        {options.map((option) => {
          const isOtherOption = option.value === "기타"
          const isSelected = selectedValue === option.value

          return (
            <div key={option.value}>
              <button
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`w-full rounded-lg border-2 px-4 py-4 text-left text-base transition-all ${isSelected
                  ? "border-blue-600 bg-blue-50 text-blue-900"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-5 w-5 rounded-full border-2 transition-all ${isSelected ? "border-blue-600 bg-blue-600" : "border-gray-300"
                      }`}
                  >
                    {isSelected && (
                      <div className="flex h-full items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-white" />
                      </div>
                    )}
                  </div>
                  <span className="font-medium">{option.label}</span>
                </div>

                {/* 기타 입력 필드 - 버튼 내부 */}
                {isOtherOption && isSelected && !disableOtherInput && (
                  <div className="mt-4 pt-2 border-blue-300">
                    <input
                      type="text"
                      value={otherText}
                      onChange={handleOtherChange}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="기타 내용을 입력해주세요"
                      className="w-full border-0 border-b-2 border-blue-300 bg-transparent px-0 py-2 text-base text-gray-900 placeholder:text-blue-400 focus:border-blue-600 focus:outline-none focus:ring-0"
                    />
                  </div>
                )}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
