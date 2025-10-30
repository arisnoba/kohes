"use client"

import { useState, useEffect } from "react"

interface QuestionRankChoiceProps {
  id: string
  label: string
  options: { value: string; label: string }[]
  required?: boolean
  maxRanks: number // 선택할 순위 개수 (예: 9, 8)
  value?: string[]
  onChange?: (value: string[]) => void
  otherValue?: string
  onOtherChange?: (value: string) => void
}

export function QuestionRankChoice({
  id,
  label,
  options,
  required = false,
  maxRanks,
  value = [],
  onChange,
  otherValue = "",
  onOtherChange,
}: QuestionRankChoiceProps) {
  const [rankedItems, setRankedItems] = useState<string[]>(value)
  const [otherText, setOtherText] = useState(otherValue)

  useEffect(() => {
    setRankedItems(value)
  }, [value])

  useEffect(() => {
    setOtherText(otherValue)
  }, [otherValue])

  const handleSelect = (optionValue: string) => {
    let newRanked: string[]

    if (rankedItems.includes(optionValue)) {
      // 이미 선택된 항목을 클릭하면 제거
      newRanked = rankedItems.filter((item) => item !== optionValue)

      // 기타 옵션을 모두 제거하면 기타 입력 초기화
      if (optionValue === "기타" && !newRanked.includes("기타")) {
        setOtherText("")
        onOtherChange?.("")
      }
    } else {
      // 새 항목 추가 (중복 선택 허용)
      newRanked = [...rankedItems, optionValue]
    }

    setRankedItems(newRanked)
    onChange?.(newRanked)
  }

  const handleOtherChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setOtherText(newValue)
    onOtherChange?.(newValue)
  }

  const getRankNumber = (optionValue: string) => {
    // 같은 값이 여러 번 선택된 경우 모든 순위 찾기
    const indices: number[] = []
    rankedItems.forEach((item, index) => {
      if (item === optionValue) {
        indices.push(index + 1)
      }
    })
    return indices
  }

  const isSelected = (optionValue: string) => {
    return rankedItems.includes(optionValue)
  }

  return (
    <div className="space-y-4" id={id}>
      <div>
        <label className="block text-2xl font-semibold text-gray-900 leading-snug">
          {label}
          {required && <sup className="ml-0.5 text-red-500">*</sup>}
        </label>
        <p className="mt-2 text-sm text-gray-500">
          {maxRanks}개 항목을 순서대로 선택해주세요 (중복 선택 가능)
        </p>
      </div>

      {/* 옵션 선택 */}
      <div className="space-y-2">
        <p className="mt-1 text-sm font-medium text-blue-600">
          현재 {rankedItems.length}/{maxRanks}개 선택됨
        </p>
        {options.map((option) => {
          const selected = isSelected(option.value)
          const rankNumbers = getRankNumber(option.value)
          const isOtherOption = option.value === "기타"

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              disabled={rankedItems.length >= maxRanks && !selected}
              className={`w-full rounded-lg border-2 px-4 py-4 text-left text-base transition-all disabled:cursor-not-allowed disabled:opacity-50 ${selected
                  ? "border-blue-600 bg-blue-50 text-blue-900"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                }`}
            >
              <div className="flex items-center gap-3">
                {rankNumbers.length > 0 && (
                  <div className="flex gap-1">
                    {rankNumbers.map((rank, idx) => (
                      <span
                        key={idx}
                        className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white"
                      >
                        {rank}
                      </span>
                    ))}
                  </div>
                )}
                <span className="font-medium">{option.label}</span>
              </div>

              {/* 기타 입력 필드 - 버튼 내부 */}
              {isOtherOption && selected && (
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
          )
        })}
      </div>
    </div>
  )
}
