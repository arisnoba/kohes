import type { AdminResponseSummary } from "@/lib/supabase/responses"

interface ResponseDetailViewProps {
  response: AdminResponseSummary
}

export function ResponseDetailView({ response }: ResponseDetailViewProps) {
  const { responseData, piiData } = response

  if (!responseData) {
    return <div className="text-sm text-muted-foreground">응답 데이터가 없습니다.</div>
  }

  return (
    <div className="space-y-6">
      {/* Basic Info Section */}
      <section className="space-y-3">
        <h4 className="text-sm font-semibold">기본 정보</h4>
        <div className="grid gap-3 sm:grid-cols-2">
          <DetailItem label="성명" value={maskPII(piiData, "name")} sensitive />
          <DetailItem label="직책" value={extractValue(responseData, ["basicInfo", "position"])} />
          <DetailItem label="연락처 (Tel)" value={maskPII(piiData, "tel")} sensitive />
          <DetailItem label="연락처 (Mobile)" value={maskPII(piiData, "mobile")} sensitive />
          <DetailItem label="이메일" value={maskPII(piiData, "email")} sensitive />
          <DetailItem label="주소" value={maskPII(piiData, "address")} sensitive />
        </div>
      </section>

      {/* Expansion Info Section */}
      {responseData.expansionInfo != null && (
        <section className="space-y-3">
          <h4 className="text-sm font-semibold">A. 기관 유형</h4>
          <div className="grid gap-3 sm:grid-cols-2">
            <DetailItem
              label="A1. 기관 유형"
              value={extractValue(responseData, ["expansionInfo", "orgType"])}
            />
            {extractValue(responseData, ["expansionInfo", "medicalOrgName"]) && (
              <>
                <DetailItem
                  label="A2. 의료기관명"
                  value={extractValue(responseData, ["expansionInfo", "medicalOrgName"])}
                />
                <DetailItem
                  label="A2. 의료기관 종류"
                  value={extractValue(responseData, ["expansionInfo", "medicalOrgCategory"])}
                />
                <DetailItem
                  label="A2. 설립 형태"
                  value={extractValue(responseData, ["expansionInfo", "foundationType"])}
                />
                {extractValue(responseData, ["expansionInfo", "legalType"]) && (
                  <DetailItem
                    label="A2. 법인 유형"
                    value={extractValue(responseData, ["expansionInfo", "legalType"])}
                  />
                )}
              </>
            )}
            {extractValue(responseData, ["expansionInfo", "companyName"]) && (
              <>
                <DetailItem
                  label="A3. 회사명"
                  value={extractValue(responseData, ["expansionInfo", "companyName"])}
                />
                <DetailItem
                  label="A3. 회사 유형"
                  value={extractValue(responseData, ["expansionInfo", "companyCategory"])}
                />
              </>
            )}
          </div>
        </section>
      )}

      {/* Project Details Section */}
      {responseData.projectDetails != null && (
        <section className="space-y-3">
          <h4 className="text-sm font-semibold">B. 프로젝트 세부사항</h4>
          <div className="grid gap-3 sm:grid-cols-2">
            <DetailItem
              label="B1. 진출 시기"
              value={extractValue(responseData, ["projectDetails", "expansionTiming"])}
            />
            <DetailItem
              label="B2. 진출 국가"
              value={extractArray(responseData, ["projectDetails", "targetCountries"])}
            />
            <DetailItem
              label="B3. 진출 이유"
              value={extractValue(responseData, ["projectDetails", "expansionReason"])}
            />
            <DetailItem
              label="B4. 서비스 유형"
              value={extractArray(responseData, ["projectDetails", "services"])}
            />
            {extractValue(responseData, ["projectDetails", "projectName"]) && (
              <>
                <DetailItem
                  label="B5. 프로젝트명"
                  value={extractValue(responseData, ["projectDetails", "projectName"])}
                />
                <DetailItem
                  label="B5. 보고 여부 인지"
                  value={extractValue(responseData, ["projectDetails", "reportingAwareness1"])}
                />
              </>
            )}
            {extractValue(responseData, ["projectDetails", "reportingAwareness2"]) && (
              <DetailItem
                label="B5. 보고 의무 인지"
                value={extractValue(responseData, ["projectDetails", "reportingAwareness2"])}
              />
            )}
            <DetailItem
              label="B6. 진출 진료과"
              value={extractArray(responseData, ["projectDetails", "departments"])}
            />
            <DetailItem
              label="B7. 증빙자료 보유"
              value={extractValue(responseData, ["projectDetails", "hasEvidence"])}
            />
          </div>
        </section>
      )}

      {/* Policy Needs Section */}
      {responseData.policyNeeds != null && (
        <section className="space-y-3">
          <h4 className="text-sm font-semibold">C. 정책 수요</h4>
          <div className="space-y-3">
            <DetailItem
              label="C1. 어려움 순위"
              value={extractArray(responseData, ["policyNeeds", "difficultiesRank"])}
            />
            {extractValue(responseData, ["policyNeeds", "difficultiesOther"]) && (
              <DetailItem
                label="C1. 기타 어려움"
                value={extractValue(responseData, ["policyNeeds", "difficultiesOther"])}
              />
            )}
            <DetailItem
              label="C2. 지원 필요 순위"
              value={extractArray(responseData, ["policyNeeds", "supportNeedsRank"])}
            />
            {extractValue(responseData, ["policyNeeds", "supportNeedsOther"]) && (
              <DetailItem
                label="C2. 기타 지원 필요"
                value={extractValue(responseData, ["policyNeeds", "supportNeedsOther"])}
              />
            )}
            <DetailItem
              label="C3. 희망 지원 사업"
              value={extractValue(responseData, ["policyNeeds", "desiredSupport"])}
            />
            <DetailItem
              label="C4. KOHES 포털 인지"
              value={extractValue(responseData, ["policyNeeds", "awareness"])}
            />
            {extractValue(responseData, ["policyNeeds", "additionalComments"]) && (
              <DetailItem
                label="C5. 추가 의견"
                value={extractValue(responseData, ["policyNeeds", "additionalComments"])}
                className="sm:col-span-2"
              />
            )}
          </div>
        </section>
      )}
    </div>
  )
}

interface DetailItemProps {
  label: string
  value: string | null
  sensitive?: boolean
  className?: string
}

function DetailItem({ label, value, sensitive, className }: DetailItemProps) {
  return (
    <div className={className}>
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm">
        {sensitive ? (
          <span className="inline-flex items-center gap-1 text-amber-700">
            <span className="text-xs">🔒</span> {value || "-"}
          </span>
        ) : (
          value || "-"
        )}
      </dd>
    </div>
  )
}

function extractValue(data: Record<string, unknown>, path: string[]): string | null {
  let current: unknown = data

  for (const segment of path) {
    if (!current || typeof current !== "object") {
      return null
    }

    current = (current as Record<string, unknown>)[segment]
  }

  if (typeof current === "string") {
    return current.trim() || null
  }

  return null
}

function extractArray(data: Record<string, unknown>, path: string[]): string | null {
  let current: unknown = data

  for (const segment of path) {
    if (!current || typeof current !== "object") {
      return null
    }

    current = (current as Record<string, unknown>)[segment]
  }

  if (Array.isArray(current)) {
    const filtered = current
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter((item) => item.length > 0)
    return filtered.length > 0 ? filtered.join(", ") : null
  }

  if (typeof current === "string") {
    const trimmed = current.trim()
    return trimmed.length > 0 ? trimmed : null
  }

  return null
}

function maskPII(piiData: Record<string, unknown> | null, field: string): string | null {
  if (!piiData || typeof piiData !== "object") {
    return null
  }

  const value = piiData[field]

  if (typeof value !== "string" || !value.trim()) {
    return null
  }

  // Mask sensitive data partially
  if (field === "email") {
    const [local, domain] = value.split("@")
    if (!local || !domain) return value
    const maskedLocal = local.slice(0, 2) + "***"
    return `${maskedLocal}@${domain}`
  }

  if (field === "tel" || field === "mobile") {
    // Mask middle digits: 010-****-5678
    const parts = value.replace(/[^0-9]/g, "")
    if (parts.length < 8) return "****"
    return `${parts.slice(0, 3)}-****-${parts.slice(-4)}`
  }

  if (field === "address") {
    // Show only first part of address
    const parts = value.split(" ")
    if (parts.length <= 2) return parts[0] + " ***"
    return `${parts[0]} ${parts[1]} ***`
  }

  // For name, mask middle character
  if (value.length === 2) {
    return value[0] + "*"
  }
  if (value.length === 3) {
    return value[0] + "*" + value[2]
  }
  if (value.length > 3) {
    return value[0] + "**" + value.slice(-1)
  }

  return value
}
