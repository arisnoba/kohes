"use client"

import { useState } from "react"

interface QuestionTextareaProps {
  id: string
  label: string
  placeholder?: string
  required?: boolean
  value?: string
  onChange?: (value: string) => void
  rows?: number
}

export function QuestionTextarea({
  id,
  label,
  placeholder,
  required = false,
  value = "",
  onChange,
  rows = 5,
}: QuestionTextareaProps) {
  const [inputValue, setInputValue] = useState(value)

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    onChange?.(newValue)
  }

  return (
    <div className="space-y-4">
      <label htmlFor={id} className="block text-2xl font-semibold text-gray-900 leading-snug">
        {label}
        {required && <sup className="ml-0.5 text-red-500">*</sup>}
      </label>

      <textarea
        id={id}
        value={inputValue}
        onChange={handleChange}
        placeholder={placeholder}
        rows={rows}
        className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-base text-gray-900 transition-colors placeholder:text-gray-400 focus:border-blue-600 focus:outline-none focus:ring-0"
      />
    </div>
  )
}
