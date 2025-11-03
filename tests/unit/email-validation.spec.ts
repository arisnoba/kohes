import { describe, it, expect } from "vitest"

// RFC 5322 compliant email validation (practical subset)
// Prevents consecutive dots, leading/trailing dots in local and domain parts
const emailRegex = /^[a-zA-Z0-9_%+-]+(\.[a-zA-Z0-9_%+-]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/

const validateEmail = (value: string): boolean => {
  return emailRegex.test(value)
}

describe("Email Validation", () => {
  describe("Valid emails", () => {
    it("should accept standard email format", () => {
      expect(validateEmail("test@example.com")).toBe(true)
      expect(validateEmail("user@test.co.kr")).toBe(true)
      expect(validateEmail("admin@company.org")).toBe(true)
    })

    it("should accept emails with dots in local part", () => {
      expect(validateEmail("user.name@example.com")).toBe(true)
      expect(validateEmail("first.last@test.com")).toBe(true)
    })

    it("should accept emails with plus signs", () => {
      expect(validateEmail("user+tag@example.com")).toBe(true)
      expect(validateEmail("test+filter@domain.com")).toBe(true)
    })

    it("should accept emails with underscores and hyphens", () => {
      expect(validateEmail("user_name@example.com")).toBe(true)
      expect(validateEmail("user-name@example.com")).toBe(true)
    })

    it("should accept emails with subdomains", () => {
      expect(validateEmail("user@mail.example.com")).toBe(true)
      expect(validateEmail("admin@sub.domain.co.kr")).toBe(true)
    })

    it("should accept emails with numbers", () => {
      expect(validateEmail("user123@example.com")).toBe(true)
      expect(validateEmail("123user@test456.com")).toBe(true)
    })
  })

  describe("Invalid emails", () => {
    it("should reject emails without @", () => {
      expect(validateEmail("userexample.com")).toBe(false)
      expect(validateEmail("user.example.com")).toBe(false)
    })

    it("should reject emails without local part", () => {
      expect(validateEmail("@example.com")).toBe(false)
    })

    it("should reject emails without domain", () => {
      expect(validateEmail("user@")).toBe(false)
    })

    it("should reject emails without TLD", () => {
      expect(validateEmail("user@example")).toBe(false)
      expect(validateEmail("user@example.")).toBe(false)
    })

    it("should reject emails with spaces", () => {
      expect(validateEmail("user @example.com")).toBe(false)
      expect(validateEmail("user@ example.com")).toBe(false)
      expect(validateEmail("user@example .com")).toBe(false)
    })

    it("should reject emails with invalid characters", () => {
      expect(validateEmail("user#name@example.com")).toBe(false)
      expect(validateEmail("user$name@example.com")).toBe(false)
      expect(validateEmail("user*name@example.com")).toBe(false)
    })

    it("should reject emails with consecutive dots", () => {
      expect(validateEmail("user..name@example.com")).toBe(false)
      expect(validateEmail("user@example..com")).toBe(false)
    })

    it("should reject emails starting/ending with dot", () => {
      expect(validateEmail(".user@example.com")).toBe(false)
      expect(validateEmail("user.@example.com")).toBe(false)
      expect(validateEmail("user@.example.com")).toBe(false)
    })

    it("should reject empty string", () => {
      expect(validateEmail("")).toBe(false)
    })

    it("should reject single character TLD", () => {
      expect(validateEmail("user@example.c")).toBe(false)
    })
  })

  describe("Edge cases", () => {
    it("should accept very long but valid emails", () => {
      expect(validateEmail("verylongemailaddress123456789@verylongdomainname123456789.com")).toBe(
        true,
      )
    })

    it("should accept minimum valid email", () => {
      expect(validateEmail("a@b.co")).toBe(true)
    })

    it("should reject numeric-only TLD", () => {
      expect(validateEmail("user@example.123")).toBe(false)
    })
  })
})
