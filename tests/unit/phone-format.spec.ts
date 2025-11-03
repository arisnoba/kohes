import { describe, expect, it } from "vitest"

import {
  formatLandlineNumber,
  formatMobileNumber,
} from "../../src/lib/validation/phone"

describe("formatLandlineNumber", () => {
  it("keeps partial Seoul numbers without duplicating digits", () => {
    expect(formatLandlineNumber("021234")).toBe("02-1234")
  })

  it("formats full Seoul numbers with correct groups", () => {
    expect(formatLandlineNumber("02-1234-5678")).toBe("02-1234-5678")
  })

  it("formats regional numbers with proper grouping", () => {
    expect(formatLandlineNumber("0311234567")).toBe("031-123-4567")
  })
})

describe("formatMobileNumber", () => {
  it("groups mobile numbers after the third digit", () => {
    expect(formatMobileNumber("01012345678")).toBe("010-1234-5678")
  })

  it("returns partial mobile numbers without separators when short", () => {
    expect(formatMobileNumber("010")).toBe("010")
  })
})
