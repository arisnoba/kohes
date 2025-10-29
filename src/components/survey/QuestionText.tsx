"use client"

import { useState } from "react"

interface QuestionTextProps {
  id: string
  label: string
  placeholder?: string
  required?: boolean
  type?: "text" | "email" | "tel"
  value?: string
  onChange?: (value: string) => void
}

export function QuestionText({
  id,
  label,
  placeholder,
  required = false,
  type = "text",
  value = "",
  onChange,
}: QuestionTextProps) {
  const [inputValue, setInputValue] = useState(value)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    onChange?.(newValue)
  }

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-2xl font-semibold text-gray-900 leading-normal">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <input
        id={id}
        type={type}
        value={inputValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full border-0 border-b-2 border-gray-300 bg-transparent px-0 py-3 text-lg transition-colors placeholder:text-gray-400 focus:border-blue-600 focus:outline-none focus:ring-0"
        required={required}
      />
    </div>
  )
}
