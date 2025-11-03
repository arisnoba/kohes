export const telRegex = /^(?:0\d{1,2})-?\d{3,4}-?\d{4}$/
export const mobileRegex = /^01[016789]-?\d{3,4}-?\d{4}$/
export const MAX_PHONE_LENGTH = 13

export function formatLandlineNumber(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11)
  if (digits.length === 0) return ""

  const isSeoul = digits.startsWith("02")
  const areaLength = isSeoul ? 2 : 3

  // 지역번호만 입력된 경우
  if (digits.length <= areaLength) {
    return digits
  }

  const area = digits.slice(0, areaLength)
  const rest = digits.slice(areaLength)

  // 중간번호만 입력 중인 경우 (7~8자리 미만)
  if (rest.length <= 4) {
    return `${area}-${rest}`
  }

  // 중간번호 + 끝번호 (7~8자리 이상)
  // 중간번호는 3~4자리, 끝번호는 항상 4자리
  const middleLength = rest.length - 4
  return `${area}-${rest.slice(0, middleLength)}-${rest.slice(-4)}`
}

export function formatMobileNumber(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11)
  if (digits.length === 0) return ""

  if (digits.length <= 3) {
    return digits
  }

  if (digits.length <= 7) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`
  }

  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
}
