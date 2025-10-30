"use client"

import { useState, useEffect } from "react"

interface QuestionTextProps {
  id: string
  label: string
  placeholder?: string
  required?: boolean
  type?: "text" | "email" | "tel"
  value?: string
  onChange?: (value: string) => void
  error?: string
  validate?: (value: string) => string | null
}

export function QuestionText({
  id,
  label,
  placeholder,
  required = false,
  type = "text",
  value = "",
  onChange,
  error,
  validate,
}: QuestionTextProps) {
  const [inputValue, setInputValue] = useState(value)
  const [touched, setTouched] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  useEffect(() => {
    setInputValue(value)
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    onChange?.(newValue)

    if (touched && validate) {
      setValidationError(validate(newValue))
    }
  }

  const handleBlur = () => {
    setTouched(true)
    if (validate) {
      setValidationError(validate(inputValue))
    }
  }

  const displayError = error || validationError
  const hasError = (touched || error) && displayError

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-2xl font-semibold text-gray-900 leading-snug">
        {label}
        {required && <sup className="ml-0.5 text-red-500">*</sup>}
      </label>

      <input
        id={id}
        type={type}
        value={inputValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={`w-full border-0 border-b-2 bg-transparent px-0 py-3 text-lg transition-colors placeholder:text-gray-400 focus:outline-none focus:ring-0 ${hasError
          ? "border-red-500 focus:border-red-600"
          : "border-gray-300 focus:border-blue-600"
          }`}
        required={required}
      />

      {hasError && <p className="text-sm text-red-600">{displayError}</p>}
    </div>
  )
}
